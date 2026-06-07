import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { AmbientBackground } from "@/components/shared/ui";
import HomeNavbar from "@/components/home/navbar";
import HeroSection from "@/components/home/hero";
import FeaturesSection from "@/components/home/feature";
import { TenantCTA } from "@/components/home/tenant-cta";

async function getSession() {
  const cookiesStore = await cookies();
  const supabase = await createClient(cookiesStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user;
}

export default async function HomePage() {
  const isLoggedIn = await getSession();

  return (
    <div className="min-h-screen bg-slate-950 font-khmer text-white overflow-x-hidden">
      <AmbientBackground />
      <HomeNavbar isLoggedIn={isLoggedIn} />
      <HeroSection isLoggedIn={isLoggedIn} />
      <FeaturesSection />
      <TenantCTA isLoggedIn={isLoggedIn} />
      {/* <HomeFooter /> */}
    </div>
  );
}
