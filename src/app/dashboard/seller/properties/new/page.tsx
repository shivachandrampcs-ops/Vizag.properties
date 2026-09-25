import {
  DashboardShell,
  sellerNavItems,
} from "@/components/dashboard-shell";
import { PropertyForm } from "@/components/property-form";
import { requireSellerPage } from "@/lib/page-guards";
import { PUBLISHER_DASHBOARD_TITLE } from "@/lib/publishers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add Property | Vizag Properties",
  robots: { index: false, follow: false },
};

export default async function NewSellerPropertyPage() {
  const { account } = await requireSellerPage();
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
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Add New Property
        </h1>
        <p className="mt-1 text-slate-600">
          List a property in Visakhapatnam. Upload at least one photo, save a
          draft or submit it for review — our team publishes reviewed listings.
        </p>
      </div>
      <PropertyForm />
    </DashboardShell>
  );
}
