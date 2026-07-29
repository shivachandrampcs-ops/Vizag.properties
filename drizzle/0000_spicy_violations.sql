CREATE TYPE "public"."furnishing" AS ENUM('unfurnished', 'semi_furnished', 'fully_furnished');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'qualified', 'closed', 'lost');--> statement-breakpoint
CREATE TYPE "public"."property_status" AS ENUM('ready_to_move', 'under_construction', 'new_launch', 'resale');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('apartment', 'villa', 'plot', 'independent_house', 'commercial', 'penthouse');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'builder');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(200) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "builders" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"email" varchar(200) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"password_hash" text NOT NULL,
	"description" text,
	"logo" text,
	"website" varchar(255),
	"address" text,
	"experience_years" integer DEFAULT 0,
	"projects_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "builders_slug_unique" UNIQUE("slug"),
	CONSTRAINT "builders_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(200) NOT NULL,
	"budget" varchar(100),
	"preferred_location" varchar(200),
	"property_id" integer,
	"property_type" varchar(50),
	"message" text,
	"source" varchar(100) DEFAULT 'website',
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"assigned_builder_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"builder_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"property_type" "property_type" NOT NULL,
	"status" "property_status" DEFAULT 'ready_to_move' NOT NULL,
	"furnishing" "furnishing" DEFAULT 'unfurnished',
	"price" integer NOT NULL,
	"price_per_sqft" integer,
	"area" integer NOT NULL,
	"bedrooms" integer DEFAULT 0,
	"bathrooms" integer DEFAULT 0,
	"balconies" integer DEFAULT 0,
	"floor" integer,
	"total_floors" integer,
	"facing" varchar(50),
	"address" text NOT NULL,
	"location" varchar(100) NOT NULL,
	"city" varchar(100) DEFAULT 'Visakhapatnam' NOT NULL,
	"state" varchar(100) DEFAULT 'Andhra Pradesh' NOT NULL,
	"pincode" varchar(10),
	"latitude" varchar(50),
	"longitude" varchar(50),
	"amenities" text[] DEFAULT ARRAY[]::text[],
	"highlights" text[] DEFAULT ARRAY[]::text[],
	"rera_id" varchar(100),
	"is_featured" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"views" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "properties_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "property_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"alt_text" varchar(255),
	"is_cover" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_builder_id_builders_id_fk" FOREIGN KEY ("assigned_builder_id") REFERENCES "public"."builders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_builder_id_builders_id_fk" FOREIGN KEY ("builder_id") REFERENCES "public"."builders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "builders_email_idx" ON "builders" USING btree ("email");--> statement-breakpoint
CREATE INDEX "builders_slug_idx" ON "builders" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "leads_phone_idx" ON "leads" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "properties_slug_idx" ON "properties" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "properties_location_idx" ON "properties" USING btree ("location");--> statement-breakpoint
CREATE INDEX "properties_type_idx" ON "properties" USING btree ("property_type");--> statement-breakpoint
CREATE INDEX "properties_builder_idx" ON "properties" USING btree ("builder_id");--> statement-breakpoint
CREATE INDEX "property_images_property_idx" ON "property_images" USING btree ("property_id");