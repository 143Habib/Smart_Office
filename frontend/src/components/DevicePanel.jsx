import { Fan, Lightbulb, Power, ToggleLeft, ToggleRight, Gauge } from 'lucide-react';

function iconFor(type, isOn) {
  if (type === 'fan') return <Fan className={isOn ? 'spin-small' : ''} size={18} />;
  if (type === 'light') return <Lightbulb size={18} />;
  return <Gauge size={18} />;
}

function timeAgo(isoDate) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`;
}

export function DevicePanel({ rooms, devices, apiUrl, onUpdate }) {
  async function toggle(device) {
    const response = await fetch(`${apiUrl}/api/devices/${device.id}/toggle`, { method: 'POST' });
    if (response.ok) {
      const payload = await response.json();
      onUpdate(payload.snapshot);
    }
  }

  return (
    <div className="room-status-grid">
      {rooms.map((room) => {
        const roomDevices = devices.filter((device) => device.roomId === room.id);
        return (
          <article className="device-room-card" key={room.id}>
            <div className="device-room-head">
              <div>
                <h3>{room.name}</h3>
                <p>{room.usage?.currentWatts || 0}W · {room.usage?.controllableOnCount || 0}/{room.usage?.visibleDeviceCount || 0} visible ON</p>
              </div>
              <Power size={20} />
            </div>
            <div className="device-list">
              {roomDevices.map((device) => {
                const isOn = device.status === 'on';
                return (
                  <button
                    className={`device-row ${isOn ? 'on' : 'off'} ${!device.isControllable ? 'locked' : ''}`}
                    key={device.id}
                    onClick={() => device.isControllable && toggle(device)}
                    disabled={!device.isControllable}
                    title={device.isControllable ? 'Toggle device' : 'Meter stays on to represent sensing'}
                  >
                    <span className="device-icon">{iconFor(device.type, isOn)}</span>
                    <span className="device-meta">
                      <strong>{device.label}</strong>
                      <small>{device.ratedWatts}W · changed {timeAgo(device.lastChanged)}</small>
                    </span>
                    <span className="toggle-icon">{isOn ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}</span>
                  </button>
                );
              })}
            </div>
          </article>
        );
      })}
    </div>
  );
}
