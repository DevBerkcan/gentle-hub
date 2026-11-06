"use client";

import { useState } from "react";
import Link from "next/link";
import { IconX } from "@/components/ui/icons";

const MAX_TAGS = 20;
const MAX_LENGTH = 40;

function clean(value: string) {
  return value.replace(/\|/g, " ").trim().replace(/^#+/, "").replace(/\s+/g, " ").slice(0, MAX_LENGTH);
}

/** Chip input: Enter, comma or Tab adds a tag, Backspace on an empty field removes the last one. */
export function TagInput({
  id,
  value,
  onChange,
  suggestions = [],
}: {
  id: string;
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const tags = raw.split(",").map(clean).filter(Boolean);
    if (tags.length === 0) return;
    const next = [...value];
    for (const tag of tags) {
      if (next.length >= MAX_TAGS) break;
      if (!next.some((existing) => existing.toLowerCase() === tag.toLowerCase())) next.push(tag);
    }
    onChange(next);
    setDraft("");
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if ((event.key === "Enter" || event.key === "," || (event.key === "Tab" && draft.trim())) && draft.trim()) {
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  const open = suggestions.filter((tag) => !value.some((existing) => existing.toLowerCase() === tag.toLowerCase()));

  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-[10px] border border-line bg-surface px-2 py-1.5 focus-within:border-[#8fe6c3] focus-within:ring-4 focus-within:ring-[#d9fff0]">
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-surface-2 py-0.5 pl-2.5 pr-1 text-[11.5px] font-medium text-ink">
          #{tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((existing) => existing !== tag))}
            aria-label={`Tag ${tag} entfernen`}
            className="flex h-4 w-4 items-center justify-center rounded-full text-subtle transition hover:bg-line hover:text-ink"
          >
            <IconX className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(event) => {
          const next = event.target.value;
          if (next.includes(",")) add(next);
          else setDraft(next);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => draft.trim() && add(draft)}
        list={`${id}-suggestions`}
        placeholder={value.length === 0 ? "z. B. kunde-muster, 2fa, buchhaltung" : ""}
        className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-[12.5px] text-ink outline-none placeholder:text-subtle/80"
        disabled={value.length >= MAX_TAGS}
        maxLength={MAX_LENGTH}
      />
      <datalist id={`${id}-suggestions`}>
        {open.slice(0, 50).map((tag) => (
          <option key={tag} value={tag} />
        ))}
      </datalist>
    </div>
  );
}

/** Small clickable tag chips that filter the vault. */
export function TagChips({ tags, className }: { tags?: string[]; className?: string }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className={className ?? "mt-2 flex flex-wrap gap-1"}>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/passwords?tag=${encodeURIComponent(tag)}`}
          className="inline-flex items-center rounded-full bg-[#e9fbf3] px-2 py-0.5 text-[10.5px] font-semibold text-[#0b6b49] transition hover:bg-[#d4f6e6] dark:bg-emerald-500/10 dark:text-emerald-300"
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
}
