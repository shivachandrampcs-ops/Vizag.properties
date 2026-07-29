import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties, propertyImages } from "@/db/schema";
import { propertySchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";
import { createSlug } from "@/lib/queries";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "builder") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = propertySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const { images, amenities, highlights, ...rest } = body;

    // Generate unique slug
    const baseSlug = createSlug(data.title);
    let slug = baseSlug;
    let i = 1;
    while (true) {
      const existing = await db
        .select({ id: properties.id })
        .from(properties)
        .where(eq(properties.slug, slug))
        .limit(1);
      if (existing.length === 0) break;
      slug = `${baseSlug}-${i++}`;
    }

    const [inserted] = await db
      .insert(properties)
      .values({
        builderId: session.id,
        title: data.title,
        slug,
        description: data.description,
        propertyType: data.propertyType,
        status: data.status,
        furnishing: data.furnishing,
        price: data.price,
        pricePerSqft: data.pricePerSqft || null,
        area: data.area,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        balconies: data.balconies,
        floor: data.floor || null,
        totalFloors: data.totalFloors || null,
        facing: data.facing || null,
        address: data.address,
        location: data.location,
        city: data.city || "Visakhapatnam",
        state: data.state || "Andhra Pradesh",
        pincode: data.pincode || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        reraId: data.reraId || null,
        isFeatured: data.isFeatured ?? false,
        amenities: Array.isArray(amenities) ? amenities : [],
        highlights: Array.isArray(highlights) ? highlights : [],
        isActive: true,
      })
      .returning();

    if (Array.isArray(images)) {
      for (let j = 0; j < images.length; j++) {
        const img = images[j];
        await db.insert(propertyImages).values({
          propertyId: inserted.id,
          imageUrl: img.imageUrl,
          altText: img.altText || data.title,
          isCover: img.isCover ?? j === 0,
          sortOrder: img.sortOrder ?? j,
        });
      }
    }

    return NextResponse.json({ success: true, property: inserted });
  } catch (err) {
    console.error("Property create error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
