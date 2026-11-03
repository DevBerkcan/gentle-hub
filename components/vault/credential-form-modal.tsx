"use client";

import { useRouter } from "next/navigation";
import type { Credential, CredentialCategory } from "@/lib/types";
import { credentialCategoryLabel } from "@/lib/constants";
import { Modal } from "@/components/ui/modal";
import { CredentialForm } from "@/components/vault/credential-form";

export function CredentialFormModal({
  open,
  onClose,
  credential,
  defaultCategory = "email",
}: {
  open: boolean;
  onClose: () => void;
  credential?: Credential;
  defaultCategory?: CredentialCategory;
}) {
  const router = useRouter();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={credential ? "Passwort bearbeiten" : "Neues Passwort"}
      description={
        credential
          ? "Leere Passwortfelder lassen den gespeicherten Wert unverändert."
          : `${credentialCategoryLabel(defaultCategory)} hinzufügen – verschlüsselt gespeichert und nur nach ausdrücklicher Anzeige entschlüsselt.`
      }
      size="lg"
    >
      <CredentialForm
        mode={credential ? "edit" : "create"}
        credential={credential}
        defaultCategory={defaultCategory}
        onCancel={onClose}
        onSuccess={() => {
          onClose();
          router.refresh();
        }}
      />
    </Modal>
  );
}
