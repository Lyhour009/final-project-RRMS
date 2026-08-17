import { Wrench } from "lucide-react";

import { getMaintenanceRequests } from "@/actions/maintenances";
import { ExportExcelButton } from "@/components/export/export-excel-button";
import {
  MaintenanceTable,
  type MaintenanceRequestItem,
} from "@/components/maintenance/maintenance-table";

export default async function AdminMaintenancePage() {
  const requests = (await getMaintenanceRequests()) as MaintenanceRequestItem[];
  const exportMaintenance = requests.map((item) => ({
    Tenant: item.profiles?.full_name || "-",
    Room: item.rooms?.room_number || "-",
    Issue: item.issue_title,
    Description: item.issue_description,
    Priority: item.priority,
    Status: item.status,
    CreatedAt: item.created_at,
    ResolvedAt: item.resolved_at || "-",
  }));

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-5 p-4 text-(--panel-text) sm:p-5 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-600 dark:text-orange-300">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              គ្រប់គ្រងសំណើជួសជុល
            </h1>
            <p className="mt-1 text-sm leading-6 text-(--panel-text-muted)">
              ពិនិត្យ និងធ្វើបច្ចុប្បន្នភាពសំណើជួសជុលពីអ្នកជួល
            </p>
          </div>
        </div>
        <ExportExcelButton data={exportMaintenance} fileName="maintenance-report" />
      </div>

      <MaintenanceTable initialRequests={requests} />
    </div>
  );
}
