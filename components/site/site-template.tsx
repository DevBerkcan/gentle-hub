import type { SiteContent, SiteSection } from "@/lib/site";
import { logoSvg, withAlpha } from "@/lib/site";

/**
 * The Gentle building kit: one page, rendered only from checked content. Accessible by default
 * (landmarks, headings in order, readable contrast from the server), no tracking, no external images.
 */
export function SiteTemplate({ content, preview = true }: { content: SiteContent; preview?: boolean }) {
  const { branding, site, contact } = content;
  const p = branding.palette;
  const du = branding.tone?.address !== "Sie";
  const vars = {
    "--s-primary": p.primary,
    "--s-secondary": p.secondary,
    "--s-accent": p.accent,
    "--s-bg": p.background,
    "--s-surface": p.surface,
    "--s-text": p.text,
    "--s-muted": withAlpha(p.text, 0.72),
    "--s-line": withAlpha(p.text, 0.12),
    "--s-heading": `'${branding.fonts.heading}', Georgia, serif`,
    "--s-body": `'${branding.fonts.body}', system-ui, sans-serif`,
  } as React.CSSProperties;
  const contactHref = contact?.email ? `mailto:${contact.email}` : contact?.instagram ? `https://instagram.com/${contact.instagram}` : "#kontakt";

  return (
    <div style={vars} className="site min-h-screen bg-[var(--s-bg)] font-[family-name:var(--s-body)] text-[var(--s-text)] antialiased">
      {preview && (
        <div className="bg-[var(--s-text)] px-4 py-1.5 text-center text-[12px] text-[var(--s-bg)]">
          Vorschau von Gentle Group · noch nicht veröffentlicht
        </div>
      )}
      <a href="#inhalt" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[var(--s-surface)] focus:px-3 focus:py-2">
        Zum Inhalt springen
      </a>

      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5">
        <span className="block h-10 w-auto max-w-[60%] [&>svg]:h-10 [&>svg]:w-auto" dangerouslySetInnerHTML={{ __html: logoSvg(branding) }} />
        <a
          href={contactHref}
          className="shrink-0 whitespace-nowrap rounded-full bg-[var(--s-primary)] px-4 py-2 text-[14px] font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--s-primary)]"
        >
          {site.hero.ctaLabel || (du ? "Schreib uns" : "Kontakt aufnehmen")}
        </a>
      </header>

      <main id="inhalt">
        <section className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:pt-16" aria-labelledby="hero-title">
          {site.hero.eyebrow && <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--s-primary)]">{site.hero.eyebrow}</p>}
          <h1 id="hero-title" className="max-w-3xl font-[family-name:var(--s-heading)] text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-[1.05]">
            {site.hero.headline}
          </h1>
          {site.hero.subline && <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-[var(--s-muted)]">{site.hero.subline}</p>}
          {branding.slogan && <p className="mt-6 font-[family-name:var(--s-heading)] text-[17px] italic text-[var(--s-primary)]">{branding.slogan}</p>}
          <div
            aria-hidden
            className="mt-12 h-40 rounded-3xl sm:h-56"
            style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.secondary} 60%, ${p.accent})` }}
          />
        </section>

        {site.sections.map((section, index) => (
          <Section key={index} section={section} index={index} contact={contact} du={du} contactHref={contactHref} ctaLabel={site.hero.ctaLabel} />
        ))}
      </main>

      <footer className="border-t border-[var(--s-line)]">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-8 text-[13px] text-[var(--s-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>© {branding.name}</span>
          <nav aria-label="Rechtliches" className="flex gap-4">
            <a href="#impressum" className="underline underline-offset-4">Impressum</a>
            <a href="#datenschutz" className="underline underline-offset-4">Datenschutz</a>
          </nav>
        </div>
        <div className="mx-auto max-w-5xl px-5 pb-10 text-[12px] text-[var(--s-muted)]">
          <p id="impressum" className="rounded-lg border border-dashed border-[var(--s-line)] p-3">
            <strong>Impressum:</strong> Platzhalter. Vor der Veröffentlichung tragen wir hier die echten Angaben ein.
          </p>
          <p id="datenschutz" className="mt-2 rounded-lg border border-dashed border-[var(--s-line)] p-3">
            <strong>Datenschutz:</strong> Platzhalter. Diese Vorschau setzt keine Cookies und lädt nur die Schriften von Google Fonts.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Section({
  section,
  index,
  contact,
  du,
  contactHref,
  ctaLabel,
}: {
  section: SiteSection;
  index: number;
  contact: SiteContent["contact"];
  du: boolean;
  contactHref: string;
  ctaLabel?: string;
}) {
  const id = section.type === "contact" ? "kontakt" : `abschnitt-${index}`;
  const tinted = index % 2 === 0;
  const heading = (
    <h2 id={`${id}-titel`} className="font-[family-name:var(--s-heading)] text-[clamp(1.6rem,3.5vw,2.3rem)] font-semibold">
      {section.title}
    </h2>
  );

  return (
    <section id={id} aria-labelledby={`${id}-titel`} className={tinted ? "bg-[var(--s-surface)]" : ""}>
      <div className="mx-auto max-w-5xl px-5 py-16">
        {heading}
        {section.type === "services" && (
          <>
            {section.intro && <p className="mt-3 max-w-2xl text-[17px] text-[var(--s-muted)]">{section.intro}</p>}
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {(section.items ?? []).map((item, i) => (
                <li key={i} className="rounded-2xl border border-[var(--s-line)] bg-[var(--s-bg)] p-5">
                  <h3 className="text-[18px] font-semibold">{item.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-[var(--s-muted)]">{item.text}</p>
                </li>
              ))}
            </ul>
          </>
        )}
        {section.type === "about" && <p className="mt-5 max-w-3xl whitespace-pre-line text-[17px] leading-relaxed text-[var(--s-muted)]">{section.text}</p>}
        {section.type === "benefits" && (
          <ul className="mt-8 grid gap-6 sm:grid-cols-3">
            {(section.items ?? []).map((item, i) => (
              <li key={i}>
                <span aria-hidden className="mb-3 block h-1 w-10 rounded bg-[var(--s-primary)]" />
                <h3 className="text-[17px] font-semibold">{item.title}</h3>
                <p className="mt-1 leading-relaxed text-[var(--s-muted)]">{item.text}</p>
              </li>
            ))}
          </ul>
        )}
        {section.type === "process" && (
          <ol className="mt-8 grid gap-5 sm:grid-cols-3">
            {(section.steps ?? []).map((step, i) => (
              <li key={i} className="rounded-2xl border border-[var(--s-line)] p-5">
                <span className="text-[13px] font-semibold text-[var(--s-primary)]">Schritt {i + 1}</span>
                <h3 className="mt-1 text-[17px] font-semibold">{step.title}</h3>
                <p className="mt-1 leading-relaxed text-[var(--s-muted)]">{step.text}</p>
              </li>
            ))}
          </ol>
        )}
        {section.type === "faq" && (
          <div className="mt-6 divide-y divide-[var(--s-line)] border-y border-[var(--s-line)]">
            {(section.items ?? []).map((item, i) => (
              <details key={i} className="group py-4">
                <summary className="cursor-pointer list-none text-[17px] font-semibold marker:hidden">
                  {item.question}
                </summary>
                <p className="mt-2 leading-relaxed text-[var(--s-muted)]">{item.answer}</p>
              </details>
            ))}
          </div>
        )}
        {section.type === "contact" && (
          <div className="mt-5 flex flex-col gap-5">
            {section.text && <p className="max-w-2xl text-[17px] text-[var(--s-muted)]">{section.text}</p>}
            <ul className="flex flex-col gap-1.5 text-[16px]">
              {contact?.email && (
                <li>
                  E-Mail: <a className="font-semibold underline underline-offset-4" href={`mailto:${contact.email}`}>{contact.email}</a>
                </li>
              )}
              {contact?.phone && (
                <li>
                  Telefon: <a className="font-semibold underline underline-offset-4" href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}>{contact.phone}</a>
                </li>
              )}
              {contact?.instagram && (
                <li>
                  Instagram: <a className="font-semibold underline underline-offset-4" href={`https://instagram.com/${contact.instagram}`} rel="noreferrer">@{contact.instagram}</a>
                </li>
              )}
              {contact?.city && <li>{contact.city}</li>}
            </ul>
            <a href={contactHref} className="w-fit rounded-full bg-[var(--s-primary)] px-5 py-3 font-semibold text-white transition hover:opacity-90">
              {ctaLabel || (du ? "Jetzt schreiben" : "Jetzt Kontakt aufnehmen")}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
