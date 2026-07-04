import { BarChart3 } from 'lucide-react';

export function UsageBreakdown({ usage }) {
  const max = Math.max(1, ...usage.perRoom.map((room) => room.currentWatts));

  return (
    <section className="panel-card">
      <div className="panel-head">
        <div>
          <p className="eyebrow">power meter</p>
          <h2>Room Breakdown</h2>
        </div>
        <BarChart3 size={22} />
      </div>

      <div className="usage-list">
        {usage.perRoom.map((room) => (
          <div className="usage-row" key={room.roomId}>
            <div>
              <strong>{room.roomName}</strong>
              <span>{room.fansOn} fans · {room.lightsOn} lights ON</span>
            </div>
            <div className="usage-meter">
              <span style={{ width: `${(room.currentWatts / max) * 100}%` }} />
            </div>
            <b>{room.currentWatts}W</b>
          </div>
        ))}
      </div>
    </section>
  );
}
