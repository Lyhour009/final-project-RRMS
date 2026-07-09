"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/server";

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
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data || [];
}

export async function upsertBill(id: string | null, formData: FormData) {
  const { supabase } = await requireAdmin();

  const contract_id = String(formData.get("contract_id") || "");
  const billingMonthRaw = String(formData.get("billing_month") || "");

  const billing_month =
    billingMonthRaw.length === 7 ? `${billingMonthRaw}-01` : billingMonthRaw;

  const water_meter_start = Number(formData.get("water_meter_start") || 0);
  const water_meter_end = Number(formData.get("water_meter_end") || 0);
  const elec_meter_start = Number(formData.get("elec_meter_start") || 0);
  const elec_meter_end = Number(formData.get("elec_meter_end") || 0);
  const status = String(formData.get("status") || "unpaid");

  if (!contract_id || !billing_month) {
    throw new Error("សូមជ្រើសរើសកិច្ចសន្យា និងខែវិក្កយបត្រ");
  }

  if (water_meter_end < water_meter_start) {
    throw new Error("កុងទ័រទឹកចុងត្រូវធំជាង ឬស្មើកុងទ័រទឹកដើម");
  }

  if (elec_meter_end < elec_meter_start) {
    throw new Error("កុងទ័រភ្លើងចុងត្រូវធំជាង ឬស្មើកុងទ័រភ្លើងដើម");
  }

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
    .select("water_rate, electric_rate")
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
  const totalAmount = roomFee + waterFee + elecFee;

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
    total_amount: totalAmount,
    status,
    paid_at: status === "paid" ? new Date().toISOString() : null,
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
  revalidatePath("/tenant/bills");
  revalidatePath("/tenant/dashboard");

  return data;
}

export async function deleteBill(id: string) {
  const { supabase } = await requireAdmin();

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("id")
    .eq("bill_id", id)
    .limit(1);

  if (paymentsError) throw new Error(paymentsError.message);

  if (payments && payments.length > 0) {
    throw new Error("មិនអាចលុបវិក្កយបត្រនេះបានទេ ព្រោះមានការទូទាត់ពាក់ព័ន្ធ");
  }

  const { error } = await supabase.from("bills").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/billing");
  revalidatePath("/tenant/bills");
  revalidatePath("/tenant/dashboard");
}
