import Link from "next/link";
import Image from "next/image";
import {
  DashboardShell,
  sellerNavItems,
} from "@/components/dashboard-shell";
import { requireSellerPage } from "@/lib/page-guards";
import { getSellerProperties } from "@/lib/queries";
import { DeletePropertyButton } from "@/components/delete-property-button";
import { ModerationBadge } from "@/components/moderation-badge";
import { formatPrice, statusLabel } from "@/lib/utils";
import {
  Building2,
  Plus,
  Edit,
  ExternalLink,
  Eye,
  AlertTriangle,
  Send,
} from "lucide-react";
import { PUBLISHER_DASHBOARD_TITLE } from "@/lib/publishers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Properties | Vizag Properties",
  robots: { index: false, follow: false },
};

export default async function SellerPropertiesPage() {
  const { account } = await requireSellerPage();
  const list = await getSellerProperties(account.id);
  const accountType = account.publisherType ?? "builder";

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
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            My Properties
          </h1>
          <p className="mt-1 text-slate-600">
            {list.length} {list.length === 1 ? "property" : "properties"} •{" "}
            {list.filter((p) => p.moderationStatus === "approved").length}{" "}
            published
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

      {list.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="mt-3 text-lg font-bold text-slate-900">
            No properties yet
          </h3>
          <p className="mt-1 text-slate-600">
            Add your first property and send it for review.
          </p>
          <Link
            href="/dashboard/seller/properties/new"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Add Property
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl bg-white border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Engagement
                    </th>
                    <th className="text-right p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {list.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                            {p.coverImage && (
                              <Image
                                src={p.coverImage}
                                alt={p.title}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 line-clamp-1 max-w-xs">
                              {p.title}
                            </div>
                            <div className="text-xs text-slate-500">
                              {p.bedrooms ?? 0} BHK • {p.area} sqft
                            </div>
                            {p.moderationStatus === "rejected" &&
                              p.rejectionReason && (
                                <p className="mt-1 text-xs text-red-600 line-clamp-2 max-w-xs">
                                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                                  {p.rejectionReason}
                                </p>
                              )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-700">{p.location}</td>
                      <td className="p-4 text-sm font-semibold text-brand-700">
                        {formatPrice(p.price)}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <ModerationBadge
                            status={p.moderationStatus}
                            isActive={p.isActive}
                          />
                          <span className="text-xs text-slate-500">
                            {statusLabel(p.status)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3 text-sm text-slate-700">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5 text-slate-400" />
                            {p.views}
                          </span>
                          <span>{p.leadCount} leads</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {p.moderationStatus === "approved" && p.isActive && (
                            <Link
                              href={`/properties/${p.slug}`}
                              target="_blank"
                              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                              title="View public page"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          )}
                          {(p.moderationStatus === "draft" ||
                            p.moderationStatus === "rejected") && (
                            <Link
                              href={`/dashboard/seller/properties/${p.id}/edit?resubmit=1`}
                              className="p-2 rounded-lg hover:bg-brand-50 text-brand-600"
                              title="Submit for review"
                            >
                              <Send className="h-4 w-4" />
                            </Link>
                          )}
                          <Link
                            href={`/dashboard/seller/properties/${p.id}/edit`}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <DeletePropertyButton
                            id={p.id}
                            apiPath={`/api/seller/properties/${p.id}`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {list.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden"
              >
                <div className="flex gap-3 p-3">
                  <div className="relative h-20 w-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    {p.coverImage && (
                      <Image
                        src={p.coverImage}
                        alt={p.title}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900 line-clamp-2 text-sm">
                      {p.title}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {p.location} • {p.bedrooms ?? 0} BHK
                    </div>
                    <div className="mt-1 text-sm font-bold text-brand-700">
                      {formatPrice(p.price)}
                    </div>
                    <div className="mt-2">
                      <ModerationBadge
                        status={p.moderationStatus}
                        isActive={p.isActive}
                      />
                    </div>
                  </div>
                </div>

                {p.moderationStatus === "rejected" && p.rejectionReason && (
                  <div className="mx-3 mb-3 rounded-lg bg-red-50 border border-red-200 p-2.5">
                    <p className="text-xs font-semibold text-red-800">
                      Rejection reason
                    </p>
                    <p className="text-xs text-red-700 mt-0.5">
                      {p.rejectionReason}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {p.views}
                    </span>
                    <span>{p.leadCount} leads</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {p.moderationStatus === "approved" && p.isActive && (
                      <Link
                        href={`/properties/${p.slug}`}
                        target="_blank"
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                        title="View"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    )}
                    {(p.moderationStatus === "draft" ||
                      p.moderationStatus === "rejected") && (
                      <Link
                        href={`/dashboard/seller/properties/${p.id}/edit?resubmit=1`}
                        className="p-2 rounded-lg hover:bg-brand-50 text-brand-600"
                        title="Submit for review"
                      >
                        <Send className="h-4 w-4" />
                      </Link>
                    )}
                    <Link
                      href={`/dashboard/seller/properties/${p.id}/edit`}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <DeletePropertyButton
                      id={p.id}
                      apiPath={`/api/seller/properties/${p.id}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardShell>
  );
}
