"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getTenantSchema, type TenantFormValues } from "@/types/tenant";

// ─── Helper ───────────────────────────────────────────────────────────────────

async function getSupabase() {
  const cookiesStore = await cookies();
  return await createClient(cookiesStore);
}

// ─── Validate with Zod (shared logic) ────────────────────────────────────────

function validatePayload(payload: TenantFormValues, isEditMode: boolean) {
  const result = getTenantSchema(isEditMode).safeParse(payload);
  if (!result.success) {
    const messages = result.error.issues.map((e) => e.message).join(" ");
    return { ok: false as const, error: messages };
  }
  return { ok: true as const, data: result.data };
}

// ── 1. ទាញយក Tenants ទាំងអស់ ─────────────────────────────────────────────────

export async function getTenantsAction() {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        phone_number,
        role,
        created_at,
        contracts (
          id,
          status,
          start_date,
          end_date,
          rooms ( room_number )
        )
      `,
      )
      .eq("role", "tenant")
      .order("created_at", { ascending: false });

    if (error) return { success: false, data: [], error: error.message };
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, data: [], error: msg };
  }
}

// ── 2. ទាញយក Tenant តែមួយ ────────────────────────────────────────────────────

export async function getTenantByIdAction(id: string) {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        phone_number,
        role,
        created_at,
        contracts (
          id,
          status,
          start_date,
          end_date,
          deposit_amount,
          rooms ( room_number, room_type, base_price )
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) return { success: false, data: null, error: error.message };
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, data: null, error: msg };
  }
}

// ── 3. បង្កើត Tenant ថ្មី ────────────────────────────────────────────────────
// NOTE: Tenants ត្រូវបង្កើតតាមរយៈ Supabase Auth ជាមុន
// Action នេះ Update profile fields បន្ថែម

export async function createTenantAction(payload: TenantFormValues) {
  try {
    const validation = validatePayload(payload, false);
    if (!validation.ok) return { success: false, error: validation.error };

    const supabase = await getSupabase();

    // 1. បង្កើត auth user (admin invite)
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: validation.data.email!,
        password: crypto.randomUUID(), // Random password, tenant resets later
        email_confirm: true,
        user_metadata: { full_name: validation.data.fullName },
      });

    if (authError) return { success: false, error: authError.message };

    // 2. Update profile (auto-created by trigger)
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: validation.data.fullName.trim(),
        phone_number: validation.data.phoneNumber.trim(),
        role: "tenant",
      })
      .eq("id", authData.user.id);

    if (profileError) return { success: false, error: profileError.message };

    revalidatePath("/admin/tenants");
    return { success: true, id: authData.user.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 4. កែប្រែ Tenant ────────────────────────────────────────────────────────

export async function updateTenantAction(
  id: string,
  payload: TenantFormValues,
) {
  try {
    const validation = validatePayload(payload, true);
    if (!validation.ok) return { success: false, error: validation.error };

    const supabase = await getSupabase();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: validation.data.fullName.trim(),
        phone_number: validation.data.phoneNumber.trim(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/tenants");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 5. លុប Tenant ────────────────────────────────────────────────────────────

export async function deleteTenantAction(id: string) {
  try {
    const supabase = await getSupabase();

    // លុប auth user (profile លុបដោយ cascade)
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/tenants");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 6. Upload រូប ID Card ─────────────────────────────────────────────────────

export async function uploadIdCardImagesAction(
  tenantId: string,
  files: FormData,
) {
  try {
    const supabase = await getSupabase();
    const uploadedUrls: string[] = [];

    for (const [, file] of files.entries()) {
      if (!(file instanceof File)) continue;

      const ext = file.name.split(".").pop();
      const path = `${tenantId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("tenants")
        .upload(path, file, { upsert: false });

      if (uploadError) return { success: false, error: uploadError.message };

      const { data: urlData } = supabase.storage
        .from("tenants")
        .getPublicUrl(path);

      uploadedUrls.push(urlData.publicUrl);
    }

    // Append to existing id_card_images
    const { data: profile } = await supabase
      .from("profiles")
      .select("id_card_images")
      .eq("id", tenantId)
      .single();

    const existing: string[] = Array.isArray(profile?.id_card_images)
      ? profile.id_card_images
      : [];
    const merged = [...existing, ...uploadedUrls];

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ id_card_images: merged })
      .eq("id", tenantId);

    if (updateError) return { success: false, error: updateError.message };

    revalidatePath("/admin/tenants");
    return { success: true, urls: merged };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 6b. លុបរូប ID Card តែមួយ ─────────────────────────────────────────────────

export async function deleteIdCardImageAction(tenantId: string, url: string) {
  try {
    const supabase = await getSupabase();

    const path = url.split("/tenants/").pop();
    if (!path) return { success: false, error: "Invalid URL" };

    const { error: removeError } = await supabase.storage
      .from("tenants")
      .remove([path]);

    if (removeError) return { success: false, error: removeError.message };

    const { data: profile } = await supabase
      .from("profiles")
      .select("id_card_images")
      .eq("id", tenantId)
      .single();

    const updated = (profile?.id_card_images ?? []).filter(
      (u: string) => u !== url,
    );

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ id_card_images: updated.length > 0 ? updated : null })
      .eq("id", tenantId);

    if (updateError) return { success: false, error: updateError.message };

    revalidatePath("/admin/tenants");
    return { success: true, urls: updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}
