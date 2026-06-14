"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/actions/notifications";

async function getSupabase() {
  const cookieStore = await cookies();
  return await createClient(cookieStore);
}

export async function generateMonthlyBills(formData: FormData) {
  const supabase = await getSupabase();

  const rawMonth = String(formData.get("billing_month") || "");

  if (!rawMonth) {
    throw new Error("សូមជ្រើសរើសខែសម្រាប់បង្កើតវិក្កយបត្រ");
  }

  const billingMonth = `${rawMonth}-01`;

  const { data: contracts, error: contractsError } = await supabase
    .from("contracts")
    .select(
      `
      id,
      tenant_id,
      room_id,
      status,
      rooms:room_id (
        id,
        base_price
      )
    `,
    )
    .eq("status", "active");

  if (contractsError) {
    throw new Error(contractsError.message);
  }

  let created = 0;
  let skipped = 0;

  for (const contract of contracts || []) {
    const { data: existingBill, error: existingError } = await supabase
      .from("bills")
      .select("id")
      .eq("contract_id", contract.id)
      .eq("billing_month", billingMonth)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existingBill) {
      skipped++;
      continue;
    }

    const roomFee = Number((contract.rooms as any)?.base_price || 0);

    const { error: billError } = await supabase.from("bills").insert({
      contract_id: contract.id,
      tenant_id: contract.tenant_id,
      billing_month: billingMonth,
      water_meter_start: 0,
      water_meter_end: 0,
      elec_meter_start: 0,
      elec_meter_end: 0,
      room_fee: roomFee,
      water_fee: 0,
      elec_fee: 0,
      total_amount: roomFee,
      status: "unpaid",
    });

    if (billError) {
      throw new Error(billError.message);
    }

    await createNotification({
      userId: contract.tenant_id,
      type: "bill_created",
      message: `មានវិក្កយបត្រថ្មីសម្រាប់ខែ ${rawMonth}`,
      link: "/tenant/bills",
    });

    created++;
  }

  revalidatePath("/admin/billing");
  revalidatePath("/admin/dashboard");
  revalidatePath("/tenant/bills");
  revalidatePath("/tenant/overview");

  return {
    created,
    skipped,
  };
}
