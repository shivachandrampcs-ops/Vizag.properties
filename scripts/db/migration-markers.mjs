/**
 * Return the schema object that a migration statement attempts to create or
 * change. The runner uses these markers to fail closed if an unrecorded
 * migration already has some of its objects in PostgreSQL.
 *
 * This intentionally recognizes only the DDL shapes used by this repository's
 * migration files. Unknown SQL statements are ignored here and still execute
 * normally when the migration is clean and journaled for the first time.
 */
export function migrationObjectMarker(statement) {
  const sql = statement.trim();
  let match = sql.match(/^CREATE TYPE "public"\."(\w+)" AS ENUM\(/);
  if (match) return { kind: "type", name: match[1] };

  match = sql.match(/^CREATE TABLE "(\w+)"\s*\(/);
  if (match) return { kind: "table", name: match[1] };

  match = sql.match(/^ALTER TABLE "(\w+)" ADD COLUMN "(\w+)"/);
  if (match) return { kind: "column", table: match[1], name: match[2] };

  match = sql.match(/^ALTER TABLE "(\w+)" ADD CONSTRAINT "(\w+)"/);
  if (match) {
    return { kind: "constraint", table: match[1], name: match[2] };
  }

  match = sql.match(/^CREATE (?:UNIQUE )?INDEX "(\w+)"/);
  if (match) return { kind: "index", name: match[1] };

  match = sql.match(
    /^ALTER TABLE "(\w+)" ALTER COLUMN "(\w+)" (DROP|SET) NOT NULL/
  );
  if (match) {
    return {
      kind: "nullability",
      table: match[1],
      column: match[2],
      nullable: match[3] === "DROP",
    };
  }

  return null;
}

/** Return every recognizable schema object in a migration's statements. */
export function migrationObjectMarkers(statements) {
  const markers = [];
  for (const statement of statements) {
    const sql = statement.trim();
    const marker = migrationObjectMarker(sql);
    if (marker) markers.push(marker);

    // Constraints embedded in a CREATE TABLE aren't separate ALTER statements,
    // but they are part of the baseline schema that a push-created DB must have
    // before the runner may safely journal that baseline as already applied.
    const table = sql.match(/^CREATE TABLE "(\w+)"\s*\(/);
    if (table) {
      for (const constraint of sql.matchAll(/\bCONSTRAINT\s+"(\w+)"/g)) {
        markers.push({
          kind: "constraint",
          table: table[1],
          name: constraint[1],
        });
      }
    }
  }
  return markers;
}
