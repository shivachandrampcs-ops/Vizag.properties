import Image from "next/image";
import Link from "next/link";
import { Bed, Bath, Square, MapPin, Sparkles, Building2 } from "lucide-react";
import { formatPrice, formatArea, propertyTypeLabel, statusLabel } from "@/lib/utils";
import type { PropertyWithRelations } from "@/lib/utils-types";

export function PropertyCard({
  property,
  priority = false,
}: {
  property: PropertyWithRelations;
  priority?: boolean;
}) {
  const cover =
    property.coverImage ||
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop";

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="property-card group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={cover}
          alt={property.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          priority={priority}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-white/95 text-brand-700 shadow-sm">
            {propertyTypeLabel(property.propertyType)}
          </span>
          {property.isFeatured && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gold-500 text-white shadow-sm flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Featured
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${
              property.status === "ready_to_move"
                ? "bg-green-100 text-green-700"
                : property.status === "new_launch"
                ? "bg-blue-100 text-blue-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {statusLabel(property.status)}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="px-3 py-2 rounded-lg bg-slate-900/80 backdrop-blur-sm">
            <div className="text-white font-bold text-lg">
              {formatPrice(property.price)}
            </div>
            {property.pricePerSqft && (
              <div className="text-xs text-slate-300">
                ₹ {property.pricePerSqft.toLocaleString("en-IN")} / sqft
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-5">
        <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-brand-700 transition-colors">
          {property.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-600">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">
            {property.location}, {property.city}
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {property.description}
        </p>

        <div className="mt-4 flex items-center gap-4 text-sm text-slate-700">
          {property.bedrooms !== null && property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bed className="h-4 w-4 text-brand-600" />
              <span className="font-medium">{property.bedrooms} Beds</span>
            </div>
          )}
          {property.bathrooms !== null && property.bathrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-brand-600" />
              <span className="font-medium">{property.bathrooms} Baths</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Square className="h-4 w-4 text-brand-600" />
            <span className="font-medium">{formatArea(property.area)}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Building2 className="h-3.5 w-3.5" />
            <span className="truncate max-w-[140px]">
              {property.builder.name}
            </span>
          </div>
          <span className="text-sm font-semibold text-brand-600 group-hover:translate-x-0.5 transition-transform">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
