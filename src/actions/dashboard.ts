"use server";

import { requireAdmin } from "@/lib/supabase/server";
import { syncBusinessStatuses } from "@/lib/business-status";

function monthKey(value: string) {
  return value ? value.slice(0, 7) : "-";
}

export async function getDashboardStats() {
  const { supabase } = await requireAdmin();
  await syncBusinessStatuses();

  // Two queries per entity: a lean "aggregate" fetch with only the scalar
  // columns actually reduced into cards/charts below (no joins — those are
  // pure JS filter/length/reduce over every row, so payload should scale
  // with columns-read, not with the full row shape), and a "recent" fetch
  // that's already limited to 5 and needs the joined display columns.
  const [
    roomsResult,
    tenantsCountResult,
    contractsResult,
    recentContractsResult,
    billsResult,
    recentBillsResult,
    paymentsResult,
    recentPaymentsResult,
    maintenanceResult,
    recentMaintenanceResult,
  ] = await Promise.all([
    supabase.from("rooms").select("status"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "tenant"),
    supabase.from("contracts").select("status, end_date"),
    supabase
      .from("contracts")
      .select(
        `
      id, tenant_id, room_id, start_date, end_date, deposit_amount, status, due_day, created_at,
      profiles:tenant_id (id, full_name, phone_number),
      rooms:room_id (id, room_number, room_type, base_price)
    `,
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("bills").select("status, total_amount, billing_month"),
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
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("payments").select("status"),
    supabase
      .from("payments")
      .select(
        `
      id, bill_id, tenant_id, amount, payment_method, status, paid_at, created_at,
      profiles:tenant_id (id, full_name, phone_number),
      bills:bill_id (id, billing_month)
    `,
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("maintenance_requests").select("status"),
    supabase
      .from("maintenance_requests")
      .select(
        `
      id, tenant_id, room_id, issue_title, issue_description, status, priority, created_at, resolved_at,
      profiles:tenant_id (id, full_name, phone_number),
      rooms:room_id (id, room_number)
    `,
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (roomsResult.error) throw new Error(roomsResult.error.message);
  if (tenantsCountResult.error) throw new Error(tenantsCountResult.error.message);
  if (contractsResult.error) throw new Error(contractsResult.error.message);
  if (recentContractsResult.error) throw new Error(recentContractsResult.error.message);
  if (billsResult.error) throw new Error(billsResult.error.message);
  if (recentBillsResult.error) throw new Error(recentBillsResult.error.message);
  if (paymentsResult.error) throw new Error(paymentsResult.error.message);
  if (recentPaymentsResult.error) throw new Error(recentPaymentsResult.error.message);
  if (maintenanceResult.error) throw new Error(maintenanceResult.error.message);
  if (recentMaintenanceResult.error) throw new Error(recentMaintenanceResult.error.message);

  const rooms = roomsResult.data || [];
  const totalTenants = tenantsCountResult.count || 0;
  const contracts = contractsResult.data || [];
  const recentContracts = recentContractsResult.data || [];
  const bills = billsResult.data || [];
  const recentBills = recentBillsResult.data || [];
  const payments = paymentsResult.data || [];
  const recentPayments = recentPaymentsResult.data || [];
  const maintenanceRequests = maintenanceResult.data || [];
  const recentMaintenanceRequests = recentMaintenanceResult.data || [];

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
      totalTenants,
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
      bills: recentBills,
      payments: recentPayments,
      contracts: recentContracts,
      maintenanceRequests: recentMaintenanceRequests,
    },
  };
}
