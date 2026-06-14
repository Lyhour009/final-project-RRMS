"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/actions/notifications";
import { maintenanceSchema } from "@/lib/validations/tenant/maintenance";

async function getSupabase() {
  const cookieStore = await cookies();
  return await createClient(cookieStore);
}

export async function getTenantMaintenanceData() {
  const supabase = await getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("សូមចូលប្រើប្រាស់ជាមុនសិន");
  }

  const tenantId = user.id;

  const { data: contract, error: contractError } = await supabase
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
    requests: requests || [],
  };
}

export async function createTenantMaintenanceRequest(formData: FormData) {
  const supabase = await getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("សូមចូលប្រើប្រាស់ជាមុនសិន");
  }

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

  await createNotification({
    userId: "2bc3716f-da30-4187-a3d7-6d3c90b1ed9c", // Admin ID
    type: "maintenance_created",
    message: `មានសំណើជួសជុលថ្មី៖ ${issue_title}`,
    link: "/admin/maintenance",
  });

  revalidatePath("/tenant/maintenance");
  revalidatePath("/admin/maintenance");
  revalidatePath("/admin/dashboard");
}
