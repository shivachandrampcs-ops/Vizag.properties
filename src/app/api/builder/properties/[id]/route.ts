import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties, propertyImages } from "@/db/schema";
import { propertySchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "builder") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const propertyId = Number(id);
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { success: false, error: "Invalid id" },
        { status: 400 }
      );
    }

    // Verify ownership
    const [existing] = await db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.builderId, session.id)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
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
    const { images, amenities, highlights } = body;

    await db
      .update(properties)
      .set({
        title: data.title,
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
        updatedAt: new Date(),
      })
      .where(eq(properties.id, propertyId));

    // Replace images if provided
    if (Array.isArray(images)) {
      await db
        .delete(propertyImages)
        .where(eq(propertyImages.propertyId, propertyId));
      for (let j = 0; j < images.length; j++) {
        const img = images[j];
        await db.insert(propertyImages).values({
          propertyId,
          imageUrl: img.imageUrl,
          altText: img.altText || data.title,
          isCover: img.isCover ?? j === 0,
          sortOrder: img.sortOrder ?? j,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Property update error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "builder") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const propertyId = Number(id);
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { success: false, error: "Invalid id" },
        { status: 400 }
      );
    }

    await db
      .delete(properties)
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.builderId, session.id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Property delete error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
