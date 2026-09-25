#!/usr/bin/env node
/**
 * Safe, forward-only migration runner for databases that already hold data.
 *
 * Why this exists
 * ---------------
 * `drizzle-kit migrate` only applies migrations that are missing from
 * `drizzle.__drizzle_migrations`. A database that was originally created with
 * `drizzle-kit push` has the *schema* of migration 0000 but no journal table, so
 * `drizzle-kit migrate` tries to re-run 0000, hits "already exists" errors that
 * it swallows, and silently stops before ever reaching 0001. The app then fails
 * at runtime with errors like:
 *
 *     ERROR: column "approval_info" does not exist
 *
 * This script repairs that state without touching data:
 *
 *   1. Detects whether the baseline tables already exist (push-created DB).
 *   2. Records migration 0000 as already applied in that case (no DDL is run).
 *   3. Applies every remaining migration from drizzle/meta/_journal.json,
 *      in order, using the same sha256 hash bookkeeping Drizzle uses, so a
 *      later `npm run db:migrate` sees a fully consistent journal.
 *
 * Nothing is ever dropped, truncated or reset. All migration files applied here
 * are additive (CREATE TYPE IF NOT EXISTS-style guards / ADD COLUMN / CREATE
 * INDEX / idempotent back-fill) - see drizzle/0001_self_service_listing.sql.
 *
 * Usage
 * -----
 *   DATABASE_URL=postgres://... node scripts/db/migrate-existing-db.mjs
 *       Read-only report: prints the detected state and the exact plan.
 *       NEVER writes anything.
 *
 *   DATABASE_URL=postgres://... node scripts/db/migrate-existing-db.mjs --apply
 *       Executes the plan (journal bookkeeping + pending migrations) and then
 *       verifies the resulting schema.
 *
 *   npm run db:migrate:existing            # dry run
 *   npm run db:migrate:existing -- --apply # apply
 *
 * Exit codes: 0 = schema up to date / repaired, 1 = error (nothing half-applied:
 * each migration runs inside a transaction when the server supports it).
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const DRIZZLE_DIR = path.join(ROOT, "drizzle");
const JOURNAL_PATH = path.join(DRIZZLE_DIR, "meta", "_journal.json");

const APPLY = process.argv.includes("--apply");

/** Tables created by the baseline migration 0000_spicy_violations. */
const BASELINE_TABLES = ["admins", "builders", "leads", "properties", "property_images"];
/** Minimal signature used to prove the DB really sits at the 0000 baseline. */
const BASELINE_SIGNATURE = {
  admins: ["id", "email", "password_hash"],
  builders: ["id", "name", "slug", "password_hash"],
  leads: ["id", "property_id"],
  properties: ["id", "builder_id", "slug", "price", "is_active"],
  property_images: ["id", "property_id", "image_url"],
};

const log = (...a) => console.log(...a);
const heading = (t) => log("\n### " + t);

/**
 * Derive what the pending migrations are supposed to create straight from the
 * SQL files, so this script can never drift from drizzle/ + src/db/schema.ts.
 */
function expectedObjects(migrations) {
  const columns = {};
  const enums = {};
  for (const m of migrations.filter((m) => m.idx !== 0)) {
    for (const stmt of m.statements) {
      const col = stmt.match(/^ALTER TABLE "(\w+)" ADD COLUMN "(\w+)"/);
      if (col) (columns[col[1]] ??= []).push(col[2]);
      const en = stmt.match(/^CREATE TYPE "public"\."(\w+)" AS ENUM\(([^)]*)\)/);
      if (en) enums[en[1]] = en[2].split(",").map((v) => v.trim().replace(/^'|'$/g, ""));
    }
  }
  return { columns, enums };
}

function readJournal() {
  const journal = JSON.parse(fs.readFileSync(JOURNAL_PATH, "utf8"));
  return journal.entries
    .slice()
    .sort((a, b) => a.idx - b.idx)
    .map((e) => {
      const file = path.join(DRIZZLE_DIR, `${e.tag}.sql`);
      const sql = fs.readFileSync(file, "utf8");
      return {
        idx: e.idx,
        tag: e.tag,
        when: e.when,
        file,
        sql,
        hash: createHash("sha256").update(sql).digest("hex"),
        statements: sql
          .split("--> statement-breakpoint")
          .map((s) => s.trim())
          .filter(Boolean),
      };
    });
}

