import { notFound } from "next/navigation";
import {
  DashboardShell,
  sellerNavItems,
} from "@/components/dashboard-shell";
import { PropertyForm } from "@/components/property-form";
import { requireSellerPage } from "@/lib/page-guards";
import { db } from "@/db";
import { propertyImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOwnedProperty } from "@/lib/property-service";
import { PUBLISHER_DASHBOARD_TITLE } from "@/lib/publishers";
import { AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Property | Vizag Properties",
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;
type Search = Promise<{ resubmit?: string }>;

export default async function EditSellerPropertyPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { id } = await params;
  const { resubmit } = await searchParams;
  const { account } = await requireSellerPage();
  const accountType = account.publisherType ?? "builder";

  const propertyId = Number(id);
  if (!Number.isInteger(propertyId) || propertyId <= 0) notFound();

  // Ownership is enforced here: another seller's id simply returns 404.
  const property = await getOwnedProperty(propertyId, account.id);
  if (!property) notFound();

  const images = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, propertyId));

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
          Edit Property
        </h1>
        <p className="mt-1 text-slate-600">
          Update your property details and photos.
        </p>
      </div>

      {resubmit === "1" && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Review the details below and press{" "}
            <strong>“Submit for Review”</strong> to send this property back to
            the Vizag Properties team.
          </p>
        </div>
      )}

      <PropertyForm
        propertyId={property.id}
        initial={{
          title: property.title,
          description: property.description,
          propertyType: property.propertyType,
          status: property.status,
          furnishing: property.furnishing ?? "unfurnished",
          price: property.price,
          pricePerSqft: property.pricePerSqft ?? undefined,
          area: property.area,
          bedrooms: property.bedrooms ?? 0,
          bathrooms: property.bathrooms ?? 0,
          balconies: property.balconies ?? 0,
          floor: property.floor ?? undefined,
          totalFloors: property.totalFloors ?? undefined,
          facing: property.facing ?? "",
          address: property.address,
          location: property.location,
          city: property.city,
          state: property.state,
          pincode: property.pincode ?? "",
          latitude: property.latitude ?? "",
          longitude: property.longitude ?? "",
          reraId: property.reraId ?? "",
          approvalInfo: property.approvalInfo ?? "",
          contactPreference: property.contactPreference ?? "both",
          isFeatured: property.isFeatured ?? false,
          amenities: (property.amenities ?? []).join(", "),
          highlights: (property.highlights ?? []).join(", "),
        }}
        rejectionReason={property.rejectionReason}
        moderationStatus={property.moderationStatus}
        existingImages={images.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          altText: img.altText,
          isCover: img.isCover ?? false,
          sortOrder: img.sortOrder ?? 0,
          provider: img.provider ?? "url",
          publicId: img.publicId ?? null,
        }))}
      />
    </DashboardShell>
  );
}
