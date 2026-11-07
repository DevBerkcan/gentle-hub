"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setVoiceNoteDoneAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import type { VoiceNote } from "@/lib/types";
import { IconCheck, IconLoader } from "@/components/ui/icons";

const KIND: Record<string, string> = { meeting: "Termin", task: "Aufgaben", idea: "Idee", lead: "Interessent", other: "Notiz" };

function due(value?: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

export function VoiceNoteCard({ note, highlight }: { note: VoiceNote; highlight?: boolean }) {
  const router = useRouter();
  const [showTranscript, setShowTranscript] = useState(false);
  const [pending, startTransition] = useTransition();
  const content = note.content;
  const duration = note.durationSeconds != null ? `${Math.floor(note.durationSeconds / 60)}:${String(note.durationSeconds % 60).padStart(2, "0")} min` : null;

  return (
    <article
      id={`note-${note.id}`}
      className={cn("card flex scroll-mt-24 flex-col gap-2.5 p-4", note.isDone && "opacity-60", highlight && "ring-2 ring-brand/60")}
    >
      <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
        <span className="rounded-full bg-sky-50 px-2 py-0.5 font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
          {note.source === "voice" ? `🎧 Sprachnotiz${duration ? ` · ${duration}` : ""}` : "📝 Textnotiz"}
        </span>
        {note.kind && <span className="font-semibold uppercase tracking-wide text-subtle">{KIND[note.kind] ?? note.kind}</span>}
        <span className="ml-auto text-subtle">
          {note.from ? `${note.from} · ` : ""}
          {formatDateTime(note.createdAt)}
        </span>
      </div>

      {note.status === "processing" && <p className="text-[12px] text-muted">Deniz arbeitet noch an dieser Notiz …</p>}
      {note.status === "failed" && <p className="text-[12px] text-rose-600">Nicht verarbeitet: {note.error}</p>}

      {note.title && <h3 className={cn("text-[13.5px] font-semibold text-ink", note.isDone && "line-through")}>{note.title}</h3>}
      {content?.summary && <p className="text-[12px] leading-relaxed text-ink">{content.summary}</p>}

      {content?.tasks && content.tasks.length > 0 && (
        <ul className="flex flex-col gap-1">
          {content.tasks.map((task, index) => (
            <li key={index} className="flex items-start gap-2 text-[12px] text-ink">
              <span className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-[4px] border border-line-strong" />
              <span>
                {task.title}
                {task.due && <span className="ml-1.5 text-[10.5px] font-semibold text-amber-700 dark:text-amber-300">bis {due(task.due)}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      {(content?.decisions?.length ?? 0) > 0 && (
        <p className="text-[11.5px] text-muted">
          <strong className="text-ink">Vereinbart:</strong> {content!.decisions!.join(" · ")}
        </p>
      )}
      {(content?.openQuestions?.length ?? 0) > 0 && (
        <p className="text-[11.5px] text-muted">
          <strong className="text-ink">Offen:</strong> {content!.openQuestions!.join(" · ")}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-2 text-[11px]">
        {note.projectSlug ? (
          <Link href={`/p/${note.projectSlug}`} className="font-semibold text-accent hover:underline">
            {note.projectName}
          </Link>
        ) : (
          <span className="text-subtle">Kein Projekt erkannt</span>
        )}
        {note.transcript && (
          <button type="button" onClick={() => setShowTranscript((v) => !v)} className="text-muted hover:text-ink">
            {showTranscript ? "Abschrift ausblenden" : "Abschrift zeigen"}
          </button>
        )}
        {note.status === "done" && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await setVoiceNoteDoneAction(note.id, !note.isDone);
                router.refresh();
              })
            }
            className="btn btn-secondary ml-auto h-7 px-2.5 text-[11px]"
          >
            {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
            {note.isDone ? "Wieder öffnen" : "Erledigt"}
          </button>
        )}
      </div>
      {showTranscript && note.transcript && (
        <p className="whitespace-pre-wrap rounded-[8px] bg-surface-2 px-3 py-2 text-[11.5px] leading-relaxed text-muted">{note.transcript}</p>
      )}
    </article>
  );
}
