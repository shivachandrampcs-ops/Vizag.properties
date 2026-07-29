"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, MapPin, Home, IndianRupee } from "lucide-react";
import { VIZAG_LOCATIONS } from "@/lib/utils";

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
  };
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialValues?.search ?? "");
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [propertyType, setPropertyType] = useState(
    initialValues?.propertyType ?? ""
  );
  const [budget, setBudget] = useState(initialValues?.budget ?? "");

  useEffect(() => {
    setSearch(initialValues?.search ?? "");
    setLocation(initialValues?.location ?? "");
    setPropertyType(initialValues?.propertyType ?? "");
    setBudget(initialValues?.budget ?? "");
  }, [
    initialValues?.search,
    initialValues?.location,
    initialValues?.propertyType,
    initialValues?.budget,
  ]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (location) params.set("location", location);
    if (propertyType) params.set("type", propertyType);
    if (budget) params.set("budget", budget);
    router.push(`/properties${params.toString() ? "?" + params.toString() : ""}`);
  }

  const inputClass =
    "w-full pl-11 pr-3 py-3.5 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 border border-slate-200 transition-colors";

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
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClass + " appearance-none cursor-pointer"}
            aria-label="Location"
          >
            <option value="">All Locations</option>
            {VIZAG_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className={inputClass + " appearance-none cursor-pointer"}
            aria-label="Property type"
          >
            <option value="">All Types</option>
            <option value="apartment">Apartment</option>
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
