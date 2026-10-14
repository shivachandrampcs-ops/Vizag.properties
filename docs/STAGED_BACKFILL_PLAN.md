# Staged backfill plan: property area units and seller mobiles

**Status: plan only.** No backfill SQL in this document was run, no production database
was accessed, and no rows were changed. These examples are read-only preflight
queries or templates for a separately approved operation. Do not run them against
production as part of a build or deployment.

## Safety rules

- First verify the deployed schema and migration journal using an approved,
  read-only process. The target must have `properties.area_unit`,
  `builders.phone_e164`, and the partial unique index
  `builders_phone_e164_unique_idx` from migration `0002`.
- Take and verify a restorable database backup/snapshot before a write. Run the
  process in staging first, compare its output, and get explicit business/data
  owner approval before any production write.
- Use a per-run staging manifest and audit log (or access-controlled reviewed
  files) with a unique `run_id`, source/evidence, reviewer, review time, old and
  proposed values, and final outcome. Do not put credentials or sensitive data
  in the repository.
- Preserve all numeric `properties.area` values and original `builders.phone`
  values. The only planned writes are to nullable `area_unit` and
  `phone_e164` fields, and only for individually verified, unambiguous rows.
- Do not infer historical square yards from property type. A property type may
  suggest a likely unit but is not evidence. Leave unresolved units `NULL` and
  display them as “unit not recorded.” Do not convert numbers or rewrite listing
  descriptions.
- Seller accounts continue to use required email + password login. Mobile is a
  required contact detail and a normalized contact/deduplication value here;
  this plan does not introduce OTP/mobile login or change password/role controls.

## 1. Property area unit

### Required evidence

For each row, record a specific source that supports `sqft` or `sqyd` (for
example, an original listing document or an explicit, unambiguous source record
reviewed by an authorized person). Descriptions can mention both plot area and
built-up area, so free-text keyword matches are candidates for manual review,
not an automatic unit assignment. Store the property ID, original `area`,
proposed unit, evidence reference, reviewer and review timestamp in the staging
manifest. Keep the area number unchanged.

### Read-only baseline and distributions

```sql
SELECT
  COUNT(*) AS property_rows,
  COUNT(*) FILTER (WHERE area_unit IS NULL) AS unit_unknown,
  COUNT(*) FILTER (WHERE area_unit = 'sqft') AS recorded_sqft,
  COUNT(*) FILTER (WHERE area_unit = 'sqyd') AS recorded_sqyd
FROM public.properties;

SELECT property_type, area_unit, COUNT(*) AS rows,
       MIN(area) AS min_area, MAX(area) AS max_area
FROM public.properties
GROUP BY property_type, area_unit
ORDER BY property_type, area_unit;
```

These totals are read-only and describe state; they do not establish the correct
unit for any individual row.

### Staging manifest checks

Assume a reviewed manifest named `ops.backfill_area_units` with fields
`run_id`, `property_id`, `proposed_unit`, `evidence_ref`, `reviewed_by`,
`reviewed_at`, and `status`. Replace `REPLACE_WITH_RUN_ID` with the approved
run identifier. The schema/table names are illustrative; create and populate
staging structures only through an approved procedure.

```sql
-- Duplicate property IDs in the manifest must be resolved before proceeding.
SELECT property_id, COUNT(*) AS entries
FROM ops.backfill_area_units
WHERE run_id = 'REPLACE_WITH_RUN_ID'
GROUP BY property_id
HAVING COUNT(*) > 1;

-- Reject missing properties, invalid units, missing evidence, and unreviewed rows.
SELECT s.*
FROM ops.backfill_area_units s
LEFT JOIN public.properties p ON p.id = s.property_id
WHERE s.run_id = 'REPLACE_WITH_RUN_ID'
  AND (p.id IS NULL
       OR s.proposed_unit IS NULL
       OR s.proposed_unit NOT IN ('sqft', 'sqyd')
       OR s.status IS DISTINCT FROM 'verified'
       OR NULLIF(BTRIM(s.evidence_ref), '') IS NULL
       OR NULLIF(BTRIM(s.reviewed_by), '') IS NULL
       OR s.reviewed_at IS NULL);

-- Conflicts with values already recorded must be investigated, not overwritten.
SELECT p.id, p.area, p.area_unit AS existing_unit,
       s.proposed_unit, s.evidence_ref
FROM public.properties p
JOIN ops.backfill_area_units s ON s.property_id = p.id
WHERE s.run_id = 'REPLACE_WITH_RUN_ID'
  AND p.area_unit IS NOT NULL
  AND p.area_unit::text IS DISTINCT FROM s.proposed_unit;

-- Exact number of eligible rows by proposed unit; no property-type inference.
SELECT s.proposed_unit, COUNT(*) AS would_update,
       COUNT(DISTINCT p.id) AS distinct_properties
FROM ops.backfill_area_units s
JOIN public.properties p ON p.id = s.property_id
WHERE s.run_id = 'REPLACE_WITH_RUN_ID'
  AND s.status = 'verified'
  AND s.proposed_unit IN ('sqft', 'sqyd')
  AND p.area_unit IS NULL
GROUP BY s.proposed_unit
ORDER BY s.proposed_unit;
```

