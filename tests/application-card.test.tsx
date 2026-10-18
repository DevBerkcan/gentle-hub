import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Application } from "@/types";
import { ApplicationCard } from "@/components/hub/application-card";

const baseApp: Application = {
  id: "gentlebook",
  name: "GentleBook",
  description: "SaaS für Online-Terminbuchungen.",
  url: "https://app.example.com/admin/login",
  category: "saas",
};

function renderCard(
  overrides: Partial<Application> = {},
  props: Partial<React.ComponentProps<typeof ApplicationCard>> = {}
) {
  const handlers = { onToggleFavorite: vi.fn(), onOpen: vi.fn(), onInfo: vi.fn() };
  const utils = render(
    <ApplicationCard application={{ ...baseApp, ...overrides }} isFavorite={false} {...handlers} {...props} />
  );
  return { ...utils, ...handlers };
}

describe("ApplicationCard", () => {
  it("has an 'Öffnen' link to the configured URL that opens safely in a new tab", () => {
    renderCard();
    const link = screen.getByRole("link", { name: /GentleBook öffnen/i });
    expect(link).toHaveAttribute("href", baseApp.url);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(link).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
    expect(link).toHaveTextContent("Öffnen");
  });

  it("calls onOpen when the link is used", async () => {
    const user = userEvent.setup();
    const { onOpen } = renderCard();
    await user.click(screen.getByRole("link", { name: /GentleBook öffnen/i }));
    expect(onOpen).toHaveBeenCalledWith("gentlebook");
  });

  it("opens the info area without navigating", async () => {
    const user = userEvent.setup();
    const { onInfo, onOpen } = renderCard();
    const info = screen.getByRole("button", { name: "Infos zu GentleBook" });
    expect(info.closest("a")).toBeNull();
    await user.click(info);
    expect(onInfo).toHaveBeenCalledWith("gentlebook");
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("keeps info usable when the link is invalid, so it can be fixed", async () => {
    const user = userEvent.setup();
    const { onInfo } = renderCard({ url: "javascript:alert(1)" });
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Link fehlt")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Infos zu GentleBook" }));
    expect(onInfo).toHaveBeenCalled();
  });

  it("toggles favorites without navigating; the star is outside the link", async () => {
    const user = userEvent.setup();
    const { onToggleFavorite, onOpen } = renderCard();
    const star = screen.getByRole("button", { name: /zu Favoriten hinzufügen/i });
    expect(star.closest("a")).toBeNull();
    await user.click(star);
    expect(onToggleFavorite).toHaveBeenCalledWith("gentlebook");
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("shows category, non-production environment and a notes indicator", () => {
    renderCard({ environment: "staging", notes: "Idee" });
    expect(screen.getByText("SaaS")).toBeInTheDocument();
    expect(screen.getByText("Staging")).toBeInTheDocument();
    expect(screen.getByText("Hat Notizen")).toBeInTheDocument();
  });

  it("never renders notes content on the card", () => {
    renderCard({ notes: "Geheime Idee" });
    expect(screen.queryByText("Geheime Idee")).not.toBeInTheDocument();
  });

  it("compact variant links the name and still offers info", () => {
    renderCard({}, { variant: "compact" });
    expect(screen.getByRole("link", { name: /GentleBook öffnen/i })).toHaveAttribute("href", baseApp.url);
    expect(screen.getByRole("button", { name: "Infos zu GentleBook" })).toBeInTheDocument();
  });
});
