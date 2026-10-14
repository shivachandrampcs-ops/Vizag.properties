import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticateAdmin,
  authenticateSeller,
  setSessionCookie,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

const roleSchema = z.object({ role: z.enum(["admin", "builder"]) });
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const ipLimit = rateLimit(`login:${ip}`, 20, LOGIN_WINDOW_MS);
    if (!ipLimit.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Try again in ${ipLimit.retryAfterSeconds}s.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const role = roleSchema.safeParse(body);
    const parsed = loginSchema.safeParse(body);
    if (!role.success || !parsed.success) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email and password" },
        { status: 400 }
      );
    }

    const email = parsed.data.email;
    const emailLimit = rateLimit(
      `login-email:${email}`,
      10,
      LOGIN_WINDOW_MS
    );
    if (!emailLimit.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Try again in ${emailLimit.retryAfterSeconds}s.`,
        },
        { status: 429 }
      );
    }

    // The submitted role only selects which existing account table is queried.
    // It never grants a role; public signup cannot create admins.
    const user =
      role.data.role === "admin"
        ? await authenticateAdmin(email, parsed.data.password)
        : await authenticateSeller(email, parsed.data.password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await setSessionCookie(user);
    return NextResponse.json({ success: true, user });
  } catch {
    // Do not log submitted credentials or account data.
    console.error("Login request failed");
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
