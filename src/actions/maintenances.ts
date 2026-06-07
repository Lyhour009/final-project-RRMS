"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { maintenanceFormSchema } from "@/types/maintenance";
import type { MaintenanceRequest } from "@/types/maintenance";

async function getSupabase() {
  const cookiesStore = await cookies();
  return await createClient(cookiesStore);
}

const MAINTENANCE_SELECT = `
  *,
  profiles:tenant_id ( full_name ),
  rooms:room_id ( room_number ),
  assignee:assigned_to ( full_name )
`;

// ─── Helper: build insert/update row ─────────────────────────────────────────

function toRow(data: ReturnType<typeof maintenanceFormSchema.parse>) {
  return {
    tenant_id: data.tenantId || null,
    room_id: data.roomId || null,
    issue_title: data.issueTitle.trim(),
    issue_description: data.issueDescription?.trim() || null,
    status: data.status,
    priority: data.priority,
    assigned_to: data.assignedTo || null,
    resolved_at: data.status === "resolved" ? new Date().toISOString() : null,
  };
}

// ── 1. ទាញយក Maintenance Requests ទាំងអស់ ────────────────────────────────────
export async function getMaintenanceRequestsAction() {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("maintenance_requests")
      .select(MAINTENANCE_SELECT)
      .order("created_at", { ascending: false });

    if (error) return { success: false, data: [], error: error.message };
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, data: [], error: msg };
  }
}

// ── 2. ទាញយក Request តែមួយ ───────────────────────────────────────────────────
export async function getMaintenanceByIdAction(id: string) {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("maintenance_requests")
      .select(MAINTENANCE_SELECT)
      .eq("id", id)
      .single();

    if (error) return { success: false, data: null, error: error.message };
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, data: null, error: msg };
  }
}

// ── 3. បង្កើត Request ថ្មី ────────────────────────────────────────────────────
export async function createMaintenanceAction(payload: unknown) {
  const parsed = maintenanceFormSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("maintenance_requests")
      .insert(toRow(parsed.data))
      .select(MAINTENANCE_SELECT)
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/maintenance");
    return { success: true, data: data as unknown as MaintenanceRequest };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 4. កែប្រែ Request ─────────────────────────────────────────────────────────
export async function updateMaintenanceAction(id: string, payload: unknown) {
  const parsed = maintenanceFormSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("maintenance_requests")
      .update(toRow(parsed.data))
      .eq("id", id)
      .select(MAINTENANCE_SELECT)
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/maintenance");
    return { success: true, data: data as unknown as MaintenanceRequest };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 5. លុប Request ────────────────────────────────────────────────────────────
export async function deleteMaintenanceAction(id: string) {
  try {
    const supabase = await getSupabase();
    const { error } = await supabase
      .from("maintenance_requests")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/maintenance");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 6. Update Status តែមួយ (Quick Action) ────────────────────────────────────
export async function updateMaintenanceStatusAction(
  id: string,
  status: "pending" | "in_progress" | "resolved",
) {
  try {
    const supabase = await getSupabase();
    const { error } = await supabase
      .from("maintenance_requests")
      .update({
        status,
        resolved_at: status === "resolved" ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/maintenance");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}
