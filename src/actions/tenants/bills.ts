"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

async function getSupabase() {
  const cookieStore = await cookies();
  return await createClient(cookieStore);
}

export async function getTenantBillsData() {
  const supabase = await getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("សូមចូលប្រើប្រាស់ជាមុនសិន");

  const tenantId = user.id;

  const { data: bills, error: billsError } = await supabase
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
    .order("created_at", { ascending: false });

  if (billsError) throw new Error(billsError.message);

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("id, bill_id, amount, payment_method, status, paid_at, created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (paymentsError) throw new Error(paymentsError.message);

  const { data: settings, error: settingsError } = await supabase
    .from("settings")
    .select("payment_qr_url, payment_instruction")
    .limit(1)
    .maybeSingle();

  if (settingsError) throw new Error(settingsError.message);

  return {
    bills: bills || [],
    payments: payments || [],
    settings,
  };
}
