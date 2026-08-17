import Link from "next/link";
import { ArrowUpRight, Inbox } from "lucide-react";

import { PAYMENT_METHOD_LABELS } from "@/lib/validations/payments";

interface RecentBill {
  id: string;
  billing_month: string;
  total_amount: number;
  status: string;
  profiles?: { full_name?: string } | null;
  contracts?: { rooms?: { room_number?: string } | null } | null;
}

interface RecentPayment {
  id: string;
  amount: number;
  payment_method: string;
  status: string;
  profiles?: { full_name?: string } | null;
}

interface RecentContract {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  profiles?: { full_name?: string } | null;
  rooms?: { room_number?: string } | null;
}

interface RecentMaintenanceRequest {
  id: string;
  issue_title: string;
  status: string;
  profiles?: { full_name?: string } | null;
  rooms?: { room_number?: string } | null;
}

export interface RecentData {
  bills: RecentBill[];
  payments: RecentPayment[];
  contracts: RecentContract[];
  maintenanceRequests: RecentMaintenanceRequest[];
}

// One color system for every status badge on this page: green = paid/active
// outcomes, orange = pending/in-progress, red = overdue/rejected/terminated,
// gray = neutral fallback — so the same status reads identically whether
// it's on a bill, a payment, a contract, or a maintenance request.
const STATUS_TONES = {
  green: {
    pill: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  orange: {
    pill: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  red: {
    pill: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300",
    dot: "bg-red-500",
  },
  gray: {
    pill: "border-zinc-500/20 bg-zinc-500/10 text-(--panel-text-muted)",
    dot: "bg-zinc-400",
  },
} as const;

const STATUS_LABELS: Record<string, string> = {
  paid: "បានបង់",
  unpaid: "មិនទាន់បង់",
  overdue: "ហួសកំណត់",
  pending: "រង់ចាំ",
  approved: "អនុម័ត",
  rejected: "បដិសេធ",
  active: "សកម្ម",
  expired: "ផុតកំណត់",
  terminated: "បញ្ចប់",
  resolved: "រួចរាល់",
  in_progress: "កំពុងធ្វើ",
};

function StatusBadge({ status }: { status: string }) {
  let tone: keyof typeof STATUS_TONES = "gray";

  if (["paid", "approved", "active", "resolved"].includes(status)) tone = "green";
  if (["unpaid", "pending", "in_progress"].includes(status)) tone = "orange";
  if (["overdue", "rejected", "terminated"].includes(status)) tone = "red";

  const { pill, dot } = STATUS_TONES[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${pill}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function RecentCard({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-(--panel-text)">{title}</h2>
        <Link
          href={href}
          aria-label={`មើល ${title}`}
          className="rounded-lg p-1.5 text-(--panel-text-subtle) transition hover:bg-(--panel-hover) hover:text-indigo-500"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      {children}
    </div>
  );
}

function EmptyList({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-24 flex-col items-center justify-center rounded-xl border border-dashed border-(--panel-border) bg-(--panel-inset)/45 px-5 text-center">
      <Inbox className="mb-2 h-5 w-5 text-(--panel-text-subtle)" />
      <p className="text-xs leading-5 text-(--panel-text-subtle)">{children}</p>
    </div>
  );
}

export function RecentDashboardTables({ recent }: { recent: RecentData }) {
  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
      <RecentCard title="វិក្កយបត្រថ្មីៗ" href="/admin/billing">
        <div className="space-y-2">
          {recent.bills.length === 0 ? (
            <EmptyList>មិនទាន់មានវិក្កយបត្រថ្មីៗ</EmptyList>
          ) : (
            recent.bills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between rounded-lg border border-(--panel-border) bg-(--panel-inset) p-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-(--panel-text)">
                    {bill.profiles?.full_name || "-"} — បន្ទប់ #
                    {bill.contracts?.rooms?.room_number || "-"}
                  </p>
                  <p className="text-xs text-(--panel-text-subtle)">
                    ខែ {String(bill.billing_month).slice(0, 7)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    ${Number(bill.total_amount || 0).toFixed(2)}
                  </p>
                  <StatusBadge status={bill.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </RecentCard>

      <RecentCard title="ការទូទាត់ថ្មីៗ" href="/admin/payments">
        <div className="space-y-2">
          {recent.payments.length === 0 ? (
            <EmptyList>មិនទាន់មានការទូទាត់ថ្មីៗ</EmptyList>
          ) : (
            recent.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg border border-(--panel-border) bg-(--panel-inset) p-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-(--panel-text)">
                    {payment.profiles?.full_name || "-"}
                  </p>
                  <p className="text-xs text-(--panel-text-subtle)">
                    {PAYMENT_METHOD_LABELS[payment.payment_method as keyof typeof PAYMENT_METHOD_LABELS] || payment.payment_method}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    ${Number(payment.amount || 0).toFixed(2)}
                  </p>
                  <StatusBadge status={payment.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </RecentCard>

      <RecentCard title="កិច្ចសន្យាថ្មីៗ" href="/admin/contracts">
        <div className="space-y-2">
          {recent.contracts.length === 0 ? (
            <EmptyList>មិនទាន់មានកិច្ចសន្យាថ្មីៗ</EmptyList>
          ) : (
            recent.contracts.map((contract) => (
              <div
                key={contract.id}
                className="flex items-center justify-between rounded-lg border border-(--panel-border) bg-(--panel-inset) p-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-(--panel-text)">
                    {contract.profiles?.full_name || "-"} — បន្ទប់ #
                    {contract.rooms?.room_number || "-"}
                  </p>
                  <p className="text-xs text-(--panel-text-subtle)">
                    {contract.start_date} → {contract.end_date}
                  </p>
                </div>

                <StatusBadge status={contract.status} />
              </div>
            ))
          )}
        </div>
      </RecentCard>

      <RecentCard title="សំណើជួសជុលថ្មីៗ" href="/admin/maintenance">
        <div className="space-y-2">
          {recent.maintenanceRequests.length === 0 ? (
            <EmptyList>មិនទាន់មានសំណើជួសជុលថ្មីៗ</EmptyList>
          ) : (
            recent.maintenanceRequests.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-(--panel-border) bg-(--panel-inset) p-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-(--panel-text)">
                    {item.issue_title}
                  </p>
                  <p className="text-xs text-(--panel-text-subtle)">
                    បន្ទប់ #{item.rooms?.room_number || "-"} —{" "}
                    {item.profiles?.full_name || "-"}
                  </p>
                </div>

                <StatusBadge status={item.status} />
              </div>
            ))
          )}
        </div>
      </RecentCard>
    </div>
  );
}
