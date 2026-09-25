import { notFound } from "next/navigation";
import {
  DashboardShell,
  adminNavItems,
} from "@/components/dashboard-shell";
import { PropertyForm } from "@/components/property-form";
import type { PropertyInput } from "@/lib/validations";
import { requireAdminPage } from "@/lib/page-guards";
import {
  getAllAccounts,
  getDashboardStats,
  getAdminPropertyById,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Property | Admin | Vizag Properties",
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;

export default async function AdminEditPropertyPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const { session } = await requireAdminPage();

  const propertyId = Number(id);
  if (!Number.isInteger(propertyId) || propertyId <= 0) notFound();

  const [property, accounts, stats] = await Promise.all([
    getAdminPropertyById(propertyId),
    getAllAccounts(),
    getDashboardStats(),
  ]);

  if (!property) notFound();

  return (
    <DashboardShell
      title="Admin Dashboard"
      user={{ name: session.name, email: session.email, role: "Admin" }}
      navItems={adminNavItems}
      pendingApprovals={stats.pendingApprovals}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Edit Property
        </h1>
        <p className="mt-1 text-slate-600">
          Moderation status: <strong>{property.moderationStatus}</strong>
          {property.rejectionReason
            ? ` — reason: ${property.rejectionReason}`
            : ""}
        </p>
      </div>
      <PropertyForm
        mode="admin"
        propertyId={property.id}
        accounts={accounts.map((a) => ({
          id: a.id,
          name: a.name,
          publisherType: a.publisherType,
        }))}
        initialAccountId={property.builderId}
        initial={{
          title: property.title,
          description: property.description,
          propertyType: property.propertyType as PropertyInput["propertyType"],
          status: property.status as PropertyInput["status"],
          furnishing: (property.furnishing ??
            "unfurnished") as PropertyInput["furnishing"],
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
          contactPreference: (property.contactPreference ??
            "both") as PropertyInput["contactPreference"],
          isFeatured: property.isFeatured ?? false,
          amenities: (property.amenities ?? []).join(", "),
          highlights: (property.highlights ?? []).join(", "),
        }}
        existingImages={property.images.map((img) => ({
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
