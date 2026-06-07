import { getContractsAction } from "@/actions/contracts";
import ContractsClient from "@/components/contract/contract-client";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  const result = await getContractsAction();
  const initialContracts = result.success && result.data ? result.data : [];

  return (
    <div className="w-full min-h-screen p-1 md:p-6">
      <ContractsClient initialContracts={initialContracts} />
    </div>
  );
}
