import {
  DashboardShell,
  sellerNavItems,
} from "@/components/dashboard-shell";
import { SellerProfileForm } from "@/components/seller-profile-form";
import { requireSellerPage } from "@/lib/page-guards";
import { PUBLISHER_DASHBOARD_TITLE } from "@/lib/publishers";
import { BadgeCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Profile | Vizag Properties",
  robots: { index: false, follow: false },
};

export default async function SellerProfilePage() {
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            My Profile
          </h1>
          <p className="mt-1 text-slate-600">
            This information is shown to buyers on your property pages.
          </p>
        </div>
        {account.isVerified ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            <BadgeCheck className="h-4 w-4" />
            Verified account
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
            Pending verification
          </span>
        )}
      </div>

      <SellerProfileForm
        initial={{
          name: account.name,
          email: account.email,
          phone: account.phone,
          companyName: account.companyName,
          whatsappNumber: account.whatsappNumber,
          locality: account.locality,
          city: account.city,
          description: account.description,
          website: account.website,
          address: account.address,
          experienceYears: account.experienceYears,
          projectsCount: account.projectsCount,
        }}
        publisherType={accountType}
        isVerified={Boolean(account.isVerified)}
      />
    </DashboardShell>
  );
}
