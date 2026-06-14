"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

async function getSupabase() {
  const cookieStore = await cookies();
  return await createClient(cookieStore);
}

function monthKey(value: string) {
  return value ? value.slice(0, 7) : "-";
}

export async function getDashboardStats() {
  const supabase = await getSupabase();

  const [
    roomsResult,
    tenantsResult,
    contractsResult,
    billsResult,
    paymentsResult,
    maintenanceResult,
  ] = await Promise.all([
    supabase
      .from("rooms")
      .select("id, room_number, room_type, base_price, status, floor"),
    supabase
      .from("profiles")
      .select("id, full_name, phone_number, email, role")
      .eq("role", "tenant"),
    supabase
      .from("contracts")
      .select(
        `
      id, tenant_id, room_id, start_date, end_date, deposit_amount, status, due_day, created_at,
      profiles:tenant_id (id, full_name, phone_number),
      rooms:room_id (id, room_number, room_type, base_price)
    `,
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("bills")
      .select(
        `
      id, tenant_id, contract_id, billing_month, room_fee, water_fee, elec_fee,
      total_amount, status, paid_at, created_at,
      profiles:tenant_id (id, full_name, phone_number),
      contracts:contract_id (id, rooms:room_id (id, room_number))
    `,
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("payments")
      .select(
        `
      id, bill_id, tenant_id, amount, payment_method, status, paid_at, created_at,
      profiles:tenant_id (id, full_name, phone_number),
      bills:bill_id (id, billing_month)
    `,
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("maintenance_requests")
      .select(
        `
      id, tenant_id, room_id, issue_title, issue_description, status, priority, created_at, resolved_at,
      profiles:tenant_id (id, full_name, phone_number),
      rooms:room_id (id, room_number)
    `,
      )
      .order("created_at", { ascending: false }),
  ]);

  if (roomsResult.error) throw new Error(roomsResult.error.message);
  if (tenantsResult.error) throw new Error(tenantsResult.error.message);
  if (contractsResult.error) throw new Error(contractsResult.error.message);
  if (billsResult.error) throw new Error(billsResult.error.message);
  if (paymentsResult.error) throw new Error(paymentsResult.error.message);
  if (maintenanceResult.error) throw new Error(maintenanceResult.error.message);

  const rooms = roomsResult.data || [];
  const tenants = tenantsResult.data || [];
  const contracts = contractsResult.data || [];
  const bills = billsResult.data || [];
  const payments = paymentsResult.data || [];
  const maintenanceRequests = maintenanceResult.data || [];

  const paidBills = bills.filter((b) => b.status === "paid");
  const unpaidBills = bills.filter((b) => b.status === "unpaid");
  const overdueBills = bills.filter((b) => b.status === "overdue");

  const pendingPayments = payments.filter((p) => p.status === "pending");
  const approvedPayments = payments.filter((p) => p.status === "approved");
  const rejectedPayments = payments.filter((p) => p.status === "rejected");

  const revenueMap = new Map<string, number>();

  paidBills.forEach((bill) => {
    const key = monthKey(String(bill.billing_month || ""));
    revenueMap.set(
      key,
      (revenueMap.get(key) || 0) + Number(bill.total_amount || 0),
    );
  });

  const revenueByMonth = Array.from(revenueMap.entries())
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const totalRevenue = paidBills.reduce(
    (s, b) => s + Number(b.total_amount || 0),
    0,
  );
  const unpaidAmount = unpaidBills.reduce(
    (s, b) => s + Number(b.total_amount || 0),
    0,
  );
  const monthlyRevenue = revenueByMonth.at(-1)?.revenue || 0;

  return {
    cards: {
      totalRooms: rooms.length,
      availableRooms: rooms.filter((r) => r.status === "available").length,
      occupiedRooms: rooms.filter((r) => r.status === "occupied").length,
      maintenanceRooms: rooms.filter((r) => r.status === "maintenance").length,
      totalTenants: tenants.length,
      activeContracts: contracts.filter((c) => c.status === "active").length,
      totalRevenue,
      monthlyRevenue,
      unpaidBills: unpaidBills.length,
      unpaidAmount,
      pendingPayments: pendingPayments.length,
      maintenancePending: maintenanceRequests.filter(
        (m) => m.status === "pending",
      ).length,
      contractsEndingSoon: contracts.filter((c) => {
        if (!c.end_date || c.status !== "active") return false;
        const today = new Date();
        const end = new Date(c.end_date);
        const diff = (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 30;
      }).length,
    },
    charts: {
      roomStatus: [
        {
          name: "ទំនេរ",
          value: rooms.filter((r) => r.status === "available").length,
        },
        {
          name: "មិនទំនេរ",
          value: rooms.filter((r) => r.status === "occupied").length,
        },
        {
          name: "ជួសជុល",
          value: rooms.filter((r) => r.status === "maintenance").length,
        },
      ],
      billStatus: [
        { name: "បង់", value: paidBills.length },
        { name: "មិនបង់", value: unpaidBills.length },
        { name: "ហួស", value: overdueBills.length },
      ],
      paymentStatus: [
        { name: "រង់ចាំ", value: pendingPayments.length },
        { name: "អនុម័ត", value: approvedPayments.length },
        { name: "បដិសេធ", value: rejectedPayments.length },
      ],
      revenueByMonth,
    },
    recent: {
      bills: bills.slice(0, 5),
      payments: payments.slice(0, 5),
      contracts: contracts.slice(0, 5),
      maintenanceRequests: maintenanceRequests.slice(0, 5),
    },
  };
}
