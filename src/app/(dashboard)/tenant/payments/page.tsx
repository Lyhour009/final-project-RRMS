import { CheckCircle, Clock, CreditCard, XCircle } from "lucide-react";
import {
  getTenantPaymentsData,
  submitTenantPayment,
} from "@/actions/tenants/payments";
import { PAYMENT_METHOD_LABELS } from "@/lib/validations/payments";

function StatusBadge({ status }: { status: string }) {
  const config = {
    green: { className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300", dot: "bg-emerald-500" },
    amber: { className: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300", dot: "bg-amber-500" },
    red: { className: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300", dot: "bg-red-500" },
    gray: { className: "border-zinc-500/20 bg-zinc-500/10 text-(--panel-text-muted)", dot: "bg-zinc-400" },
  };

  let tone: keyof typeof config = "gray";
  if (status === "approved") tone = "green";
  if (status === "pending") tone = "amber";
  if (status === "rejected") tone = "red";

  const labels: Record<string, string> = {
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

const STAT_TONES = {
  amber: { accent: "bg-amber-500", icon: "bg-amber-500/10 text-amber-600 dark:text-amber-300" },
  emerald: { accent: "bg-emerald-500", icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" },
  red: { accent: "bg-red-500", icon: "bg-red-500/10 text-red-600 dark:text-red-300" },
} as const;

function StatCard({ title, value, icon, tone }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  tone: keyof typeof STAT_TONES;
}) {
  const styles = STAT_TONES[tone];
  return (
    <div className="group relative overflow-hidden rounded-xl border border-(--panel-border) bg-(--panel) p-3.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-950/5 dark:hover:shadow-black/20">
      <div className={`absolute inset-x-0 top-0 h-1 ${styles.accent}`} />
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-(--panel-text-muted)">{title}</p>
        <div className={`shrink-0 rounded-lg p-1.5 ${styles.icon}`}>{icon}</div>
      </div>
      <p className="mt-1.5 text-lg font-bold leading-none tracking-tight">{value}</p>
    </div>
  );
}

function formatMonth(value?: string) {
  if (!value) return "-";
  return String(value).slice(0, 7);
}

export default async function TenantPaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ bill?: string }>;
}) {
  const params = await searchParams;
  const selectedBillId = params?.bill || "";

  const { unpaidBills, payments, settings } = await getTenantPaymentsData();

  const selectedBill =
    unpaidBills.find((bill) => bill.id === selectedBillId) ||
    unpaidBills[0];

  const pendingCount = payments.filter(
    (p) => p.status === "pending",
  ).length;
  const approvedCount = payments.filter(
    (p) => p.status === "approved",
  ).length;
  const rejectedCount = payments.filter(
    (p) => p.status === "rejected",
  ).length;
  const hasPendingPayment = payments?.some(
    (p) => p.bill_id === selectedBill?.id && p.status === "pending",
  );

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-5 p-4 text-(--panel-text) sm:p-5 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold">ការទូទាត់របស់ខ្ញុំ</h1>
        <p className="text-sm text-(--panel-text-subtle) mt-1">
          បញ្ជាក់ការទូទាត់ និងមើលប្រវត្តិការទូទាត់របស់អ្នក
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard title="រង់ចាំ" value={pendingCount} icon={<Clock size={16} />} tone="amber" />
        <StatCard title="បានអនុម័ត" value={approvedCount} icon={<CheckCircle size={16} />} tone="emerald" />
        <StatCard title="បានបដិសេធ" value={rejectedCount} icon={<XCircle size={16} />} tone="red" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
        <div className="xl:col-span-2 rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-semibold mb-4">បញ្ជាក់ការទូទាត់</h2>

          {unpaidBills.length === 0 ? (
            <p className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-(--panel-border) bg-(--panel-inset) p-6 text-center text-sm text-(--panel-text-subtle)">
              មិនមានវិក្កយបត្រមិនទាន់បង់ទេ។
            </p>
          ) : (
            <form action={submitTenantPayment} className="space-y-4">
              <div>
                <label className="text-sm text-(--panel-text-muted)">
                  ជ្រើសរើសវិក្កយបត្រ
                </label>
                <select
                  name="bill_id"
                  defaultValue={selectedBill?.id}
                  className="mt-1 h-10 w-full rounded-lg border border-(--panel-border) bg-(--panel-inset) px-3 text-sm text-(--panel-text)"
                >
                  {unpaidBills.map((bill) => (
                    <option key={bill.id} value={bill.id}>
                      ខែ {formatMonth(bill.billing_month)} - $
                      {Number(bill.total_amount || 0).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                <p className="text-sm text-(--panel-text-subtle)">ចំនួនត្រូវបង់</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  ${Number(selectedBill?.total_amount || 0).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="text-sm text-(--panel-text-muted)">វិធីបង់ប្រាក់</label>
                <select
                  name="payment_method"
                  defaultValue="aba"
                  className=" h-10 w-full rounded-lg border border-(--panel-border) bg-(--panel-inset) px-3 text-sm text-(--panel-text)"
                >
                  <option value="aba">ABA</option>
                  <option value="acleda">ACLEDA</option>
                  <option value="wing">Wing</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="other">ផ្សេងៗ</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-(--panel-text-muted)">ចំណាំ</label>
                <input
                  name="note"
                  placeholder="ឧ. បានបង់តាម ABA"
                  className="mt-1 h-10 w-full rounded-lg border border-(--panel-border) bg-(--panel-inset) px-3 text-sm text-(--panel-text) placeholder-(--panel-text-subtle)"
                />
              </div>

              <div>
                <label className="text-sm text-(--panel-text-muted)">
                  Payment proof (required for electronic payments)
                </label>
                <input
                  type="file"
                  name="proof_image"
                  accept="image/jpeg,image/png,image/webp"
                  className="mt-1 block w-full cursor-pointer rounded-xl border border-dashed border-indigo-500/40 bg-indigo-500/5 px-3 py-3 text-sm text-(--panel-text) file:mr-3 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                />
                <p className="mt-1 text-xs text-(--panel-text-subtle)">
                  JPG, PNG or WebP, maximum 5MB. Cash payments do not require an image.
                </p>
              </div>

              {hasPendingPayment ? (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
                  អ្នកបានផ្ញើការទូទាត់រួចហើយ។ សូមរង់ចាំ Admin ពិនិត្យ។
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 sm:w-auto"
                >
                  ខ្ញុំបានបង់ប្រាក់រួចហើយ
                </button>
              )}
            </form>
          )}
        </div>

        <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">QR Code</h2>
            <CreditCard className="text-emerald-500 dark:text-emerald-400" size={18} />
          </div>

          {settings?.payment_qr_url ? (
            <img
              src={settings.payment_qr_url}
              alt="Payment QR"
              className="w-full rounded-xl border border-(--panel-border) bg-white p-3"
            />
          ) : (
            <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-(--panel-border) bg-(--panel-inset) text-center text-sm text-(--panel-text-subtle)">
              មិនទាន់មាន QR Code
            </div>
          )}

          <p className="text-xs text-(--panel-text-subtle) mt-3 leading-relaxed">
            {settings?.payment_instruction ||
              "សូមស្កេន QR Code បន្ទាប់មកចុចបញ្ជាក់ការទូទាត់។"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold mb-4">ប្រវត្តិការទូទាត់</h2>

        <div className="space-y-2">
          {payments.length === 0 ? (
            <p className="text-sm text-(--panel-text-subtle)">មិនទាន់មានការទូទាត់</p>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg border border-(--panel-border) bg-(--panel-inset) p-3 transition hover:border-indigo-400/30 hover:bg-(--panel)"
              >
                <div>
                  <p className="text-sm font-medium">
                    ${Number(payment.amount || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-(--panel-text-subtle)">
                    {PAYMENT_METHOD_LABELS[payment.payment_method as keyof typeof PAYMENT_METHOD_LABELS] || payment.payment_method}{" "}
                    · ខែ{" "}
                    {formatMonth(
                      (payment.bills as { billing_month?: string } | null)
                        ?.billing_month,
                    )}
                  </p>
                </div>

                <StatusBadge status={payment.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
