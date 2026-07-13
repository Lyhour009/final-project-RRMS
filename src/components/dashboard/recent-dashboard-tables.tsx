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

function StatusBadge({
  status,
}: {
  status: string;
  type?: "bill" | "payment" | "contract" | "maintenance" | "default";
}) {
  let className = "bg-zinc-500/10 text-(--panel-text-muted) border-zinc-500/20";

  if (["paid", "approved", "active", "resolved"].includes(status)) {
    className = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }

  if (["unpaid", "pending"].includes(status)) {
    className = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  if (["overdue", "rejected", "terminated"].includes(status)) {
    className = "bg-red-500/10 text-red-400 border-red-500/20";
  }

  if (status === "in_progress") {
    className = "bg-blue-500/10 text-blue-400 border-blue-500/20";
  }

  const labelMap: Record<string, string> = {
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

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {labelMap[status] || status}
    </span>
  );
}

function RecentCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
      <h2 className="text-base font-semibold text-(--panel-text) mb-4">{title}</h2>
      {children}
    </div>
  );
}

export function RecentDashboardTables({ recent }: { recent: RecentData }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <RecentCard title="វិក្កយបត្រថ្មីៗ">
        <div className="space-y-3">
          {recent.bills.length === 0 ? (
            <p className="text-sm text-(--panel-text-subtle)">មិនទាន់មានវិក្កយបត្រ</p>
          ) : (
            recent.bills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between rounded-xl border border-(--panel-border) bg-(--panel-inset) p-3"
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
                  <p className="text-sm font-semibold text-emerald-400">
                    ${Number(bill.total_amount || 0).toFixed(2)}
                  </p>
                  <StatusBadge status={bill.status} type="bill" />
                </div>
              </div>
            ))
          )}
        </div>
      </RecentCard>

      <RecentCard title="ការទូទាត់ថ្មីៗ">
        <div className="space-y-3">
          {recent.payments.length === 0 ? (
            <p className="text-sm text-(--panel-text-subtle)">មិនទាន់មានការទូទាត់</p>
          ) : (
            recent.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-xl border border-(--panel-border) bg-(--panel-inset) p-3"
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
                  <p className="text-sm font-semibold text-emerald-400">
                    ${Number(payment.amount || 0).toFixed(2)}
                  </p>
                  <StatusBadge status={payment.status} type="payment" />
                </div>
              </div>
            ))
          )}
        </div>
      </RecentCard>

      <RecentCard title="កិច្ចសន្យាថ្មីៗ">
        <div className="space-y-3">
          {recent.contracts.length === 0 ? (
            <p className="text-sm text-(--panel-text-subtle)">មិនទាន់មានកិច្ចសន្យា</p>
          ) : (
            recent.contracts.map((contract) => (
              <div
                key={contract.id}
                className="flex items-center justify-between rounded-xl border border-(--panel-border) bg-(--panel-inset) p-3"
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

                <StatusBadge status={contract.status} type="contract" />
              </div>
            ))
          )}
        </div>
      </RecentCard>

      <RecentCard title="សំណើជួសជុលថ្មីៗ">
        <div className="space-y-3">
          {recent.maintenanceRequests.length === 0 ? (
            <p className="text-sm text-(--panel-text-subtle)">មិនទាន់មានសំណើជួសជុល</p>
          ) : (
            recent.maintenanceRequests.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-(--panel-border) bg-(--panel-inset) p-3"
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

                <StatusBadge status={item.status} type="maintenance" />
              </div>
            ))
          )}
        </div>
      </RecentCard>
    </div>
  );
}