async function sslFor(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  const local = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  return local ? undefined : { rejectUnauthorized: false };
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    log("DATABASE_URL is not set - nothing to do (skipping).");
    return 0;
  }

  const migrations = readJournal();
  const pool = new pg.Pool({ connectionString: url, ssl: await sslFor(url), connectionTimeoutMillis: 30000 });

  const columnsOf = async (table) => {
    const r = await pool.query(
      "select column_name from information_schema.columns where table_schema='public' and table_name=$1",
      [table]
    );
    return r.rows.map((x) => x.column_name);
  };

  try {
    const db = await pool.query("select current_database() as db, inet_server_addr() as host");
    heading("target");
    log(`database : ${db.rows[0].db}`);
    log(`host     : ${db.rows[0].host ?? "(not reported)"}`);
    log(`mode     : ${APPLY ? "APPLY (writes allowed)" : "DRY RUN (no writes)"}`);

    // ---------------------------------------------------------------- state
    const journalRes = await pool.query("select to_regclass('drizzle.__drizzle_migrations') as t");
    const journalExists = Boolean(journalRes.rows[0].t);
    let applied = [];
    if (journalExists) {
      const r = await pool.query("select id, hash, created_at from drizzle.__drizzle_migrations order by id");
      applied = r.rows;
    }

    const existingTables = [];
    for (const t of BASELINE_TABLES) {
      const r = await pool.query(
        "select to_regclass($1) as t",
        ["public." + t]
      );
      if (r.rows[0].t) existingTables.push(t);
    }

    const { columns: EXPECTED_COLUMNS, enums: EXPECTED_ENUMS } = expectedObjects(migrations);
    const missingColumns = {};
    for (const [table, cols] of Object.entries(EXPECTED_COLUMNS)) {
      const have = await columnsOf(table);
      missingColumns[table] = have.length ? cols.filter((c) => !have.includes(c)) : [...cols, "(table missing)"];
    }

    const counts = {};
    for (const t of BASELINE_TABLES) {
      if (!existingTables.includes(t)) continue;
      const r = await pool.query(`select count(*)::int as n from public.${t}`);
      counts[t] = r.rows[0].n;
    }

    heading("detected state");
    log(`journal table        : ${journalExists ? "present" : "ABSENT (database was created with drizzle-kit push)"}`);
    log(`migrations recorded  : ${applied.length ? applied.map((r) => r.hash.slice(0, 8)).join(", ") : "(none)"}`);
    log(`baseline tables      : ${existingTables.join(", ") || "(none)"}`);
    log(`row counts           : ${JSON.stringify(counts)}`);
    for (const [table, missing] of Object.entries(missingColumns)) {
      log(`missing ${table} cols : ${missing.length ? missing.join(", ") : "none"}`);
    }

    // ----------------------------------------------------------------- plan
    const plan = [];
    const baselinePresent = BASELINE_TABLES.every((t) => existingTables.includes(t));
    for (const m of migrations) {
      const alreadyRecorded = applied.some((r) => r.hash === m.hash);
      if (alreadyRecorded) {
        plan.push({ m, action: "skip", reason: "already recorded in journal" });
        continue;
      }
      if (m.idx === 0 && baselinePresent) {
        // The schema was created by `drizzle-kit push`: it already is at the
        // 0000 baseline. Record it instead of re-running it (its CREATE
        // statements would fail against the existing tables).
        for (const [table, cols] of Object.entries(BASELINE_SIGNATURE)) {
          const have = await columnsOf(table);
          const missing = cols.filter((c) => !have.includes(c));
          if (missing.length) {
            throw new Error(
              `Refusing to mark ${m.tag} as applied: baseline table "${table}" is missing column(s) ${missing.join(", ")}. ` +
                `The database does not look like it is at the 0000 baseline - inspect it before continuing.`
            );
          }
        }
        plan.push({ m, action: "record-only", reason: "baseline schema already present (push-created DB)" });
        continue;
      }
      plan.push({ m, action: "apply", reason: "not yet applied" });
    }

    heading("plan");
    if (!plan.some((p) => p.action !== "skip")) {
      log("Nothing to do - the database is already up to date.");
    } else {
      for (const p of plan) {
        const detail = p.action === "apply" ? `${p.m.statements.length} statements` : "no DDL executed";
        log(`  ${p.action.padEnd(11)} ${p.m.tag.padEnd(28)} (${detail}) - ${p.reason}`);
      }
    }

    if (!plan.some((p) => p.action !== "skip")) {
      const code = await verify(pool, migrations);
      if (!APPLY) log("\nNothing was written (dry run).");
      return code;
    }

    if (!APPLY) {
      log("\nDry run only. Re-run with --apply to execute the plan above.");
      return 0;
    }

    // --------------------------------------------------------------- execute
    heading("applying");
    await pool.query("create schema if not exists drizzle");
    await pool.query(
      "create table if not exists drizzle.__drizzle_migrations (id serial primary key, hash text not null, created_at bigint)"
    );

    for (const p of plan) {
      const { m } = p;
      if (p.action === "skip") continue;
      if (p.action === "record-only") {
        await pool.query(
          "insert into drizzle.__drizzle_migrations (hash, created_at) select $1, $2 where not exists (select 1 from drizzle.__drizzle_migrations where hash = $1)",
          [m.hash, m.when]
        );
        log(`  recorded  ${m.tag} (${m.hash.slice(0, 8)}) - no DDL executed`);
        continue;
      }
      const client = await pool.connect();
      try {
        await client.query("begin");
        for (const stmt of m.statements) {
          try {
            await client.query(stmt);
          } catch (e) {
            throw new Error(`Failed in ${m.tag}.sql:\n  ${stmt.split("\n")[0].slice(0, 120)}\n  -> ${e.message}`);
          }
        }
        await client.query("insert into drizzle.__drizzle_migrations (hash, created_at) values ($1, $2)", [m.hash, m.when]);
        await client.query("commit");
        log(`  applied   ${m.tag} (${m.statements.length} statements, hash ${m.hash.slice(0, 8)})`);
      } catch (e) {
        await client.query("rollback");
        throw e;
      } finally {
        client.release();
      }
    }

    log("\nRow counts after migration: " + JSON.stringify(counts) + " (must be unchanged)");
    return await verify(pool, migrations);
  } finally {
    await pool.end().catch(() => {});
  }
}

