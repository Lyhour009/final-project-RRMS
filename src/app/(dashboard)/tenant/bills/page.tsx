import { CreditCard, Receipt } from "lucide-react";
import { getTenantBillsData } from "@/actions/tenants/bills";

function StatusBadge({ status }: { status: string }) {
  const config = {
    green: { className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300", dot: "bg-emerald-500" },
    amber: { className: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300", dot: "bg-amber-500" },
    red: { className: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300", dot: "bg-red-500" },
    gray: { className: "border-zinc-500/20 bg-zinc-500/10 text-(--panel-text-muted)", dot: "bg-zinc-400" },
  };

  let tone: keyof typeof config = "gray";
  if (status === "paid" || status === "approved") tone = "green";
  if (status === "unpaid" || status === "pending") tone = "amber";
  if (status === "overdue" || status === "rejected") tone = "red";

  const labels: Record<string, string> = {
    unpaid: "មិនទាន់បង់",
    paid: "បានបង់",
    overdue: "ហួសកំណត់",
    pending: "រង់ចាំ",
    approved: "អនុម័ត",
    rejected: "បដិសេធ",
  };

  const { className, dot } = config[tone];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
      {labels[status] || status}
    </span>
  );
}

function formatMonth(value?: string) {
  if (!value) return "-";
  return String(value).slice(0, 7);
}

export default async function TenantBillsPage() {
  const { bills, payments, settings } = await getTenantBillsData();

  const currentBill = bills.find(
    (bill) => bill.status === "unpaid" || bill.status === "overdue",
  );

  const pendingPayment = currentBill
    ? payments.find(
        (payment) =>
          payment.bill_id === currentBill.id && payment.status === "pending",
      )
    : null;

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-5 p-4 text-(--panel-text) sm:p-5 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold">វិក្កយបត្ររបស់ខ្ញុំ</h1>
        <p className="text-sm text-(--panel-text-subtle) mt-1">
          មើលវិក្កយបត្រ ប្រវត្តិ និងព័ត៌មានបង់ប្រាក់
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3 xl:gap-5">
        <div className="xl:col-span-2 rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">វិក្កយបត្របច្ចុប្បន្ន</h2>
            <Receipt className="text-indigo-500 dark:text-indigo-400" size={20} />
          </div>

          {!currentBill ? (
            <p className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-(--panel-border) bg-(--panel-inset) p-6 text-center text-sm text-(--panel-text-subtle)">
              មិនមានវិក្កយបត្រមិនទាន់បង់ទេ។
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-(--panel-inset) px-3 py-2.5">
                <span className="text-sm text-(--panel-text-subtle)">ខែ</span>
                <span className="text-sm font-medium">
                  {formatMonth(currentBill.billing_month)}
                </span>
              </div>

              <div className="flex items-center justify-between px-3">
                <span className="text-sm text-(--panel-text-subtle)">ថ្លៃបន្ទប់</span>
                <span className="text-lg">
                  ${Number(currentBill.room_fee || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between px-3">
                <span className="text-sm text-(--panel-text-subtle)">ថ្លៃទឹក</span>
                <span className="text-lg">
                  ${Number(currentBill.water_fee || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between px-3">
                <span className="text-sm text-(--panel-text-subtle)">ថ្លៃភ្លើង</span>
                <span className="text-lg">
                  ${Number(currentBill.elec_fee || 0).toFixed(2)}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-3">
                <span className="text-sm font-medium">សរុប</span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${Number(currentBill.total_amount || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between px-3 pt-1">
                <span className="text-sm text-(--panel-text-subtle)">ស្ថានភាព</span>
                <StatusBadge status={currentBill.status} />
              </div>

              {pendingPayment && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-300">
                  ការទូទាត់របស់អ្នកកំពុងរង់ចាំ Admin ផ្ទៀងផ្ទាត់។
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">QR បង់ប្រាក់</h2>
            <CreditCard className="text-emerald-500 dark:text-emerald-400" size={20} />
          </div>

          {settings?.payment_qr_url ? (
            <img
              src={settings.payment_qr_url}
              alt="Payment QR"
              className="mx-auto aspect-square w-full max-w-[280px] rounded-xl border border-(--panel-border) bg-white p-4 shadow-sm"
            />
          ) : (
            <div className="flex aspect-square min-h-52 w-full items-center justify-center rounded-xl border border-dashed border-(--panel-border) bg-(--panel-inset) px-4 text-center text-sm text-(--panel-text-subtle)">
              មិនទាន់មាន QR Code
            </div>
          )}

          <p className="text-xs text-(--panel-text-subtle) mt-3 leading-relaxed">
            {settings?.payment_instruction ||
              "សូមស្កេន QR Code ដើម្បីបង់ប្រាក់ បន្ទាប់មកចុចបញ្ជាក់ការទូទាត់។"}
          </p>

          {currentBill && !pendingPayment && (
            <a
              href={`/tenant/payments?bill=${currentBill.id}`}
              className="mt-5 flex h-11 items-center justify-center rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-(--panel)"
            >
              ខ្ញុំបានបង់ប្រាក់រួចហើយ
            </a>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold mb-4">ប្រវត្តិវិក្កយបត្រ</h2>

        <div className="space-y-2">
          {bills.length === 0 ? (
            <div className="rounded-xl border border-dashed border-(--panel-border) bg-(--panel-inset) px-4 py-10 text-center text-sm text-(--panel-text-subtle)">មិនទាន់មានវិក្កយបត្រ</div>
          ) : (
            bills.map((bill) => (
              <div
                key={bill.id}
                className="flex flex-col gap-3 rounded-lg border border-(--panel-border) bg-(--panel-inset) p-3 transition hover:border-indigo-400/30 hover:bg-(--panel) sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium">
                    ខែ {formatMonth(bill.billing_month)}
                  </p>
                  <p className="text-xs text-(--panel-text-subtle)">
                    ថ្លៃបន្ទប់ ${Number(bill.room_fee || 0).toFixed(2)} · ទឹក $
                    {Number(bill.water_fee || 0).toFixed(2)} · ភ្លើង $
                    {Number(bill.elec_fee || 0).toFixed(2)}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    ${Number(bill.total_amount || 0).toFixed(2)}
                  </p>
                  <StatusBadge status={bill.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
