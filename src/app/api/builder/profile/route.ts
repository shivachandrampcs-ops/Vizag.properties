import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { builders } from "@/db/schema";
import { builderProfileSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "builder") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = builderProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    await db
      .update(builders)
      .set({
        name: data.name,
        phone: data.phone,
        description: data.description || null,
        website: data.website || null,
        address: data.address || null,
        experienceYears: data.experienceYears,
        projectsCount: data.projectsCount,
        updatedAt: new Date(),
      })
      .where(eq(builders.id, session.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
