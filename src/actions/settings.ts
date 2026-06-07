"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type {
  ProfileSettings,
  PasswordSettings,
  PropertySettings,
  BillingSettings,
} from "@/types/setting";

async function getSupabase() {
  const cookiesStore = await cookies();
  return await createClient(cookiesStore);
}

// ── 1. ទាញយក Profile Admin បច្ចុប្បន្ន ──────────────────────────────────────
export async function getAdminProfileAction() {
  try {
    const supabase = await getSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return { success: false, data: null };

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone_number, role")
      .eq("id", user.id)
      .single();

    if (error) return { success: false, data: null, error: error.message };

    return {
      success: true,
      data: {
        ...data,
        email: user.email ?? "",
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, data: null, error: msg };
  }
}

// ── 2. Update Profile Admin ───────────────────────────────────────────────────
export async function updateProfileAction(payload: ProfileSettings) {
  try {
    const supabase = await getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "មិនបានចូលប្រព័ន្ធ។" };

    // Update profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: payload.fullName.trim(),
        phone_number: payload.phoneNumber.trim(),
      })
      .eq("id", user.id);

    if (profileError) return { success: false, error: profileError.message };

    // Update email in auth if changed
    if (payload.email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: payload.email,
      });
      if (emailError) return { success: false, error: emailError.message };
    }

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 3. ផ្លាស់ប្តូរ Password ───────────────────────────────────────────────────
export async function updatePasswordAction(payload: PasswordSettings) {
  try {
    const supabase = await getSupabase();

    // Verify current password by re-signing in
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return { success: false, error: "មិនបានចូលប្រព័ន្ធ។" };

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: payload.currentPassword,
    });
    if (signInError)
      return { success: false, error: "លេខសម្ងាត់បច្ចុប្បន្នមិនត្រឹមត្រូវ។" };

    // Update to new password
    const { error } = await supabase.auth.updateUser({
      password: payload.newPassword,
    });
    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 4. ទាញយក Property Settings ───────────────────────────────────────────────
// Stored in a single-row "settings" table
export async function getPropertySettingsAction() {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("key", "property")
      .single();

    if (error) return { success: false, data: null };
    return { success: true, data: data?.value ?? null };
  } catch {
    return { success: false, data: null };
  }
}

// ── 5. Update Property Settings ──────────────────────────────────────────────
export async function updatePropertySettingsAction(payload: PropertySettings) {
  try {
    const supabase = await getSupabase();

    const { error } = await supabase
      .from("settings")
      .upsert({ key: "property", value: payload }, { onConflict: "key" });

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 6. ទាញយក Billing Settings ────────────────────────────────────────────────
export async function getBillingSettingsAction() {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("key", "billing")
      .single();

    if (error) return { success: false, data: null };
    return { success: true, data: data?.value ?? null };
  } catch {
    return { success: false, data: null };
  }
}

// ── 7. Update Billing Settings ────────────────────────────────────────────────
export async function updateBillingSettingsAction(payload: BillingSettings) {
  try {
    const supabase = await getSupabase();

    const { error } = await supabase
      .from("settings")
      .upsert({ key: "billing", value: payload }, { onConflict: "key" });

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}
