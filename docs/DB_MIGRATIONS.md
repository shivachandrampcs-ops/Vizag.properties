# Database migrations (Drizzle + Neon)

Short operational guide for keeping every environment's schema in step with
`src/db/schema.ts`.

---

## 1. Normal workflow

| command | what it does |
| --- | --- |
| `npm run db:generate` | diffs `src/db/schema.ts` against `drizzle/` and writes a new forward-only SQL file + journal entry |
| `npm run db:migrate` | applies clean pending migrations through the fail-closed custom runner; this is a write operation |
| `npm run db:migrate:existing` | read-only report; may fail closed on an unknown or partially applied schema (see §3) |
| `npm run db:migrate:existing -- --apply` | applies clean pending migrations only after the schema/history safety checks pass; it is a write operation |
| `npm run db:push` | **development only** – syncs schema straight to a throwaway DB, bypassing the journal |

`db:push` is the one command that must never be pointed at Neon: it writes the
schema but records nothing, which is exactly what caused the incident described
in §2.

---

## 2. The "column does not exist" incident (and why raw `drizzle-kit migrate` did not fix it)

Symptom after deploying the self-service listing feature:

```
ERROR: column "approval_info" does not exist
```

Cause:

1. The Neon database was originally created with `drizzle-kit push`, so it has
   the *schema* of migration `0000_spicy_violations` but **no
   `drizzle.__drizzle_migrations` journal table**.
2. A direct `drizzle-kit migrate` therefore starts at `0000_spicy_violations`,
   whose `CREATE TABLE` statements already exist. Those errors can be swallowed,
   the migrator can stop, and `0001_self_service_listing` may never be applied —
   even though the raw command exits successfully. The `npm run db:migrate`
   script now uses the guarded custom runner instead of invoking that raw path.
3. The code (correctly) selects `approval_info`, `moderation_status`,
   `rejection_reason`, `submitted_at`, `reviewed_at`, `reviewed_by`,
   `published_at` → runtime error.

**A green result from raw `drizzle-kit migrate` is not proof that the schema is
up to date.** `npm run db:migrate` is now routed through the guarded custom
runner, but a safe journal prefix still does not certify production data or
schema definitions; inspect the target state and follow §3.

---

## 3. Migration runner behavior and safe reconciliation

`scripts/db/migrate-existing-db.mjs` is read-only by default. It applies nothing
unless `--apply` is passed. Its fail-closed checks do not prove that production
is compatible and do not automatically repair arbitrary schema drift.

```bash
# Report only: state, row counts, missing columns and proposed actions.
DATABASE_URL='postgres://…' npm run db:migrate:existing

# Writes the checked-in pending migrations; use only after separate review.
DATABASE_URL='postgres://…' npm run db:migrate:existing -- --apply
```

The runner now:

1. Treats the SHA-256 hash of every checked-in migration file as immutable. An
   unknown hash, repeated record, or non-contiguous journal history stops the
   run; it never edits or replaces a recorded migration hash.
2. Can record `0000_spicy_violations` without DDL only if all recognized
   baseline object names (tables, indexes, constraints and enum types) and all
   baseline column names are present. This supports a push-created database
   that contains only the baseline schema; it is not a comparison of every
   catalog definition, type, default or constraint property.
3. Before applying any unrecorded later migration, checks for existing
   migration-owned objects/target nullability. If any are already present, or
   if a DDL shape lacks an inspection marker, the runner stops before applying
   pending work. A partial or unjournaled schema needs a DBA-reviewed schema
   **and data-effect** diff; object existence alone is not grounds to record a
   hash. See [`RELEASE_READINESS.md`](./RELEASE_READINESS.md) for the proposed
   reconciliation steps.
4. Applies a clean pending migration in a transaction, then records its exact
   checked-in hash. It verifies columns, enums and index names after the plan.

This is a guard, not an automatic repair workflow. In particular, an unjournaled
schema that already contains `0001`, `0002` or `0003` objects is intentionally
refused, even if the schema appears complete. Do not manually rerun a
non-idempotent `ALTER TABLE` or mark a migration applied based only on a matching
column name.

The migrations do not drop tables or truncate data, but they are not all
schema-only/additive in the narrow sense: `0001` contains idempotent updates to
existing property/builder/image rows, `0002` changes email nullability and adds
columns/indexes, and `0003` restores `NOT NULL` for `builders.email`. The new
`0003` migration can fail if a builder email is null and should be checked for
lock impact before an approved release.

## 4. Build scripts and migration writes

`package.json` currently defines:

```json
"build": "node scripts/db/migrate-existing-db.mjs --apply && next build",
"db:migrate": "node scripts/db/migrate-existing-db.mjs --apply",
"db:migrate:existing": "node scripts/db/migrate-existing-db.mjs"
```

**Do not run `npm run build` for a local production-style build or against a
real/shared database.** It applies pending migrations to whichever database
`DATABASE_URL` names before Next.js builds. For a build-only check, run
`npx next build` directly with a command-scoped dummy `DATABASE_URL`; do not
call the migration-applying wrapper. This review did not run `npm run build`,
`db:migrate`, `db:migrate:existing -- --apply`, or any migration command against
production.

For an actual release, an authorized operator must separately verify the
connection target, backup, schema/journal state, null-email precondition, lock
window and row counts, then explicitly approve the migration operation. Keep
migration execution out of an unattended build until that release procedure is
approved.

## 5. Historical scratch-database validation (2026-09-25)

The earlier version of this guide recorded these scratch-Postgres checks:

| scenario | historical result |
| --- | --- |
| empty database | migrations applied; resulting schema matched that earlier migration set |
| push-created database containing only the 0000 baseline and legacy rows | `0000` recorded, `0001` applied; row counts stayed unchanged while the legacy approved/published and provider defaults were populated |
| already-migrated database | no-op and exit 0 |
| `npm run db:migrate` after repair | clean no-op |
| earlier build hook on a fresh scratch database | repair script ran first; a following `db:migrate` was a no-op |

These are historical results from an earlier migration set and earlier runner;
they do **not** validate the new partial/unjournaled-schema guard, migration
`0002`/`0003` on a current database, this branch's current checks, or any
production schema/data. Repeat appropriate tests on disposable databases before
release. No production compatibility is claimed here.
