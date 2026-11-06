"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startReportAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import { shortUrl } from "@/lib/format";
import type { ReportProject } from "@/lib/types";
import { IconLoader } from "@/components/ui/icons";

const STATUS: Record<string, string> = {
  pending_approval: "Wartet auf Freigabe",
  sent: "Gesendet",
  rejected: "Verworfen",
  failed: "Fehlgeschlagen",
};

function monthLabel(month: string) {
  const [year, value] = month.split("-").map(Number);
  return new Date(Date.UTC(year, value - 1, 1)).toLocaleDateString("de-DE", { month: "long", year: "numeric", timeZone: "UTC" });
}

function ReportRow({ project, month }: { project: ReportProject; month: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/p/${project.slug}`} className="text-[12.5px] font-semibold text-ink hover:underline">
            {project.name}
          </Link>
          {project.isMaintenance && (
            <span className="rounded-full bg-fuchsia-50 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300">
              Wartung · monatlich automatisch
            </span>
          )}
        </div>
        <p className="truncate text-[11px] text-muted">
          {[project.website ? shortUrl(project.website) : null, project.contactEmail ?? "keine Kontakt-E-Mail"].filter(Boolean).join(" · ")}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-[11px]">
        {project.lastMonth && (
          <span className="text-muted">
            {monthLabel(project.lastMonth)}: {project.lastStatus ? (STATUS[project.lastStatus] ?? project.lastStatus) : "–"}
          </span>
        )}
        {project.lastApprovalId && project.lastStatus === "pending_approval" && (
          <Link href={`/ai/approvals/${project.lastApprovalId}`} className="font-semibold text-accent hover:underline">
            Prüfen →
          </Link>
        )}
        <button
          type="button"
          disabled={!project.canReport || pending}
          title={project.canReport ? undefined : "Im Projekt eine Kontakt-E-Mail hinterlegen"}
          onClick={() =>
            startTransition(async () => {
              const result = await startReportAction(project.projectId, month);
              setMessage(result.ok ? "Aylin schreibt den Bericht …" : result.error);
              if (result.ok) setTimeout(() => router.refresh(), 12_000);
            })
          }
          className={cn("btn h-8 text-[11px]", project.canReport ? "btn-secondary" : "btn-ghost")}
        >
          {pending && <IconLoader className="h-3.5 w-3.5" />}
          Bericht {monthLabel(month)}
        </button>
      </div>
      {message && <p className="text-[10.5px] text-muted">{message}</p>}
    </li>
  );
}

export function ReportList({ projects, month }: { projects: ReportProject[]; month: string }) {
  return (
    <ul className="card divide-y divide-line overflow-hidden">
      {projects.map((project) => (
        <ReportRow key={project.projectId} project={project} month={month} />
      ))}
    </ul>
  );
}
