import { db } from "@/db";
import {
  properties,
  propertyImages,
  builders,
  type NewProperty,
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { createPropertySlug } from "./slug";
import { deleteImage } from "./uploads";
import { notify } from "./notifications";
import type { PropertyPayloadInput } from "./validations";

/**
 * Shared property CRUD used by BOTH the seller API (`/api/seller/properties`)
 * and the admin API (`/api/admin/properties`) so the rules live in one place.
 */

export type ModerationValue =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected";

/** Generates a unique slug, appending -2, -3, ... on collision. */
export async function generateUniqueSlug(
  title: string,
  location?: string | null,
  excludePropertyId?: number
): Promise<string> {
  const base = createPropertySlug(title, location);
  let slug = base;
  let i = 1;
  while (true) {
    const rows = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.slug, slug))
      .limit(1);
    const clash = rows[0];
    if (!clash || clash.id === excludePropertyId) break;
    slug = `${base}-${++i}`;
  }
  return slug;
}

/** Splits a comma separated string into a trimmed, de-duplicated array. */
export function toList(value?: string | null): string[] {
  if (!value) return [];
  return Array.from(
    new Set(
      value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
}

function clean(value?: string | null): string | null {
  const v = (value ?? "").trim();
  return v.length ? v : null;
}

function toNumber(value?: number | null): number | null {
  return value === undefined || value === null || Number.isNaN(value)
    ? null
    : value;
}

type WriteArgs = {
  payload: PropertyPayloadInput;
  /** Who is performing the write — determines ownership + moderation rules. */
  actor: "seller" | "admin";
  /** Seller account id (session derived, never from the request body). */
  accountId: number;
  /** Admin id, when actor === "admin". */
  adminId?: number | null;
  /** Required when actor === "admin": which account owns the listing. */
  targetAccountId?: number;
  /** Existing row, when updating. */
  existing?: typeof properties.$inferSelect;
};

/**
 * Maps the validated payload onto a property row, applying the moderation
 * workflow rules:
 *   - sellers: draft | pending_review (never auto-approved)
 *   - admins:  approved + published immediately
 */
function buildRow({ payload, actor, accountId, adminId, existing }: WriteArgs) {
  const row: Partial<NewProperty> = {
    title: payload.title.trim(),
    description: payload.description.trim(),
    propertyType: payload.propertyType,
    status: payload.status,
    furnishing: payload.furnishing ?? "unfurnished",
    price: payload.price,
    pricePerSqft: toNumber(payload.pricePerSqft),
    area: payload.area,
    bedrooms: payload.bedrooms ?? 0,
    bathrooms: payload.bathrooms ?? 0,
    balconies: payload.balconies ?? 0,
    floor: toNumber(payload.floor),
    totalFloors: toNumber(payload.totalFloors),
    facing: clean(payload.facing),
    address: payload.address.trim(),
    location: payload.location.trim(),
    city: payload.city || "Visakhapatnam",
    state: payload.state || "Andhra Pradesh",
    pincode: clean(payload.pincode),
    latitude: clean(payload.latitude),
    longitude: clean(payload.longitude),
    reraId: clean(payload.reraId),
    approvalInfo: clean(payload.approvalInfo),
    contactPreference: payload.contactPreference ?? "both",
    isFeatured: payload.isFeatured ?? false,
    amenities: toList(payload.amenities),
    highlights: toList(payload.highlights),
    updatedAt: new Date(),
  };

  if (actor === "seller") {
    const submit = payload.intent === "submit";
    const current = existing?.moderationStatus;

    if (!existing) {
      row.builderId = accountId;
      row.moderationStatus = submit ? "pending_review" : "draft";
      row.submittedAt = submit ? new Date() : null;
      row.publishedAt = null;
      row.reviewedAt = null;
      row.reviewedBy = null;
      row.rejectionReason = null;
      row.isActive = true;
    } else {
      // Ownership is enforced by the caller; the owner can never change here.
      if (submit) {
        if (current === "approved") {
          // Live listings stay live after an edit; admins can unpublish/reject
          // if the changes are not acceptable.
          row.moderationStatus = "approved";
        } else {
          row.moderationStatus = "pending_review";
          row.submittedAt = new Date();
          row.rejectionReason = null;
          row.reviewedAt = null;
          row.reviewedBy = null;
        }
      } else if (current === "draft" || current === "rejected") {
        row.moderationStatus = "draft";
      }
    }
  } else {
    // Admin: creating or editing on behalf of an account.
    if (!existing) {
      row.moderationStatus = "approved";
      row.publishedAt = new Date();
      row.reviewedAt = new Date();
      row.reviewedBy = adminId ?? null;
      row.rejectionReason = null;
      row.submittedAt = new Date();
      row.isActive = true;
    }
  }

  return row;
}

/**
 * Replaces the property's images:
 *  • assets that were removed are deleted from the storage provider
 *  • sort order + cover flag come from the client, validated server-side
 */
export async function syncPropertyImages(
  propertyId: number,
  images: PropertyPayloadInput["images"]
) {
  const existingRows = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, propertyId));

  const keepKeys = new Set(
    images.map((img) => img.publicId || img.imageUrl)
  );

  const removed = existingRows.filter(
    (row) => !keepKeys.has(row.publicId || row.imageUrl)
  );

  // Best effort: drop orphaned files from Cloudinary (never blocks the save).
  for (const row of removed) {
    if (row.provider === "cloudinary" || row.provider === "local") {
      void deleteImage(row.publicId ?? "", row.provider);
    }
  }

  await db.delete(propertyImages).where(eq(propertyImages.propertyId, propertyId));

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    await db.insert(propertyImages).values({
      propertyId,
      imageUrl: img.imageUrl,
      altText: (img.altText ?? "").slice(0, 255) || null,
      isCover: img.isCover ?? i === 0,
      sortOrder: img.sortOrder ?? i,
      provider: img.provider ?? "url",
      publicId: img.publicId ?? null,
      width: img.width ?? null,
      height: img.height ?? null,
      bytes: img.bytes ?? null,
      format: img.format ?? null,
    });
  }
}

