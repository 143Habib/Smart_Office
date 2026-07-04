import 'dotenv/config';
import http from 'node:http';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server as SocketIOServer } from 'socket.io';
import { officeStore } from './store.js';
import { startSimulator } from './simulator.js';
import { startDiscordBot } from './bot.js';
import { formatAlerts, formatRoom, formatSavings, formatStatus, formatUsage } from './formatters.js';

const PORT = Number(process.env.PORT || 8080);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST']
  }
});

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());
app.use(morgan('dev'));

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'smart-office-energy-backend', now: new Date().toISOString() });
});

app.get('/api/state', (_req, res) => {
  res.json(officeStore.getSnapshot());
});

app.get('/api/devices', (_req, res) => {
  res.json({ devices: officeStore.getSnapshot().devices });
});

app.get('/api/rooms', (_req, res) => {
  res.json({ rooms: officeStore.getSnapshot().rooms });
});

app.get('/api/usage', (_req, res) => {
  res.json({ usage: officeStore.getSnapshot().usage });
});

app.get('/api/alerts', (_req, res) => {
  res.json({ alerts: officeStore.getSnapshot().alerts });
});

app.get('/api/bot-preview/:command', (req, res) => {
  const snapshot = officeStore.getSnapshot();
  const command = req.params.command;
  const room = req.query.room;

  const responses = {
    status: formatStatus(snapshot),
    usage: formatUsage(snapshot),
    alerts: formatAlerts(snapshot),
    save: formatSavings(snapshot),
    room: formatRoom(snapshot, room || 'work2')
  };

  if (!responses[command]) {
    res.status(404).json({ error: 'Unknown preview command' });
    return;
  }
  res.json({ command, response: responses[command] });
});

app.post('/api/devices/:deviceId/toggle', asyncRoute(async (req, res) => {
  const device = officeStore.toggleDevice(req.params.deviceId);
  res.json({ device, snapshot: officeStore.getSnapshot() });
}));

app.post('/api/devices/:deviceId/status', asyncRoute(async (req, res) => {
  const { status } = req.body;
  if (!['on', 'off'].includes(status)) {
    res.status(400).json({ error: 'status must be on or off' });
    return;
  }
  const device = officeStore.setDeviceStatus(req.params.deviceId, status);
  res.json({ device, snapshot: officeStore.getSnapshot() });
}));

app.post('/api/demo/scenario/:name', asyncRoute(async (req, res) => {
  const snapshot = officeStore.applyScenario(req.params.name);
  res.json(snapshot);
}));

io.on('connection', (socket) => {
  socket.emit('state:snapshot', officeStore.getSnapshot());
  socket.on('demo:scenario', (name, ack) => {
    try {
      const snapshot = officeStore.applyScenario(name);
      ack?.({ ok: true, snapshot });
    } catch (error) {
      ack?.({ ok: false, error: error.message });
    }
  });
});

officeStore.on('state:update', ({ reason, snapshot }) => {
  io.emit('state:update', { reason, snapshot });
});

officeStore.on('alert:new', (alert) => {
  io.emit('alert:new', alert);
});

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

server.listen(PORT, async () => {
  console.log(`[server] Smart office backend listening on http://localhost:${PORT}`);
  console.log(`[server] CORS origin: ${FRONTEND_ORIGIN}`);
  if (process.env.ENABLE_SIMULATOR !== 'false') {
    startSimulator(officeStore);
    console.log('[simulator] Dynamic device simulator started.');
  }
  try {
    await startDiscordBot(officeStore);
  } catch (error) {
    console.error('[discord] Bot startup failed:', error.message);
  }
});
