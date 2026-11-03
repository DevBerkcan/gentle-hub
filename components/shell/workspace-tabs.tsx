"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { WORKSPACES, type WorkspaceKey } from "@/components/shell/workspaces";

export function WorkspaceTabs({ active, className }: { active: WorkspaceKey; className?: string }) {
  return (
    <nav aria-label="Bereiche" className={cn("flex items-center gap-1 rounded-[10px] border border-line bg-surface-2/70 p-1", className)}>
      {WORKSPACES.map((workspace) => {
        const isActive = workspace.key === active;
        const Icon = workspace.icon;
        return (
          <Link
            key={workspace.key}
            href={workspace.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-8 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[7px] px-3 text-[12.5px] font-semibold transition sm:flex-none",
              isActive
                ? "bg-surface text-ink shadow-[0_1px_2px_rgba(15,23,42,0.08)] ring-1 ring-line"
                : "text-muted hover:text-ink",
            )}
          >
            <Icon className={cn("h-[14px] w-[14px] shrink-0", isActive ? "text-brand" : "text-subtle")} />
            {workspace.label}
          </Link>
        );
      })}
    </nav>
  );
}
