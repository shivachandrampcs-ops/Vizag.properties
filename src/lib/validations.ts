import { z } from "zod";
import {
  MAX_PROPERTY_IMAGES,
  MIN_REJECTION_REASON_LENGTH,
} from "./constants";

// ────────────────────────────────────────────────────────────
// LEADS
// ────────────────────────────────────────────────────────────

export const leadSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(/^[+\d\s()-]+$/, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  budget: z.string().max(100).optional().or(z.literal("")),
  preferredLocation: z.string().max(200).optional().or(z.literal("")),
  propertyId: z.coerce.number().int().positive().optional().nullable(),
  propertyType: z.string().max(50).optional().or(z.literal("")),
  message: z
    .string()
    .max(2000, "Message is too long")
    .optional()
    .or(z.literal("")),
  source: z.string().max(100).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

// ────────────────────────────────────────────────────────────
// AUTH
// ────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

const indianPhone = z
  .string()
  .trim()
  .min(10, "Please enter a valid mobile number")
  .max(15, "Mobile number is too long")
  .regex(/^\+?\d[\d\s()-]{8,13}\d$/, "Please enter a valid mobile number");

/** Self-service registration for Builders, Property Owners and Agents. */
export const registrationSchema = z
  .object({
    accountType: z.enum(["builder", "owner", "agent"], {
      message: "Please choose the type of account",
    }),
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(200, "Full name is too long"),
    companyName: z
      .string()
      .trim()
      .max(200, "Company name is too long")
      .optional()
      .or(z.literal("")),
    email: z.string().trim().email("Please enter a valid email address"),
    mobile: indianPhone,
    whatsapp: z
      .string()
      .trim()
      .max(15, "WhatsApp number is too long")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(200, "Password is too long"),
    confirmPassword: z.string(),
    city: z
      .string()
      .trim()
      .max(100, "City is too long")
      .optional()
      .or(z.literal("")),
    locality: z
      .string()
      .trim()
      .max(120, "Locality is too long")
      .optional()
      .or(z.literal("")),
    address: z
      .string()
      .trim()
      .max(500, "Address is too long")
      .optional()
      .or(z.literal("")),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;

// ────────────────────────────────────────────────────────────
// PROPERTIES
// ────────────────────────────────────────────────────────────

/** http(s) URL or a root-relative path (used by the dev-only local provider). */
const imageUrlSchema = z
  .string()
  .trim()
  .min(1, "Image URL is required")
  .max(2048, "Image URL is too long")
  .refine(
    (v) => /^https?:\/\//i.test(v) || v.startsWith("/"),
    "Image must be a valid URL"
  );

/** One image in the property form: an uploaded asset or a plain URL. */
export const propertyImageInputSchema = z.object({
  imageUrl: imageUrlSchema,
  altText: z.string().max(255).optional().nullable(),
  isCover: z.boolean().optional().nullable(),
  sortOrder: z.number().int().min(0).max(100).optional().nullable(),
  // metadata from the upload pipeline
  provider: z.enum(["url", "cloudinary", "local"]).optional().nullable(),
  publicId: z.string().max(255).optional().nullable(),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  bytes: z.number().int().positive().optional().nullable(),
  format: z.string().max(20).optional().nullable(),
});

export type PropertyImageInput = z.infer<typeof propertyImageInputSchema>;

export const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(255),
  description: z.string().min(20, "Description must be at least 20 characters"),
  propertyType: z.enum([
    "apartment",
    "villa",
    "plot",
    "independent_house",
    "commercial",
    "penthouse",
  ]),
  status: z.enum([
    "ready_to_move",
    "under_construction",
    "new_launch",
    "resale",
  ]),
  furnishing: z.enum(["unfurnished", "semi_furnished", "fully_furnished"]),
  price: z.coerce.number().int().positive("Price must be positive"),
  pricePerSqft: z.coerce.number().int().positive().optional().nullable(),
  area: z.coerce.number().int().positive("Area must be positive"),
  bedrooms: z.coerce.number().int().min(0).default(0),
  bathrooms: z.coerce.number().int().min(0).default(0),
  balconies: z.coerce.number().int().min(0).default(0),
  floor: z.coerce.number().int().optional().nullable(),
  totalFloors: z.coerce.number().int().optional().nullable(),
  facing: z.string().max(50).optional().or(z.literal("")),
  address: z.string().min(5, "Address is required"),
  location: z.string().min(2, "Location is required").max(100),
  city: z.string().default("Visakhapatnam"),
  state: z.string().default("Andhra Pradesh"),
  pincode: z.string().max(10).optional().or(z.literal("")),
  latitude: z.string().max(50).optional().or(z.literal("")),
  longitude: z.string().max(50).optional().or(z.literal("")),
  reraId: z.string().max(100).optional().or(z.literal("")),
  /** Free-text legal/approval information (DTCP, municipal approvals, ...). */
  approvalInfo: z.string().max(500).optional().or(z.literal("")),
  contactPreference: z.enum(["call", "whatsapp", "both"]).default("both"),
  isFeatured: z.coerce.boolean().default(false),
  amenities: z.string().optional().or(z.literal("")),
  highlights: z.string().optional().or(z.literal("")),
});

export type PropertyInput = z.infer<typeof propertySchema>;

/** "draft" keeps the listing private, "submit" sends it to admin review. */
export const propertyIntentSchema = z.enum(["draft", "submit"]);

/**
 * Payload accepted by the seller/admin property endpoints.
 * `images` are validated here (server-side) instead of being trusted blindly.
 */
export const propertyPayloadSchema = propertySchema.extend({
  intent: propertyIntentSchema.default("draft"),
  images: z
    .array(propertyImageInputSchema)
    .max(MAX_PROPERTY_IMAGES, `You can add at most ${MAX_PROPERTY_IMAGES} images`)
    .default([]),
});

export type PropertyPayloadInput = z.infer<typeof propertyPayloadSchema>;

export const adminPropertySchema = propertySchema.extend({
  builderId: z.coerce.number().int().positive("Please select a builder"),
});

export type AdminPropertyInput = z.infer<typeof adminPropertySchema>;

export const adminPropertyPayloadSchema = propertyPayloadSchema.extend({
  builderId: z.coerce.number().int().positive("Please select a builder"),
});

// ────────────────────────────────────────────────────────────
// MODERATION
// ────────────────────────────────────────────────────────────

export const moderationActionSchema = z
  .object({
    action: z.enum(["approve", "reject", "unpublish"]),
    rejectionReason: z
      .string()
      .trim()
      .max(1000, "Rejection reason is too long")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (d) =>
      d.action !== "reject" ||
      (d.rejectionReason ?? "").length >= MIN_REJECTION_REASON_LENGTH,
    {
      message: "Please enter a reason for rejecting this property",
      path: ["rejectionReason"],
    }
  );

export type ModerationActionInput = z.infer<typeof moderationActionSchema>;

export const userVerificationSchema = z.object({
  isVerified: z.boolean(),
});

export const userStatusSchema = z.object({
  isActive: z.boolean(),
});

// ────────────────────────────────────────────────────────────
// PROFILES
// ────────────────────────────────────────────────────────────

/** Seller profile form — shared by builders, owners and agents. */
export const sellerProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(200),
  companyName: z
    .string()
    .trim()
    .max(200, "Company name is too long")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(10, "Please enter a valid phone number")
    .max(20, "Phone number is too long"),
  whatsappNumber: z
    .string()
    .trim()
    .max(20, "WhatsApp number is too long")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("Please enter a valid email address"),
  locality: z
    .string()
    .trim()
    .max(120, "Locality is too long")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .max(100, "City is too long")
    .optional()
    .or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  experienceYears: z.coerce.number().int().min(0).max(100).default(0),
  projectsCount: z.coerce.number().int().min(0).default(0),
});

export type SellerProfileInput = z.infer<typeof sellerProfileSchema>;

/**
 * Backwards-compatible name for the original builder profile form.
 * Extra fields are allowed so the existing builder form keeps working.
 */
export const builderProfileSchema = sellerProfileSchema.partial({
  companyName: true,
  whatsappNumber: true,
  email: true,
  locality: true,
  city: true,
});

export type BuilderProfileInput = z.infer<typeof builderProfileSchema>;
