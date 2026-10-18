import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Application } from "@/types";

const actions = vi.hoisted(() => ({
  setFavoriteAction: vi.fn().mockResolvedValue({ ok: true }),
  createApplicationAction: vi.fn().mockResolvedValue({ ok: true, id: "new-app" }),
  updateApplicationAction: vi.fn().mockResolvedValue({ ok: true }),
  updateNotesAction: vi.fn().mockResolvedValue({ ok: true }),
  deleteApplicationAction: vi.fn().mockResolvedValue({ ok: true }),
  saveVaultAction: vi.fn(),
}));

vi.mock("@/app/actions", () => actions);
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn(), replace: vi.fn() }) }));
vi.mock("@/lib/auth-client", () => ({ authClient: { signOut: vi.fn() } }));
vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
}));

const { HubShell } = await import("@/components/hub/hub-shell");

const apps: Application[] = [
  {
    id: "gentlebook",
    name: "GentleBook",
    description: "Online-Terminbuchung.",
    url: "https://www.gentlebook.de/superadmin/login",
    category: "saas",
  },
  {
    id: "crm",
    name: "Gentle CRM",
    description: "Kunden, Angebote und Projekte.",
    url: "https://crm.example.com",
    category: "crm",
    notes: "Rabattcode für Partner im März",
  },
  {
    id: "people",
    name: "People Ops",
    description: "Urlaub und Zeiterfassung.",
    url: "https://people.example.com",
    category: "internal",
  },
];

function renderShell(props: Partial<React.ComponentProps<typeof HubShell>> = {}) {
  return render(
    <HubShell applications={apps} favorites={["gentlebook"]} vault={null} user={{ email: "berkcan@gentlegroup.de" }} {...props} />
  );
}

function allApplicationsSection() {
  return screen.getByRole("region", { name: /Alle Anwendungen|Ergebnisse/ });
}

function openLinkNames(container: HTMLElement) {
  return within(container)
    .queryAllByRole("link", { name: /öffnen/ })
    .map((link) => link.getAttribute("aria-label")?.replace(" öffnen (neuer Tab)", ""));
}

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe("HubShell", () => {
  it("greets the user and shows all applications plus their favorites", () => {
    renderShell();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Berkcan");
    expect(openLinkNames(allApplicationsSection())).toEqual(["GentleBook", "Gentle CRM", "People Ops"]);
    expect(openLinkNames(screen.getByRole("region", { name: "Favoriten" }))).toEqual(["GentleBook"]);
  });

  it("searches names, descriptions and notes", async () => {
    const user = userEvent.setup();
    renderShell();
    await user.type(screen.getByRole("searchbox", { name: /durchsuchen/i }), "rabattcode");
    expect(openLinkNames(allApplicationsSection())).toEqual(["Gentle CRM"]);
  });

  it("filters by category and resets via the empty state", async () => {
    const user = userEvent.setup();
    renderShell();
    await user.click(screen.getByRole("button", { name: /Interne Tools/ }));
    expect(openLinkNames(allApplicationsSection())).toEqual(["People Ops"]);

    await user.type(screen.getByRole("searchbox"), "termin");
    expect(screen.getByText("Keine Anwendung gefunden")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Filter zurücksetzen" }));
    expect(openLinkNames(allApplicationsSection())).toHaveLength(3);
  });

  it("toggles favorites optimistically and persists via the server action", async () => {
    const user = userEvent.setup();
    renderShell();
    await user.click(screen.getByRole("button", { name: "People Ops zu Favoriten hinzufügen" }));
    expect(actions.setFavoriteAction).toHaveBeenCalledWith("people", true);
  });

  it("opens the info sheet for a tile", async () => {
    const user = userEvent.setup();
    renderShell();
    await user.click(within(allApplicationsSection()).getByRole("button", { name: "Infos zu Gentle CRM" }));
    const dialog = screen.getByRole("dialog", { name: "Gentle CRM" });
    expect(within(dialog).getByRole("textbox", { name: "Notizen zu Gentle CRM" })).toHaveValue(
      "Rabattcode für Partner im März"
    );
  });

  it("creates a new application from the header", async () => {
    const user = userEvent.setup();
    renderShell();
    await user.click(screen.getByRole("button", { name: "Anwendung hinzufügen" }));
    const dialog = screen.getByRole("dialog", { name: "Neue Anwendung" });
    await user.type(within(dialog).getByLabelText(/^Link/), "https://tool.example.com");
    await user.type(within(dialog).getByLabelText("Name"), "Neues Tool");
    await user.click(within(dialog).getByRole("button", { name: "Anwendung anlegen" }));
    expect(actions.createApplicationAction).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Neues Tool", url: "https://tool.example.com", category: "saas" })
    );
  });

  it("shows an onboarding state when there are no applications", () => {
    renderShell({ applications: [], favorites: [] });
    expect(screen.getByText("Noch keine Anwendungen")).toBeInTheDocument();
  });

  it("opens the command palette with Ctrl+K and opens an app with Enter", async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    renderShell();
    await user.keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("dialog", { name: "Schnellsuche" })).toBeInTheDocument();
    await user.keyboard("crm{Enter}");
    expect(open).toHaveBeenCalledWith("https://crm.example.com", "_blank", "noopener,noreferrer");
    open.mockRestore();
  });
});
