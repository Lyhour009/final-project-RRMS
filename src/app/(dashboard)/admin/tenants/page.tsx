import { getTenants } from "@/actions/tenants";
import { TenantTableWrapper } from "@/components/tenant/tenant-table";

export default async function TenantsPage() {
  const tenants = await getTenants();

  return (
    <div className="p-6 space-y-6 text-white">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          👥 គ្រប់គ្រងអ្នកជួល
        </h1>

        <p className="text-sm text-zinc-400 mt-1">
          ទំព័រចាត់ចែងទិន្នន័យអ្នកជួល បន្ថែម កែប្រែ និងលុប
        </p>
      </div>

      <TenantTableWrapper initialTenants={tenants || []} />
    </div>
  );
}
