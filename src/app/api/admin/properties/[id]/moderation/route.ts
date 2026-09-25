import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties, builders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { moderationActionSchema } from "@/lib/validations";
import { requireAdmin, readJson } from "@/lib/api-guards";
import { notify } from "@/lib/notifications";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * Admin moderation actions on a seller-submitted property:
 *   approve  → moderation_status = approved, published
 *   reject   → moderation_status = rejected + rejection reason (required)
 *   unpublish→ keeps approved but hides it from the public site (is_active=false)
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const propertyId = Number(id);
    if (!Number.isInteger(propertyId) || propertyId <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid property id" },
        { status: 400 }
      );
    }

    const body = await readJson(req);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const parsed = moderationActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ??
            "Please check the moderation action",
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    const { action, rejectionReason } = parsed.data;
    const now = new Date();

    let update: Partial<typeof properties.$inferSelect> = {};

    if (action === "approve") {
      update = {
        moderationStatus: "approved",
        rejectionReason: null,
        reviewedAt: now,
        reviewedBy: guard.session.id,
        publishedAt: existing.publishedAt ?? now,
        isActive: true,
        updatedAt: now,
      };
    } else if (action === "reject") {
      update = {
        moderationStatus: "rejected",
        rejectionReason: (rejectionReason ?? "").trim(),
        reviewedAt: now,
        reviewedBy: guard.session.id,
        publishedAt: null,
        updatedAt: now,
      };
    } else {
      update = {
        isActive: false,
        reviewedAt: now,
        reviewedBy: guard.session.id,
        updatedAt: now,
      };
    }

    await db
      .update(properties)
      .set(update)
      .where(eq(properties.id, propertyId));

    const [owner] = await db
      .select({ email: builders.email, name: builders.name })
      .from(builders)
      .where(eq(builders.id, existing.builderId))
      .limit(1);

    if (action === "approve") {
      void notify("property_approved", {
        to: { email: owner?.email },
        data: { propertyId, title: existing.title },
      });
    } else if (action === "reject") {
      void notify("property_rejected", {
        to: { email: owner?.email },
        data: {
          propertyId,
          title: existing.title,
          reason: (rejectionReason ?? "").trim(),
        },
      });
    }

    return NextResponse.json({ success: true, moderationStatus: update.moderationStatus });
  } catch (err) {
    console.error("Moderation error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Server error",
      },
      { status: 500 }
    );
  }
}
