import { getTenantsAction } from "@/actions/tenants";
import TenantsClient from "@/components/tenant/tenant-client";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function TenantsPage() {
  const result = await getTenantsAction();
  const initialTenants = result.success && result.data ? result.data : [];

  return (
    <div className="w-full min-h-screen p-1 md:p-6">
      <TenantsClient initialTenants={initialTenants} />
    </div>
  );
}
