import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAllBuilders } from "@/lib/queries";
import {
  DashboardShell,
  adminNavItems,
} from "@/components/dashboard-shell";
import { PropertyForm } from "@/components/property-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add Property | Admin | Vizag Properties",
  robots: { index: false, follow: false },
};

export default async function AdminNewPropertyPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login/admin");
  }

  const allBuilders = await getAllBuilders();

  return (
    <DashboardShell
      title="Admin Dashboard"
      user={{ name: session.name, email: session.email, role: "Admin" }}
      navItems={adminNavItems}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Add New Property
        </h1>
        <p className="mt-1 text-slate-600">
          List a new property and assign it to a builder. All fields marked *
          are required.
        </p>
      </div>
      {allBuilders.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-slate-600">
          You need at least one builder before you can add a property.
        </div>
      ) : (
        <PropertyForm
          mode="admin"
          builders={allBuilders.map((b) => ({ id: b.id, name: b.name }))}
        />
      )}
    </DashboardShell>
  );
}
