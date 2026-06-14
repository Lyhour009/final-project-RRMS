import { getPayments, getUnpaidBillsForPayment } from "@/actions/payments";
import { PaymentTableWrapper } from "@/components/payment/payment-table";

export default async function PaymentsPage() {
  const [payments, unpaidBills] = await Promise.all([
    getPayments(),
    getUnpaidBillsForPayment(),
  ]);

  return (
    <div className="p-6 space-y-6 text-white">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          💳 គ្រប់គ្រងការទូទាត់
        </h1>

        <p className="text-sm text-zinc-400 mt-1">
          ពិនិត្យ អនុម័ត ឬបដិសេធការទូទាត់របស់អ្នកជួល
        </p>
      </div>

      <PaymentTableWrapper
        initialPayments={payments || []}
        unpaidBills={unpaidBills || []}
      />
    </div>
  );
}
