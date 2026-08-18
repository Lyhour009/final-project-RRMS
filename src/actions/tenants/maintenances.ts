"use server";

import { revalidatePath } from "next/cache";
import { requireTenant } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";
import { maintenanceSchema } from "@/lib/validations/tenant/maintenance";

// See bill-generator.ts (actions folder) for why this cast exists: no
// generated DB types, so Supabase-js can't tell `rooms:room_id` resolves
// to a single row.
type MaintenanceRequestWithRoom = {
  id: string;
  tenant_id: string;
  room_id: string;
  issue_title: string;
  issue_description: string;
  status: string;
  priority: string;
  created_at: string;
  resolved_at: string | null;
  rooms?: {
    id: string;
    room_number: string;
    room_type: string;
  };
};

type ActiveContractWithRoom = {
  id: string;
  room_id: string;
  rooms?: {
    id: string;
    room_number: string;
    room_type: string;
  };
};

export async function getTenantMaintenanceData() {
  const { supabase, user } = await requireTenant();

  const tenantId = user.id;

  // Independent reads — fetch concurrently instead of two sequential round trips.
  const [
    { data: contractData, error: contractError },
    { data: requests, error: requestsError },
  ] = await Promise.all([
    supabase
      .from("contracts")
      .select(
        `
      id,
      room_id,
      rooms:room_id (
        id,
        room_number,
        room_type
      )
    `,
      )
      .eq("tenant_id", tenantId)
      .eq("status", "active")
      .maybeSingle(),
    supabase
      .from("maintenance_requests")
      .select(
        `
      id,
      tenant_id,
      room_id,
      issue_title,
      issue_description,
      status,
      priority,
      created_at,
      resolved_at,
      rooms:room_id (
        id,
        room_number,
        room_type
      )
    `,
      )
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false }),
  ]);

  const contract = contractData as unknown as ActiveContractWithRoom | null;

  if (contractError) {
    throw new Error(contractError.message);
  }

  if (requestsError) {
    throw new Error(requestsError.message);
  }

  return {
    contract,
    requests: (requests || []) as unknown as MaintenanceRequestWithRoom[],
  };
}

export async function createTenantMaintenanceRequest(formData: FormData) {
  const { supabase, user } = await requireTenant();

  const tenantId = user.id;

  const parsed = maintenanceSchema.safeParse({
    issue_title: formData.get("issue_title"),
    issue_description: formData.get("issue_description"),
    priority: formData.get("priority"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "ទិន្នន័យមិនត្រឹមត្រូវ");
  }

  const { issue_title, issue_description, priority } = parsed.data;

  // The active-contract lookup and the admin-recipient list don't depend on
  // each other, so fetch both up front concurrently — the admin list is only
  // needed after the insert below, but there's no reason to wait for the
  // insert to *start* fetching it.
  const [
    { data: contract, error: contractError },
    { data: admins },
  ] = await Promise.all([
    supabase
      .from("contracts")
      .select("id, room_id")
      .eq("tenant_id", tenantId)
      .eq("status", "active")
      .maybeSingle(),
    supabase.from("profiles").select("id").eq("role", "admin"),
  ]);

  if (contractError) {
    throw new Error(contractError.message);
  }

  if (!contract) {
    throw new Error("អ្នកមិនទាន់មានកិច្ចសន្យាសកម្មទេ");
  }

  const { error: requestError } = await supabase
    .from("maintenance_requests")
    .insert({
      tenant_id: tenantId,
      room_id: contract.room_id,
      issue_title,
      issue_description,
      priority,
      status: "pending",
    });

  if (requestError) {
    throw new Error(requestError.message);
  }

  await Promise.all(
    (admins || []).map((admin) =>
      createNotification({
        userId: admin.id,
        type: "maintenance_created",
        message: `មានសំណើជួសជុលថ្មី៖ ${issue_title}`,
        link: "/admin/maintenance",
      }),
    ),
  );

  revalidatePath("/tenant/maintenance");
  revalidatePath("/admin/maintenance");
  revalidatePath("/admin/dashboard");
}
