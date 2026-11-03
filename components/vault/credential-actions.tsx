"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCredentialAction } from "@/app/actions";
import type { Credential } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { FormError } from "@/components/ui/field";
import { CredentialFormModal } from "@/components/vault/credential-form-modal";
import { IconLoader, IconPencil, IconTrash } from "@/components/ui/icons";

export function CredentialActions({ credential }: { credential: Credential }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          aria-label={`${credential.label} bearbeiten`}
          title="Bearbeiten"
          className="flex h-8 w-8 items-center justify-center rounded-[8px] text-subtle transition hover:bg-surface-2 hover:text-ink"
        >
          <IconPencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          aria-label={`${credential.label} löschen`}
          title="Löschen"
          className="flex h-8 w-8 items-center justify-center rounded-[8px] text-subtle transition hover:bg-rose-50 hover:text-rose-600"
        >
          <IconTrash className="h-3.5 w-3.5" />
        </button>
      </div>

      <CredentialFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        credential={credential}
      />
      <DeleteCredentialDialog
        credential={credential}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}

function DeleteCredentialDialog({
  credential,
  open,
  onClose,
}: {
  credential: Credential;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteCredentialAction(credential.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`„${credential.label}“ löschen?`}
      description={credential.username ? `Benutzer: ${credential.username}` : undefined}
      dismissible={!pending}
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] leading-relaxed text-rose-900">
          Der Eintrag und das gespeicherte Passwort werden endgültig entfernt. Das kann nicht
          rückgängig gemacht werden.
        </div>
        <FormError message={error} />
        <div className="flex items-center justify-end gap-2">
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
