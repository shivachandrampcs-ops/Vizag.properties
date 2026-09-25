import { db } from "@/db";
import {
  properties,
  propertyImages,
  builders,
  leads,
} from "@/db/schema";
import { and, desc, eq, sql, ilike, or, count, inArray } from "drizzle-orm";
import { createPropertySlug, createSlug } from "./slug";
import { normalizePublisherType } from "./publishers";

export { createSlug, createPropertySlug };

type PropertyRow = typeof properties.$inferSelect;
type BuilderRow = typeof builders.$inferSelect;
type ImageRow = typeof propertyImages.$inferSelect;

/** Seller/account summary attached to every public property. */
export type SellerSummary = {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string;
  whatsappNumber: string | null;
  companyName: string | null;
  logo: string | null;
  description: string | null;
  experienceYears: number | null;
  projectsCount: number | null;
  /** builder | owner | agent */
  publisherType: string;
  /** True only when an admin has verified the account. */
  isVerified: boolean;
};

export type PropertyImageSummary = {
  id: number;
  imageUrl: string;
  altText: string | null;
  isCover: boolean | null;
  sortOrder: number | null;
  provider: string | null;
  publicId: string | null;
};

export type PropertyWithRelations = {
  id: number;
  title: string;
  slug: string;
  description: string;
  propertyType: string;
  status: string;
  furnishing: string | null;
  price: number;
  pricePerSqft: number | null;
  area: number;
  bedrooms: number | null;
  bathrooms: number | null;
  balconies: number | null;
  floor: number | null;
  totalFloors: number | null;
  facing: string | null;
  address: string;
  location: string;
  city: string;
  state: string;
  pincode: string | null;
  latitude: string | null;
  longitude: string | null;
  amenities: string[];
  highlights: string[];
  reraId: string | null;
  approvalInfo: string | null;
  contactPreference: string | null;
  isFeatured: boolean;
  isActive: boolean;
  views: number;
  moderationStatus: string;
  rejectionReason: string | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  builderId: number;
  seller: SellerSummary;
  /** Alias kept for backwards compatibility with older components. */
  builder: SellerSummary;
  images: PropertyImageSummary[];
  coverImage: string | null;
};

function toSellerSummary(builder: BuilderRow): SellerSummary {
  return {
    id: builder.id,
    name: builder.name,
    slug: builder.slug,
    email: builder.email,
    phone: builder.phone,
    whatsappNumber: builder.whatsappNumber ?? null,
    companyName: builder.companyName ?? null,
    logo: builder.logo ?? null,
    description: builder.description ?? null,
    experienceYears: builder.experienceYears ?? null,
    projectsCount: builder.projectsCount ?? null,
    publisherType: normalizePublisherType(builder.publisherType),
    isVerified: Boolean(builder.isVerified),
  };
}

function toImageSummary(image: ImageRow): PropertyImageSummary {
  return {
    id: image.id,
    imageUrl: image.imageUrl,
    altText: image.altText ?? null,
    isCover: image.isCover ?? false,
    sortOrder: image.sortOrder ?? 0,
    provider: image.provider ?? "url",
    publicId: image.publicId ?? null,
  };
}

