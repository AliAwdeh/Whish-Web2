import { useEffect, useRef, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { AuthFormState, AuthMode, NotificationItem, RoleOption, StatusMap, User } from "../types";

type Props = {
  authMode: AuthMode;
  setAuthMode: Dispatch<SetStateAction<AuthMode>>;
  authForm: AuthFormState;
  setAuthForm: Dispatch<SetStateAction<AuthFormState>>;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onLogout: () => void;
  status: StatusMap;
  user: User | null;
  notifications: NotificationItem[];
  roleOptions: RoleOption[];
  onGoogleCredential?: (credential: string) => void;
  onGoogleSetupMissing?: () => void;
  googleClientId?: string;
  onGithubRedirect?: () => void;
  githubClientId?: string;
  githubRedirectUri?: string;
};

declare global {
  interface Window {
    google?: any;
  }
}

export function AuthPanel({
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  onSubmit,
  onLogout,
  status,
  user,
  roleOptions,
  onGoogleCredential,
  onGoogleSetupMissing,
  googleClientId,
  onGithubRedirect,
  githubClientId,
  githubRedirectUri,
}: Props) {
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);

  function mountGoogleButton() {
    if (!googleClientId || !onGoogleCredential) return;
    const googleId = window.google?.accounts?.id;
    if (!googleId || !googleBtnRef.current || googleBtnRef.current.childElementCount > 0) return;
    googleId.initialize({
      client_id: googleClientId,
      callback: (response: any) => {
        if (response?.credential) {
          onGoogleCredential(response.credential);
        }
      },
    });
    googleId.renderButton(googleBtnRef.current, { theme: "outline", size: "large", text: "continue_with" });
  }

  useEffect(() => {
    if (!googleClientId || !onGoogleCredential) return;
    let isCancelled = false;
    const scriptSrc = "https://accounts.google.com/gsi/client";

    const renderButton = () => {
      if (isCancelled) return;
      mountGoogleButton();
    };

    if (window.google?.accounts?.id) {
      renderButton();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${scriptSrc}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", renderButton);
      return () => {
        isCancelled = true;
        existingScript.removeEventListener("load", renderButton);
      };
    }

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    script.onerror = () => setGoogleError("Google login failed to load");
    document.body.appendChild(script);

    return () => {
      isCancelled = true;
      script.onload = null;
    };
  }, [googleClientId, onGoogleCredential]);

  return (
    <section className="panel wide" id="auth">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Authentication</p>
          <h2>Login or create an account</h2>
          <p className="muted">
            Register as a user, agent, or admin. Tokens are stored locally so subsequent requests include `Authorization:
            Bearer`.
          </p>
        </div>
        <div className="badge-row">
          <span className="pill good">JWT</span>
          <span className="pill subtle">Role based</span>
        </div>
      </div>
      <div className="panel-body two-col">
        <form className="form" onSubmit={onSubmit}>
          <div className="tab-row">
            {(["login", "register"] as AuthMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                className={`tab ${authMode === mode ? "active" : ""}`}
                onClick={() => setAuthMode(mode)}
              >
                {mode === "login" ? "Login" : "Create account"}
              </button>
            ))}
          </div>
          {authMode === "register" && (
            <label className="field">
              <span>Name</span>
              <input
                value={authForm.name}
                onChange={(e) => setAuthForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Full name"
                required
              />
            </label>
          )}
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={authForm.email}
              onChange={(e) => setAuthForm((p) => ({ ...p, email: e.target.value }))}
              required
              placeholder="you@example.com"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm((p) => ({ ...p, password: e.target.value }))}
              required
              minLength={6}
            />
          </label>
          {authMode === "register" && (
            <label className="field">
              <span>Role</span>
              <select value={authForm.role} onChange={(e) => setAuthForm((p) => ({ ...p, role: e.target.value }))}>
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button className="btn primary" type="submit" disabled={status.auth === "loading"}>
            {status.auth === "loading" ? "Working..." : authMode === "login" ? "Login" : "Register"}
          </button>
          {user && (
            <div className="inline-row">
              <div className="pill good">Logged in as {user.email || user.name || "user"}</div>
              <button className="btn ghost" type="button" onClick={onLogout}>
                Logout
              </button>
            </div>
          )}
        </form>
        <div className="card-stack">
          <div className="card">
            <p className="eyebrow">Platform snapshot</p>
            <h3>Roles & guardrails</h3>
            <ul className="checklist compact">
              <li>Admin: approve agents, manage FX/fees/offers, run reports</li>
              <li>Agent: cash-in/out, commissions, location & hours on map</li>
              <li>User: send/receive, manage beneficiaries & funding methods</li>
            </ul>
          </div>
          <div className="card">
            <p className="eyebrow">Social login</p>
            <h3>Login or sign up</h3>
            <div>
              {googleClientId && onGoogleCredential && !googleError ? (
                <div ref={googleBtnRef} />
              ) : (
                <button className="btn ghost" type="button" onClick={onGoogleSetupMissing}>
                  Enable Google login
                </button>
              )}
              {!googleClientId && <p className="muted">Set VITE_GOOGLE_CLIENT_ID to enable Google login</p>}
              {googleError && <p className="muted">{googleError}</p>}
              <button
                className="btn ghost"
                type="button"
                onClick={onGithubRedirect}
                disabled={!onGithubRedirect || status.authGithub === "loading"}
              >
                {status.authGithub === "loading" ? "Connecting GitHub..." : "Continue with GitHub"}
              </button>
              {(!githubClientId || !githubRedirectUri) && (
                <p className="muted">Set VITE_GITHUB_CLIENT_ID and VITE_GITHUB_REDIRECT_URI to enable GitHub login</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
