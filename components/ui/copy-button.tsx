"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { IconCheck, IconCopy } from "@/components/ui/icons";

export function CopyButton({
  value,
  label = "Kopieren",
  className,
  showLabel = false,
}: {
  value: string;
  label?: string;
  className?: string;
  showLabel?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Kopiert" : label}
      title={copied ? "Kopiert" : label}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-[9px] px-2 text-[12px] font-medium text-muted transition hover:bg-surface-2 hover:text-ink",
        showLabel && "px-2.5",
        className,
      )}
    >
      {copied ? <IconCheck className="h-3.5 w-3.5 text-emerald-600" /> : <IconCopy className="h-3.5 w-3.5" />}
      {showLabel && <span>{copied ? "Kopiert" : label}</span>}
    </button>
  );
}
