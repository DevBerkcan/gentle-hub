import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Application } from "@/types";
import { ApplicationCard } from "@/components/hub/application-card";

const baseApp: Application = {
  id: "gentletrack",
  name: "GentleTrack",
  description: "Projektfortschritt und Meilensteine.",
  url: "https://gentletrack.gentlegroup.studio",
  category: "saas",
};

function renderCard(
  overrides: Partial<Application> = {},
  props: Partial<React.ComponentProps<typeof ApplicationCard>> = {}
) {
  const onToggleFavorite = vi.fn();
  const onOpen = vi.fn();
  const utils = render(
    <ApplicationCard
      application={{ ...baseApp, ...overrides }}
      isFavorite={false}
      onToggleFavorite={onToggleFavorite}
      onOpen={onOpen}
      {...props}
    />
  );
  return { ...utils, onToggleFavorite, onOpen };
}

describe("ApplicationCard", () => {
  it("renders a link that opens safely in a new tab", () => {
    renderCard();
    const link = screen.getByRole("link", { name: /GentleTrack öffnen/i });
    expect(link).toHaveAttribute("href", baseApp.url);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(link).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
  });

  it("calls onOpen with the application id when clicked", async () => {
    const user = userEvent.setup();
    const { onOpen } = renderCard();
    await user.click(screen.getByRole("link", { name: /GentleTrack öffnen/i }));
    expect(onOpen).toHaveBeenCalledWith("gentletrack");
  });

  it("shows name, description and category label", () => {
    renderCard();
    expect(screen.getByRole("heading", { name: /GentleTrack/ })).toBeInTheDocument();
    expect(screen.getByText(baseApp.description)).toBeInTheDocument();
    expect(screen.getByText("SaaS")).toBeInTheDocument();
  });

  it("renders disabled applications as non-interactive, without a link", () => {
    renderCard({ disabled: true });
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Nicht verfügbar")).toBeInTheDocument();
  });

  it("treats an unsafe URL as non-interactive", () => {
    renderCard({ url: "javascript:alert(1)" });
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("keeps the favorite button outside the link (no nested interactive content)", () => {
    renderCard();
    const button = screen.getByRole("button", { name: /zu Favoriten hinzufügen/i });
    expect(button.closest("a")).toBeNull();
  });

  it("toggles favorite state without triggering navigation", async () => {
    const user = userEvent.setup();
    const { onToggleFavorite, onOpen } = renderCard();
    await user.click(screen.getByRole("button", { name: /zu Favoriten hinzufügen/i }));
    expect(onToggleFavorite).toHaveBeenCalledWith("gentletrack");
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("reflects the favorite state via aria-pressed", () => {
    renderCard({}, { isFavorite: true });
    expect(screen.getByRole("button", { name: /aus Favoriten entfernen/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("labels only non-production environments", () => {
    const { rerender } = renderCard({ environment: "staging" });
    expect(screen.getByText("Staging")).toBeInTheDocument();

    rerender(
      <ApplicationCard
        application={{ ...baseApp, environment: "production" }}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onOpen={vi.fn()}
      />
    );
    expect(screen.queryByText(/production/i)).not.toBeInTheDocument();
  });

  it("shows a monogram when no icon is set, and the icon otherwise", () => {
    const { container, rerender } = renderCard();
    expect(screen.getByTestId("app-monogram")).toHaveTextContent("GT");

    rerender(
      <ApplicationCard
        application={{ ...baseApp, icon: "/apps/gentletrack.svg" }}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onOpen={vi.fn()}
      />
    );
    expect(screen.queryByTestId("app-monogram")).not.toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute("src", "/apps/gentletrack.svg");
  });

  it("ignores icons with unsafe URL schemes", () => {
    const { container } = renderCard({ icon: "javascript:alert(1)" });
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByTestId("app-monogram")).toBeInTheDocument();
  });
});
