const ROOM_LABELS = {
  drawing: 'Drawing Room',
  work1: 'Work Room 1',
  work2: 'Work Room 2'
};

// Coordinates are locked to the 519x313 reference floor-plan image.
// The floor-plan background has no baked-in fans; this single overlay draws each fan, so there is no fan-over-fan mismatch.
const DEVICE_POSITIONS = {
  drawing: {
    'Fan 1': { x: 20.0, y: 14.2, kind: 'fan' },
    'Fan 2': { x: 20.0, y: 53.4, kind: 'fan' },
    'Light 1': { x: 11.4, y: 13.4, kind: 'light' },
    'Light 2': { x: 28.7, y: 13.4, kind: 'light' },
    'Light 3': { x: 20.0, y: 69.0, kind: 'light' }
  },
  work1: {
    'Fan 1': { x: 51.4, y: 14.2, kind: 'fan' },
    'Fan 2': { x: 51.4, y: 50.8, kind: 'fan' },
    'Light 1': { x: 42.8, y: 13.4, kind: 'light' },
    'Light 2': { x: 60.3, y: 13.4, kind: 'light' },
    'Light 3': { x: 51.4, y: 69.0, kind: 'light' }
  },
  work2: {
    'Fan 1': { x: 83.0, y: 14.2, kind: 'fan' },
    'Fan 2': { x: 83.0, y: 50.8, kind: 'fan' },
    'Light 1': { x: 74.2, y: 13.4, kind: 'light' },
    'Light 2': { x: 91.7, y: 13.4, kind: 'light' },
    'Light 3': { x: 83.0, y: 69.0, kind: 'light' }
  }
};

function FanOverlay({ isOn }) {
  return (
    <span className={`floor-fan-state ${isOn ? 'fan-on' : 'fan-off'}`} aria-hidden="true">
      <span className="real-fan-rotor">
        <i className="real-fan-blade blade-a" />
        <i className="real-fan-blade blade-b" />
        <i className="real-fan-blade blade-c" />
        <i className="real-fan-hub" />
      </span>
      <span className="fan-air-shadow" />
    </span>
  );
}

function LightOverlay({ isOn }) {
  return (
    <span className={`floor-light-state ${isOn ? 'light-on' : 'light-off'}`} aria-hidden="true">
      <i />
    </span>
  );
}

function DeviceOverlay({ device }) {
  const pos = DEVICE_POSITIONS[device.roomId]?.[device.label];
  if (!pos) return null;
  const isOn = device.status === 'on';

  return (
    <button
      type="button"
      className={`floor-device-hotspot ${pos.kind} ${isOn ? 'is-on' : 'is-off'}`}
      style={{ '--x': `${pos.x}%`, '--y': `${pos.y}%` }}
      title={`${ROOM_LABELS[device.roomId]} · ${device.label} · ${device.status.toUpperCase()} · ${isOn ? device.ratedWatts : 0}W`}
      aria-label={`${ROOM_LABELS[device.roomId]} ${device.label} is ${device.status}`}
    >
      {pos.kind === 'fan' ? <FanOverlay isOn={isOn} /> : <LightOverlay isOn={isOn} />}
    </button>
  );
}

function RoomStat({ room }) {
  const onCount = room.usage?.controllableOnCount || 0;
  const watts = room.usage?.currentWatts || 0;
  const isActive = onCount > 0;

  return (
    <article className={`floor-room-stat ${isActive ? 'active' : 'quiet'}`}>
      <span>{room.name}</span>
      <strong>{watts}W</strong>
      <small>{onCount}/5 ON</small>
    </article>
  );
}

export function OfficeMap({ rooms, devices }) {
  const visibleDevices = devices.filter((device) => device.isVisibleOnMap);
  const onDevices = visibleDevices.filter((device) => device.status === 'on').length;
  const totalWatts = rooms.reduce((sum, room) => sum + (room.usage?.currentWatts || 0), 0);

  return (
    <div className="office-shell exact-floorplan-shell">
      <div className="exact-map-panel">
        <div className="exact-map-toolbar">
          <span>Clean realistic floor plan</span>
          <strong>{onDevices}/15 ON · {totalWatts}W</strong>
        </div>

        <div className="exact-floorplan" role="img" aria-label="Top-view office floor plan with live light and fan state effects">
          <img src="/floor-plan-perfect.png" alt="Office floor plan" />
          <div className="exact-state-layer">
            {visibleDevices.map((device) => <DeviceOverlay key={device.id} device={device} />)}
          </div>
        </div>

        <div className="floor-room-stats" aria-label="Room power summary">
          {rooms.map((room) => <RoomStat key={room.id} room={room} />)}
        </div>
      </div>

      <aside className="exact-side-note">
        <h3>State guide</h3>
        <p><span className="guide-dot light-guide" /> Warm glow = light ON</p>
        <p><span className="guide-dot dim-guide" /> Dark cover = light OFF</p>
        <p><span className="guide-dot fan-guide" /> Fan blades spin only when ON</p>
        <div>
          <strong>Live usage</strong>
          {rooms.map((room) => (
            <span key={room.id}>{room.name}: {room.usage?.currentWatts || 0}W</span>
          ))}
        </div>
      </aside>
    </div>
  );
}
