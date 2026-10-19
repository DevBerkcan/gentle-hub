"use client";

import { useRouter } from "next/navigation";
import type { Project, ProjectKind } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { ProjectForm } from "@/components/projects/project-form";

export function ProjectFormModal({
  open,
  onClose,
  mode,
  project,
  defaultKind = "internal",
}: {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  project?: Project;
  defaultKind?: ProjectKind;
}) {
  const router = useRouter();
  const kind = project?.kind ?? defaultKind;

  const title =
    mode === "edit"
      ? kind === "customer"
        ? "Kunde bearbeiten"
        : kind === "project"
          ? "Projekt bearbeiten"
          : "App bearbeiten"
      : kind === "customer"
        ? "Neuer Kunde"
        : kind === "project"
          ? "Neues Projekt"
          : "Neue App";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={
        mode === "edit"
          ? "Ã„nderungen sind sofort fÃ¼r alle freigegebenen Personen sichtbar."
          : kind === "customer"
            ? "Lege ein Kundenprojekt an. ZugÃ¤nge und Repositories kommen danach auf der Detailseite dazu."
            : kind === "project"
              ? "Lege ein eigenes Projekt, Spiel oder Experiment an."
              : "Lege ein Gentle-Group-Produkt oder eine interne App an."
      }
      size="lg"
    >
      <ProjectForm
        mode={mode}
        project={project}
        defaultKind={defaultKind}
        onCancel={onClose}
        onSuccess={(slug) => {
          onClose();
          if (mode === "create") router.push(`/p/${slug}`);
          router.refresh();
        }}
      />
    </Modal>
  );
}
