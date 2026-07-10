import { CreditCard, DollarSign, FileText, Home } from "lucide-react";
import { getTenantDashboardData } from "@/actions/tenants/dashboard";
import { PAYMENT_METHOD_LABELS } from "@/lib/validations/payments";

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "text-indigo-400",
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-(--panel-text-muted)">{title}</p>
        <div className={color}>{icon}</div>
      </div>

      <p className="mt-3 text-2xl font-bold text-(--panel-text)">{value}</p>
      <p className="mt-1 text-xs text-(--panel-text-subtle)">{subtitle}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let className = "bg-zinc-500/10 text-(--panel-text-muted) border-zinc-500/20";

  if (["paid", "approved", "active"].includes(status)) {
    className = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }

  if (["unpaid", "pending"].includes(status)) {
    className = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  if (["overdue", "rejected"].includes(status)) {
    className = "bg-red-500/10 text-red-400 border-red-500/20";
  }

  const labels: Record<string, string> = {
    active: "សកម្ម",
    unpaid: "មិនទាន់បង់",
    paid: "បានបង់",
    overdue: "ហួសកំណត់",
    pending: "រង់ចាំ",
    approved: "អនុម័ត",
    rejected: "បដិសេធ",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {labels[status] || status}
    </span>
  );
}

function formatMonth(value?: string) {
  if (!value) return "-";
  return String(value).slice(0, 7);
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
          highlight ? "text-emerald-400" : "text-(--panel-text)"
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
    <div className="p-6 space-y-6 text-(--panel-text)">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          👋 សួស្តី, {data.profile.full_name}
        </h1>
        <p className="text-sm text-(--panel-text-subtle) mt-1">
          ផ្ទាំងសង្ខេបព័ត៌មានបន្ទប់ កិច្ចសន្យា និងការទូទាត់របស់អ្នក
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="បន្ទប់របស់ខ្ញុំ"
          value={room ? `#${room.room_number}` : "-"}
          subtitle={
            room ? `${room.room_type} / ជាន់ ${room.floor}` : "មិនទាន់មានបន្ទប់"
          }
          icon={<Home size={20} />}
          color="text-blue-400"
        />

        <StatCard
          title="ថ្លៃបន្ទប់"
          value={room ? `$${Number(room.base_price || 0).toFixed(2)}` : "$0.00"}
          subtitle="តម្លៃបន្ទប់ប្រចាំខែ"
          icon={<DollarSign size={20} />}
          color="text-emerald-400"
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
              ? formatMonth(currentBill.billing_month)
              : "មិនមានវិក្កយបត្រ"
          }
          icon={<CreditCard size={20} />}
          color="text-amber-400"
        />

        <StatCard
          title="ការទូទាត់រង់ចាំ"
          value={data.stats.pendingPayments}
          subtitle="រង់ចាំ Admin ផ្ទៀងផ្ទាត់"
          icon={<FileText size={20} />}
          color="text-indigo-400"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="rounded-ll border border-(--panel-border) bg-(--panel) p-5 xl:col-span-2">
          <h2 className="text-lg font-semibold mb-4">
            🏠 ព័ត៌មានបន្ទប់ និងកិច្ចសន្យា
          </h2>

          {!contract ? (
            <p className="text-sm text-(--panel-text-subtle)">
              អ្នកមិនទាន់មានកិច្ចសន្យាសកម្មទេ។
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-(--panel-border) bg-(--panel-inset) p-4">
                {room?.images?.[0] ? (
                  <img
                    src={room.images[0]}
                    alt="Room"
                    className=" h-[400px] w-full rounded-lg object-cover mb-4"
                  />
                ) : (
                  <div className=" h-[400px] w-full rounded-lg bg-(--panel-hover) border border-(--panel-border) flex items-center justify-center text-sm text-(--panel-text-subtle) mb-4">
                    No Room Image
                  </div>
                )}

                <p className="text-lg font-bold text-(--panel-text)">
                  បន្ទប់ #{room?.room_number}
                </p>
                <p className="text-sm text-(--panel-text-subtle) mt-1">{room?.room_type}</p>
              </div>

              <div className="rounded-xl border border-(--panel-border) bg-(--panel-inset) p-4 space-y-3">
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

        <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
          <h2 className="text-lg font-semibold mb-4">
            💰 វិក្កយបត្របច្ចុប្បន្ន
          </h2>

          {!currentBill ? (
            <p className="text-sm text-(--panel-text-subtle)">
              មិនមានវិក្កយបត្រមិនទាន់បង់ទេ។
            </p>
          ) : (
            <div className="space-y-3">
              <InfoRow
                label="ខែ"
                value={formatMonth(currentBill.billing_month)}
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
                <span className="text-lg font-bold text-emerald-400">
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
          <h2 className="text-lg font-semibold mb-4">🧾 វិក្កយបត្រថ្មីៗ</h2>

          <div className="space-y-3">
            {data.recentBills.length === 0 ? (
              <p className="text-sm text-(--panel-text-subtle)">មិនទាន់មានវិក្កយបត្រ</p>
            ) : (
              data.recentBills.map((bill: any) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between rounded-xl border border-(--panel-border) bg-(--panel-inset) p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-(--panel-text)">
                      ខែ {formatMonth(bill.billing_month)}
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

        <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
          <h2 className="text-lg font-semibold mb-4">💳 ការទូទាត់ថ្មីៗ</h2>

          <div className="space-y-3">
            {data.recentPayments.length === 0 ? (
              <p className="text-sm text-(--panel-text-subtle)">មិនទាន់មានការទូទាត់</p>
            ) : (
              data.recentPayments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-xl border border-(--panel-border) bg-(--panel-inset) p-3"
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
