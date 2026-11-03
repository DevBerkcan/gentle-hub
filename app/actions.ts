"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/constants";
import { getSessionToken } from "@/lib/session";
import type { ActionFailure, ActionResult, LoginState } from "@/lib/action-types";
import type {
  Agent,
  AgentUpdateInput,
  AiSettings,
  AiSettingsInput,
  Asset,
  AssetInput,
  ConnectionTestResult,
  CrmCustomerMatch,
  EmailConnection,
  EmailConnectionInput,
  EstimateRole,
  EstimateUpdateInput,
  NotificationPreferences,
  PairingCode,
  ProjectInput,
} from "@/lib/types";

function toFailure(error: unknown): ActionFailure {
  if (error instanceof ApiError) {
    return { ok: false, error: error.message, errors: error.errors };
  }

  return { ok: false, error: "Unerwarteter Fehler. Bitte erneut versuchen." };
}

function noSession(): ActionFailure {
  return { ok: false, error: "Deine Sitzung ist abgelaufen. Bitte neu anmelden." };
}

const SECURE_COOKIE = process.env.NODE_ENV === "production";

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Bitte E-Mail-Adresse und Passwort eingeben." };
  }

  let response;
  try {
    response = await api.login(email, password);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 429) {
        return { error: "Zu viele Fehlversuche. Bitte in einigen Minuten erneut versuchen." };
      }
      if (error.status === 401) {
        return { error: "E-Mail-Adresse oder Passwort ist falsch." };
      }
      return { error: error.message };
    }
    return { error: "Anmeldung fehlgeschlagen. Bitte erneut versuchen." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, response.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: SECURE_COOKIE,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    try {
      await api.logout(token);
    } catch {
      // The local cookie is cleared even when the API is unreachable.
    }
  }

  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult<{ message: string }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const response = await api.changePassword(token, input.currentPassword, input.newPassword);
    return { ok: true, message: response.message };
  } catch (error) {
    return toFailure(error);
  }
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function createProjectAction(
  input: ProjectInput,
): Promise<ActionResult<{ slug: string }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const response = await api.createProject(token, input);
    revalidatePath("/", "layout");
    return { ok: true, slug: response.slug };
  } catch (error) {
    return toFailure(error);
  }
}

export async function updateProjectAction(
  key: string,
  input: ProjectInput,
): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.updateProject(token, key, input);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

export async function deleteProjectAction(key: string): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.deleteProject(token, key);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

export async function setFavoriteAction(
  key: string,
  favorite: boolean,
): Promise<ActionResult<{ favorite: boolean }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const response = await api.setFavorite(token, key, favorite);
    revalidatePath("/", "layout");
    return { ok: true, favorite: response.favorite };
  } catch (error) {
    return toFailure(error);
  }
}

export async function saveNotesAction(key: string, notes: string): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.updateNotes(token, key, notes);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

export async function createAssetAction(
  projectKey: string,
  input: AssetInput,
): Promise<ActionResult<{ asset: Asset }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const asset = await api.createAsset(token, projectKey, input);
    revalidatePath("/", "layout");
    return { ok: true, asset };
  } catch (error) {
    return toFailure(error);
  }
}

export async function updateAssetAction(
  id: string,
  input: AssetInput,
): Promise<ActionResult<{ asset: Asset }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const asset = await api.updateAsset(token, id, input);
    revalidatePath("/", "layout");
    return { ok: true, asset };
  } catch (error) {
    return toFailure(error);
  }
}

export async function deleteAssetAction(id: string): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.deleteAsset(token, id);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

export async function revealSecretAction(
  id: string,
): Promise<ActionResult<{ secret: string; label: string }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const response = await api.revealAsset(token, id);
    return { ok: true, secret: response.secret, label: response.label };
  } catch (error) {
    return toFailure(error);
  }
}

// ---------------------------------------------------------------------------
// AI Operations
// ---------------------------------------------------------------------------

export async function updateAiAgentAction(
  id: string,
  input: AgentUpdateInput,
): Promise<ActionResult<{ agent: Agent }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const agent = await api.updateAiAgent(token, id, input);
    revalidatePath("/ai", "layout");
    return { ok: true, agent };
  } catch (error) {
    return toFailure(error);
  }
}

export async function addAiAgentPromptAction(
  id: string,
  systemPrompt: string,
  changeNote: string,
): Promise<ActionResult<{ version: number }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const { version } = await api.addAiAgentPrompt(token, id, systemPrompt, changeNote);
    revalidatePath("/ai", "layout");
    return { ok: true, version };
  } catch (error) {
    return toFailure(error);
  }
}

