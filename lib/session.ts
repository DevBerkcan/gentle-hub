import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/constants";
import type { User } from "@/lib/types";

export const getSessionToken = cache(async (): Promise<string | null> => {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
});

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    return await api.me(token);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return null;
    }
    throw error;
  }
});

/** Requires a valid session. Redirects to /login otherwise. */
export async function requireAuth(): Promise<{ token: string; user: User }> {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const user = await getCurrentUser();
  if (!user) redirect("/login?expired=1");

  return { token, user };
}

export async function requireUser(): Promise<User> {
  return (await requireAuth()).user;
}
