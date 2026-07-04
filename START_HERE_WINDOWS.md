# Windows Quick Start

Open PowerShell in the project folder and run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\start-windows.ps1
```

Then open:

```text
http://localhost:5173
```

Backend API:

```text
http://localhost:8080
```

For Discord bot support, edit `backend/.env` and add:

```env
DISCORD_BOT_TOKEN=your_token_here
DISCORD_ALERT_CHANNEL_ID=your_channel_id_here
```
