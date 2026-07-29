import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { builders, admins } from "@/db/schema";
import { eq } from "drizzle-orm";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "vizag-properties-dev-secret-change-in-production-2024"
);

const SESSION_COOKIE = "vp_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "builder";
  slug?: string;
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
    return {
      id: payload.id as number,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as "admin" | "builder",
      slug: payload.slug as string | undefined,
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
  const [builder] = await db
    .select()
    .from(builders)
    .where(eq(builders.email, email.toLowerCase().trim()))
    .limit(1);

  if (!builder || !builder.isActive) return null;
  const ok = await verifyPassword(password, builder.passwordHash);
  if (!ok) return null;

  return {
    id: builder.id,
    email: builder.email,
    name: builder.name,
    role: "builder",
    slug: builder.slug,
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

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
