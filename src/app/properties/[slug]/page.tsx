import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Calendar,
  Eye,
  Tag,
  Building2,
  CheckCircle2,
  Shield,
  Award,
  Phone,
  MessageCircle,
  Mail,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { db } from "@/db";
import { properties, propertyImages } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import {
  getPropertyBySlug,
  getRelatedProperties,
} from "@/lib/queries";
import {
  formatPrice,
  formatPriceFull,
  formatArea,
  propertyTypeLabel,
  statusLabel,
  furnishingLabel,
  SITE_CONFIG,
} from "@/lib/utils";
import { PropertyMapWrapper } from "@/components/property-map-wrapper";
import { LeadForm } from "@/components/lead-form";
import { ConsultationCta } from "@/components/consultation-cta";
import { PropertyCard } from "@/components/property-card";
import { PropertyGallery } from "@/components/property-gallery";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) {
    return {
      title: "Property Not Found",
    };
  }
  const title = `${property.title} | ${property.location}, Vizag`;
  const description = `${propertyTypeLabel(property.propertyType)} for sale in ${property.location}, Visakhapatnam. ${formatPrice(property.price)}. ${property.area} sqft. ${property.bedrooms ?? 0} BHK. ${property.description.slice(0, 120)}`;

  return {
    title,
    description,
    keywords: [
      `${propertyTypeLabel(property.propertyType)} in ${property.location}`,
      `Property in ${property.location} Vizag`,
      `Real estate ${property.location} Visakhapatnam`,
      "Properties in Vizag",
      "Vizag Properties",
    ],
    alternates: {
      canonical: `${SITE_CONFIG.url}/properties/${property.slug}`,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${SITE_CONFIG.url}/properties/${property.slug}`,
      images: property.coverImage
        ? [{ url: property.coverImage, width: 1200, height: 630, alt: property.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: property.coverImage ? [property.coverImage] : undefined,
    },
  };
}

export default async function PropertyDetailsPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  // Increment views (best effort)
  try {
    await db
      .update(properties)
      .set({ views: sql`${properties.views} + 1` })
      .where(eq(properties.id, property.id));
  } catch {
    // ignore
  }

  const related = await getRelatedProperties(
    property.id,
    property.propertyType,
    property.location,
    3
  );

  // Schema.org RealEstateListing
  const realEstateJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${SITE_CONFIG.url}/properties/${property.slug}`,
    name: property.title,
    description: property.description,
    url: `${SITE_CONFIG.url}/properties/${property.slug}`,
    image: property.coverImage ?? undefined,
    datePosted: property.createdAt,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.location,
      addressRegion: property.state,
      postalCode: property.pincode,
      addressCountry: "IN",
    },
    geo: property.latitude && property.longitude
      ? {
          "@type": "GeoCoordinates",
          latitude: property.latitude,
          longitude: property.longitude,
        }
      : undefined,
    numberOfBedrooms: property.bedrooms ?? undefined,
    numberOfBathroomsTotal: property.bathrooms ?? undefined,
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.area,
      unitCode: "FTK",
      unitText: "sqft",
    },
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_CONFIG.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Properties",
        item: `${SITE_CONFIG.url}/properties`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: property.title,
        item: `${SITE_CONFIG.url}/properties/${property.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-brand-600">
              Home
            </Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-brand-600">
              Properties
            </Link>
            <span>/</span>
            <span className="text-slate-700 truncate max-w-[200px] sm:max-w-md">
              {property.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Title */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-brand-100 text-brand-700">
                  {propertyTypeLabel(property.propertyType)}
                </span>
                <span
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    property.status === "ready_to_move"
                      ? "bg-green-100 text-green-700"
                      : property.status === "new_launch"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {statusLabel(property.status)}
                </span>
                {property.reraId && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    RERA: {property.reraId}
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
                {property.title}
              </h1>
              <div className="mt-2 flex items-center gap-2 text-slate-600">
                <MapPin className="h-4 w-4" />
                <span>{property.address}</span>
              </div>
            </div>
            <div className="lg:text-right">
              <div className="text-3xl md:text-4xl font-bold text-brand-700">
                {formatPrice(property.price)}
              </div>
              {property.pricePerSqft && (
                <div className="text-sm text-slate-500 mt-1">
                  ₹ {property.pricePerSqft.toLocaleString("en-IN")} per sqft
                </div>
              )}
              <div className="mt-3 flex lg:justify-end gap-2">
                <a
                  href={`tel:${SITE_CONFIG.phoneRaw}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold"
                >
                  <Phone className="h-4 w-4" />
                  Call Expert
                </a>
                <a
                  href={SITE_CONFIG.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
          <PropertyGallery
            images={property.images.map((i) => ({
              url: i.imageUrl,
              alt: i.altText ?? property.title,
            }))}
          />
        </div>
      </section>

      {/* Main content */}
      <section className="py-8 md:py-10 section-gradient">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Quick stats */}
              <div className="rounded-2xl bg-white border border-slate-200 p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {property.bedrooms !== null && property.bedrooms > 0 && (
                    <div className="text-center p-4 rounded-xl bg-slate-50">
                      <Bed className="h-5 w-5 text-brand-600 mx-auto" />
                      <div className="mt-2 text-2xl font-bold text-slate-900">
                        {property.bedrooms}
                      </div>
                      <div className="text-xs text-slate-500">Bedrooms</div>
                    </div>
                  )}
                  {property.bathrooms !== null && property.bathrooms > 0 && (
                    <div className="text-center p-4 rounded-xl bg-slate-50">
                      <Bath className="h-5 w-5 text-brand-600 mx-auto" />
                      <div className="mt-2 text-2xl font-bold text-slate-900">
                        {property.bathrooms}
                      </div>
                      <div className="text-xs text-slate-500">Bathrooms</div>
                    </div>
                  )}
                  <div className="text-center p-4 rounded-xl bg-slate-50">
                    <Square className="h-5 w-5 text-brand-600 mx-auto" />
                    <div className="mt-2 text-2xl font-bold text-slate-900">
                      {property.area.toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs text-slate-500">Sqft Area</div>
                  </div>
                  {property.balconies !== null && property.balconies > 0 && (
                    <div className="text-center p-4 rounded-xl bg-slate-50">
                      <Tag className="h-5 w-5 text-brand-600 mx-auto" />
                      <div className="mt-2 text-2xl font-bold text-slate-900">
                        {property.balconies}
                      </div>
                      <div className="text-xs text-slate-500">Balconies</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="rounded-2xl bg-white border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Property Description
                </h2>
                <div className="mt-4 text-slate-700 leading-relaxed whitespace-pre-line">
                  {property.description}
                </div>
              </div>

              {/* Property Details */}
              <div className="rounded-2xl bg-white border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Property Details
                </h2>
                <div className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-3">
                  <DetailRow
                    label="Property Type"
                    value={propertyTypeLabel(property.propertyType)}
                  />
                  <DetailRow
                    label="Status"
                    value={statusLabel(property.status)}
                  />
                  <DetailRow
                    label="Furnishing"
                    value={furnishingLabel(property.furnishing)}
                  />
                  <DetailRow
                    label="Price"
                    value={formatPriceFull(property.price)}
                  />
                  {property.pricePerSqft && (
                    <DetailRow
                      label="Price per sqft"
                      value={`₹ ${property.pricePerSqft.toLocaleString("en-IN")}`}
                    />
                  )}
                  <DetailRow
                    label="Carpet Area"
                    value={formatArea(property.area)}
                  />
                  {property.floor && (
                    <DetailRow
                      label="Floor"
                      value={`${property.floor}${
                        property.totalFloors
                          ? ` of ${property.totalFloors}`
                          : ""
                      }`}
                    />
                  )}
                  {property.facing && (
                    <DetailRow label="Facing" value={property.facing} />
                  )}
                  <DetailRow label="City" value={property.city} />
                  <DetailRow label="State" value={property.state} />
                  {property.pincode && (
                    <DetailRow label="Pincode" value={property.pincode} />
                  )}
                  {property.reraId && (
                    <DetailRow label="RERA ID" value={property.reraId} />
                  )}
                </div>
              </div>

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <div className="rounded-2xl bg-white border border-slate-200 p-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Amenities
                  </h2>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {property.amenities.map((a) => (
                      <div
                        key={a}
                        className="flex items-center gap-2 text-sm text-slate-700"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights */}
              {property.highlights.length > 0 && (
                <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-white border border-brand-100 p-6">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-gold-500" />
                    Why This Property?
                  </h2>
                  <div className="mt-4 space-y-2">
                    {property.highlights.map((h) => (
                      <div
                        key={h}
                        className="flex items-start gap-2 text-slate-700"
                      >
                        <CheckCircle2 className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Map */}
              {property.latitude && property.longitude && (
                <div className="rounded-2xl bg-white border border-slate-200 p-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Location
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 flex items-start gap-1.5">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {property.address}
                  </p>
                  <div className="mt-4 h-80 rounded-xl overflow-hidden border border-slate-200">
                    <PropertyMapWrapper
                      lat={parseFloat(property.latitude)}
                      lng={parseFloat(property.longitude)}
                      title={property.title}
                    />
                  </div>
                </div>
              )}

              {/* Builder Info */}
              <div className="rounded-2xl bg-white border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  About the Builder
                </h2>
                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                  {property.builder.logo && (
                    <div className="flex-shrink-0">
                      <Image
                        src={property.builder.logo}
                        alt={property.builder.name}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {property.builder.name}
                      </h3>
                      {property.builder.projectsCount &&
                        property.builder.projectsCount > 0 && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                      {property.builder.experienceYears && (
                        <span>
                          🏗️ {property.builder.experienceYears}+ years
                          experience
                        </span>
                      )}
                      {property.builder.projectsCount && (
                        <span>🏢 {property.builder.projectsCount} projects</span>
                      )}
                    </div>
                    {property.builder.description && (
                      <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-4">
                        {property.builder.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Lead form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <LeadForm
                  property={{
                    id: property.id,
                    title: property.title,
                    location: property.location,
                    price: property.price,
                    propertyType: property.propertyType,
                  }}
                  source="property_details"
                />
                <div className="rounded-2xl bg-white border border-slate-200 p-5 text-sm">
                  <div className="font-bold text-slate-900 mb-2">
                    Why enquire with us?
                  </div>
                  <ul className="space-y-1.5 text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Free property consultation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Complimentary site visit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>No spam, 100% privacy</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">
              Similar Properties in Vizag
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ConsultationCta />
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900 text-right">
        {value}
      </span>
    </div>
  );
}
