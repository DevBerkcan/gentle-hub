import type { Metadata } from "next";
import { getHealth } from "@/lib/data";
import { requireAuth } from "@/lib/session";
import { API_URL } from "@/lib/constants";
import { formatDateTime, initials } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { CopyButton } from "@/components/ui/copy-button";
import { logoutAction } from "@/app/actions";
import {
  IconActivity,
  IconDatabase,
  IconGlobe,
  IconLock,
  IconLogout,
  IconServer,
  IconShield,
  IconUser,
} from "@/components/ui/icons";

export const metadata: Metadata = { title: "Einstellungen" };

export default async function SettingsPage() {
  const { user } = await requireAuth();
  const health = await getHealth();
  const online = health?.status === "ok";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Konto & System"
        title="Einstellungen"
        description="Konto, Passwort und Verbindung zum Backend verwalten."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6">
          <section className="card p-5 sm:p-6" aria-labelledby="account-heading">
            <h2 id="account-heading" className="text-[14px] font-semibold text-ink">
              Konto
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy font-display text-[18px] font-extrabold text-mint">
                {initials(user.displayName || user.email)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15px] font-bold text-ink">{user.displayName}</p>
                <p className="truncate text-[12px] text-muted">{user.email}</p>
                <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-mint-soft px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <IconShield className="h-3 w-3" />
                  Freigegebener Zugang
                </p>
              </div>
              <form action={logoutAction}>
                <button type="submit" className="btn btn-secondary h-9 text-[12.5px] text-rose-600">
                  <IconLogout className="h-3.5 w-3.5" />
                  Abmelden
                </button>
              </form>
            </div>

            <dl className="mt-5 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-subtle">
                  Letzte Anmeldung
                </dt>
                <dd className="mt-0.5 text-[12px] font-medium text-ink">
                  {formatDateTime(user.lastLoginAt)}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-subtle">
                  Konten mit Zugriff
                </dt>
                <dd className="mt-0.5 text-[12px] font-medium text-ink">
                  medin@gentlegroup.de · berkcan@gentlegroup.de
                </dd>
              </div>
            </dl>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="password-heading">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#f4f2f9] text-muted">
                <IconLock className="h-4 w-4" />
              </span>
              <div>
                <h2 id="password-heading" className="text-[13.5px] font-semibold text-ink">
                  Passwort ändern
                </h2>
                <p className="text-[11px] text-muted">
                  Nach der Änderung werden andere Sitzungen abgemeldet.
                </p>
              </div>
            </div>
            <ChangePasswordForm />
          </section>
        </div>

        <aside className="flex flex-col gap-5">
          <section className="card p-5" aria-labelledby="api-heading">
            <div className="flex items-center justify-between gap-2">
              <h2 id="api-heading" className="text-[12.5px] font-semibold text-ink">
                Backend
              </h2>
              <span
                className={
                  online
                    ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700"
                    : "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700"
                }
              >
                <span
                  className={
                    online
                      ? "h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-dot"
                      : "h-1.5 w-1.5 rounded-full bg-amber-500"
                  }
                />
                {online ? "Verbunden" : "Nicht erreichbar"}
              </span>
            </div>

            <dl className="mt-4 flex flex-col gap-2.5 text-[12px]">
              <Row icon={<IconGlobe className="h-3.5 w-3.5" />} label="API">
                <span className="inline-flex max-w-[12rem] items-center gap-1">
                  <span className="truncate font-mono text-[10.5px]">{API_URL.replace(/^https?:\/\//, "")}</span>
                  <CopyButton value={API_URL} label="API-URL kopieren" />
                </span>
              </Row>
              <Row icon={<IconServer className="h-3.5 w-3.5" />} label="Umgebung">
                {health?.environment ?? "–"}
              </Row>
              <Row icon={<IconDatabase className="h-3.5 w-3.5" />} label="Datenbank">
                {online ? "Verbunden" : "Unbekannt"}
              </Row>
              <Row icon={<IconActivity className="h-3.5 w-3.5" />} label="Projekte">
                {health?.projects ?? "–"}
              </Row>
              <Row icon={<IconShield className="h-3.5 w-3.5" />} label="Schema">
                v{health?.schemaVersion ?? "–"}
              </Row>
            </dl>
            {!online && (
              <p className="mt-3 rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
                Das Backend antwortet gerade nicht. Gespeicherte Daten bleiben erhalten; bitte
                später erneut versuchen.
              </p>
            )}
          </section>

          <section className="card p-4">
            <div className="flex items-center gap-2 text-[11.5px] font-semibold text-ink">
              <IconShield className="h-3.5 w-3.5 text-[#0f766e]" />
              Sicherheit
            </div>
            <ul className="mt-2.5 flex flex-col gap-1.5 text-[10.5px] leading-relaxed text-muted">
              <li>Geheimnisse sind mit AES-256-GCM verschlüsselt.</li>
              <li>Die Anzeige eines Geheimnisses wird protokolliert.</li>
              <li>Sitzungen laufen nach 30 Tagen ab.</li>
              <li>Nur zwei freigegebene Konten haben Zugriff.</li>
            </ul>
          </section>

          <section className="card p-4">
            <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <IconUser className="h-3.5 w-3.5 text-muted" />
              Hilfe
            </h2>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
              Passwort vergessen oder ein Konto freigeben? Wende dich an Medin. Konten werden
              bewusst nicht selbst registriert.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="inline-flex items-center gap-1.5 text-muted">
        {icon}
        {label}
      </dt>
      <dd className="text-right font-medium text-ink">{children}</dd>
    </div>
  );
}
