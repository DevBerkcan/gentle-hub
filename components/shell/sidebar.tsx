"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { OverviewCounts } from "@/lib/types";
import { Logo } from "@/components/ui/logo";
import { IconLockCheck, IconX } from "@/components/ui/icons";
import { SidebarNav } from "@/components/shell/sidebar-nav";

type SidebarProps = {
  counts: OverviewCounts;
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ counts, open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-[#040818]/60 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col overflow-hidden bg-navy text-white transition-transform duration-300 ease-[var(--ease)] lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Hauptnavigation"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(24rem_18rem_at_0%_0%,rgb(1_255_169/0.12),transparent_65%),radial-gradient(22rem_18rem_at_100%_100%,rgb(169_122_255/0.16),transparent_65%)]" />
        <div className="grid-pattern pointer-events-none absolute inset-0 opacity-40" />

        <div className="relative flex h-[76px] items-center justify-between px-5">
          <Link href="/" onClick={onClose} className="rounded-lg focus-visible:outline-white">
            <Logo dark />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Navigation schließen"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <IconX className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto px-3 pb-4 no-scrollbar">
          <SidebarNav counts={counts} pathname={pathname} onNavigate={onClose} />
        </div>

        <div className="relative border-t border-white/[0.07] p-3">
          <div className="rounded-[14px] border border-white/[0.08] bg-white/[0.04] p-3.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-white/80">
              <IconLockCheck className="h-3.5 w-3.5 text-mint" />
              Sicher gespeichert
            </div>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-white/40">
              Zugänge und Verbindungsdaten sind mit AES-256-GCM verschlüsselt.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
