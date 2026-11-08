import type { Metadata } from "next";
import { AcceptInvitation } from "@/components/auth/accept-invitation";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export const metadata: Metadata = { title: "Einladung", robots: { index: false, follow: false } };

/** Public: set your password from an invitation link. Without a valid link nothing can be done here. */
export default function InvitationPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[400px]">
        <div className="mb-6">
          <Logo />
        </div>
        <div className="rounded-[14px] border border-line bg-surface p-6 shadow-card sm:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">GentleHub</p>
          <h1 className="mt-2 font-display text-[24px] font-semibold tracking-[-0.03em] text-ink">Willkommen im Team</h1>
          <AcceptInvitation />
        </div>
      </div>
    </main>
  );
}
