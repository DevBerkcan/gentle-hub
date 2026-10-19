"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProjectAction } from "@/app/actions";
import { cn } from "@/lib/cn";
import { KIND_PATHS } from "@/lib/constants";
import type { Project } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { FormError } from "@/components/ui/field";
import { FavoriteButton } from "@/components/projects/favorite-button";
import { ProjectFormModal } from "@/components/projects/project-form-modal";
import { IconExternal, IconLoader, IconPencil, IconTrash } from "@/components/ui/icons";

export function ProjectActions({ project }: { project: Project }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {project.primaryUrl && (
          <a
            href={project.primaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg"
          >
            Website öffnen
            <IconExternal className="h-4 w-4" />
          </a>
        )}

        <button type="button" onClick={() => setEditOpen(true)} className="btn btn-secondary btn-lg">
          <IconPencil className="h-4 w-4" />
          Bearbeiten
        </button>

        <FavoriteButton
          slug={project.slug}
          initial={project.isFavorite}
          className="h-10 w-10 rounded-[12px] border border-line bg-white shadow-[0_1px_2px_rgb(11_16_42/0.03)]"
        />

        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          aria-label="Projekt löschen"
          title="Projekt löschen"
          className="btn btn-secondary btn-lg btn-icon text-subtle hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
        >
          <IconTrash className="h-4 w-4" />
        </button>
      </div>

      <ProjectFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        mode="edit"
        project={project}
      />

      <DeleteProjectDialog
        project={project}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}

function DeleteProjectDialog({
  project,
  open,
  onClose,
}: {
  project: Project;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteProjectAction(project.slug);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
      router.push(KIND_PATHS[project.kind] ?? "/apps");
      router.refresh();
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`„${project.name}“ löschen?`}
      description="Dieser Vorgang kann nicht rückgängig gemacht werden."
      dismissible={!pending}
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] leading-relaxed text-rose-900">
          Gelöscht werden das Projekt, alle Links, Repositories, Zugänge, Geheimnisse und
          Favoriten. Diese Aktion betrifft alle freigegebenen Personen.
        </div>
        <FormError message={error} />
        <div className={cn("flex items-center justify-end gap-2")}>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={pending}>
            Abbrechen
          </button>
          <button type="button" onClick={remove} className="btn btn-danger" disabled={pending}>
            {pending && <IconLoader className="h-4 w-4" />}
            {pending ? "Löscht …" : "Endgültig löschen"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
