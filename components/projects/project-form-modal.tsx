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
        : "App bearbeiten"
      : kind === "customer"
        ? "Neuer Kunde"
        : "Neue App";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={
        mode === "edit"
          ? "Änderungen sind sofort für alle freigegebenen Personen sichtbar."
          : kind === "customer"
            ? "Lege ein Kundenprojekt an. Zugänge und Repositories kommen danach auf der Detailseite dazu."
            : "Lege eine eigene App oder Website an. Alles Weitere ergänzt du auf der Detailseite."
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
