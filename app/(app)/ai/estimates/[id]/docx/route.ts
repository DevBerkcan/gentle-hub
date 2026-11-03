import { API_URL } from "@/lib/constants";
import { getSessionToken } from "@/lib/session";

/** Streams the estimate DOCX from the API; the browser never sees the session token. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getSessionToken();
  if (!token) {
    return new Response("Nicht angemeldet.", { status: 401 });
  }

  const response = await fetch(`${API_URL}/api/ai/estimates/${encodeURIComponent(id)}/docx`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    return new Response("Dokument nicht verfügbar.", { status: response.status });
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/octet-stream",
      "Content-Disposition": response.headers.get("Content-Disposition") ?? `attachment; filename="Aufwandsschaetzung.docx"`,
      "Cache-Control": "no-store",
    },
  });
}
