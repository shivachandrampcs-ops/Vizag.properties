#!/usr/bin/env node
/**
 * set-credentials.js
 * -------------------
 * Safely creates/updates the Admin login and/or a Builder login directly in
 * the Neon/Postgres database, using the same bcrypt hashing the app already
 * uses (src/lib/auth.ts). This does NOT touch seed-data.ts and will not
 * affect any other builder accounts or property data.
 *
 * Credentials are never hardcoded here — they're read from environment
 * variables (or a local .env file) so nothing sensitive ends up committed
 * to git.
 *
 * USAGE
 * -----
 * 1. Make sure DATABASE_URL is set (it already is in your .env for the app).
 * 2. Set the credentials you want as env vars, then run the script:
 *
 *    # Update / create the admin account
 *    ADMIN_EMAIL="you@yourdomain.com" \
 *    ADMIN_PASSWORD="YourNewStrongPassword!23" \
 *    node scripts/set-credentials.js --admin
 *
 *    # Update an existing builder account (identified by its CURRENT email)
 *    BUILDER_CURRENT_EMAIL="contact@sravanthi.com" \
 *    BUILDER_EMAIL="you@yourdomain.com" \
 *    BUILDER_PASSWORD="YourNewStrongPassword!23" \
 *    node scripts/set-credentials.js --builder
 *
 *    # Do both in one run
 *    ADMIN_EMAIL="..." ADMIN_PASSWORD="..." \
 *    BUILDER_CURRENT_EMAIL="..." BUILDER_EMAIL="..." BUILDER_PASSWORD="..." \
 *    node scripts/set-credentials.js --admin --builder
 *
 *    # Just list current admin/builder emails (no changes made)
 *    node scripts/set-credentials.js --list
 *
 * On Windows PowerShell, set env vars first:
 *    $env:ADMIN_EMAIL="you@yourdomain.com"; $env:ADMIN_PASSWORD="..."; node scripts/set-credentials.js --admin
 */

require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const args = process.argv.slice(2);
const doAdmin = args.includes("--admin");
const doBuilder = args.includes("--builder");
const doList = args.includes("--list");

if (!doAdmin && !doBuilder && !doList) {
  console.log(
    "Usage: node scripts/set-credentials.js [--admin] [--builder] [--list]\n" +
      "See the comment header in this file for the required environment variables."
  );
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set. Add it to your .env file first.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function assertStrongPassword(pw, label) {
  if (!pw || pw.length < 8) {
    throw new Error(
      `${label} must be at least 8 characters. Set it via an environment variable.`
    );
  }
}

async function listAccounts() {
  const admins = await pool.query(
    `SELECT id, name, email, role FROM admins ORDER BY id`
  );
  const builders = await pool.query(
    `SELECT id, name, email, is_active FROM builders ORDER BY id`
  );

  console.log("\n📋 Admins:");
  for (const a of admins.rows) {
    console.log(`  #${a.id}  ${a.email}  (${a.name}, role=${a.role})`);
  }

  console.log("\n📋 Builders:");
  for (const b of builders.rows) {
    console.log(`  #${b.id}  ${b.email}  (${b.name}, active=${b.is_active})`);
  }
  console.log("");
}

async function updateAdmin() {
  const currentEmail = (process.env.ADMIN_CURRENT_EMAIL || "admin@vizag.properties")
    .toLowerCase()
    .trim();
  const newEmail = process.env.ADMIN_EMAIL;
  const newPassword = process.env.ADMIN_PASSWORD;
  const newName = process.env.ADMIN_NAME; // optional

  if (!newEmail) throw new Error("ADMIN_EMAIL env var is required with --admin.");
  assertStrongPassword(newPassword, "ADMIN_PASSWORD");

  const hash = await bcrypt.hash(newPassword, 10);
  const normalizedNewEmail = newEmail.toLowerCase().trim();

  const existing = await pool.query(
    `SELECT id FROM admins WHERE email = $1 LIMIT 1`,
    [currentEmail]
  );

  if (existing.rows.length > 0) {
    const id = existing.rows[0].id;
    const setName = newName ? `, name = $3` : "";
    const params = newName
      ? [normalizedNewEmail, hash, newName, id]
      : [normalizedNewEmail, hash, id];
    await pool.query(
      `UPDATE admins SET email = $1, password_hash = $2${setName} WHERE id = $${
        newName ? 4 : 3
      }`,
      params
    );
    console.log(`✅ Updated admin #${id}: ${currentEmail} -> ${normalizedNewEmail}`);
  } else {
    await pool.query(
      `INSERT INTO admins (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin')`,
      [newName || "Site Admin", normalizedNewEmail, hash]
    );
    console.log(
      `✅ No admin found with email ${currentEmail}. Created a new admin: ${normalizedNewEmail}`
    );
  }
}

async function updateBuilder() {
  const currentEmail = process.env.BUILDER_CURRENT_EMAIL;
  const newEmail = process.env.BUILDER_EMAIL;
  const newPassword = process.env.BUILDER_PASSWORD;

  if (!currentEmail)
    throw new Error(
      "BUILDER_CURRENT_EMAIL env var is required with --builder (use --list to see existing builder emails)."
    );
  if (!newEmail) throw new Error("BUILDER_EMAIL env var is required with --builder.");
  assertStrongPassword(newPassword, "BUILDER_PASSWORD");

  const hash = await bcrypt.hash(newPassword, 10);
  const normalizedCurrentEmail = currentEmail.toLowerCase().trim();
  const normalizedNewEmail = newEmail.toLowerCase().trim();

  const existing = await pool.query(
    `SELECT id, name FROM builders WHERE email = $1 LIMIT 1`,
    [normalizedCurrentEmail]
  );

  if (existing.rows.length === 0) {
    throw new Error(
      `No builder found with email ${normalizedCurrentEmail}. Run with --list to see existing builder emails.`
    );
  }

  const id = existing.rows[0].id;
  await pool.query(
    `UPDATE builders SET email = $1, password_hash = $2 WHERE id = $3`,
    [normalizedNewEmail, hash, id]
  );
  console.log(
    `✅ Updated builder #${id} (${existing.rows[0].name}): ${normalizedCurrentEmail} -> ${normalizedNewEmail}`
  );
}

(async () => {
  try {
    if (doList) await listAccounts();
    if (doAdmin) await updateAdmin();
    if (doBuilder) await updateBuilder();
  } catch (err) {
    console.error("❌", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
