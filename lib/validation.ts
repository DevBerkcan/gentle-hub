import type { ApplicationEnvironment, ApplicationInput } from "@/types";
import { CATEGORY_LABELS, isValidIconSource } from "@/data/applications";
import { isValidExternalUrl } from "@/lib/utils";

export const LIMITS = {
  name: 60,
  description: 200,
  url: 2048,
  icon: 2048,
  notes: 20_000,
} as const;

const ENVIRONMENTS: ApplicationEnvironment[] = ["production", "staging", "development"];

export type FieldErrors = Partial<Record<keyof ApplicationInput, string>>;

export type ValidationResult =
  | { ok: true; value: ApplicationInput }
  | { ok: false; errors: FieldErrors };

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Validates and normalizes application input. Shared by the form (instant
 * feedback) and the server actions (authoritative check).
 */
export function validateApplicationInput(raw: unknown): ValidationResult {
  const input = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const name = str(input.name);
  const description = str(input.description);
  const url = str(input.url);
  const icon = str(input.icon);
  const category = str(input.category);
  const environment = str(input.environment);
  const errors: FieldErrors = {};

  if (!name) errors.name = "Bitte einen Namen angeben.";
  else if (name.length > LIMITS.name) errors.name = `Maximal ${LIMITS.name} Zeichen.`;

  if (description.length > LIMITS.description) errors.description = `Maximal ${LIMITS.description} Zeichen.`;

  if (!url) errors.url = "Bitte einen Link angeben.";
  else if (url.length > LIMITS.url || !isValidExternalUrl(url))
    errors.url = "Bitte eine vollständige Adresse mit https:// angeben.";

  if (icon && (icon.length > LIMITS.icon || !isValidIconSource(icon)))
    errors.icon = "Icon muss ein Pfad wie /apps/logo.svg oder eine https-Adresse sein.";

  if (!(category in CATEGORY_LABELS)) errors.category = "Bitte eine Kategorie wählen.";

  if (environment && !ENVIRONMENTS.includes(environment as ApplicationEnvironment))
    errors.environment = "Unbekannte Umgebung.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name,
      description,
      url,
      icon: icon || undefined,
      category: category as ApplicationInput["category"],
      environment: (environment || undefined) as ApplicationEnvironment | undefined,
    },
  };
}

/** Normalizes notes: must be a string within the length limit. */
export function validateNotes(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length > LIMITS.notes) return null;
  return raw;
}
