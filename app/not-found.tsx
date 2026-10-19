import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { IconArrowRight, IconSearch } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-[24px] border border-line bg-white p-7 text-center shadow-float">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#f4f2f9] text-muted">
            <IconSearch className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-[22px] font-extrabold tracking-[-0.03em] text-ink">
            Seite nicht gefunden
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            Dieser Eintrag existiert nicht oder wurde gelöscht.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/" className="btn btn-primary">
              Zum Dashboard
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/search" className="btn btn-secondary">
              Suche öffnen
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
