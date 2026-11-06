"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setSupportStatusAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";
import type { SupportCategory, SupportSeverity, SupportStatus, SupportTicket } from "@/lib/types";
import { IconExternal, IconLoader, IconMail } from "@/components/ui/icons";

export const CATEGORY_LABELS: Record<SupportCategory, string> = {
  outage: "Ausfall",
  bug: "Fehler",
  change: "Änderungswunsch",
  question: "Frage",
  other: "Sonstiges",
};

const SEVERITY: Record<SupportSeverity, { label: string; className: string }> = {
  critical: { label: "Notfall", className: "bg-rose-600 text-white" },
  high: { label: "Dringend", className: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20" },
  normal: { label: "Normal", className: "bg-surface-2 text-muted" },
  low: { label: "Niedrig", className: "bg-surface-2 text-subtle" },
};

const STATUS_LABELS: Record<SupportStatus, string> = { open: "Offen", in_progress: "In Arbeit", done: "Erledigt" };

export function SeverityBadge({ severity }: { severity: SupportSeverity }) {
  return (
    <span className={cn("rounded-[5px] px-1.5 py-0.5 text-[10px] font-semibold", SEVERITY[severity].className)}>
      {SEVERITY[severity].label}
    </span>
  );
}

function StatusButtons({ ticket }: { ticket: SupportTicket }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next: { status: SupportStatus; label: string }[] =
    ticket.status === "open"
      ? [
          { status: "in_progress", label: "In Arbeit" },
          { status: "done", label: "Erledigt" },
        ]
      : ticket.status === "in_progress"
        ? [{ status: "done", label: "Erledigt" }]
        : [{ status: "open", label: "Wieder öffnen" }];

  return (
    <div className="flex items-center gap-1.5">
      {pending && <IconLoader className="h-3.5 w-3.5 text-muted" />}
      {next.map((option) => (
        <button
          key={option.status}
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await setSupportStatusAction(ticket.id, option.status);
              router.refresh();
            })
          }
          className={cn("btn h-7 px-2.5 text-[11px]", option.status === "done" ? "btn-primary" : "btn-secondary")}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function SupportTicketCard({ ticket, highlight }: { ticket: SupportTicket; highlight?: boolean }) {
  const sender = ticket.fromName ? `${ticket.fromName} <${ticket.fromAddress}>` : ticket.fromAddress;
  return (
    <article
      id={`ticket-${ticket.id}`}
      className={cn(
        "card flex scroll-mt-24 flex-col gap-2 p-4",
        ticket.status === "done" && "opacity-70",
        highlight && "ring-2 ring-brand/60",
        ticket.severity === "critical" && ticket.status !== "done" && "border-rose-300 dark:border-rose-500/40",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={ticket.severity} />
        <span className="text-[10.5px] font-semibold uppercase tracking-wide text-subtle">{CATEGORY_LABELS[ticket.category]}</span>
        {ticket.siteDown && (
          <span className="rounded-[5px] bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            Vom Website-Wächter bestätigt
          </span>
        )}
        <span className="ml-auto text-[10.5px] text-subtle">
          {STATUS_LABELS[ticket.status]} · {formatRelative(ticket.createdAt)}
        </span>
      </div>
      <h3 className="text-[13.5px] font-semibold text-ink">{ticket.title}</h3>
      <p className="text-[12px] leading-relaxed text-ink">{ticket.summary}</p>
      {ticket.nextStep && (
        <p className="rounded-[8px] bg-surface-2 px-3 py-2 text-[11.5px] text-muted">
          <strong className="text-ink">Nächster Schritt:</strong> {ticket.nextStep}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-2 text-[11px]">
        {ticket.projectSlug ? (
          <Link href={`/p/${ticket.projectSlug}`} className="font-semibold text-accent hover:underline">
            {ticket.projectName}
          </Link>
        ) : (
          <span className="text-subtle">Kein Projekt zugeordnet</span>
        )}
        <Link href={`/ai/emails/${ticket.emailMessageId}`} className="inline-flex items-center gap-1 text-muted hover:text-ink">
          <IconMail className="h-3 w-3" />
          {sender ?? "Ursprüngliche Mail"}
        </Link>
        {ticket.affectedUrl && (
          <a href={ticket.affectedUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-ink">
            <IconExternal className="h-3 w-3" />
            Betroffene Seite
          </a>
        )}
        <div className="ml-auto">
          <StatusButtons ticket={ticket} />
        </div>
      </div>
    </article>
  );
}
