"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import type { User } from "@/lib/types";
import { initials } from "@/lib/format";
import { IconChevronDown, IconLogout, IconSettings, IconShield } from "@/components/ui/icons";

export function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex h-9 items-center gap-2 rounded-[8px] border border-line bg-white px-1.5 pr-2 text-left transition hover:border-line-strong hover:bg-surface-2",
          open && "border-line-strong bg-surface-2",
        )}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-navy text-[9px] font-bold text-brand">
          {initials(user.displayName || user.email)}
        </span>
        <span className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="max-w-[8.5rem] truncate text-[11.5px] font-semibold text-ink">
            {user.displayName}
          </span>
          <span className="max-w-[8.5rem] truncate text-[9.5px] text-subtle">{user.email}</span>
        </span>
        <IconChevronDown className={cn("h-3 w-3 text-subtle transition", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-60 overflow-hidden rounded-[10px] border border-line bg-white shadow-pop"
        >
          <div className="border-b border-line px-3.5 py-3">
            <p className="truncate text-[12.5px] font-semibold text-ink">{user.displayName}</p>
            <p className="mt-0.5 truncate text-[10.5px] text-muted">{user.email}</p>
            <p className="mt-2 inline-flex items-center gap-1 rounded-[4px] bg-surface-2 px-1.5 py-0.5 text-[9.5px] font-semibold text-muted">
              <IconShield className="h-3 w-3" />
              Freigegebener Zugang
            </p>
          </div>
          <div className="p-1">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-2 rounded-[6px] px-2.5 py-2 text-[12px] font-medium text-ink transition hover:bg-surface-2"
            >
              <IconSettings className="h-3.5 w-3.5 text-muted" />
              Einstellungen
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-left text-[12px] font-medium text-[#b42318] transition hover:bg-[#fef3f2]"
              >
                <IconLogout className="h-3.5 w-3.5" />
                Abmelden
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
