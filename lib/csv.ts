import type { CredentialCategory, CredentialImportItem } from "@/lib/types";

/**
 * CSV import for password exports (Chrome, Edge, Brave and similar).
 * Chrome writes: name,url,username,password,note — fields may be quoted.
 */

export type ImportedPasswordRow = {
  name: string;
  url: string;
  username: string;
  password: string;
  note: string;
};

export function parseCsv(text: string): string[][] {
  const input = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (inQuotes) {
      if (char === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\r") {
      // CRLF: the following \n ends the row.
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim().length > 0));
}

export function parsePasswordCsv(text: string): ImportedPasswordRow[] {
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return [];
  }

  const header = rows[0].map((cell) => cell.trim().toLowerCase());
  const index = (name: string) => header.indexOf(name);
  const hasHeader = index("url") >= 0 || index("username") >= 0 || index("password") >= 0;

  const nameIndex = hasHeader ? index("name") : 0;
  const urlIndex = hasHeader ? index("url") : 1;
  const usernameIndex = hasHeader ? index("username") : 2;
  const passwordIndex = hasHeader ? index("password") : 3;
  const noteIndex = hasHeader ? index("note") : 4;

  const body = hasHeader ? rows.slice(1) : rows;

  return body
    .map((cells) => ({
      name: (nameIndex >= 0 ? cells[nameIndex] : "")?.trim() ?? "",
      url: (urlIndex >= 0 ? cells[urlIndex] : "")?.trim() ?? "",
      username: (usernameIndex >= 0 ? cells[usernameIndex] : "")?.trim() ?? "",
      password: passwordIndex >= 0 ? (cells[passwordIndex] ?? "") : "",
      note: (noteIndex >= 0 ? cells[noteIndex] : "")?.trim() ?? "",
    }))
    .filter((row) => row.url.length > 0 || row.name.length > 0)
    .filter((row) => row.username.length > 0 || row.password.length > 0);
}

function hostOf(rawUrl: string): string {
  const value = rawUrl.trim();
  if (!value) return "";

  try {
    return new URL(value).host.toLowerCase();
  } catch {
    try {
      return new URL(`https://${value}`).host.toLowerCase();
    } catch {
      return "";
    }
  }
}

function pathOf(rawUrl: string): string {
  try {
    return new URL(rawUrl.trim()).pathname.toLowerCase();
  } catch {
    return "";
  }
}

const PROVIDER_PATTERNS: [RegExp, string][] = [
  [/monsterasp/, "MonsterASP"],
  [/adobe/, "Adobe"],
  [/github/, "GitHub"],
  [/vercel\.app/, "Vercel"],
  [/netlify\.app/, "Netlify"],
  [/webhosting\.systems/, "webhosting.systems"],
  [/airclean-setec/, "airclean-setec.de"],
  [/customercontrolpanel/, "Customer Control Panel"],
  [/gentlegroup/, "Gentle Group"],
  [/davinci/, "DaVinci AI"],
  [/pippit/, "Pippit AI"],
];

export function categorizeCredential(rawUrl: string): CredentialCategory {
  const host = hostOf(rawUrl);
  if (!host) return "other";

  if (/^(webmail|mail|imap|smtp|owa|roundcube)/.test(host) || host.includes("webmail")) {
    return "email";
  }

  if (/monsterasp|customercontrolpanel|webhosting\.systems|plesk|hosting|servercontrol/.test(host)) {
    return "hosting";
  }

  if (host === "localhost" || host.startsWith("localhost:") || host === "127.0.0.1") {
    return "other";
  }

  if (/vercel\.app|netlify\.app|booking|shop|wordpress|typo3|joomla|\.cms/.test(host)) {
    return "website";
  }

  if (/(^|\/)(admin|wp-admin)(\/|$)/.test(pathOf(rawUrl))) {
    return "website";
  }

  return "software";
}

export function credentialProvider(rawUrl: string): string {
  const host = hostOf(rawUrl);
  if (!host) return "";

  for (const [pattern, provider] of PROVIDER_PATTERNS) {
    if (pattern.test(host)) return provider;
  }

  const withoutPort = host.split(":")[0];
  const parts = withoutPort.split(".").filter(Boolean);
  return parts.length >= 2 ? parts.slice(-2).join(".") : withoutPort;
}

export function credentialLabel(row: ImportedPasswordRow): string {
  const host = hostOf(row.url) || hostOf(row.name);
  if (host) {
    return host.replace(/^www\./, "");
  }

  return row.name.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

export function toCredentialImportItems(rows: ImportedPasswordRow[]): CredentialImportItem[] {
  return rows.map((row) => {
    const target = row.url || row.name;
    return {
      category: categorizeCredential(target),
      label: credentialLabel(row),
      url: row.url,
      username: row.username,
      password: row.password,
      provider: credentialProvider(target),
      notes: row.note,
    };
  });
}
