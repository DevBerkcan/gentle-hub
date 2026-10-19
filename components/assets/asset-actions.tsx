"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAssetAction } from "@/app/actions";
import type { Asset } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { FormError } from "@/components/ui/field";
import { AssetFormModal } from "@/components/assets/asset-form-modal";
import { IconLoader, IconPencil, IconTrash } from "@/components/ui/icons";

export function AssetActions({
  asset,
  projectSlug,
}: {
  asset: Asset;
  projectSlug: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          aria-label={`${asset.label} bearbeiten`}
          title="Bearbeiten"
          className="flex h-8 w-8 items-center justify-center rounded-[8px] text-subtle transition hover:bg-surface-2 hover:text-ink"
        >
          <IconPencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          aria-label={`${asset.label} lÃ¶schen`}
          title="LÃ¶schen"
          className="flex h-8 w-8 items-center justify-center rounded-[8px] text-subtle transition hover:bg-rose-50 hover:text-rose-600"
        >
          <IconTrash className="h-3.5 w-3.5" />
        </button>
      </div>

      <AssetFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        projectSlug={projectSlug}
        asset={asset}
      />
      <DeleteAssetDialog
        asset={asset}
        projectSlug={projectSlug}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}

function DeleteAssetDialog({
  asset,
  projectSlug,
  open,
  onClose,
}: {
  asset: Asset;
  projectSlug: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAssetAction(asset.id);
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
      title={`â€ž${asset.label}â€œ lÃ¶schen?`}
      description={`Dieser Eintrag gehÃ¶rt zum Projekt ${projectSlug}.`}
      dismissible={!pending}
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] leading-relaxed text-rose-900">
          Der Eintrag und das dazugehÃ¶rige Geheimnis werden endgÃ¼ltig entfernt. Das kann nicht
          rÃ¼ckgÃ¤ngig gemacht werden.
        </div>
        <FormError message={error} />
        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={pending}>
            Abbrechen
          </button>
          <button type="button" onClick={remove} className="btn btn-danger" disabled={pending}>
            {pending && <IconLoader className="h-4 w-4" />}
            {pending ? "LÃ¶scht â€¦" : "EndgÃ¼ltig lÃ¶schen"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
