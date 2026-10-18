import type { Application, ApplicationCategory } from "@/types";
import { isValidExternalUrl } from "@/lib/utils";

/** Human-readable label per category, in the order the filters are shown. */
export const CATEGORY_LABELS: Record<ApplicationCategory, string> = {
  saas: "SaaS",
  crm: "CRM",
  internal: "Interne Tools",
  customer: "Kundenprojekte",
  tool: "Tools",
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as ApplicationCategory[];

/** Categories in use, in the fixed display order of CATEGORY_LABELS. */
export function getCategories(list: Application[]): ApplicationCategory[] {
  const used = new Set(list.map((app) => app.category));
  return CATEGORY_ORDER.filter((category) => used.has(category));
}

/** Icons may be a root-relative path under /public or an absolute http(s) URL. */
export function isValidIconSource(icon: string): boolean {
  return (icon.startsWith("/") && !icon.startsWith("//")) || isValidExternalUrl(icon);
}
