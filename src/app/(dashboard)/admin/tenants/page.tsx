import { getTenants } from "@/actions/tenants";
import { ExportExcelButton } from "@/components/export/export-excel-button";
import { TenantTableWrapper } from "@/components/tenant/tenant-table";
import type { Tenant } from "@/lib/validations/tenants";
import { Users } from "lucide-react";

export default async function TenantsPage() {
  const tenants = await getTenants();

  const exportTenants = tenants.map((tenant: Tenant) => ({
    Name: tenant.full_name,
    Email: tenant.email,
    Phone: tenant.phone_number,
    Role: tenant.role,
    CreatedAt: tenant.created_at,
  }));
  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-6 p-4 text-(--panel-text) sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-600 dark:text-violet-300">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              គ្រប់គ្រងអ្នកជួល
            </h1>
            <p className="mt-1 text-sm leading-6 text-(--panel-text-muted)">
              ទំព័រចាត់ចែងទិន្នន័យអ្នកជួល បន្ថែម កែប្រែ និងលុប
            </p>
          </div>
        </div>
        <ExportExcelButton data={exportTenants} fileName="tenants-report" />
      </div>

      <TenantTableWrapper initialTenants={tenants || []} />
    </div>
  );
}
