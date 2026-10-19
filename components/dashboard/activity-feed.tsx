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
    return { label: "Anmeldung", icon: IconUser, tone: "bg-[#e8efff] text-[#2c58b8]" };
  }
  if (action === "auth.logout") {
    return { label: "Abmeldung", icon: IconLogout, tone: "bg-[#f4f2f9] text-muted" };
  }
  if (action === "auth.password_changed") {
    return { label: "Passwort geändert", icon: IconShield, tone: "bg-[#e6fff7] text-[#007a52]" };
  }
  if (action === "secret.reveal") {
    return { label: "Geheimnis angezeigt", icon: IconLock, tone: "bg-[#ffe8ee] text-[#a52545]" };
  }
  if (action === "project.create") {
    return { label: "Projekt angelegt", icon: IconPlus, tone: "bg-[#e6fff7] text-[#007a52]" };
  }
  if (action === "project.update" || action === "project.notes") {
    return { label: "Projekt bearbeitet", icon: IconPencil, tone: "bg-[#fff3dd] text-[#8d5a00]" };
  }
  if (action === "project.delete") {
    return { label: "Projekt gelöscht", icon: IconTrash, tone: "bg-[#ffe8ee] text-[#a52545]" };
  }
  if (action.startsWith("asset.")) {
    return { label: "Eintrag bearbeitet", icon: IconKey, tone: "bg-[#f2eaff] text-[#6633c7]" };
  }
  return { label: "Aktivität", icon: IconActivity, tone: "bg-[#f4f2f9] text-muted" };
}

export function ActivityFeed({ items }: { items: Activity[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-[14px] border border-dashed border-line-strong bg-surface-2/50 px-4 py-6 text-center text-[12px] text-muted">
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
          <li key={`${item.action}-${item.createdAt}-${index}`} className="relative flex gap-3 pb-4 last:pb-0">
            {index < items.length - 1 && (
              <span className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-line" aria-hidden="true" />
            )}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                entry.tone,
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[12px] font-semibold leading-snug text-ink">
                {item.summary || entry.label}
              </p>
              <p className="mt-0.5 text-[10.5px] text-muted">
                <span className="capitalize">{name}</span> · {formatRelative(item.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
