# 3-Minute Demo Script

## 0:00–0:20 — Problem

"This office uses Discord every day, but people forget lights and fans after leaving. Our system monitors every room in real time, estimates electricity usage, and alerts the boss through both a web dashboard and Discord."

## 0:20–1:05 — Dashboard

Show the dashboard:

- Current total wattage.
- Per-room breakdown.
- Top-view office map.
- Lights glowing when ON.
- Fans spinning when ON.
- Live device status cards.

## 1:05–1:35 — Real-time simulation

Click **Busy Day** and explain:

"The simulator changes room states over time. The web UI updates through Socket.IO without refresh."

## 1:35–2:10 — Discord bot

In Discord, run:

```text
!status
!room work2
!usage
```

Explain:

"The bot is not hardcoded. It reads the same backend store used by the dashboard."

## 2:10–2:40 — Alert bonus

Click **Trigger Alert**.

Show:

- Work Room 2 devices all ON at 10 PM.
- Dashboard alert panel.
- Proactive Discord alert message if `DISCORD_ALERT_CHANNEL_ID` is configured.

## 2:40–3:00 — Architecture

Show `docs/architecture.svg` and say:

"The simulator writes to one backend state. The dashboard receives WebSocket updates, the bot reads the same backend, and the alert engine sends warnings to both."
