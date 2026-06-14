"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

async function getSupabase() {
  const cookieStore = await cookies();
  return await createClient(cookieStore);
}

function monthKey(value?: string | null) {
  return value ? String(value).slice(0, 7) : "-";
}

export async function getReportsData() {
  const supabase = await getSupabase();

  const [roomsResult, billsResult, paymentsResult, maintenanceResult] =
    await Promise.all([
      supabase.from("rooms").select("id, status, base_price"),
      supabase.from("bills").select("id, billing_month, total_amount, status"),
      supabase
        .from("payments")
        .select("id, amount, status, payment_method, created_at"),
      supabase.from("maintenance_requests").select("id, status, priority"),
    ]);

  if (roomsResult.error) throw new Error(roomsResult.error.message);
  if (billsResult.error) throw new Error(billsResult.error.message);
  if (paymentsResult.error) throw new Error(paymentsResult.error.message);
  if (maintenanceResult.error) throw new Error(maintenanceResult.error.message);

  const rooms = roomsResult.data || [];
  const bills = billsResult.data || [];
  const payments = paymentsResult.data || [];
  const maintenance = maintenanceResult.data || [];

  const paidBills = bills.filter((b) => b.status === "paid");
  const unpaidBills = bills.filter((b) => b.status === "unpaid");
  const overdueBills = bills.filter((b) => b.status === "overdue");

  const revenueMap = new Map<string, number>();

  paidBills.forEach((bill) => {
    const month = monthKey(bill.billing_month);
    revenueMap.set(
      month,
      (revenueMap.get(month) || 0) + Number(bill.total_amount || 0),
    );
  });

  const revenueByMonth = Array.from(revenueMap.entries())
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const totalRevenue = paidBills.reduce(
    (sum, bill) => sum + Number(bill.total_amount || 0),
    0,
  );

  const unpaidAmount = unpaidBills.reduce(
    (sum, bill) => sum + Number(bill.total_amount || 0),
    0,
  );

  const occupancyRate =
    rooms.length > 0
      ? Math.round(
          (rooms.filter((room) => room.status === "occupied").length /
            rooms.length) *
            100,
        )
      : 0;

  return {
    summary: {
      totalRevenue,
      unpaidAmount,
      paidBills: paidBills.length,
      unpaidBills: unpaidBills.length,
      overdueBills: overdueBills.length,
      occupancyRate,
      totalRooms: rooms.length,
      totalPayments: payments.length,
      pendingMaintenance: maintenance.filter((m) => m.status === "pending")
        .length,
    },

    charts: {
      revenueByMonth,

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
        { name: "បានបង់", value: paidBills.length },
        { name: "មិនទាន់បង់", value: unpaidBills.length },
        { name: "ហួសកំណត់", value: overdueBills.length },
      ],

      paymentStatus: [
        {
          name: "រង់ចាំ",
          value: payments.filter((p) => p.status === "pending").length,
        },
        {
          name: "អនុម័ត",
          value: payments.filter((p) => p.status === "approved").length,
        },
        {
          name: "បដិសេធ",
          value: payments.filter((p) => p.status === "rejected").length,
        },
      ],

      maintenanceStatus: [
        {
          name: "រង់ចាំ",
          value: maintenance.filter((m) => m.status === "pending").length,
        },
        {
          name: "កំពុងធ្វើ",
          value: maintenance.filter((m) => m.status === "in_progress").length,
        },
        {
          name: "រួចរាល់",
          value: maintenance.filter((m) => m.status === "resolved").length,
        },
      ],
    },
  };
}
