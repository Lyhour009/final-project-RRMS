"use server";

// 1. Change this import to use your SERVER client
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export async function logoutAction() {
  const cookiesStore = await cookies();
  const supabase = await createClient(cookiesStore);

  // 2. This will now successfully clear the cookies via server headers
  await supabase.auth.signOut();

  // 3. Redirect the user back to the login page
  redirect("/");
}
