import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getProperties } from "@/lib/queries";
import { PropertyCard } from "@/components/property-card";
import { PropertySearchBar } from "@/components/property-search-bar";
import { LeadForm } from "@/components/lead-form";
import { Building2, Sparkles, PlusCircle } from "lucide-react";
import type { PropertyWithRelations } from "@/lib/utils-types";
import { SITE_CONFIG } from "@/lib/utils";
import { defaultAreaUnitForType, areaUnitLabel } from "@/lib/area-units";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Properties in Vizag | Apartments, Villas, Plots & Commercial",
  description:
    "Browse seller-submitted property listings in Visakhapatnam. Filter by locality, budget, property type and area; independently verify listing details.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/properties`,
  },
  openGraph: {
    title: "Properties in Vizag | Vizag Properties",
    description:
      "Search seller-submitted apartments, villas, plots and commercial property listings in Visakhapatnam.",
    url: `${SITE_CONFIG.url}/properties`,
    type: "website",
  },
};

type SearchParams = Promise<{
  search?: string;
  location?: string;
  type?: string;
  status?: string;
  budget?: string;
  bedrooms?: string;
  minArea?: string;
  maxArea?: string;
}>;

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  if (sp.budget) {
    const parts = sp.budget.split("-");
    minPrice = parts[0] ? Number(parts[0]) : undefined;
    maxPrice = parts[1] ? Number(parts[1]) : undefined;
  }

  const parsePositiveArea = (value?: string) => {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
  };
  const minArea = parsePositiveArea(sp.minArea);
  const maxArea = parsePositiveArea(sp.maxArea);
  const areaUnit = defaultAreaUnitForType(sp.type ?? "");
  const hasAreaFilter = minArea !== undefined || maxArea !== undefined;

  let properties: PropertyWithRelations[] = [];
  try {
    properties = await getProperties({
      search: sp.search,
      location: sp.location,
      propertyType: sp.type,
      status: sp.status,
      minPrice,
      maxPrice,
      minArea: hasAreaFilter ? minArea : undefined,
      maxArea: hasAreaFilter ? maxArea : undefined,
      areaUnit: hasAreaFilter ? areaUnit : undefined,
      bedrooms: sp.bedrooms ? Number(sp.bedrooms) : undefined,
    });
  } catch (e) {
    // db not ready
  }

  // Build dynamic JSON-LD for property list
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Properties in Visakhapatnam",
    numberOfItems: properties.length,
    itemListElement: properties.slice(0, 20).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Residence",
        "@id": `${SITE_CONFIG.url}/properties/${p.slug}`,
        name: p.title,
        description: p.description,
        address: {
          "@type": "PostalAddress",
          streetAddress: p.address,
          addressLocality: p.location,
          addressRegion: p.state,
          postalCode: p.pincode,
          addressCountry: "IN",
        },
        numberOfBedrooms: p.bedrooms ?? undefined,
        numberOfBathroomsTotal: p.bathrooms ?? undefined,
        floorSize: p.areaUnit
          ? {
              "@type": "QuantitativeValue",
              value: p.area,
              ...(p.areaUnit === "sqft" ? { unitCode: "FTK" } : {}),
              unitText: areaUnitLabel(p.areaUnit),
            }
          : undefined,
        offers: {
          "@type": "Offer",
          price: p.price,
          priceCurrency: "INR",
        },
        image: p.coverImage ?? undefined,
      },
    })),
  };

  const activeFilters = [
    sp.search && { label: `"${sp.search}"`, key: "search" },
    sp.location && { label: sp.location, key: "location" },
    sp.type && {
      label: sp.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      key: "type",
    },
    sp.budget && {
      label: sp.budget
        .split("-")
        .map((n) => `₹ ${(Number(n) / 100000).toFixed(0)} L`)
        .join(" - "),
      key: "budget",
    },
    hasAreaFilter && {
      label: `${minArea ?? "Any"}–${maxArea ?? "Any"} ${areaUnitLabel(areaUnit)}`,
      key: "area",
    },
  ].filter(Boolean) as { label: string; key: string }[];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 to-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-brand-600">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-700">Properties</span>
          </nav>
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-600 uppercase tracking-wider">
            <Building2 className="h-4 w-4" />
            Browse Properties
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
            Properties in Visakhapatnam
          </h1>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Browse {properties.length} current seller-submitted apartment,
            villa, plot and commercial listings across Vizag. Listing claims
            should be checked independently.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/list-your-property"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gold-500 hover:bg-gold-600 text-white text-sm font-semibold"
            >
              <PlusCircle className="h-4 w-4" />
              List Your Property
            </Link>
            <span className="text-xs text-slate-500">
              Owners, builders and agents can submit listings. Platform review
              is not independent property verification.
            </span>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="static md:sticky md:top-[112px] z-30 bg-white/95 md:backdrop-blur-md border-b border-slate-200 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PropertySearchBar
            variant="inline"
            initialValues={{
              search: sp.search,
              location: sp.location,
              propertyType: sp.type,
              budget: sp.budget,
              minArea: minArea?.toString() ?? "",
              maxArea: maxArea?.toString() ?? "",
            }}
          />
        </div>
      </section>

      {/* Results */}
      <section className="py-10 md:py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {properties.length}{" "}
              {properties.length === 1 ? "Property" : "Properties"} Found
            </h2>
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500">Active filters:</span>
                {activeFilters.map((f) => (
                  <span
                    key={f.key}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium"
                  >
                    {f.label}
                  </span>
                ))}
                <Link
                  href="/properties"
                  className="text-xs text-brand-600 hover:text-brand-700 font-semibold underline ml-1"
                >
                  Clear all
                </Link>
              </div>
            )}
          </div>

          {properties.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-12 text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                No properties match your filters
              </h3>
              <p className="mt-2 text-slate-600 max-w-md mx-auto">
                Try adjusting your filters or send us an enquiry. Listing availability and details are provided by account holders and should be checked independently.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/properties"
                  className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700"
                >
                  View All Properties
                </Link>
                <a
                  href={SITE_CONFIG.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  Contact Us on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p, i) => (
                <PropertyCard key={p.id} property={p} priority={i < 3} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Inline lead form */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
                Can&apos;t Find What You&apos;re Looking For?
              </div>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
                Tell Us Your Requirements
              </h2>
              <p className="mt-3 text-slate-600">
                Tell us what you are looking for and we can review your
                enquiry. Listing details and legal status must be confirmed
                independently with the seller.
              </p>
              <ul className="mt-5 space-y-2 text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                  Submit a property enquiry
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                  Contact the operator to discuss next steps
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                  Arrange your own independent legal and financial advice
                </li>
              </ul>
            </div>
            <LeadForm source="properties_listing" />
          </div>
        </div>
      </section>
    </>
  );
}
