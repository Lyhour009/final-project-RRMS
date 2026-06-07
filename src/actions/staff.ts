import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

async function getSupabase() {
  const cookiesStore = await cookies();
  return await createClient(cookiesStore);
}

export async function getStaffAction() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "admin");
  if (error) return { success: false, data: [] };
  return { success: true, data };
}
