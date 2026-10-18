"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import * as repo from "@/lib/repo";
import { validateApplicationInput, validateNotes, type FieldErrors } from "@/lib/validation";
import { isVaultBlob } from "@/lib/vault";

export type ActionFailure = { ok: false; error: string; errors?: FieldErrors };
export type ActionResult<T = object> = ({ ok: true } & T) | ActionFailure;

function isId(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9-]{1,64}$/.test(value);
}

const NOT_FOUND: ActionFailure = { ok: false, error: "Anwendung nicht gefunden." };
const BAD_INPUT: ActionFailure = { ok: false, error: "Ungültige Eingabe." };

export async function createApplicationAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const result = validateApplicationInput(input);
  if (!result.ok) return { ok: false, error: "Bitte die markierten Felder prüfen.", errors: result.errors };

  const id = crypto.randomUUID();
  await repo.insertApplication(id, result.value, user.email);
  revalidatePath("/");
  return { ok: true, id };
}

export async function updateApplicationAction(id: unknown, input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!isId(id)) return BAD_INPUT;
  const result = validateApplicationInput(input);
  if (!result.ok) return { ok: false, error: "Bitte die markierten Felder prüfen.", errors: result.errors };

  if (!(await repo.updateApplication(id, result.value, user.email))) return NOT_FOUND;
  revalidatePath("/");
  return { ok: true };
}

export async function updateNotesAction(id: unknown, notes: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const value = validateNotes(notes);
  if (!isId(id) || value === null) return BAD_INPUT;

  if (!(await repo.updateNotes(id, value, user.email))) return NOT_FOUND;
  revalidatePath("/");
  return { ok: true };
}

export async function deleteApplicationAction(id: unknown): Promise<ActionResult> {
  await requireUser();
  if (!isId(id)) return BAD_INPUT;

  if (!(await repo.deleteApplication(id))) return NOT_FOUND;
  revalidatePath("/");
  return { ok: true };
}

export async function setFavoriteAction(id: unknown, favorite: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!isId(id) || typeof favorite !== "boolean") return BAD_INPUT;

  await repo.setFavorite(user.id, id, favorite);
  revalidatePath("/");
  return { ok: true };
}

/** Stores the client-encrypted vault blob. The server never sees plaintext. */
export async function saveVaultAction(
  blob: unknown,
  expectedUpdatedAt: unknown
): Promise<ActionResult<{ updatedAt: string }> | { ok: false; error: string; conflict: true }> {
  const user = await requireUser();
  if (!isVaultBlob(blob)) return BAD_INPUT;
  if (expectedUpdatedAt !== null && (typeof expectedUpdatedAt !== "string" || Number.isNaN(Date.parse(expectedUpdatedAt))))
    return BAD_INPUT;

  const updatedAt = await repo.saveVault(blob, expectedUpdatedAt, user.email);
  if (!updatedAt) {
    return {
      ok: false,
      conflict: true,
      error: "Der Tresor wurde zwischenzeitlich geändert. Bitte neu entsperren und erneut speichern.",
    };
  }
  revalidatePath("/");
  return { ok: true, updatedAt };
}
