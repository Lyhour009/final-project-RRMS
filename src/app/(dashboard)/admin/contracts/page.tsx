import { getContracts, getContractFormData } from "@/actions/contracts";
import { ContractTableWrapper } from "@/components/contract/contract-table";
import { ExportExcelButton } from "@/components/export/export-excel-button";

export default async function ContractsPage() {
  const contracts = await getContracts();
  const { tenants, rooms } = await getContractFormData();

  const exportContracts = contracts.map((contract: any) => ({
    Tenant: contract.profiles?.full_name || "-",
    Room: contract.rooms?.room_number || "-",
    StartDate: contract.start_date,
    EndDate: contract.end_date,
    Deposit: contract.deposit_amount,
    DueDay: contract.due_day,
    Status: contract.status,
  }));
  return (
    <div className="p-6 space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            📋 គ្រប់គ្រងកិច្ចសន្យាជួល
          </h1>

          <p className="text-sm text-zinc-400 mt-1">
            ទំព័រចាត់ចែងកិច្ចសន្យាជួល បន្ថែម កែប្រែ និងលុប
          </p>
        </div>
        <ExportExcelButton data={exportContracts} fileName="contracts-report" />
      </div>

      <ContractTableWrapper
        initialContracts={contracts || []}
        tenants={tenants || []}
        rooms={rooms || []}
      />
    </div>
  );
}
