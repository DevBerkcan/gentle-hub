"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { ASSET_TYPE_LABELS, SUBTYPE_LABELS } from "@/lib/constants";
import { shortUrl } from "@/lib/format";
import type { Asset, AssetType } from "@/lib/types";
import { AssetTypeIcon } from "@/components/assets/asset-type-icon";
import { AssetActions } from "@/components/assets/asset-actions";
import { AssetFormModal } from "@/components/assets/asset-form-modal";
import { SecretValue } from "@/components/assets/secret-value";
import { CopyButton } from "@/components/ui/copy-button";
import { EnvironmentBadge } from "@/components/ui/badge";
import {
  IconExternal,
  IconKey,
  IconLink,
  IconLock,
  IconPlus,
  IconRepo,
  IconServer,
} from "@/components/ui/icons";

type AssetGroup = {
  key: string;
  title: string;
  description: string;
  types: readonly string[];
};

const GROUP_ICONS = {
  links: IconLink,
  repos: IconRepo,
  infra: IconServer,
  accounts: IconKey,
  secrets: IconLock,
} as const;

export function AssetSection({
  projectSlug,
  group,
  assets,
}: {
  projectSlug: string;
  group: AssetGroup;
  assets: Asset[];
}) {
  const [addOpen, setAddOpen] = useState(false);
  const Icon = GROUP_ICONS[group.key as keyof typeof GROUP_ICONS] ?? IconLink;
  const defaultType = (group.types[0] ?? "link") as AssetType;

  return (
    <section aria-labelledby={`asset-group-${group.key}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-white text-muted ring-1 ring-inset ring-line">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2
              id={`asset-group-${group.key}`}
              className="flex items-center gap-2 font-display text-[14.5px] font-bold tracking-[-0.01em] text-ink"
            >
              {group.title}
              <span className="rounded-full bg-[#f3f0f8] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted">
                {assets.length}
              </span>
            </h2>
            <p className="truncate text-[11px] text-muted">{group.description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          aria-label={`${group.title}: Eintrag hinzufügen`}
          title="Eintrag hinzufügen"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-line bg-white text-muted shadow-[0_1px_2px_rgb(11_16_42/0.03)] transition hover:border-line-strong hover:text-ink"
        >
          <IconPlus className="h-4 w-4" />
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-[14px] border border-dashed border-line-strong bg-surface-2/50 px-4 py-3">
          <p className="text-[12px] text-muted">Noch keine Einträge in dieser Kategorie.</p>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="shrink-0 text-[12px] font-semibold text-ink transition hover:text-emerald-700"
          >
            + Hinzufügen
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {assets.map((asset) => (
            <AssetRow key={asset.id} asset={asset} projectSlug={projectSlug} />
          ))}
        </div>
      )}

      <AssetFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        projectSlug={projectSlug}
        defaultType={defaultType}
      />
    </section>
  );
}

function AssetRow({ asset, projectSlug }: { asset: Asset; projectSlug: string }) {
  const isHttp = asset.url?.startsWith("http://") || asset.url?.startsWith("https://");
  const secretLabel =
    asset.type === "secret"
      ? "Geheimer Wert"
      : asset.type === "database"
        ? "Datenbank-Passwort"
        : asset.type === "hosting"
          ? "Hosting-Passwort"
          : "Passwort";

  return (
    <article
      id={`asset-${asset.id}`}
      className={cn(
        "group scroll-mt-24 rounded-[16px] border border-line bg-white p-4 shadow-[0_1px_2px_rgb(11_16_42/0.03)] transition",
        "hover:border-line-strong hover:shadow-[0_8px_24px_-18px_rgb(11_16_42/0.24)]",
      )}
    >
      <div className="flex items-start gap-3">
        <AssetTypeIcon type={asset.type} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-[13.5px] font-semibold leading-snug text-ink">{asset.label}</h3>
            {asset.provider && (
              <span className="inline-flex items-center rounded-full bg-[#f4f2f9] px-2 py-0.5 text-[10px] font-semibold text-muted">
                {asset.provider}
              </span>
            )}
            <EnvironmentBadge environment={asset.environment} />
            {asset.type === "secret" && asset.subtype && (
              <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                {SUBTYPE_LABELS[asset.subtype] ?? asset.subtype}
              </span>
            )}
            <span className="sr-only">{ASSET_TYPE_LABELS[asset.type]}</span>
          </div>

          {asset.url && (
            <div className="mt-1.5 flex min-w-0 items-center gap-1">
              {isHttp ? (
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-w-0 items-center gap-1 text-[12px] font-medium text-[#0b6b4f] transition hover:text-emerald-700 hover:underline"
                  title={asset.url}
                >
                  <span className="truncate">{shortUrl(asset.url)}</span>
                  <IconExternal className="h-3 w-3 shrink-0" />
                </a>
              ) : (
                <span className="truncate font-mono text-[12px] text-muted" title={asset.url}>
                  {asset.url}
                </span>
              )}
              <CopyButton value={asset.url} label="Adresse kopieren" />
            </div>
          )}

          {asset.username && (
            <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[12px] text-muted">
              <span className="shrink-0 text-[10.5px] font-semibold uppercase tracking-wide text-subtle">
                Benutzer
              </span>
              <code className="truncate rounded bg-[#f7f5fb] px-1.5 py-0.5 font-mono text-[11.5px] text-ink">
                {asset.username}
              </code>
              <CopyButton value={asset.username} label="Benutzername kopieren" />
            </div>
          )}

          {asset.details && (
            <p className="mt-2 whitespace-pre-line text-[12px] leading-relaxed text-muted">
              {asset.details}
            </p>
          )}

          {asset.hasSecret && <SecretValue assetId={asset.id} label={secretLabel} />}

          {asset.notes && (
            <p className="mt-2 rounded-[8px] border-l-2 border-line-strong bg-surface-2/70 px-2.5 py-1.5 text-[11.5px] leading-relaxed text-muted">
              {asset.notes}
            </p>
          )}
        </div>

        <AssetActions asset={asset} projectSlug={projectSlug} />
      </div>
    </article>
  );
}
