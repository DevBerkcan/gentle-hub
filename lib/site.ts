/** Content of a website from the Gentle building kit, as Lara writes it and the server checks it. */
export type SitePalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
};

export type SiteBranding = {
  name: string;
  slogan?: string;
  tone?: { address?: "du" | "Sie"; style?: string };
  palette: SitePalette;
  fonts: { heading: string; body: string };
  logo?: { text?: string; style?: "plain" | "spaced" | "monogram" };
};

export type SiteItem = { title?: string; text?: string };

export type SiteSection =
  | { type: "services"; title?: string; intro?: string; items?: SiteItem[] }
  | { type: "about"; title?: string; text?: string }
  | { type: "benefits"; title?: string; items?: SiteItem[] }
  | { type: "process"; title?: string; steps?: SiteItem[] }
  | { type: "faq"; title?: string; items?: { question?: string; answer?: string }[] }
  | { type: "contact"; title?: string; text?: string };

export type SiteContent = {
  brandingSource?: "existing" | "new";
  nameSuggestions?: { name: string; reason?: string; domain?: string; domainAvailable?: boolean | null }[];
  branding: SiteBranding;
  site: {
    seo?: { title?: string; description?: string };
    hero: { eyebrow?: string; headline: string; subline?: string; ctaLabel?: string };
    sections: SiteSection[];
  };
  notes?: string[];
  contact?: { email?: string | null; phone?: string | null; instagram?: string | null; city?: string | null };
};

export type BrandCheck = {
  name?: string | null;
  placesChecked: boolean;
  matches: { name: string; address?: string | null; website?: string | null; mapsUrl?: string | null }[];
  existing?: { siteUrl?: string | null; title?: string | null; colors: string[]; fonts: string[]; logoUrl?: string | null; themeColor?: string | null } | null;
  domains: { domain: string; available?: boolean | null }[];
  trademarkSearchUrl: string;
  notes: string[];
  checkedAt: string;
};

/** Google Fonts stylesheet for the two fonts (names come from the server-side allowlist). */
export function fontsHref(fonts: { heading: string; body: string }) {
  const families = Array.from(new Set([fonts.heading, fonts.body]))
    .map((font) => `family=${encodeURIComponent(font).replace(/%20/g, "+")}:wght@400;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

export function withAlpha(hex: string, alpha: number) {
  const value = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${value}`;
}

/** Simple word mark as SVG text; the same markup is used for the page and the download. */
export function logoSvg(branding: SiteBranding, color?: string) {
  const text = (branding.logo?.text || branding.name).slice(0, 40);
  const style = branding.logo?.style ?? "plain";
  const fill = color ?? branding.palette.primary;
  const font = branding.fonts.heading;
  const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  if (style === "monogram") {
    const initials = text
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]!.toUpperCase())
      .join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.max(320, 80 + Math.ceil(text.length * 21))} 64" overflow="visible" role="img" aria-label="${escape(text)}"><style>@import url('${fontsHref(branding.fonts)}');</style><circle cx="32" cy="32" r="28" fill="${fill}"/><text x="32" y="41" text-anchor="middle" font-family="'${escape(font)}', serif" font-size="24" font-weight="700" fill="#FFFFFF">${escape(initials)}</text><text x="72" y="41" font-family="'${escape(font)}', serif" font-size="26" font-weight="600" fill="${fill}">${escape(text)}</text></svg>`;
  }

  const spacing = style === "spaced" ? 4 : 0;
  const shown = style === "spaced" ? text.toUpperCase() : text;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.max(200, Math.ceil(shown.length * (style === "spaced" ? 30 : 21)))} 64" overflow="visible" role="img" aria-label="${escape(text)}"><style>@import url('${fontsHref(branding.fonts)}');</style><text x="0" y="42" font-family="'${escape(font)}', serif" font-size="30" font-weight="600" letter-spacing="${spacing}" fill="${fill}">${escape(shown)}</text></svg>`;
}
