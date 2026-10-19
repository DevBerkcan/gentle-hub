"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import type { User } from "@/lib/types";
import { initials } from "@/lib/format";
import {
  IconChevronDown,
  IconLogout,
  IconSettings,
  IconShield,
} from "@/components/ui/icons";

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
          "flex h-10 items-center gap-2.5 rounded-[12px] border border-line bg-white px-2 pr-2.5 text-left shadow-[0_1px_2px_rgb(11_16_42/0.03)] transition hover:border-line-strong hover:bg-surface-2",
          open && "border-line-strong bg-surface-2",
        )}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-[10px] font-bold text-mint">
          {initials(user.displayName || user.email)}
        </span>
        <span className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="max-w-[9rem] truncate text-[12.5px] font-semibold text-ink">
            {user.displayName}
          </span>
          <span className="max-w-[9rem] truncate text-[10px] text-subtle">{user.email}</span>
        </span>
        <IconChevronDown className={cn("h-3.5 w-3.5 text-subtle transition", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-[16px] border border-line bg-white shadow-float"
        >
          <div className="border-b border-line px-4 py-3.5">
            <p className="truncate text-[13px] font-semibold text-ink">{user.displayName}</p>
            <p className="mt-0.5 truncate text-[11px] text-muted">{user.email}</p>
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-mint-soft px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              <IconShield className="h-3 w-3" />
              Freigegebener Zugang
            </p>
          </div>
          <div className="p-1.5">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-medium text-ink transition hover:bg-surface-2"
            >
              <IconSettings className="h-4 w-4 text-muted" />
              Einstellungen
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-[13px] font-medium text-rose-600 transition hover:bg-rose-50"
              >
                <IconLogout className="h-4 w-4" />
                Abmelden
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
