import type { Metadata } from "next";
import Link from "next/link";
import { getCredentialsData } from "@/lib/data";
import { isCredentialCategory } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { CredentialList } from "@/components/vault/credential-list";
import { ImportCredentialsButton } from "@/components/vault/import-credentials-button";
import { NewCredentialButton } from "@/components/vault/new-credential-button";
import { VaultFilters } from "@/components/vault/vault-filters";
import { IconKey } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Passwörter" };

export default async function PasswordsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawCategory = Array.isArray(params.category) ? params.category[0] : params.category;
  const category = isCredentialCategory(rawCategory) ? rawCategory : undefined;

  const { items, stats } = await getCredentialsData(category);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Zugänge"
        title="Passwörter"
        description="Postfächer, Hosting-Panels, Domains und Software-Logins der Gentle Group – mit AES-256-GCM verschlüsselt und erst nach ausdrücklicher Anzeige entschlüsselt. Jede Anzeige wird protokolliert."
        action={
          <>
            <ImportCredentialsButton />
            <NewCredentialButton />
          </>
        }
      />

      <VaultFilters total={stats.total} byCategory={stats.byCategory} activeCategory={category} />

      {items.length > 0 ? (
        <CredentialList items={items} />
      ) : (
        <EmptyState
          icon={<IconKey className="h-4 w-4" />}
          title={category ? "Keine Passwörter in dieser Kategorie" : "Noch keine Passwörter"}
          description={
            category
              ? "Wähle eine andere Kategorie oder lege einen neuen Eintrag an."
              : "Importiere einen CSV-Export aus Chrome oder lege das erste Passwort an."
          }
          action={
            category ? (
              <Link href="/passwords" className="btn btn-secondary">
                Alle Passwörter anzeigen
              </Link>
            ) : (
              <NewCredentialButton />
            )
          }
        />
      )}
    </div>
  );
}
