import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { builders } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";
import { sellerProfileSchema } from "@/lib/validations";
import { requireSeller, readJson } from "@/lib/api-guards";

export const dynamic = "force-dynamic";

/**
 * Updates the signed-in seller's own profile.
 *
 * Only whitelisted fields are written — account type, verification status and
 * active flag can never be changed from here (admin only).
 */
export async function PUT(req: NextRequest) {
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

    const parsed = sellerProfileSchema.safeParse(body);
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

    const data = parsed.data;
    const email = data.email.toLowerCase().trim();

    const [clash] = await db
      .select({ id: builders.id })
      .from(builders)
      .where(and(eq(builders.email, email), ne(builders.id, guard.session.id)))
      .limit(1);

    if (clash) {
      return NextResponse.json(
        { success: false, error: "That email is already used by another account" },
        { status: 409 }
      );
    }

    await db
      .update(builders)
      .set({
        name: data.name.trim(),
        email,
        phone: data.phone.trim(),
        companyName: data.companyName?.trim() || null,
        whatsappNumber: data.whatsappNumber?.trim() || null,
        locality: data.locality?.trim() || null,
        city: data.city?.trim() || null,
        description: data.description?.trim() || null,
        website: data.website?.trim() || null,
        address: data.address?.trim() || null,
        experienceYears: data.experienceYears ?? 0,
        projectsCount: data.projectsCount ?? 0,
        updatedAt: new Date(),
      })
      .where(eq(builders.id, guard.session.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Server error",
      },
      { status: 500 }
    );
  }
}
