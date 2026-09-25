import { cn } from "@/lib/utils";
import {
  MODERATION_CHIP_CLASS,
  MODERATION_LABEL,
  type ModerationValue,
} from "@/lib/publishers";

/** Small status chip: Draft / Pending Review / Approved / Rejected / Published. */
export function ModerationBadge({
  status,
  isActive,
  className,
}: {
  status: unknown;
  isActive?: boolean | null;
  className?: string;
}) {
  const key = ((status as ModerationValue) ?? "approved") as ModerationValue;
  const label = MODERATION_LABEL[key] ?? "Approved";
  const published = key === "approved" && isActive !== false;

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center px-2 py-0.5 text-xs font-semibold rounded-full",
        MODERATION_CHIP_CLASS[key] ?? MODERATION_CHIP_CLASS.approved,
        className
      )}
    >
      {published ? "Published" : label}
    </span>
  );
}

/** Account-type chip: Builder / Owner / Agent. */
export function AccountTypeBadge({
  type,
  isVerified,
  className,
}: {
  type: unknown;
  isVerified?: boolean;
  className?: string;
}) {
  const normalized = String((type as string) ?? "builder").toLowerCase();

  const chip =
    normalized === "owner"
      ? "bg-emerald-100 text-emerald-700"
      : normalized === "agent"
      ? "bg-purple-100 text-purple-700"
      : "bg-brand-100 text-brand-700";

  const label =
    normalized === "owner"
      ? "Owner"
      : normalized === "agent"
      ? "Agent"
      : "Builder";

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full",
        chip,
        className
      )}
    >
      {isVerified ? "✓ " : ""}
      {label}
    </span>
  );
}
