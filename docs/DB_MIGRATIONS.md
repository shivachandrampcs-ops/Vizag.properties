# Database migrations (Drizzle + Neon)

Short operational guide for keeping every environment's schema in step with
`src/db/schema.ts`.

---

## 1. Normal workflow

| command | what it does |
| --- | --- |
| `npm run db:generate` | diffs `src/db/schema.ts` against `drizzle/` and writes a new forward-only SQL file + journal entry |
| `npm run db:migrate` | applies every migration listed in `drizzle/meta/_journal.json` that is **not yet recorded** in `drizzle.__drizzle_migrations` |
| `npm run db:migrate:existing` | read-only report of what a database is missing (see §3) |
| `npm run db:migrate:existing -- --apply` | applies the missing migrations to a database that already contains data/legacy schema |
| `npm run db:push` | **development only** – syncs schema straight to a throwaway DB, bypassing the journal |

`db:push` is the one command that must never be pointed at Neon: it writes the
schema but records nothing, which is exactly what caused the incident described
in §2.

---

## 2. The "column does not exist" incident (and why `db:migrate` did not fix it)

Symptom after deploying the self-service listing feature:

```
ERROR: column "approval_info" does not exist
```

Cause:

1. The Neon database was originally created with `drizzle-kit push`, so it has
   the *schema* of migration `0000_spicy_violations` but **no
   `drizzle.__drizzle_migrations` journal table**.
2. `drizzle-kit migrate` therefore starts at `0000_spicy_violations`, whose
   `CREATE TABLE` statements already exist. Those errors are swallowed, the
   migrator stops, and `0001_self_service_listing` is never applied — while the
   command still exits successfully.
3. The code (correctly) selects `approval_info`, `moderation_status`,
   `rejection_reason`, `submitted_at`, `reviewed_at`, `reviewed_by`,
   `published_at` → runtime error.

**A green `npm run db:migrate` is therefore not proof that the schema is up to
date.** Verify by introspection instead.

---

## 3. Repairing a live database (`scripts/db/migrate-existing-db.mjs`)

The helper repairs that state without touching data. It is forward-only and
writes nothing unless `--apply` is passed.

```bash
# 1. read-only report: state, row counts, missing columns, exact plan
DATABASE_URL='postgres://…' npm run db:migrate:existing

# 2. execute the plan
DATABASE_URL='postgres://…' npm run db:migrate:existing -- --apply
```

What it does:

1. Detects whether the baseline tables already exist (push-created database).
2. In that case it **records** `0000_spicy_violations` as applied in the journal
   *without executing any DDL* (it first checks a per-table column signature and
   aborts if the database does not really sit at the 0000 baseline).
3. Applies every remaining migration from `drizzle/meta/_journal.json` in order,
   each inside a transaction, using the same sha256 hash bookkeeping Drizzle
   uses — so a later `npm run db:migrate` sees a fully consistent journal and
   becomes a true no-op.
4. Prints before/after row counts and verifies the resulting columns, enums and
   indexes.

Nothing is dropped, truncated or reset; migration `0001_self_service_listing`
is purely additive (`CREATE TYPE` / `ADD COLUMN` / `ADD CONSTRAINT` /
`CREATE INDEX` + an idempotent back-fill that marks existing listings
`approved`, existing accounts `builder` and existing images `provider='url'`).

Run `npm run db:migrate:existing` (no `--apply`) after every deploy as a cheap
schema-drift check: it exits non-zero if a required column is missing.

---

## 4. Deployments apply migrations automatically

`package.json`:

```json
"build": "node scripts/db/migrate-existing-db.mjs --apply && next build",
"db:migrate:existing": "node scripts/db/migrate-existing-db.mjs"
```

Every Vercel build therefore runs against whatever `DATABASE_URL` that
environment is wired to, *before* Next.js is built (pages query the database at
build time), and:

* `DATABASE_URL` unset → the script logs a warning and exits `0`, so local
  builds without a database still work;
* `DATABASE_URL` set but unreachable / migration fails → non-zero exit, the
  build stops, and a broken deployment is never published;
* everything already applied → "nothing to do", ~1 s, build continues.

Prerequisite: `DATABASE_URL` must be defined for the Vercel environment
(Production *and* Preview). If it is missing there, the script skips, the build
still succeeds and the app will fail at runtime exactly as it did before — check
Vercel → Project → Settings → Environment Variables in that case.

The one-off equivalent, if you ever need to migrate by hand:

```bash
DATABASE_URL='postgres://…' npm run db:migrate:existing          # report only
DATABASE_URL='postgres://…' npm run db:migrate:existing -- --apply
```

---

## 5. Verified locally (2026-09-25)

Reproduced the production state on a scratch Postgres instance and validated
the repair path:

| scenario | result |
| --- | --- |
| empty database | both migrations applied, resulting schema identical (95/95 columns) to a database built by `drizzle-kit migrate` |
| push-created database with legacy rows | `0000` recorded, `0001` applied, row counts unchanged (1 builder / 1 property / 1 image), legacy listing back-filled to `approved` + `published_at`, legacy account to `builder`, legacy image to `provider='url'` |
| already-migrated database | "nothing to do", exit 0 (safe to run repeatedly) |
| `npm run db:migrate` after the repair | clean no-op – the journal is consistent again |

The app was then run against the repaired database: homepage and
`/properties` return only `approved` + `is_active` listings, `draft` /
`pending_review` / `rejected` listings return the not-found page, the sitemap
lists approved slugs only, and the full submit → reject (with reason) → approve
→ publicly visible lifecycle works.

Finally the build hook itself was exercised end-to-end on a fresh scratch
database created with `drizzle-kit push`: `npm run build` ran the repair script
first (recorded `0000`, applied `0001`, row counts unchanged, legacy listing
back-filled to `approved` + `published_at`), and a following `npm run db:migrate`
was a clean no-op.
