import type { FormEvent } from "react";
import type { ChatMessage } from "../types";

type Props = {
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: (e: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  systemPrompt: string;
  collapsed?: boolean;
  onToggle?: () => void;
  variant?: "panel" | "page";
};

export function SupportChatPanel({
  messages,
  input,
  onInputChange,
  onSend,
  loading,
  systemPrompt,
  collapsed = false,
  onToggle,
  variant = "panel",
}: Props) {
  const isPage = variant === "page";
  return (
    <section className={`panel ${collapsed ? "collapsed" : ""}`} id="support">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Support chatbot</p>
          <h2>Chat with Ollama support agent</h2>
          <p className="muted">Backed by https://ai.aliawdeh.com (Ollama). System prompt declares the support role.</p>
        </div>
        <div className="inline-row">
          <div className="pill subtle">Endpoint: /api/chat</div>
          {!isPage && onToggle && (
            <button className="btn ghost small" type="button" onClick={onToggle}>
              {collapsed ? "Open chat" : "Hide"}
            </button>
          )}
        </div>
      </div>

      {(isPage || !collapsed) && (
        <>
          <div className="card chat-log">
            <div className="muted" style={{ marginBottom: 8 }}>
              System prompt: {systemPrompt}
            </div>
            <div className="notification-list">
              {messages.map((m, idx) => (
                <div key={idx} className="notification">
                  <div className={`pill ${m.role === "assistant" ? "good" : "subtle"}`}>{m.role}</div>
                  <div>{m.content || (m.role === "assistant" && loading ? "Thinking..." : "")}</div>
                </div>
              ))}
            </div>
          </div>

          <form className="form" onSubmit={onSend}>
            <label className="field">
              <span>Ask a question</span>
              <textarea
                rows={3}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="Ask about transfers, disputes, agents, compliance..."
              />
            </label>
            <button className="btn primary" type="submit" disabled={loading || !input.trim()}>
              {loading ? "Asking Ollama..." : "Send"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
