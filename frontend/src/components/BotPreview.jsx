import { useState } from 'react';
import { Bot, Send } from 'lucide-react';

export function BotPreview({ apiUrl }) {
  const [response, setResponse] = useState('Click a command to preview the same human-friendly response the Discord bot sends.');
  const [loading, setLoading] = useState(false);

  async function preview(command, room) {
    setLoading(true);
    try {
      const url = new URL(`${apiUrl}/api/bot-preview/${command}`);
      if (room) url.searchParams.set('room', room);
      const res = await fetch(url);
      const payload = await res.json();
      setResponse(payload.response || payload.error || 'No response');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel-card bot-card">
      <div className="panel-head">
        <div>
          <p className="eyebrow">discord remote control</p>
          <h2>Bot Preview</h2>
        </div>
        <Bot size={22} />
      </div>
      <div className="bot-buttons">
        <button onClick={() => preview('status')}>!status</button>
        <button onClick={() => preview('room', 'work2')}>!room work2</button>
        <button onClick={() => preview('usage')}>!usage</button>
        <button onClick={() => preview('alerts')}>!alerts</button>
      </div>
      <div className="bot-message">
        <Send size={16} />
        <p>{loading ? 'Reading live backend data...' : response}</p>
      </div>
    </section>
  );
}
