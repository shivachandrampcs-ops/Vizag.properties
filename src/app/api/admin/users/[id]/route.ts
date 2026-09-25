import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { builders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { userStatusSchema, userVerificationSchema } from "@/lib/validations";
import { requireAdmin, readJson } from "@/lib/api-guards";
import { notify } from "@/lib/notifications";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * Admin-only account management:
 *   { isVerified: true/false } → verify / unverify a builder, owner or agent
 *   { isActive:  true/false }  → enable / disable the account
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const accountId = Number(id);
    if (!Number.isInteger(accountId) || accountId <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid account id" },
        { status: 400 }
      );
    }

    const body = (await readJson(req)) ?? {};
    const verification = userVerificationSchema.safeParse(body);
    const status = userStatusSchema.safeParse(body);

    if (!verification.success && !status.success) {
      return NextResponse.json(
        { success: false, error: "Nothing to update" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(builders)
      .where(eq(builders.id, accountId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 }
      );
    }

    const update: Partial<typeof builders.$inferSelect> = { updatedAt: new Date() };

    if (verification.success) {
      update.isVerified = verification.data.isVerified;
      update.verifiedAt = verification.data.isVerified ? new Date() : null;
      update.verifiedBy = verification.data.isVerified ? guard.session.id : null;
    }
    if (status.success) {
      update.isActive = status.data.isActive;
    }

    await db.update(builders).set(update).where(eq(builders.id, accountId));

    if (verification.success && verification.data.isVerified) {
      void notify("account_verified", {
        to: { email: existing.email, name: existing.name },
        data: { accountId },
      });
    }

    return NextResponse.json({
      success: true,
      isVerified: update.isVerified ?? existing.isVerified,
      isActive: update.isActive ?? existing.isActive,
    });
  } catch (err) {
    console.error("Admin user update error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Server error",
      },
      { status: 500 }
    );
  }
}
