import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { seedDatabase } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);

    // Demo fixtures may be seeded during local development only. A health
    // check must never write demo users, listings or leads into production.
    if (process.env.NODE_ENV === "development") {
      try {
        await seedDatabase();
      } catch {
        // Keep health status independent of optional local demo fixtures.
      }
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "Vizag Properties API is healthy",
    });
  } catch {
    return NextResponse.json(
      { status: "error", error: "Database health check failed" },
      { status: 500 }
    );
  }
}
