import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getProjectData } from "@/lib/data";
import { requireAuth } from "@/lib/session";
import { accentOf, ASSET_GROUPS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { formatDate, formatDateTime, formatRelative } from "@/lib/format";
import { AssetSection } from "@/components/assets/asset-section";
import { NotesEditor } from "@/components/notes/notes-editor";
import { ProjectActions } from "@/components/projects/project-actions";
import { ProjectIcon } from "@/components/ui/project-icon";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import {
  IconCalendar,
  IconChevronRight,
  IconDatabase,
  IconGlobe,
  IconKey,
  IconLink,
  IconLock,
  IconMail,
  IconPhone,
  IconRepo,
  IconShield,
  IconUser,
} from "@/components/ui/icons";

type PageParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { project } = await getProjectData(slug);
    return { title: project.name, description: project.description };
  } catch {
    return { title: "Projekt" };
  }
}

export default async function ProjectPage({ params }: PageParams) {
  const { slug } = await params;
  await requireAuth();

  let detail;
  try {
    detail = await getProjectData(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const { project, assets } = detail;
  const tone = accentOf(project.accent);
  const isCustomer = project.kind === "customer";

  const counts = {
    links: assets.filter((asset) => asset.type === "link").length,
    repos: assets.filter((asset) => asset.type === "repo").length,
    accounts: assets.filter((asset) => asset.type === "account").length,
    secrets: assets.filter((asset) => asset.hasSecret).length,
  };

  return (
    <div className="flex flex-col gap-7">
      <nav aria-label="Brotkrumen" className="flex items-center gap-1.5 text-[11.5px]">
        <Link
          href={isCustomer ? "/customers" : "/apps"}
          className="font-medium text-muted transition hover:text-ink"
        >
          {isCustomer ? "Kundenprojekte" : "Alle Apps"}
        </Link>
        <IconChevronRight className="h-3 w-3 text-subtle" />
        <span className="truncate font-semibold text-ink">{project.name}</span>
      </nav>

      <header className="card relative overflow-hidden p-5 sm:p-6">
        <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-[3px]", tone.dot)} />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <ProjectIcon
            name={project.name}
            icon={project.icon}
            accent={project.accent}
            size="xl"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f2f9] px-2.5 py-1 text-[10.5px] font-semibold text-muted">
                {isCustomer ? <IconUser className="h-3 w-3" /> : <IconGlobe className="h-3 w-3" />}
                {isCustomer ? "Kundenprojekt" : "Gentle Group"}
              </span>
              <StatusBadge status={project.status} />
              {project.isFavorite && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10.5px] font-semibold text-amber-700">
                  ★ Favorit
                </span>
              )}
            </div>

            <h1 className="mt-2.5 text-balance font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.035em] text-ink sm:text-[30px]">
              {project.name}
            </h1>

            {project.description && (
              <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted">
                {project.description}
              </p>
            )}

            {project.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            )}
          </div>

          <div className="shrink-0 lg:max-w-md">
            <ProjectActions project={project} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 border-t border-line pt-4 sm:grid-cols-4">
          <HeaderStat icon={<IconLink className="h-3.5 w-3.5" />} label="Links" value={counts.links} />
          <HeaderStat icon={<IconRepo className="h-3.5 w-3.5" />} label="Repos" value={counts.repos} />
          <HeaderStat icon={<IconKey className="h-3.5 w-3.5" />} label="Konten" value={counts.accounts} />
          <HeaderStat icon={<IconLock className="h-3.5 w-3.5" />} label="Geheimnisse" value={counts.secrets} />
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="flex flex-col gap-7">
          <div id="assets" className="flex scroll-mt-24 flex-col gap-6">
            {ASSET_GROUPS.map((group) => (
              <AssetSection
                key={group.key}
                projectSlug={project.slug}
                group={group}
                assets={assets.filter((asset) =>
                  (group.types as readonly string[]).includes(asset.type),
                )}
              />
            ))}
          </div>

          <NotesEditor
            projectSlug={project.slug}
            initialNotes={project.notes}
            meta={
              project.updatedBy
                ? `Zuletzt geändert von ${project.updatedBy.split("@")[0]} · ${formatRelative(project.updatedAt)}`
                : `Zuletzt geändert ${formatRelative(project.updatedAt)}`
            }
          />
        </div>

        <aside className="flex flex-col gap-5">
          {isCustomer && (
            <section className="card p-5" aria-labelledby="customer-heading">
              <h2 id="customer-heading" className="font-display text-[14px] font-bold text-ink">
                Kundenkontakt
              </h2>
              <div className="mt-3 flex flex-col gap-2.5">
                {project.customer?.contactName && (
                  <DetailRow icon={<IconUser className="h-3.5 w-3.5" />} label="Ansprechpartner">
                    {project.customer.contactName}
                  </DetailRow>
                )}
                {project.customer?.contactEmail && (
                  <DetailRow icon={<IconMail className="h-3.5 w-3.5" />} label="E-Mail">
                    <a
                      href={`mailto:${project.customer.contactEmail}`}
                      className="break-all font-medium text-[#0b6b4f] hover:underline"
                    >
                      {project.customer.contactEmail}
                    </a>
                  </DetailRow>
                )}
                {project.customer?.contactPhone && (
                  <DetailRow icon={<IconPhone className="h-3.5 w-3.5" />} label="Telefon">
                    <a
                      href={`tel:${project.customer.contactPhone}`}
                      className="font-medium text-[#0b6b4f] hover:underline"
                    >
                      {project.customer.contactPhone}
                    </a>
                  </DetailRow>
                )}
                {project.customer?.companyWebsite && (
                  <DetailRow icon={<IconGlobe className="h-3.5 w-3.5" />} label="Website">
                    <a
                      href={project.customer.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all font-medium text-[#0b6b4f] hover:underline"
                    >
                      {project.customer.companyWebsite.replace(/^https?:\/\//, "")}
                    </a>
                  </DetailRow>
                )}

                {!project.customer?.contactName &&
                  !project.customer?.contactEmail &&
                  !project.customer?.contactPhone &&
                  !project.customer?.companyWebsite && (
                    <p className="rounded-[10px] border border-dashed border-line-strong bg-surface-2/60 px-3 py-3 text-[12px] leading-relaxed text-muted">
                      Noch keine Kontaktdaten hinterlegt. Über „Bearbeiten“ oben ergänzen.
                    </p>
                  )}
              </div>
            </section>
          )}

          <section className="card p-5" aria-labelledby="meta-heading">
            <h2 id="meta-heading" className="font-display text-[14px] font-bold text-ink">
              Details
            </h2>
            <dl className="mt-3 flex flex-col gap-2.5 text-[12px]">
              <div className="flex items-start justify-between gap-3">
                <dt className="inline-flex items-center gap-1.5 text-muted">
                  <IconCalendar className="h-3.5 w-3.5" />
                  Erstellt
                </dt>
                <dd className="text-right font-medium text-ink">{formatDate(project.createdAt)}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="inline-flex items-center gap-1.5 text-muted">
                  <IconCalendar className="h-3.5 w-3.5" />
                  Aktualisiert
                </dt>
                <dd className="text-right font-medium text-ink">{formatDateTime(project.updatedAt)}</dd>
              </div>
              {project.updatedBy && (
                <div className="flex items-start justify-between gap-3">
                  <dt className="inline-flex items-center gap-1.5 text-muted">
                    <IconUser className="h-3.5 w-3.5" />
                    Von
                  </dt>
                  <dd className="max-w-[12rem] truncate text-right font-medium capitalize text-ink">
                    {project.updatedBy.split("@")[0]}
                  </dd>
                </div>
              )}
              <div className="flex items-start justify-between gap-3">
                <dt className="inline-flex items-center gap-1.5 text-muted">
                  <IconRepo className="h-3.5 w-3.5" />
                  Projekt-ID
                </dt>
                <dd className="flex items-center gap-0.5 text-right">
                  <code className="max-w-[8.5rem] truncate font-mono text-[10.5px] text-ink">
                    {project.id}
                  </code>
                  <CopyButton value={project.id} label="Projekt-ID kopieren" />
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[18px] border border-emerald-200/70 bg-gradient-to-br from-[#effff9] to-[#f7f5ff] p-5">
            <div className="flex items-center gap-2 text-[12.5px] font-bold text-emerald-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-emerald-700 shadow-[0_1px_2px_rgb(11_16_42/0.06)]">
                <IconShield className="h-3.5 w-3.5" />
              </span>
              Sicher gespeichert
            </div>
            <p className="mt-2.5 text-[11.5px] leading-relaxed text-emerald-900/70">
              Passwörter, Verbindungsdaten und Publish-Profile werden mit AES-256-GCM
              verschlüsselt. Die Anzeige eines Geheimnisses wird protokolliert.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10.5px] font-semibold text-emerald-800">
              <IconLock className="h-3 w-3" />
              Nur für freigegebene Gentle-Group-Konten
            </div>
          </section>

          {assets.some((asset) => asset.type === "database") && (
            <section className="card p-5" aria-labelledby="db-heading">
              <h2 id="db-heading" className="flex items-center gap-2 font-display text-[14px] font-bold text-ink">
                <IconDatabase className="h-4 w-4 text-muted" />
                Datenbanken
              </h2>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
                Verbindungsdaten und Zugänge findest du oben unter „Hosting & Datenbanken“.
              </p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function HeaderStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-[12px] bg-surface-2/60 px-3 py-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-white text-muted ring-1 ring-inset ring-line">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-[16px] font-extrabold leading-none tabular-nums text-ink">
          {value}
        </span>
        <span className="mt-1 block text-[9.5px] font-semibold uppercase tracking-wide text-subtle">
          {label}
        </span>
      </span>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-subtle">{icon}</span>
      <div className="min-w-0">
        <p className="text-[9.5px] font-semibold uppercase tracking-wide text-subtle">{label}</p>
        <div className="mt-0.5 text-[12px] text-ink">{children}</div>
      </div>
    </div>
  );
}