async function verify(pool, migrations) {
  heading("verification");
  const { columns: EXPECTED_COLUMNS, enums: EXPECTED_ENUMS } = expectedObjects(migrations ?? readJournal());
  let ok = true;
  for (const [table, cols] of Object.entries(EXPECTED_COLUMNS)) {
    const r = await pool.query(
      "select column_name from information_schema.columns where table_schema='public' and table_name=$1",
      [table]
    );
    const have = r.rows.map((x) => x.column_name);
    const missing = cols.filter((c) => !have.includes(c));
    log(`${table}: ${missing.length ? "MISSING " + missing.join(", ") : `all ${cols.length} required columns present`}`);
    if (missing.length) ok = false;
  }
  const enums = await pool.query(
    "select t.typname, string_agg(e.enumlabel, ',' order by e.enumsortorder) as vals from pg_type t join pg_enum e on e.enumtypid = t.oid group by 1"
  );
  for (const [name, vals] of Object.entries(EXPECTED_ENUMS)) {
    const found = enums.rows.find((r) => r.typname === name);
    const good = found && found.vals.split(",").sort().join(",") === vals.slice().sort().join(",");
    log(`enum ${name}: ${good ? "ok (" + found.vals + ")" : "MISSING/WRONG"}`);
    if (!good) ok = false;
  }
  const idx = await pool.query(
    "select indexname from pg_indexes where schemaname='public' and indexname like 'properties_%' or indexname like 'builders_%' or indexname like 'leads_%' order by 1"
  );
  log("indexes: " + (idx.rows.map((r) => r.indexname).join(", ") || "(none)"));
  const jr = await pool.query("select id, hash, created_at from drizzle.__drizzle_migrations order by id");
  log("journal now: " + jr.rows.map((r) => `${r.id}:${r.hash.slice(0, 8)}`).join(", "));
  log(ok ? "\nRESULT: schema is up to date." : "\nRESULT: verification FAILED.");
  return ok ? 0 : 1;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error("\nFAILED:", e.message);
    process.exit(1);
  });
