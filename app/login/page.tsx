import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getHealth } from "@/lib/data";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/ui/logo";
import { IconLockCheck, IconShield } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Anmelden" };

const PRODUCTS = [
  { name: "GentleHub", icon: "/apps/gentlehub.png" },
  { name: "GentleBook", icon: "/apps/gentlebook.png" },
  { name: "GentleSuite", icon: "/apps/gentlesuite.png" },
  { name: "Gentle Access", icon: null },
  { name: "GentleTrack", icon: "/apps/gentletrack.png" },
  { name: "GastroTeam", icon: "/apps/gastroteam.png" },
  { name: "BackReserve", icon: "/apps/backreserve.png" },
  { name: "AngebotPilot", icon: "/apps/angebotpilot.png" },
];

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
    <main className="grid min-h-dvh lg:grid-cols-[1fr_460px]">
      <section className="relative hidden overflow-hidden bg-navy px-10 py-10 text-white lg:flex lg:flex-col xl:px-14">
        <div className="grid-pattern pointer-events-none absolute inset-0 opacity-50" />

        <div className="relative">
          <Logo dark />
        </div>

        <div className="relative mt-16 max-w-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand/80">
            Gentle Group
          </p>
          <h1 className="mt-3 font-display text-[34px] font-semibold leading-[1.1] tracking-[-0.035em] text-white">
            Interner Zugang
          </h1>
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-white/50">
            Alle Produkte, Kundenprojekte, Repositories und Zugänge der Gentle Group an einem
            Ort.
          </p>
        </div>

        <div className="relative mt-10 grid max-w-md grid-cols-2 gap-2">
          {PRODUCTS.map((product) => (
            <div
              key={product.name}
              className="flex items-center gap-2.5 rounded-[7px] border border-white/[0.07] bg-white/[0.03] px-3 py-2.5"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[5px] bg-white">
                {product.icon ? (
                  <Image
                    src={product.icon}
                    alt=""
                    width={64}
                    height={64}
                    unoptimized
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <span className="text-[9px] font-bold tracking-tight text-navy">GA</span>
                )}
              </span>
              <span className="truncate text-[11px] font-medium text-white/65">{product.name}</span>
            </div>
          ))}
        </div>

        <div className="relative mt-auto flex items-center justify-between border-t border-white/[0.08] pt-5 text-[10px] text-white/30">
          <span>Gentle Group · Internes Werkzeug</span>
          <span className="inline-flex items-center gap-1.5">
            <IconLockCheck className="h-3 w-3 text-brand/70" />
            Nur freigegebene Konten
          </span>
        </div>
      </section>

      <section className="flex min-h-dvh items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo />
            <span className="inline-flex items-center gap-1 rounded-[5px] border border-line bg-white px-2 py-1 text-[9.5px] font-semibold text-muted">
              <IconShield className="h-3 w-3" />
              Intern
            </span>
          </div>

          <div className="rounded-[14px] border border-line bg-white p-6 shadow-card sm:p-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">GentleHub</p>
            <h2 className="mt-2 font-display text-[24px] font-semibold tracking-[-0.03em] text-ink">
              Anmelden
            </h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
              Mit deiner Gentle-Group-Adresse und deinem Passwort.
            </p>

            {expired && (
              <div className="mt-4 rounded-[7px] border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11.5px] leading-relaxed text-amber-800">
                Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.
              </div>
            )}

            <LoginForm backendOnline={backendOnline} />

            <p className="mt-5 border-t border-line pt-4 text-center text-[10.5px] leading-relaxed text-subtle">
              Passwort vergessen? Wende dich an Medin. Konten werden nicht selbst registriert.
            </p>
          </div>

          <p className="mt-4 text-center text-[10px] text-subtle">
            Nur für freigegebene Gentle-Group-Konten · Sitzung 30 Tage
          </p>
        </div>
      </section>
    </main>
  );
}
