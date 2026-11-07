"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { outreachAction, startOutreachAction } from "@/app/actions";
import type { CallScript, OutreachDraft, OutreachState } from "@/lib/types";
import { AgentAvatar } from "@/components/ai/agent-avatar";
import { IconCheck, IconCopy, IconLoader, IconSparkles } from "@/components/ui/icons";

function scriptText(script: CallScript) {
  const parts = [
    script.opening && `Einstieg: ${script.opening}`,
    script.reason && `Anlass: ${script.reason}`,
    script.questions?.length && `Fragen:\n${script.questions.map((q) => `- ${q}`).join("\n")}`,
    script.pitch && `Angebot: ${script.pitch}`,
    script.objections?.length && `Einwände:\n${script.objections.map((o) => `- „${o.objection}“ → ${o.answer}`).join("\n")}`,
    script.close && `Abschluss: ${script.close}`,
  ];
  return parts.filter(Boolean).join("\n\n");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Opens a print-ready A4 letter in a new window (recipient block, date, subject, text). */
function printLetter(draft: OutreachDraft) {
  const win = window.open("", "_blank", "width=800,height=1000");
  if (!win) return;
  const date = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
  win.document.write(`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${escapeHtml(draft.letterSubject ?? "Brief")}</title>
<style>@page{size:A4;margin:25mm 20mm 20mm 25mm}body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.5;color:#111}
.recipient{margin-top:20mm;white-space:pre-line;min-height:35mm}.date{text-align:right;margin:8mm 0}.subject{font-weight:bold;margin-bottom:6mm}
.body{white-space:pre-wrap}</style></head><body>
<div class="recipient">${escapeHtml(draft.recipient ?? "")}</div><div class="date">Wuppertal, ${escapeHtml(date)}</div>
<div class="subject">${escapeHtml(draft.letterSubject ?? "")}</div><div class="body">${escapeHtml(draft.letterText ?? "")}</div>
<script>window.onload=function(){window.print()}</script></body></html>`);
  win.document.close();
}

/** Cem prepares a call script and a letter for one lead; nothing is sent from here. */
export function OutreachPanel({ prospectId }: { prospectId: string }) {
  const [state, setState] = useState<OutreachState | null>(null);
  const [productId, setProductId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const polls = useRef(0);

  const load = useCallback(async () => {
    const result = await outreachAction(prospectId);
    if (!result.ok) {
      setError(result.error);
      return null;
    }
    setState(result.state);
    setProductId((current) => current || result.state.suggestedProductId || result.state.products[0]?.id || "");
    return result.state;
  }, [prospectId]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const latest = state?.items[0];
  const waiting = latest?.status === "pending";

  // While Cem writes (usually 5-20 s), check every 3 s for at most 2 minutes.
  useEffect(() => {
    if (!waiting) return;
    polls.current = 0;
    const timer = setInterval(async () => {
      polls.current += 1;
      const next = await load();
      if (!next || next.items[0]?.status !== "pending" || polls.current > 40) clearInterval(timer);
    }, 3000);
    return () => clearInterval(timer);
  }, [waiting, load]);

  function prepare() {
    setError(null);
    startTransition(async () => {
      const result = await startOutreachAction(prospectId, productId || null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await load();
    });
  }

  async function copy(kind: "script" | "letter", text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setError("Kopieren nicht möglich. Bitte den Text markieren und kopieren.");
    }
  }

  const product = state?.products.find((p) => p.id === productId);

  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-line bg-surface-2/40 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <AgentAvatar agentId="outreach" size={32} state={waiting || pending ? "working" : "idle"} title="Cem · Ansprache" />
        <span className="text-[12px] font-semibold text-ink">Ansprache vorbereiten</span>
        <select
          className="input h-8 w-auto py-0 text-[11.5px]"
          value={productId}
          aria-label="Produkt"
          onChange={(event) => setProductId(event.target.value)}
          disabled={!state || pending || waiting}
        >
          {state?.products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.id === state.suggestedProductId ? " (passt am besten)" : ""}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-primary h-8 text-[11.5px]" onClick={prepare} disabled={!productId || pending || waiting}>
          {pending || waiting ? <IconLoader className="h-3.5 w-3.5" /> : <IconSparkles className="h-3.5 w-3.5" />}
          {latest ? "Neu schreiben" : "Leitfaden & Brief schreiben"}
        </button>
      </div>
      {product && !product.url && product.kind !== "service" && (
        <p className="text-[10.5px] text-amber-700 dark:text-amber-300">
          Für {product.name} ist noch kein Test-Link hinterlegt. Cem bietet stattdessen eine kurze Vorführung an. Link im Produktkatalog oben ergänzen.
        </p>
      )}
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
      {waiting && <p className="text-[11.5px] text-muted">Cem schreibt Leitfaden und Brief für {latest?.productName} …</p>}
      {latest?.status === "failed" && <p className="text-[11px] text-rose-600">{latest.lastError ?? "Das hat nicht geklappt."}</p>}

      {latest?.status === "done" && (
        <div className="grid gap-3 lg:grid-cols-2">
          {latest.script && (
            <section className="flex flex-col gap-2 rounded-[8px] bg-surface p-3 text-[12px] leading-relaxed text-ink">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-subtle">Gesprächsleitfaden</h4>
                <button type="button" className="btn btn-ghost h-7 px-2 text-[11px]" onClick={() => copy("script", scriptText(latest.script!))}>
                  {copied === "script" ? <IconCheck className="h-3 w-3" /> : <IconCopy className="h-3 w-3" />}
                  Kopieren
                </button>
              </div>
              <p><strong>Einstieg:</strong> {latest.script.opening}</p>
              <p><strong>Anlass:</strong> {latest.script.reason}</p>
              {!!latest.script.questions?.length && (
                <div>
                  <strong>Fragen:</strong>
                  <ul className="ml-4 list-disc">{latest.script.questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
                </div>
              )}
              <p><strong>Angebot:</strong> {latest.script.pitch}</p>
              {!!latest.script.objections?.length && (
                <div>
                  <strong>Einwände:</strong>
                  <ul className="ml-4 list-disc">
                    {latest.script.objections.map((o, i) => (
                      <li key={i}>
                        „{o.objection}“ → {o.answer}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p><strong>Abschluss:</strong> {latest.script.close}</p>
            </section>
          )}
          <section className="flex flex-col gap-2 rounded-[8px] bg-surface p-3 text-[12px] leading-relaxed text-ink">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-subtle">Brief</h4>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="btn btn-ghost h-7 px-2 text-[11px]"
                  onClick={() => copy("letter", `${latest.recipient ?? ""}\n\n${latest.letterSubject ?? ""}\n\n${latest.letterText ?? ""}`)}
                >
                  {copied === "letter" ? <IconCheck className="h-3 w-3" /> : <IconCopy className="h-3 w-3" />}
                  Kopieren
                </button>
                <button type="button" className="btn btn-ghost h-7 px-2 text-[11px]" onClick={() => printLetter(latest)}>
                  Drucken
                </button>
              </div>
            </div>
            <p className="whitespace-pre-line text-[11px] text-muted">{latest.recipient}</p>
            <p className="font-semibold">{latest.letterSubject}</p>
            <p className="whitespace-pre-wrap">{latest.letterText}</p>
          </section>
        </div>
      )}
      <p className="text-[10.5px] text-subtle">
        Erst anrufen oder den Brief schicken. Den Test-Link per E-Mail nur, wenn der Betrieb zugestimmt hat (§ 7 UWG). Danach den Status auf „Kontaktiert“ setzen.
      </p>
    </div>
  );
}