export async function testRunAiAgentAction(id: string): Promise<ActionResult<{ jobId: string }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const { jobId } = await api.testRunAiAgent(token, id);
    revalidatePath("/ai", "layout");
    return { ok: true, jobId };
  } catch (error) {
    return toFailure(error);
  }
}

export async function retryAiJobAction(id: string): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.retryAiJob(token, id);
    revalidatePath("/ai", "layout");
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

export async function cancelAiJobAction(id: string): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.cancelAiJob(token, id);
    revalidatePath("/ai", "layout");
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

export async function updateAiSettingsAction(
  input: AiSettingsInput,
): Promise<ActionResult<{ settings: AiSettings }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const settings = await api.updateAiSettings(token, input);
    revalidatePath("/ai", "layout");
    return { ok: true, settings };
  } catch (error) {
    return toFailure(error);
  }
}

// ---------------------------------------------------------------------------
// Mailboxes & E-Mail Intelligence
// ---------------------------------------------------------------------------

export async function saveEmailConnectionAction(
  id: string | null,
  input: EmailConnectionInput,
): Promise<ActionResult<{ connection: EmailConnection }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const connection = id
      ? await api.updateEmailConnection(token, id, input)
      : await api.createEmailConnection(token, input);
    revalidatePath("/ai", "layout");
    return { ok: true, connection };
  } catch (error) {
    return toFailure(error);
  }
}

export async function testEmailConnectionAction(id: string): Promise<ActionResult<{ result: ConnectionTestResult }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const result = await api.testEmailConnection(token, id);
    revalidatePath("/ai/connections");
    return { ok: true, result };
  } catch (error) {
    return toFailure(error);
  }
}

export async function syncEmailConnectionAction(id: string): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.syncEmailConnection(token, id);
    revalidatePath("/ai", "layout");
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

export async function reanalyzeEmailAction(id: string): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.reanalyzeEmail(token, id);
    revalidatePath("/ai", "layout");
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

// ---------------------------------------------------------------------------
// Messenger
// ---------------------------------------------------------------------------

export async function pairTelegramAction(): Promise<ActionResult<{ pairing: PairingCode }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const pairing = await api.pairTelegram(token);
    return { ok: true, pairing };
  } catch (error) {
    return toFailure(error);
  }
}

export async function updateMessengerPreferencesAction(
  id: string,
  preferences: NotificationPreferences,
  quietFrom: string,
  quietTo: string,
): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.updateMessengerPreferences(token, id, preferences, quietFrom, quietTo);
    revalidatePath("/ai/connections");
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

export async function revokeMessengerAction(id: string): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.revokeMessenger(token, id);
    revalidatePath("/ai/connections");
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

export async function sendTelegramTestAction(): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.sendTelegramTest(token);
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

// ---------------------------------------------------------------------------
// GentleSuite CRM
// ---------------------------------------------------------------------------

export async function searchCrmCustomersAction(query: string): Promise<ActionResult<{ items: CrmCustomerMatch[] }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const { items } = await api.searchCrmCustomers(token, query);
    return { ok: true, items };
  } catch (error) {
    return toFailure(error);
  }
}

export async function setEmailCrmLinkAction(emailId: string, customerId: string | null): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.setEmailCrmLink(token, emailId, customerId);
    revalidatePath(`/ai/emails/${emailId}`);
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

// ---------------------------------------------------------------------------
// Approvals & estimates
// ---------------------------------------------------------------------------

export async function decideApprovalAction(
  id: string,
  approve: boolean,
  version: number,
  contentHash: string,
  note: string,
): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.decideApproval(token, id, { approve, version, contentHash, note });
    revalidatePath("/ai", "layout");
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

export async function updateEstimateAction(
  id: string,
  input: EstimateUpdateInput,
): Promise<ActionResult<{ approvalVersion: number }>> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    const { approvalVersion } = await api.updateEstimate(token, id, input);
    revalidatePath("/ai", "layout");
    return { ok: true, approvalVersion };
  } catch (error) {
    return toFailure(error);
  }
}

export async function regenerateEstimateAction(id: string): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.regenerateEstimate(token, id);
    revalidatePath("/ai", "layout");
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

export async function startEstimateForEmailAction(emailId: string): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.startEstimateForEmail(token, emailId);
    revalidatePath(`/ai/emails/${emailId}`);
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

export async function updateEstimateSettingsAction(
  rates: Record<EstimateRole, number>,
  bufferPercent: number,
): Promise<ActionResult> {
  const token = await getSessionToken();
  if (!token) return noSession();

  try {
    await api.updateEstimateSettings(token, rates, bufferPercent);
    revalidatePath("/ai/settings");
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}
