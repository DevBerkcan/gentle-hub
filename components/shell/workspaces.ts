import type { OverviewCounts } from "@/lib/types";
import { CREDENTIAL_CATEGORIES } from "@/lib/constants";
import {
  IconActivity,
  IconApps,
  IconCheck,
  IconFolder,
  IconGlobe,
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

type Icon = React.ComponentType<{ className?: string }>;

export type NavLocation = { pathname: string; category: string };

export type NavItem = {
  href: string;
  label: string;
  icon: Icon;
  count?: number;
  active: (location: NavLocation) => boolean;
};

export type NavSection = { title: string; items: NavItem[] };

export type WorkspaceKey = "projects" | "passwords" | "agents";

export type Workspace = {
  key: WorkspaceKey;
  label: string;
  href: string;
  icon: Icon;
  sections: (counts: OverviewCounts) => NavSection[];
};

const CATEGORY_ICONS: Record<string, Icon> = {
  mail: IconMail,
  server: IconServer,
  globe: IconGlobe,
  link: IconLink,
  apps: IconApps,
  key: IconKey,
};

export const WORKSPACES: Workspace[] = [
  {
    key: "projects",
    label: "Projekte",
    href: "/",
    icon: IconFolder,
    sections: (counts) => [
      {
        title: "Übersicht",
        items: [{ href: "/", label: "Dashboard", icon: IconHome, active: ({ pathname }) => pathname === "/" }],
      },
      {
        title: "Gentle Group",
        items: [
          {
            href: "/apps",
            label: "Gentle Group",
            icon: IconApps,
            count: counts.internal,
            active: ({ pathname }) => pathname.startsWith("/apps"),
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
            active: ({ pathname }) => pathname.startsWith("/customers"),
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
            active: ({ pathname }) => pathname.startsWith("/projects"),
          },
        ],
      },
    ],
  },
  {
    key: "passwords",
    label: "Passwörter",
    href: "/passwords",
    icon: IconKey,
    sections: (counts) => [
      {
        title: "Zugänge",
        items: [
          {
            href: "/passwords",
            label: "Alle Zugänge",
            icon: IconKey,
            count: counts.credentials,
            active: ({ pathname, category }) => pathname.startsWith("/passwords") && !category,
          },
        ],
      },
      {
        title: "Kategorien",
        items: CREDENTIAL_CATEGORIES.map((category) => ({
          href: `/passwords?category=${category.key}`,
          label: category.label,
          icon: CATEGORY_ICONS[category.icon] ?? IconKey,
          active: (location: NavLocation) =>
            location.pathname.startsWith("/passwords") && location.category === category.key,
        })),
      },
    ],
  },
  {
    key: "agents",
    label: "Agenten",
    href: "/ai",
    icon: IconSparkles,
    sections: () => [
      {
        title: "AI Operations",
        items: [
          { href: "/ai", label: "Dashboard", icon: IconSparkles, active: ({ pathname }) => pathname === "/ai" },
          {
            href: "/ai/approvals",
            label: "Freigaben",
            icon: IconCheck,
            active: ({ pathname }) => pathname.startsWith("/ai/approvals"),
          },
          {
            href: "/ai/agents",
            label: "Agenten",
            icon: IconServer,
            active: ({ pathname }) => pathname.startsWith("/ai/agents"),
          },
          {
            href: "/ai/emails",
            label: "E-Mail Intelligence",
            icon: IconMail,
            active: ({ pathname }) => pathname.startsWith("/ai/emails"),
          },
        ],
      },
      {
        title: "Betrieb",
        items: [
          {
            href: "/ai/connections",
            label: "Verbindungen",
            icon: IconLink,
            active: ({ pathname }) => pathname.startsWith("/ai/connections"),
          },
          {
            href: "/ai/history",
            label: "Workflow-Historie",
            icon: IconActivity,
            active: ({ pathname }) => pathname.startsWith("/ai/history"),
          },
          {
            href: "/ai/costs",
            label: "KI-Kosten",
            icon: IconShield,
            active: ({ pathname }) => pathname.startsWith("/ai/costs"),
          },
          {
            href: "/ai/settings",
            label: "AI-Einstellungen",
            icon: IconSettings,
            active: ({ pathname }) => pathname.startsWith("/ai/settings"),
          },
        ],
      },
    ],
  },
];

export const TOOL_SECTION: NavSection = {
  title: "Werkzeuge",
  items: [
    { href: "/search", label: "Suche", icon: IconSearch, active: ({ pathname }) => pathname.startsWith("/search") },
    {
      href: "/settings",
      label: "Einstellungen",
      icon: IconSettings,
      active: ({ pathname }) => pathname.startsWith("/settings"),
    },
  ],
};

/** Workspace a route belongs to, or null for shared pages like search and settings. */
export function workspaceForPath(pathname: string): WorkspaceKey | null {
  if (pathname === "/ai" || pathname.startsWith("/ai/")) return "agents";
  if (pathname.startsWith("/passwords")) return "passwords";
  if (pathname.startsWith("/search") || pathname.startsWith("/settings")) return null;
  return "projects";
}
