"use client";

import { useMemo, useState, useTransition } from "react";
import { saveNotesAction } from "@/app/actions";
import { formatRelative } from "@/lib/format";
import { FormError } from "@/components/ui/field";
import { IconCheck, IconLoader, IconPencil } from "@/components/ui/icons";

export function NotesEditor({
  projectSlug,
  initialNotes,
  updatedAt,
  updatedBy,
}: {
  projectSlug: string;
  initialNotes: string;
  updatedAt: string;
  updatedBy: string | null;
}) {
  const [value, setValue] = useState(initialNotes);
  const [savedValue, setSavedValue] = useState(initialNotes);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = value !== savedValue;
  const meta = useMemo(
    () =>
      updatedBy
        ? `Zuletzt geändert von ${updatedBy.split("@")[0]} · ${formatRelative(updatedAt)}`
        : `Zuletzt geändert ${formatRelative(updatedAt)}`,
    [updatedAt, updatedBy],
  );

  function save() {
    if (!dirty) return;
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await saveNotesAction(projectSlug, value);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSavedValue(value);
      setMessage("Notizen gespeichert.");
      window.setTimeout(() => setMessage(null), 2500);
    });
  }

  return (
    <section className="card p-5 sm:p-6" aria-labelledby="notes-heading">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#f4f2f9] text-muted">
            <IconPencil className="h-4 w-4" />
          </span>
          <div>
            <h2 id="notes-heading" className="font-display text-[14.5px] font-bold text-ink">
              Notizen
            </h2>
            <p className="text-[11px] text-muted">{meta}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || pending}
          className="btn btn-secondary h-9 text-[12.5px]"
        >
          {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
          {pending ? "Speichert …" : dirty ? "Speichern" : "Gespeichert"}
        </button>
      </div>

      <FormError message={error} />
      {message && (
        <p className="mb-2 text-[12px] font-medium text-emerald-700" role="status">
          {message}
        </p>
      )}

      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            save();
          }
        }}
        placeholder="Hinweise, Ansprechpartner, To-dos, wichtige Entscheidungen …"
        className="textarea min-h-32 text-[13px] leading-relaxed"
        rows={5}
        maxLength={50_000}
        aria-label="Notizen zum Projekt"
      />
      <p className="mt-2 text-[11px] text-subtle">
        Tipp: <kbd className="rounded border border-line bg-white px-1 py-0.5 text-[10px]">Strg</kbd> +{" "}
        <kbd className="rounded border border-line bg-white px-1 py-0.5 text-[10px]">Enter</kbd> speichert.
        Passwörter gehören nicht in die Notizen, sondern in einen Zugang.
      </p>
    </section>
  );
}
