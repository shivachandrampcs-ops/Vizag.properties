import "dotenv/config";
import type { Config } from "drizzle-kit";

/**
 * Drizzle Kit configuration.
 *
 * Credentials are read from the environment (`.env` / process env) so that no
 * database password is ever committed to the repository.
 *
 *   npm run db:generate   # create a SQL migration from src/db/schema.ts
 *   npm run db:migrate    # apply pending migrations
 *   npm run db:push       # push the schema directly (development only)
 *   npm run db:studio     # browse the database
 */
export default {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
} satisfies Config;
