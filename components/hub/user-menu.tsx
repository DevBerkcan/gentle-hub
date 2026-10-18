"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { displayNameFromEmail } from "@/lib/allowlist";
import type { VaultController } from "@/lib/use-vault";
import { IconLock } from "@/components/ui/icons";

export function UserMenu({ email, vault }: { email: string; vault: VaultController }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const name = displayNameFromEmail(email);

  useEffect(() => {
    if (!open) return;
    function handlePointer(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  async function signOut() {
    vault.lock();
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  const itemClass =
    "focus-ring flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-fg hover:bg-surface-muted";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Konto von ${name}`}
        className="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-accent-2/20 text-[13px] font-semibold text-accent-2-fg ring-1 ring-inset ring-accent-2/30"
      >
        {name.slice(0, 2).toUpperCase()}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-40 w-64 rounded-card border border-line bg-surface p-1.5 shadow-popover animate-[fade-in_120ms_ease-out]"
        >
          <div className="px-2.5 py-2">
            <p className="text-sm font-medium text-fg">{name}</p>
            <p className="truncate text-xs text-fg-subtle">{email}</p>
          </div>
          <div className="my-1 border-t border-line" />
          {vault.status === "unlocked" && (
            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => {
                vault.lock();
                setOpen(false);
              }}
            >
              <IconLock className="h-3.5 w-3.5" /> Tresor sperren
            </button>
          )}
          <button type="button" role="menuitem" className={itemClass} onClick={signOut}>
            Abmelden
          </button>
        </div>
      )}
    </div>
  );
}
