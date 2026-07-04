import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { Activity, AlertTriangle, Bot, Gauge, Lightbulb, Power, RefreshCcw, Zap } from 'lucide-react';
import { OfficeMap } from './components/OfficeMap.jsx';
import { DevicePanel } from './components/DevicePanel.jsx';
import { AlertsPanel } from './components/AlertsPanel.jsx';
import { UsageBreakdown } from './components/UsageBreakdown.jsx';
import { BotPreview } from './components/BotPreview.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function postScenario(name) {
  const response = await fetch(`${API_URL}/api/demo/scenario/${name}`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Could not run scenario: ${name}`);
  }
  return response.json();
}

function BackgroundVideo() {
  return (
    <div className="video-backdrop" aria-hidden="true">
      <video className="site-bg-video" autoPlay muted loop playsInline preload="auto">
        <source src="/images/background-video.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay" />
    </div>
  );
}

function StatCard({ icon, label, value, hint, tone = 'default' }) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {hint ? <span>{hint}</span> : null}
      </div>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('waiting');
  const [busyScenario, setBusyScenario] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/state`)
      .then((res) => res.json())
      .then(setState)
      .catch(() => setError('Backend is not reachable. Start the backend on port 8080.'));

    const socket = io(API_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('state:snapshot', (snapshot) => {
      setState(snapshot);
      setLastUpdate('initial snapshot');
    });
    socket.on('state:update', ({ reason, snapshot }) => {
      setState(snapshot);
      setLastUpdate(reason);
    });
    socket.on('alert:new', () => {
      setLastUpdate('new alert');
    });

    return () => socket.disconnect();
  }, []);

  const currentTime = useMemo(() => {
    if (!state?.simulatedNow) return '--:--';
    return new Date(state.simulatedNow).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [state?.simulatedNow]);

  async function runScenario(name) {
    setBusyScenario(name);
    setError('');
    try {
      const snapshot = await postScenario(name);
      setState(snapshot);
      setLastUpdate(`scenario: ${name}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyScenario(null);
    }
  }

  if (!state) {
    return (
      <>
        <BackgroundVideo />
        <main className="page loading-page">
          <div className="loader-card">
            <Zap size={38} />
            <h1>Smart Office Energy Monitor</h1>
            <p>{error || 'Connecting to live backend...'}</p>
          </div>
        </main>
      </>
    );
  }

  const activeAlerts = state.alerts.length;
  const usage = state.usage;

  return (
    <>
      <BackgroundVideo />
      <main className="page glass-page">
      <header className="hero">
        <div>
          <p className="eyebrow">Realtime office energy dashboard</p>
          <h1>Smart Office Energy Monitor</h1>
          <p className="hero-copy">
            A realistic top-view office monitor with live room lighting, fan movement, power usage, and alert status from one shared backend.
          </p>
        </div>
        <div className="status-pill" title="Socket.IO realtime status">
          <span className={connected ? 'dot live' : 'dot'} />
          {connected ? 'Live socket connected' : 'Offline'}
        </div>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}

      <section className="stats-grid">
        <StatCard icon={<Gauge size={24} />} label="Current Load" value={`${usage.totalWatts}W`} hint="whole office" />
        <StatCard icon={<Zap size={24} />} label="Today Used" value={`${usage.todayKwh} kWh`} hint={`৳${usage.estimatedCostBdt} estimated`} />
        <StatCard icon={<AlertTriangle size={24} />} label="Active Alerts" value={activeAlerts} hint="after-hours + long-running" tone={activeAlerts ? 'danger' : 'safe'} />
        <StatCard icon={<Activity size={24} />} label="Simulated Time" value={currentTime} hint={`last: ${lastUpdate}`} />
      </section>

      <section className="controls-panel">
        <div>
          <h2>Demo Controls</h2>
          <p>Use these demo scenes to switch the office between a workday, after-hours alert, and quiet night.</p>
        </div>
        <div className="button-row">
          <button onClick={() => runScenario('busy-day')} disabled={Boolean(busyScenario)}><Lightbulb size={16} /> Busy Day</button>
          <button onClick={() => runScenario('after-hours')} disabled={Boolean(busyScenario)}><AlertTriangle size={16} /> Trigger Alert</button>
          <button onClick={() => runScenario('quiet-night')} disabled={Boolean(busyScenario)}><Power size={16} /> Quiet Night</button>
          <button onClick={() => runScenario('reset')} disabled={Boolean(busyScenario)}><RefreshCcw size={16} /> Reset</button>
        </div>
      </section>

      <section className="main-grid">
        <div className="map-card">
          <div className="section-title">
            <div>
              <p className="eyebrow">realistic floor plan</p>
              <h2>Live Office Visualization</h2>
            </div>
            <span className="mini-badge">real room view</span>
          </div>
          <OfficeMap rooms={state.rooms} devices={state.devices} />
        </div>

        <div className="side-stack">
          <UsageBreakdown usage={usage} />
          <AlertsPanel alerts={state.alerts} />
          <BotPreview apiUrl={API_URL} />
        </div>
      </section>

      <section className="devices-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">room-wise live state</p>
            <h2>Live Device Status Panel</h2>
          </div>
          <span className="mini-badge"><Bot size={14} /> Same data feeds Discord</span>
        </div>
        <DevicePanel rooms={state.rooms} devices={state.devices} apiUrl={API_URL} onUpdate={setState} />
      </section>
      </main>
    </>
  );
}
