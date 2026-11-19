"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { suiteAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import { formatEur } from "@/lib/ai-format";
import { formatDateTime } from "@/lib/format";
import type { SuiteAction, SuiteDocument, SuiteState } from "@/lib/types";
import { AgentAvatar } from "@/components/ai/agent-avatar";
import { IconExternal } from "@/components/ui/icons";
import { agentName, agentGenitive } from "@/lib/agent-personas";

const STATUS_LABELS: Record<string, string> = {
  Draft: "Entwurf",
  Sent: "Verschickt",
  Viewed: "Vom Kunden geöffnet",
  Accepted: "Vom Kunden angenommen",
  Rejected: "Abgelehnt",
  Expired: "Abgelaufen",
  Ordered: "Beauftragt",
  Inactive: "Inaktiv",
};

const PAYMENT_LABELS: Record<string, string> = {
  onetime: "Einmalzahlung",
  monthly12: "12 Monatsraten",
  monthly24: "24 Monatsraten",
};

const CONFIRM: Record<SuiteAction, string> = {
  get quote() { return `${agentName("offer-contract")} legt jetzt ein Angebot als Entwurf in GentleSuite an. Der Kunde bekommt noch nichts.`; },
  send: "GentleSuite schickt das Angebot jetzt per E-Mail mit Unterschriftslink an den Kunden. Das lässt sich nicht zurückholen.",
  get contract() { return `${agentName("offer-contract")} legt jetzt einen Vertragsentwurf aus dem Angebot in GentleSuite an. Unterschrift und Versand machst du in GentleSuite.`; },
  order: "Das angenommene Angebot wird in GentleSuite als Auftrag bestätigt.",
};

type Step = { action: SuiteAction; label: string; done?: string | null; hint: string | null; link?: string | null };

