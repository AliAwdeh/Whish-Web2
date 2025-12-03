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
};

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
}: Props) {
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
        </div>
      </div>
    </section>
  );
}
