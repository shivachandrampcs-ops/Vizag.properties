import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import {
  properties,
  propertyImages,
  leads,
} from "@/db/schema";
import { eq, count, desc, sql } from "drizzle-orm";
import {
  DashboardShell,
  builderNavItems,
} from "@/components/dashboard-shell";
import {
  Building2,
  Users,
  Eye,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BuilderDashboard() {
  const session = await getSession();
  if (!session || session.role !== "builder") {
    redirect("/login/builder");
  }

  // Get builder properties and leads
  const myProperties = await db
    .select()
    .from(properties)
    .where(eq(properties.builderId, session.id))
    .orderBy(desc(properties.createdAt));

  const myLeads = await db
    .select({ lead: leads, property: properties })
    .from(leads)
    .leftJoin(properties, eq(leads.propertyId, properties.id))
    .where(
      sql`${leads.assignedBuilderId} = ${session.id} OR ${properties.builderId} = ${session.id}`
    )
    .orderBy(desc(leads.createdAt))
    .limit(10);

  const totalViews = myProperties.reduce((sum, p) => sum + (p.views ?? 0), 0);
  const newLeads = myLeads.filter((l) => l.lead.status === "new").length;

  const stats = [
    {
      label: "My Properties",
      value: myProperties.length,
      icon: Building2,
      color: "from-brand-500 to-brand-700",
    },
    {
      label: "Total Leads",
      value: myLeads.length,
      icon: Users,
      color: "from-green-500 to-green-700",
    },
    {
      label: "New Leads",
      value: newLeads,
      icon: Sparkles,
      color: "from-amber-500 to-amber-700",
    },
    {
      label: "Total Views",
      value: totalViews.toLocaleString("en-IN"),
      icon: Eye,
      color: "from-purple-500 to-purple-700",
    },
  ];

  return (
    <DashboardShell
      title="Builder Dashboard"
      user={{ name: session.name, email: session.email, role: "Builder" }}
      navItems={builderNavItems}
    >
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Welcome back, {session.name}
        </h1>
        <p className="mt-1 text-slate-600">
          Manage your properties, view leads and grow your business in Vizag.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
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

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/dashboard/builder/properties/new"
          className="group p-5 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white hover:shadow-xl transition-all"
        >
          <Building2 className="h-7 w-7" />
          <h3 className="mt-3 text-lg font-bold">Add New Property</h3>
          <p className="mt-1 text-sm text-brand-100">
            List a new apartment, villa, plot or commercial property.
          </p>
          <div className="mt-3 text-sm font-semibold flex items-center gap-1">
            Add Property
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link
          href="/dashboard/builder/leads"
          className="group p-5 rounded-2xl bg-white border border-slate-200 hover:shadow-xl transition-all"
        >
          <Users className="h-7 w-7 text-green-600" />
          <h3 className="mt-3 text-lg font-bold text-slate-900">
            View Leads ({newLeads} new)
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            See enquiries from interested property buyers.
          </p>
          <div className="mt-3 text-sm font-semibold text-brand-600 flex items-center gap-1">
            View Leads
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Properties */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Properties</h2>
          <Link
            href="/dashboard/builder/properties"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View All →
          </Link>
        </div>
        {myProperties.length === 0 ? (
          <div className="p-10 text-center">
            <Building2 className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="mt-3 text-slate-600">No properties yet</p>
            <Link
              href="/dashboard/builder/properties/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700"
            >
              <Building2 className="h-4 w-4" />
              Add Your First Property
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myProperties.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/properties/${p.slug}`}
                    target="_blank"
                    className="font-semibold text-slate-900 hover:text-brand-600 line-clamp-1"
                  >
                    {p.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span>{p.location}</span>
                    <span>•</span>
                    <span className="font-semibold text-brand-700">
                      {formatPrice(p.price)}
                    </span>
                    <span>•</span>
                    <span>{p.views} views</span>
                  </div>
                </div>
                <Link
                  href={`/dashboard/builder/properties/${p.id}/edit`}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Leads */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Leads</h2>
          <Link
            href="/dashboard/builder/leads"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View All →
          </Link>
        </div>
        {myLeads.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="mt-3 text-slate-600">No leads yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myLeads.slice(0, 5).map(({ lead, property }) => (
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
