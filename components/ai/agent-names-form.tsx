"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveAgentNamesAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import { AGENT_PERSONAS, PLANNED_PERSONAS, TEAMS, TEAM_EXTRAS } from "@/lib/agent-personas";
import { AgentAvatar } from "@/components/ai/agent-avatar";

export type AgentDirectoryEntry = { id: string; name: string; description: string; isEnabled: boolean };

type Row = { id: string; role: string; team: string; description: string; status: "aktiv" | "aus" | "ohne KI" | "geplant"; href?: string };

/** All colleagues by team: rename them and see what each one is responsible for. */
export function AgentNamesForm({
  agents,
  names,
  defaults,
}: {
  agents: AgentDirectoryEntry[];
  names: Record<string, string>;
  defaults: Record<string, string>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(names);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const catalog = new Map(agents.map((agent) => [agent.id, agent]));
  const rows: Row[] = [
    ...Object.entries(AGENT_PERSONAS).map(([id, persona]) => {
      const agent = catalog.get(id);
      const extra = TEAM_EXTRAS.find((item) => item.id === id);
      return {
        id,
        role: persona.role,
        team: persona.team ?? "buero",
        description: agent?.description ?? extra?.note ?? "",
        status: agent ? (agent.isEnabled ? "aktiv" : "aus") : "ohne KI",
        href: agent ? `/ai/agents/${encodeURIComponent(id)}` : extra?.href,
      } satisfies Row;
    }),
    ...Object.entries(PLANNED_PERSONAS).map(([id, persona]) => {
      const extra = TEAM_EXTRAS.find((item) => item.id === id);
      return {
        id,
        role: persona.role,
        team: persona.team ?? "projektleitung",
        description: extra?.note ?? "",
        status: extra?.planned ? "geplant" : "ohne KI",
        href: extra?.href,
      } satisfies Row;
    }),
  ];

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setErrors({});
    setSaved(false);
    // Only names that differ from the default are stored.
    const custom = Object.fromEntries(Object.entries(values).map(([id, value]) => [id, value.trim() === defaults[id] ? "" : value.trim()]));
    startTransition(async () => {
      const result = await saveAgentNamesAction(custom);
      if (!result.ok) {
        setError(result.error);
        setErrors(result.errors ?? {});
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-5 p-5" aria-labelledby="agent-names-heading">
      <div>
        <h2 id="agent-names-heading" className="text-[13px] font-semibold text-ink">
          Agenten und Zuständigkeiten
        </h2>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
          Alle Kolleg:innen nach Team. Den Vornamen kannst du ändern, er gilt überall im Hub, in Telegram-Nachrichten und in Mail-Signaturen. Leer lassen setzt den
          Standardnamen zurück. Zwei Agenten dürfen nicht gleich heißen.
        </p>
      </div>

      {TEAMS.map((team) => {
        const members = rows.filter((row) => row.team === team.key);
        if (members.length === 0) return null;
        return (
          <fieldset key={team.key} className="flex flex-col gap-2">
            <legend className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-subtle">{team.title}</legend>
            <ul className="flex flex-col divide-y divide-line rounded-[10px] border border-line">
              {members.map((row) => (
                <li key={row.id} className="grid gap-2 p-3 sm:grid-cols-[44px_160px_minmax(0,1fr)_auto] sm:items-start">
                  <AgentAvatar agentId={row.id} size={40} state={row.status === "aktiv" ? "idle" : "off"} title={`${values[row.id] ?? defaults[row.id]} · ${row.role}`} />
                  <label className="flex flex-col gap-1 text-[11px]">
                    <span className="sr-only">Name von {row.role}</span>
                    <input
                      className={cn("input h-8 text-[12.5px] font-semibold", errors[row.id] && "border-rose-400")}
                      value={values[row.id] ?? ""}
                      placeholder={defaults[row.id]}
                      maxLength={24}
                      onChange={(event) => setValues((current) => ({ ...current, [row.id]: event.target.value }))}
                      aria-invalid={Boolean(errors[row.id]) || undefined}
                    />
                    {errors[row.id] ? (
                      <span className="text-rose-600">{errors[row.id]}</span>
                    ) : (
                      values[row.id] !== defaults[row.id] && <span className="text-subtle">Standard: {defaults[row.id]}</span>
                    )}
                  </label>
                  <div className="min-w-0 text-[11.5px]">
                    <p className="font-semibold text-ink">{row.role}</p>
                    <p className="leading-relaxed text-muted">{row.description}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <span
                      className={cn(
                        "rounded-[5px] px-1.5 py-0.5 text-[9.5px] font-semibold",
                        row.status === "aktiv" && "bg-emerald-50 text-emerald-700",
                        row.status === "aus" && "bg-slate-100 text-slate-600",
                        row.status === "ohne KI" && "bg-slate-100 text-slate-600",
                        row.status === "geplant" && "bg-amber-50 text-amber-700",
                      )}
                    >
                      {row.status === "aktiv" ? "Aktiv" : row.status === "aus" ? "Aus" : row.status === "ohne KI" ? "Ohne KI" : "Geplant"}
                    </span>
                    {row.href && (
                      <Link href={row.href} className="text-[10.5px] font-semibold text-accent hover:underline">
                        Öffnen
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </fieldset>
        );
      })}

      {error && <p className="text-[11.5px] text-rose-600">{error}</p>}
      {saved && <p className="text-[11.5px] text-emerald-700">Gespeichert. Die neuen Namen gelten ab sofort überall.</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          Namen speichern
        </button>
        <button type="button" className="btn btn-ghost" disabled={pending} onClick={() => setValues(defaults)}>
          Alle auf Standard
        </button>
      </div>
    </form>
  );
}
