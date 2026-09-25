import Image from "next/image";
import {
  DashboardShell,
  adminNavItems,
} from "@/components/dashboard-shell";
import { requireAdminPage } from "@/lib/page-guards";
import { getAllAccounts, getDashboardStats } from "@/lib/queries";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { AccountVerificationToggle } from "@/components/account-verification-toggle";
import { AccountTypeBadge } from "@/components/moderation-badge";
import { Building2, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Users & Verification | Admin | Vizag Properties",
  robots: { index: false, follow: false },
};

const TYPE_FILTERS = [
  { key: "", label: "All" },
  { key: "builder", label: "Builders" },
  { key: "owner", label: "Owners" },
  { key: "agent", label: "Agents" },
];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const { session } = await requireAdminPage();
  const sp = await searchParams;
  const type = sp.type ?? "";
  const q = sp.q?.trim().toLowerCase();

  const [accounts, stats] = await Promise.all([
    getAllAccounts(),
    getDashboardStats(),
  ]);

  const filtered = accounts.filter((a) => {
    if (type && a.publisherType !== type) return false;
    if (
      q &&
      !`${a.name} ${a.email} ${a.companyName ?? ""} ${a.phone}`
        .toLowerCase()
        .includes(q)
    ) {
      return false;
    }
    return true;
  });

  const counts = await Promise.all(
    filtered.map(async (a) => {
      const [row] = await db
        .select({ value: count() })
        .from(properties)
        .where(eq(properties.builderId, a.id));
      return { id: a.id, count: Number(row?.value ?? 0) };
    })
  );
  const countMap = new Map(counts.map((c) => [c.id, c.count]));

  return (
    <DashboardShell
      title="Admin Dashboard"
      user={{ name: session.name, email: session.email, role: "Admin" }}
      navItems={adminNavItems}
      pendingApprovals={stats.pendingApprovals}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Users &amp; Verification
        </h1>
        <p className="mt-1 text-slate-600">
          {accounts.length} accounts registered — builders, property owners and
          agents.
        </p>
      </div>

      <form
        method="get"
        className="mb-5 flex flex-col sm:flex-row gap-2 sm:items-center"
      >
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((f) => (
            <a
              key={f.label}
              href={`/dashboard/admin/users?type=${f.key}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                (f.key || "") === type
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </a>
          ))}
        </div>
        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search name, email or phone"
            className="pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input type="hidden" name="type" value={type} />
        </div>
      </form>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="mt-3 text-lg font-bold text-slate-900">
            No accounts found
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col"
            >
              <div className="flex items-start gap-3">
                {a.logo ? (
                  <Image
                    src={a.logo}
                    alt={a.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-lg">
                    {a.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-slate-900 line-clamp-1">
                      {a.name}
                    </h3>
                    <AccountTypeBadge
                      type={a.publisherType}
                      isVerified={Boolean(a.isVerified)}
                    />
                  </div>
                  {a.companyName && (
                    <div className="text-xs text-slate-600 truncate">
                      {a.companyName}
                    </div>
                  )}
                  <div className="text-xs text-slate-500 truncate">
                    {a.email}
                  </div>
                  <div className="text-xs text-slate-500">{a.phone}</div>
                  {a.whatsappNumber && (
                    <div className="text-xs text-slate-500">
                      WhatsApp: {a.whatsappNumber}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <div className="text-xs text-slate-500">Properties</div>
                  <div className="text-lg font-bold text-slate-900">
                    {countMap.get(a.id) ?? 0}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <div className="text-xs text-slate-500">Joined</div>
                  <div className="text-sm font-bold text-slate-900">
                    {new Date(a.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span
                  className={`px-2 py-0.5 rounded-full font-semibold ${
                    a.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {a.isActive ? "Active" : "Inactive"}
                </span>
                <span className="text-slate-500">
                  {a.locality ? `${a.locality}, ` : ""}
                  {a.city ?? "Visakhapatnam"}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <AccountVerificationToggle
                  accountId={a.id}
                  isVerified={Boolean(a.isVerified)}
                  isActive={Boolean(a.isActive)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
