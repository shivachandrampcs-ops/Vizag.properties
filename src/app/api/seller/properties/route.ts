import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { propertyImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { propertyPayloadSchema } from "@/lib/validations";
import { requireSeller, readJson } from "@/lib/api-guards";
import { createProperty } from "@/lib/property-service";
import { getSellerProperties } from "@/lib/queries";

export const dynamic = "force-dynamic";

/** Lists the authenticated seller's own properties (all moderation states). */
export async function GET() {
  try {
    const guard = await requireSeller();
    if (!guard.ok) return guard.response;

    const list = await getSellerProperties(guard.session.id);
    return NextResponse.json({ success: true, properties: list });
  } catch (err) {
    console.error("Seller properties list error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

/** Creates a property owned by the authenticated seller. */
export async function POST(req: NextRequest) {
  try {
    const guard = await requireSeller();
    if (!guard.ok) return guard.response;

    const body = await readJson(req);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const parsed = propertyPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Please check the form and try again",
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const result = await createProperty({
      payload: parsed.data,
      actor: "seller",
      accountId: guard.session.id,
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({ success: true, property: result.property });
  } catch (err) {
    console.error("Seller property create error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Server error",
      },
      { status: 500 }
    );
  }
}

/** Small helper used by the dashboard to fetch images for one property. */
export async function getPropertyImages(propertyId: number) {
  return db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, propertyId));
}
