"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

// Supabase-js can't infer that `rooms:room_id` resolves to a single row
// (it's a to-one FK, but without generated DB types the client only knows
// "some table join"), so we describe the shape once here instead of
// scattering `as any` at each access site.
type ContractWithRoom = {
  id: string;
  tenant_id: string;
  room_id: string;
  status: string;
  rooms: { id: string; base_price: number } | null;
};

export async function generateMonthlyBills(formData: FormData) {
  const { supabase } = await requireAdmin();

  const rawMonth = String(formData.get("billing_month") || "");

  if (!rawMonth) {
    throw new Error("សូមជ្រើសរើសខែសម្រាប់បង្កើតវិក្កយបត្រ");
  }

  const billingMonth = `${rawMonth}-01`;

  const { data: contractsData, error: contractsError } = await supabase
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

  const contracts = (contractsData ?? []) as unknown as ContractWithRoom[];

  // One query for every bill that already exists this month, instead of
  // one round-trip per contract — this used to be N+1 sequential queries.
  const { data: existingBills, error: existingError } = await supabase
    .from("bills")
    .select("contract_id")
    .eq("billing_month", billingMonth);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingContractIds = new Set(
    (existingBills ?? []).map((bill) => bill.contract_id),
  );

  const contractsNeedingBills = contracts.filter(
    (contract) => !existingContractIds.has(contract.id),
  );
  const skipped = contracts.length - contractsNeedingBills.length;

  if (contractsNeedingBills.length === 0) {
    return { created: 0, skipped };
  }

  const newBills = contractsNeedingBills.map((contract) => {
    const roomFee = Number(contract.rooms?.base_price || 0);
    return {
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
    };
  });

  const { error: billError } = await supabase.from("bills").insert(newBills);

  if (billError) {
    throw new Error(billError.message);
  }

  await Promise.all(
    contractsNeedingBills.map((contract) =>
      createNotification({
        userId: contract.tenant_id,
        type: "bill_created",
        message: `មានវិក្កយបត្រថ្មីសម្រាប់ខែ ${rawMonth}`,
        link: "/tenant/bills",
      }),
    ),
  );

  revalidatePath("/admin/billing");
  revalidatePath("/admin/dashboard");
  revalidatePath("/tenant/bills");
  revalidatePath("/tenant/dashboard");

  return {
    created: newBills.length,
    skipped,
  };
}
