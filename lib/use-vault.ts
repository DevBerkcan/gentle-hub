"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveVaultAction } from "@/app/actions";
import {
  createVault,
  openVault,
  sealVault,
  VaultPasswordError,
  type OpenVault,
  type VaultBlob,
  type VaultEntries,
  type VaultEntry,
} from "@/lib/vault";

export type StoredVaultSnapshot = { blob: VaultBlob; updatedAt: string; updatedBy: string | null } | null;

export type VaultStatus = "none" | "locked" | "unlocked";

export type VaultController = {
  status: VaultStatus;
  busy: boolean;
  error: string | null;
  entries: VaultEntries;
  setup: (password: string) => Promise<boolean>;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  saveEntry: (applicationId: string, entry: VaultEntry | null) => Promise<boolean>;
  /** Drops entries of applications that no longer exist. */
  prune: (existingIds: string[]) => Promise<void>;
};

/** An unlocked vault plus the server version it is based on (for conflict detection). */
type Session = { vault: OpenVault; version: string | null };

const AUTO_LOCK_MS = 10 * 60 * 1000;

function isEmpty(entry: VaultEntry | null): boolean {
  return !entry || !Object.values(entry).some((value) => value && value.trim());
}

/**
 * Holds the unlocked vault in memory only. The key never leaves this hook;
 * only the encrypted blob is sent to the server. Locks automatically after
 * 10 minutes without interaction.
 */
export function useVault(stored: StoredVaultSnapshot): VaultController {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lock = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!session) return;
    let timer = window.setTimeout(lock, AUTO_LOCK_MS);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(lock, AUTO_LOCK_MS);
    };
    window.addEventListener("pointerdown", reset);
    window.addEventListener("keydown", reset);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", reset);
      window.removeEventListener("keydown", reset);
    };
  }, [session, lock]);

  const run = useCallback(async (task: () => Promise<boolean>) => {
    setBusy(true);
    try {
      return await task();
    } finally {
      setBusy(false);
    }
  }, []);

  const persist = useCallback(
    async (vault: OpenVault, version: string | null, entries: VaultEntries): Promise<boolean> => {
      const result = await saveVaultAction(await sealVault(vault, entries), version);
      if (!result.ok) {
        setError(result.error);
        if ("conflict" in result) {
          setSession(null);
          router.refresh();
        }
        return false;
      }
      setSession({ vault: { ...vault, entries }, version: result.updatedAt });
      setError(null);
      return true;
    },
    [router]
  );

  const setup = useCallback(
    (password: string) => run(async () => persist(await createVault(password), null, {})),
    [run, persist]
  );

  const unlock = useCallback(
    (password: string) =>
      run(async () => {
        if (!stored) return false;
        try {
          setSession({ vault: await openVault(stored.blob, password), version: stored.updatedAt });
          setError(null);
          return true;
        } catch (cause) {
          setError(cause instanceof VaultPasswordError ? cause.message : "Tresor konnte nicht geöffnet werden.");
          return false;
        }
      }),
    [run, stored]
  );

  const saveEntry = useCallback(
    (applicationId: string, entry: VaultEntry | null) =>
      run(async () => {
        if (!session) return false;
        const entries = { ...session.vault.entries };
        if (isEmpty(entry)) delete entries[applicationId];
        else entries[applicationId] = entry!;
        return persist(session.vault, session.version, entries);
      }),
    [run, session, persist]
  );

  const prune = useCallback(
    async (existingIds: string[]) => {
      if (!session) return;
      const keep = new Set(existingIds);
      const entries = Object.fromEntries(Object.entries(session.vault.entries).filter(([id]) => keep.has(id)));
      if (Object.keys(entries).length === Object.keys(session.vault.entries).length) return;
      await persist(session.vault, session.version, entries);
    },
    [session, persist]
  );

  return {
    status: session ? "unlocked" : stored ? "locked" : "none",
    busy,
    error,
    entries: session?.vault.entries ?? {},
    setup,
    unlock,
    lock,
    saveEntry,
    prune,
  };
}
