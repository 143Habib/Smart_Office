

# ⚡ Smart Office Energy Monitor

<div align="center">

### A Real-Time Energy Monitoring Dashboard + Discord Chatbot  
#### Built for **Techathon Nationals — Preliminary Round**

<br />

![Node.js](https://img.shields.io/badge/Backend-Node.js-3C873A?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Discord](https://img.shields.io/badge/Bot-Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Status](https://img.shields.io/badge/Status-Competition%20Ready-success?style=for-the-badge)

<br />

**Monitor lights, fans, power usage, and energy alerts from a live web dashboard and Discord bot.**

</div>

---

## ✨ Project Overview

**Smart Office Energy Monitor** is a real-time monitoring system for an office where people often forget to turn off lights and fans after work.

The system gives the office boss a live view of:

- Which lights and fans are currently ON or OFF
- How much power the office is consuming right now
- Which room is using the most electricity
- Whether any device is left ON after office hours
- A Discord bot for quick status checking without opening the dashboard

The dashboard and Discord bot both read from the **same shared backend**, so they always show the same live simulated office state.

---

## 🏢 Office Scenario

The office has three rooms:

| Room | Purpose | Devices |
|---|---|---|
| Drawing Room | Waiting / sitting area | 2 Fans + 3 Lights |
| Work Room 1 | Employee workspace | 2 Fans + 3 Lights |
| Work Room 2 | Employee workspace | 2 Fans + 3 Lights |

> Note: The problem statement contains a small device-count mismatch. The visible office layout defines **3 rooms × 5 devices = 15 devices**. This project follows the visible office layout and keeps the system modular so more devices can be added easily.

---

## 🌟 Key Highlights

### ✅ Real-Time Dashboard

- Live office monitoring dashboard
- Realistic top-view office floor plan
- Lights glow when ON
- Fans animate when running
- Total power usage in Watts
- Room-wise power breakdown
- Live device status cards
- Active alerts panel
- Video background
- Glassmorphism UI panels
- Updates without manual refresh

### ✅ Discord Chatbot

The Discord bot acts as the boss’s quick-access assistant.

Supported commands:

```txt
!help
!status
!usage
!room drawing
!room work1
!room work2
!alerts
!save
````

The bot does **not** return hardcoded answers. It reads from the same backend data used by the dashboard.

### ✅ Smart Alerts

The system detects:

* Devices left ON after office hours
* High power usage
* Room-level abnormal usage
* Devices running for too long

Alerts are displayed on the dashboard and can also be posted to a Discord channel.

---

## 🖼️ Dashboard Preview

> Add your final dashboard screenshot here.

```md
![Dashboard Preview](./docs/dashboard-preview.png)
```

Current floor plan and live overlay are included inside the frontend assets.

---

## 🧠 System Architecture

```txt
┌──────────────────────────┐
│  Simulated Device Layer  │
│  Lights, Fans, Wattage   │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│    Shared Backend API    │
│ Express + Socket.IO      │
│ Alert Engine + Simulator │
└─────────────┬────────────┘
              │
     ┌────────┴────────┐
     ▼                 ▼
┌──────────────┐   ┌──────────────┐
│ Web Dashboard│   │ Discord Bot  │
│ React + Live │   │ Commands +   │
│ Socket Data  │   │ Alerts       │
└──────────────┘   └──────────────┘
     │                 │
     ▼                 ▼
┌──────────────────────────┐
│          User            │
│ Boss / Office Members    │
└──────────────────────────┘
```

---

## 🔄 Live Data Flow

```txt
Device simulator changes ON/OFF state
        ↓
Backend updates the device store
        ↓
Power usage is recalculated
        ↓
Alert engine checks abnormal conditions
        ↓
Socket.IO emits the new live state
        ↓
Dashboard updates instantly
        ↓
Discord bot answers from the same backend
```

---

## 📌 Competition Requirement Coverage

| Requirement                  | Implementation                   |
| ---------------------------- | -------------------------------- |
| Real-time web dashboard      | Completed with React + Socket.IO |
| Live device status panel     | Completed                        |
| Live power meter             | Completed                        |
| Room-wise power breakdown    | Completed                        |
| Active alerts panel          | Completed                        |
| Discord bot                  | Completed with Discord.js        |
| Bot uses real simulated data | Completed                        |
| Shared backend               | Completed                        |
| System diagram               | Included                         |
| Hardware schematic concept   | Included                         |
| Dynamic dummy data           | Completed                        |
| Public GitHub-ready codebase | Completed                        |
| Clear README                 | Completed                        |

---

## 🛠️ Tech Stack

### Frontend

| Technology       | Purpose                     |
| ---------------- | --------------------------- |
| React            | Web dashboard UI            |
| Vite             | Frontend development server |
| Tailwind CSS     | Styling                     |
| Socket.IO Client | Real-time dashboard updates |
| CSS Animations   | Fan rotation and light glow |
| Glassmorphism UI | Premium visual design       |

### Backend

| Technology           | Purpose                 |
| -------------------- | ----------------------- |
| Node.js              | Backend runtime         |
| Express.js           | REST API                |
| Socket.IO            | Real-time events        |
| Discord.js           | Discord bot integration |
| JavaScript Simulator | Dynamic device data     |
| In-memory Store      | Single source of truth  |

---

## 📁 Folder Structure

```txt
smart-office-energy-monitor/
│
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── simulator.js
│   │   ├── alertEngine.js
│   │   ├── discordBot.js
│   │   └── data/
│   │
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── images/
│   │   │   └── background-video.mp4
│   │   └── floor-plan assets
│   │
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   └── styles/
│   │
│   ├── .env.example
│   └── package.json
│
├── scripts/
│   └── start-windows.ps1
│
├── High-Level System Diagram.jpeg
├── Circuit Schematic.jpeg
├── README.md
├── START_HERE_WINDOWS.md
├── package.json
└── .gitignore
```

---

## 🚀 Quick Start

### Prerequisites

Install these first:

* Node.js 18 or newer
* npm
* Git
* VS Code
* Discord account

Check installation:

```bash
node -v
npm -v
git --version
```

---

## 🪟 Run on Windows

Open the project folder in VS Code.

Then open terminal and run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\start-windows.ps1
```

The script will:

* Install root dependencies
* Install backend dependencies
* Install frontend dependencies
* Create environment files if needed
* Start backend and frontend together

Open dashboard:

```txt
http://localhost:5173
```

Backend API:

```txt
http://localhost:8080
```

---

## ⚙️ Manual Installation

If the Windows script does not work, run manually:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

Create environment files:

```powershell
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Start the project:

```bash
npm run dev
```

---

## 🔐 Environment Variables

Create this file:

```txt
backend/.env
```

Add:

```env
PORT=8080
CLIENT_URL=http://localhost:5173

DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_ALERT_CHANNEL_ID=your_discord_alert_channel_id_here
```

Important:

```txt
Never upload backend/.env to GitHub.
Never expose your Discord bot token.
```

---

## 🤖 Discord Bot Setup

### Step 1: Create Discord Application

1. Open Discord Developer Portal
2. Click **New Application**
3. Name it:

```txt
Smart Office
```

4. Go to **Bot**
5. Click **Reset Token**
6. Copy the token

Paste it into:

```env
DISCORD_BOT_TOKEN=your_token_here
```

---

### Step 2: Enable Message Content Intent

In the Discord Developer Portal:

```txt
Bot → Privileged Gateway Intents → Message Content Intent → ON
```

This allows the bot to read text commands such as:

```txt
!status
!usage
!room work1
```

---

### Step 3: Invite Bot to Server

Go to:

```txt
OAuth2 → URL Generator
```

Select scopes:

```txt
bot
applications.commands
```

Select permissions:

```txt
View Channels
Send Messages
Read Message History
```

Open the generated URL and add the bot to your Discord server.

---

### Step 4: Get Discord Channel ID

1. Open Discord
2. Go to **User Settings**
3. Go to **Advanced**
4. Enable **Developer Mode**
5. Right click your alert channel
6. Click **Copy Channel ID**

Paste it into:

```env
DISCORD_ALERT_CHANNEL_ID=your_channel_id_here
```

---

### Step 5: Test Discord Bot

Restart the project:

```bash
npm run dev
```

In Discord, send:

```txt
!help
```

Then test:

```txt
!status
!usage
!room drawing
!room work1
!room work2
!alerts
!save
```

Expected behavior:

* Bot replies with live office status
* Bot shows current power usage
* Bot shows room-specific device states
* Bot displays active alerts
* Bot uses backend data, not hardcoded text

---

## 🌐 API Endpoints

### Health Check

```txt
GET /health
```

Checks whether the backend is running.

---

### Full Live State

```txt
GET /api/state
```

Returns:

* Devices
* Rooms
* Alerts
* Total power
* Room-wise power
* Runtime data

---

### Devices

```txt
GET /api/devices
```

Returns all simulated lights and fans.

---

### Alerts

```txt
GET /api/alerts
```

Returns all active alert messages.

---

## 📡 Real-Time Socket Events

The frontend listens to live backend updates using Socket.IO.

### Main Event

```txt
state:update
```

Whenever device data changes, the backend emits the latest state and the dashboard updates instantly.

---

## ⚡ Power Calculation

Each device has a fixed wattage when ON.

| Device | Wattage |
| ------ | ------- |
| Fan    | 60W     |
| Light  | 15W     |

Formula:

```txt
Total Power = Sum of wattage of all ON devices
```

Example:

```txt
2 Fans ON = 2 × 60W = 120W
3 Lights ON = 3 × 15W = 45W

Room Total = 165W
```

---

## 🚨 Alert Logic

The alert engine checks:

### After-Hours Alert

```txt
Office hours: 9 AM - 5 PM
If any device is ON outside office hours, create alert.
```

### Long Runtime Alert

```txt
If all devices in a room stay ON for more than 2 hours, create alert.
```

### High Usage Alert

```txt
If current power usage is unusually high, create alert.
```

---

## 🔌 Hardware / Electrical Schematic

This project includes a representative hardware concept for one room.

The real-world version can use:

* ESP32 or Arduino
* Light switches
* Fan switches
* Relay modules
* LED indicators
* DC motor/fan simulation
* Optional ACS712 current sensor
* Backend communication through Wi-Fi

---

## 📍 Example Pin Mapping

| Component      | ESP32 Pin | Purpose                         |
| -------------- | --------: | ------------------------------- |
| Light 1 Switch |   GPIO 13 | Read Light 1 state              |
| Light 2 Switch |   GPIO 14 | Read Light 2 state              |
| Light 3 Switch |   GPIO 27 | Read Light 3 state              |
| Fan 1 Switch   |   GPIO 26 | Read Fan 1 state                |
| Fan 2 Switch   |   GPIO 25 | Read Fan 2 state                |
| Current Sensor |   GPIO 34 | Optional analog current reading |
| Light 1 Relay  |   GPIO 18 | Control Light 1                 |
| Light 2 Relay  |   GPIO 19 | Control Light 2                 |
| Light 3 Relay  |   GPIO 21 | Control Light 3                 |
| Fan 1 Relay    |   GPIO 22 | Control Fan 1                   |
| Fan 2 Relay    |   GPIO 23 | Control Fan 2                   |

---

## 🧩 Electrical Reasoning

GPIO pins cannot directly power real lights or fans.

A practical design should use:

* Switch inputs for reading ON/OFF state
* Relay modules or transistor drivers for controlling loads
* Separate power supply for motors or real electrical loads
* Current sensor for measuring actual consumption
* Common ground between low-voltage control modules where required

This makes the schematic physically sensible while keeping the demo safe and simulation-based.

---

## 🖼️ Diagrams

The repository includes:

```txt
High-Level System Diagram.jpeg
Circuit Schematic.jpeg
```

### High-Level System Diagram

```txt
Devices → Simulated Data → Backend → Dashboard + Discord Bot → User
```

### Circuit Schematic

Shows a representative room circuit using a microcontroller, switches, fans, lights, and optional current sensing.

To display the diagram inside GitHub README, use:

```md
![High-Level System Diagram](./High-Level%20System%20Diagram.jpeg)
```

If you move diagrams into a `docs` folder, use:

```md
![High-Level System Diagram](./docs/high-level-system-diagram.jpeg)
```

---

## 🎬 Demo Video Plan

Recommended length: **under 3 minutes**.

### Demo Script

| Time        | What to Show                                              |
| ----------- | --------------------------------------------------------- |
| 0:00 - 0:20 | Introduce the problem: lights and fans are left ON        |
| 0:20 - 0:55 | Show live dashboard and office floor plan                 |
| 0:55 - 1:25 | Show lights glowing and fans animating                    |
| 1:25 - 1:50 | Show live power usage and room-wise breakdown             |
| 1:50 - 2:20 | Test Discord commands: `!status`, `!usage`, `!room work1` |
| 2:20 - 2:45 | Show active alerts                                        |
| 2:45 - 3:00 | Explain shared backend architecture                       |

---

## ✅ Final Submission Checklist

Before submitting, confirm:

* [ ] Dashboard runs at `http://localhost:5173`
* [ ] Backend runs at `http://localhost:8080`
* [ ] Devices update live
* [ ] Lights show ON/OFF state visually
* [ ] Fans animate when ON
* [ ] Total power meter updates
* [ ] Room-wise power breakdown works
* [ ] Alerts appear on dashboard
* [ ] Discord bot replies to commands
* [ ] Bot reads from backend data
* [ ] System diagram is included
* [ ] Circuit schematic is included
* [ ] README explains setup clearly
* [ ] `.env` is not uploaded to GitHub
* [ ] Demo video is clear and under 3 minutes

---

## 🧪 Testing Commands

Run backend and frontend:

```bash
npm run dev
```

Check Git status:

```bash
git status
```

Push final code:

```bash
git add .
git commit -m "Finalize smart office energy monitor"
git push
```

---

## 🔒 Security Notes

Do not commit:

```txt
backend/.env
frontend/.env
node_modules/
```

If your Discord token is accidentally uploaded:

1. Go to Discord Developer Portal
2. Open your application
3. Go to Bot
4. Reset token immediately
5. Update local `.env`
6. Push a commit removing the leaked file

---

## 🚀 Future Improvements

* Add MQTT support for real IoT devices
* Add ESP32 firmware
* Add database persistence
* Add login system
* Add admin controls
* Add device scheduling
* Add historical energy charts
* Add monthly electricity cost report
* Add AI-generated energy saving suggestions
* Add natural language Discord responses with an LLM

---

## 👨‍💻 Author

**Smart Office Energy Monitor**
Built for hackathon demonstration and smart energy monitoring.

GitHub Repository:

```txt
https://github.com/143Habib/Smart_Office
```

---

## 🏁 Final Note

This project focuses on:

* Real-time monitoring
* Shared backend design
* Clean dashboard experience
* Discord chatbot integration
* Simulated but realistic energy data
* Practical hardware reasoning
* Clear documentation for judges

The goal is not only to show data, but to make the office energy problem visible, understandable, and actionable.

---

<div align="center">

### ⚡ Smart Office. Smarter Energy. Better Decisions.

</div>
```

Paste korar por push dao:

```powershell
git add README.md
git commit -m "Create premium competition README"
git push
```
