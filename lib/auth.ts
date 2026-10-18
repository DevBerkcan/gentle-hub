import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins/magic-link";
import { pool } from "@/lib/db";
import { sendLoginEmail } from "@/lib/mail";
import { createMagicLinkSender, getAllowedEmails, isAllowedEmail } from "@/lib/allowlist";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

/**
 * Better Auth with e-mail magic links only. Access is restricted to the
 * addresses in ALLOWED_EMAILS at three points: link sending, user creation and
 * session creation. Every page and server action re-checks via requireUser().
 *
 * Keep the plugin list in sync with scripts/migrate.mjs (it defines the schema).
 */
export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  session: {
    expiresIn: THIRTY_DAYS,
    updateAge: 60 * 60 * 24,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => isAllowedEmail(user.email, getAllowedEmails()),
      },
    },
  },
  plugins: [
    magicLink({
      expiresIn: 60 * 10,
      storeToken: "hashed",
      sendMagicLink: createMagicLinkSender(sendLoginEmail),
    }),
    nextCookies(),
  ],
});
