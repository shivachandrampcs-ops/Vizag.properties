# Release readiness and migration recovery notes

**Review date:** 14 October 2026

**Status:** review/proposal only. PR #3 remains draft. No production database was
connected to, no migration or backfill was executed, and no deployment or merge
occurred while preparing this review.

## Release blockers

1. **Production schema state is unknown.** The live PostgreSQL schema, migration
   journal, null `builders.email` rows, data volume and write traffic were not
   inspected. Do not infer production compatibility from source files.
2. **Migration `0003_restore_builder_email_not_null.sql` needs a data preflight.**
   It changes `builders.email` back to `NOT NULL`, consistent with seller
   registration/profile/login requirements. It will fail if any builder email
   is null and can hold a table lock while PostgreSQL checks existing rows. The
   non-production and production null-row counts, lock window and rollback
   strategy must be reviewed before separately approving this migration.
3. **Migration `0002` index impact needs a workload check.** The ordinary
   `builders_phone_idx` indexes raw `builders.phone`, while the legacy mobile
   lookup applies `regexp_replace(phone, ...)`; that expression is not covered
   by the ordinary index. Exact `phone_e164` equality can use
   `builders_phone_e164_unique_idx`, but the legacy-format fallbacks still need
   measurement. Do not add/drop an index based on assumption: use a representative
   staging `EXPLAIN (ANALYZE, BUFFERS)` and production query/traffic review before
   a separate index change. Non-concurrent index creation can block writes.
4. **Backfills are not approved or run.** Follow
   [`STAGED_BACKFILL_PLAN.md`](./STAGED_BACKFILL_PLAN.md), including evidence,
   duplicate checks, explicit row counts, audit data and rollback safeguards.
5. **Locality status is incomplete.** The GVMC elected-council ward-area list
   produced 85 direct/clear name matches and 27 ambiguous/unmatched suggestions.
   Only the first three of eight fetched chunks of the official final 98-ward
   delimitation notice were reviewed; a later chunk failed. None of the 27 is
   declared outside GVMC, and even a ward-area match is not proof of current
   jurisdiction/service coverage. See `src/lib/locations.ts`; the uncertain
   names remain explicitly unverified.
6. **Legal pages are not publishable.** The Privacy Policy and Terms pages
   retain placeholders for the legal operator, registered/business address,
   grievance contact and legal review. Replace them only after the business
   supplies verified details and counsel reviews the text. Do not guess these
   details or use launch approval as a substitute for them.

The existing account model remains email + password for seller login, with
existing password hashing, roles and protections unchanged. Public browsing and
search stay unauthenticated; buyer enquiries require a valid mobile and may
include an optional email. No OTP or paid authentication provider is part of
this release.

## Migration runner: identified gap and fail-closed behavior

The Drizzle journal identifies each migration using the SHA-256 hash of its SQL
file. Existing migration files and hashes must be treated as immutable. The
runner now rejects journal rows with unknown hashes, duplicate/out-of-order
history, and unrecorded migrations when any recognizable migration-owned DDL
object or target nullability state is already present. It also refuses DDL
shapes that do not yet have a schema-inspection marker. This is a **fail-closed
safety guard**, not an automatic repair mechanism.

For a database with no journal, the runner can record migration `0000` without
executing it only when all recognized baseline object names and all baseline
column names are present. This is a name/signature check, not a full comparison
of data types, defaults, constraint definitions or all catalog properties; a
separate read-only schema diff is still required before any production use. If
any object from `0001`/`0002`/`0003` is already present without the matching
recorded hash, the runner stops before executing pending work. That state could
mean a partially applied migration, a schema created with `drizzle-kit push`,
manual DDL, or a different migration history; the tool cannot safely infer
which one occurred.

**Proposed recovery for a partial or unjournaled schema:**

1. Stop automatic migration/deployment writes. Take and verify a restorable
   backup; have a DBA produce a read-only schema/journal diff against the exact
   checked-in SQL and record before/after row counts.
2. Determine whether every DDL **and data effect** of the unrecorded migration
   is present. Object existence alone is not proof: migration `0001` also has
   data backfills, and a partially applied migration may have only some
   statements applied.
3. If every effect is proven complete, use a separately reviewed, auditable
   journal-reconciliation procedure to insert only the exact hash calculated
   from the unchanged checked-in migration. Do not replace, edit, reorder or
   delete any existing hash. If any effect is absent, inconsistent or
   uncertain, do not mark the migration applied; prepare and test a new
   forward-only corrective migration or restore a verified backup under an
   approved plan.
4. Re-run the fail-closed dry-run report and catalog/data verification in a
   non-production clone before considering a production change. Keep the
   reconciliation record and approval with the incident/change log.

This review did not use production credentials or inspect production data; the
recovery procedure above is a proposal, not an assertion that a live schema has
been repaired.

## Controlled release sequence (after blockers are resolved)

1. Confirm verified business/legal details and complete counsel review; decide
   whether each unverified locality should remain a general search term, be
   relabeled, or be excluded from any claim about municipal coverage.
2. Run repository checks and a direct production-style Next.js build with a
   command-scoped dummy database URL. Do **not** run `npm run build`: its script
   invokes `migrate-existing-db.mjs --apply` before Next.js, so it may write to
   whichever database `DATABASE_URL` names.
3. In an isolated, disposable database, rehearse empty-schema migration,
   complete `0000` push-created baseline handling, fail-closed partial/unjournaled
   detection, and the `0003` null-email precondition. Do not point the rehearsal
   at `main`, production, or shared data.
4. Before any production action, an authorized DBA/operator should take and
   verify a restorable backup, inspect the schema/journal and null-email/index
   preconditions read-only, estimate table size/locks, and present the exact
   proposed migration/backfill row counts for approval.
5. Apply only the specifically approved schema migrations in a controlled
   release window, then verify columns, constraints, indexes, migration hashes,
   row counts and application behavior. Do not combine an unreviewed schema
   reconciliation with a release.
6. Execute area-unit and mobile backfills only as a separate, audited operation
   after staging validation and explicit data-owner approval. Keep unresolved
   values null; review duplicates and collisions individually.
7. Publish only after the production read-only verification, legal and locality
   gates, application smoke checks, and rollback/readiness approval are
   documented. Keep PR #3 in draft until its blockers are resolved and the owner
   explicitly requests a release decision.

## Index note

`builders_phone_idx` is a normal B-tree on the source `phone` field. The current
legacy lookup compares several digit-normalized forms via
`regexp_replace(builders.phone, ...)`, so that B-tree does not directly satisfy
the expression predicates. The query also checks canonical `phone_e164`, for
which the partial unique index is relevant. Measure the actual query plan after
the staged normalization work; do not claim the raw-phone index accelerates the
normalization fallback.
