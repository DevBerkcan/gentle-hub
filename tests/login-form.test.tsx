import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const signInEmail = vi.hoisted(() => vi.fn());
const router = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));

vi.mock("@/lib/auth-client", () => ({ authClient: { signIn: { email: signInEmail } } }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const { LoginForm } = await import("@/components/auth/login-form");

beforeEach(() => vi.clearAllMocks());

async function submit(email: string, password: string) {
  const user = userEvent.setup();
  render(<LoginForm />);
  await user.type(screen.getByLabelText("E-Mail-Adresse"), email);
  await user.type(screen.getByLabelText("Passwort"), password);
  await user.click(screen.getByRole("button", { name: "Anmelden" }));
}

describe("LoginForm", () => {
  it("signs in with e-mail and password and goes to the hub", async () => {
    signInEmail.mockResolvedValue({ error: null });
    await submit(" berkcan@gentlegroup.de ", "ein-sicheres-passwort");
    expect(signInEmail).toHaveBeenCalledWith({
      email: "berkcan@gentlegroup.de",
      password: "ein-sicheres-passwort",
      rememberMe: true,
    });
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("shows one generic error for wrong credentials and clears the password", async () => {
    signInEmail.mockResolvedValue({ error: { status: 401 } });
    await submit("berkcan@gentlegroup.de", "falsch-falsch-falsch");
    expect(screen.getByRole("alert")).toHaveTextContent("E-Mail-Adresse oder Passwort ist falsch.");
    expect(screen.getByLabelText("Passwort")).toHaveValue("");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("explains rate limiting", async () => {
    signInEmail.mockResolvedValue({ error: { status: 429 } });
    await submit("berkcan@gentlegroup.de", "irgendein-passwort");
    expect(screen.getByRole("alert")).toHaveTextContent("Zu viele Versuche");
  });
});
