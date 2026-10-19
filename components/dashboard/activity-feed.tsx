import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";
import type { Activity } from "@/lib/types";
import {
  IconActivity,
  IconKey,
  IconLock,
  IconLogout,
  IconPencil,
  IconPlus,
  IconShield,
  IconTrash,
  IconUser,
} from "@/components/ui/icons";

function meta(action: string) {
  if (action.startsWith("auth.login")) {
    return {
      label: "Anmeldung",
      icon: IconUser,
      tone: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
    };
  }
  if (action === "auth.logout") {
    return { label: "Abmeldung", icon: IconLogout, tone: "bg-surface-2 text-muted" };
  }
  if (action === "auth.password_changed") {
    return {
      label: "Passwort geändert",
      icon: IconShield,
      tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    };
  }
  if (action === "secret.reveal") {
    return {
      label: "Geheimnis angezeigt",
      icon: IconLock,
      tone: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
    };
  }
  if (action === "setup.catalog") {
    return { label: "Einrichtung", icon: IconShield, tone: "bg-accent-soft text-accent" };
  }
  if (action === "project.create") {
    return {
      label: "Projekt angelegt",
      icon: IconPlus,
      tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    };
  }
  if (action === "project.update" || action === "project.notes") {
    return {
      label: "Projekt bearbeitet",
      icon: IconPencil,
      tone: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    };
  }
  if (action === "project.delete") {
    return {
      label: "Projekt gelöscht",
      icon: IconTrash,
      tone: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
    };
  }
  if (action.startsWith("asset.")) {
    return {
      label: "Eintrag bearbeitet",
      icon: IconKey,
      tone: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
    };
  }
  return { label: "Aktivität", icon: IconActivity, tone: "bg-surface-2 text-muted" };
}

export function ActivityFeed({ items }: { items: Activity[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-[8px] border border-dashed border-line-strong bg-surface px-4 py-6 text-center text-[11.5px] text-muted">
        Noch keine Aktivitäten.
      </p>
    );
  }

  return (
    <ol className="flex flex-col">
      {items.map((item, index) => {
        const entry = meta(item.action);
        const Icon = entry.icon;
        const name = item.userEmail?.split("@")[0] ?? "System";

        return (
          <li key={`${item.action}-${item.createdAt}-${index}`} className="relative flex gap-2.5 pb-3.5 last:pb-0">
            {index < items.length - 1 && (
              <span className="absolute left-[13px] top-7 h-[calc(100%-1.25rem)] w-px bg-line" aria-hidden="true" />
            )}
            <span
              className={cn(
                "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-4 ring-surface",
                entry.tone,
              )}
            >
              <Icon className="h-3 w-3" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[11.5px] font-semibold leading-snug text-ink">
                {item.summary || entry.label}
              </p>
              <p className="mt-0.5 text-[10px] text-muted">
                <span className="capitalize">{name}</span> · {formatRelative(item.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
