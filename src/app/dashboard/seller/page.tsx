import Link from "next/link";
import {
  DashboardShell,
  sellerNavItems,
} from "@/components/dashboard-shell";
import { requireSellerPage } from "@/lib/page-guards";
import { getSellerProperties, getSellerLeads, getSellerStats } from "@/lib/queries";
import { ModerationBadge, AccountTypeBadge } from "@/components/moderation-badge";
import { formatPrice } from "@/lib/utils";
import {
  Building2,
  Users,
  Eye,
  Sparkles,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { PUBLISHER_DASHBOARD_TITLE, publisherTypeShort } from "@/lib/publishers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard | Vizag Properties",
  robots: { index: false, follow: false },
};

export default async function SellerDashboardPage() {
  const { account } = await requireSellerPage();

  const [list, leads, stats] = await Promise.all([
    getSellerProperties(account.id),
    getSellerLeads(account.id),
    getSellerStats(account.id),
  ]);

  const accountType = account.publisherType ?? "builder";
  const newLeads = leads.filter((l) => l.lead.status === "new").length;

  const cards = [
    {
      label: "My Properties",
      value: stats.total,
      icon: Building2,
      color: "from-brand-500 to-brand-700",
    },
    {
      label: "Pending Review",
      value: stats.pending,
      icon: Clock,
      color: "from-amber-500 to-amber-700",
    },
    {
      label: "Total Leads",
      value: leads.length,
      icon: Users,
      color: "from-green-500 to-green-700",
    },
    {
      label: "Total Views",
      value: stats.views.toLocaleString("en-IN"),
      icon: Eye,
      color: "from-purple-500 to-purple-700",
    },
  ];

  return (
    <DashboardShell
      title={PUBLISHER_DASHBOARD_TITLE[accountType]}
      user={{
        name: account.name,
        email: account.email,
        role: publisherTypeShort(accountType),
        publisherType: accountType,
        isVerified: Boolean(account.isVerified),
      }}
      navItems={sellerNavItems}
    >
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Welcome back, {account.name.split(" ")[0]}
            </h1>
            <AccountTypeBadge
              type={accountType}
              isVerified={Boolean(account.isVerified)}
            />
          </div>
          <p className="mt-1 text-slate-600">
            Manage your properties, enquiries and profile —{" "}
            {PUBLISHER_DASHBOARD_TITLE[accountType]}.
          </p>
        </div>
        <Link
          href="/dashboard/seller/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Add Property
        </Link>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {cards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:shadow-md transition-shadow"
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

      {/* Moderation breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <MiniStat
          icon={FileText}
          label="Drafts"
          value={stats.draft}
          className="text-slate-600"
        />
        <MiniStat
          icon={Clock}
          label="Pending review"
          value={stats.pending}
          className="text-amber-600"
        />
        <MiniStat
          icon={CheckCircle2}
          label="Published"
          value={stats.approved}
          className="text-green-600"
        />
        <MiniStat
          icon={XCircle}
          label="Rejected"
          value={stats.rejected}
          className="text-red-600"
        />
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/dashboard/seller/properties/new"
          className="group p-5 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white hover:shadow-xl transition-all"
        >
          <Building2 className="h-7 w-7" />
          <h3 className="mt-3 text-lg font-bold">Add New Property</h3>
          <p className="mt-1 text-sm text-brand-100">
            List an apartment, villa, plot, independent house or commercial
            space in Vizag.
          </p>
          <div className="mt-3 text-sm font-semibold flex items-center gap-1">
            Add Property
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link
          href="/dashboard/seller/leads"
          className="group p-5 rounded-2xl bg-white border border-slate-200 hover:shadow-xl transition-all"
        >
          <Users className="h-7 w-7 text-green-600" />
          <h3 className="mt-3 text-lg font-bold text-slate-900">
            View Leads ({newLeads} new)
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            See enquiries from buyers interested in your properties.
          </p>
          <div className="mt-3 text-sm font-semibold text-brand-600 flex items-center gap-1">
            View Leads
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent properties */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Properties</h2>
          <Link
            href="/dashboard/seller/properties"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View All →
          </Link>
        </div>
        {list.length === 0 ? (
          <div className="p-10 text-center">
            <Building2 className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="mt-3 text-slate-600">No properties yet</p>
            <Link
              href="/dashboard/seller/properties/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              Add Your First Property
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {list.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 line-clamp-1">
                      {p.title}
                    </span>
                    <ModerationBadge
                      status={p.moderationStatus}
                      isActive={p.isActive}
                    />
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                    <span>{p.location}</span>
                    <span>•</span>
                    <span className="font-semibold text-brand-700">
                      {formatPrice(p.price)}
                    </span>
                    <span>•</span>
                    <span>{p.views} views</span>
                    <span>•</span>
                    <span>{p.leadCount} leads</span>
                  </div>
                  {p.moderationStatus === "rejected" && p.rejectionReason && (
                    <p className="mt-1 text-xs text-red-600 line-clamp-2">
                      Rejected: {p.rejectionReason}
                    </p>
                  )}
                </div>
                <Link
                  href={`/dashboard/seller/properties/${p.id}/edit`}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  {p.moderationStatus === "rejected" ? "Edit & Resubmit" : "Edit"}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent leads */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Leads</h2>
          <Link
            href="/dashboard/seller/leads"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View All →
          </Link>
        </div>
        {leads.length === 0 ? (
          <div className="p-10 text-center">
            <Sparkles className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="mt-3 text-slate-600">No leads yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Leads appear here when buyers enquire about your published
              properties.
            </p>
          </div>
        ) : (
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
                    Interested in:{" "}
                    <span className="text-slate-700">{property.title}</span>
                  </div>
                )}
                {lead.message && (
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                    &ldquo;{lead.message}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Clock;
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white border border-slate-200 px-4 py-3">
      <Icon className={`h-4 w-4 ${className ?? "text-slate-500"}`} />
      <div>
        <div className="text-lg font-bold text-slate-900 leading-none">
          {value}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}
