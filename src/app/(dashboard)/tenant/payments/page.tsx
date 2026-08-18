import { CheckCircle, Clock, CreditCard, XCircle } from "lucide-react";
import {
  getTenantPaymentsData,
  submitTenantPayment,
} from "@/actions/tenants/payments";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LabeledSelect } from "@/components/ui/labeled-select";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/ui/stat-card";
import { formatBillingMonth } from "@/lib/utils";
import { PAYMENT_METHOD_LABELS } from "@/lib/validations/payments";

const PAYMENT_METHOD_OPTIONS = Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({ value, label }));

const SELECT_FIELD_CLASSNAME = "h-10 w-full border-(--panel-border) bg-(--panel) text-(--panel-text)";

function StatusBadge({ status }: { status: string }) {
  let tone: "green" | "amber" | "red" | "gray" = "gray";
  if (status === "approved") tone = "green";
  if (status === "pending") tone = "amber";
  if (status === "rejected") tone = "red";

  const labels: Record<string, string> = {
    pending: "រង់ចាំ",
    approved: "អនុម័ត",
    rejected: "បដិសេធ",
  };

  return <Badge tone={tone}>{labels[status] || status}</Badge>;
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
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">ការទូទាត់របស់ខ្ញុំ</h1>
        <p className="mt-1 text-sm leading-6 text-(--panel-text-muted)">
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
              <div className="space-y-1.5">
                <Label className="text-(--panel-text-muted)">
                  ជ្រើសរើសវិក្កយបត្រ
                </Label>
                <LabeledSelect
                  name="bill_id"
                  defaultValue={selectedBill?.id}
                  triggerClassName={SELECT_FIELD_CLASSNAME}
                  contentClassName="border-(--panel-border) bg-(--panel) text-(--panel-text)"
                  itemClassName="text-sm"
                  options={unpaidBills.map((bill) => ({
                    value: bill.id,
                    label: `ខែ ${formatBillingMonth(bill.billing_month)} - $${Number(bill.total_amount || 0).toFixed(2)}`,
                  }))}
                />
              </div>

              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                <p className="text-sm text-(--panel-text-subtle)">ចំនួនត្រូវបង់</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">
                  ${Number(selectedBill?.total_amount || 0).toFixed(2)}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-(--panel-text-muted)">វិធីបង់ប្រាក់</Label>
                <LabeledSelect
                  name="payment_method"
                  defaultValue="aba"
                  triggerClassName={SELECT_FIELD_CLASSNAME}
                  contentClassName="border-(--panel-border) bg-(--panel) text-(--panel-text)"
                  itemClassName="text-sm"
                  options={PAYMENT_METHOD_OPTIONS}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-(--panel-text-muted)">ចំណាំ</Label>
                <Input
                  name="note"
                  placeholder="ឧ. បានបង់តាម ABA"
                  className="h-10 border-(--panel-border) bg-(--panel) text-(--panel-text)"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-(--panel-text-muted)">
                  Payment proof (required for electronic payments)
                </Label>
                <Input
                  type="file"
                  name="proof_image"
                  accept="image/jpeg,image/png,image/webp"
                  className="cursor-pointer border-(--panel-border) bg-(--panel) text-(--panel-text) file:mr-3 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                />
                <p className="text-xs text-(--panel-text-subtle)">
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
                  className="flex h-10 w-full items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/15 transition hover:bg-indigo-500 sm:w-auto"
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
                className="flex items-center justify-between rounded-xl border border-(--panel-border) bg-(--panel-inset) p-3.5 transition hover:border-indigo-400/30 hover:bg-(--panel)"
              >
                <div>
                  <p className="text-sm font-medium">
                    ${Number(payment.amount || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-(--panel-text-subtle)">
                    {PAYMENT_METHOD_LABELS[payment.payment_method as keyof typeof PAYMENT_METHOD_LABELS] || payment.payment_method}{" "}
                    · ខែ{" "}
                    {formatBillingMonth(
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
