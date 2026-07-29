import { z } from "zod";

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

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

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
  isFeatured: z.coerce.boolean().default(false),
  amenities: z.string().optional().or(z.literal("")),
  highlights: z.string().optional().or(z.literal("")),
});

export type PropertyInput = z.infer<typeof propertySchema>;

export const builderProfileSchema = z.object({
  name: z.string().min(2).max(200),
  phone: z.string().min(10).max(20),
  description: z.string().max(2000).optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  experienceYears: z.coerce.number().int().min(0).max(100).default(0),
  projectsCount: z.coerce.number().int().min(0).default(0),
});

export type BuilderProfileInput = z.infer<typeof builderProfileSchema>;
