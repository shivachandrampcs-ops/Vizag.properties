import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticateAdmin,
  authenticateSeller,
  setSessionCookie,
} from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  /** "builder" logs in any seller account type (builder, owner or agent). */
  role: z.enum(["admin", "builder"]),
});

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const limit = rateLimit(`login:${ip}`, 20, 15 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Try again in ${limit.retryAfterSeconds}s.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input" },
        { status: 400 }
      );
    }
    const { email, password, role } = parsed.data;
    const user =
      role === "admin"
        ? await authenticateAdmin(email, password)
        : await authenticateSeller(email, password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await setSessionCookie(user);
    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