function sortImages(images: PropertyImageSummary[]): PropertyImageSummary[] {
  return [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

function coverOf(images: PropertyImageSummary[]): string | null {
  return images.find((i) => i.isCover)?.imageUrl ?? images[0]?.imageUrl ?? null;
}

function mapProperty(
  row: PropertyRow,
  builder: BuilderRow,
  images: ImageRow[]
): PropertyWithRelations {
  const sortedImages = sortImages(images.map(toImageSummary));
  const seller = toSellerSummary(builder);
  return {
    ...row,
    amenities: row.amenities ?? [],
    highlights: row.highlights ?? [],
    isFeatured: Boolean(row.isFeatured),
    isActive: Boolean(row.isActive),
    views: row.views ?? 0,
    builderId: row.builderId,
    seller,
    builder: seller,
    images: sortedImages,
    coverImage: coverOf(sortedImages),
  };
}

/**
 * Efficiently attaches seller + images to a set of properties
 * (2 queries instead of 2N).
 */
async function enrich(
  rows: PropertyRow[]
): Promise<PropertyWithRelations[]> {
  if (rows.length === 0) return [];

  const builderIds = Array.from(new Set(rows.map((r) => r.builderId)));
  const propertyIds = rows.map((r) => r.id);

  const [builderRows, imageRows] = await Promise.all([
    db.select().from(builders).where(inArray(builders.id, builderIds)),
    db
      .select()
      .from(propertyImages)
      .where(inArray(propertyImages.propertyId, propertyIds)),
  ]);

  const builderMap = new Map(builderRows.map((b) => [b.id, b]));
  const imageMap = new Map<number, ImageRow[]>();
  for (const image of imageRows) {
    const list = imageMap.get(image.propertyId) ?? [];
    list.push(image);
    imageMap.set(image.propertyId, list);
  }

  return rows
    .map((row) => {
      const builder = builderMap.get(row.builderId);
      if (!builder) return null;
      return mapProperty(row, builder, imageMap.get(row.id) ?? []);
    })
    .filter((p): p is PropertyWithRelations => p !== null);
}

/** Public visibility rule: active AND admin-approved. */
export const PUBLIC_PROPERTY_CONDITIONS = [
  eq(properties.isActive, true),
  eq(properties.moderationStatus, "approved"),
] as const;

// ────────────────────────────────────────────────────────────
// PUBLIC QUERIES (approved listings only)
// ────────────────────────────────────────────────────────────

export async function getFeaturedProperties(limit = 6) {
  const rows = await db
    .select()
    .from(properties)
    .where(
      and(
        eq(properties.isActive, true),
        eq(properties.moderationStatus, "approved"),
        eq(properties.isFeatured, true)
      )
    )
    .orderBy(desc(properties.createdAt))
    .limit(limit);

  return enrich(rows);
}

export async function getLatestProperties(limit = 8) {
  const rows = await db
    .select()
    .from(properties)
    .where(and(...PUBLIC_PROPERTY_CONDITIONS))
    .orderBy(desc(properties.createdAt))
    .limit(limit);

  return enrich(rows);
}

export type PropertyFilters = {
  search?: string;
  location?: string;
  propertyType?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
};

export async function getProperties(filters: PropertyFilters = {}) {
  const conditions = [...PUBLIC_PROPERTY_CONDITIONS];

  if (filters.search) {
    const term = `%${filters.search.toLowerCase()}%`;
    conditions.push(
      or(
        ilike(properties.title, term),
        ilike(properties.description, term),
        ilike(properties.location, term),
        ilike(properties.address, term)
      )!
    );
  }
  if (filters.location) {
    conditions.push(eq(properties.location, filters.location));
  }
  if (filters.propertyType) {
    conditions.push(
      eq(properties.propertyType, filters.propertyType as PropertyRow["propertyType"])
    );
  }
  if (filters.status) {
    conditions.push(eq(properties.status, filters.status as PropertyRow["status"]));
  }
  if (filters.minPrice !== undefined) {
    conditions.push(sql`${properties.price} >= ${filters.minPrice}`);
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(sql`${properties.price} <= ${filters.maxPrice}`);
  }
  if (filters.bedrooms !== undefined) {
    conditions.push(eq(properties.bedrooms, filters.bedrooms));
  }

  const rows = await db
    .select()
    .from(properties)
    .where(and(...conditions))
    .orderBy(desc(properties.createdAt));

  return enrich(rows);
}

export async function getPropertyBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(properties)
    .where(
      and(
        eq(properties.slug, slug),
        eq(properties.isActive, true),
        eq(properties.moderationStatus, "approved")
      )
    )
    .limit(1);

  if (!row) return null;

  const [builder] = await db
    .select()
    .from(builders)
    .where(eq(builders.id, row.builderId))
    .limit(1);
  if (!builder) return null;

  const images = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, row.id));

  return mapProperty(row, builder, images);
}

export async function getRelatedProperties(
  propertyId: number,
  propertyType: string,
  location: string,
  limit = 3
) {
  const rows = await db
    .select()
    .from(properties)
    .where(
      and(
        ...PUBLIC_PROPERTY_CONDITIONS,
        eq(properties.propertyType, propertyType as PropertyRow["propertyType"]),
        sql`${properties.id} <> ${propertyId}`
      )
    )
    .orderBy(desc(properties.createdAt))
    .limit(limit);

  const list = await enrich(rows);
  if (list.length >= limit) return list;

  // Fall back to any approved property when there are not enough of this type.
  const more = await db
    .select()
    .from(properties)
    .where(
      and(...PUBLIC_PROPERTY_CONDITIONS, sql`${properties.id} <> ${propertyId}`)
    )
    .orderBy(desc(properties.createdAt))
    .limit(limit * 3);

  const seen = new Set(list.map((p) => p.id));
  const fallback = (await enrich(more)).filter((p) => !seen.has(p.id));
  return [...list, ...fallback].slice(0, limit);
}

