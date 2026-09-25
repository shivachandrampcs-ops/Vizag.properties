import { NextRequest, NextResponse } from "next/server";
import { propertyPayloadSchema } from "@/lib/validations";
import { requireSeller, readJson } from "@/lib/api-guards";
import {
  assertOwnership,
  deletePropertyCascade,
  updateProperty,
} from "@/lib/property-service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

async function parseId(params: Params["params"]) {
  const { id } = await params;
  const propertyId = Number(id);
  return Number.isInteger(propertyId) && propertyId > 0 ? propertyId : null;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const guard = await requireSeller();
    if (!guard.ok) return guard.response;

    const propertyId = await parseId(params);
    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: "Invalid property id" },
        { status: 400 }
      );
    }

    const owned = await assertOwnership(propertyId, guard.session.id);
    if (!owned.ok) {
      return NextResponse.json(
        { success: false, error: owned.error },
        { status: owned.status }
      );
    }

    return NextResponse.json({ success: true, property: owned.property });
  } catch (err) {
    console.error("Seller property get error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

/** Updates a property — ownership is verified before anything is written. */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const guard = await requireSeller();
    if (!guard.ok) return guard.response;

    const propertyId = await parseId(params);
    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: "Invalid property id" },
        { status: 400 }
      );
    }

    const owned = await assertOwnership(propertyId, guard.session.id);
    if (!owned.ok) {
      return NextResponse.json(
        { success: false, error: owned.error },
        { status: owned.status }
      );
    }

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

    const result = await updateProperty(propertyId, {
      payload: parsed.data,
      actor: "seller",
      accountId: guard.session.id,
      existing: owned.property,
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Seller property update error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Server error",
      },
      { status: 500 }
    );
  }
}

/** Deletes a property — ownership is verified before the delete runs. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const guard = await requireSeller();
    if (!guard.ok) return guard.response;

    const propertyId = await parseId(params);
    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: "Invalid property id" },
        { status: 400 }
      );
    }

    const owned = await assertOwnership(propertyId, guard.session.id);
    if (!owned.ok) {
      return NextResponse.json(
        { success: false, error: owned.error },
        { status: owned.status }
      );
    }

    await deletePropertyCascade(propertyId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Seller property delete error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
