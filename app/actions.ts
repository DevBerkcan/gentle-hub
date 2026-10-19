"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/constants";
import { getSessionToken } from "@/lib/session";
import type { ActionFailure, ActionResult, LoginState } from "@/lib/action-types";
import type { Asset, AssetInput, ProjectInput } from "@/lib/types";

function toFailure(error: unknown): ActionFailure {
  if (error instanceof ApiError) {
    return { ok: false, error: error.message, errors: error.errors };
  }

  return { ok: false, error: "Unerwarteter Fehler. Bitte erneut versuchen." };
}

function noSession(): ActionFailure {
  return { ok: false, error: "Deine Sitzung ist abgelaufen. Bitte neu anmelden." };
}

const SECURE_COOKIE = process.env.NODE_ENV === "production";

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Bitte E-Mail-Adresse und Passwort eingeben." };
  }

  let response;
  try {
    response = await api.login(email, password);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 429) {
        return { error: "Zu viele Fehlversuche. Bitte in einigen Minuten erneut versuchen." };
      }
      if (error.status === 401) {
        return { error: "E-Mail-Adresse oder Passwort ist falsch." };
      }
      return { error: error.message };
    }
    return { error: "Anmeldung fehlgeschlagen. Bitte erneut versuchen." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, response.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: SECURE_COOKIE,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    try {
      await api.logout(token);
    } catch {
      // The local cookie is cleared even when the API is unreachable.
    }
  }

  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult<{ message: string }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const response = await api.changePassword(token, input.currentPassword, input.newPassword);
    return { ok: true, message: response.message };
  } catch (error) {
    return toFailure(error);
  }
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function createProjectAction(
  input: ProjectInput,
): Promise<ActionResult<{ slug: string }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const response = await api.createProject(token, input);
    revalidatePath("/", "layout");
    return { ok: true, slug: response.slug };
  } catch (error) {
    return toFailure(error);
  }
}

export async function updateProjectAction(
  key: string,
  input: ProjectInput,
): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.updateProject(token, key, input);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

export async function deleteProjectAction(key: string): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.deleteProject(token, key);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

export async function setFavoriteAction(
  key: string,
  favorite: boolean,
): Promise<ActionResult<{ favorite: boolean }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const response = await api.setFavorite(token, key, favorite);
    revalidatePath("/", "layout");
    return { ok: true, favorite: response.favorite };
  } catch (error) {
    return toFailure(error);
  }
}

export async function saveNotesAction(key: string, notes: string): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.updateNotes(token, key, notes);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

export async function createAssetAction(
  projectKey: string,
  input: AssetInput,
): Promise<ActionResult<{ asset: Asset }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const asset = await api.createAsset(token, projectKey, input);
    revalidatePath("/", "layout");
    return { ok: true, asset };
  } catch (error) {
    return toFailure(error);
  }
}

export async function updateAssetAction(
  id: string,
  input: AssetInput,
): Promise<ActionResult<{ asset: Asset }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const asset = await api.updateAsset(token, id, input);
    revalidatePath("/", "layout");
    return { ok: true, asset };
  } catch (error) {
    return toFailure(error);
  }
}

export async function deleteAssetAction(id: string): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.deleteAsset(token, id);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

export async function revealSecretAction(
  id: string,
): Promise<ActionResult<{ secret: string; label: string }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const response = await api.revealAsset(token, id);
    return { ok: true, secret: response.secret, label: response.label };
  } catch (error) {
    return toFailure(error);
  }
}
