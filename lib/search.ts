import type { Application, ApplicationCategory } from "@/types";
import { CATEGORY_LABELS } from "@/data/applications";

export type CategoryFilterValue = ApplicationCategory | "all";

/** Normalizes a string for case- and diacritic-insensitive matching. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** True if the application matches the free-text query across name, description, category, tags and notes. */
export function matchesQuery(application: Application, query: string): boolean {
  const q = normalize(query.trim());
  if (!q) return true;

  const haystack = normalize(
    [
      application.name,
      application.description,
      CATEGORY_LABELS[application.category],
      ...(application.tags ?? []),
      application.notes ?? "",
    ].join(" ")
  );
  return haystack.includes(q);
}

/** True if the application matches the active category filter. */
export function matchesCategory(application: Application, category: CategoryFilterValue): boolean {
  return category === "all" || application.category === category;
}

/** Filters applications by free-text query and category. Pure and unit-testable. */
export function filterApplications(
  applications: Application[],
  query: string,
  category: CategoryFilterValue = "all"
): Application[] {
  return applications.filter(
    (application) => matchesCategory(application, category) && matchesQuery(application, query)
  );
}
