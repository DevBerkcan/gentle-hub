# GentleHub

Der zentrale, geschützte Application Launcher der Gentle Group: alle Anwendungen auf einer Seite, jede mit einem Klick erreichbar, mit gemeinsamen Notizen und einem verschlüsselten Tresor für Zugangsdaten.

**One Hub. All Applications. One Click.**

## Features

- **Login nur für Freigegebene:** Magic Link per E-Mail. Zugang haben nur die Adressen in `ALLOWED_EMAILS`.
- **Kacheln:**
  - **Öffnen** (unten links) startet den hinterlegten Link in einem neuen Tab. Ein Klick auf die Kachel macht dasselbe.
  - **Info** (unten rechts) öffnet ein Seitenpanel mit Link, Notizen, Zugangsdaten, Details und einer Option zum Löschen.
- **Kacheln im UI verwalten:** Mit „+ Anwendung“ anlegen, im Info-Panel bearbeiten und löschen.
- **Gemeinsame Daten:** Alle Freigegebenen sehen dieselben Kacheln, Links und Notizen. Favoriten gelten pro Person.
- **Notizen:** Werden automatisch gespeichert, mit Anzeige „Zuletzt geändert von …“, und sind durchsuchbar.
- **Tresor:** Benutzer, Passwort und Hinweis werden **im Browser** mit einem gemeinsamen Master-Passwort verschlüsselt (PBKDF2-SHA-256 mit 600 000 Iterationen, AES-256-GCM). Server und Datenbank sehen nur Chiffretext. Der Tresor sperrt sich nach 10 Minuten Inaktivität.
- **Suche, Filter und Schnellsuche:** Suche, Kategorie-Filter und Schnellsuche (`⌘ K` / `Strg K`); `/` fokussiert die Suche.
- **Bedienung:** Helles Design, responsiv, per Tastatur bedienbar. `prefers-reduced-motion` wird berücksichtigt.

## Architektur

| Baustein | Umsetzung |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, Tailwind v4 |
| Auth | [Better Auth](https://www.better-auth.com) mit Magic-Link-Plugin (`lib/auth.ts`). Tokens werden gehasht gespeichert, sind 10 Minuten gültig und nur einmal verwendbar. |
| Zugriffsschutz | `proxy.ts` (schnelle Cookie-Prüfung) **plus** `requireUser()` in jeder Seite und Server Action (`lib/session.ts`) |
| Datenbank | Postgres (z. B. Neon), Treiber `pg`, parametrisiertes SQL (`lib/repo.ts`) |
| Mutationen | Server Actions mit serverseitiger Validierung (`app/actions.ts`, `lib/validation.ts`) |
| Tresor | Web Crypto im Browser (`lib/vault.ts`, `lib/use-vault.ts`) |
| E-Mail | Resend über die HTTP-API (`lib/mail.ts`). Ohne API-Key wird der Link in der Entwicklung in die Konsole geschrieben. |

## Umgebungsvariablen

Siehe `.env.example`. Lokal in `.env.local` eintragen, auf Vercel unter *Settings → Environment Variables*.

| Variable | Zweck |
| --- | --- |
| `DATABASE_URL` | Postgres-Verbindung (Neon über Vercel Storage setzt sie automatisch) |
| `BETTER_AUTH_SECRET` | Zufälliges Secret, mindestens 32 Zeichen: `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Öffentliche URL des Hubs, z. B. `https://hub.gentlegroup.de` |
| `ALLOWED_EMAILS` | Kommagetrennte Liste aller zugelassenen Adressen |
| `RESEND_API_KEY` | API-Key für den Versand der Anmeldelinks |
| `EMAIL_FROM` | Absender, z. B. `GentleHub <hub@gentlegroup.de>` (die Domain muss bei Resend verifiziert sein) |

## Setup lokal

```bash
npm install
cp .env.example .env.local     # Werte eintragen (DATABASE_URL, BETTER_AUTH_SECRET, …)
npm run db:migrate             # Tabellen anlegen + Startkachel GentleBook
npm run dev                    # http://localhost:3000
```

Ohne `RESEND_API_KEY` erscheint der Anmeldelink im Terminal von `npm run dev`.

Postgres lokal per Docker:

```bash
docker run -d --name gentlehub-pg -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=gentlehub -p 5432:5432 postgres:17-alpine
# DATABASE_URL=postgres://postgres:dev@localhost:5432/gentlehub
```

## Deployment (Vercel)

1. Das Repo `DevBerkcan/gentle-hub` in Vercel importieren.
2. Unter *Storage → Create → Neon* eine Datenbank anlegen und mit dem Projekt verbinden.
3. Bei Resend die Domain `gentlegroup.de` verifizieren und einen API-Key anlegen.
4. Die Umgebungsvariablen setzen (siehe oben).
5. Einmalig die Migration gegen die Produktions-DB laufen lassen: `DATABASE_URL=… npm run db:migrate`.
6. Deployen.

## Scripts

```bash
npm run dev          # Entwicklungsserver
npm run build        # Produktions-Build
npm run start        # Produktions-Build lokal starten
npm run lint         # ESLint
npm run test         # Vitest
npm run db:migrate   # Schema anlegen/aktualisieren (idempotent)
```

## Zugriff verwalten

- **Person freigeben:** E-Mail-Adresse zu `ALLOWED_EMAILS` hinzufügen und neu deployen.
- **Zugriff entziehen:** Adresse aus `ALLOWED_EMAILS` entfernen. Bestehende Sitzungen werden danach bei jedem Aufruf abgewiesen, weil `requireUser()` die Allowlist erneut prüft.

## Tresor – wichtig

- Das Master-Passwort wird nirgends gespeichert. **Vergessen bedeutet, dass die Zugangsdaten verloren sind.** Notizen sind davon nicht betroffen.
- Teilt das Master-Passwort persönlich, nicht per E-Mail oder Chat.
- Ändern zwei Personen gleichzeitig den Tresor, wird der Konflikt erkannt: neu laden und erneut speichern.
- Für besonders kritische Zugänge bleibt ein Passwort-Manager die erste Wahl.

## Projektstruktur

```text
/app                    Seiten (Hub, Login), Server Actions, Auth-Route, Design-Tokens
/components/hub         Header, Suche, Filter, Kachel, Info-Dialog, Formular, Tresor, Schnellsuche
/components/auth        Login-Formular
/components/ui          Kleine Bausteine (AppIcon, Icons, Badges, Kbd)
/data/applications.ts   Kategorien
/db/schema.sql          App-Tabellen (applications, favorites, vault)
/lib                    Auth, Session, DB, Repository, Validierung, Tresor, Suche, Utilities
/scripts/migrate.mjs    Migration + Startdaten
/proxy.ts               Weiterleitung auf /login ohne Session
/tests                  Vitest-Tests
```
