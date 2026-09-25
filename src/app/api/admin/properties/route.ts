import { NextRequest, NextResponse } from "next/server";
import { adminPropertyPayloadSchema } from "@/lib/validations";
import { requireAdmin, readJson } from "@/lib/api-guards";
import { createProperty } from "@/lib/property-service";

export const dynamic = "force-dynamic";

/**
 * Admin creates a property on behalf of an account.
 * Admin-created listings are approved + published immediately.
 */
export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

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

    const result = await createProperty({
      payload: parsed.data,
      actor: "admin",
      accountId: guard.session.id,
      adminId: guard.session.id,
      targetAccountId: parsed.data.builderId,
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({ success: true, property: result.property });
  } catch (err) {
    console.error("Admin property create error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Server error",
      },
      { status: 500 }
    );
  }
}
