"use client";

import { useState } from "react";
import { ImportCredentialsModal } from "@/components/vault/import-credentials-modal";
import { IconUpload } from "@/components/ui/icons";

export function ImportCredentialsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-secondary">
        <IconUpload className="h-4 w-4" />
        CSV importieren
      </button>
      <ImportCredentialsModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
