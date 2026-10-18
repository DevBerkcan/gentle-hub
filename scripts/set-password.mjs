// Creates an account or sets a new password — no e-mails involved.
// Usage: npm run user:password -- berkcan@gentlegroup.de
// The password is asked for interactively (hidden). For automation it can be
// passed via the GENTLEHUB_PASSWORD environment variable instead.
// Setting a password signs the user out on all devices.
import { randomBytes } from "node:crypto";
import readline from "node:readline";
import pg from "pg";
import { hashPassword } from "better-auth/crypto";

const MIN_LENGTH = 12; // keep in sync with lib/password-policy.ts
const MAX_LENGTH = 128;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (text) => {
      if (text.includes(question)) process.stdout.write(question);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!email.includes("@")) fail("Bitte E-Mail angeben: npm run user:password -- name@gentlegroup.de");
if (!process.env.DATABASE_URL) fail("DATABASE_URL fehlt (in .env.local oder als Umgebungsvariable setzen).");

const allowed = new Set(
  (process.env.ALLOWED_EMAILS ?? "").split(/[\s,;]+/).map((value) => value.trim().toLowerCase()).filter(Boolean)
);
if (!allowed.has(email)) fail(`${email} steht nicht in ALLOWED_EMAILS – Zugang wäre ohnehin gesperrt.`);

let password = process.env.GENTLEHUB_PASSWORD;
if (!password) {
  if (!process.stdin.isTTY) fail("Kein Terminal: Passwort über GENTLEHUB_PASSWORD übergeben.");
  password = await askHidden(`Neues Passwort für ${email}: `);
  const repeat = await askHidden("Passwort wiederholen: ");
  if (password !== repeat) fail("Die Passwörter stimmen nicht überein.");
}
if (password.length < MIN_LENGTH || password.length > MAX_LENGTH)
  fail(`Das Passwort muss ${MIN_LENGTH}–${MAX_LENGTH} Zeichen lang sein.`);

const id = () => randomBytes(24).toString("base64url");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  await client.query("begin");
  const hash = await hashPassword(password);
  const name = email.split("@")[0];

  let { rows } = await client.query('select id from "user" where lower(email) = $1', [email]);
  let userId = rows[0]?.id;
  const created = !userId;
  if (created) {
    userId = id();
    await client.query(
      `insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
       values ($1, $2, $3, true, now(), now())`,
      [userId, name.charAt(0).toUpperCase() + name.slice(1), email]
    );
  }

  ({ rows } = await client.query(`select id from account where "userId" = $1 and "providerId" = 'credential'`, [userId]));
  if (rows[0]) {
    await client.query(`update account set password = $1, "updatedAt" = now() where id = $2`, [hash, rows[0].id]);
  } else {
    await client.query(
      `insert into account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
       values ($1, $2, 'credential', $2, $3, now(), now())`,
      [id(), userId, hash]
    );
  }

  const { rowCount } = await client.query('delete from session where "userId" = $1', [userId]);
  await client.query("commit");
  console.log(
    created
      ? `Konto für ${email} angelegt.`
      : `Passwort für ${email} geändert, ${rowCount} Sitzung(en) abgemeldet.`
  );
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  client.release();
  await pool.end();
}
