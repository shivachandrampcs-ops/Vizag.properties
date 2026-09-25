import { NextResponse } from "next/server";
import {
  getSellerSession,
  getSession,
  type SessionUser,
} from "./auth";
import { db } from "@/db";
import { builders } from "@/db/schema";
import { eq } from "drizzle-orm";

export type GuardResult<T> =
  | { ok: true; session: T }
  | { ok: false; response: NextResponse };

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

export function badRequest(message: string, issues?: unknown) {
  return NextResponse.json(
    { success: false, error: message, ...(issues ? { issues } : {}) },
    { status: 400 }
  );
}

export function notFound(message = "Not found") {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

export function serverError(err: unknown, context?: string) {
  console.error(context ?? "API error:", err);
  return NextResponse.json(
    {
      success: false,
      error: err instanceof Error ? err.message : "Server error",
    },
    { status: 500 }
  );
}

/**
 * Requires an authenticated seller (builder / owner / agent).
 * Identity always comes from the signed server session cookie — never from the
 * request body or query string.
 */
export async function requireSeller(): Promise<GuardResult<SessionUser>> {
  const session = await getSellerSession();
  if (!session) return { ok: false, response: unauthorized("Please log in to continue") };

  // Make sure the account still exists and has not been deactivated.
  const [account] = await db
    .select({ id: builders.id, isActive: builders.isActive })
    .from(builders)
    .where(eq(builders.id, session.id))
    .limit(1);

  if (!account || !account.isActive) {
    return {
      ok: false,
      response: forbidden("Your account is inactive. Please contact support."),
    };
  }

  return { ok: true, session };
}

export async function requireAdmin(): Promise<GuardResult<SessionUser>> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { ok: false, response: unauthorized("Admin access required") };
  }
  return { ok: true, session };
}

/** Parses JSON bodies without throwing. */
export async function readJson<T = Record<string, unknown>>(
  req: Request
): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
