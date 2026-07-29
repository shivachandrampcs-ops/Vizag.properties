import { redirect } from "next/navigation";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { getAllBuilders } from "@/lib/queries";
import { db } from "@/db";
import { properties as propertiesTable } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import {
  DashboardShell,
  adminNavItems,
} from "@/components/dashboard-shell";
import { Building2, Award, CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage Builders | Admin | Vizag Properties",
  robots: { index: false, follow: false },
};

export default async function AdminBuildersPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login/admin");
  }

  const allBuilders = await getAllBuilders();

  // Count properties per builder
  const counts = await Promise.all(
    allBuilders.map(async (b) => {
      const [c] = await db
        .select({ value: count() })
        .from(propertiesTable)
        .where(eq(propertiesTable.builderId, b.id));
      return { id: b.id, count: Number(c?.value ?? 0) };
    })
  );
  const countMap = new Map(counts.map((c) => [c.id, c.count]));

  return (
    <DashboardShell
      title="Admin Dashboard"
      user={{ name: session.name, email: session.email, role: "Admin" }}
      navItems={adminNavItems}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Manage Builders
        </h1>
        <p className="mt-1 text-slate-600">
          {allBuilders.length} builders registered
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allBuilders.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl bg-white border border-slate-200 p-5"
          >
            <div className="flex items-start gap-3">
              {b.logo ? (
                <Image
                  src={b.logo}
                  alt={b.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-xl object-cover"
                />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-lg">
                  {b.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-900 line-clamp-1">
                    {b.name}
                  </h3>
                  {b.isVerified ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  )}
                </div>
                <div className="text-xs text-slate-500 truncate">{b.email}</div>
                <div className="text-xs text-slate-500">{b.phone}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <div className="text-xs text-slate-500">Properties</div>
                <div className="text-lg font-bold text-slate-900">
                  {countMap.get(b.id) ?? 0}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <div className="text-xs text-slate-500">Experience</div>
                <div className="text-lg font-bold text-slate-900">
                  {b.experienceYears ?? 0} yr
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span
                className={`px-2 py-0.5 rounded-full font-semibold ${
                  b.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {b.isActive ? "Active" : "Inactive"}
              </span>
              <span className="text-slate-500">
                Joined {new Date(b.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
