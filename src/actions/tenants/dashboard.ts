"use server";

import { requireUser } from "@/lib/supabase/server";

// See bill-generator.ts (actions folder) for why this cast exists: no
// generated DB types, so Supabase-js can't tell `rooms:room_id` resolves
// to a single row.
type ActiveContractWithRoom = {
  id: string;
  start_date: string;
  end_date: string;
  deposit_amount: number;
  status: string;
  due_day: number;
  rooms?: {
    id: string;
    room_number: string;
    room_type: string;
    base_price: number;
    floor: number;
    status: string;
    images: string[] | null;
  };
};

export async function getTenantDashboardData() {
  const { supabase, user } = await requireUser();

  const tenantId = user.id;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, phone_number, email, role")
    .eq("id", tenantId)
    .single();

  if (profileError || !profile) {
    throw new Error("រកមិនឃើញព័ត៌មានអ្នកជួល");
  }

  const { data: activeContractData } = await supabase
    .from("contracts")
    .select(
      `
      id,
      start_date,
      end_date,
      deposit_amount,
      status,
      due_day,
      rooms:room_id (
        id,
        room_number,
        room_type,
        base_price,
        floor,
        status,
        images
      )
    `,
    )
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .maybeSingle();

  const activeContract =
    activeContractData as unknown as ActiveContractWithRoom | null;

  const { data: currentBill } = await supabase
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
    .in("status", ["unpaid", "overdue"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: recentBills } = await supabase
    .from("bills")
    .select("id, billing_month, total_amount, status, paid_at, created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentPayments } = await supabase
    .from("payments")
    .select(
      `
      id,
      amount,
      payment_method,
      status,
      paid_at,
      created_at,
      bills:bill_id (
        id,
        billing_month
      )
    `,
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: pendingPayments } = await supabase
    .from("payments")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("status", "pending");

  return {
    profile,
    activeContract,
    currentBill,
    recentBills: recentBills || [],
    recentPayments: recentPayments || [],
    stats: {
      pendingPayments: pendingPayments?.length || 0,
      totalBills: recentBills?.length || 0,
    },
  };
}
