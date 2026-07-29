import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticateAdmin,
  authenticateBuilder,
  setSessionCookie,
} from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "builder"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
        : await authenticateBuilder(email, password);

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
