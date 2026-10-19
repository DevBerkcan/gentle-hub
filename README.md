# GentleHub

Der zentrale Hub der Gentle Group: eigene Apps, Kundenprojekte, Repositories, Hosting und sensible Zugänge an einem Ort.

**One Hub. All Applications. One Click.**

- Frontend: <https://gentle-hub.vercel.app>
- Backend/API: <https://gentlehub.runasp.net>
- Backend-Repository: <https://github.com/metur100/gentle-hub-api>

## Was GentleHub kann

- **Drei klare Bereiche:** Gentle-Group-Produkte, Kundenprojekte und eigene Projekte (Games, Experimente, Portfolios) – getrennt in Navigation, Listen und Filtern.
- **Echte App-Logos:** Die Kacheln nutzen die Logos/Favicons aus den jeweiligen Repositories und Live-Deployments; keine Emoji-Platzhalter.
- **Alles zu einem Projekt an einem Ort:** Links, Repositories, Hosting, Datenbanken, Konten und Geheimnisse.
- **Sensible Daten verschlüsselt:** Passwörter, Connection Strings, Publish-Profile und API-Keys werden mit AES-256-GCM verschlüsselt gespeichert und erst nach einem Klick entschlüsselt.
- **Schnell finden:** globale Suche über Projekte, Links, Repositories, Anbieter, Benutzernamen und Notizen; Favoriten für den direkten Zugriff.
- **Aufgeräumtes Dashboard:** Kennzahlen, Projektstatus, Favoriten und Aktivitätsprotokoll.
- **Nur zwei Konten:** `medin@gentlegroup.de` und `berkcan@gentlegroup.de`. Es gibt keine Selbstregistrierung.
- **Sicherheit:** PBKDF2-SHA256-Passwort-Hashes, undurchsichtige Session-Tokens (nur als Hash in der Datenbank), 30-Tage-Sitzungen, Login-Rate-Limit, protokollierte Anzeige von Geheimnissen.

## Architektur

| Baustein | Umsetzung |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, Vercel |
| Backend | ASP.NET Core 8 Minimal API, IIS auf MonsterASP |
| Datenbank | Microsoft SQL Server 2025 Express (MonsterASP) |
| Auth | E-Mail + Passwort, PBKDF2, opake Bearer-Sessions, HttpOnly-Cookie im Frontend |
| Secrets | AES-256-GCM serverseitig; Schlüssel nur in der Backend-Konfiguration |
| Datenzugriff | Dapper mit parametrisierten Queries; Schema wird beim Start idempotent angelegt |

Das Frontend spricht nie direkt aus dem Browser mit der API: Server Components und Server Actions rufen das Backend mit dem Session-Token auf. Dadurch gibt es keine CORS-Probleme und das Token bleibt in einem HttpOnly-Cookie.

## Projektstruktur

```text
app/
  (app)/                 geschützter Bereich (Dashboard, Apps, Kunden, Detail, Suche, Einstellungen)
  login/                 Anmeldung
  actions.ts             Server Actions (Login, CRUD, Secrets)
components/
  shell/                 Sidebar, Topbar, Suche, Benutzermenü
  projects/              Projektkarten, Filter, Formulare
  assets/                Links, Repos, Hosting, Datenbanken, Konten, Geheimnisse
  dashboard/             Kennzahlen und Aktivitätsfeed
  ui/                    Design-Bausteine
lib/
  api.ts                 typisierter API-Client
  session.ts             Session-/Auth-Helfer
  data.ts                gecachte Server-Datenzugriffe
  constants.ts           Status, Farben, Asset-Typen
proxy.ts                 optimistischer Cookie-Schutz
```

Das Backend liegt in einem separaten Repository: `metur100/gentle-hub-api`.

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Standardmäßig spricht das Frontend mit `https://gentlehub.runasp.net`. Für eine andere API:

```bash
# .env.local
GENTLEHUB_API_URL=http://localhost:5149
```

Weitere Befehle:

```bash
npm run build
npm run lint
```

## Backend & Datenbank

Das Backend erstellt beim Start alle Tabellen (`Users`, `Sessions`, `Projects`, `Assets`, `Favorites`, `Activity`, `SchemaVersions`) und legt beim ersten Start die zwei freigegebenen Konten sowie den Projektkatalog an. Der Vorgang ist idempotent.

Deployment auf MonsterASP (im separaten Backend-Repository `metur100/gentle-hub-api`):

```bash
dotnet publish -c Release -o publish/backend
msdeploy -verb:sync ^
  -source:contentPath="publish\backend" ^
  -dest:contentPath=site100070,computerName="https://site100070.siteasp.net:8172/msdeploy.axd?site=site100070",userName="site100070",password="…",authType=Basic ^
  -enableRule:AppOffline ^
  -allowUntrusted
```

`-enableRule:AppOffline` gibt die laufende `GentleHub.Api.dll` für das Update frei.

Die Produktions-Verbindung nutzt den internen MSSQL-Host `db74483.databaseasp.net`. Von außen (SSMS) ist die Datenbank über `db74483.public.databaseasp.net` erreichbar.

## Zugänge

| Konto | Zweck |
| --- | --- |
| `medin@gentlegroup.de` | Vollzugriff |
| `berkcan@gentlegroup.de` | Vollzugriff |

Passwörter stehen bewusst nicht in diesem Repository. Sie werden beim Setup separat übergeben und können unter **Einstellungen → Passwort ändern** geändert werden.

## Datenmodell (Kurzfassung)

- **Projects**: Name, Slug, Typ (`internal` = Gentle Group, `customer`, `project`), Status, URL, Logo, Tags, Notizen, Kundenkontakt.
- **Assets**: pro Projekt beliebig viele Einträge vom Typ `link`, `repo`, `hosting`, `database`, `account` oder `secret` – mit URL, Anbieter, Umgebung, Benutzername, Details, Notizen und optional einem verschlüsselten Geheimnis.
- **Favorites**: pro Benutzer.
- **Activity**: protokolliert Anmeldungen, Änderungen und die Anzeige von Geheimnissen.

## Sicherheit

- Keine Registrierung, keine Einladungslinks; nur die zwei Adressen in `Auth:AllowedEmails` kommen durch.
- Login-Sperre nach 8 Fehlversuchen pro E-Mail + IP für 5 Minuten.
- Session-Tokens werden nur als SHA-256-Hash gespeichert; Abmeldung und Passwortänderung widerrufen Sitzungen.
- Geheimnisse verlassen den Server nur nach einer authentifizierten `reveal`-Anfrage; jede Anzeige wird protokolliert.
- Das Frontend-Repository enthält keine Backend-Secrets.

## Hinweis zum Repository

Dieses Repository ist öffentlich. Interne Links, Zugangsdaten und Publish-Profile gehören nicht in Dateien, sondern in GentleHub selbst – dort werden sie verschlüsselt gespeichert.