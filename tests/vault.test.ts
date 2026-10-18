import { describe, expect, it } from "vitest";
import { createVault, isVaultBlob, openVault, sealVault, VaultPasswordError } from "@/lib/vault";

// Fewer iterations keep the tests fast; production uses DEFAULT_ITERATIONS (600k).
const ITER = 100_000;

describe("vault crypto", () => {
  it("round-trips entries with the right password", async () => {
    const vault = await createVault("korrektes pferd batterie", ITER);
    const blob = await sealVault(vault, { gentlebook: { username: "admin", password: "s3cr3t!" } });

    const reopened = await openVault(blob, "korrektes pferd batterie");
    expect(reopened.entries).toEqual({ gentlebook: { username: "admin", password: "s3cr3t!" } });
  });

  it("rejects a wrong password", async () => {
    const blob = await sealVault(await createVault("richtig-richtig", ITER), { a: { password: "x" } });
    await expect(openVault(blob, "falsch-falsch")).rejects.toBeInstanceOf(VaultPasswordError);
  });

  it("uses a fresh IV for every seal and never contains plaintext", async () => {
    const vault = await createVault("master-passwort", ITER);
    const entries = { app: { password: "SuperGeheim123" } };
    const first = await sealVault(vault, entries);
    const second = await sealVault(vault, entries);

    expect(first.iv).not.toBe(second.iv);
    expect(first.data).not.toBe(second.data);
    const serialized = JSON.stringify(first);
    expect(serialized).not.toContain("SuperGeheim123");
    expect(atob(first.data)).not.toContain("SuperGeheim123");
  });

  it("produces blobs that pass the server-side structure check", async () => {
    const blob = await sealVault(await createVault("master-passwort", ITER), {});
    expect(isVaultBlob(blob)).toBe(true);
  });
});

describe("isVaultBlob", () => {
  const valid = { v: 1, iter: 600_000, salt: "c2FsdA==", iv: "aXY=", data: "ZGF0YQ==" };

  it("accepts the expected shape", () => {
    expect(isVaultBlob(valid)).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isVaultBlob(null)).toBe(false);
    expect(isVaultBlob({ ...valid, v: 2 })).toBe(false);
    expect(isVaultBlob({ ...valid, iter: 10 })).toBe(false);
    expect(isVaultBlob({ ...valid, data: "<script>" })).toBe(false);
    expect(isVaultBlob({ ...valid, data: "" })).toBe(false);
    expect(isVaultBlob({ ...valid, extra: "x" })).toBe(false);
    expect(isVaultBlob({ ...valid, data: "A".repeat(1_000_001) })).toBe(false);
  });
});
