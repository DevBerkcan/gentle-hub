// Imports applications (link, details, notes) from a local JSON file into the database.
// Existing applications with the same id are updated, others are created.
// Usage: npm run db:import -- data/private/gentlebook.json
// Keep such files in data/private/ (gitignored) — the repository is public.
import { readFileSync } from "node:fs";
import pg from "pg";

const CATEGORIES = ["saas", "crm", "internal", "customer", "tool"]; // keep in sync with data/applications.ts
const ENVIRONMENTS = ["production", "staging", "development"];
const LIMITS = { name: 60, description: 200, url: 2048, notes: 20_000 }; // keep in sync with lib/validation.ts

function fail(message) {
  console.error(message);
  process.exit(1);
}

function isHttpUrl(value) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

function validate(app, index) {
  const where = `Eintrag ${index + 1}${app?.name ? ` (${app.name})` : ""}`;
  const problems = [];
  if (typeof app !== "object" || app === null) return [`${where}: kein Objekt`];
  if (typeof app.id !== "string" || !/^[a-z0-9-]{1,64}$/.test(app.id)) problems.push("id (a-z, 0-9, -)");
  if (typeof app.name !== "string" || !app.name.trim() || app.name.length > LIMITS.name) problems.push("name");
  if (app.description !== undefined && (typeof app.description !== "string" || app.description.length > LIMITS.description))
    problems.push("description");
  if (typeof app.url !== "string" || app.url.length > LIMITS.url || !isHttpUrl(app.url)) problems.push("url (http/https)");
  if (!CATEGORIES.includes(app.category)) problems.push(`category (${CATEGORIES.join(", ")})`);
  if (app.environment !== undefined && !ENVIRONMENTS.includes(app.environment)) problems.push("environment");
  if (app.notes !== undefined && (typeof app.notes !== "string" || app.notes.length > LIMITS.notes)) problems.push("notes");
  return problems.map((problem) => `${where}: ungültiges Feld ${problem}`);
}

const file = process.argv[2];
if (!file) fail("Bitte Datei angeben: npm run db:import -- data/private/gentlebook.json");
if (!process.env.DATABASE_URL) fail("DATABASE_URL fehlt (in .env.local oder als Umgebungsvariable setzen).");

let applications;
try {
  applications = JSON.parse(readFileSync(file, "utf8"));
} catch (error) {
  fail(`Datei konnte nicht gelesen werden: ${error.message}`);
}
if (!Array.isArray(applications)) fail("Die Datei muss eine Liste (JSON-Array) von Anwendungen enthalten.");

const problems = applications.flatMap(validate);
if (problems.length > 0) fail(problems.join("\n"));

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  for (const app of applications) {
    const { rows } = await pool.query(
      `insert into applications (id, name, description, url, category, environment, notes, updated_by)
       values ($1, $2, $3, $4, $5, $6, $7, 'import')
       on conflict (id) do update set
         name = excluded.name, description = excluded.description, url = excluded.url,
         category = excluded.category, environment = excluded.environment,
         notes = coalesce($8, applications.notes), updated_at = now(), updated_by = 'import'
       returning (xmax = 0) as created`,
      [
        app.id,
        app.name.trim(),
        app.description?.trim() ?? "",
        app.url,
        app.category,
        app.environment ?? null,
        app.notes ?? "",
        app.notes ?? null,
      ]
    );
    console.log(`${rows[0].created ? "Angelegt" : "Aktualisiert"}: ${app.name}`);
  }
} finally {
  await pool.end();
}
