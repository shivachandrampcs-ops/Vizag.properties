import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leads, properties } from "@/db/schema";
import { leadSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // If property is selected, find the builder to assign
    let assignedBuilderId: number | null = null;
    if (data.propertyId) {
      const [property] = await db
        .select()
        .from(properties)
        .where(eq(properties.id, data.propertyId))
        .limit(1);
      if (property) {
        assignedBuilderId = property.builderId;
      }
    }

    const [inserted] = await db
      .insert(leads)
      .values({
        name: data.name,
        phone: data.phone,
        email: data.email,
        budget: data.budget || null,
        preferredLocation: data.preferredLocation || null,
        propertyId: data.propertyId || null,
        propertyType: data.propertyType || null,
        message: data.message || null,
        source: data.source || "website",
        status: "new",
        assignedBuilderId,
      })
      .returning();

    return NextResponse.json({ success: true, lead: inserted });
  } catch (err) {
    console.error("Lead create error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
