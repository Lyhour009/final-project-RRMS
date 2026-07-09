"use server";

import { createActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const supabase = await createActionClient();
  await supabase.auth.signOut();
  redirect("/login");
}
