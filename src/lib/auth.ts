import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { builders, admins } from "@/db/schema";
import { eq, or, sql } from "drizzle-orm";
import { normalizeIndianMobile, indianMobileDigits } from "./phone";
import { createSlug } from "./slug";
import { normalizePublisherType } from "./publishers";
import type { PublisherType } from "@/db/schema";

const DEVELOPMENT_ONLY_SECRET =
  "vizag-properties-dev-secret-change-in-production-2024";

function getAuthSecret(): Uint8Array {
  const configured = process.env.AUTH_SECRET;
  if (configured) {
    const encoded = new TextEncoder().encode(configured);
    if (process.env.NODE_ENV === "production" && encoded.length < 32) {
      throw new Error("AUTH_SECRET must be at least 32 bytes in production.");
    }
    return encoded;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be configured in production.");
  }

  return new TextEncoder().encode(DEVELOPMENT_ONLY_SECRET);
}

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
  email: string | null;
  /** Present for seller accounts; admin authentication remains email/password. */
  phone?: string | null;
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
    .sign(getAuthSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    const role = payload.role === "admin" ? "admin" : "builder";
    return {
      id: payload.id as number,
      email: typeof payload.email === "string" ? payload.email : null,
      phone: typeof payload.phone === "string" ? payload.phone : null,
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

function sellerMobileCondition(mobile: string) {
  const parsed = indianMobileDigits(mobile);
  if (!parsed) return null;

  const storedDigits = sql`regexp_replace(${builders.phone}, '[^0-9]', '', 'g')`;
  return or(
    eq(builders.phoneE164, parsed.canonical),
    sql`${storedDigits} = ${parsed.national}`,
    sql`${storedDigits} = ${parsed.countryAndNational}`,
    sql`${storedDigits} = ${`0${parsed.national}`}`
  );
}

/** Finds canonical and legacy-formatted seller accounts without rewriting them. */
export async function findSellerAccountsByMobile(mobile: string) {
  const normalized = normalizeIndianMobile(mobile);
  if (!normalized) return [];
  const condition = sellerMobileCondition(normalized);
  if (!condition) return [];
  return db.select().from(builders).where(condition).limit(3);
}

/** Finds seller accounts by normalized email without rewriting legacy rows. */
export async function findSellerAccountsByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];
  return db
    .select()
    .from(builders)
    .where(sql`lower(btrim(${builders.email})) = ${normalized}`)
    .limit(3);
}

/** Logs in any seller account type (builder, owner or agent) using email + password. */
export async function authenticateSeller(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const accounts = await findSellerAccountsByEmail(email);
  // Fail closed if legacy case-variant rows make the username ambiguous.
  if (accounts.length !== 1) return null;
  const account = accounts[0];

  if (!account || !account.isActive) return null;
  const ok = await verifyPassword(password, account.passwordHash);
  if (!ok) return null;

  return {
    id: account.id,
    email: account.email,
    phone: account.phone,
    name: account.name,
    role: "builder",
    slug: account.slug,
    publisherType: normalizePublisherType(account.publisherType),
  };
}

/** Backwards-compatible alias for callers that used the generic seller name. */
export async function authenticateBuilder(
  email: string,
  password: string
): Promise<SessionUser | null> {
  return authenticateSeller(email, password);
}

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const normalized = email.trim().toLowerCase();
  const accounts = await db
    .select()
    .from(admins)
    .where(sql`lower(btrim(${admins.email})) = ${normalized}`)
    .limit(2);

  // Avoid authenticating the wrong account if legacy email casing duplicated it.
  if (accounts.length !== 1) return null;
  const admin = accounts[0];
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
 * Registers a new self-service seller account. Email is the required login
 * username. Mobile is retained as a required contact detail, never a credential.
 */
export async function registerSeller(
  input: RegisterSellerInput
): Promise<RegisterResult> {
  const email = input.email.trim().toLowerCase();
  const mobile = normalizeIndianMobile(input.phone);
  const whatsappNumber = input.whatsappNumber?.trim()
    ? normalizeIndianMobile(input.whatsappNumber)
    : null;
  const publisherType = normalizePublisherType(input.publisherType);

  if (input.whatsappNumber?.trim() && !whatsappNumber) {
    return { ok: false, error: "Please enter a valid WhatsApp mobile number." };
  }
  if (!mobile) {
    return { ok: false, error: "Please enter a valid Indian mobile number." };
  }

  if (!email) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const [existingSellerEmail] = await db
    .select({ id: builders.id })
    .from(builders)
    .where(sql`lower(btrim(${builders.email})) = ${email}`)
    .limit(1);
  const [existingAdminEmail] = await db
    .select({ id: admins.id })
    .from(admins)
    .where(sql`lower(btrim(${admins.email})) = ${email}`)
    .limit(1);
  if (existingSellerEmail || existingAdminEmail) {
    return {
      ok: false,
      error: "An account with this email already exists. Please log in instead.",
    };
  }

  const existingMobile = await findSellerAccountsByMobile(mobile);
  if (existingMobile.length > 0) {
    return {
      ok: false,
      error: "An account with this mobile number already exists. Please log in or contact support.",
    };
  }

  const passwordHash = await hashPassword(input.password);
  const slug = await uniqueAccountSlug(input.companyName || input.name);

  let account: typeof builders.$inferSelect;
  try {
    [account] = await db
      .insert(builders)
      .values({
        name: input.name.trim(),
        slug,
        email,
        phone: mobile,
        phoneE164: mobile,
        passwordHash,
        publisherType,
        companyName: input.companyName?.trim() || null,
        whatsappNumber,
        locality: input.locality?.trim() || null,
        city: input.city?.trim() || null,
        address: input.address?.trim() || null,
        isActive: true,
        isVerified: false,
      })
      .returning();
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return {
        ok: false,
        error: "An account with this mobile number or email already exists. Please log in instead.",
      };
    }
    throw error;
  }

  return {
    ok: true,
    user: {
      id: account.id,
      email: account.email,
      phone: account.phone,
      name: account.name,
      role: "builder",
      slug: account.slug,
      publisherType: normalizePublisherType(account.publisherType),
    },
  };
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
