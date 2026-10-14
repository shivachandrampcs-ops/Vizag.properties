"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin, Home, IndianRupee } from "lucide-react";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import {
  defaultAreaUnitForType,
  areaUnitLabel,
  type PropertyAreaUnit,
} from "@/lib/area-units";

export function PropertySearchBar({
  variant = "hero",
  initialValues,
}: {
  variant?: "hero" | "inline";
  initialValues?: {
    search?: string;
    location?: string;
    propertyType?: string;
    budget?: string;
    minArea?: string;
    maxArea?: string;
  };
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialValues?.search ?? "");
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [propertyType, setPropertyType] = useState(
    initialValues?.propertyType ?? ""
  );
  const [budget, setBudget] = useState(initialValues?.budget ?? "");
  const [minArea, setMinArea] = useState(initialValues?.minArea ?? "");
  const [maxArea, setMaxArea] = useState(initialValues?.maxArea ?? "");
  const [areaUnit, setAreaUnit] = useState<PropertyAreaUnit>(
    defaultAreaUnitForType(initialValues?.propertyType ?? "")
  );

  // Re-sync local field state when URL-backed filters change.
  const [prevInitialValues, setPrevInitialValues] = useState(initialValues);
  if (
    prevInitialValues?.search !== initialValues?.search ||
    prevInitialValues?.location !== initialValues?.location ||
    prevInitialValues?.propertyType !== initialValues?.propertyType ||
    prevInitialValues?.budget !== initialValues?.budget ||
    prevInitialValues?.minArea !== initialValues?.minArea ||
    prevInitialValues?.maxArea !== initialValues?.maxArea
  ) {
    setPrevInitialValues(initialValues);
    setSearch(initialValues?.search ?? "");
    setLocation(initialValues?.location ?? "");
    setPropertyType(initialValues?.propertyType ?? "");
    setBudget(initialValues?.budget ?? "");
    setMinArea(initialValues?.minArea ?? "");
    setMaxArea(initialValues?.maxArea ?? "");
    setAreaUnit(defaultAreaUnitForType(initialValues?.propertyType ?? ""));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (location.trim()) params.set("location", location.trim());
    if (propertyType) params.set("type", propertyType);
    if (budget) params.set("budget", budget);
    if (minArea) params.set("minArea", minArea);
    if (maxArea) params.set("maxArea", maxArea);
    router.push(`/properties${params.toString() ? "?" + params.toString() : ""}`);
  }

  const inputClass =
    "w-full pl-11 pr-3 py-3.5 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 border border-slate-200 transition-colors";
  const areaRangeEnabled = variant === "inline";

  return (
    <form
      onSubmit={handleSearch}
      className={
        variant === "hero"
          ? "rounded-2xl bg-white/95 backdrop-blur-md p-3 md:p-4 shadow-2xl border border-white/20"
          : "rounded-2xl bg-white p-3 md:p-4 shadow-lg border border-slate-200"
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search property, builder..."
            className={inputClass}
            aria-label="Search properties"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 pointer-events-none z-10" />
          <LocationAutocomplete
            id="property-search-location"
            suggestionsId="property-search-location-options"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="All locations"
            className={inputClass}
            aria-label="Search by locality"
          />
        </div>
        <div className="relative">
          <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
          <select
            value={propertyType}
            onChange={(e) => {
              const nextType = e.target.value;
              setPropertyType(nextType);
              setAreaUnit(defaultAreaUnitForType(nextType));
            }}
            className={inputClass + " appearance-none cursor-pointer"}
            aria-label="Property type"
          >
            <option value="">All Types</option>
            <option value="apartment">Flat / Apartment</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot</option>
            <option value="independent_house">Independent House</option>
            <option value="commercial">Commercial</option>
            <option value="penthouse">Penthouse</option>
          </select>
        </div>
        <div className="relative">
          <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className={inputClass + " appearance-none cursor-pointer"}
            aria-label="Budget"
          >
            <option value="">Any Budget</option>
            <option value="0-3000000">Below ₹ 30 L</option>
            <option value="3000000-5000000">₹ 30 L - 50 L</option>
            <option value="5000000-8000000">₹ 50 L - 80 L</option>
            <option value="8000000-10000000">₹ 80 L - 1 Cr</option>
            <option value="10000000-20000000">₹ 1 Cr - 2 Cr</option>
            <option value="20000000-50000000">₹ 2 Cr - 5 Cr</option>
            <option value="50000000-999999999">Above ₹ 5 Cr</option>
          </select>
        </div>
      </div>

      {areaRangeEnabled && (
        <fieldset className="mt-3 rounded-xl border border-slate-200 px-3 pb-3 pt-2">
          <legend className="px-1 text-xs font-semibold text-slate-600">
            Area range ({areaUnitLabel(areaUnit)})
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs font-medium text-slate-600">
              Minimum area
              <input
                type="number"
                min={1}
                step={1}
                value={minArea}
                onChange={(e) => setMinArea(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="No minimum"
              />
            </label>
            <label className="text-xs font-medium text-slate-600">
              Maximum area
              <input
                type="number"
                min={1}
                step={1}
                value={maxArea}
                onChange={(e) => setMaxArea(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="No maximum"
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            The area unit follows the selected property type. Legacy listings
            without a recorded unit are not included in area-range results.
          </p>
        </fieldset>
      )}

      <button
        type="submit"
        className="mt-3 w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
      >
        <Search className="h-4 w-4" />
        Search Properties in Vizag
      </button>
    </form>
  );
}
