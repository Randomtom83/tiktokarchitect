# Implementation Plan: Redesigned Premium Local Skill Suggester Web App

We will transition the **Skill Suggester** from a static, retro-monospace dashboard that "sucks" to a **highly polished, modern, and intuitive Local Web Application**. It will run entirely on Tom's laptop, using his local **Ollama** model for both background suggestions and **interactive, card-by-card scripting help**.

## Goal & Target Audience

Tom is a hobbyist who wants to simplify his life. The current console-style retro monospace design is dense and intimidating. We will replace it with a **gorgeous, premium, and friendly dashboard** featuring:
- **Visual Warmth & Clarity**: A dark glassmorphism theme using high-end color theory, smooth cards, and beautiful animations.
- **Cognitive Simplicity**: Actionable, high-level cards instead of developer jargon. Emphasizes "Weekly Time Saved" and a "Simplicity Score" (how easy it is to automate).
- **Fully Local & Interactive**: A small built-in Python web server (`server.py`) that serves the dashboard, persists states instantly, and lets Tom trigger new scans directly from his browser.
- **Embedded Ollama Co-Pilot**: An interactive chat interface on each suggestion card that connects directly to Ollama at `localhost:11434`, allowing Tom to ask questions like: *"Make this PowerShell script run silently"* or *"Explain what this does in plain English"*.

---

## User Review Required

> [!IMPORTANT]
> **No External Services**: All LLM and web traffic remains strictly local on Tom's machine. The backend utilizes standard Python modules (`http.server`, `subprocess`) so that no external packages need to be installed.
> **Ollama CORS configuration**: For the browser to talk directly to `http://localhost:11434`, Tom's local Ollama instance should ideally allow CORS. If it doesn't, we will provide a built-in proxy in `server.py` that relays requests to Ollama, guaranteeing it works out-of-the-box regardless of Ollama's CORS settings!

---

## Proposed Changes

We will introduce a tiny server bridge and completely rewrite the dashboard HTML template in `dashboard_builder.py` to deliver a world-class, breathtaking visual layout.

### Component 1: Zero-Dependency Local Python Backend

#### [NEW] [server.py](file:///C:/Users/thoma/Dropbox/AI/Claude/skill-suggester/server.py)
A lightweight HTTP server using `http.server` running on port `8080` that will:
- Serve the generated dashboard `index.html`.
- **API `POST /api/state`**: Save the user's built/dismissed/snoozed state instantly to `state.json` (no more manual downloading!).
- **API `POST /api/scan`**: Run the nightly scanner + judge pipeline synchronously in a background subprocess and return the new data so the dashboard updates live in the browser.
- **API `POST /api/ollama-proxy`**: A fallback proxy for Ollama requests if the browser hits CORS issues connecting directly to port `11434`.

---

### Component 2: Breathtaking Redesigned Dashboard

#### [MODIFY] [dashboard_builder.py](file:///c:/Users/thoma/Dropbox/AI/Claude/skill-suggester/dashboard_builder.py)
We will completely rewrite `HTML_TEMPLATE` inside `dashboard_builder.py` to create a visual masterpiece.

```
┌─────────────────────────────────────────────────────────────┐
│  SKILL SUGGESTER  [Scan Now ↻]   [Ollama: Connected ●]     │
├─────────────────────────────────────────────────────────────┤
│  ⚡ Weekly Time Saved: ~45m  |  🛠️ Total Automations: 12     │
├─────────────────────────────────────────────────────────────┤
│  [💡 Active Suggestions]     [📊 Activity Stats]            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ⚡ Repeated Bash Pattern: 'git commit'                 │  │
│  │ ⏱️ Weekly Savings: 15 mins   🟢 Simplicity: Very Easy  │  │
│  │ ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ─ │  │
│  │ "We noticed you run git commit manually. Let's make   │  │
│  │ an alias or script."                                  │  │
│  │                                                       │  │
│  │ [ Starter Outline / Script ]  (Click to Copy)        │  │
│  │                                                       │  │
│  │ ┌─ Ollama Assistant ────────────────────────────────┐ │  │
│  │ │ Tom: "Make it push too"                            │ │  │
│  │ │ Ollama: "Here is your updated script..."           │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                       │  │
│  │ [Mark Built]   [Snooze]   [Dismiss]                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Premium UI Features:**
- **Harmony & Contrast**: A gorgeous deep slate background (`#0b0f19`) with glassmorphism cards (`backdrop-filter: blur(16px)`), vibrant cyan (`#00f2fe`) and indigo (`#4facfe`) gradients for core visuals, soft emerald for built statuses, and golden amber for snoozed items.
- **Hobbyist-Friendly Metrics**:
  - *Estimated Time Saved*: e.g. `Frequency * 1.5 minutes`.
  - *Simplicity Rating*: `Easy`, `Medium`, or `Detailed Skill` depending on whether it's a prompt cluster, file target, or complex tool sequence.
- **Embedded Ollama Co-Pilot**: An elegant chat bubble widget on every suggestion card. It includes quick prompts (e.g. *"Show me how to install this"*, *"Change to a PowerShell script"*, *"Simplify this prompt"*) and a conversational chat input. It sends requests to `localhost:11434` or the proxy and renders the response live in markdown format.
- **Direct Run Control**: A beautiful spinning "Scan & Analyze" button at the top header that sends a request to the backend server to trigger `run_nightly.ps1 -SkipDropboxControl` and loads the new results instantly without page reload.
- **Status Sync**: All actions (`Mark Built`, `Snooze`, `Dismiss`) save to the server instantly and update the UI in real time with beautiful CSS micro-transitions.

---

### Component 3: Helper Launch Scripts

#### [NEW] [start_app.ps1](file:///C:/Users/thoma/Dropbox/AI/Claude/skill-suggester/start_app.ps1)
A simple double-click helper script that:
1. Starts the Python backend `server.py` in the background.
2. Automatically launches Tom's default web browser to `http://localhost:8080`.
3. Displays a clean, non-intrusive console window.

---

## Verification Plan

### Automated & Manual Verification
1. **Server Launch**: Start `server.py` locally and verify it binds to port `8080`.
2. **Dashboard Render**: Open `http://localhost:8080` in the browser and verify the visual styling, fonts, and responsiveness.
3. **State Sync**: Click "Dismiss" or "Mark Built" on a card and check that `Y:\greenstories\TomOnly\skill-suggester\state.json` updates instantly.
4. **Ollama Integration**: Select a card, type a query in the Co-Pilot panel, and verify that the local Ollama instance receives the prompt, reasons on it, and returns the response in real time.
5. **On-Demand Scan**: Click the "Scan Now" button in the dashboard, watch the progress spinner, and verify that the scanner and judge run correctly in the background, updating the suggestions live when done.
