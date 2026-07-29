import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { seedDatabase } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);

    // Auto-seed if empty (only first request)
    try {
      await seedDatabase();
    } catch (e) {
      // ignore seed errors - they may be transient
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "Vizag Properties API is healthy",
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