/** Can writes (one confirmed click per step); Melis only watches the quote until it is handed over to invoicing. */
export function SuitePanel({ vorgangId, suite, estimateApproved }: { vorgangId: string; suite: SuiteState; estimateApproved: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<SuiteAction | null>(null);
  const [recipient, setRecipient] = useState(suite.requesterEmail ?? "");

  if (!suite.configured) {
    return (
      <p className="rounded-lg border border-dashed border-line px-3 py-2 text-[11.5px] text-muted">
        {agentName("offer-contract")} und {agentName("billing")} brauchen ein eigenes GentleSuite-Servicekonto. Sobald es in den Server-Einstellungen hinterlegt und eingeschaltet ist, erscheinen hier Angebot, Versand, Vertrag und der Stand bis zur Rechnung.
      </p>
    );
  }

  const quote = suite.documents.find((d) => d.kind === "quote");
  const contract = suite.documents.find((d) => d.kind === "contract");
  const quoteReady = quote?.state === "created";
  const status = quote?.suiteStatus ?? "";
  const sent = Boolean(quote?.sentAt) || ["Sent", "Viewed", "Accepted", "Ordered"].includes(status);

  function run(action: SuiteAction) {
    setError(null);
    startTransition(async () => {
      const result = await suiteAction(vorgangId, action, action === "send" ? recipient : null);
      setConfirming(null);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  const steps: Step[] = [
    {
      action: "quote",
      label: "Angebot in GentleSuite anlegen",
      done: quoteReady ? docLine(quote) : null,
      link: quote?.url,
      hint: !estimateApproved ? `Erst ${agentGenitive("estimation")} Schätzung freigeben.` : !suite.customerId ? "Erst den Kunden in der E-Mail GentleSuite zuordnen." : null,
    },
    {
      action: "send",
      label: "Angebot an den Kunden schicken",
      done: sent ? `Verschickt${quote?.sentTo ? ` an ${quote.sentTo}` : ""}${quote?.sentAt ? ` am ${formatDateTime(quote.sentAt)}` : ""}` : null,
      hint: !quoteReady
        ? "Erst das Angebot anlegen."
        : !quote?.hasPaymentPlan
          ? "Erst in GentleSuite die Zahlungsoptionen festlegen (Einmalzahlung/Raten), dann hier verschicken."
          : null,
      link: quoteReady && !quote?.hasPaymentPlan ? quote?.url : null,
    },
    {
      action: "contract",
      label: "Vertragsentwurf anlegen",
      done: contract?.state === "created" ? docLine(contract) : null,
      link: contract?.url,
      hint: !quoteReady ? "Erst das Angebot anlegen." : null,
    },
    {
      action: "order",
      label: "Auftrag bestätigen",
      done: status === "Ordered" ? "Als Auftrag bestätigt" : null,
      hint: status === "Accepted" ? null : "Erst wenn der Kunde das Angebot in GentleSuite angenommen hat.",
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {suite.customerName && (
        <p className="text-[11px] text-muted">
          Kunde in GentleSuite: <span className="font-semibold text-ink">{suite.customerName}</span>
        </p>
      )}
      {error && <p className="text-[11.5px] text-rose-600">{error}</p>}
      <ol className="flex flex-col gap-2">
        {steps.map((step) => {
          const failed = suite.documents.find((d) => d.kind === (step.action === "contract" ? "contract" : "quote") && d.state === "failed");
          return (
            <li key={step.action} className={cn("card flex flex-col gap-2 p-3", step.done && "border-emerald-200")}>
              <div className="flex items-center gap-3">
                <AgentAvatar agentId="offer-contract" size={34} state={step.done ? "idle" : "off"} title={`${agentName("offer-contract")} · Angebot & Vertrag`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-ink">{step.label}</p>
                  <p className={cn("flex flex-wrap items-center gap-x-2 text-[10.5px]", step.done ? "text-emerald-700" : "text-muted")}>
                    <span>{step.done ?? step.hint ?? (failed?.lastError ? `Letzter Versuch fehlgeschlagen: ${failed.lastError}` : "Bereit.")}</span>
                    {step.link && <SuiteLink href={step.link} />}
                  </p>
                </div>
                {!step.done && (
                  <button
                    type="button"
                    className="btn btn-secondary h-7 shrink-0 px-2 text-[11px]"
                    disabled={pending || Boolean(step.hint)}
                    onClick={() => setConfirming(step.action)}
                  >
                    {failed ? "Nochmal" : "Ausführen"}
                  </button>
                )}
              </div>

              {confirming === step.action && (
                <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50/60 p-2.5 text-[11.5px] text-ink dark:bg-amber-950/20">
                  <p>{CONFIRM[step.action]}</p>
                  {step.action === "send" && (
                    <label className="flex flex-col gap-1">
                      <span className="text-[10.5px] font-semibold text-muted">Empfänger</span>
                      <input className="input" type="email" value={recipient} onChange={(event) => setRecipient(event.target.value)} maxLength={320} />
                    </label>
                  )}
                  <div className="flex gap-2">
                    <button type="button" className="btn btn-primary h-7 px-2 text-[11px]" disabled={pending} onClick={() => run(step.action)}>
                      {pending ? "Läuft…" : "Ja, ausführen"}
                    </button>
                    <button type="button" className="btn btn-ghost h-7 px-2 text-[11px]" disabled={pending} onClick={() => setConfirming(null)}>
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}

        <li className={cn("card flex items-center gap-3 p-3", quote?.transferredAt && "border-emerald-200")}>
          <AgentAvatar agentId="billing" size={34} state={quote?.transferredAt ? "idle" : "off"} title={`${agentName("billing")} · Abrechnung`} />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-ink">Rechnung ({agentName("billing")})</p>
            <p className={cn("flex flex-wrap items-center gap-x-2 text-[10.5px]", quote?.transferredAt ? "text-emerald-700" : "text-muted")}>
              <span>{billingText(quote)}</span>
              {quote?.url && quote.signatureStatus === "Signed" && !quote.transferredAt && <SuiteLink href={quote.url} label="In GentleSuite überführen" />}
            </p>
          </div>
        </li>
      </ol>
    </div>
  );
}

function docLine(doc?: SuiteDocument) {
  if (!doc) return null;
  const parts = [doc.number || "Entwurf", STATUS_LABELS[doc.suiteStatus ?? ""] ?? doc.suiteStatus];
  if (doc.amountNet != null) parts.push(`${formatEur(doc.amountNet)} netto`);
  return parts.filter(Boolean).join(" · ");
}

function billingText(quote?: SuiteDocument) {
  if (!quote || quote.state !== "created") return "Wartet auf das Angebot.";
  if (quote.transferredAt) return `In GentleSuite überführt am ${formatDateTime(quote.transferredAt)}. Rechnung bzw. Ratenplan liegt dort.`;
  if (quote.signatureStatus === "Signed") {
    const option = quote.paymentOption ? PAYMENT_LABELS[quote.paymentOption] ?? quote.paymentOption : "noch keine Zahlungsart";
    return `Kunde hat unterschrieben (${option}). Bitte in GentleSuite „Überführen“ klicken. Das legt Rechnung bzw. Ratenplan an.`;
  }
  return "Wartet auf die Unterschrift des Kunden. Rechnungen entstehen nur in GentleSuite.";
}

function SuiteLink({ href, label = "In GentleSuite öffnen" }: { href: string; label?: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-accent hover:underline">
      {label} <IconExternal className="h-3 w-3" />
    </a>
  );
}
