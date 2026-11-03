"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import type { OverviewCounts } from "@/lib/types";
import {
  IconActivity,
  IconApps,
  IconCheck,
  IconFolder,
  IconHome,
  IconKey,
  IconLink,
  IconMail,
  IconSearch,
  IconServer,
  IconSettings,
  IconShield,
  IconSparkles,
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
          label: "Gentle Group",
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
      title: "Eigene Projekte",
      items: [
        {
          href: "/projects",
          label: "Projekte & Spiele",
          icon: IconFolder,
          count: counts.projects,
          active: (path) => path.startsWith("/projects"),
        },
      ],
    },
    {
      title: "Zugänge",
      items: [
        {
          href: "/passwords",
          label: "Passwörter",
          icon: IconKey,
          count: counts.credentials,
          active: (path) => path.startsWith("/passwords"),
        },
      ],
    },
    {
      title: "AI Operations",
      items: [
        {
          href: "/ai",
          label: "Dashboard",
          icon: IconSparkles,
          active: (path) => path === "/ai",
        },
        {
          href: "/ai/approvals",
          label: "Freigaben",
          icon: IconCheck,
          active: (path) => path.startsWith("/ai/approvals"),
        },
        {
          href: "/ai/agents",
          label: "Agenten",
          icon: IconServer,
          active: (path) => path.startsWith("/ai/agents"),
        },
        {
          href: "/ai/emails",
          label: "E-Mail Intelligence",
          icon: IconMail,
          active: (path) => path.startsWith("/ai/emails"),
        },
        {
          href: "/ai/connections",
          label: "Verbindungen",
          icon: IconLink,
          active: (path) => path.startsWith("/ai/connections"),
        },
        {
          href: "/ai/history",
          label: "Workflow-Historie",
          icon: IconActivity,
          active: (path) => path.startsWith("/ai/history"),
        },
        {
          href: "/ai/costs",
          label: "KI-Kosten",
          icon: IconShield,
          active: (path) => path.startsWith("/ai/costs"),
        },
        {
          href: "/ai/settings",
          label: "AI-Einstellungen",
          icon: IconSettings,
          active: (path) => path.startsWith("/ai/settings"),
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
    <nav className="flex flex-col gap-5 pt-1">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="px-3 pb-1.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-white/30">
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
                      "group relative flex h-9 items-center gap-2.5 rounded-[7px] px-3 text-[12.5px] font-medium transition-colors",
                      isActive
                        ? "bg-white/[0.08] text-white"
                        : "text-white/55 hover:bg-white/[0.04] hover:text-white",
                    )}
                  >
                    {isActive && (
                      <span className="absolute -left-3 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r bg-brand" />
                    )}
                    <Icon className={cn("h-[15px] w-[15px] shrink-0", isActive ? "text-brand" : "text-white/40")} />
                    <span className="truncate">{item.label}</span>
                    {typeof item.count === "number" && (
                      <span
                        className={cn(
                          "ml-auto rounded-[4px] px-1.5 py-0.5 text-[9.5px] font-semibold tabular-nums",
                          isActive ? "bg-white/10 text-white/70" : "bg-white/[0.05] text-white/35",
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
