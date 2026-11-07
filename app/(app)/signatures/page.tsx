import type { Metadata } from "next";
import { getEmployeeSignaturesData } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";
import { SignatureManager } from "@/components/signatures/signature-manager";

export const metadata: Metadata = { title: "E-Mail-Signaturen" };

export default async function SignaturesPage() {
  const list = await getEmployeeSignaturesData();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Werkzeuge"
        title="E-Mail-Signaturen"
        description="Signaturen für dich und dein Team im Gentle-Group-Design. Anlegen, kopieren und im eigenen Mailprogramm einfügen."
      />
      <SignatureManager initial={list} />
    </div>
  );
}
