import { CheckCircle, Clock, CreditCard, XCircle } from "lucide-react";
import {
  getTenantPaymentsData,
  submitTenantPayment,
} from "@/actions/tenants/payments";
import { PAYMENT_METHOD_LABELS } from "@/lib/validations/payments";

function StatusBadge({ status }: { status: string }) {
  let className = "bg-zinc-500/10 text-(--panel-text-muted) border-zinc-500/20";

  if (status === "approved") {
    className = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }

  if (status === "pending") {
    className = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  if (status === "rejected") {
    className = "bg-red-500/10 text-red-400 border-red-500/20";
  }

  const labels: Record<string, string> = {
    pending: "រង់ចាំ",
    approved: "អនុម័ត",
    rejected: "បដិសេធ",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {labels[status] || status}
    </span>
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
    unpaidBills.find((bill: any) => bill.id === selectedBillId) ||
    unpaidBills[0];

  const pendingCount = payments.filter(
    (p: any) => p.status === "pending",
  ).length;
  const approvedCount = payments.filter(
    (p: any) => p.status === "approved",
  ).length;
  const rejectedCount = payments.filter(
    (p: any) => p.status === "rejected",
  ).length;
  const hasPendingPayment = payments?.some(
    (p) => p.bill_id === selectedBill?.id && p.status === "pending",
  );

  return (
    <div className="p-6 space-y-6 text-(--panel-text)">
      <div>
        <h1 className="text-2xl font-bold">💳 ការទូទាត់របស់ខ្ញុំ</h1>
        <p className="text-sm text-(--panel-text-subtle) mt-1">
          បញ្ជាក់ការទូទាត់ និងមើលប្រវត្តិការទូទាត់របស់អ្នក
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4">
          <Clock className="text-amber-400 mb-2" size={20} />
          <p className="text-sm text-(--panel-text-muted)">រង់ចាំ</p>
          <p className="text-2xl font-bold">{pendingCount}</p>
        </div>

        <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4">
          <CheckCircle className="text-emerald-400 mb-2" size={20} />
          <p className="text-sm text-(--panel-text-muted)">បានអនុម័ត</p>
          <p className="text-2xl font-bold">{approvedCount}</p>
        </div>

        <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-4">
          <XCircle className="text-red-400 mb-2" size={20} />
          <p className="text-sm text-(--panel-text-muted)">បានបដិសេធ</p>
          <p className="text-2xl font-bold">{rejectedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
          <h2 className="text-lg font-semibold mb-4">បញ្ជាក់ការទូទាត់</h2>

          {unpaidBills.length === 0 ? (
            <p className="text-sm text-(--panel-text-subtle)">
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
                  {unpaidBills.map((bill: any) => (
                    <option key={bill.id} value={bill.id}>
                      ខែ {formatMonth(bill.billing_month)} - $
                      {Number(bill.total_amount || 0).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-(--panel-border) bg-(--panel-inset) p-2">
                <p className="text-sm text-(--panel-text-subtle)">ចំនួនត្រូវបង់</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">
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

              {hasPendingPayment ? (
                <div className="rounded-lg border border-yellow-600/40 bg-yellow-500/10 p-3 text-sm text-yellow-400">
                  អ្នកបានផ្ញើការទូទាត់រួចហើយ។ សូមរង់ចាំ Admin ពិនិត្យ។
                </div>
              ) : (
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-5 py-3 text-white font-semibold text-sm"
                >
                  ខ្ញុំបានបង់ប្រាក់រួចហើយ
                </button>
              )}
            </form>
          )}
        </div>

        <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">QR Code</h2>
            <CreditCard className="text-emerald-400" size={20} />
          </div>

          {settings?.payment_qr_url ? (
            <img
              src={settings.payment_qr_url}
              alt="Payment QR"
              className="w-full rounded-xl border border-(--panel-border) bg-white p-3"
            />
          ) : (
            <div className="h-56 rounded-xl border border-(--panel-border) bg-(--panel-inset) flex items-center justify-center text-sm text-(--panel-text-subtle)">
              មិនទាន់មាន QR Code
            </div>
          )}

          <p className="text-xs text-(--panel-text-subtle) mt-3 leading-relaxed">
            {settings?.payment_instruction ||
              "សូមស្កេន QR Code បន្ទាប់មកចុចបញ្ជាក់ការទូទាត់។"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-(--panel-border) bg-(--panel) p-5">
        <h2 className="text-lg font-semibold mb-4">ប្រវត្តិការទូទាត់</h2>

        <div className="space-y-3">
          {payments.length === 0 ? (
            <p className="text-sm text-(--panel-text-subtle)">មិនទាន់មានការទូទាត់</p>
          ) : (
            payments.map((payment: any) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-xl border border-(--panel-border) bg-(--panel-inset) p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    ${Number(payment.amount || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-(--panel-text-subtle)">
                    {PAYMENT_METHOD_LABELS[payment.payment_method as keyof typeof PAYMENT_METHOD_LABELS] || payment.payment_method}{" "}
                    · ខែ {formatMonth(payment.bills?.billing_month)}
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
