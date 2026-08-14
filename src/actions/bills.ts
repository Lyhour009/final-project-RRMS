"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/server";
import { billSchema } from "@/lib/validations/bills";
import { syncBusinessStatuses } from "@/lib/business-status";
import { createAdminClient } from "@/lib/supabase/admin";

// See bill-generator.ts for why this cast exists: no generated DB types,
// so Supabase-js can't tell `rooms:room_id` resolves to a single row.
type ContractWithRoom = {
  id: string;
  tenant_id: string;
  room_id: string;
  rooms: { id: string; base_price: number } | null;
};

export async function getBills() {
  const { supabase } = await requireAdmin();
  await syncBusinessStatuses();

  const { data, error } = await supabase
    .from("bills")
    .select(
      `
      *,
      profiles:tenant_id (
        id,
        full_name,
        phone_number,
        email
      ),
      contracts:contract_id (
        id,
        tenant_id,
        room_id,
        start_date,
        end_date,
        due_day,
        rooms:room_id (
          id,
          room_number,
          room_type,
          base_price,
          floor
        )
      )
    `,
    )
    // Safety cap: admin list view shows the 500 most recent bills. A bill
    // older than that won't appear here or in search — revisit with real
    // pagination if this becomes a problem.
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);

  return data || [];
}

export async function upsertBill(id: string | null, formData: FormData) {
  const { supabase } = await requireAdmin();

  const parsed = billSchema.safeParse({
    contract_id: formData.get("contract_id"),
    billing_month: formData.get("billing_month"),
    water_meter_start: formData.get("water_meter_start"),
    water_meter_end: formData.get("water_meter_end"),
    elec_meter_start: formData.get("elec_meter_start"),
    elec_meter_end: formData.get("elec_meter_end"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "ទិន្នន័យមិនត្រឹមត្រូវ");
  }

  const {
    contract_id,
    water_meter_start,
    water_meter_end,
    elec_meter_start,
    elec_meter_end,
    status,
  } = parsed.data;

  const billingMonthRaw = parsed.data.billing_month;
  const billing_month =
    billingMonthRaw.length === 7 ? `${billingMonthRaw}-01` : billingMonthRaw;

  const { data: contractData, error: contractError } = await supabase
    .from("contracts")
    .select(
      `
      id,
      tenant_id,
      room_id,
      rooms:room_id (
        id,
        base_price
      )
    `,
    )
    .eq("id", contract_id)
    .single();

  const contract = contractData as unknown as ContractWithRoom | null;

  if (contractError || !contract) {
    throw new Error("រកមិនឃើញកិច្ចសន្យានេះទេ");
  }

  // Prevent duplicate bill for same contract + same month
  let duplicateQuery = supabase
    .from("bills")
    .select("id")
    .eq("contract_id", contract_id)
    .eq("billing_month", billing_month);

  if (id) {
    duplicateQuery = duplicateQuery.neq("id", id);
  }

  const { data: duplicateBill, error: duplicateError } =
    await duplicateQuery.maybeSingle();

  if (duplicateError) {
    throw new Error(duplicateError.message);
  }

  if (duplicateBill) {
    throw new Error("វិក្កយបត្រសម្រាប់កិច្ចសន្យា និងខែនេះបានបង្កើតរួចហើយ");
  }

  const { data: settings, error: settingsError } = await supabase
    .from("settings")
    .select("water_rate, electric_rate, late_fee, currency")
    .limit(1)
    .single();

  if (settingsError || !settings) {
    throw new Error("រកមិនឃើញ Settings សម្រាប់គណនាតម្លៃទឹក/ភ្លើង");
  }

  const roomFee = Number(contract.rooms?.base_price || 0);

  const waterUsed = water_meter_end - water_meter_start;
  const elecUsed = elec_meter_end - elec_meter_start;

  const waterFee = waterUsed * Number(settings.water_rate || 0);
  const elecFee = elecUsed * Number(settings.electric_rate || 0);
  const appliedLateFee = status === "overdue" ? Number(settings.late_fee || 0) : 0;
  const totalAmount = roomFee + waterFee + elecFee + appliedLateFee;

  let existingPaidAt: string | null = null;
  if (id) {
    const [{ data: existingBill, error: existingBillError }, { data: approvedPayment, error: paymentError }] =
      await Promise.all([
        supabase.from("bills").select("status, paid_at").eq("id", id).single(),
        supabase.from("payments").select("id").eq("bill_id", id).eq("status", "approved").limit(1),
      ]);

    if (existingBillError) throw new Error(existingBillError.message);
    if (paymentError) throw new Error(paymentError.message);

    if (approvedPayment?.length && status !== "paid") {
      throw new Error("An approved payment exists, so this bill must remain paid");
    }
    if (!approvedPayment?.length && status === "paid") {
      throw new Error("Approve or record a payment before marking this bill paid");
    }
    existingPaidAt = existingBill?.paid_at || null;
  } else if (status === "paid") {
    throw new Error("Create the bill as unpaid, then record and approve its payment");
  }

  const billData = {
    contract_id,
    tenant_id: contract.tenant_id,
    billing_month,
    water_meter_start,
    water_meter_end,
    elec_meter_start,
    elec_meter_end,
    room_fee: roomFee,
    water_fee: waterFee,
    elec_fee: elecFee,
    late_fee: appliedLateFee,
    currency: settings.currency || "USD",
    total_amount: totalAmount,
    status,
    paid_at: status === "paid" ? existingPaidAt : null,
  };

  if (id) {
    const { data, error } = await supabase
      .from("bills")
      .update(billData)
      .eq("id", id)
      .select(
        `
        *,
        profiles:tenant_id (
          id,
          full_name,
          phone_number,
          email
        ),
        contracts:contract_id (
          id,
          tenant_id,
          room_id,
          start_date,
          end_date,
          due_day,
          rooms:room_id (
            id,
            room_number,
            room_type,
            base_price,
            floor
          )
        )
      `,
      )
      .single();

    if (error) throw new Error(error.message);

    revalidatePath("/admin/billing");
    revalidatePath("/admin/dashboard");
    revalidatePath("/tenant/bills");
    revalidatePath("/tenant/dashboard");

    return data;
  }

  const { data, error } = await supabase
    .from("bills")
    .insert([billData])
    .select(
      `
      *,
      profiles:tenant_id (
        id,
        full_name,
        phone_number,
        email
      ),
      contracts:contract_id (
        id,
        tenant_id,
        room_id,
        start_date,
        end_date,
        due_day,
        rooms:room_id (
          id,
          room_number,
          room_type,
          base_price,
          floor
        )
      )
    `,
    )
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/billing");
  revalidatePath("/admin/dashboard");
  revalidatePath("/tenant/bills");
  revalidatePath("/tenant/dashboard");

  return data;
}

export async function deleteBill(id: string) {
  const { supabase, user } = await requireAdmin();

  // Service-role client so already-archived payments still count — see the
  // same comment on deleteRoom() in actions/rooms.ts for why the RLS-scoped
  // client would otherwise miss them.
  const adminClient = createAdminClient();
  const { data: payments, error: paymentsError } = await adminClient
    .from("payments")
    .select("id")
    .eq("bill_id", id)
    .limit(1);

  if (paymentsError) throw new Error(paymentsError.message);

  if (payments && payments.length > 0) {
    throw new Error("មិនអាចលុបវិក្កយបត្រនេះបានទេ ព្រោះមានការទូទាត់ពាក់ព័ន្ធ");
  }

  const { error } = await supabase
    .from("bills")
    .update({ archived_at: new Date().toISOString(), archived_by: user.id })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/billing");
  revalidatePath("/admin/dashboard");
  revalidatePath("/tenant/bills");
  revalidatePath("/tenant/dashboard");
}
