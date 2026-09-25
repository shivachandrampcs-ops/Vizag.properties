import {
  DashboardShell,
  adminNavItems,
} from "@/components/dashboard-shell";
import { PropertyForm } from "@/components/property-form";
import { requireAdminPage } from "@/lib/page-guards";
import { getAllAccounts, getDashboardStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add Property | Admin | Vizag Properties",
  robots: { index: false, follow: false },
};

export default async function AdminNewPropertyPage() {
  const { session } = await requireAdminPage();
  const [accounts, stats] = await Promise.all([
    getAllAccounts(),
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
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Add Property
        </h1>
        <p className="mt-1 text-slate-600">
          Properties created by an admin are approved and published immediately.
        </p>
      </div>
      <PropertyForm
        mode="admin"
        accounts={accounts
          .filter((a) => a.isActive)
          .map((a) => ({
            id: a.id,
            name: a.name,
            publisherType: a.publisherType,
          }))}
      />
    </DashboardShell>
  );
}
