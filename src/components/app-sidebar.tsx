"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/actions/logout";
import {
  LayoutDashboard,
  BedDouble,
  Users,
  Receipt,
  Wrench,
  Settings,
  LogOut,
  Building2,
  ContactRound,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface User {
  email?: string;
}

const adminLinks = [
  { title: "ទិដ្ឋភាពទូទៅ", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "បន្ទប់ជួល", url: "/admin/rooms", icon: BedDouble },
  { title: "អ្នកជួល", url: "/admin/tenants", icon: Users },
  { title: "កិច្ចព្រមព្រៀង", url: "/admin/contracts", icon: ContactRound },
  { title: "ការទូទាត់", url: "/admin/billing", icon: Receipt },
  { title: "ថែទាំ", url: "/admin/maintenance", icon: Wrench },
  { title: "ការកំណត់", url: "/admin/settings", icon: Settings },
];

const tenantLinks = [
  { title: "ការគ្រប់គ្រង", url: "/tenant/overview", icon: LayoutDashboard },
  { title: "បន្ទប់របស់ខ្ញុំ", url: "/tenant/room", icon: BedDouble },
  { title: "វិក្កយបត្រ", url: "/tenant/invoices", icon: Receipt },
  { title: "ស្នើសុំជួសជុល", url: "/tenant/repair", icon: Wrench },
  { title: "ការកំណត់", url: "/tenant/settings", icon: Settings },
];
1;

export function AppSidebar({ user, role }: { user: User; role: string }) {
  const pathname = usePathname();

  const userEmail = user?.email || "guest@roommaster.com";
  const userInitials = userEmail.substring(0, 2).toUpperCase();
  const displayName = userEmail.split("@")[0];

  const navLinks = role === "admin" ? adminLinks : tenantLinks;

  return (
    <Sidebar
      variant="sidebar"
      className="border-r-0 *:data-[sidebar=sidebar]:bg-[#0f1629] *:data-[sidebar=sidebar]:border-r *:data-[sidebar=sidebar]:border-white/5"
    >
      {/* ── Brand ─────────────────────────────────── */}
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          {/* Logo badge */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-sky-500 shadow-lg shadow-indigo-500/30">
            <Building2 className="h-4.5 w-4.5 text-white" />
          </div>

          {/* Name + role */}
          <div className="leading-none">
            <p className="text-[15px] font-bold tracking-tight text-slate-100">
              RRMS
            </p>
            <p className="mt-0.5 text-[12px]  uppercase  text-indigo-400/70 font-bold">
              {role === "admin"
                ? "ផ្ទាំងគ្រប់គ្រងប្រព័ន្ធ"
                : "ប្រព័ន្ធព័ត៌មានអ្នកជួល"}
            </p>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Nav ───────────────────────────────────── */}
      <SidebarContent className="px-3">
        <SidebarGroup>
          {/* Section label */}
          <p className="mb-2 px-3 text-[12px] font-bold uppercase  text-indigo-400/50">
            {role === "admin" ? "ការគ្រប់គ្រង" : "គណនីរបស់ខ្ញុំ"}
          </p>

          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navLinks.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title} className="list-none">
                    <Link
                      href={item.url}
                      className={cn(
                        "group relative flex w-full items-center gap-3 rounded-xl px-4 py-2 text-[13.5px] font-medium transition-all duration-150",
                        isActive
                          ? "bg-indigo-500/20 text-white ring-1 ring-indigo-500/30"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive
                            ? "text-indigo-400"
                            : "text-slate-500 group-hover:text-slate-300",
                        )}
                      />
                      <span className="flex-1">{item.title}</span>

                      {/* Active indicator dot */}
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_2px_rgba(99,102,241,0.5)]" />
                      )}
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer ────────────────────────────────── */}
      <SidebarFooter className="px-3 pb-4">
        {/* Divider */}
        <div className="mb-3 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

        {/* User card */}
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/3 px-4 py-2 backdrop-blur-sm">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarFallback className="rounded-lg bg-linear-to-br from-indigo-500 to-sky-500 text-[11px] font-bold text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold capitalize text-slate-200">
              {displayName}
            </p>
            <p className="truncate text-[12px] text-slate-500">{userEmail}</p>
          </div>
        </div>

        {/* Sign out */}
        <form action={logoutAction} className="mt-1">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 rounded-xl px-4 text-[13px] font-medium text-slate-500 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>ចាកចេញ</span>
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
