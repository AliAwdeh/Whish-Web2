import type { NotificationItem } from "../types";

type Props = {
  notifications: NotificationItem[];
};

export function NotificationsPanel({ notifications }: Props) {
  return (
    <section className="panel" id="notifications">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Notifications</p>
          <h2>Latest activity</h2>
          <p className="muted">Messages, approvals, and system signals.</p>
        </div>
        <span className="pill subtle">{notifications.length} items</span>
      </div>
      <div className="notification-list">
        {notifications.length === 0 && <p className="muted">No notifications yet.</p>}
        {notifications.map((note) => (
          <div key={note.id} className={`notification ${note.read ? "read" : ""}`}>
            <div className="pill subtle">{note.type || `#${note.id}`}</div>
            <div>
              <div className="notif-title">{note.title || note.message || "Notification"}</div>
              <div className="muted">
                {note.detail || (note.data && JSON.stringify(note.data)) || "No extra details"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
