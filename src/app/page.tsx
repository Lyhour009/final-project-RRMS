import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { LandingPageClient } from "@/components/landing/landing-page-client";

async function getUserRole() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return profile?.role || null;
}

export default async function HomePage() {
  const role = await getUserRole();

  return <LandingPageClient role={role} />;
}
