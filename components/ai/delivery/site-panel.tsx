"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buildSiteAction, publishSiteAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { fontsHref, logoSvg } from "@/lib/site";
import type { SiteState } from "@/lib/types";
import { AgentAvatar } from "@/components/ai/agent-avatar";
import { CopyButton } from "@/components/ui/copy-button";
import { IconExternal } from "@/components/ui/icons";
import { agentName } from "@/lib/agent-personas";

/** Lara builds branding and the page from the building kit; Tolga keeps the preview link online. */
export function SitePanel({ vorgangId, site }: { vorgangId: string; site: SiteState }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const building = site.status === "building";

  useEffect(() => {
    const timer = setTimeout(() => setOrigin(window.location.origin), 0);
    return () => clearTimeout(timer);
  }, []);

  // Only our own data is refreshed while Lara works.
  useEffect(() => {
    if (!building) return;
    const timer = setInterval(() => router.refresh(), 5_000);
    return () => clearInterval(timer);
  }, [building, router]);

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error ?? "Fehlgeschlagen.");
      router.refresh();
    });
  }

  const content = site.content;
  const check = site.brandCheck;
  const previewPath = site.previewToken ? `/vorschau/${site.previewToken}` : null;
  const previewUrl = previewPath && origin ? `${origin}${previewPath}` : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <AgentAvatar agentId="site-builder" size={40} state={building ? "working" : site.status === "failed" ? "alert" : "idle"} title={`${agentName("site-builder")} · Branding & Website`} />
        <div className="min-w-0 flex-1 text-[11.5px] text-muted">
          {site.status === "none" && `${agentName("site-builder")} prüft, ob es die Marke schon gibt, entwirft sonst ein Branding und schreibt die ganze Seite. ${agentName("deployment")} stellt sie danach als Vorschau-Link online.`}
          {building && `${agentName("site-builder")} arbeitet: Markenprüfung, Branding, Texte …`}
          {site.status === "failed" && <span className="text-rose-600">{site.lastError ?? "Fehlgeschlagen."}</span>}
          {site.status === "ready" && `Fertig${site.updatedAt ? ` · ${formatDateTime(site.updatedAt)}` : ""}.`}
        </div>
        <button type="button" className="btn btn-primary" disabled={pending || building} onClick={() => run(() => buildSiteAction(vorgangId))}>
          {site.status === "none" ? "Website bauen" : building ? "Läuft…" : "Neu bauen"}
        </button>
      </div>
      {error && <p className="text-[11.5px] text-rose-600">{error}</p>}

      {check && (
        <div className="card flex flex-col gap-2 p-3 text-[11.5px]">
          <h3 className="text-[10px] font-semibold uppercase tracking-wide text-subtle">Markenprüfung</h3>
          {check.matches.length > 0 ? (
            <ul className="flex flex-col gap-0.5">
              {check.matches.map((match, index) => (
                <li key={index}>
                  Bei Google gefunden: <strong>{match.name}</strong>
                  {match.address && <span className="text-muted"> · {match.address}</span>}
                  {match.website && (
                    <a href={match.website} target="_blank" rel="noreferrer" className="ml-1 text-accent hover:underline">
                      Website
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">{check.placesChecked ? "Bei Google kein gleichnamiges Unternehmen in der Stadt gefunden." : "Google wurde nicht durchsucht (kein Name oder keine Stadt angegeben)."}</p>
          )}
          {check.existing && (
            <div className="flex flex-wrap items-center gap-2">
              <span>Vorhandenes Branding:</span>
              {[check.existing.themeColor, ...check.existing.colors].filter(Boolean).slice(0, 5).map((color, index) => (
                <span key={index} title={color!} className="h-4 w-4 rounded border border-line" style={{ background: color! }} />
              ))}
              {check.existing.fonts.length > 0 && <span className="text-muted">Schriften: {check.existing.fonts.join(", ")}</span>}
            </div>
          )}
          {check.domains.length > 0 && (
            <p className="flex flex-wrap gap-x-3">
              {check.domains.map((domain) => (
                <span key={domain.domain}>
                  {domain.domain}:{" "}
                  <strong className={domain.available ? "text-emerald-700" : domain.available === false ? "text-rose-600" : "text-muted"}>
                    {domain.available ? "frei" : domain.available === false ? "vergeben" : "unbekannt"}
                  </strong>
                </span>
              ))}
            </p>
          )}
          <a href={check.trademarkSearchUrl} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-1 text-accent hover:underline">
            Marke beim DPMA prüfen <IconExternal className="h-3 w-3" />
          </a>
          {check.notes.map((note, index) => (
            <p key={index} className="text-muted">{note}</p>
          ))}
        </div>
      )}

      {content && (
        <div className="card flex flex-col gap-3 p-3 text-[11.5px]">
          <link rel="stylesheet" href={fontsHref(content.branding.fonts)} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-subtle">
              Branding {content.brandingSource === "existing" ? "(vom Kunden übernommen)" : "(neu entworfen)"}
            </h3>
            <button
              type="button"
              className="btn btn-ghost h-7 px-2 text-[11px]"
              onClick={() => {
                const blob = new Blob([logoSvg(content.branding)], { type: "image/svg+xml" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `logo-${content.branding.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.svg`;
                link.click();
                URL.revokeObjectURL(link.href);
              }}
            >
              Logo als SVG
            </button>
          </div>
          <div className="rounded-lg p-3" style={{ background: content.branding.palette.background }}>
            <span className="block h-10 [&>svg]:h-10 [&>svg]:w-auto" dangerouslySetInnerHTML={{ __html: logoSvg(content.branding) }} />
            {content.branding.slogan && (
              <p className="mt-1 text-[13px] italic" style={{ color: content.branding.palette.text, fontFamily: `'${content.branding.fonts.heading}'` }}>
                {content.branding.slogan}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(content.branding.palette).map(([key, color]) => (
              <span key={key} className="flex items-center gap-1.5">
                <span className="h-5 w-5 rounded border border-line" style={{ background: color }} />
                <span className="text-muted">{key}</span> <code className="text-[10px]">{color}</code>
              </span>
            ))}
          </div>
          <p>
            Schriften: <strong>{content.branding.fonts.heading}</strong> / {content.branding.fonts.body}
            {content.branding.tone && <span className="text-muted"> · Ansprache „{content.branding.tone.address}“, {content.branding.tone.style}</span>}
          </p>
          {(content.nameSuggestions ?? []).length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-wide text-subtle">Namensvorschläge</h4>
              <ul className="mt-1 flex flex-col gap-0.5">
                {content.nameSuggestions!.map((suggestion) => (
                  <li key={suggestion.name}>
                    <strong>{suggestion.name}</strong>
                    {suggestion.domain && (
                      <span className={cn("ml-1", suggestion.domainAvailable ? "text-emerald-700" : "text-rose-600")}>
                        ({suggestion.domain} {suggestion.domainAvailable ? "frei" : suggestion.domainAvailable === false ? "vergeben" : "?"})
                      </span>
                    )}
                    {suggestion.reason && <span className="text-muted"> · {suggestion.reason}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(content.notes ?? []).length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-wide text-subtle">Braucht die Kundin noch</h4>
              <ul className="mt-1 list-disc pl-4">
                {content.notes!.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {content && (
        <div className="card flex flex-col gap-2 p-3 text-[11.5px]">
          <div className="flex flex-wrap items-center gap-2">
            <AgentAvatar agentId="deployment" size={30} state={site.isPublished ? "idle" : "off"} title={`${agentName("deployment")} · Deployment`} />
            <p className="min-w-0 flex-1">
              {site.isPublished ? (
                <>
                  <strong>Vorschau online</strong>
                  <span className="text-muted"> · nur mit Link erreichbar, nicht in Google</span>
                </>
              ) : (
                <strong className="text-muted">Vorschau offline</strong>
              )}
            </p>
            <button
              type="button"
              className="btn btn-secondary h-7 px-2 text-[11px]"
              disabled={pending}
              onClick={() => run(() => publishSiteAction(vorgangId, !site.isPublished))}
            >
              {site.isPublished ? "Offline nehmen" : "Online stellen"}
            </button>
          </div>
          {previewUrl && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded bg-surface-2 px-2 py-1 text-[10.5px]">{previewUrl}</code>
                <CopyButton value={previewUrl} label="Link kopieren" showLabel />
                <a href={previewPath!} target="_blank" rel="noreferrer" className="btn btn-ghost h-7 px-2 text-[11px]">
                  Öffnen <IconExternal className="ml-1 h-3 w-3" />
                </a>
              </div>
              <iframe
                src={previewPath!}
                title="Vorschau der Website"
                className="h-[560px] w-full rounded-lg border border-line bg-white"
                sandbox="allow-same-origin"
                loading="lazy"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
