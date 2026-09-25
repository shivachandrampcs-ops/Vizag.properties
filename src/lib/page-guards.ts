import { redirect } from "next/navigation";
import { getSession, getSellerSession, getCurrentAccount } from "./auth";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Server-component guards.
 *
 * Every dashboard page derives the identity from the signed session cookie —
 * a page is never rendered from a user id coming from the URL.
 */

export type SellerPageContext = {
  session: NonNullable<Awaited<ReturnType<typeof getSellerSession>>>;
  account: NonNullable<Awaited<ReturnType<typeof getCurrentAccount>>>;
};

export async function requireSellerPage(): Promise<SellerPageContext> {
  const session = await getSellerSession();
  if (!session) redirect("/login?next=/dashboard/seller");

  const account = await getCurrentAccount();
  if (!account) redirect("/login?error=inactive");

  return { session, account };
}

export type AdminPageContext = {
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>;
  name: string;
  email: string;
};

export async function requireAdminPage(): Promise<AdminPageContext> {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login/admin");

  const [admin] = await db
    .select({ name: admins.name, email: admins.email })
    .from(admins)
    .where(eq(admins.id, session.id))
    .limit(1);

  if (!admin) redirect("/login/admin");

  return { session, name: admin.name, email: admin.email };
}
