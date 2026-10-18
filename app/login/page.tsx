import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import { HubLogo } from "@/components/hub/app-header";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Anmelden · GentleHub" };

const ERRORS: Record<string, string> = {
  EXPIRED_TOKEN: "Der Anmeldelink ist abgelaufen. Bitte fordere einen neuen an.",
  INVALID_TOKEN: "Der Anmeldelink ist ungültig oder wurde bereits verwendet.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getUser()) redirect("/");
  const { error } = await searchParams;
  const message = error ? (ERRORS[error] ?? "Die Anmeldung ist fehlgeschlagen. Bitte versuche es erneut.") : null;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <HubLogo />
      </div>
      <div className="w-full max-w-sm rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
        <h1 className="text-xl font-semibold tracking-tight text-fg">Anmelden</h1>
        <p className="mt-1.5 text-sm text-fg-muted">
          Gib deine Gentle-Group-Adresse ein. Du bekommst einen Anmeldelink per E-Mail.
        </p>
        {message && (
          <p role="alert" className="mt-4 rounded-control border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {message}
          </p>
        )}
        <LoginForm />
      </div>
      <p className="mt-6 text-xs text-fg-subtle">Zugang nur für freigegebene Personen.</p>
    </main>
  );
}
