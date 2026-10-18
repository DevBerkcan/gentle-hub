# GentleHub

Der zentrale, geschützte Application Launcher der Gentle Group: alle Anwendungen auf einer Seite, jede mit einem Klick erreichbar, mit gemeinsamen Notizen und einem verschlüsselten Tresor für Zugangsdaten.

**One Hub. All Applications. One Click.**

## Features

- **Login nur für Freigegebene:** E-Mail-Adresse + Passwort, ohne E-Mail-Versand. Selbst registrieren ist nicht möglich; Konten legt `npm run user:password` an, und nur Adressen in `ALLOWED_EMAILS` kommen rein. Nach 5 Fehlversuchen pro Minute greift eine Sperre.
- **Kacheln:**
  - **Öffnen** (unten links) startet den hinterlegten Link in einem neuen Tab. Ein Klick auf die Kachel macht dasselbe.
  - **Info** (unten rechts) öffnet ein Seitenpanel mit Link, Notizen, Zugangsdaten, Details und einer Option zum Löschen.
- **Kacheln im UI verwalten:** Mit „+ Anwendung“ anlegen, im Info-Panel bearbeiten und löschen.
- **Gemeinsame Daten:** Alle Freigegebenen sehen dieselben Kacheln, Links und Notizen. Favoriten gelten pro Person.
- **Notizen:** Werden automatisch gespeichert, mit Anzeige „Zuletzt geändert von …“, und sind durchsuchbar. Links in Notizen erscheinen als klickbare Liste (bei „Name: https://…“ wird „Name“ zur Beschriftung).
- **Tresor:** Benutzer, Passwort und Hinweis werden **im Browser** mit einem gemeinsamen Master-Passwort verschlüsselt (PBKDF2-SHA-256 mit 600 000 Iterationen, AES-256-GCM). Server und Datenbank sehen nur Chiffretext. Der Tresor sperrt sich nach 10 Minuten Inaktivität.
- **Suche, Filter und Schnellsuche:** Suche, Kategorie-Filter und Schnellsuche (`⌘ K` / `Strg K`); `/` fokussiert die Suche.
- **Bedienung:** Helles Design, responsiv, per Tastatur bedienbar. `prefers-reduced-motion` wird berücksichtigt.

## Architektur

| Baustein | Umsetzung |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, Tailwind v4 |
| Auth | [Better Auth](https://www.better-auth.com) mit E-Mail + Passwort (`lib/auth.ts`), Registrierung deaktiviert, Passwörter gehasht (scrypt), Sitzung 30 Tage im HttpOnly-Cookie |
| Zugriffsschutz | `proxy.ts` (schnelle Cookie-Prüfung) **plus** `requireUser()` in jeder Seite und Server Action (`lib/session.ts`) |
| Datenbank | Postgres (z. B. Neon), Treiber `pg`, parametrisiertes SQL (`lib/repo.ts`) |
| Mutationen | Server Actions mit serverseitiger Validierung (`app/actions.ts`, `lib/validation.ts`) |
| Tresor | Web Crypto im Browser (`lib/vault.ts`, `lib/use-vault.ts`) |

## Umgebungsvariablen

Siehe `.env.example`. Lokal in `.env.local` eintragen, auf Vercel unter *Settings → Environment Variables*.

| Variable | Zweck |
| --- | --- |
| `DATABASE_URL` | Postgres-Verbindung (Neon über Vercel Storage setzt sie automatisch) |
| `BETTER_AUTH_SECRET` | Zufälliges Secret, mindestens 32 Zeichen: `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Öffentliche URL des Hubs, z. B. `https://hub.gentlegroup.de` |
| `ALLOWED_EMAILS` | Kommagetrennte Liste aller zugelassenen Adressen |

## Setup lokal

```bash
npm install
cp .env.example .env.local     # Werte eintragen (DATABASE_URL, BETTER_AUTH_SECRET, …)
npm run db:migrate             # Tabellen anlegen + Startkachel GentleBook
npm run user:password -- berkcan@gentlegroup.de   # Konto anlegen, Passwort wird abgefragt
npm run dev                    # http://localhost:3000
```

Postgres lokal per Docker:

```bash
docker run -d --name gentlehub-pg -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=gentlehub -p 5432:5432 postgres:17-alpine
# DATABASE_URL=postgres://postgres:dev@localhost:5432/gentlehub
```

## Deployment (Vercel)

1. Das Repo `DevBerkcan/gentle-hub` in Vercel importieren.
2. Unter *Storage → Create → Neon* eine Datenbank anlegen und mit dem Projekt verbinden.
3. Die Umgebungsvariablen setzen (siehe oben).
4. Einmalig gegen die Produktions-DB ausführen (`DATABASE_URL` und `ALLOWED_EMAILS` in `.env.local`):
   - `npm run db:migrate`
   - `npm run user:password -- berkcan@gentlegroup.de`
   - `npm run user:password -- medin@gentlegroup.de`
5. Deployen.

## Scripts

```bash
npm run dev          # Entwicklungsserver
npm run build        # Produktions-Build
npm run start        # Produktions-Build lokal starten
npm run lint         # ESLint
npm run test         # Vitest
npm run db:migrate   # Schema anlegen/aktualisieren (idempotent)
npm run user:password -- <email>   # Konto anlegen oder Passwort zurücksetzen (meldet überall ab)
npm run db:import -- <datei.json>  # Kacheln inkl. Link und Notizen aus JSON anlegen/aktualisieren
```

## Zugriff verwalten

- **Person freigeben:** E-Mail-Adresse zu `ALLOWED_EMAILS` hinzufügen, neu deployen und `npm run user:password -- <email>` ausführen.
- **Passwort ändern:** Im Hub über das Konto-Menü (oben rechts) → „Passwort ändern“. Andere Geräte werden abgemeldet.
- **Passwort vergessen:** `npm run user:password -- <email>` setzt ein neues Passwort (es wird keine Mail verschickt).
- **Zugriff entziehen:** Adresse aus `ALLOWED_EMAILS` entfernen. Bestehende Sitzungen werden danach bei jedem Aufruf abgewiesen, weil `requireUser()` die Allowlist erneut prüft.

## Daten importieren

Mehrere Kacheln oder lange Link-Listen lassen sich per JSON einspielen (gleiche `id` = aktualisieren, neue `id` = anlegen):

```json
[
  {
    "id": "gentlebook",
    "name": "GentleBook",
    "description": "SaaS für Online-Terminbuchungen.",
    "url": "https://app.example.com/admin/login",
    "category": "saas",
    "notes": "Dashboard: https://…
Umsatz: https://…"
  }
]
```

```bash
npm run db:import -- data/private/meine-apps.json
```

> **Das Repository ist öffentlich.** Import-Dateien mit internen Links gehören nach `data/private/` – der Ordner ist in `.gitignore` und wird nie committet. Passwörter gehören in keine Datei, sondern in den Tresor im Hub.

## Tresor – wichtig

- Das Master-Passwort wird nirgends gespeichert. **Vergessen bedeutet, dass die Zugangsdaten verloren sind.** Notizen sind davon nicht betroffen.
- Teilt das Master-Passwort persönlich, nicht per E-Mail oder Chat.
- Ändern zwei Personen gleichzeitig den Tresor, wird der Konflikt erkannt: neu laden und erneut speichern.
- Für besonders kritische Zugänge bleibt ein Passwort-Manager die erste Wahl.

## Projektstruktur

```text
/app                    Seiten (Hub, Login), Server Actions, Auth-Route, Design-Tokens
/components/hub         Header, Suche, Filter, Kachel, Info-Dialog, Formular, Tresor, Schnellsuche
/components/auth        Login-Formular, Passwort ändern
/components/ui          Kleine Bausteine (AppIcon, Icons, Badges, Kbd)
/data/applications.ts   Kategorien
/db/schema.sql          App-Tabellen (applications, favorites, vault)
/lib                    Auth, Session, DB, Repository, Validierung, Tresor, Suche, Utilities
/scripts                migrate.mjs (Schema + Startdaten), set-password.mjs (Konten/Passwörter), import.mjs (JSON-Import)
/data/private           Lokale Import-Dateien (gitignored, nie committen)
/proxy.ts               Weiterleitung auf /login ohne Session
/tests                  Vitest-Tests
```
