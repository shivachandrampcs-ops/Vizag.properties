import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAllLeads } from "@/lib/queries";
import {
  DashboardShell,
  adminNavItems,
} from "@/components/dashboard-shell";
import { Users, Phone, Mail } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { LeadStatusSelect } from "@/components/lead-status-select";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage Leads | Admin | Vizag Properties",
  robots: { index: false, follow: false },
};

export default async function AdminLeadsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login/admin");
  }

  const leads = await getAllLeads();

  return (
    <DashboardShell
      title="Admin Dashboard"
      user={{ name: session.name, email: session.email, role: "Admin" }}
      navItems={adminNavItems}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Manage Leads
        </h1>
        <p className="mt-1 text-slate-600">
          {leads.length} total leads. Update status to track progress.
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center">
          <Users className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="mt-3 text-lg font-bold text-slate-900">No leads yet</h3>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {leads.map(({ lead, property, builder }) => (
              <div key={lead.id} className="p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900">{lead.name}</h3>
                      <LeadStatusSelect
                        leadId={lead.id}
                        currentStatus={lead.status}
                      />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-1 hover:text-brand-600"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {lead.phone}
                      </a>
                      <a
                        href={`mailto:${lead.email}`}
                        className="flex items-center gap-1 hover:text-brand-600"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {lead.email}
                      </a>
                    </div>
                    {property && (
                      <div className="mt-2 text-sm">
                        <span className="text-slate-500">Property: </span>
                        <span className="font-semibold text-slate-900">
                          {property.title}
                        </span>
                        <span className="ml-2 text-brand-700 font-semibold">
                          {formatPrice(property.price)}
                        </span>
                      </div>
                    )}
                    {builder && (
                      <div className="mt-1 text-xs text-slate-500">
                        Builder: {builder.name}
                      </div>
                    )}
                    {lead.message && (
                      <p className="mt-2 text-sm text-slate-700 bg-slate-50 rounded-lg p-3">
                        &ldquo;{lead.message}&rdquo;
                      </p>
                    )}
                    {lead.budget && (
                      <div className="mt-2 text-xs text-slate-500">
                        Budget:{" "}
                        <span className="font-semibold text-slate-700">
                          {lead.budget}
                        </span>
                        {lead.preferredLocation && (
                          <>
                            {" "}• Location:{" "}
                            <span className="font-semibold text-slate-700">
                              {lead.preferredLocation}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(lead.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
