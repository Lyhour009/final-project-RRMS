import { getContracts, getContractFormData } from "@/actions/contracts";
import { ContractTableWrapper } from "@/components/contract/contract-table";
import { ExportExcelButton } from "@/components/export/export-excel-button";
import { FileSignature } from "lucide-react";

export default async function ContractsPage() {
  const contracts = await getContracts();
  const { tenants, rooms, defaultDueDay } = await getContractFormData();

  const exportContracts = contracts.map((contract) => ({
    Tenant: contract.profiles?.full_name || "-",
    Room: contract.rooms?.room_number || "-",
    StartDate: contract.start_date,
    EndDate: contract.end_date,
    Deposit: contract.deposit_amount,
    DueDay: contract.due_day,
    Status: contract.status,
  }));
  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-6 p-4 text-(--panel-text) sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-600 dark:text-blue-300">
            <FileSignature className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              គ្រប់គ្រងកិច្ចសន្យាជួល
            </h1>
            <p className="mt-1 text-sm leading-6 text-(--panel-text-muted)">
              ទំព័រចាត់ចែងកិច្ចសន្យាជួល បន្ថែម កែប្រែ និងលុប
            </p>
          </div>
        </div>
        <ExportExcelButton data={exportContracts} fileName="contracts-report" />
      </div>

      <ContractTableWrapper
        initialContracts={contracts || []}
        tenants={tenants || []}
        rooms={rooms || []}
        defaultDueDay={defaultDueDay}
      />
    </div>
  );
}
