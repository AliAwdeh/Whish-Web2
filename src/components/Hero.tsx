type HeroProps = {
  apiBase: string;
  currenciesCount: number;
  beneficiariesCount: number;
};

export function Hero({ apiBase, currenciesCount, beneficiariesCount }: HeroProps) {
  return (
    <header className="topbar">
      <div>
        <div className="pill">Whish Money Transfer Portal</div>
        <h1>
          Fast, compliant, multi-role portal for <span className="accent">cross-border</span> payouts.
        </h1>
        <p className="lede">
          Orchestrate users, agents, and admins with the Laravel API below. Calculate quotes, onboard partners, and
          launch transfers without leaving this page.
        </p>
        <div className="cta-row">
          <a className="btn primary" href="#transfers">
            Launch a transfer
          </a>
          <a className="btn ghost" href="#admin">
            Configure fees & FX
          </a>
          <div className="pill subtle">API Base: {apiBase}</div>
        </div>
        <div className="stats">
          <div className="stat">
            <div className="stat-value">24/7</div>
            <div className="stat-label">Instant payouts & same-day options</div>
          </div>
          <div className="stat">
            <div className="stat-value">{currenciesCount}</div>
            <div className="stat-label">Supported currencies live in config</div>
          </div>
          <div className="stat">
            <div className="stat-value">{beneficiariesCount}</div>
            <div className="stat-label">Beneficiaries ready to receive</div>
          </div>
          <div className="stat">
            <div className="stat-value">3</div>
            <div className="stat-label">Role-ready: Admin, User, Agent</div>
          </div>
        </div>
      </div>
      <div className="hero-panel">
        <div className="panel-title">What you can do</div>
        <ul className="checklist">
          <li>Register/login (user/agent/admin) with JWT</li>
          <li>Add payout beneficiaries & payment methods</li>
          <li>Search transfer routes, fees, FX, offers</li>
          <li>Initiate, cancel, dispute or refund transfers</li>
          <li>Approve agents, manage commissions & reports</li>
          <li>Trigger notifications and capture reviews</li>
        </ul>
        <div className="badge-row">
          <span className="pill good">Secure JWT</span>
          <span className="pill good">Role aware</span>
          <span className="pill subtle">Map for agents</span>
          <span className="pill good">Real-time status logs</span>
        </div>
      </div>
    </header>
  );
}
