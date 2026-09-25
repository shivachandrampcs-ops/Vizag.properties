import Link from "next/link";
import Image from "next/image";
import {
  DashboardShell,
  adminNavItems,
} from "@/components/dashboard-shell";
import { requireAdminPage } from "@/lib/page-guards";
import { getAdminProperties, getDashboardStats } from "@/lib/queries";
import { ModerationActions } from "@/components/moderation-actions";
import { ModerationBadge, AccountTypeBadge } from "@/components/moderation-badge";
import { DeletePropertyButton } from "@/components/delete-property-button";
import { formatPrice } from "@/lib/utils";
import { ShieldCheck, ExternalLink, Edit, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Property Approvals | Admin | Vizag Properties",
  robots: { index: false, follow: false },
};

const TABS = [
  { key: "pending_review", label: "Pending Review" },
  { key: "draft", label: "Drafts" },
  { key: "rejected", label: "Rejected" },
  { key: "approved", label: "Approved" },
  { key: "", label: "All" },
];

export default async function AdminApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { session } = await requireAdminPage();
  const sp = await searchParams;
  const status = sp.status ?? "pending_review";
  const q = sp.q?.trim() || undefined;

  const [list, stats] = await Promise.all([
    getAdminProperties({ moderationStatus: status || undefined, search: q }),
    getDashboardStats(),
  ]);

  return (
    <DashboardShell
      title="Admin Dashboard"
      user={{ name: session.name, email: session.email, role: "Admin" }}
      navItems={adminNavItems}
      pendingApprovals={stats.pendingApprovals}
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 text-brand-600">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            Moderation
          </span>
        </div>
        <h1 className="mt-1 text-2xl md:text-3xl font-bold text-slate-900">
          Property Approvals
        </h1>
        <p className="mt-1 text-slate-600">
          {stats.pendingApprovals} propert
          {stats.pendingApprovals === 1 ? "y is" : "ies are"} waiting for review.
        </p>
      </div>

      {/* Filters */}
      <form
        method="get"
        className="mb-4 flex flex-col sm:flex-row gap-2 sm:items-center"
      >
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const active = (tab.key || "") === status;
            return (
              <Link
                key={tab.label}
                href={`/dashboard/admin/approvals?status=${tab.key}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  active
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search title or location"
            className="pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input type="hidden" name="status" value={status} />
        </div>
      </form>

      {list.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center">
          <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="mt-3 text-lg font-bold text-slate-900">
            Nothing to review here
          </h3>
          <p className="mt-1 text-slate-600">
            {status === "pending_review"
              ? "All caught up — new submissions will appear here."
              : "No properties match this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-4 p-4">
                <div className="relative h-32 sm:h-28 w-full sm:w-44 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  {p.coverImage ? (
                    <Image
                      src={p.coverImage}
                      alt={p.title}
                      fill
                      sizes="176px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 line-clamp-1">
                        {p.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <ModerationBadge
                          status={p.moderationStatus}
                          isActive={p.isActive}
                        />
                        <AccountTypeBadge
                          type={p.seller.publisherType}
                          isVerified={p.seller.isVerified}
                        />
                        <span className="text-xs text-slate-500">
                          {p.location}, {p.city}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-brand-700">
                        {formatPrice(p.price)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {p.area} sqft • {p.bedrooms ?? 0} BHK
                      </div>
                    </div>
                  </div>

                  <dl className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
                    <div>
                      <dt className="text-slate-500 inline">Submitted by: </dt>
                      <dd className="inline font-semibold text-slate-800">
                        {p.seller.name}
                        {p.seller.companyName
                          ? ` (${p.seller.companyName})`
                          : ""}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 inline">Email: </dt>
                      <dd className="inline text-slate-800">{p.seller.email}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 inline">Phone: </dt>
                      <dd className="inline text-slate-800">{p.seller.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 inline">Submitted: </dt>
                      <dd className="inline text-slate-800">
                        {p.submittedAt
                          ? new Date(p.submittedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 inline">RERA: </dt>
                      <dd className="inline text-slate-800">
                        {p.reraId || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 inline">Photos: </dt>
                      <dd className="inline text-slate-800">
                        {p.images.length}
                      </dd>
                    </div>
                  </dl>

                  {p.moderationStatus === "rejected" && p.rejectionReason && (
                    <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-2.5">
                      <p className="text-xs font-semibold text-red-800">
                        Rejection reason
                      </p>
                      <p className="text-xs text-red-700 mt-0.5">
                        {p.rejectionReason}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <ModerationActions
                      propertyId={p.id}
                      status={p.moderationStatus}
                      isActive={p.isActive}
                    />
                    <div className="ml-auto flex items-center gap-1">
                      {p.moderationStatus === "approved" && (
                        <Link
                          href={`/properties/${p.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                          title="View public page"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      <Link
                        href={`/dashboard/admin/properties/${p.id}/edit`}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeletePropertyButton
                        id={p.id}
                        apiPath={`/api/admin/properties/${p.id}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
