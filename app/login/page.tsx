import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import { HubLogo } from "@/components/hub/app-header";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Anmelden · GentleHub" };

export default async function LoginPage() {
  if (await getUser()) redirect("/");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <HubLogo />
      </div>
      <div className="w-full max-w-sm rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
        <h1 className="text-xl font-semibold tracking-tight text-fg">Anmelden</h1>
        <p className="mt-1.5 text-sm text-fg-muted">Mit deiner Gentle-Group-Adresse und deinem Passwort.</p>
        <LoginForm />
      </div>
      <p className="mt-6 text-xs text-fg-subtle">Zugang nur für freigegebene Personen.</p>
    </main>
  );
}
