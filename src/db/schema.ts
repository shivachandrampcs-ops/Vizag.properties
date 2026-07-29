import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ────────────────────────────────────────────────────────────
// ENUMS
// ────────────────────────────────────────────────────────────

export const propertyTypeEnum = pgEnum("property_type", [
  "apartment",
  "villa",
  "plot",
  "independent_house",
  "commercial",
  "penthouse",
]);

export const propertyStatusEnum = pgEnum("property_status", [
  "ready_to_move",
  "under_construction",
  "new_launch",
  "resale",
]);

export const furnishingEnum = pgEnum("furnishing", [
  "unfurnished",
  "semi_furnished",
  "fully_furnished",
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "closed",
  "lost",
]);

export const userRoleEnum = pgEnum("user_role", ["admin", "builder"]);

// ────────────────────────────────────────────────────────────
// BUILDERS
// ────────────────────────────────────────────────────────────

export const builders = pgTable(
  "builders",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    email: varchar("email", { length: 200 }).notNull().unique(),
    phone: varchar("phone", { length: 20 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    description: text("description"),
    logo: text("logo"),
    website: varchar("website", { length: 255 }),
    address: text("address"),
    experienceYears: integer("experience_years").default(0),
    projectsCount: integer("projects_count").default(0),
    isActive: boolean("is_active").default(true),
    isVerified: boolean("is_verified").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (t) => ({
    emailIdx: index("builders_email_idx").on(t.email),
    slugIdx: index("builders_slug_idx").on(t.slug),
  })
);

// ────────────────────────────────────────────────────────────
// ADMINS
// ────────────────────────────────────────────────────────────

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").default("admin").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ────────────────────────────────────────────────────────────
// PROPERTIES
// ────────────────────────────────────────────────────────────

export const properties = pgTable(
  "properties",
  {
    id: serial("id").primaryKey(),
    builderId: integer("builder_id")
      .references(() => builders.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description").notNull(),
    propertyType: propertyTypeEnum("property_type").notNull(),
    status: propertyStatusEnum("status").default("ready_to_move").notNull(),
    furnishing: furnishingEnum("furnishing").default("unfurnished"),
    price: integer("price").notNull(), // in INR
    pricePerSqft: integer("price_per_sqft"),
    area: integer("area").notNull(), // sqft
    bedrooms: integer("bedrooms").default(0),
    bathrooms: integer("bathrooms").default(0),
    balconies: integer("balconies").default(0),
    floor: integer("floor"),
    totalFloors: integer("total_floors"),
    facing: varchar("facing", { length: 50 }),
    address: text("address").notNull(),
    location: varchar("location", { length: 100 }).notNull(), // area in vizag
    city: varchar("city", { length: 100 }).default("Visakhapatnam").notNull(),
    state: varchar("state", { length: 100 })
      .default("Andhra Pradesh")
      .notNull(),
    pincode: varchar("pincode", { length: 10 }),
    latitude: varchar("latitude", { length: 50 }),
    longitude: varchar("longitude", { length: 50 }),
    amenities: text("amenities").array().default(sql`ARRAY[]::text[]`),
    highlights: text("highlights").array().default(sql`ARRAY[]::text[]`),
    reraId: varchar("rera_id", { length: 100 }),
    isFeatured: boolean("is_featured").default(false),
    isActive: boolean("is_active").default(true),
    views: integer("views").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (t) => ({
    slugIdx: index("properties_slug_idx").on(t.slug),
    locationIdx: index("properties_location_idx").on(t.location),
    typeIdx: index("properties_type_idx").on(t.propertyType),
    builderIdx: index("properties_builder_idx").on(t.builderId),
  })
);

// ────────────────────────────────────────────────────────────
// PROPERTY IMAGES
// ────────────────────────────────────────────────────────────

export const propertyImages = pgTable(
  "property_images",
  {
    id: serial("id").primaryKey(),
    propertyId: integer("property_id")
      .references(() => properties.id, { onDelete: "cascade" })
      .notNull(),
    imageUrl: text("image_url").notNull(),
    altText: varchar("alt_text", { length: 255 }),
    isCover: boolean("is_cover").default(false),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    propertyIdx: index("property_images_property_idx").on(t.propertyId),
  })
);

// ────────────────────────────────────────────────────────────
// LEADS
// ────────────────────────────────────────────────────────────

export const leads = pgTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    email: varchar("email", { length: 200 }).notNull(),
    budget: varchar("budget", { length: 100 }),
    preferredLocation: varchar("preferred_location", { length: 200 }),
    propertyId: integer("property_id").references(() => properties.id, {
      onDelete: "set null",
    }),
    propertyType: varchar("property_type", { length: 50 }),
    message: text("message"),
    source: varchar("source", { length: 100 }).default("website"),
    status: leadStatusEnum("status").default("new").notNull(),
    assignedBuilderId: integer("assigned_builder_id").references(
      () => builders.id,
      { onDelete: "set null" }
    ),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: index("leads_email_idx").on(t.email),
    phoneIdx: index("leads_phone_idx").on(t.phone),
    statusIdx: index("leads_status_idx").on(t.status),
  })
);

// ────────────────────────────────────────────────────────────
// RELATIONS
// ────────────────────────────────────────────────────────────

export const buildersRelations = relations(builders, ({ many }) => ({
  properties: many(properties),
  leads: many(leads),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  builder: one(builders, {
    fields: [properties.builderId],
    references: [builders.id],
  }),
  images: many(propertyImages),
  leads: many(leads),
}));

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, {
    fields: [propertyImages.propertyId],
    references: [properties.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  property: one(properties, {
    fields: [leads.propertyId],
    references: [properties.id],
  }),
  assignedBuilder: one(builders, {
    fields: [leads.assignedBuilderId],
    references: [builders.id],
  }),
}));

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────

export type Builder = typeof builders.$inferSelect;
export type NewBuilder = typeof builders.$inferInsert;
export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type PropertyImage = typeof propertyImages.$inferSelect;
export type NewPropertyImage = typeof propertyImages.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
