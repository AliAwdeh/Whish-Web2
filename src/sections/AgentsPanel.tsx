import { useCallback, useEffect, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { Agent, AgentForm, StatusMap } from "../types";
import { MapPicker } from "../components/MapPicker";

type Props = {
  agents: Agent[];
  newAgent: AgentForm;
  setNewAgent: Dispatch<SetStateAction<AgentForm>>;
  onCreateAgent: (e: FormEvent<HTMLFormElement>) => void;
  status: StatusMap;
  isAdmin: boolean;
  onUpdateStatus: (id: number, status: string) => void;
  collapsed: boolean;
  onToggle: () => void;
};

export function AgentsPanel({
  agents,
  newAgent,
  setNewAgent,
  onCreateAgent,
  status,
  isAdmin,
  onUpdateStatus,
  collapsed,
  onToggle,
}: Props) {
  const [mapOpen, setMapOpen] = useState(false);

  const workingHourOptions = Array.from({ length: 48 }, (_, idx) => {
    const hour = Math.floor(idx / 2)
      .toString()
      .padStart(2, "0");
    const mins = idx % 2 === 0 ? "00" : "30";
    return `${hour}:${mins}`;
  });

  useEffect(() => {
    if (collapsed) setMapOpen(false);
  }, [collapsed]);

  const handleMapSelect = useCallback(
    (lat: number, lng: number) => {
      setNewAgent((p) => ({
        ...p,
        lat: lat.toFixed(6),
        long: lng.toFixed(6),
      }));
    },
    [setNewAgent]
  );

  const closeMap = useCallback(() => setMapOpen(false), []);

  const initialLat = Number(newAgent.lat) || 31.963158;
  const initialLng = Number(newAgent.long) || 35.930359;

  return (
    <section className={`panel ${collapsed ? "collapsed" : ""}`} id="agents">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Agents & partners</p>
          <h2>Register, track cash-in/out, map coverage</h2>
        </div>
        <div className="inline-row">
          <div className="pill subtle">{agents.length} agent locations</div>
          {!collapsed && (
            <button className="btn ghost small" type="button" onClick={() => setMapOpen(true)}>
              Maps
            </button>
          )}
          <button className="btn ghost small" type="button" onClick={onToggle}>
            {collapsed ? "Manage" : "Hide"}
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="panel-body two-col">
          <form className="form" onSubmit={onCreateAgent}>
            <p className="eyebrow">Register agent</p>
            <label className="field">
              <span>Store name</span>
              <input value={newAgent.store_name} onChange={(e) => setNewAgent((p) => ({ ...p, store_name: e.target.value }))} required />
            </label>
            <label className="field">
              <span>Address</span>
              <input value={newAgent.address} onChange={(e) => setNewAgent((p) => ({ ...p, address: e.target.value }))} />
            </label>
            <label className="field">
              <span>City</span>
              <input value={newAgent.city} onChange={(e) => setNewAgent((p) => ({ ...p, city: e.target.value }))} />
            </label>
            <label className="field">
              <span>Country</span>
              <input value={newAgent.country} onChange={(e) => setNewAgent((p) => ({ ...p, country: e.target.value }))} />
            </label>
            <div className="form-grid">
              <label className="field">
                <span>Latitude</span>
                <input value={newAgent.lat} onChange={(e) => setNewAgent((p) => ({ ...p, lat: e.target.value }))} required />
              </label>
              <label className="field">
                <span>Longitude</span>
                <input value={newAgent.long} onChange={(e) => setNewAgent((p) => ({ ...p, long: e.target.value }))} required />
              </label>
            </div>
            <div className="form-grid">
              <label className="field">
                <span>Working from</span>
                <select value={newAgent.working_from} onChange={(e) => setNewAgent((p) => ({ ...p, working_from: e.target.value }))}>
                  <option value="">Select start</option>
                  {workingHourOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Working to</span>
                <select value={newAgent.working_to} onChange={(e) => setNewAgent((p) => ({ ...p, working_to: e.target.value }))}>
                  <option value="">Select end</option>
                  {workingHourOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button className="btn primary" type="submit" disabled={status.agent === "loading"}>
              Submit agent
            </button>
          </form>

          <div className="map">
            <div className="map-header">
              <div>
                <p className="eyebrow">Coverage map</p>
                <h3>Agents with geolocation</h3>
                <p className="muted">Data stored as lat/long; render on any map library.</p>
              </div>
              <div className="pill subtle">Lat/Long ready</div>
            </div>
            <div className="map-grid">
              {agents.map((agent) => (
                <div key={agent.id} className="map-card">
                  <div className="chip-title">{agent.store_name}</div>
                  <div className="muted">
                    {agent.city}, {agent.country}
                  </div>
                  <div className="muted">{agent.lat ?? "n/a"}, {agent.long ?? agent.lng ?? "n/a"}</div>
                  <div className={`pill ${agent.status === "approved" ? "good" : "subtle"}`}>{agent.status || "pending"}</div>
                  <div className="muted">
                    {Array.isArray(agent.working_hours)
                      ? agent.working_hours.join(" - ")
                      : agent.working_hours || "Hours not set"}
                  </div>
                  {isAdmin && (
                    <div className="inline-row">
                      <button
                        className="btn ghost small"
                        type="button"
                        onClick={() => onUpdateStatus(agent.id, "approved")}
                        disabled={agent.status === "approved"}
                      >
                        Approve
                      </button>
                      <button
                        className="btn ghost small"
                        type="button"
                        onClick={() => onUpdateStatus(agent.id, "rejected")}
                        disabled={agent.status === "rejected"}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <MapPicker
        open={mapOpen}
        onClose={closeMap}
        onSelect={handleMapSelect}
        initialLat={initialLat}
        initialLng={initialLng}
      />
    </section>
  );
}
