import {
  DashboardShell,
  sellerNavItems,
} from "@/components/dashboard-shell";
import { requireSellerPage } from "@/lib/page-guards";
import { getSellerLeads } from "@/lib/queries";
import { Users, Phone, Mail, MessageCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { PUBLISHER_DASHBOARD_TITLE } from "@/lib/publishers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Leads | Vizag Properties",
  robots: { index: false, follow: false },
};

export default async function SellerLeadsPage() {
  const { account } = await requireSellerPage();
  const accountType = account.publisherType ?? "builder";

  // Only leads for this account's properties (or assigned to this account).
  const leadRows = await getSellerLeads(account.id);

  return (
    <DashboardShell
      title={PUBLISHER_DASHBOARD_TITLE[accountType]}
      user={{
        name: account.name,
        email: account.email,
        role: accountType,
        publisherType: accountType,
        isVerified: Boolean(account.isVerified),
      }}
      navItems={sellerNavItems}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Leads</h1>
        <p className="mt-1 text-slate-600">
          Enquiries from buyers interested in your published properties.{" "}
          {leadRows.length} total.
        </p>
      </div>

      {leadRows.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center">
          <Users className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="mt-3 text-lg font-bold text-slate-900">No leads yet</h3>
          <p className="mt-1 text-slate-600">
            Leads will appear here when customers enquire about your published
            properties.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {leadRows.map(({ lead, property }) => (
              <div
                key={lead.id}
                className="p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900">{lead.name}</h3>
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
                      <a
                        href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-green-600 hover:text-green-700"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
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
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
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
