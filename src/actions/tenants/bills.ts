"use server";

import { requireTenant } from "@/lib/supabase/server";
import { syncBusinessStatuses } from "@/lib/business-status";

export async function getTenantBillsData() {
  const { supabase, user } = await requireTenant();
  await syncBusinessStatuses();

  const tenantId = user.id;

  // Three independent reads for this page — fetch concurrently instead of
  // three sequential round trips.
  const [
    { data: bills, error: billsError },
    { data: payments, error: paymentsError },
    { data: settings, error: settingsError },
  ] = await Promise.all([
    supabase
      .from("bills")
      .select(
        `
      id,
      billing_month,
      room_fee,
      water_fee,
      elec_fee,
      total_amount,
      status,
      paid_at,
      created_at
    `,
      )
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false }),
    supabase
      .from("payments")
      .select("id, bill_id, amount, payment_method, status, paid_at, created_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false }),
    supabase
      .from("settings")
      .select("payment_qr_url, payment_instruction")
      .limit(1)
      .maybeSingle(),
  ]);

  if (billsError) throw new Error(billsError.message);
  if (paymentsError) throw new Error(paymentsError.message);
  if (settingsError) throw new Error(settingsError.message);

  return {
    bills: bills || [],
    payments: payments || [],
    settings,
  };
}
