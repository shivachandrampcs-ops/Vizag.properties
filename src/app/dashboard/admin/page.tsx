import Link from "next/link";
import {
  DashboardShell,
  adminNavItems,
} from "@/components/dashboard-shell";
import { requireAdminPage } from "@/lib/page-guards";
import { getDashboardStats, getAllLeads, getAllAccounts } from "@/lib/queries";
import {
  Building2,
  Users,
  Home,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard | Vizag Properties",
  robots: { index: false, follow: false },
};

export default async function AdminDashboard() {
  const { session } = await requireAdminPage();

  const [stats, leads, accounts] = await Promise.all([
    getDashboardStats(),
    getAllLeads(),
    getAllAccounts(),
  ]);

  const statsCards = [
    {
      label: "Live Properties",
      value: stats.totalProperties,
      icon: Home,
      color: "from-brand-500 to-brand-700",
    },
    {
      label: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: ShieldCheck,
      color: "from-amber-500 to-amber-700",
    },
    {
      label: "Total Leads",
      value: stats.totalLeads,
      icon: Users,
      color: "from-green-500 to-green-700",
    },
    {
      label: "New Leads",
      value: stats.newLeads,
      icon: Sparkles,
      color: "from-purple-500 to-purple-700",
    },
  ];

  return (
    <DashboardShell
      title="Admin Dashboard"
      user={{ name: session.name, email: session.email, role: "Admin" }}
      navItems={adminNavItems}
      pendingApprovals={stats.pendingApprovals}
    >
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-slate-600">Vizag Properties admin panel</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="p-5 rounded-2xl bg-white border border-slate-200"
            >
              <div
                className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900">
                {s.value}
              </div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/dashboard/admin/approvals"
          className="group p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white hover:shadow-xl transition-all"
        >
          <ShieldCheck className="h-7 w-7" />
          <h3 className="mt-3 text-lg font-bold">Property Approvals</h3>
          <p className="mt-1 text-sm text-amber-100">
            {stats.pendingApprovals} waiting for review
          </p>
          <div className="mt-3 text-sm font-semibold flex items-center gap-1">
            Review now
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link
          href="/dashboard/admin/leads"
          className="group p-5 rounded-2xl bg-white border border-slate-200 hover:shadow-xl transition-all"
        >
          <Users className="h-7 w-7 text-amber-600" />
          <h3 className="mt-3 text-lg font-bold text-slate-900">Manage Leads</h3>
          <p className="mt-1 text-sm text-slate-600">
            {stats.newLeads} new enquiries
          </p>
          <div className="mt-3 text-sm font-semibold text-brand-600 flex items-center gap-1">
            View All
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link
          href="/dashboard/admin/users"
          className="group p-5 rounded-2xl bg-white border border-slate-200 hover:shadow-xl transition-all"
        >
          <Building2 className="h-7 w-7 text-brand-600" />
          <h3 className="mt-3 text-lg font-bold text-slate-900">
            Users &amp; Verification
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {accounts.length} accounts registered
          </p>
          <div className="mt-3 text-sm font-semibold text-brand-600 flex items-center gap-1">
            Manage Users
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Leads</h2>
          <Link
            href="/dashboard/admin/leads"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View All →
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {leads.slice(0, 5).map(({ lead, property }) => (
            <div key={lead.id} className="p-4 hover:bg-slate-50">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <div className="font-semibold text-slate-900">
                    {lead.name}
                  </div>
                  <div className="text-xs text-slate-500">{lead.phone}</div>
                </div>
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    lead.status === "new"
                      ? "bg-blue-100 text-blue-700"
                      : lead.status === "contacted"
                      ? "bg-amber-100 text-amber-700"
                      : lead.status === "qualified"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {lead.status}
                </span>
              </div>
              {property && (
                <div className="mt-1 text-xs text-slate-500">
                  {property.title} • {property.location}
                </div>
              )}
            </div>
          ))}
          {leads.length === 0 && (
            <div className="p-10 text-center text-slate-500 text-sm">
              No leads yet.
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
