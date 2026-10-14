"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-line bg-surface px-1.5 font-sans text-[11px] font-medium text-fg-subtle",
        className
      )}
    >
      {children}
    </kbd>
  );
}

const noopSubscribe = () => () => {};

/** True on Apple platforms, where the shortcut modifier is ⌘ instead of Ctrl. False during SSR. */
export function useIsApplePlatform(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent),
    () => false
  );
}

/** Platform-aware "⌘ K" / "Strg K" hint. */
export function ShortcutHint({ className }: { className?: string }) {
  const isApple = useIsApplePlatform();
  return (
    <span className={cn("flex items-center gap-1", className)} aria-hidden="true">
      <Kbd>{isApple ? "⌘" : "Strg"}</Kbd>
      <Kbd>K</Kbd>
    </span>
  );
}
