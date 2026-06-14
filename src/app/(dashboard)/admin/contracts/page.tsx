import { getContracts, getContractFormData } from "@/actions/contracts";
import { ContractTableWrapper } from "@/components/contract/contract-table";

export default async function ContractsPage() {
  const contracts = await getContracts();
  const { tenants, rooms } = await getContractFormData();

  return (
    <div className="p-6 space-y-6 text-white">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          📋 គ្រប់គ្រងកិច្ចសន្យាជួល
        </h1>

        <p className="text-sm text-zinc-400 mt-1">
          ទំព័រចាត់ចែងកិច្ចសន្យាជួល បន្ថែម កែប្រែ និងលុប
        </p>
      </div>

      <ContractTableWrapper
        initialContracts={contracts || []}
        tenants={tenants || []}
        rooms={rooms || []}
      />
    </div>
  );
}
