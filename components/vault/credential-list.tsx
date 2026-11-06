"use client";

import { useMemo, useState } from "react";
import { CREDENTIAL_CATEGORIES } from "@/lib/constants";
import type { Credential, CredentialCategory } from "@/lib/types";
import { CategoryIcon } from "@/components/vault/category-icon";
import { CredentialRow } from "@/components/vault/credential-row";
import { IconSearch, IconX } from "@/components/ui/icons";

const CATEGORY_ORDER: CredentialCategory[] = CREDENTIAL_CATEGORIES.map((category) => category.key);

export function CredentialList({ items }: { items: Credential[] }) {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    // "#tag" matches tags only; plain text also searches the tags.
    const tagOnly = needle.startsWith("#");
    const tagNeedle = needle.replace(/^#+/, "");
    const filtered = needle
      ? items.filter((credential) => {
          const tags = (credential.tags ?? []).map((tag) => tag.toLowerCase());
          if (tagOnly) return tags.some((tag) => tag.includes(tagNeedle));
          return [credential.label, credential.url, credential.username, credential.provider, credential.notes, ...tags]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(needle));
        })
      : items;

    return CATEGORY_ORDER.map((key) => {
      const meta = CREDENTIAL_CATEGORIES.find((category) => category.key === key)!;
      return {
        key,
        label: meta.label,
        description: meta.description,
        items: filtered.filter((credential) => credential.category === key),
      };
    }).filter((group) => group.items.length > 0);
  }, [items, query]);

  const matchCount = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:max-w-sm">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nach Label, Adresse, Benutzer, Anbieter oder #Tag suchen …"
            aria-label="Passwörter durchsuchen"
            className="input pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Suche zurücksetzen"
              className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-[6px] text-subtle transition hover:bg-surface-2 hover:text-ink"
            >
              <IconX className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-[11px] font-medium text-muted">
          {matchCount} {matchCount === 1 ? "Eintrag" : "Einträge"}
          {query ? " gefunden" : ""}
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-[10px] border border-dashed border-line-strong bg-surface px-4 py-6 text-center text-[12px] text-muted">
          Kein Eintrag passt zu „{query}“.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.key} aria-labelledby={`vault-group-${group.key}`}>
              <div className="mb-2.5 flex items-center gap-2.5">
                <CategoryIcon category={group.key} className="h-7 w-7" />
                <div className="min-w-0">
                  <h2
                    id={`vault-group-${group.key}`}
                    className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink"
                  >
                    {group.label}
                    <span className="rounded-[4px] bg-surface-2 px-1.5 py-0.5 text-[9.5px] font-semibold tabular-nums text-muted">
                      {group.items.length}
                    </span>
                  </h2>
                  <p className="truncate text-[10.5px] text-muted">{group.description}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {group.items.map((credential) => (
                  <CredentialRow key={credential.id} credential={credential} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
