"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  LogOut,
  Menu,
  X,
  Home,
  Plus,
  ListChecks,
  UserCog,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import { useState, type ComponentType } from "react";
import { cn } from "@/lib/utils";
import { publisherTypeShort } from "@/lib/publishers";

export type DashNavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Renders a POST logout button instead of a link. */
  action?: "logout";
  badge?: number;
};

export function DashboardShell({
  title,
  user,
  navItems,
  pendingApprovals,
  children,
}: {
  title: string;
  user: {
    name: string;
    email: string;
    role: string;
    publisherType?: string;
    isVerified?: boolean;
  };
  navItems: DashNavItem[];
  /** Renders a counter badge on the "Property Approvals" item (admin). */
  pendingApprovals?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center">
                <Home className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 leading-none">
                  VizagProperties
                </div>
                <div className="text-[10px] text-slate-500 leading-none mt-0.5">
                  {title}
                </div>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-sm font-semibold text-slate-900">
                  {user.name}
                </span>
                {user.publisherType && user.role !== "Admin" && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-wide">
                    {user.isVerified && (
                      <BadgeCheck className="h-3 w-3 text-green-600" />
                    )}
                    {publisherTypeShort(user.publisherType)}
                  </span>
                )}
                {user.role === "Admin" && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wide">
                    <ShieldCheck className="h-3 w-3" />
                    Admin
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500">{user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">
                {loggingOut ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-white border-r border-slate-200 w-64 flex-shrink-0",
            "lg:block lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]",
            "fixed inset-y-16 left-0 z-20 transition-transform lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              if (item.action === "logout") {
                return (
                  <button
                    key={item.href}
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              }

              const badge =
                item.href === "/dashboard/admin/approvals"
                  ? (pendingApprovals ?? 0)
                  : (item.badge ?? 0);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {badge ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                      {badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay */}
        {open && (
          <div
            onClick={() => setOpen(false)}
            className="lg:hidden fixed inset-0 top-32 bg-slate-900/30 z-10"
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/** Shared by builders, property owners and real-estate agents. */
export const sellerNavItems: DashNavItem[] = [
  { href: "/dashboard/seller", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/seller/properties", label: "My Properties", icon: Building2 },
  { href: "/dashboard/seller/properties/new", label: "Add Property", icon: Plus },
  { href: "/dashboard/seller/leads", label: "Leads", icon: Users },
  { href: "/dashboard/seller/profile", label: "My Profile", icon: UserCog },
  { href: "#logout", label: "Logout", icon: LogOut, action: "logout" },
];

/** @deprecated Legacy alias of `sellerNavItems` (old /dashboard/builder paths). */
export const builderNavItems: DashNavItem[] = sellerNavItems.map((item) => ({
  ...item,
  href: item.href.replace("/dashboard/seller", "/dashboard/builder"),
}));

/**
 * Admin navigation.
 *
 * NOTE: this lives in a client module, so it must be imported as data only —
 * never *called* from a server component. Pass `pendingApprovals` to
 * <DashboardShell /> instead to render the approval counter badge.
 */
export const adminNavItems: DashNavItem[] = [
  { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/dashboard/admin/approvals",
    label: "Property Approvals",
    icon: ShieldCheck,
  },
    { href: "/dashboard/admin/properties", label: "Properties", icon: ListChecks },
    { href: "/dashboard/admin/users", label: "Users", icon: Building2 },
  { href: "/dashboard/admin/leads", label: "Leads", icon: Users },
  { href: "#logout", label: "Logout", icon: LogOut, action: "logout" },
];
