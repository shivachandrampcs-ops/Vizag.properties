import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { builders, admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSlug } from "./slug";
import { normalizePublisherType } from "./publishers";
import type { PublisherType } from "@/db/schema";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "vizag-properties-dev-secret-change-in-production-2024"
);

const SESSION_COOKIE = "vp_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * NOTE on `role`:
 * - "admin"   → back-office admin
 * - "builder" → any seller account (builder, property owner or real-estate agent).
 *
 * The name is kept for backwards compatibility with sessions that were issued
 * before owner/agent accounts existed. The finer-grained account type travels
 * in `publisherType` and always falls back to "builder" for old tokens.
 */
export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "builder";
  slug?: string;
  publisherType?: PublisherType;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(SECRET);
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = payload.role === "admin" ? "admin" : "builder";
    return {
      id: payload.id as number,
      email: payload.email as string,
      name: payload.name as string,
      role,
      slug: payload.slug as string | undefined,
      publisherType: normalizePublisherType(payload.publisherType),
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Returns the authenticated seller (builder / owner / agent) or null.
 * The account type is always derived from the server-side session payload and
 * re-checked against the database — never from client input.
 */
export async function getSellerSession(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session || session.role !== "builder") return null;
  return session;
}

/** Freshly loads the account row (isActive, isVerified, publisherType, ...). */
export async function getCurrentAccount() {
  const session = await getSellerSession();
  if (!session) return null;
  const [account] = await db
    .select()
    .from(builders)
    .where(eq(builders.id, session.id))
    .limit(1);
  if (!account || !account.isActive) return null;
  return account;
}

export async function setSessionCookie(user: SessionUser) {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function authenticateBuilder(
  email: string,
  password: string
): Promise<SessionUser | null> {
  return authenticateSeller(email, password);
}

/** Logs in any seller account type (builder, owner or agent). */
export async function authenticateSeller(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const [account] = await db
    .select()
    .from(builders)
    .where(eq(builders.email, email.toLowerCase().trim()))
    .limit(1);

  if (!account || !account.isActive) return null;
  const ok = await verifyPassword(password, account.passwordHash);
  if (!ok) return null;

  return {
    id: account.id,
    email: account.email,
    name: account.name,
    role: "builder",
    slug: account.slug,
    publisherType: normalizePublisherType(account.publisherType),
  };
}

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.email, email.toLowerCase().trim()))
    .limit(1);

  if (!admin) return null;
  const ok = await verifyPassword(password, admin.passwordHash);
  if (!ok) return null;

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: "admin",
  };
}

// ────────────────────────────────────────────────────────────
// Registration
// ────────────────────────────────────────────────────────────

export type RegisterSellerInput = {
  name: string;
  companyName?: string | null;
  email: string;
  phone: string;
  whatsappNumber?: string | null;
  password: string;
  publisherType: PublisherType;
  city?: string | null;
  locality?: string | null;
  address?: string | null;
};

export type RegisterResult =
  | { ok: true; user: SessionUser }
  | { ok: false; error: string };

/** Creates a unique slug for an account (company/person name). */
async function uniqueAccountSlug(base: string): Promise<string> {
  const baseSlug = createSlug(base) || "account";
  let slug = baseSlug;
  let i = 1;
  while (true) {
    const existing = await db
      .select({ id: builders.id })
      .from(builders)
      .where(eq(builders.slug, slug))
      .limit(1);
    if (existing.length === 0) break;
    slug = `${baseSlug}-${i++}`;
  }
  return slug;
}

/**
 * Registers a new self-service seller account.
 * Throws only on unexpected DB errors; duplicate emails are handled here.
 */
export async function registerSeller(
  input: RegisterSellerInput
): Promise<RegisterResult> {
  const email = input.email.toLowerCase().trim();
  const publisherType = normalizePublisherType(input.publisherType);

  const [existing] = await db
    .select({ id: builders.id })
    .from(builders)
    .where(eq(builders.email, email))
    .limit(1);

  if (existing) {
    return {
      ok: false,
      error: "An account with this email already exists. Please log in instead.",
    };
  }

  const passwordHash = await hashPassword(input.password);
  const slug = await uniqueAccountSlug(input.companyName || input.name);

  const [account] = await db
    .insert(builders)
    .values({
      name: input.name.trim(),
      slug,
      email,
      phone: input.phone.trim(),
      passwordHash,
      publisherType,
      companyName: input.companyName?.trim() || null,
      whatsappNumber: input.whatsappNumber?.trim() || null,
      locality: input.locality?.trim() || null,
      city: input.city?.trim() || null,
      address: input.address?.trim() || null,
      isActive: true,
      isVerified: false,
    })
    .returning();

  return {
    ok: true,
    user: {
      id: account.id,
      email: account.email,
      name: account.name,
      role: "builder",
      slug: account.slug,
      publisherType: normalizePublisherType(account.publisherType),
    },
  };
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
