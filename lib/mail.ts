import "server-only";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

/**
 * Sends the magic sign-in link. Uses the Resend HTTP API when RESEND_API_KEY is
 * set; in development without a key the link is printed to the server console.
 */
export async function sendLoginEmail({ to, url }: { to: string; url: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY ist nicht gesetzt – Anmeldelinks können nicht versendet werden.");
    }
    console.info(`\n[GentleHub] Anmeldelink für ${to}:\n${url}\n`);
    return;
  }

  const from = process.env.EMAIL_FROM ?? "GentleHub <hub@gentlegroup.de>";
  const safeUrl = escapeHtml(url);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Dein Anmeldelink für GentleHub",
      text: `Hier ist dein Anmeldelink für GentleHub (10 Minuten gültig, einmal verwendbar):\n\n${url}\n\nFalls du dich nicht anmelden wolltest, ignoriere diese E-Mail.`,
      html: `<div style="font-family:system-ui,sans-serif;color:#010a30;max-width:480px">
  <p style="font-size:16px;font-weight:600">Anmelden bei GentleHub</p>
  <p>Klicke auf den Button, um dich anzumelden. Der Link ist 10 Minuten gültig und nur einmal verwendbar.</p>
  <p><a href="${safeUrl}" style="display:inline-block;background:#010a30;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Jetzt anmelden</a></p>
  <p style="color:#4a5170;font-size:13px">Falls du dich nicht anmelden wolltest, ignoriere diese E-Mail.</p>
</div>`,
    }),
  });

  if (!response.ok) {
    throw new Error(`E-Mail-Versand fehlgeschlagen (${response.status}).`);
  }
}
