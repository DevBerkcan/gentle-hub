import Link from "next/link";
import { cn } from "@/lib/cn";
import { IconX } from "@/components/ui/icons";

function href(params: { category?: string; q?: string; tag?: string }) {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.q) query.set("q", params.q);
  if (params.tag) query.set("tag", params.tag);
  return query.size > 0 ? `/passwords?${query.toString()}` : "/passwords";
}

/**
 * Tag cloud as a server-side filter (?tag=). Free-text search stays in the
 * list's live search field; ?q= is still honoured for links from elsewhere.
 */
export function VaultSearch({
  category,
  query,
  activeTag,
  byTag,
}: {
  category?: string;
  query?: string;
  activeTag?: string;
  byTag: Record<string, number>;
}) {
  const tags = Object.entries(byTag);
  if (tags.length === 0 && !query && !activeTag) return null;

  return (
    <div className="flex flex-col gap-2">
      {tags.length > 0 && (
        <nav aria-label="Nach Tag filtern" className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.14em] text-subtle">Tags</span>
          {tags.map(([tag, count]) => {
            const active = activeTag?.toLowerCase() === tag.toLowerCase();
            return (
              <Link
                key={tag}
                href={href({ category, q: query, tag: active ? undefined : tag })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition",
                  active
                    ? "bg-[#0b6b49] text-white"
                    : "bg-[#e9fbf3] text-[#0b6b49] hover:bg-[#d4f6e6] dark:bg-emerald-500/10 dark:text-emerald-300",
                )}
              >
                #{tag}
                <span className={cn("text-[9.5px] tabular-nums", active ? "text-white/70" : "opacity-60")}>{count}</span>
                {active && <IconX className="h-2.5 w-2.5" />}
              </Link>
            );
          })}
        </nav>
      )}

      {(query || activeTag) && (
        <p className="text-[11.5px] text-muted">
          Gefiltert{query ? ` nach „${query}“` : ""}
          {activeTag ? ` mit Tag #${activeTag}` : ""} ·{" "}
          <Link href={href({ category })} className="font-semibold text-accent hover:underline">
            Filter zurücksetzen
          </Link>
        </p>
      )}
    </div>
  );
}
