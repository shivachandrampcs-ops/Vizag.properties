import Link from "next/link";
import Image from "next/image";
import {
  DashboardShell,
  adminNavItems,
} from "@/components/dashboard-shell";
import { requireAdminPage } from "@/lib/page-guards";
import { getAdminProperties, getDashboardStats } from "@/lib/queries";
import { Home, ExternalLink, Eye, Plus, Edit } from "lucide-react";
import { formatPrice, statusLabel } from "@/lib/utils";
import { DeletePropertyButton } from "@/components/delete-property-button";
import { ModerationBadge, AccountTypeBadge } from "@/components/moderation-badge";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage Properties | Admin | Vizag Properties",
  robots: { index: false, follow: false },
};

export default async function AdminPropertiesPage() {
  const { session } = await requireAdminPage();

  const [allProperties, stats] = await Promise.all([
    getAdminProperties(),
    getDashboardStats(),
  ]);

  return (
    <DashboardShell
      title="Admin Dashboard"
      user={{ name: session.name, email: session.email, role: "Admin" }}
      navItems={adminNavItems}
      pendingApprovals={stats.pendingApprovals}
    >
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Manage Properties
          </h1>
          <p className="mt-1 text-slate-600">
            {allProperties.length} properties (all moderation states)
          </p>
        </div>
        <Link
          href="/dashboard/admin/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Add Property
        </Link>
      </div>

      {allProperties.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center">
          <Home className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="mt-3 text-lg font-bold text-slate-900">
            No properties yet
          </h3>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Listed by
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="text-right p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allProperties.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          {p.coverImage && (
                            <Image
                              src={p.coverImage}
                              alt={p.title}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 line-clamp-1 max-w-xs">
                            {p.title}
                          </div>
                          <div className="text-xs text-slate-500">
                            {p.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-700">
                      <div>{p.seller.name}</div>
                      <AccountTypeBadge
                        type={p.seller.publisherType}
                        isVerified={p.seller.isVerified}
                      />
                    </td>
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
                    <td className="p-4 text-sm text-slate-700 flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      {p.views}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
