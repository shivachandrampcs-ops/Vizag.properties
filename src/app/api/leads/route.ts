import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leads, properties } from "@/db/schema";
import { leadSchema } from "@/lib/validations";
import { and, eq } from "drizzle-orm";
import { notify } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limit";
import { normalizeIndianMobile } from "@/lib/phone";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const limit = rateLimit(`lead:${ip}`, 20, 60 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many enquiries. Try again in ${limit.retryAfterSeconds}s.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = leadSchema.safeParse(body);
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
    const phone = normalizeIndianMobile(data.phone);
    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid Indian mobile number" },
        { status: 400 }
      );
    }
    const email = data.email?.trim().toLowerCase() || null;

    // Route the lead to the seller who owns the property.
    // Only public (approved + active) listings accept enquiries.
    let assignedBuilderId: number | null = null;
    if (data.propertyId) {
      const [property] = await db
        .select({ id: properties.id, builderId: properties.builderId })
        .from(properties)
        .where(
          and(
            eq(properties.id, data.propertyId),
            eq(properties.isActive, true),
            eq(properties.moderationStatus, "approved")
          )
        )
        .limit(1);
      if (!property) {
        return NextResponse.json(
          { success: false, error: "This property is not available for enquiries" },
          { status: 404 }
        );
      }
      assignedBuilderId = property.builderId;
    }

    const [inserted] = await db
      .insert(leads)
      .values({
        name: data.name,
        phone,
        email,
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

    void notify("new_lead", {
      data: {
        leadId: inserted.id,
        propertyId: inserted.propertyId,
        accountId: inserted.assignedBuilderId,
      },
    });

    const n8nWebhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;

if (n8nWebhookUrl) {
  try {
    await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        leadId: inserted.id,
        name: inserted.name,
        phone: inserted.phone,
        email: inserted.email,
        budget: inserted.budget,
        preferredLocation: inserted.preferredLocation,
        message: inserted.message,
        source: inserted.source,
        propertyId: inserted.propertyId,
        propertyType: inserted.propertyType,
        assignedBuilderId: inserted.assignedBuilderId,
      }),
    });
  } catch {
    console.error("Lead notification webhook failed");
  }
}

    return NextResponse.json({ success: true });
  } catch {
    console.error("Lead create request failed");
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
