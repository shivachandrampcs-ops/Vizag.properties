import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  DashboardShell,
  builderNavItems,
} from "@/components/dashboard-shell";
import { PropertyForm } from "@/components/property-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add Property | Vizag Properties",
  robots: { index: false, follow: false },
};

export default async function NewPropertyPage() {
  const session = await getSession();
  if (!session || session.role !== "builder") {
    redirect("/login/builder");
  }

  return (
    <DashboardShell
      title="Builder Dashboard"
      user={{ name: session.name, email: session.email, role: "Builder" }}
      navItems={builderNavItems}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Add New Property
        </h1>
        <p className="mt-1 text-slate-600">
          List a new property in Visakhapatnam. All fields marked * are
          required.
        </p>
      </div>
      <PropertyForm />
    </DashboardShell>
  );
}
