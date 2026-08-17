import { getPayments, getUnpaidBillsForPayment } from "@/actions/payments";
import { ExportExcelButton } from "@/components/export/export-excel-button";
import { PaymentTableWrapper } from "@/components/payment/payment-table";
import { CreditCard } from "lucide-react";

type PaymentExportRecord = {
  amount: number;
  payment_method: string;
  status: string;
  paid_at?: string | null;
  created_at: string;
  profiles?: { full_name?: string | null } | null;
  bills?: { billing_month?: string | null } | null;
};

export default async function PaymentsPage() {
  const [payments, unpaidBills] = await Promise.all([
    getPayments(),
    getUnpaidBillsForPayment(),
  ]);

  const exportPayments = payments.map((payment: PaymentExportRecord) => ({
    Tenant: payment.profiles?.full_name || "-",
    BillMonth: payment.bills?.billing_month?.slice(0, 7) || "-",
    Amount: payment.amount,
    Method: payment.payment_method,
    Status: payment.status,
    PaidAt: payment.paid_at || "-",
    CreatedAt: payment.created_at,
  }));

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-5 p-4 text-(--panel-text) sm:p-5 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-300">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              គ្រប់គ្រងការទូទាត់
            </h1>
            <p className="mt-1 text-sm leading-6 text-(--panel-text-muted)">
              ពិនិត្យ អនុម័ត ឬបដិសេធការទូទាត់របស់អ្នកជួល
            </p>
          </div>
        </div>
        <ExportExcelButton data={exportPayments} fileName="payments-report" />
      </div>

      <PaymentTableWrapper
        initialPayments={payments || []}
        unpaidBills={unpaidBills || []}
      />
    </div>
  );
}
