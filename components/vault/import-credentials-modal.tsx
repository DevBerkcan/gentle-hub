"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importCredentialsAction } from "@/app/actions";
import {
  parsePasswordCsv,
  toCredentialImportItems,
  type ImportedPasswordRow,
} from "@/lib/csv";
import { CREDENTIAL_CATEGORY_LABELS } from "@/lib/constants";
import { Modal } from "@/components/ui/modal";
import { FormError, SuccessNote } from "@/components/ui/field";
import { IconLoader, IconUpload } from "@/components/ui/icons";

type ImportResult = { created: number; skipped: number };

export function ImportCredentialsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ImportedPasswordRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setFileName(null);
    setRows([]);
    setError(null);
    setResult(null);
  }

  function close() {
    if (pending) return;
    reset();
    onClose();
  }

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);
    setFileName(file.name);

    try {
      const text = await file.text();
      const parsed = parsePasswordCsv(text);
      if (parsed.length === 0) {
        setRows([]);
        setError(
          "In dieser Datei wurden keine Passwörter gefunden. Erwartet wird ein CSV-Export mit den Spalten name, url, username, password.",
        );
        return;
      }
      setRows(parsed);
    } catch {
      setRows([]);
      setError("Die Datei konnte nicht gelesen werden.");
    } finally {
      event.target.value = "";
    }
  }

  function runImport() {
    setError(null);
    startTransition(async () => {
      const response = await importCredentialsAction(toCredentialImportItems(rows));
      if (!response.ok) {
        setError(response.error);
        return;
      }
      setResult({ created: response.result.created, skipped: response.result.skipped });
      setRows([]);
      router.refresh();
    });
  }

  const preview = rows.slice(0, 5);
  const canImport = rows.length > 0 && !pending && !result;

  return (
    <Modal
      open={open}
      onClose={close}
      title="Passwörter importieren"
      description="CSV-Export aus Chrome, Edge oder Brave. Passwörter werden verschlüsselt gespeichert; bereits vorhandene Logins (gleiche Adresse und gleicher Benutzer) werden übersprungen."
      size="lg"
      dismissible={!pending}
    >
      <div className="flex flex-col gap-4">
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-[12px] border border-dashed border-line-strong bg-surface-2/50 px-4 py-6 text-center transition hover:border-line-strong hover:bg-surface">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={onFile}
            disabled={pending || Boolean(result)}
            className="sr-only"
          />
          <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-surface text-muted">
            <IconUpload className="h-4 w-4" />
          </span>
          <span className="text-[12.5px] font-semibold text-ink">
            {fileName ?? "CSV-Datei auswählen"}
          </span>
          <span className="text-[11px] leading-relaxed text-muted">
            Chrome: Einstellungen → Passwort-Manager → Einstellungen → Passwörter exportieren
          </span>
        </label>

        <FormError message={error} />

        {preview.length > 0 && !result && (
          <div className="overflow-hidden rounded-[10px] border border-line">
            <div className="flex items-center justify-between gap-2 border-b border-line bg-surface-2/70 px-3 py-2">
              <p className="text-[11px] font-semibold text-ink">
                {rows.length} {rows.length === 1 ? "Zeile" : "Zeilen"} erkannt
              </p>
              <p className="text-[10.5px] text-muted">Vorschau ohne Passwörter</p>
            </div>
            <table className="w-full table-fixed text-left">
              <thead className="text-[9.5px] font-semibold uppercase tracking-wide text-subtle">
                <tr>
                  <th className="px-3 py-1.5 font-semibold">Bezeichnung</th>
                  <th className="px-3 py-1.5 font-semibold">Benutzer</th>
                  <th className="w-24 px-3 py-1.5 font-semibold">Kategorie</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, index) => {
                  const items = toCredentialImportItems([row])[0];
                  return (
                    <tr key={`${row.url}-${row.username}-${index}`} className="border-t border-line">
                      <td className="truncate px-3 py-1.5 text-[11.5px] text-ink" title={items.label}>
                        {items.label}
                      </td>
                      <td className="truncate px-3 py-1.5 text-[11.5px] text-muted" title={row.username}>
                        {row.username || "–"}
                      </td>
                      <td className="px-3 py-1.5 text-[11px] text-muted">
                        {CREDENTIAL_CATEGORY_LABELS[items.category] ?? "Sonstiges"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length > preview.length && (
              <p className="border-t border-line px-3 py-1.5 text-[10.5px] text-muted">
                … und {rows.length - preview.length} weitere
              </p>
            )}
          </div>
        )}

        {result && (
          <SuccessNote
            message={`${result.created} ${result.created === 1 ? "Passwort" : "Passwörter"} importiert${
              result.skipped > 0 ? `, ${result.skipped} übersprungen` : ""
            }.`}
          />
        )}

        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={close} className="btn btn-secondary" disabled={pending}>
            {result ? "Fertig" : "Abbrechen"}
          </button>
          <button type="button" onClick={runImport} className="btn btn-primary" disabled={!canImport}>
            {pending && <IconLoader className="h-4 w-4" />}
            {pending
              ? "Importiert …"
              : rows.length > 0
                ? `${rows.length} ${rows.length === 1 ? "Passwort" : "Passwörter"} importieren`
                : "Importieren"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
