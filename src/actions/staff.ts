"use server";

import { requireAdmin } from "@/lib/supabase/server";

export async function getStaffAction() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "admin");
  if (error) return { success: false, data: [] };
  return { success: true, data };
}
