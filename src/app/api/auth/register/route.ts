import { NextRequest, NextResponse } from "next/server";
import { registrationSchema } from "@/lib/validations";
import { registerSeller, setSessionCookie } from "@/lib/auth";
import { notify } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Self-service registration for Builders, Property Owners and Agents.
 * The account type is validated against the enum; everything else is
 * normalised server-side.
 */
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Basic abuse protection for the public endpoint.
    const limit = rateLimit(`register:${ip}`, 10, 60 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many registration attempts. Try again in ${limit.retryAfterSeconds}s.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const parsed = registrationSchema.safeParse(body);
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
    const result = await registerSeller({
      name: data.fullName,
      companyName: data.companyName || null,
      email: data.email,
      phone: data.mobile,
      whatsappNumber: data.whatsapp || null,
      password: data.password,
      publisherType: data.accountType,
      city: data.city || "Visakhapatnam",
      locality: data.locality || null,
      address: data.address || null,
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 409 }
      );
    }

    await setSessionCookie(result.user);

    void notify("registration", {
      to: { email: result.user.email, name: result.user.name },
      data: { publisherType: result.user.publisherType },
    });

    return NextResponse.json({ success: true, user: result.user });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Could not create your account. Please try again.",
      },
      { status: 500 }
    );
  }
}
