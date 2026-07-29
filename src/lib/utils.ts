import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  if (price >= 10000000) {
    const cr = price / 10000000;
    return `₹ ${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    const l = price / 100000;
    return `₹ ${l % 1 === 0 ? l.toFixed(0) : l.toFixed(2)} L`;
  }
  if (price >= 1000) {
    return `₹ ${(price / 1000).toFixed(0)} K`;
  }
  return `₹ ${price.toLocaleString("en-IN")}`;
}

export function formatPriceFull(price: number): string {
  return `₹ ${price.toLocaleString("en-IN")}`;
}

export function formatArea(area: number): string {
  return `${area.toLocaleString("en-IN")} sqft`;
}

export function titleCase(str: string): string {
  return str
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function propertyTypeLabel(type: string): string {
  const map: Record<string, string> = {
    apartment: "Apartment",
    villa: "Villa",
    plot: "Plot",
    independent_house: "Independent House",
    commercial: "Commercial",
    penthouse: "Penthouse",
  };
  return map[type] ?? titleCase(type);
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    ready_to_move: "Ready to Move",
    under_construction: "Under Construction",
    new_launch: "New Launch",
    resale: "Resale",
  };
  return map[status] ?? titleCase(status);
}

export function furnishingLabel(f: string | null | undefined): string {
  if (!f) return "—";
  const map: Record<string, string> = {
    unfurnished: "Unfurnished",
    semi_furnished: "Semi-Furnished",
    fully_furnished: "Fully Furnished",
  };
  return map[f] ?? titleCase(f);
}

export const VIZAG_LOCATIONS = [
  "Madhurawada",
  "Gajuwaka",
  "MVP Colony",
  "Dwaraka Nagar",
  "Beach Road",
  "Rushikonda",
  "Yendada",
  "Pendurthi",
  "Anakapalle",
  "Sabbavaram",
  "Kommadi",
  "Mangalapalem",
  "Bheemunipatnam",
  "Kancharapalem",
  "Marripalem",
  "Gopalapatnam",
  "NAD Junction",
  "Akkayyapalem",
  "Siripuram",
  "Waltair",
  "Hanumanthawaka",
  "Lankelapalem",
  "Vepagunta",
  "Arilova",
  "Kapuluppada",
  "Thagarapuvalasa",
] as const;

export const SITE_CONFIG = {
  name: "Vizag Properties",
  shortName: "VizagProps",
  domain: "vizag.properties",
  url: "https://vizag.properties",
  description:
    "Discover verified apartments, villas, plots and commercial properties in Visakhapatnam (Vizag). Free property consultation with trusted local builders.",
  phone: "+91 7702434892",
  phoneRaw: "+917702434892",
  whatsapp: "https://wa.me/917702434892",
  email: "info@vizag.properties",
  address: "Visakhapatnam, Andhra Pradesh, India",
  social: {
    facebook: "https://facebook.com/vizagproperties",
    instagram: "https://instagram.com/vizagproperties",
    youtube: "https://youtube.com/@vizagproperties",
    linkedin: "https://linkedin.com/company/vizagproperties",
  },
} as const;
