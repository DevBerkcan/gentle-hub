"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestBriefsAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";
import { persona, personaLabel } from "@/lib/agent-personas";
import type { BriefKind, BuildBrief } from "@/lib/types";
import { AgentAvatar } from "@/components/ai/agent-avatar";
import { CopyButton } from "@/components/ui/copy-button";

const KINDS: { kind: BriefKind; agentId: string; title: string; hint: string }[] = [
  { kind: "frontend", agentId: "frontend-plan", title: "Frontend", hint: "Seiten, Komponenten, Inhalte, Barrierefreiheit" },
  { kind: "backend", agentId: "backend-plan", title: "Backend", hint: "Datenmodell, Endpunkte, Sicherheit, Datenschutz" },
  { kind: "deployment", agentId: "deployment", title: "Deployment", hint: "Hosting, Umgebungsvariablen, Domain, Go-Live-Liste" },
];

/** Baran, Onur and Tolga plan the build. They only write; the build itself happens in Claude Code. */
export function BriefPanel({ vorgangId, briefs }: { vorgangId: string; briefs: BuildBrief[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const working = briefs.some((brief) => brief.status === "pending");

  // Only refreshes our own data while a brief is being written; no external calls.
  useEffect(() => {
    if (!working) return;
    const timer = setInterval(() => router.refresh(), 5_000);
    return () => clearInterval(timer);
  }, [working, router]);

  function start(kinds: BriefKind[]) {
    setError(null);
    startTransition(async () => {
      const result = await requestBriefsAction(vorgangId, kinds);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-primary" disabled={pending || working} onClick={() => start(["frontend", "backend", "deployment"])}>
          {briefs.length > 0 ? "Alle neu planen" : "Bauauftrag erstellen"}
        </button>
        <span className="text-[11px] text-muted">Tolga wartet kurz, damit er die Pläne von Baran und Onur kennt.</span>
      </div>
      {error && <p className="text-[11.5px] text-rose-600">{error}</p>}

      {KINDS.map(({ kind, agentId, title, hint }) => {
        const brief = briefs.find((item) => item.kind === kind);
        return (
          <details key={kind} className="card group p-0" open={brief?.status === "done" && kind === "frontend"}>
            <summary className="flex cursor-pointer list-none items-center gap-3 p-3">
              <AgentAvatar agentId={agentId} size={40} state={brief?.status === "pending" ? "working" : brief?.status === "failed" ? "alert" : "idle"} title={personaLabel(agentId)} />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold text-ink">
                  {title}
                  <span className="ml-1.5 text-[11px] font-medium text-muted">{persona(agentId).firstName}</span>
                </p>
                <p className="text-[11px] text-muted">{brief?.content?.summary ?? hint}</p>
              </div>
              <BriefStatus brief={brief} />
            </summary>
            <div className="flex flex-col gap-3 border-t border-line p-3">
              {!brief && <p className="text-[11.5px] text-muted">Noch nicht geplant.</p>}
              {brief?.status === "pending" && <p className="text-[11.5px] text-muted">Wird gerade geschrieben…</p>}
              {brief?.status === "failed" && <p className="text-[11.5px] text-rose-600">{brief.lastError ?? "Fehlgeschlagen."}</p>}
              {brief?.status === "done" && brief.content && <BriefContent kind={kind} brief={brief} />}
              <div>
                <button type="button" className="btn btn-secondary h-7 px-2 text-[11px]" disabled={pending || brief?.status === "pending"} onClick={() => start([kind])}>
                  {brief ? "Nur diesen neu planen" : "Nur diesen planen"}
                </button>
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}

function BriefStatus({ brief }: { brief?: BuildBrief }) {
  if (!brief) return <span className="rounded-[5px] bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-semibold text-slate-600">Offen</span>;
  const map = {
    pending: ["Arbeitet", "bg-sky-50 text-sky-700"],
    done: ["Fertig", "bg-emerald-50 text-emerald-700"],
    failed: ["Fehler", "bg-rose-50 text-rose-700"],
  } as const;
  const [label, className] = map[brief.status];
  return (
    <span className="flex flex-col items-end gap-0.5">
      <span className={cn("rounded-[5px] px-1.5 py-0.5 text-[9.5px] font-semibold", className)}>{label}</span>
      <span className="text-[9.5px] text-subtle">{formatRelative(brief.createdAt)}</span>
    </span>
  );
}

function BriefContent({ kind, brief }: { kind: BriefKind; brief: BuildBrief }) {
  const c = brief.content!;
  const stack = Array.isArray(c.stack) ? c.stack.join(", ") : c.stack;
  return (
    <div className="flex flex-col gap-3 text-[11.5px] text-ink">
      {stack && (
        <p>
          <span className="font-semibold">Technik:</span> {stack}
        </p>
      )}

      {kind === "frontend" && (c.pages ?? []).length > 0 && (
        <Block title="Seiten">
          <ul className="flex flex-col gap-1">
            {c.pages!.map((page, index) => (
              <li key={index}>
                <code className="rounded bg-surface-2 px-1 text-[10.5px]">{page.route}</code> <strong>{page.title}</strong>
                {page.purpose && <span className="text-muted"> · {page.purpose}</span>}
              </li>
            ))}
          </ul>
        </Block>
      )}

      {kind === "backend" && c.needed === false && <p className="text-muted">Onur: Für dieses Projekt ist kein eigenes Backend nötig.</p>}
      {kind === "backend" && (c.dataModel ?? []).length > 0 && (
        <Block title="Datenmodell">
          <ul className="flex flex-col gap-1">
            {c.dataModel!.map((entity, index) => (
              <li key={index}>
                <strong>{entity.entity}</strong>
                <span className="text-muted">: {(entity.fields ?? []).join(", ")}</span>
              </li>
            ))}
          </ul>
        </Block>
      )}
      {kind === "backend" && (c.endpoints ?? []).length > 0 && (
        <Block title="Endpunkte">
          <ul className="flex flex-col gap-1">
            {c.endpoints!.map((endpoint, index) => (
              <li key={index}>
                <code className="rounded bg-surface-2 px-1 text-[10.5px]">
                  {endpoint.method} {endpoint.path}
                </code>
                <span className="text-muted"> · {endpoint.purpose}</span>
                {endpoint.auth && <span className="text-subtle"> ({endpoint.auth})</span>}
              </li>
            ))}
          </ul>
        </Block>
      )}

      {kind === "deployment" && (c.targets ?? []).length > 0 && (
        <Block title="Ziele">
          <ul className="flex flex-col gap-1.5">
            {c.targets!.map((target, index) => (
              <li key={index}>
                <strong>{target.part}</strong> → {target.platform}
                {(target.steps ?? []).length > 0 && (
                  <ol className="mt-0.5 list-decimal pl-5 text-muted">
                    {target.steps!.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ul>
        </Block>
      )}
      {kind === "deployment" && (c.envVars ?? []).length > 0 && (
        <Block title="Umgebungsvariablen (nur Namen, Werte trägst du selbst ein)">
          <ul className="flex flex-col gap-0.5">
            {c.envVars!.map((env, index) => (
              <li key={index}>
                <code className="rounded bg-surface-2 px-1 text-[10.5px]">{env.name}</code>
                <span className="text-muted"> · {env.purpose}</span>
                {env.secret && <span className="ml-1 text-[9.5px] font-semibold text-amber-700">geheim</span>}
              </li>
            ))}
          </ul>
        </Block>
      )}

      <List title="Komponenten" items={c.components} />
      <List title="Benötigte Inhalte vom Kunden" items={c.contentNeeded} />
      <List title="Design" items={c.designNotes} />
      <List title="Barrierefreiheit" items={c.accessibility} />
      <List title="Anbindungen" items={c.integrations} />
      <List title="Sicherheit" items={c.security} />
      <List title="Datenschutz" items={c.privacy} />
      <List title="Go-Live-Checkliste" items={c.goLiveChecklist} />
      <List title="Überwachung" items={c.monitoring} />
      <List title="Abnahmekriterien" items={c.acceptanceChecks} />
      <List title="Offene Fragen" items={c.openQuestions} />

      {c.claudeCodePrompt && (
        <div className="rounded-lg border border-line">
          <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-1.5">
            <span className="text-[10.5px] font-semibold uppercase tracking-wide text-subtle">Prompt für Claude Code</span>
            <CopyButton value={c.claudeCodePrompt} label="Prompt kopieren" showLabel />
          </div>
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap px-3 py-2 font-mono text-[10.5px] leading-relaxed text-ink">{c.claudeCodePrompt}</pre>
        </div>
      )}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-subtle">{title}</h4>
      {children}
    </div>
  );
}

function List({ title, items }: { title: string; items?: string[] }) {
  const values = (items ?? []).filter((item) => item?.trim());
  if (values.length === 0) return null;
  return (
    <Block title={title}>
      <ul className="flex list-disc flex-col gap-0.5 pl-4">
        {values.map((value, index) => (
          <li key={index}>{value}</li>
        ))}
      </ul>
    </Block>
  );
}
