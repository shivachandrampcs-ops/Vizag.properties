import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import { adminPropertyPayloadSchema } from "@/lib/validations";
import { requireAdmin, readJson } from "@/lib/api-guards";
import {
  deletePropertyCascade,
  updateProperty,
} from "@/lib/property-service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
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

    const body = await readJson(req);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const parsed = adminPropertyPayloadSchema.safeParse(body);
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

    const result = await updateProperty(propertyId, {
      payload: parsed.data,
      actor: "admin",
      accountId: guard.session.id,
      adminId: guard.session.id,
      targetAccountId: parsed.data.builderId,
      existing,
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin property update error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
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

    const [existing] = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    await deletePropertyCascade(propertyId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin property delete error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
