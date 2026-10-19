"use client";

import { Suspense, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import type { OverviewCounts, User } from "@/lib/types";
import { IconMenu } from "@/components/ui/icons";
import { Sidebar } from "@/components/shell/sidebar";
import { SearchBox } from "@/components/shell/search-box";
import { UserMenu } from "@/components/shell/user-menu";

export function AppShell({
  user,
  counts,
  children,
}: {
  user: User;
  counts: OverviewCounts;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-dvh">
      <Sidebar counts={counts} open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-30 border-b border-line/80 bg-canvas/85 backdrop-blur-xl">
          <div className="mx-auto flex h-[72px] w-full max-w-[1280px] items-center gap-3 px-4 sm:px-6 lg:px-10">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Navigation öffnen"
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] border border-line bg-white text-ink shadow-[0_1px_2px_rgb(11_16_42/0.03)] transition hover:bg-surface-2 lg:hidden",
              )}
            >
              <IconMenu className="h-4.5 w-4.5" />
            </button>

            <div className="min-w-0 flex-1 sm:max-w-[440px]">
              <Suspense fallback={<div className="h-10 w-full rounded-[12px] border border-line bg-white/60" />}>
                <TopbarSearch />
              </Suspense>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <UserMenu user={user} />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-7 sm:px-6 sm:pt-9 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function TopbarSearch() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = pathname === "/search" ? (searchParams.get("q") ?? "") : "";

  return <SearchBox key={`${pathname}|${query}`} initialQuery={query} />;
}
