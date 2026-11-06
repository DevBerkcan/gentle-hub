"use client";

import { cn } from "@/lib/cn";
import { formatRelative, shortUrl } from "@/lib/format";
import type { Credential } from "@/lib/types";
import { CategoryIcon } from "@/components/vault/category-icon";
import { CredentialActions } from "@/components/vault/credential-actions";
import { CredentialSecret } from "@/components/vault/credential-secret";
import { TagChips } from "@/components/vault/tag-input";
import { CopyButton } from "@/components/ui/copy-button";
import { IconExternal } from "@/components/ui/icons";

export function CredentialRow({ credential }: { credential: Credential }) {
  const url = credential.url;
  const isHttp = Boolean(url && (url.startsWith("http://") || url.startsWith("https://")));

  return (
    <article
      id={`credential-${credential.id}`}
      className="scroll-mt-24 rounded-[10px] border border-line bg-surface p-3.5 transition hover:border-line-strong"
    >
      <div className="flex items-start gap-3">
        <CategoryIcon category={credential.category} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-[12.5px] font-semibold leading-snug text-ink">{credential.label}</h3>
            {credential.provider && (
              <span className="inline-flex items-center rounded-[4px] bg-surface-2 px-1.5 py-0.5 text-[9.5px] font-semibold text-muted">
                {credential.provider}
              </span>
            )}
            <span className="text-[10px] text-subtle">geändert {formatRelative(credential.updatedAt)}</span>
          </div>

          {url && (
            <div className="mt-1.5 flex min-w-0 items-center gap-1">
              {isHttp ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-w-0 items-center gap-1 text-[11.5px] font-medium text-accent transition hover:underline"
                  title={url}
                >
                  <span className="truncate">{shortUrl(url)}</span>
                  <IconExternal className="h-3 w-3 shrink-0" />
                </a>
              ) : (
                <span className="truncate font-mono text-[12px] text-muted" title={url}>
                  {url}
                </span>
              )}
              <CopyButton value={url} label="Adresse kopieren" />
            </div>
          )}

          {credential.username && (
            <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[12px] text-muted">
              <span className="shrink-0 text-[10.5px] font-semibold uppercase tracking-wide text-subtle">
                Benutzer
              </span>
              <code className="truncate rounded-[4px] bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-ink">
                {credential.username}
              </code>
              <CopyButton value={credential.username} label="Benutzername kopieren" />
            </div>
          )}

          {credential.hasPassword ? (
            <CredentialSecret credentialId={credential.id} />
          ) : (
            <p className={cn("mt-1.5 text-[11px] font-medium text-amber-700")}>Kein Passwort gespeichert</p>
          )}

          <TagChips tags={credential.tags} />

          {credential.notes && (
            <p className="mt-2 rounded-[8px] border-l-2 border-line-strong bg-surface-2/70 px-2.5 py-1.5 text-[11.5px] leading-relaxed text-muted">
              {credential.notes}
            </p>
          )}
        </div>

        <CredentialActions credential={credential} />
      </div>
    </article>
  );
}
