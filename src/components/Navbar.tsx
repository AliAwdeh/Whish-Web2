import type { User } from "../types";

type Props = {
  user: User;
  onLogout: () => void;
  onNavigateChat: () => void;
  onNavigateHome: () => void;
  isChatPage: boolean;
};

export function Navbar({ user, onLogout, onNavigateChat, onNavigateHome, isChatPage }: Props) {
  const displayName = user.name || user.email || "User";

  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-mark" />
        <div>
          <div className="brand-name">Whish Portal</div>
          <div className="muted">Frontend workspace</div>
        </div>
      </div>
      <div className="nav-actions">
        <span className="pill subtle">Role: {user.role || "user"}</span>
        <span className="pill good">Signed in as {displayName}</span>
        {isChatPage ? (
          <button className="btn ghost small" type="button" onClick={onNavigateHome}>
            Back to dashboard
          </button>
        ) : (
          <button className="btn ghost small" type="button" onClick={onNavigateChat}>
            Chatbot
          </button>
        )}
        <button className="btn primary small" type="button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
