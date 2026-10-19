"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import type { OverviewCounts } from "@/lib/types";
import {
  IconApps,
  IconHome,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@/components/ui/icons";

type SidebarNavProps = {
  counts: OverviewCounts;
  pathname: string;
  onNavigate: () => void;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  active: (pathname: string) => boolean;
};

export function SidebarNav({ counts, pathname, onNavigate }: SidebarNavProps) {
  const sections: { title: string; items: NavItem[] }[] = [
    {
      title: "Übersicht",
      items: [
        {
          href: "/",
          label: "Dashboard",
          icon: IconHome,
          active: (path) => path === "/",
        },
      ],
    },
    {
      title: "Gentle Group",
      items: [
        {
          href: "/apps",
          label: "Alle Apps",
          icon: IconApps,
          count: counts.internal,
          active: (path) => path.startsWith("/apps"),
        },
      ],
    },
    {
      title: "Kunden",
      items: [
        {
          href: "/customers",
          label: "Kundenprojekte",
          icon: IconUsers,
          count: counts.customers,
          active: (path) => path.startsWith("/customers"),
        },
      ],
    },
    {
      title: "Werkzeuge",
      items: [
        {
          href: "/search",
          label: "Suche",
          icon: IconSearch,
          active: (path) => path.startsWith("/search"),
        },
        {
          href: "/settings",
          label: "Einstellungen",
          icon: IconSettings,
          active: (path) => path.startsWith("/settings"),
        },
      ],
    },
  ];

  return (
    <nav className="flex flex-col gap-6 pt-2">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
            {section.title}
          </p>
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const isActive = item.active(pathname);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group relative flex h-10 items-center gap-3 rounded-[10px] px-3 text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-white/[0.09] text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07)]"
                        : "text-white/55 hover:bg-white/[0.05] hover:text-white",
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-mint" />
                    )}
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-mint" : "text-white/45")} />
                    <span className="truncate">{item.label}</span>
                    {typeof item.count === "number" && (
                      <span
                        className={cn(
                          "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums",
                          isActive ? "bg-mint/15 text-mint" : "bg-white/[0.06] text-white/40",
                        )}
                      >
                        {item.count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
