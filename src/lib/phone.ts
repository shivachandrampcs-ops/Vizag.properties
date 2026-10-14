/**
 * Accepts Indian mobile numbers in national format or with an optional +91
 * country code, with spaces, hyphens or parentheses for readability.
 * Returns one canonical +91 E.164-style value, or null when invalid.
 */
export function normalizeIndianMobile(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const compact = value.trim().replace(/[\s()-]/g, "");
  if (!/^\+?\d+$/.test(compact)) return null;

  const digits = compact.replace(/^\+/, "");
  if (/^[6-9]\d{9}$/.test(digits)) return `+91${digits}`;
  if (/^91[6-9]\d{9}$/.test(digits)) return `+${digits}`;
  return null;
}

export function isValidIndianMobile(value: unknown): value is string {
  return normalizeIndianMobile(value) !== null;
}

export function indianMobileDigits(value: string): {
  canonical: string;
  countryAndNational: string;
  national: string;
} | null {
  const canonical = normalizeIndianMobile(value);
  if (!canonical) return null;
  const digits = canonical.replace(/\D/g, "");
  return {
    canonical,
    countryAndNational: digits,
    national: digits.slice(-10),
  };
}
