"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/actions/logout";
import {
  LayoutDashboard,
  Receipt,
  Wrench,
  Settings,
  LogOut,
  Building2,
  CreditCard,
  FileText,
  Home,
  ReceiptText,
  FileSignature,
  Wallet,
  ClipboardList,
  UsersRound,
  Files,
  User,
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
  {
    title: "ផ្ទាំងគ្រប់គ្រង",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "ការគ្រប់គ្រងបន្ទប់",
    url: "/admin/rooms",
    icon: Building2,
  },
  {
    title: "អ្នកជួល",
    url: "/admin/tenants",
    icon: UsersRound,
  },
  {
    title: "កិច្ចសន្យាជួល",
    url: "/admin/contracts",
    icon: FileSignature,
  },
  {
    title: "វិក្កយបត្រ",
    url: "/admin/billing",
    icon: ReceiptText,
  },
  {
    title: "ការទូទាត់",
    url: "/admin/payments",
    icon: Wallet,
  },
  {
    title: "របាយការណ័",
    url: "/admin/reports",
    icon: Files,
  },
  {
    title: "សំណើជួសជុល",
    url: "/admin/maintenance",
    icon: ClipboardList,
  },
  {
    title: "ការកំណត់",
    url: "/admin/settings",
    icon: Settings,
  },
  { title: "គណនីរបស់ខ្ញុំ", url: "/profile", icon: User },
];

export const tenantLinks = [
  {
    title: "ផ្ទាំងគ្រប់គ្រង",
    url: "/tenant/dashboard",
    icon: Home,
  },
  {
    title: "កិច្ចសន្យារបស់ខ្ញុំ",
    url: "/tenant/contracts",
    icon: FileText,
  },
  {
    title: "វិក្កយបត្រ",
    url: "/tenant/bills",
    icon: Receipt,
  },
  {
    title: "ប្រវត្តិការទូទាត់",
    url: "/tenant/payments",
    icon: CreditCard,
  },
  {
    title: "សំណើជួសជុល",
    url: "/tenant/maintenance",
    icon: Wrench,
  },
  { title: "គណនីរបស់ខ្ញុំ", url: "/profile", icon: User },
  // {
  //   title: "ការកំណត់",
  //   url: "/tenant/settings",
  //   icon: Settings,
  // },
];

export function AppSidebar({ user, role }: { user: User; role: string }) {
  const pathname = usePathname();

  const userEmail = user?.email || "guest@roommaster.com";
  const userInitials = userEmail.substring(0, 2).toUpperCase();
  const displayName = userEmail.split("@")[0];

  const preferredOrder = role === "admin"
    ? [
        "/admin/dashboard",
        "/admin/rooms",
        "/admin/tenants",
        "/admin/contracts",
        "/admin/billing",
        "/admin/payments",
        "/admin/maintenance",
        "/admin/reports",
        "/admin/settings",
      ]
    : [
        "/tenant/dashboard",
        "/tenant/bills",
        "/tenant/payments",
        "/tenant/contracts",
        "/tenant/maintenance",
      ];
  const sourceLinks = role === "admin" ? adminLinks : tenantLinks;
  const navLinks = sourceLinks
    .filter((item) => item.url !== "/profile")
    .toSorted((a, b) => preferredOrder.indexOf(a.url) - preferredOrder.indexOf(b.url));

  return (
    <Sidebar
      variant="sidebar"
      className="border-r-0 *:data-[sidebar=sidebar]:bg-(--panel-sidebar) *:data-[sidebar=sidebar]:border-r *:data-[sidebar=sidebar]:border-(--panel-border-subtle)"
    >
      {/* ── Brand ─────────────────────────────────── */}
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          {/* Logo badge */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-sky-500 shadow-lg shadow-indigo-500/30">
            <Building2 className="h-4.5 w-4.5 text-(--panel-text)" />
          </div>

          {/* Name + role */}
          <div className="leading-none">
            <p className="text-[15px] font-bold tracking-tight text-(--panel-text)">
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
                // Keep the parent section highlighted while viewing nested
                // routes (for example, a bill's payment form). Exact
                // equality leaves the navigation without an active item on
                // those pages.
                const isActive =
                  pathname === item.url || pathname.startsWith(`${item.url}/`);
                return (
                  <SidebarMenuItem key={item.title} className="list-none">
                    <Link
                      href={item.url}
                      className={cn(
                        "group relative flex w-full items-center gap-3 rounded-xl px-4 py-2 text-[13.5px] font-medium transition-all duration-150",
                        isActive
                          ? "bg-indigo-500/20 text-indigo-700 dark:text-white ring-1 ring-indigo-500/30"
                          : "text-(--panel-text-muted) hover:bg-(--panel-hover) hover:text-(--panel-text)",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive
                            ? "text-indigo-400"
                            : "text-(--panel-text-subtle) group-hover:text-(--panel-text-muted)",
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
        <div className="mb-3 h-px bg-(--panel-border-subtle)" />

        {/* User card */}
        <Link href="/profile" prefetch={false} className="flex items-center gap-3 rounded-xl border border-(--panel-border-subtle) bg-(--panel-hover) px-4 py-2 backdrop-blur-sm transition hover:border-indigo-500/30 hover:bg-indigo-500/10">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarFallback className="rounded-lg bg-linear-to-br from-indigo-500 to-sky-500 text-[11px] font-bold text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold capitalize text-(--panel-text)">
              {displayName}
            </p>
            <p className="truncate text-[12px] text-(--panel-text-subtle)">{userEmail}</p>
          </div>
        </Link>

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