export async function createProperty(args: WriteArgs) {
  const row = buildRow(args);
  if (args.actor === "admin") {
    if (!args.targetAccountId) {
      return { ok: false as const, status: 400, error: "Please select an account" };
    }
    const [account] = await db
      .select({ id: builders.id })
      .from(builders)
      .where(eq(builders.id, args.targetAccountId))
      .limit(1);
    if (!account) {
      return { ok: false as const, status: 400, error: "Selected account does not exist" };
    }
    row.builderId = args.targetAccountId;
  }

  const slug = await generateUniqueSlug(args.payload.title, args.payload.location);

  const [inserted] = await db
    .insert(properties)
    .values({ ...(row as NewProperty), slug })
    .returning();

  await syncPropertyImages(inserted.id, args.payload.images);

  if (args.actor === "seller" && inserted.moderationStatus === "pending_review") {
    void notify("property_submitted", {
      data: { propertyId: inserted.id, title: inserted.title, accountId: args.accountId },
    });
  }

  return { ok: true as const, property: inserted };
}

export async function updateProperty(
  propertyId: number,
  args: WriteArgs
) {
  const row = buildRow(args);

  if (args.actor === "admin" && args.targetAccountId) {
    const [account] = await db
      .select({ id: builders.id })
      .from(builders)
      .where(eq(builders.id, args.targetAccountId))
      .limit(1);
    if (!account) {
      return { ok: false as const, status: 400, error: "Selected account does not exist" };
    }
    row.builderId = args.targetAccountId;
  }

  await db
    .update(properties)
    .set(row)
    .where(eq(properties.id, propertyId));

  await syncPropertyImages(propertyId, args.payload.images);

  if (
    args.actor === "seller" &&
    (row.moderationStatus as ModerationValue | undefined) === "pending_review"
  ) {
    void notify("property_submitted", {
      data: { propertyId, title: args.payload.title },
    });
  }

  return { ok: true as const };
}

/**
 * Loads a property ONLY if the given account owns it — the single source of
 * truth for IDOR protection in every seller-facing route.
 */
export async function getOwnedProperty(propertyId: number, accountId: number) {
  const [property] = await db
    .select()
    .from(properties)
    .where(
      and(eq(properties.id, propertyId), eq(properties.builderId, accountId))
    )
    .limit(1);
  return property ?? null;
}

/** Ownership check that does not leak whether the property exists. */
export async function assertOwnership(propertyId: number, accountId: number) {
  const property = await getOwnedProperty(propertyId, accountId);
  if (!property) {
    return {
      ok: false as const,
      status: 404,
      error: "Property not found or you do not have access to it",
    };
  }
  return { ok: true as const, property };
}

export async function deletePropertyCascade(propertyId: number) {
  const rows = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, propertyId));

  for (const row of rows) {
    if (row.provider === "cloudinary" || row.provider === "local") {
      void deleteImage(row.publicId ?? "", row.provider);
    }
  }

  await db.delete(properties).where(eq(properties.id, propertyId));
}

/** Increments the public view counter (best effort). */
export async function incrementViews(propertyId: number) {
  await db
    .update(properties)
    .set({ views: sql`${properties.views} + 1` })
    .where(eq(properties.id, propertyId));
}