// ────────────────────────────────────────────────────────────
// SELLER DASHBOARD QUERIES (own properties only)
// ────────────────────────────────────────────────────────────

export type SellerPropertyListItem = PropertyRow & {
  images: PropertyImageSummary[];
  coverImage: string | null;
  leadCount: number;
  newLeadCount: number;
};

export async function getSellerProperties(accountId: number) {
  const rows = await db
    .select()
    .from(properties)
    .where(eq(properties.builderId, accountId))
    .orderBy(desc(properties.createdAt));

  if (rows.length === 0) return [];

  const propertyIds = rows.map((r) => r.id);

  const [imageRows, leadRows] = await Promise.all([
    db
      .select()
      .from(propertyImages)
      .where(inArray(propertyImages.propertyId, propertyIds)),
    db
      .select({
        propertyId: leads.propertyId,
        total: count(),
        newLeads: sql<number>`sum(case when ${leads.status} = 'new' then 1 else 0 end)`,
      })
      .from(leads)
      .where(inArray(leads.propertyId, propertyIds))
      .groupBy(leads.propertyId),
  ]);

  const imageMap = new Map<number, ImageRow[]>();
  for (const image of imageRows) {
    const list = imageMap.get(image.propertyId) ?? [];
    list.push(image);
    imageMap.set(image.propertyId, list);
  }

  const leadMap = new Map(
    leadRows
      .filter((r) => r.propertyId !== null)
      .map((r) => [r.propertyId as number, { total: Number(r.total), new: Number(r.newLeads ?? 0) }])
  );

  return rows.map((row) => {
    const images = sortImages((imageMap.get(row.id) ?? []).map(toImageSummary));
    return {
      ...row,
      images,
      coverImage: coverOf(images),
      leadCount: leadMap.get(row.id)?.total ?? 0,
      newLeadCount: leadMap.get(row.id)?.new ?? 0,
    } satisfies SellerPropertyListItem;
  });
}

/** Backwards-compatible alias (existing imports keep working). */
export async function getAllBuilderProperties(builderId: number) {
  return getSellerProperties(builderId);
}

export async function getSellerStats(accountId: number) {
  const [totalRow] = await db
    .select({ value: count() })
    .from(properties)
    .where(eq(properties.builderId, accountId));

  const [pendingRow] = await db
    .select({ value: count() })
    .from(properties)
    .where(
      and(
        eq(properties.builderId, accountId),
        eq(properties.moderationStatus, "pending_review")
      )
    );

  const [approvedRow] = await db
    .select({ value: count() })
    .from(properties)
    .where(
      and(
        eq(properties.builderId, accountId),
        eq(properties.moderationStatus, "approved")
      )
    );

  const [rejectedRow] = await db
    .select({ value: count() })
    .from(properties)
    .where(
      and(
        eq(properties.builderId, accountId),
        eq(properties.moderationStatus, "rejected")
      )
    );

  const [draftRow] = await db
    .select({ value: count() })
    .from(properties)
    .where(
      and(
        eq(properties.builderId, accountId),
        eq(properties.moderationStatus, "draft")
      )
    );

  const [viewsRow] = await db
    .select({ value: sql<number>`coalesce(sum(${properties.views}), 0)` })
    .from(properties)
    .where(eq(properties.builderId, accountId));

  const [leadsRow] = await db
    .select({ value: count() })
    .from(leads)
    .where(eq(leads.assignedBuilderId, accountId));

  return {
    total: Number(totalRow?.value ?? 0),
    pending: Number(pendingRow?.value ?? 0),
    approved: Number(approvedRow?.value ?? 0),
    rejected: Number(rejectedRow?.value ?? 0),
    draft: Number(draftRow?.value ?? 0),
    views: Number(viewsRow?.value ?? 0),
    leads: Number(leadsRow?.value ?? 0),
  };
}

