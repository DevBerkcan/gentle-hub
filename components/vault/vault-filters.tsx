import Link from "next/link";
import { cn } from "@/lib/cn";
import { CREDENTIAL_CATEGORIES } from "@/lib/constants";

export function VaultFilters({
  total,
  byCategory,
  activeCategory,
}: {
  total: number;
  byCategory: Record<string, number>;
  activeCategory?: string;
}) {
  const items = [
    { key: "", label: "Alle", count: total },
    ...CREDENTIAL_CATEGORIES.map((category) => ({
      key: category.key as string,
      label: category.label,
      count: byCategory[category.key] ?? 0,
    })),
  ];

  return (
    <nav aria-label="Passwörter nach Kategorie filtern" className="flex flex-wrap items-center gap-1.5">
      {items.map((item) => {
        const active = item.key === (activeCategory ?? "");
        return (
          <Link
            key={item.key || "all"}
            href={item.key ? `/passwords?category=${item.key}` : "/passwords"}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[11.5px] font-medium transition",
              active
                ? "border-ink/15 bg-ink text-surface"
                : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink",
            )}
          >
            {item.label}
            <span
              className={cn(
                "text-[9.5px] font-semibold tabular-nums",
                active ? "text-surface/60" : "text-subtle",
              )}
            >
              {item.count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
