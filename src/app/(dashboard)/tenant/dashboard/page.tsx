import { CreditCard, DollarSign, FileText, Home } from "lucide-react";
import { getTenantDashboardData } from "@/actions/tenants/dashboard";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatBillingMonth } from "@/lib/utils";
import { PAYMENT_METHOD_LABELS } from "@/lib/validations/payments";

function StatusBadge({ status }: { status: string }) {
  let tone: "green" | "amber" | "red" | "gray" = "gray";
  if (["paid", "approved", "active"].includes(status)) tone = "green";
  if (["unpaid", "pending"].includes(status)) tone = "amber";
  if (["overdue", "rejected"].includes(status)) tone = "red";

  const labels: Record<string, string> = {
    active: "សកម្ម",
    unpaid: "មិនទាន់បង់",
    paid: "បានបង់",
    overdue: "ហួសកំណត់",
    pending: "រង់ចាំ",
    approved: "អនុម័ត",
    rejected: "បដិសេធ",
  };

  return <Badge tone={tone}>{labels[status] || status}</Badge>;
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-(--panel-text-subtle)">{label}</span>
      <span
        className={`text-sm font-medium ${
          highlight ? "text-emerald-600 dark:text-emerald-400" : "text-(--panel-text)"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default async function TenantOverviewPage() {
  const data = await getTenantDashboardData();

  const contract = data.activeContract;
  const room = contract?.rooms;
  const currentBill = data.currentBill;

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-5 p-4 text-(--panel-text) sm:p-5 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          សួស្តី, {data.profile.full_name}
        </h1>
        <p className="mt-1 text-sm leading-6 text-(--panel-text-muted)">
          ផ្ទាំងសង្ខេបព័ត៌មានបន្ទប់ កិច្ចសន្យា និងការទូទាត់របស់អ្នក
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          title="បន្ទប់របស់ខ្ញុំ"
          value={room ? `#${room.room_number}` : "-"}
          subtitle={
            room ? `${room.room_type} / ជាន់ ${room.floor}` : "មិនទាន់មានបន្ទប់"
          }
          icon={<Home size={16} />}
          tone="blue"
        />

        <StatCard
          title="ថ្លៃបន្ទប់"
          value={room ? `$${Number(room.base_price || 0).toFixed(2)}` : "$0.00"}
          subtitle="តម្លៃបន្ទប់ប្រចាំខែ"
          icon={<DollarSign size={16} />}
          tone="emerald"
        />

        <StatCard
          title="វិក្កយបត្របច្ចុប្បន្ន"
          value={
            currentBill
              ? `$${Number(currentBill.total_amount || 0).toFixed(2)}`
              : "$0.00"
          }
          subtitle={
            currentBill
              ? formatBillingMonth(currentBill.billing_month)
              : "មិនមានវិក្កយបត្រ"
          }
          icon={<CreditCard size={16} />}
          tone="amber"
        />

        <StatCard
          title="ការទូទាត់រង់ចាំ"
          value={data.stats.pendingPayments}
          subtitle="រង់ចាំ Admin ផ្ទៀងផ្ទាត់"
          icon={<FileText size={16} />}
          tone="indigo"
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm xl:col-span-2 sm:p-5">
          <h2 className="text-base font-semibold mb-4">
            ព័ត៌មានបន្ទប់ និងកិច្ចសន្យា
          </h2>

          {!contract ? (
            <p className="text-sm text-(--panel-text-subtle)">
              អ្នកមិនទាន់មានកិច្ចសន្យាសកម្មទេ។
            </p>
          ) : (
            <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-(--panel-border) bg-(--panel-inset) p-4">
                {room?.images?.[0] ? (
                  <img
                    src={room.images[0]}
                    alt="Room"
                    className="mb-4 h-56 w-full rounded-lg object-cover transition-transform duration-300 hover:scale-[1.02]"
                  />
                ) : (
                  <div className="h-56 w-full rounded-lg bg-(--panel-hover) border border-(--panel-border) flex items-center justify-center text-sm text-(--panel-text-subtle) mb-4">
                    មិនទាន់មានរូបភាពបន្ទប់
                  </div>
                )}

                <p className="text-lg font-bold text-(--panel-text)">
                  បន្ទប់ #{room?.room_number}
                </p>
                <p className="text-sm text-(--panel-text-subtle) mt-1">{room?.room_type}</p>
              </div>

              <div className="space-y-4 rounded-xl border border-(--panel-border) bg-(--panel-inset) p-4">
                <InfoRow
                  label="ស្ថានភាព"
                  value={<StatusBadge status={contract.status} />}
                />
                <InfoRow label="ថ្ងៃចាប់ផ្តើម" value={contract.start_date} />
                <InfoRow label="ថ្ងៃបញ្ចប់" value={contract.end_date} />
                <InfoRow
                  label="ប្រាក់កក់"
                  value={`$${Number(contract.deposit_amount || 0).toFixed(2)}`}
                  highlight
                />
                <InfoRow
                  label="ថ្ងៃបង់ប្រាក់"
                  value={`ថ្ងៃទី ${contract.due_day}`}
                />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-semibold mb-4">
            វិក្កយបត្របច្ចុប្បន្ន
          </h2>

          {!currentBill ? (
            <p className="text-sm text-(--panel-text-subtle)">
              មិនមានវិក្កយបត្រមិនទាន់បង់ទេ។
            </p>
          ) : (
            <div className="space-y-3">
              <InfoRow
                label="ខែ"
                value={formatBillingMonth(currentBill.billing_month)}
              />
              <InfoRow
                label="ថ្លៃបន្ទប់"
                value={`$${Number(currentBill.room_fee || 0).toFixed(2)}`}
              />
              <InfoRow
                label="ថ្លៃទឹក"
                value={`$${Number(currentBill.water_fee || 0).toFixed(2)}`}
              />
              <InfoRow
                label="ថ្លៃភ្លើង"
                value={`$${Number(currentBill.elec_fee || 0).toFixed(2)}`}
              />

              <div className="border-t border-(--panel-border) pt-3 flex justify-between">
                <span className="text-sm font-medium">សរុប</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  ${Number(currentBill.total_amount || 0).toFixed(2)}
                </span>
              </div>

              <InfoRow
                label="ស្ថានភាព"
                value={<StatusBadge status={currentBill.status} />}
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-semibold mb-4">វិក្កយបត្រថ្មីៗ</h2>

          <div className="space-y-3">
            {data.recentBills.length === 0 ? (
              <p className="text-sm text-(--panel-text-subtle)">មិនទាន់មានវិក្កយបត្រ</p>
            ) : (
              data.recentBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between rounded-xl border border-(--panel-border) bg-(--panel-inset) p-3.5"
                >
                  <div>
                    <p className="text-sm font-medium text-(--panel-text)">
                      ខែ {formatBillingMonth(bill.billing_month)}
                    </p>
                    <p className="text-xs text-(--panel-text-subtle)">
                      ${Number(bill.total_amount || 0).toFixed(2)}
                    </p>
                  </div>

                  <StatusBadge status={bill.status} />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-semibold mb-4">ការទូទាត់ថ្មីៗ</h2>

          <div className="space-y-3">
            {data.recentPayments.length === 0 ? (
              <p className="text-sm text-(--panel-text-subtle)">មិនទាន់មានការទូទាត់</p>
            ) : (
              data.recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-xl border border-(--panel-border) bg-(--panel-inset) p-3.5"
                >
                  <div>
                    <p className="text-sm font-medium text-(--panel-text)">
                      ${Number(payment.amount || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-(--panel-text-subtle)">
                      {PAYMENT_METHOD_LABELS[payment.payment_method as keyof typeof PAYMENT_METHOD_LABELS] || payment.payment_method}
                    </p>
                  </div>

                  <StatusBadge status={payment.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