export async function getSellerLeads(accountId: number) {
  return db
    .select({
      lead: leads,
      property: properties,
    })
    .from(leads)
    .leftJoin(properties, eq(leads.propertyId, properties.id))
    .where(
      or(
        eq(leads.assignedBuilderId, accountId),
        sql`${properties.builderId} = ${accountId}`
      )
    )
    .orderBy(desc(leads.createdAt));
}

/** Backwards-compatible alias. */
export const getBuilderLeads = getSellerLeads;

// ────────────────────────────────────────────────────────────
// LEADS (admin)
// ────────────────────────────────────────────────────────────

export async function getAllLeads() {
  return db
    .select({
      lead: leads,
      property: properties,
      builder: builders,
    })
    .from(leads)
    .leftJoin(properties, eq(leads.propertyId, properties.id))
    .leftJoin(builders, eq(leads.assignedBuilderId, builders.id))
    .orderBy(desc(leads.createdAt));
}

// ────────────────────────────────────────────────────────────
// ACCOUNTS (admin)
// ────────────────────────────────────────────────────────────

export async function getAllAccounts() {
  return db.select().from(builders).orderBy(desc(builders.createdAt));
}

/** Backwards-compatible alias. */
export const getAllBuilders = getAllAccounts;

export async function getAccountById(id: number) {
  const [account] = await db
    .select()
    .from(builders)
    .where(eq(builders.id, id))
    .limit(1);
  return account ?? null;
}

export const getBuilderBySlug = async (slug: string) => {
  const [builder] = await db
    .select()
    .from(builders)
    .where(eq(builders.slug, slug))
    .limit(1);
  return builder ?? null;
};

// ────────────────────────────────────────────────────────────
// ADMIN: ALL PROPERTIES + MODERATION QUEUE
// ────────────────────────────────────────────────────────────

export type AdminPropertyFilters = {
  moderationStatus?: string;
  search?: string;
};

export async function getAdminProperties(
  filters: AdminPropertyFilters = {}
): Promise<PropertyWithRelations[]> {
  const conditions = [];
  if (
    filters.moderationStatus &&
    ["draft", "pending_review", "approved", "rejected"].includes(
      filters.moderationStatus
    )
  ) {
    conditions.push(
      eq(
        properties.moderationStatus,
        filters.moderationStatus as PropertyRow["moderationStatus"]
      )
    );
  }
  if (filters.search) {
    const term = `%${filters.search.toLowerCase()}%`;
    conditions.push(
      or(
        ilike(properties.title, term),
        ilike(properties.location, term),
        ilike(properties.address, term)
      )!
    );
  }

  const rows = await db
    .select()
    .from(properties)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(properties.createdAt));

  return enrich(rows);
}

/** The "Property Approvals" queue: newest submissions first. */
export async function getModerationQueue(moderationStatus?: string) {
  return getAdminProperties({
    moderationStatus: moderationStatus || "pending_review",
  });
}

export async function getAdminPropertyById(id: number) {
  const [row] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1);
  if (!row) return null;
  const [builder] = await db
    .select()
    .from(builders)
    .where(eq(builders.id, row.builderId))
    .limit(1);
  if (!builder) return null;
  const images = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, row.id));
  return mapProperty(row, builder, images);
}

// ────────────────────────────────────────────────────────────
// DASHBOARD STATS
// ────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const [props] = await db
    .select({ value: count() })
    .from(properties)
    .where(and(...PUBLIC_PROPERTY_CONDITIONS));
  const [accountsCount] = await db
    .select({ value: count() })
    .from(builders)
    .where(eq(builders.isActive, true));
  const [leadsCount] = await db.select({ value: count() }).from(leads);
  const [newLeadsCount] = await db
    .select({ value: count() })
    .from(leads)
    .where(eq(leads.status, "new"));
  const [pendingCount] = await db
    .select({ value: count() })
    .from(properties)
    .where(eq(properties.moderationStatus, "pending_review"));

  return {
    totalProperties: Number(props?.value ?? 0),
    totalBuilders: Number(accountsCount?.value ?? 0),
    totalLeads: Number(leadsCount?.value ?? 0),
    newLeads: Number(newLeadsCount?.value ?? 0),
    pendingApprovals: Number(pendingCount?.value ?? 0),
  };
}
