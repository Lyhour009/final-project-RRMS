import { getTenants } from "@/actions/tenants";
import { ExportExcelButton } from "@/components/export/export-excel-button";
import { TenantTableWrapper } from "@/components/tenant/tenant-table";

export default async function TenantsPage() {
  const tenants = await getTenants();

  const exportTenants = tenants.map((tenant: any) => ({
    Name: tenant.full_name,
    Email: tenant.email,
    Phone: tenant.phone_number,
    Role: tenant.role,
    CreatedAt: tenant.created_at,
  }));
  return (
    <div className="p-6 space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            👥 គ្រប់គ្រងអ្នកជួល
          </h1>

          <p className="text-sm text-zinc-400 mt-1">
            ទំព័រចាត់ចែងទិន្នន័យអ្នកជួល បន្ថែម កែប្រែ និងលុប
          </p>
        </div>
        <ExportExcelButton data={exportTenants} fileName="tenants-report" />
      </div>

      <TenantTableWrapper initialTenants={tenants || []} />
    </div>
  );
}
