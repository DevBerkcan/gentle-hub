"use client";

import type { Ref } from "react";
import { ShortcutHint } from "@/components/ui/kbd";

type ApplicationSearchProps = {
  value: string;
  onChange: (value: string) => void;
  ref?: Ref<HTMLInputElement>;
};

export function ApplicationSearch({ value, onChange, ref }: ApplicationSearchProps) {
  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle"
      >
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
        <path d="M20 20l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) {
            event.preventDefault();
            onChange("");
          }
        }}
        placeholder="Anwendung suchen…"
        aria-label="Anwendungen durchsuchen"
        autoComplete="off"
        spellCheck={false}
        className="focus-ring h-10 w-full rounded-control border border-line bg-surface pl-9 pr-3 text-sm text-fg shadow-card placeholder:text-fg-subtle transition-colors duration-[var(--duration-fast)] hover:border-line-strong sm:pr-24 [&::-webkit-search-cancel-button]:hidden"
      />
      <ShortcutHint className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 sm:flex" />
    </div>
  );
}
