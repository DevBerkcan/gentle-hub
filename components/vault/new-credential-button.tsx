"use client";

import { useState } from "react";
import { CredentialFormModal } from "@/components/vault/credential-form-modal";
import { IconPlus } from "@/components/ui/icons";

export function NewCredentialButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-primary">
        <IconPlus className="h-4 w-4" />
        Passwort hinzufügen
      </button>
      <CredentialFormModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
