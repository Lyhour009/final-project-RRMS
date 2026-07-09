"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/server";
import { createNotification } from "@/actions/notifications";
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
  const { supabase, user } = await requireUser();

  const tenantId = user.id;

  const { data: contractData, error: contractError } = await supabase
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
    .maybeSingle();

  const contract = contractData as unknown as ActiveContractWithRoom | null;

  if (contractError) {
    throw new Error(contractError.message);
  }

  const { data: requests, error: requestsError } = await supabase
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
    .order("created_at", { ascending: false });

  if (requestsError) {
    throw new Error(requestsError.message);
  }

  return {
    contract,
    requests: (requests || []) as unknown as MaintenanceRequestWithRoom[],
  };
}

export async function createTenantMaintenanceRequest(formData: FormData) {
  const { supabase, user } = await requireUser();

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

  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .select("id, room_id")
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .maybeSingle();

  if (contractError) {
    throw new Error(contractError.message);
  }

  if (!contract) {
    throw new Error("អ្នកមិនទាន់មានកិច្ចសន្យាសកម្មទេ");
  }

  const { data: request, error: requestError } = await supabase
    .from("maintenance_requests")
    .insert({
      tenant_id: tenantId,
      room_id: contract.room_id,
      issue_title,
      issue_description,
      priority,
      status: "pending",
    })
    .select("id, issue_title")
    .single();

  if (requestError) {
    throw new Error(requestError.message);
  }

  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  for (const admin of admins || []) {
    await createNotification({
      userId: admin.id,
      type: "maintenance_created",
      message: `មានសំណើជួសជុលថ្មី៖ ${issue_title}`,
      link: "/admin/maintenance",
    });
  }

  revalidatePath("/tenant/maintenance");
  revalidatePath("/admin/maintenance");
  revalidatePath("/admin/dashboard");
}
