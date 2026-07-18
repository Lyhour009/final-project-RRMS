"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

export async function getMaintenanceRequests() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
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
      profiles:tenant_id (
        id,
        full_name,
        phone_number,
        email
      ),
      rooms:room_id (
        id,
        room_number,
        room_type
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data || [];
}

const MAINTENANCE_STATUSES = ["pending", "in_progress", "resolved"] as const;

export async function updateMaintenanceStatus(id: string, status: string) {
  const { supabase } = await requireAdmin();

  if (!MAINTENANCE_STATUSES.includes(status as (typeof MAINTENANCE_STATUSES)[number])) {
    throw new Error("ស្ថានភាពមិនត្រឹមត្រូវ");
  }

  const { data: request } = await supabase
    .from("maintenance_requests")
    .select("tenant_id")
    .eq("id", id)
    .single();

  const updateData: {
    status: string;
    resolved_at?: string | null;
  } = {
    status,
  };

  if (status === "resolved") {
    updateData.resolved_at = new Date().toISOString();
    if (request) {
      await createNotification({
        userId: request.tenant_id,
        type: "maintenance_resolved",
        message: "សំណើជួសជុលរបស់អ្នកត្រូវបានដោះស្រាយ",
        link: "/tenant/maintenance",
      });
    }
  } else {
    updateData.resolved_at = null;
  }

  const { error } = await supabase
    .from("maintenance_requests")
    .update(updateData)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/maintenance");
  revalidatePath("/tenant/maintenance");
  revalidatePath("/admin/dashboard");
}

export async function deleteMaintenanceRequest(id: string) {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from("maintenance_requests")
    .update({ archived_at: new Date().toISOString(), archived_by: user.id })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/maintenance");
  revalidatePath("/admin/dashboard");
}
