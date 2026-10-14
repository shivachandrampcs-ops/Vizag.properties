import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  migrationObjectMarker,
  migrationObjectMarkers,
} from "./migration-markers.mjs";

test("recognizes migration object markers used by the repository", () => {
  assert.deepEqual(
    migrationObjectMarker('ALTER TABLE "builders" ADD COLUMN "phone_e164" varchar(16)'),
    { kind: "column", table: "builders", name: "phone_e164" }
  );
  assert.deepEqual(
    migrationObjectMarker('CREATE UNIQUE INDEX "builders_phone_e164_unique_idx" ON "builders" ("phone_e164")'),
    { kind: "index", name: "builders_phone_e164_unique_idx" }
  );
  assert.deepEqual(
    migrationObjectMarker('ALTER TABLE "builders" ALTER COLUMN "email" SET NOT NULL'),
    {
      kind: "nullability",
      table: "builders",
      column: "email",
      nullable: false,
    }
  );
  assert.equal(migrationObjectMarker('UPDATE "properties" SET "area_unit" = \'sqft\''), null);
});

test("collects inline constraints from baseline CREATE TABLE statements", () => {
  const markers = migrationObjectMarkers([
    `CREATE TABLE "builders" (\n  "id" serial PRIMARY KEY NOT NULL,\n  CONSTRAINT "builders_email_unique" UNIQUE("email")\n)`,
  ]);

  assert.deepEqual(markers, [
    { kind: "table", name: "builders" },
    { kind: "constraint", table: "builders", name: "builders_email_unique" },
  ]);
});

test("every checked-in migration DDL statement has a fail-closed inspection marker", () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const journal = JSON.parse(
    fs.readFileSync(path.join(root, "drizzle/meta/_journal.json"), "utf8")
  );

  for (const entry of journal.entries) {
    const sql = fs.readFileSync(
      path.join(root, "drizzle", `${entry.tag}.sql`),
      "utf8"
    );
    for (const statement of sql.split("--> statement-breakpoint")) {
      const trimmed = statement.trim();
      if (/^(CREATE|ALTER|DROP|TRUNCATE|RENAME|COMMENT|GRANT|REVOKE)\b/i.test(trimmed)) {
        assert.ok(
          migrationObjectMarker(trimmed),
          `missing migration safety marker for ${entry.tag}: ${trimmed.slice(0, 100)}`
        );
      }
    }
  }
});
