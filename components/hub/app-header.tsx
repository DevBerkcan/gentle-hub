import Link from "next/link";

export function HubLogo() {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="grid h-7 w-7 grid-cols-2 gap-[3px] rounded-lg bg-accent p-[7px] shadow-[inset_0_0_0_1px_rgb(1_10_48/0.08)]"
      >
        <span className="rounded-[2px] bg-oxford" />
        <span className="rounded-[2px] bg-oxford/40" />
        <span className="rounded-[2px] bg-oxford/40" />
        <span className="rounded-[2px] bg-oxford" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-fg">GentleHub</span>
    </span>
  );
}

export function AppHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex h-16 max-w-[var(--container-max)] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="focus-ring shrink-0 rounded-md" aria-label="GentleHub Startseite">
          <HubLogo />
        </Link>
        <div className="ml-auto w-full max-w-md">{children}</div>
      </div>
    </header>
  );
}
