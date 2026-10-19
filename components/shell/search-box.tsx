"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconSearch, IconX } from "@/components/ui/icons";

export function SearchBox({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }

      if (event.key === "/" && !typing) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();
    if (!query) {
      router.push("/search");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={submit} role="search" className="relative w-full">
      <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-subtle" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Apps, Kunden, Zugänge durchsuchen …"
        aria-label="GentleHub durchsuchen"
        className="h-10 w-full rounded-[12px] border border-line bg-white/80 pl-10 pr-20 text-[13px] text-ink shadow-[0_1px_2px_rgb(11_16_42/0.03)] outline-none transition placeholder:text-subtle/80 focus:border-[#8fe6c3] focus:bg-white focus:ring-4 focus:ring-[#d9fff0]"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            inputRef.current?.focus();
          }}
          aria-label="Suche leeren"
          className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-subtle transition hover:bg-[#f0edf6] hover:text-ink"
        >
          <IconX className="h-3.5 w-3.5" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-subtle sm:inline-flex">
          Strg K
        </kbd>
      )}
      <Link href="/search" className="sr-only">
        Zur Suche
      </Link>
    </form>
  );
}
