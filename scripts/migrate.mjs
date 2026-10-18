// Creates/updates the database schema and inserts the seed applications.
// Usage: npm run db:migrate   (reads DATABASE_URL from .env.local or the environment)
import { readFileSync } from "node:fs";
import pg from "pg";
import { getMigrations } from "better-auth/db/migration";

const SEED = [
  {
    id: "gentlebook",
    name: "GentleBook",
    description: "SaaS für Online-Terminbuchungen.",
    url: "https://www.gentlebook.de/superadmin/login",
    category: "saas",
  },
];

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL fehlt (in .env.local oder als Umgebungsvariable setzen).");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  // Same auth features as lib/auth.ts — they define the auth schema.
  const { runMigrations, toBeCreated, toBeAdded } = await getMigrations({
    database: pool,
    emailAndPassword: { enabled: true },
  });
  console.log(`Better Auth: ${toBeCreated.length} neue Tabellen, ${toBeAdded.length} Tabellen mit neuen Spalten`);
  await runMigrations();

  await pool.query(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
  console.log("App-Tabellen: ok");

  const { rows } = await pool.query("select count(*)::int as count from applications");
  if (rows[0].count === 0) {
    for (const app of SEED) {
      await pool.query(
        "insert into applications (id, name, description, url, category) values ($1, $2, $3, $4, $5)",
        [app.id, app.name, app.description, app.url, app.category]
      );
    }
    console.log(`Startdaten: ${SEED.length} Anwendung(en) angelegt`);
  }
  console.log("Migration abgeschlossen.");
} finally {
  await pool.end();
}
