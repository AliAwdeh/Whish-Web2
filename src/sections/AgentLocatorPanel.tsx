import type { Agent } from "../types";

type Props = {
  agents: Agent[];
  collapsed: boolean;
  onToggle: () => void;
};

const formatHours = (hours?: string | string[]) => {
  if (!hours) return "Hours not set";
  return Array.isArray(hours) ? hours.join(" - ") : hours;
};

export function AgentLocatorPanel({ agents, collapsed, onToggle }: Props) {
  return (
    <section className={`panel ${collapsed ? "collapsed" : ""}`} id="agent-locator">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Agent locator</p>
          <h2>Find nearby agent locations</h2>
          <p className="muted">Browse agents and open their exact location in Google Maps.</p>
        </div>
        <div className="inline-row">
          <div className="pill subtle">{agents.length} agents</div>
          <button className="btn ghost small" type="button" onClick={onToggle}>
            {collapsed ? "View agents" : "Hide"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="map-grid">
          {agents.length === 0 && <div className="muted">No agents available yet.</div>}
          {agents.map((agent) => {
            const lat = typeof agent.lat === "string" ? Number(agent.lat) : agent.lat;
            const lng = typeof agent.long === "string" ? Number(agent.long) : agent.long;
            const hasLocation = typeof lat === "number" && !Number.isNaN(lat) && typeof lng === "number" && !Number.isNaN(lng);
            const mapsUrl = hasLocation ? `https://www.google.com/maps?q=${lat},${lng}` : undefined;
            return (
              <div key={agent.id} className="map-card">
                <div className="chip-title">{agent.store_name}</div>
                <div className="muted">
                  {agent.city}, {agent.country}
                </div>
                <div className="muted">{formatHours(agent.working_hours)}</div>
                <div className={`pill ${agent.status === "approved" ? "good" : "subtle"}`}>{agent.status || "pending"}</div>
                <div className="muted">
                  {hasLocation ? `${lat}, ${lng}` : "Location missing"}
                </div>
                <div className="inline-row">
                  <a
                    className="btn primary small"
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-disabled={!hasLocation}
                    style={{ opacity: hasLocation ? 1 : 0.5, pointerEvents: hasLocation ? "auto" : "none" }}
                  >
                    View location
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