The duplicate query and all invalid/conflict queries must return zero rows. The
eligible-row count must exactly match the signed-off manifest. Any value already
present in `area_unit` is left as-is; any unverified or ambiguous row remains
`NULL`.

## 2. Seller mobile normalization

The canonicalizer is `normalizeIndianMobile` in `src/lib/phone.ts`: it removes
whitespace, parentheses and hyphens; accepts a 10-digit Indian mobile beginning
with 6–9, with optional `+91`/`91`; and returns a canonical `+91` value or
`null`. For a final manifest, run this application function over the source
values and compare its results with the preview below. Treat the SQL as a
read-only parity check, not as a replacement implementation of the app's
canonicalizer.

### Read-only counts

```sql
SELECT
  COUNT(*) AS seller_rows,
  COUNT(*) FILTER (WHERE phone_e164 IS NULL) AS not_normalized,
  COUNT(*) FILTER (WHERE phone_e164 IS NOT NULL) AS already_normalized
FROM public.builders;

SELECT id, phone_e164
FROM public.builders
WHERE phone_e164 IS NOT NULL
  AND phone_e164 !~ '^\+91[6-9][0-9]{9}$';

SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN ('builders_phone_idx', 'builders_phone_e164_unique_idx');

SELECT idx.relname AS indexname, pi.indisvalid, pi.indisready
FROM pg_index pi
JOIN pg_class idx ON idx.oid = pi.indexrelid
JOIN pg_namespace n ON n.oid = idx.relnamespace
WHERE n.nspname = 'public'
  AND idx.relname = 'builders_phone_e164_unique_idx';
```

### Read-only normalization and collision preview

```sql
WITH compact AS (
  SELECT id, phone, phone_e164,
         regexp_replace(BTRIM(phone), '[[:space:]()-]', '', 'g') AS value
  FROM public.builders
  WHERE phone_e164 IS NULL
), candidates AS (
  SELECT id, phone,
         CASE
           WHEN value ~ '^\+?[0-9]+$'
            AND regexp_replace(value, '^\+', '') ~ '^[6-9][0-9]{9}$'
             THEN '+91' || regexp_replace(value, '^\+', '')
           WHEN value ~ '^\+?[0-9]+$'
            AND regexp_replace(value, '^\+', '') ~ '^91[6-9][0-9]{9}$'
             THEN '+' || regexp_replace(value, '^\+', '')
           ELSE NULL
         END AS canonical
  FROM compact
), occupied AS (
  SELECT id, phone_e164 AS canonical, 'already populated' AS source
  FROM public.builders
  WHERE phone_e164 IS NOT NULL
  UNION ALL
  SELECT id, canonical, 'candidate' AS source
  FROM candidates
  WHERE canonical IS NOT NULL
)
SELECT canonical, COUNT(*) AS rows,
       ARRAY_AGG(id ORDER BY id) AS builder_ids,
       ARRAY_AGG(source ORDER BY id) AS sources
FROM occupied
GROUP BY canonical
HAVING COUNT(*) > 1
ORDER BY canonical;
```

Any returned canonical value is a collision, including a collision between an
existing `phone_e164` and a proposed value. Resolve it against authoritative
account records; do not pick a winner automatically. Rows for which `canonical`
is `NULL` are invalid/unresolved and must remain unchanged with `phone_e164`
`NULL`.

To count valid, invalid, and distinct candidate mobiles before the manifest is
approved:

```sql
WITH compact AS (
  SELECT id, phone,
         regexp_replace(BTRIM(phone), '[[:space:]()-]', '', 'g') AS value
  FROM public.builders
  WHERE phone_e164 IS NULL
), candidates AS (
  SELECT id,
         CASE
           WHEN value ~ '^\+?[0-9]+$'
            AND regexp_replace(value, '^\+', '') ~ '^[6-9][0-9]{9}$'
             THEN '+91' || regexp_replace(value, '^\+', '')
           WHEN value ~ '^\+?[0-9]+$'
            AND regexp_replace(value, '^\+', '') ~ '^91[6-9][0-9]{9}$'
             THEN '+' || regexp_replace(value, '^\+', '')
           ELSE NULL
         END AS canonical
  FROM compact
)
SELECT COUNT(*) AS not_normalized,
       COUNT(*) FILTER (WHERE canonical IS NOT NULL) AS valid_candidates,
       COUNT(*) FILTER (WHERE canonical IS NULL) AS invalid_or_unresolved
FROM candidates;
```

