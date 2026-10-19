import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getHealth } from "@/lib/data";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/ui/logo";
import {
  IconApps,
  IconKey,
  IconLockCheck,
  IconShield,
  IconUsers,
} from "@/components/ui/icons";

export const metadata: Metadata = { title: "Anmelden" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string | string[] }>;
}) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    // Backend unreachable: keep the login form usable.
  }
  if (user) redirect("/");

  const health = await getHealth();
  const backendOnline = health?.status === "ok";
  const params = await searchParams;
  const expired = Boolean(Array.isArray(params.expired) ? params.expired[0] : params.expired);

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-navy p-10 text-white lg:flex lg:flex-col xl:p-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(42rem_30rem_at_85%_5%,rgb(169_122_255/0.3),transparent_60%),radial-gradient(40rem_28rem_at_0%_100%,rgb(1_255_169/0.18),transparent_60%)]" />
        <div className="grid-pattern pointer-events-none absolute inset-0 opacity-60" />

        <div className="relative">
          <Logo dark />
        </div>

        <div className="relative mt-auto max-w-xl pb-4">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-mint/80">
            One Hub. All Applications.
          </p>
          <h1 className="mt-4 text-balance font-display text-[44px] font-extrabold leading-[1.02] tracking-[-0.045em] xl:text-[52px]">
            Alles.
            <br />
            An einem Ort.
          </h1>
          <p className="mt-5 max-w-md text-[14px] leading-relaxed text-white/55">
            Apps, Kundenprojekte, Repositories, Hosting und sensible Zugänge – zentral,
            aufgeräumt und sicher.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <Feature
              icon={<IconApps className="h-4 w-4" />}
              title="Apps & Kunden"
              text="Alle Projekte und Links."
            />
            <Feature
              icon={<IconKey className="h-4 w-4" />}
              title="Zugänge"
              text="Passwörter & Keys."
            />
            <Feature
              icon={<IconShield className="h-4 w-4" />}
              title="Sicher"
              text="AES-256-GCM."
            />
          </div>
        </div>

        <div className="relative mt-12 flex items-center justify-between border-t border-white/[0.08] pt-5 text-[10.5px] text-white/35">
          <span>Gentle Group · Internes Werkzeug</span>
          <span className="inline-flex items-center gap-1.5">
            <IconLockCheck className="h-3.5 w-3.5 text-mint/70" />
            Nur freigegebene Konten
          </span>
        </div>
      </section>

      <section className="flex min-h-dvh items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo />
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-muted ring-1 ring-inset ring-line">
              <IconUsers className="h-3 w-3" />
              2 Konten
            </span>
          </div>

          <div className="rounded-[24px] border border-line bg-white p-6 shadow-float sm:p-8">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-mint-strong" />
              GentleHub
            </p>
            <h2 className="mt-2.5 font-display text-[27px] font-extrabold tracking-[-0.035em] text-ink">
              Anmelden
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Mit deiner Gentle-Group-Adresse und deinem Passwort.
            </p>

            {expired && (
              <div className="mt-4 rounded-[11px] border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12px] leading-relaxed text-amber-800">
                Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.
              </div>
            )}

            <LoginForm backendOnline={backendOnline} />

            <p className="mt-5 border-t border-line pt-4 text-center text-[11px] leading-relaxed text-subtle">
              Passwort vergessen? Wende dich an Medin – Konten werden bewusst nicht selbst
              registriert.
            </p>
          </div>

          <p className="mt-5 text-center text-[10.5px] text-subtle">
            Nur für freigegebene Gentle-Group-Konten · Sitzung 30 Tage
          </p>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[14px] border border-white/[0.08] bg-white/[0.04] p-3.5 backdrop-blur-sm">
      <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-white/[0.07] text-mint">
        {icon}
      </span>
      <p className="mt-2.5 text-[11.5px] font-semibold text-white">{title}</p>
      <p className="mt-0.5 text-[10px] leading-relaxed text-white/40">{text}</p>
    </div>
  );
}
