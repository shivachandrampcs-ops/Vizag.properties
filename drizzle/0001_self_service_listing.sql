CREATE TYPE "public"."contact_preference" AS ENUM('call', 'whatsapp', 'both');--> statement-breakpoint
CREATE TYPE "public"."moderation_status" AS ENUM('draft', 'pending_review', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."publisher_type" AS ENUM('builder', 'owner', 'agent');--> statement-breakpoint
ALTER TABLE "builders" ADD COLUMN "publisher_type" "publisher_type" DEFAULT 'builder' NOT NULL;--> statement-breakpoint
ALTER TABLE "builders" ADD COLUMN "company_name" varchar(200);--> statement-breakpoint
ALTER TABLE "builders" ADD COLUMN "whatsapp_number" varchar(20);--> statement-breakpoint
ALTER TABLE "builders" ADD COLUMN "locality" varchar(120);--> statement-breakpoint
ALTER TABLE "builders" ADD COLUMN "city" varchar(100);--> statement-breakpoint
ALTER TABLE "builders" ADD COLUMN "verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "builders" ADD COLUMN "verified_by" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "approval_info" varchar(500);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "contact_preference" "contact_preference" DEFAULT 'both' NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "moderation_status" "moderation_status" DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "submitted_at" timestamp;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "reviewed_by" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "published_at" timestamp;--> statement-breakpoint
ALTER TABLE "property_images" ADD COLUMN "provider" varchar(30) DEFAULT 'url' NOT NULL;--> statement-breakpoint
ALTER TABLE "property_images" ADD COLUMN "public_id" varchar(255);--> statement-breakpoint
ALTER TABLE "property_images" ADD COLUMN "width" integer;--> statement-breakpoint
ALTER TABLE "property_images" ADD COLUMN "height" integer;--> statement-breakpoint
ALTER TABLE "property_images" ADD COLUMN "bytes" integer;--> statement-breakpoint
ALTER TABLE "property_images" ADD COLUMN "format" varchar(20);--> statement-breakpoint
ALTER TABLE "builders" ADD CONSTRAINT "builders_verified_by_admins_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_reviewed_by_admins_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "builders_publisher_type_idx" ON "builders" USING btree ("publisher_type");--> statement-breakpoint
CREATE INDEX "builders_is_verified_idx" ON "builders" USING btree ("is_verified");--> statement-breakpoint
CREATE INDEX "leads_assigned_builder_idx" ON "leads" USING btree ("assigned_builder_id");--> statement-breakpoint
CREATE INDEX "properties_moderation_idx" ON "properties" USING btree ("moderation_status");--> statement-breakpoint
CREATE INDEX "properties_published_idx" ON "properties" USING btree ("moderation_status","is_active");--> statement-breakpoint
-- Backfill (idempotent): every listing that existed before the moderation
-- workflow was introduced is treated as already reviewed and published, so the
-- live site keeps serving them without any manual review step.
UPDATE "properties" SET "moderation_status" = 'approved', "published_at" = COALESCE("published_at", "created_at") WHERE "published_at" IS NULL;--> statement-breakpoint
UPDATE "builders" SET "publisher_type" = 'builder' WHERE "publisher_type" IS NULL;--> statement-breakpoint
UPDATE "property_images" SET "provider" = 'url' WHERE "provider" IS NULL;
