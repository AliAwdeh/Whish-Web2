import type { AdminSummary, User } from "../types";

type Props = {
  adminSummary: AdminSummary | null;
  transfersCount: number;
  agentsCount: number;
  user: User | null;
  collapsed: boolean;
  onToggle: () => void;
};

export function ReportsPanel({ adminSummary, transfersCount, agentsCount, user, collapsed, onToggle }: Props) {
  return (
    <section className={`panel ${collapsed ? "collapsed" : ""}`} id="reports">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Reporting & compliance</p>
          <h2>Platform summary</h2>
        </div>
        <div className="inline-row">
          <div className="pill subtle">Endpoint: /admin/reports/summary</div>
          <button className="btn ghost small" type="button" onClick={onToggle}>
            {collapsed ? "View" : "Hide"}
          </button>
        </div>
      </div>
      {!collapsed && (
        <>
          <div className="summary-grid">
            <div className="summary-card">
              <p className="muted">Total transfers</p>
              <h3>{adminSummary?.transfers || transfersCount || 0}</h3>
            </div>
            <div className="summary-card">
              <p className="muted">Users</p>
              <h3>{adminSummary?.users || (user ? 1 : 0)}</h3>
            </div>
            <div className="summary-card">
              <p className="muted">Agents</p>
              <h3>{adminSummary?.agents || agentsCount}</h3>
            </div>
            <div className="summary-card">
              <p className="muted">Disputes</p>
              <h3>{adminSummary?.disputes || 0}</h3>
            </div>
          </div>
          <div className="chip-row">
        <div className="chip">
          <div className="pill subtle">Fraud</div>
          <div className="chip-title">Dispute & refund flow</div>
          <div className="muted">Open &gt; in_review &gt; resolved/rejected</div>
        </div>
            <div className="chip">
              <div className="pill subtle">Support</div>
              <div className="chip-title">Chatbot-ready</div>
              <div className="muted">Connect to the support endpoint or embed widget</div>
            </div>
            <div className="chip">
              <div className="pill subtle">Notifications</div>
              <div className="chip-title">Email / SMS / in-app</div>
              <div className="muted">Use NotificationController to mark read</div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
