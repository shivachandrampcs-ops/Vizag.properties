import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { admins, builders } from "@/db/schema";
import { and, eq, ne, sql } from "drizzle-orm";
import { sellerProfileSchema } from "@/lib/validations";
import { requireSeller, readJson } from "@/lib/api-guards";
import { findSellerAccountsByMobile } from "@/lib/auth";
import { normalizeIndianMobile } from "@/lib/phone";

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
    const email = data.email.trim().toLowerCase();
    const mobile = normalizeIndianMobile(data.phone);
    const whatsappNumber = data.whatsappNumber?.trim()
      ? normalizeIndianMobile(data.whatsappNumber)
      : null;
    if (data.whatsappNumber?.trim() && !whatsappNumber) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid WhatsApp mobile number" },
        { status: 400 }
      );
    }
    if (!mobile) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid Indian mobile number" },
        { status: 400 }
      );
    }

    const [sellerEmailClash] = await db
      .select({ id: builders.id })
      .from(builders)
      .where(
        and(
          sql`lower(btrim(${builders.email})) = ${email}`,
          ne(builders.id, guard.session.id)
        )
      )
      .limit(1);
    const [adminEmailClash] = await db
      .select({ id: admins.id })
      .from(admins)
      .where(sql`lower(btrim(${admins.email})) = ${email}`)
      .limit(1);

    if (sellerEmailClash || adminEmailClash) {
      return NextResponse.json(
        { success: false, error: "That email is already used by another account" },
        { status: 409 }
      );
    }

    const mobileAccounts = await findSellerAccountsByMobile(mobile);
    if (mobileAccounts.some((account) => account.id !== guard.session.id)) {
      return NextResponse.json(
        { success: false, error: "That mobile number is already used by another account" },
        { status: 409 }
      );
    }

    await db
      .update(builders)
      .set({
        name: data.name.trim(),
        email,
        phone: mobile,
        phoneE164: mobile,
        companyName: data.companyName?.trim() || null,
        whatsappNumber,
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
  } catch {
    console.error("Profile update failed");
    return NextResponse.json(
      { success: false, error: "Could not update the profile" },
      { status: 500 }
    );
  }
}
