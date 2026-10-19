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
          "fixed inset-0 z-40 bg-[#0f172a]/55 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[258px] flex-col overflow-hidden bg-navy text-white transition-transform duration-200 ease-[var(--ease)] lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Hauptnavigation"
      >
        <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-white/[0.06] px-5">
          <Link href="/" onClick={onClose} className="rounded-md focus-visible:outline-white">
            <Logo dark />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Navigation schlieÃŸen"
            className="flex h-8 w-8 items-center justify-center rounded-[6px] text-white/50 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-3 pb-4 pt-4">
          <SidebarNav counts={counts} pathname={pathname} onNavigate={onClose} />
        </div>

        <div className="border-t border-white/[0.06] px-4 py-4">
          <div className="flex items-start gap-2.5">
            <IconLockCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand/80" />
            <div>
              <p className="text-[10.5px] font-semibold text-white/70">VerschlÃ¼sselte ZugÃ¤nge</p>
              <p className="mt-1 text-[10px] leading-relaxed text-white/35">
                AES-256-GCM. Anzeigen werden protokolliert.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
