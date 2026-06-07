import { getMaintenanceRequestsAction } from "@/actions/maintenances";
import { getTenantsAction } from "@/actions/tenants";
import { getRoomsAction } from "@/actions/rooms";
import { getStaffAction } from "@/actions/staff"; // profiles with role = 'admin' or 'staff'
import MaintenanceClient from "@/components/maintenance/maintenance-client";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const [reqResult, tenantResult, roomResult, staffResult] = await Promise.all([
    getMaintenanceRequestsAction(),
    getTenantsAction(),
    getRoomsAction(),
    getStaffAction(),
  ]);

  const initialRequests =
    reqResult.success && reqResult.data ? reqResult.data : [];

  const tenants = (
    tenantResult.success && tenantResult.data ? tenantResult.data : []
  ).map((t: { id: string; full_name: string }) => ({
    id: t.id,
    full_name: t.full_name,
  }));

  const rooms = (
    roomResult.success && roomResult.data ? roomResult.data : []
  ).map((r: { id: string; room_number: string }) => ({
    id: r.id,
    room_number: r.room_number,
  }));

  const staff = (
    staffResult.success && staffResult.data ? staffResult.data : []
  ).map((s: { id: string; full_name: string }) => ({
    id: s.id,
    full_name: s.full_name,
  }));

  return (
    <div className="w-full min-h-screen p-1 md:p-6">
      <MaintenanceClient
        initialRequests={initialRequests}
        tenants={tenants}
        rooms={rooms}
        staff={staff}
      />
    </div>
  );
}
