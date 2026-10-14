CREATE TYPE "public"."property_area_unit" AS ENUM('sqft', 'sqyd');--> statement-breakpoint
ALTER TABLE "builders" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "builders" ADD COLUMN "phone_e164" varchar(16);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "area_unit" "property_area_unit";--> statement-breakpoint
CREATE INDEX "builders_phone_idx" ON "builders" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "builders_phone_e164_unique_idx" ON "builders" USING btree ("phone_e164") WHERE "builders"."phone_e164" IS NOT NULL;