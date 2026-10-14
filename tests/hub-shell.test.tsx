import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Application } from "@/types";
import { HubShell } from "@/components/hub/hub-shell";

vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
}));

const apps: Application[] = [
  {
    id: "gentlebook",
    name: "GentleBook",
    description: "Online-Terminbuchung.",
    url: "https://book.example.com",
    category: "saas",
    isFavorite: true,
  },
  {
    id: "crm",
    name: "Gentle CRM",
    description: "Kunden, Angebote und Projekte.",
    url: "https://crm.example.com",
    category: "crm",
  },
  {
    id: "people",
    name: "People Ops",
    description: "Urlaub und Zeiterfassung.",
    url: "https://people.example.com",
    category: "internal",
  },
];

function allApplicationsSection() {
  return screen.getByRole("region", { name: /Alle Anwendungen|Ergebnisse/ });
}

function linkNames(container: HTMLElement) {
  return within(container)
    .queryAllByRole("link")
    .map((link) => link.textContent?.replace(" öffnen (neuer Tab)", ""));
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("HubShell", () => {
  it("shows all applications and config default favorites", () => {
    render(<HubShell applications={apps} />);
    expect(linkNames(allApplicationsSection())).toEqual(["GentleBook", "Gentle CRM", "People Ops"]);
    expect(linkNames(screen.getByRole("region", { name: "Favoriten" }))).toEqual(["GentleBook"]);
  });

  it("filters by search query (name and description)", async () => {
    const user = userEvent.setup();
    render(<HubShell applications={apps} />);
    await user.type(screen.getByRole("searchbox", { name: /durchsuchen/i }), "angebote");
    expect(linkNames(allApplicationsSection())).toEqual(["Gentle CRM"]);
    // Favorites are hidden while searching to keep results focused.
    expect(screen.queryByRole("region", { name: "Favoriten" })).not.toBeInTheDocument();
  });

  it("filters by category and resets via the empty state", async () => {
    const user = userEvent.setup();
    render(<HubShell applications={apps} />);
    await user.click(screen.getByRole("button", { name: /Interne Tools/ }));
    expect(linkNames(allApplicationsSection())).toEqual(["People Ops"]);

    await user.type(screen.getByRole("searchbox"), "termin");
    expect(screen.getByText("Keine Anwendung gefunden")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Filter zurücksetzen" }));
    expect(linkNames(allApplicationsSection())).toHaveLength(3);
  });

  it("adds a favorite immediately and persists it", async () => {
    const user = userEvent.setup();
    render(<HubShell applications={apps} />);
    await user.click(screen.getByRole("button", { name: "People Ops zu Favoriten hinzufügen" }));

    expect(linkNames(screen.getByRole("region", { name: "Favoriten" }))).toEqual(["GentleBook", "People Ops"]);
    expect(JSON.parse(window.localStorage.getItem("gentle-hub:favorites") ?? "[]")).toEqual([
      "gentlebook",
      "people",
    ]);
  });

  it("hides the favorites section once all favorites are removed", async () => {
    const user = userEvent.setup();
    render(<HubShell applications={apps} />);
    const favorites = screen.getByRole("region", { name: "Favoriten" });
    await user.click(within(favorites).getByRole("button", { name: /aus Favoriten entfernen/ }));
    expect(screen.queryByRole("region", { name: "Favoriten" })).not.toBeInTheDocument();
  });

  it("opens the command palette with Ctrl+K and closes it with Escape", async () => {
    const user = userEvent.setup();
    render(<HubShell applications={apps} />);
    await user.keyboard("{Control>}k{/Control}");
    const dialog = screen.getByRole("dialog", { name: "Schnellsuche" });
    expect(within(dialog).getByRole("combobox")).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the selected application safely from the palette with Enter", async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    render(<HubShell applications={apps} />);

    await user.keyboard("{Control>}k{/Control}");
    await user.keyboard("crm");
    await user.keyboard("{Enter}");

    expect(open).toHaveBeenCalledWith("https://crm.example.com", "_blank", "noopener,noreferrer");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    open.mockRestore();
  });

  it("focuses the search with the / key", async () => {
    const user = userEvent.setup();
    render(<HubShell applications={apps} />);
    await user.keyboard("/");
    expect(screen.getByRole("searchbox")).toHaveFocus();
  });
});
