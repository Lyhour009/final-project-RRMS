import { getBillsAction } from "@/actions/bills";
import { getContractsAction } from "@/actions/contracts";
import BillsClient from "@/components/bill/bill-client";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function BillPage() {
  const result = await getBillsAction();
  const initialBills = result.success && result.data ? result.data : [];

  return (
    <div className="w-full min-h-screen p-1 md:p-6">
      <BillsClient initialBills={initialBills} />
    </div>
  );
}
