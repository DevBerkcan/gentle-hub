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

      <div className="lg:pl-[258px]">
        <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-[1320px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Navigation öffnen"
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-line bg-white text-ink transition hover:bg-surface-2 lg:hidden",
              )}
            >
              <IconMenu className="h-4 w-4" />
            </button>

            <div className="min-w-0 flex-1 sm:max-w-[420px]">
              <Suspense fallback={<div className="h-10 w-full rounded-[12px] border border-line bg-white/60" />}>
                <TopbarSearch />
              </Suspense>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <UserMenu user={user} />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1320px] px-4 pb-20 pt-6 sm:px-6 sm:pt-8 lg:px-8">
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
