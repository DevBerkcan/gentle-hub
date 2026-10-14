# GentleHub

Der zentrale Application Launcher der Gentle Group: Alle Anwendungen (GentleBook, CRM, interne Tools, Kundenportale, …) auf einer Seite, jede mit einem Klick erreichbar.

**One Hub. All Applications. One Click.**

## Features

- Ruhiges, responsives Kachelraster (eine Spalte auf Mobile, automatisch mehr ab Tablet/Desktop)
- Die ganze Kachel ist klickbar, externe Anwendungen öffnen in einem neuen Tab (`noopener noreferrer`)
- Favoriten: per Stern markieren, erscheinen sofort oben. Werden in `localStorage` gespeichert und über Tabs synchronisiert
- Kategorie-Filter mit Trefferanzahl
- Clientseitige Suche (Name, Beschreibung, Kategorie, Tags; Groß-/Kleinschreibung und Umlaute werden ignoriert)
- Schnellsuche mit `⌘ K` / `Strg K` (zeigt Favoriten und „Zuletzt geöffnet“ an), `/` fokussiert die Suche
- Hell-/Dunkelmodus nach Systemeinstellung, `prefers-reduced-motion` wird berücksichtigt
- Tastaturbedienbar, sichtbare Fokuszustände, semantische Links

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
```

## Scripts

```bash
npm run dev        # Entwicklungsserver (Turbopack)
npm run build      # Produktions-Build
npm run start      # Produktions-Build lokal starten
npm run lint       # ESLint
npm run test       # Vitest (Unit- und Komponententests)
```

## Projektstruktur

```text
/app                    Layout (Inter via next/font), Seite, Design-Tokens (globals.css)
/components/hub         Header, Suche, Kategorie-Filter, Kachel, Raster, Command Palette, Shell
/components/ui          Kleine Bausteine (AppIcon, EnvironmentBadge, FavoriteButton, Kbd, IconArrow)
/data/applications.ts   Zentrale Konfiguration aller Anwendungen + Kategorien
/lib                    Suche/Filter, localStorage-Layer, Präferenzen-Hook, Utilities
/types                  Geteilte TypeScript-Typen
/public/apps            Optionale App-Logos
/tests                  Vitest-Tests
```

## Eine neue Anwendung hinzufügen

> ⚠️ Die aktuell eingetragenen Anwendungen und URLs sind **Platzhalter** und müssen durch die echten ersetzt werden.

Es muss **nur** `data/applications.ts` erweitert werden:

```ts
{
  id: "gentlebook",                          // eindeutig, url-sicher
  name: "GentleBook",
  description: "Online-Terminbuchung für Dienstleister.",
  url: "https://…",                          // nur http(s) wird akzeptiert
  category: "saas",                          // siehe Tabelle unten
  icon: "/apps/gentlebook.svg",              // optional – sonst Monogramm „GB“
  tags: ["termine", "buchung"],              // optional, durchsuchbar
  environment: "staging",                    // optional – nur Staging/Development wird angezeigt
  isFavorite: true,                          // optional – Standard-Favorit
  disabled: false,                           // optional – Kachel sichtbar, aber nicht klickbar
}
```

| `category` | Anzeige        |
| ---------- | -------------- |
| `saas`     | SaaS           |
| `crm`      | CRM            |
| `internal` | Interne Tools  |
| `customer` | Kundenprojekte |
| `tool`     | Tools          |

Filter erscheinen nur für Kategorien, die tatsächlich verwendet werden. Logos (SVG/PNG, quadratisch) gehören nach `public/apps/`. `isFavorite` gilt nur, solange ein Benutzer noch keine eigenen Favoriten gesetzt hat.

Im Entwicklungsmodus warnt die Konsole bei doppelten IDs oder unsicheren URLs. Zusätzlich prüft ein Test (`tests/applications.test.ts`) die Konfiguration. Kacheln mit ungültiger URL werden nicht als Link gerendert.

## Sicherheit & Berechtigungen

- Für `url` sind nur `http:` und `https:` erlaubt. Für `icon` sind nur Pfade unter `/public` oder http(s)-URLs erlaubt.
- GentleHub hat derzeit **keine Benutzerverwaltung**. Alle eingetragenen Links sind für jeden sichtbar, der den Hub öffnet. Das Ausblenden einer Kachel ersetzt **keine** Berechtigungsprüfung im Zielsystem.

## Offene Punkte

- Echte Anwendungen, URLs und Logos eintragen (inkl. Gentle Group CRM)
- Anbindung an SSO (z. B. GentleAccess), danach benutzerbezogene Favoriten und rollenbasierte Sichtbarkeit
- Optional: Datenquelle aus CMS/API statt statischer Konfiguration (die UI erwartet nur ein `Application[]`)
