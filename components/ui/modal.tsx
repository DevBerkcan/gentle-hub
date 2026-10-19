"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/cn";
import { IconX } from "@/components/ui/icons";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg";
  dismissible?: boolean;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  dismissible = true,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const dialog = ref.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      if (!dismissible) {
        event.preventDefault();
      }
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [open, dismissible]);

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className="dialog-sheet"
      onClose={onClose}
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[22px] border border-white/60 bg-surface shadow-float",
          size === "lg" ? "sm:max-w-3xl" : "sm:max-w-xl",
        )}
      >
        <div className="flex items-start gap-4 border-b border-line px-5 py-5 sm:px-6">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="font-display text-lg font-bold tracking-tight text-ink">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-[13px] leading-relaxed text-muted">
                {description}
              </p>
            )}
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Schließen"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-muted transition hover:bg-[#f0edf6] hover:text-ink"
            >
              <IconX className="h-4.5 w-4.5" />
            </button>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-2/80 px-5 py-4 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}
