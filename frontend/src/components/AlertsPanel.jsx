import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export function AlertsPanel({ alerts }) {
  return (
    <section className="panel-card alerts-card">
      <div className="panel-head">
        <div>
          <p className="eyebrow">anomaly engine</p>
          <h2>Active Alerts</h2>
        </div>
        {alerts.length ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
      </div>

      {alerts.length === 0 ? (
        <div className="empty-state">
          <CheckCircle2 size={28} />
          <p>No active alerts. Office usage looks normal.</p>
        </div>
      ) : (
        <div className="alert-list">
          {alerts.map((alert) => (
            <article key={alert.id} className={`alert-item ${alert.severity}`}>
              <strong>{alert.title}</strong>
              <p>{alert.message}</p>
              <time>{new Date(alert.createdAt).toLocaleString()}</time>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
