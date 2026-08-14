import { createAdminClient } from "@/lib/supabase/admin";

type BillWithContract = {
  id: string;
  billing_month: string;
  total_amount: number;
  late_fee: number;
  contracts: { due_day: number | null } | null;
};

function bangkokDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function billDueDate(billingMonth: string, dueDay: number) {
  const [year, month] = billingMonth.slice(0, 7).split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const safeDay = Math.min(Math.max(dueDay, 1), lastDay);
  return `${year}-${String(month).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
}

// Every check in this module compares against a *date* (Asia/Bangkok), not a
// timestamp, so re-running it again the same calendar day can never find
// anything new — the daily cron and any other call earlier today already
// applied everything today's date could trigger. Without this, every single
// page navigation on a warm instance was paying for 2+ sequential Supabase
// round trips (expired-contracts check, then settings+bills) before the
// page's own data query even started, which is what made navigation feel
// laggy. Throttling to once per day per warm instance removes that tax while
// staying provably correct — same-day reruns are guaranteed no-ops.
let lastSyncedDate: string | null = null;
let syncInFlight: Promise<void> | null = null;

/**
 * Keeps date-derived states correct whenever an authenticated dashboard is
 * opened. A scheduled job can call the same rules later, but navigation no
 * longer depends on an administrator manually changing expired/overdue rows.
 */
export async function syncBusinessStatuses() {
  const today = bangkokDate();

  if (lastSyncedDate === today) return;
  if (syncInFlight) return syncInFlight;

  syncInFlight = runSync(today)
    .then(() => {
      lastSyncedDate = today;
    })
    .finally(() => {
      syncInFlight = null;
    });

  return syncInFlight;
}

async function runSync(today: string) {
  const supabase = createAdminClient();

  const { data: expiredContracts, error: contractReadError } = await supabase
    .from("contracts")
    .select("id, room_id")
    .eq("status", "active")
    .is("archived_at", null)
    .lt("end_date", today);

  if (contractReadError) throw new Error(contractReadError.message);

  if (expiredContracts?.length) {
    const contractIds = expiredContracts.map((contract) => contract.id);
    const roomIds = [...new Set(expiredContracts.map((contract) => contract.room_id))];

    const { error: expireError } = await supabase
      .from("contracts")
      .update({ status: "expired" })
      .in("id", contractIds);

    if (expireError) throw new Error(expireError.message);

    for (const roomId of roomIds) {
      const { data: anotherActive, error: activeError } = await supabase
        .from("contracts")
        .select("id")
        .eq("room_id", roomId)
        .eq("status", "active")
        .is("archived_at", null)
        .limit(1);

      if (activeError) throw new Error(activeError.message);

      if (!anotherActive?.length) {
        const { error: roomError } = await supabase
          .from("rooms")
          .update({ status: "available" })
          .eq("id", roomId)
          .eq("status", "occupied");

        if (roomError) throw new Error(roomError.message);
      }
    }
  }

  const [{ data: settings, error: settingsError }, { data: billRows, error: billsError }] =
    await Promise.all([
      supabase.from("settings").select("monthly_due_day, late_fee").limit(1).maybeSingle(),
      supabase
        .from("bills")
        .select("id, billing_month, total_amount, late_fee, contracts:contract_id(due_day)")
        .eq("status", "unpaid")
        .is("archived_at", null),
    ]);

  if (settingsError) throw new Error(settingsError.message);
  if (billsError) throw new Error(billsError.message);

  const defaultDueDay = Number(settings?.monthly_due_day || 5);
  const overdueBills = ((billRows || []) as unknown as BillWithContract[])
    .filter((bill) => {
      const dueDay = Number(bill.contracts?.due_day || defaultDueDay);
      return billDueDate(bill.billing_month, dueDay) < today;
    });

  const configuredLateFee = Number(settings?.late_fee || 0);
  for (const bill of overdueBills) {
    const currentLateFee = Number(bill.late_fee || 0);
    const lateFeeToApply = currentLateFee > 0 ? currentLateFee : configuredLateFee;
    const totalAmount = Number(bill.total_amount || 0) + (currentLateFee > 0 ? 0 : configuredLateFee);
    const { error: overdueError } = await supabase
      .from("bills")
      .update({ status: "overdue", late_fee: lateFeeToApply, total_amount: totalAmount })
      .eq("id", bill.id)
      .eq("status", "unpaid");

    if (overdueError) throw new Error(overdueError.message);
  }
}
