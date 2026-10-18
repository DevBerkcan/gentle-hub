import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { pool } from "@/lib/db";
import { getAllowedEmails, isAllowedEmail } from "@/lib/allowlist";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/lib/password-policy";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

/**
 * Better Auth with e-mail + password — no e-mails are ever sent. Self sign-up
 * is disabled; accounts are created with `npm run user:password`. Access is
 * restricted to ALLOWED_EMAILS at user creation, and every page and server
 * action re-checks it via requireUser().
 *
 * Keep the auth options in sync with scripts/migrate.mjs (it defines the schema).
 */
export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
    maxPasswordLength: MAX_PASSWORD_LENGTH,
  },
  session: {
    expiresIn: THIRTY_DAYS,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/change-password": { window: 60, max: 5 },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => isAllowedEmail(user.email, getAllowedEmails()),
      },
    },
  },
  plugins: [nextCookies()],
});
