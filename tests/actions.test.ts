import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUser = vi.fn();
const repo = {
  insertApplication: vi.fn(),
  updateApplication: vi.fn(),
  updateNotes: vi.fn(),
  deleteApplication: vi.fn(),
  setFavorite: vi.fn(),
  saveVault: vi.fn(),
};

vi.mock("@/lib/session", () => ({ requireUser: () => requireUser() }));
vi.mock("@/lib/repo", () => repo);
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const actions = await import("@/app/actions");

const user = { id: "u1", email: "berkcan@gentlegroup.de", name: "" };
const input = {
  name: "GentleBook",
  description: "",
  url: "https://app.example.com/admin/login",
  category: "saas",
};
const blob = { v: 1, iter: 600_000, salt: "c2FsdA==", iv: "aXY=", data: "ZGF0YQ==" };

beforeEach(() => {
  vi.clearAllMocks();
  requireUser.mockResolvedValue(user);
});

describe("server actions", () => {
  it("refuse to run without a session (requireUser redirects/throws)", async () => {
    requireUser.mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(actions.createApplicationAction(input)).rejects.toThrow("NEXT_REDIRECT");
    await expect(actions.deleteApplicationAction("gentlebook")).rejects.toThrow("NEXT_REDIRECT");
    await expect(actions.saveVaultAction(blob, null)).rejects.toThrow("NEXT_REDIRECT");
    expect(repo.insertApplication).not.toHaveBeenCalled();
    expect(repo.deleteApplication).not.toHaveBeenCalled();
    expect(repo.saveVault).not.toHaveBeenCalled();
  });

  it("creates an application with validated input and records the author", async () => {
    const result = await actions.createApplicationAction({ ...input, name: "  GentleBook  " });
    expect(result.ok).toBe(true);
    expect(repo.insertApplication).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ name: "GentleBook", url: input.url }),
      "berkcan@gentlegroup.de"
    );
  });

  it("rejects unsafe URLs before touching the database", async () => {
    const result = await actions.updateApplicationAction("gentlebook", { ...input, url: "javascript:alert(1)" });
    expect(result).toMatchObject({ ok: false, errors: { url: expect.any(String) } });
    expect(repo.updateApplication).not.toHaveBeenCalled();
  });

  it("rejects malformed ids", async () => {
    expect((await actions.deleteApplicationAction("../etc")).ok).toBe(false);
    expect((await actions.updateNotesAction("'; drop table x;--", "n")).ok).toBe(false);
    expect(repo.deleteApplication).not.toHaveBeenCalled();
  });

  it("reports missing applications", async () => {
    repo.updateNotes.mockResolvedValue(false);
    expect(await actions.updateNotesAction("gone", "x")).toMatchObject({ ok: false });
  });

  it("stores favorites per user", async () => {
    await actions.setFavoriteAction("gentlebook", true);
    expect(repo.setFavorite).toHaveBeenCalledWith("u1", "gentlebook", true);
    expect((await actions.setFavoriteAction("gentlebook", "yes")).ok).toBe(false);
  });

  it("only accepts encrypted vault blobs", async () => {
    expect((await actions.saveVaultAction({ passwords: "plain" }, null)).ok).toBe(false);
    expect(repo.saveVault).not.toHaveBeenCalled();

    repo.saveVault.mockResolvedValue("2026-10-18T10:00:00.000Z");
    expect(await actions.saveVaultAction(blob, null)).toEqual({ ok: true, updatedAt: "2026-10-18T10:00:00.000Z" });
  });

  it("reports vault write conflicts", async () => {
    repo.saveVault.mockResolvedValue(null);
    expect(await actions.saveVaultAction(blob, "2026-10-18T09:00:00.000Z")).toMatchObject({ ok: false, conflict: true });
  });
});
