export const PROPERTY_AREA_UNITS = ["sqft", "sqyd"] as const;

export type PropertyAreaUnit = (typeof PROPERTY_AREA_UNITS)[number];

export function defaultAreaUnitForType(propertyType: string): PropertyAreaUnit {
  // Apartments and penthouses are flat-style homes; all other categories,
  // including plots, use square feet by default.
  if (propertyType === "apartment" || propertyType === "penthouse") return "sqyd";
  return "sqft";
}

export function areaUnitLabel(unit: PropertyAreaUnit | null | undefined): string {
  if (unit === "sqyd") return "sq. yd.";
  if (unit === "sqft") return "sq. ft.";
  return "unit not recorded";
}

export function propertyAreaFieldLabel(
  propertyType: string,
  unit: PropertyAreaUnit | null | undefined
): string {
  const name = propertyType === "plot"
    ? "Plot"
    : propertyType === "apartment"
      ? "Flat"
      : propertyType.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  return `${name} Area (${areaUnitLabel(unit)})`;
}
