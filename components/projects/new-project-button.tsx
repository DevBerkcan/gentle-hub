"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { ProjectKind } from "@/lib/types";
import { IconPlus } from "@/components/ui/icons";
import { ProjectFormModal } from "@/components/projects/project-form-modal";

export function NewProjectButton({
  kind,
  label,
  variant = "primary",
  className,
  withIcon = true,
}: {
  kind: ProjectKind;
  label: string;
  variant?: "primary" | "mint" | "secondary" | "ghost";
  className?: string;
  withIcon?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "btn",
          variant === "primary" && "btn-primary",
          variant === "mint" && "btn-mint",
          variant === "secondary" && "btn-secondary",
          variant === "ghost" && "btn-ghost",
          className,
        )}
      >
        {withIcon && <IconPlus className="h-4 w-4" />}
        {label}
      </button>

      <ProjectFormModal
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
        defaultKind={kind}
      />
    </>
  );
}
