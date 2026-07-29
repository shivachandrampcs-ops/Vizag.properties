import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { properties, propertyImages } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import {
  DashboardShell,
  builderNavItems,
} from "@/components/dashboard-shell";
import { PropertyForm } from "@/components/property-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Property | Vizag Properties",
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;

export default async function EditPropertyPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "builder") {
    redirect("/login/builder");
  }

  const propertyId = Number(id);
  if (isNaN(propertyId)) notFound();

  const [property] = await db
    .select()
    .from(properties)
    .where(
      and(eq(properties.id, propertyId), eq(properties.builderId, session.id))
    )
    .limit(1);

  if (!property) notFound();

  const images = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, propertyId));

  return (
    <DashboardShell
      title="Builder Dashboard"
      user={{ name: session.name, email: session.email, role: "Builder" }}
      navItems={builderNavItems}
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Edit Property
        </h1>
        <p className="mt-1 text-slate-600">Update your property details.</p>
      </div>
      <PropertyForm
        propertyId={propertyId}
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
          isFeatured: property.isFeatured ?? false,
          amenities: (property.amenities ?? []).join(", "),
          highlights: (property.highlights ?? []).join(", "),
        }}
        existingImages={images.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          altText: img.altText,
          isCover: img.isCover ?? false,
          sortOrder: img.sortOrder ?? 0,
        }))}
      />
    </DashboardShell>
  );
}
