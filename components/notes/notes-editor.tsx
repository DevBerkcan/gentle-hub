"use client";

import { useState, useTransition } from "react";
import { saveNotesAction } from "@/app/actions";
import { FormError } from "@/components/ui/field";
import { IconCheck, IconLoader } from "@/components/ui/icons";

export function NotesEditor({
  projectSlug,
  initialNotes,
  meta,
}: {
  projectSlug: string;
  initialNotes: string;
  meta: string;
}) {
  const [value, setValue] = useState(initialNotes);
  const [savedValue, setSavedValue] = useState(initialNotes);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = value !== savedValue;

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
    <section className="card p-4 sm:p-5" aria-labelledby="notes-heading">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="notes-heading" className="text-[12.5px] font-semibold text-ink">
            Notizen
          </h2>
          <p className="mt-0.5 text-[10.5px] text-muted">{meta}</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || pending}
          className="btn btn-secondary h-8 text-[11.5px]"
        >
          {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
          {pending ? "Speichert …" : dirty ? "Speichern" : "Gespeichert"}
        </button>
      </div>

      <FormError message={error} />
      {message && (
        <p className="mb-2 text-[11px] font-medium text-emerald-700" role="status">
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
        className="textarea min-h-28 text-[12.5px] leading-relaxed"
        rows={4}
        maxLength={50_000}
        aria-label="Notizen zum Projekt"
      />
      <p className="mt-2 text-[10.5px] text-subtle">
        Strg + Enter speichert. Passwörter gehören in einen Zugang, nicht in die Notizen.
      </p>
    </section>
  );
}
