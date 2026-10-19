"use client";

import { useRouter } from "next/navigation";
import type { Asset, AssetType } from "@/lib/types";
import { ASSET_TYPE_LABELS } from "@/lib/constants";
import { Modal } from "@/components/ui/modal";
import { AssetForm } from "@/components/assets/asset-form";

export function AssetFormModal({
  open,
  onClose,
  projectSlug,
  asset,
  defaultType = "link",
}: {
  open: boolean;
  onClose: () => void;
  projectSlug: string;
  asset?: Asset;
  defaultType?: AssetType;
}) {
  const router = useRouter();
  const type = asset?.type ?? defaultType;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={asset ? "Eintrag bearbeiten" : "Neuer Eintrag"}
      description={
        asset
          ? "Ã„nderungen werden sofort gespeichert. Leere Passwortfelder lassen den bestehenden Wert unverÃ¤ndert."
          : `${ASSET_TYPE_LABELS[type]} hinzufÃ¼gen â€“ ZugÃ¤nge werden verschlÃ¼sselt gespeichert.`
      }
      size="lg"
    >
      <AssetForm
        mode={asset ? "edit" : "create"}
        projectSlug={projectSlug}
        asset={asset}
        defaultType={defaultType}
        onCancel={onClose}
        onSuccess={() => {
          onClose();
          router.refresh();
        }}
      />
    </Modal>
  );
}
