import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { API_URL } from "@/lib/constants";
import { fontsHref, type SiteContent } from "@/lib/site";
import { SiteTemplate } from "@/components/site/site-template";

type Params = { params: Promise<{ token: string }> };

/** Public preview link for a customer: no login, never indexed, only the published snapshot. */
async function load(token: string): Promise<SiteContent | null> {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return null;
  try {
    const response = await fetch(`${API_URL}/api/public/sites/${encodeURIComponent(token)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { site: SiteContent };
    return data.site;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const site = await load((await params).token);
  return {
    title: { absolute: site?.site.seo?.title || site?.branding.name || "Vorschau" },
    description: site?.site.seo?.description,
    robots: { index: false, follow: false, nocache: true },
    icons: { icon: "data:," },
  };
}

export default async function PreviewPage({ params }: Params) {
  const site = await load((await params).token);
  if (!site) notFound();

  return (
    <>
      {/* Fonts differ per customer site, so they are loaded here and not via next/font. */}
      <link rel="stylesheet" href={fontsHref(site.branding.fonts)} />
      <SiteTemplate content={site} />
    </>
  );
}
