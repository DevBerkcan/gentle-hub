import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllowedEmails, isAllowedEmail } from "@/lib/allowlist";

export type HubUser = { id: string; email: string; name: string };

/** Current user if signed in AND still on the allowlist, otherwise null. */
export async function getUser(): Promise<HubUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !isAllowedEmail(session.user.email, getAllowedEmails())) return null;
  return { id: session.user.id, email: session.user.email, name: session.user.name };
}

/**
 * Data Access Layer guard: every page and server action calls this. The proxy
 * only does a cheap cookie check; this is the real authorization boundary.
 */
export async function requireUser(): Promise<HubUser> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}
