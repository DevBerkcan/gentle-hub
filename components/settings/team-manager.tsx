"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inviteMemberAction, reinviteMemberAction, updateMemberAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import type { FieldErrors } from "@/lib/action-types";
import type { TeamInvite, TeamMember, TeamMemberStatus } from "@/lib/types";
import { FormError } from "@/components/ui/field";
import { IconCheck, IconCopy, IconLoader, IconPlus } from "@/components/ui/icons";

const STATUS: Record<TeamMemberStatus, { label: string; tone: string }> = {
  owner: { label: "Inhaber", tone: "bg-navy text-mint" },
  active: { label: "Aktiv", tone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200" },
  invited: { label: "Eingeladen", tone: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200" },
  invite_expired: { label: "Link abgelaufen", tone: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200" },
  deactivated: { label: "Deaktiviert", tone: "bg-surface-2 text-muted" },
};

/** Owners invite team members by link; the member chooses her own password. */
export function TeamManager({ members }: { members: TeamMember[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<TeamInvite | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function showInvite(result: TeamInvite) {
    setInvite(result);
    setCopied(false);
    router.refresh();
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setErrors({});
    startTransition(async () => {
      const result = await inviteMemberAction({ email: email.trim(), displayName: displayName.trim() });
      if (!result.ok) {
        setError(result.error);
        setErrors(result.errors ?? {});
        return;
      }
      setEmail("");
      setDisplayName("");
      showInvite(result.invite);
    });
  }

  function reinvite(member: TeamMember) {
    setError(null);
    startTransition(async () => {
      const result = await reinviteMemberAction(member.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      showInvite(result.invite);
    });
  }

  function toggleActive(member: TeamMember) {
    if (member.isActive && !window.confirm(`${member.displayName} deaktivieren? Alle Sitzungen und offenen Links enden sofort.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await updateMemberAction(member.id, { isActive: !member.isActive });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  async function copy() {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite.inviteUrl);
      setCopied(true);
    } catch {
      setError("Kopieren nicht möglich. Bitte den Link markieren und kopieren.");
    }
  }

  return (
    <section className="card p-5 sm:p-6" aria-labelledby="team-heading">
      <h2 id="team-heading" className="text-[14px] font-semibold text-ink">
        Team
      </h2>
      <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
        Lade Mitarbeiter mit Name und E-Mail ein. Du bekommst einen Link (7 Tage gültig, einmal nutzbar), über den sie ihr Passwort selbst
        festlegen. Hat jemand das Passwort vergessen: „Neuer Link“.
      </p>
      <FormError message={error} />

      {invite && (
        <div className="mt-4 flex flex-col gap-2 rounded-[10px] border border-emerald-300 bg-emerald-50/70 p-3 dark:border-emerald-500/40 dark:bg-emerald-500/10">
          <p className="text-[12px] font-semibold text-ink">
            Link für {invite.member.displayName} ({invite.member.email})
          </p>
          <div className="flex flex-wrap gap-2">
            <input className="input min-w-0 flex-1 font-mono text-[11px]" readOnly value={invite.inviteUrl} aria-label="Einladungslink" onFocus={(e) => e.currentTarget.select()} />
            <button type="button" className="btn btn-primary h-9" onClick={copy}>
              {copied ? <IconCheck className="h-3.5 w-3.5" /> : <IconCopy className="h-3.5 w-3.5" />}
              {copied ? "Kopiert" : "Link kopieren"}
            </button>
          </div>
          <p className="text-[10.5px] text-muted">
            Gültig bis {formatDateTime(invite.expiresAt)}. Schick den Link nur an diese Person, z. B. per WhatsApp oder Mail. Er wird hier nur
            einmal angezeigt; bei Bedarf einfach einen neuen erstellen.
          </p>
        </div>
      )}

      <ul className="mt-4 flex flex-col divide-y divide-line">
        {members.map((member) => (
          <li key={member.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-ink">{member.displayName}</p>
              <p className="truncate text-[11px] text-muted">
                {member.email}
                {member.lastLoginAt && ` · zuletzt ${formatDateTime(member.lastLoginAt)}`}
                {member.status === "invited" && member.inviteExpiresAt && ` · Link bis ${formatDateTime(member.inviteExpiresAt)}`}
              </p>
            </div>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", STATUS[member.status].tone)}>{STATUS[member.status].label}</span>
            {!member.isOwner && (
              <div className="flex gap-1">
                {member.isActive && (
                  <button type="button" className="btn btn-ghost h-8 px-2 text-[11.5px]" disabled={pending} onClick={() => reinvite(member)}>
                    Neuer Link
                  </button>
                )}
                <button
                  type="button"
                  className={cn("btn btn-ghost h-8 px-2 text-[11.5px]", member.isActive && "text-rose-600")}
                  disabled={pending}
                  onClick={() => toggleActive(member)}
                >
                  {member.isActive ? "Deaktivieren" : "Wieder aktivieren"}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="mt-4 grid gap-2 border-t border-line pt-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <label className="flex flex-col gap-1">
          <span className="label">Name</span>
          <input className="input" value={displayName} maxLength={120} placeholder="z. B. Alanur" aria-invalid={Boolean(errors.displayName)} onChange={(e) => setDisplayName(e.target.value)} />
          {errors.displayName && <span className="text-[10.5px] text-rose-600">{errors.displayName}</span>}
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">E-Mail</span>
          <input className="input" type="email" value={email} maxLength={255} placeholder="name@gentlegroup.de" aria-invalid={Boolean(errors.email)} onChange={(e) => setEmail(e.target.value)} />
          {errors.email && <span className="text-[10.5px] text-rose-600">{errors.email}</span>}
        </label>
        <button type="submit" className="btn btn-primary h-9 self-end" disabled={pending || !email || !displayName}>
          {pending ? <IconLoader className="h-3.5 w-3.5" /> : <IconPlus className="h-3.5 w-3.5" />}
          Einladen
        </button>
      </form>
    </section>
  );
}
