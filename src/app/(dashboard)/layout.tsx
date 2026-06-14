import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { getUserProfile } from "@/lib/supabase/server"; // 👉 Imported our helper
import { redirect } from "next/navigation"; // 👉 Imported redirect for security
import { NotificationBell } from "@/components/notification/notification-bell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Fetch the user profile using our clean helper function
  const userProfile = await getUserProfile();

  // 2. Route Protection: If no user is found, kick them out to the login page
  if (!userProfile) {
    redirect("/login");
  }

  // 3. Dynamic UI values based on the fetched profile
  const userEmail = userProfile.email || "no-user@roommaster.com";
  const userInitials = userEmail.substring(0, 2).toUpperCase();
  const displayName = userEmail.split("@")[0];
  const userRole = userProfile.role; // Fetched directly from our helper

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        {/* ── Sidebar ─────────────────────────────────── */}
        {/* Pass the complete userProfile and role to the sidebar */}
        <AppSidebar user={userProfile} role={userRole} />

        {/* ── Main shell ──────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* ── Top bar ───────────────────────────────── */}
          <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
            {/* Left: trigger + breadcrumb */}
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors" />
              <div className="hidden sm:flex items-center gap-1.5 text-[13px]">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {userRole === "admin" ? "Admin Panel" : "Tenant Panel"}
                </span>
              </div>
            </div>

            {/* Right: actions + avatar */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <NotificationBell />

              <ThemeToggle />

              {/* Divider */}
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

              {/* Avatar */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold select-none shadow-sm">
                  {userInitials}
                </div>
                <span className="hidden md:block text-[13px] font-medium text-slate-700 dark:text-slate-300 capitalize">
                  {displayName}
                </span>
              </div>
            </div>
          </header>

          {/* ── Page content ──────────────────────────── */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
