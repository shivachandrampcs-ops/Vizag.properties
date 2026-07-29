"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Plus,
  ListChecks,
  UserCog,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type DashNavItem = {
  href: string;
  label: string;
  icon: any;
};

export function DashboardShell({
  title,
  user,
  navItems,
  children,
}: {
  title: string;
  user: { name: string; email: string; role: string };
  navItems: DashNavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
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
              <div className="text-sm font-semibold text-slate-900">
                {user.name}
              </div>
              <div className="text-xs text-slate-500">{user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
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
                  {item.label}
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

export const builderNavItems: DashNavItem[] = [
  { href: "/dashboard/builder", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/builder/properties", label: "My Properties", icon: Building2 },
  { href: "/dashboard/builder/properties/new", label: "Add Property", icon: Plus },
  { href: "/dashboard/builder/leads", label: "Leads", icon: Users },
  { href: "/dashboard/builder/profile", label: "Profile", icon: UserCog },
];

export const adminNavItems: DashNavItem[] = [
  { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/admin/builders", label: "Builders", icon: Building2 },
  { href: "/dashboard/admin/properties", label: "Properties", icon: ListChecks },
  { href: "/dashboard/admin/leads", label: "Leads", icon: Users },
];
