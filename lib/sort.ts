import type { Project, ProjectKind } from "@/lib/types";

const INTERNAL_ORDER = [
  "gentlehub",
  "gentlebook",
  "gentlesuite",
  "gentleaccess",
  "gentletrack",
  "gentlegroup",
  "gastroteam",
  "backreserve",
  "angebotpilot",
  "gentlecars",
  "gentlecalc",
  "gentlewebdesign",
];

const STATUS_ORDER: Record<string, number> = {
  live: 0,
  beta: 1,
  development: 2,
  paused: 3,
  archived: 4,
};

export function sortProjects(kind: ProjectKind, projects: Project[]): Project[] {
  const list = [...projects];

  if (kind === "internal") {
    return list.sort((a, b) => {
      const rankA = INTERNAL_ORDER.indexOf(a.slug);
      const rankB = INTERNAL_ORDER.indexOf(b.slug);
      return (rankA === -1 ? 99 : rankA) - (rankB === -1 ? 99 : rankB) || a.name.localeCompare(b.name, "de");
    });
  }

  if (kind === "customer") {
    return list.sort(
      (a, b) =>
        (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9) ||
        b.assetCount - a.assetCount ||
        a.name.localeCompare(b.name, "de"),
    );
  }

  return list.sort(
    (a, b) =>
      (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9) ||
      a.name.localeCompare(b.name, "de"),
  );
}
