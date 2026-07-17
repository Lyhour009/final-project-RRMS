import { getPayments, getUnpaidBillsForPayment } from "@/actions/payments";
import { ExportExcelButton } from "@/components/export/export-excel-button";
import { PaymentTableWrapper } from "@/components/payment/payment-table";

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
    <div className="p-6 space-y-6 text-(--panel-text)">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            💳 គ្រប់គ្រងការទូទាត់
          </h1>

          <p className="text-sm text-(--panel-text-muted) mt-1">
            ពិនិត្យ អនុម័ត ឬបដិសេធការទូទាត់របស់អ្នកជួល
          </p>
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