For the approved manifest (`ops.backfill_builder_phones`, illustrative fields:
`run_id`, `builder_id`, `canonical`, `evidence_ref`, `reviewed_by`,
`reviewed_at`, `status`), use explicit staging checks as well. Replace the run
identifier as above.

```sql
-- Each builder may appear only once in a run.
SELECT builder_id, COUNT(*) AS entries
FROM ops.backfill_builder_phones
WHERE run_id = 'REPLACE_WITH_RUN_ID'
GROUP BY builder_id
HAVING COUNT(*) > 1;

-- Reject missing builders, malformed/unreviewed canonical values and conflicts.
SELECT s.*
FROM ops.backfill_builder_phones s
LEFT JOIN public.builders b ON b.id = s.builder_id
WHERE s.run_id = 'REPLACE_WITH_RUN_ID'
  AND (b.id IS NULL
       OR s.canonical IS NULL
       OR s.canonical !~ '^\+91[6-9][0-9]{9}$'
       OR s.status IS DISTINCT FROM 'verified'
       OR NULLIF(BTRIM(s.evidence_ref), '') IS NULL
       OR NULLIF(BTRIM(s.reviewed_by), '') IS NULL
       OR s.reviewed_at IS NULL
       OR (b.phone_e164 IS NOT NULL
           AND b.phone_e164 IS DISTINCT FROM s.canonical));

-- Duplicate proposed canonical values must be resolved first.
SELECT canonical, COUNT(*) AS candidates,
       ARRAY_AGG(builder_id ORDER BY builder_id) AS builder_ids
FROM ops.backfill_builder_phones
WHERE run_id = 'REPLACE_WITH_RUN_ID'
GROUP BY canonical
HAVING COUNT(*) > 1;

-- A proposed value already owned by another builder is a collision.
SELECT s.canonical, COUNT(*) AS owners,
       ARRAY_AGG(b.id ORDER BY b.id) AS builder_ids
FROM ops.backfill_builder_phones s
JOIN public.builders b ON b.phone_e164 = s.canonical
WHERE s.run_id = 'REPLACE_WITH_RUN_ID'
  AND b.id <> s.builder_id
GROUP BY s.canonical
HAVING COUNT(*) > 0;

-- Exact number of currently NULL targets that would be updated.
SELECT COUNT(*) AS would_update,
       COUNT(DISTINCT b.id) AS distinct_builders
FROM ops.backfill_builder_phones s
JOIN public.builders b ON b.id = s.builder_id
WHERE s.run_id = 'REPLACE_WITH_RUN_ID'
  AND s.status = 'verified'
  AND s.canonical ~ '^\+91[6-9][0-9]{9}$'
  AND b.phone_e164 IS NULL;
```

The duplicate-ID, invalid-row, duplicate-number and other-owner collision
queries must return zero rows. The eligible count must match the signed-off
manifest exactly. A value already present on the same builder is not rewritten;
all other populated values are preserved. Confirm the unique index is valid and
ready before scheduling a write. Do not normalize by rewriting the legacy
`phone` field.

## 3. Counts, execution controls and post-checks

Before a separately approved write, capture and retain the baseline counts from
both tables and the exact eligible IDs/counts from each manifest. Execute in a
small, explicit transaction or reviewed batches; save an audit record for every
row with `run_id`, table/ID, previous value, proposed value, evidence, reviewer
and timestamp. Use conditional updates that still require the target field to
be `NULL`; abort on a row-count mismatch. Do not perform an unbounded update
based only on `property_type`, a regex, or a guessed locality/unit.

After each batch, compare:

- affected row count against the signed-off manifest and audit rows;
- total row counts in `properties` and `builders` against the captured baseline
  (they must not change);
- every changed property ID/value against its evidence record;
- every non-NULL `phone_e164` against `normalizeIndianMobile(phone)`;
- duplicate canonical mobiles and the unique index state;
- unresolved counts, which may remain non-zero by design.

The only area-unit update is `NULL` → verified unit. The only phone update is
`phone_e164` `NULL` → verified canonical number. Preserve every existing
non-NULL value and every original area/phone value.

## 4. Rollback guidance

Do not roll back by dropping columns, reverting migration hashes, or resetting
tables. Keep the forward schema and the per-row audit. If a backfill value is
wrong, first pause dependent jobs and check whether the row was subsequently
edited or used. Restore only rows from that run whose current value still equals
the exact value written by that run; skip and investigate any row that has since
changed. For area units, the audited previous value should be `NULL`; for mobile
normalization, restore `phone_e164` to its audited prior value (normally
`NULL`) while leaving `builders.phone` untouched. Re-run the read-only
collision/count checks afterward. If a correction is needed, preserve the
original run and record a compensating audit event rather than deleting history.

No backfill, preview query, or rollback was executed while preparing this plan.
