import { db } from "@/db";
import {
  properties,
  propertyImages,
  builders,
  leads,
  admins,
} from "@/db/schema";
import { and, desc, eq, sql, ilike, or, count } from "drizzle-orm";
import slugify from "slugify";

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
  isFeatured: boolean;
  isActive: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  builder: {
    id: number;
    name: string;
    slug: string;
    email: string;
    phone: string;
    logo: string | null;
    description: string | null;
    experienceYears: number | null;
    projectsCount: number | null;
  };
  images: { id: number; imageUrl: string; altText: string | null; isCover: boolean | null; sortOrder: number | null }[];
  coverImage: string | null;
};

function mapProperty(row: any, builder: any, images: any[]): PropertyWithRelations {
  const sortedImages = [...images].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );
  const cover =
    sortedImages.find((i) => i.isCover)?.imageUrl ??
    sortedImages[0]?.imageUrl ??
    null;
  return {
    ...row,
    builder,
    images: sortedImages,
    coverImage: cover,
  };
}

export async function getFeaturedProperties(limit = 6) {
  const rows = await db
    .select()
    .from(properties)
    .where(and(eq(properties.isActive, true), eq(properties.isFeatured, true)))
    .orderBy(desc(properties.createdAt))
    .limit(limit);

  const enriched = await Promise.all(
    rows.map(async (p) => {
      const [builder] = await db
        .select()
        .from(builders)
        .where(eq(builders.id, p.builderId))
        .limit(1);
      const images = await db
        .select()
        .from(propertyImages)
        .where(eq(propertyImages.propertyId, p.id));
      return mapProperty(p, builder, images);
    })
  );
  return enriched;
}

export async function getLatestProperties(limit = 8) {
  const rows = await db
    .select()
    .from(properties)
    .where(eq(properties.isActive, true))
    .orderBy(desc(properties.createdAt))
    .limit(limit);

  return Promise.all(
    rows.map(async (p) => {
      const [builder] = await db
        .select()
        .from(builders)
        .where(eq(builders.id, p.builderId))
        .limit(1);
      const images = await db
        .select()
        .from(propertyImages)
        .where(eq(propertyImages.propertyId, p.id));
      return mapProperty(p, builder, images);
    })
  );
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
  const conditions = [eq(properties.isActive, true)];

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
    conditions.push(eq(properties.propertyType, filters.propertyType as any));
  }
  if (filters.status) {
    conditions.push(eq(properties.status, filters.status as any));
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

  return Promise.all(
    rows.map(async (p) => {
      const [builder] = await db
        .select()
        .from(builders)
        .where(eq(builders.id, p.builderId))
        .limit(1);
      const images = await db
        .select()
        .from(propertyImages)
        .where(eq(propertyImages.propertyId, p.id));
      return mapProperty(p, builder, images);
    })
  );
}

export async function getPropertyBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.slug, slug), eq(properties.isActive, true)))
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
        eq(properties.isActive, true),
        eq(properties.propertyType, propertyType as any),
        sql`${properties.id} <> ${propertyId}`
      )
    )
    .limit(limit);

  return Promise.all(
    rows.map(async (p) => {
      const [builder] = await db
        .select()
        .from(builders)
        .where(eq(builders.id, p.builderId))
        .limit(1);
      const images = await db
        .select()
        .from(propertyImages)
        .where(eq(propertyImages.propertyId, p.id));
      return mapProperty(p, builder, images);
    })
  );
}

export async function getAllBuilderProperties(builderId: number) {
  const rows = await db
    .select()
    .from(properties)
    .where(eq(properties.builderId, builderId))
    .orderBy(desc(properties.createdAt));

  return Promise.all(
    rows.map(async (p) => {
      const images = await db
        .select()
        .from(propertyImages)
        .where(eq(propertyImages.propertyId, p.id));
      const sortedImages = [...images].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      );
      return {
        ...p,
        images: sortedImages,
        coverImage:
          sortedImages.find((i) => i.isCover)?.imageUrl ??
          sortedImages[0]?.imageUrl ??
          null,
      };
    })
  );
}

export async function getBuilderLeads(builderId: number) {
  return db
    .select({
      lead: leads,
      property: properties,
    })
    .from(leads)
    .leftJoin(properties, eq(leads.propertyId, properties.id))
    .where(
      or(
        eq(leads.assignedBuilderId, builderId),
        sql`${properties.builderId} = ${builderId}`
      )
    )
    .orderBy(desc(leads.createdAt));
}

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

export async function getAllBuilders() {
  return db
    .select()
    .from(builders)
    .orderBy(desc(builders.createdAt));
}

export async function getBuilderBySlug(slug: string) {
  const [builder] = await db
    .select()
    .from(builders)
    .where(eq(builders.slug, slug))
    .limit(1);
  return builder ?? null;
}

export async function getDashboardStats() {
  const [props] = await db
    .select({ value: count() })
    .from(properties)
    .where(eq(properties.isActive, true));
  const [buildersCount] = await db
    .select({ value: count() })
    .from(builders)
    .where(eq(builders.isActive, true));
  const [leadsCount] = await db
    .select({ value: count() })
    .from(leads);
  const [newLeadsCount] = await db
    .select({ value: count() })
    .from(leads)
    .where(eq(leads.status, "new"));

  return {
    totalProperties: Number(props?.value ?? 0),
    totalBuilders: Number(buildersCount?.value ?? 0),
    totalLeads: Number(leadsCount?.value ?? 0),
    newLeads: Number(newLeadsCount?.value ?? 0),
  };
}

export function createSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, trim: true });
}
