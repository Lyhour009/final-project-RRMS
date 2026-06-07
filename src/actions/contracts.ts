"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { contractFormSchema } from "@/types/contract";
import type { Contract } from "@/types/contract";

async function getSupabase() {
  const cookiesStore = await cookies();
  return await createClient(cookiesStore);
}

const CONTRACT_SELECT = `
  id,
  tenant_id,
  room_id,
  start_date,
  end_date,
  deposit_amount,
  status,
  created_at,
  due_day,
  renewed_from,
  profiles ( id, full_name, phone_number ),
  rooms ( id, room_number, room_type, base_price )
`;

// ── 1. ទាញយក Contracts ទាំងអស់ ──────────────────────────────────────────────
export async function getContractsAction() {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("contracts")
      .select(CONTRACT_SELECT)
      .order("created_at", { ascending: false });

    if (error) return { success: false, data: [], error: error.message };
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, data: [], error: msg };
  }
}

// ── 2. ទាញយក Contract តែមួយ ─────────────────────────────────────────────────
export async function getContractByIdAction(id: string) {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("contracts")
      .select(CONTRACT_SELECT)
      .eq("id", id)
      .single();

    if (error) return { success: false, data: null, error: error.message };
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, data: null, error: msg };
  }
}

// ── 3. បង្កើត Contract ថ្មី ──────────────────────────────────────────────────
export async function createContractAction(payload: unknown) {
  // Server-side Zod validation
  const parsed = contractFormSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  const values = parsed.data;

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("contracts")
      .insert({
        tenant_id: values.tenantId,
        room_id: values.roomId,
        start_date: values.startDate || null,
        end_date: values.endDate || null,
        deposit_amount: values.depositAmount
          ? parseFloat(values.depositAmount)
          : null,
        status: values.status,
        due_day: values.dueDay ? parseInt(values.dueDay, 10) : null,
      })
      .select(CONTRACT_SELECT)
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/contracts");
    return { success: true, data: data as unknown as Contract };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 4. កែប្រែ Contract ───────────────────────────────────────────────────────
export async function updateContractAction(id: string, payload: unknown) {
  // Server-side Zod validation
  const parsed = contractFormSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  const values = parsed.data;

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("contracts")
      .update({
        tenant_id: values.tenantId,
        room_id: values.roomId,
        start_date: values.startDate || null,
        end_date: values.endDate || null,
        deposit_amount: values.depositAmount
          ? parseFloat(values.depositAmount)
          : null,
        status: values.status,
        due_day: values.dueDay ? parseInt(values.dueDay, 10) : null,
      })
      .eq("id", id)
      .select(CONTRACT_SELECT)
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/contracts");
    return { success: true, data: data as unknown as Contract };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 5. លុប Contract ──────────────────────────────────────────────────────────
export async function deleteContractAction(id: string) {
  try {
    const supabase = await getSupabase();
    const { error } = await supabase.from("contracts").delete().eq("id", id);
    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/contracts");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 6. ទាញ Tenants + Rooms សម្រាប់ Dropdown ─────────────────────────────────
export async function getContractFormOptionsAction() {
  try {
    const supabase = await getSupabase();
    const [tenantsRes, roomsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, phone_number")
        .eq("role", "tenant")
        .order("full_name"),
      supabase
        .from("rooms")
        .select("id, room_number, room_type, base_price, status")
        .order("room_number"),
    ]);

    return {
      success: true,
      tenants: tenantsRes.data ?? [],
      rooms: roomsRes.data ?? [],
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, tenants: [], rooms: [], error: msg };
  }
}
