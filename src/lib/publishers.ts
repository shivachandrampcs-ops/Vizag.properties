import type { PublisherType } from "@/db/schema";

/**
 * The three kinds of sellers that can list a property on Vizag Properties.
 *
 * They all share the same account table (`builders`) and the same dashboard —
 * only the labels and a few optional profile fields differ.
 */
export const PUBLISHER_TYPES: PublisherType[] = ["builder", "owner", "agent"];

export const PUBLISHER_TYPE_LABEL: Record<PublisherType, string> = {
  builder: "Builder",
  owner: "Property Owner",
  agent: "Real Estate Agent",
};

/** Short badge label used in tight UI (tables, chips, nav). */
export const PUBLISHER_TYPE_SHORT: Record<PublisherType, string> = {
  builder: "Builder",
  owner: "Owner",
  agent: "Agent",
};

/** Dashboard title per account type, e.g. "Owner Dashboard". */
export const PUBLISHER_DASHBOARD_TITLE: Record<PublisherType, string> = {
  builder: "Builder Dashboard",
  owner: "Owner Dashboard",
  agent: "Agent Dashboard",
};

export const PUBLISHER_TYPE_DESCRIPTION: Record<PublisherType, string> = {
  builder:
    "Developers and construction companies listing projects, apartments and villas.",
  owner: "Individuals selling or renting out their own house, flat or plot.",
  agent: "Real estate agents and consultants listing properties on behalf of clients.",
};

export function isPublisherType(value: unknown): value is PublisherType {
  return (
    typeof value === "string" &&
    (PUBLISHER_TYPES as string[]).includes(value)
  );
}

/** Never throws — falls back to "builder" for legacy rows/tokens. */
export function normalizePublisherType(value: unknown): PublisherType {
  return isPublisherType(value) ? value : "builder";
}

export function publisherTypeLabel(value: unknown): string {
  return PUBLISHER_TYPE_LABEL[normalizePublisherType(value)];
}

export function publisherTypeShort(value: unknown): string {
  return PUBLISHER_TYPE_SHORT[normalizePublisherType(value)];
}

/** Tailwind classes for the account-type chip. */
export function publisherTypeChipClass(value: unknown): string {
  switch (normalizePublisherType(value)) {
    case "owner":
      return "bg-emerald-100 text-emerald-700";
    case "agent":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-brand-100 text-brand-700";
  }
}

// ────────────────────────────────────────────────────────────
// Moderation status helpers
// ────────────────────────────────────────────────────────────

export type ModerationValue =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected";

export const MODERATION_LABEL: Record<ModerationValue, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
};

export const MODERATION_CHIP_CLASS: Record<ModerationValue, string> = {
  draft: "bg-slate-100 text-slate-600",
  pending_review: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export const MODERATION_DESCRIPTION: Record<ModerationValue, string> = {
  draft: "Saved but not submitted. Not visible on the website.",
  pending_review: "Submitted and waiting for the Vizag Properties team to review it.",
  approved: "Approved and live on the website.",
  rejected: "Rejected by the admin. Edit and resubmit after fixing the issue.",
};

export function moderationLabel(value: unknown): string {
  return MODERATION_LABEL[(value as ModerationValue) ?? "approved"] ?? "Approved";
}

export function moderationChipClass(value: unknown): string {
  return (
    MODERATION_CHIP_CLASS[(value as ModerationValue) ?? "approved"] ??
    MODERATION_CHIP_CLASS.approved
  );
}

/** A listing is publicly visible only when it is approved AND active. */
export function isPubliclyVisible(
  property: { moderationStatus?: unknown; isActive?: unknown } | null | undefined
): boolean {
  if (!property) return false;
  return (
    property.moderationStatus === "approved" && property.isActive !== false
  );
}
