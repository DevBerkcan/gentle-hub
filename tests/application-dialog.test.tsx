import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Application } from "@/types";
import type { VaultBlob } from "@/lib/vault";

const actions = vi.hoisted(() => ({
  createApplicationAction: vi.fn(),
  updateApplicationAction: vi.fn().mockResolvedValue({ ok: true }),
  updateNotesAction: vi.fn().mockResolvedValue({ ok: true }),
  deleteApplicationAction: vi.fn().mockResolvedValue({ ok: true }),
  saveVaultAction: vi.fn(),
}));

vi.mock("@/app/actions", () => actions);
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
// Keep PBKDF2 fast in tests.
vi.mock("@/lib/vault", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/vault")>();
  return { ...original, createVault: (password: string) => original.createVault(password, 100_000) };
});

const { ApplicationDialog } = await import("@/components/hub/application-dialog");
const { useVault } = await import("@/lib/use-vault");
type Snapshot = import("@/lib/use-vault").StoredVaultSnapshot;

const app: Application = {
  id: "gentlebook",
  name: "GentleBook",
  description: "SaaS für Online-Terminbuchungen.",
  url: "https://www.gentlebook.de/superadmin/login",
  category: "saas",
  notes: "",
};

function Harness({ stored, onClose = () => {} }: { stored: Snapshot; onClose?: () => void }) {
  const vault = useVault(stored);
  return (
    <ApplicationDialog
      state={{ mode: "view", id: app.id }}
      application={app}
      vault={vault}
      onClose={onClose}
      onCreated={() => {}}
      onOpen={() => {}}
    />
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ApplicationDialog", () => {
  it("shows the link with an open button", () => {
    render(<Harness stored={null} />);
    const dialog = screen.getByRole("dialog", { name: "GentleBook" });
    expect(within(dialog).getByRole("link", { name: /Öffnen/ })).toHaveAttribute("href", app.url);
  });

  it("changes the link via the form", async () => {
    const user = userEvent.setup();
    render(<Harness stored={null} />);
    const field = screen.getByLabelText(/^Link/);
    await user.clear(field);
    await user.type(field, "https://www.gentlebook.de/admin");
    await user.click(screen.getByRole("button", { name: "Änderungen speichern" }));
    expect(actions.updateApplicationAction).toHaveBeenCalledWith(
      "gentlebook",
      expect.objectContaining({ url: "https://www.gentlebook.de/admin" })
    );
  });

  it("blocks unsafe links in the form", async () => {
    const user = userEvent.setup();
    render(<Harness stored={null} />);
    const field = screen.getByLabelText(/^Link/);
    await user.clear(field);
    await user.type(field, "javascript:alert(1)");
    await user.click(screen.getByRole("button", { name: "Änderungen speichern" }));
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(actions.updateApplicationAction).not.toHaveBeenCalled();
  });

  it("auto-saves notes", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Harness stored={null} />);
    await user.type(screen.getByRole("textbox", { name: "Notizen zu GentleBook" }), "Idee: Erinnerungen per SMS");
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(actions.updateNotesAction).toHaveBeenLastCalledWith("gentlebook", "Idee: Erinnerungen per SMS");
    vi.useRealTimers();
  });

  it("deletes only after confirmation", async () => {
    const user = userEvent.setup();
    render(<Harness stored={null} />);
    await user.click(screen.getByRole("button", { name: "Anwendung löschen" }));
    expect(actions.deleteApplicationAction).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Endgültig löschen" }));
    expect(actions.deleteApplicationAction).toHaveBeenCalledWith("gentlebook");
  });

  it("sets up the vault, stores credentials encrypted, and unlocks with the right password only", async () => {
    const user = userEvent.setup();
    let savedBlob: VaultBlob | null = null;
    actions.saveVaultAction.mockImplementation(async (blob: VaultBlob) => {
      savedBlob = blob;
      return { ok: true, updatedAt: new Date().toISOString() };
    });

    const { unmount } = render(<Harness stored={null} />);
    const [first, second] = screen.getAllByLabelText(/Master-Passwort/);
    await user.type(first, "unser-gemeinsames-passwort");
    await user.type(second, "unser-gemeinsames-passwort");
    await user.click(screen.getByRole("button", { name: /Tresor einrichten/ }));

    await user.type(await screen.findByLabelText("Benutzer / E-Mail"), "superadmin");
    await user.type(screen.getByLabelText("Passwort"), "Sehr$geheim1");
    await user.click(screen.getByRole("button", { name: "Zugangsdaten speichern" }));
    await screen.findByText("Verschlüsselt gespeichert");

    expect(savedBlob).not.toBeNull();
    expect(JSON.stringify(savedBlob)).not.toContain("Sehr$geheim1");
    unmount();

    // A fresh session (e.g. the partner) sees a locked vault.
    render(<Harness stored={{ blob: savedBlob!, updatedAt: new Date().toISOString(), updatedBy: null }} />);
    await user.type(screen.getByLabelText("Master-Passwort"), "falsches-passwort");
    await user.click(screen.getByRole("button", { name: /Entsperren/ }));
    expect(await screen.findByText("Falsches Master-Passwort.")).toBeInTheDocument();

    const field = screen.getByLabelText("Master-Passwort");
    await user.clear(field);
    await user.type(field, "unser-gemeinsames-passwort");
    await user.click(screen.getByRole("button", { name: /Entsperren/ }));
    expect(await screen.findByLabelText("Passwort")).toHaveValue("Sehr$geheim1");
    expect(screen.getByLabelText("Passwort")).toHaveAttribute("type", "password");
  }, 30_000);
});

describe("ApplicationDialog – Link ändern", () => {
  it("jumps to and focuses the link field", async () => {
    const user = userEvent.setup();
    Element.prototype.scrollIntoView = vi.fn();
    render(<Harness stored={null} />);
    await user.click(screen.getByRole("button", { name: "Link ändern" }));
    expect(screen.getByLabelText(/^Link/)).toHaveFocus();
  });
});

describe("ApplicationDialog – Links in Notizen", () => {
  it("shows links from the notes as clickable new-tab links", () => {
    function WithNotes() {
      const vault = useVault(null);
      return (
        <ApplicationDialog
          state={{ mode: "view", id: app.id }}
          application={{ ...app, notes: "Umsatz: https://www.gentlebook.de/superadmin/revenue" }}
          vault={vault}
          onClose={() => {}}
          onCreated={() => {}}
          onOpen={() => {}}
        />
      );
    }
    render(<WithNotes />);
    const list = screen.getByRole("list", { name: "Links aus den Notizen" });
    const link = within(list).getByRole("link", { name: /Umsatz/ });
    expect(link).toHaveAttribute("href", "https://www.gentlebook.de/superadmin/revenue");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });
});
