# Handoff Prompt: Taking Lakou to World-Class

Copy and paste the text block below into a fresh session with Claude. It provides the exact context of what has been built, the toolchain in place, and a step-by-step roadmap to implement the remaining features.

***

```markdown
You are an expert Flutter and Android developer. We are building **Lakou**, a highly tailored, mobile-first project management app designed specifically for a single user: Tom, an AuDHD architect running a solo firm (Green Stories).

Lakou is designed to feel like a premium drafting table—using a warm cream/sage color palette, monospace styling, and gentle phrasing. It is offline-first, backing all data into a local SQLite database (`tpm.db`) which is synced up and down via Dropbox. It uses a sideloaded Android deployment due to its deep integration with native permissions (`READ_SMS`, notification access, foreground services).

### 1. Current Repository Structure
The project has been cleaned up and is structured as follows:
```
Lakou/ (repository root)
  Lakou/                                Flutter project root
    lib/
      main.dart                         ProviderScope + App Links initialization
      app.dart                          GoRouter routing and Material 3 theme configuration
      core/
        config.dart                     Global constants, paths, and default settings
        db.dart                         SQLite open accessor and global dbProvider
        dropbox_client.dart             Dropbox REST client (files, metadata, OAuth)
        gentle_phrases.dart             Custom AuDHD-friendly response greetings
        lakou_theme.dart                Cream (#FAF8F3) and green (#6B8E5A) visual styling
      features/
        auth/                           Dropbox OAuth handlers and deep linking
        billing/                        Milestone billing and fee burn analytics
        capture/                        SMS scraping (MethodChannel), review screens, Claude extraction
        dashboard/                      Core dashboard widgets, fee burn indicator, ambient touch metrics
        dockmode/                       Screensaver dashboard for phone docks
        expenses/                       Receipt capture (camera, locked filename schemes, JSON metadata)
        gamification/                   "Chop" reward strips on the daily log screen
        intake/                         Client intake tokens and directories
        projects/                       Project listing, creation, and detail screens
        settings/                       Watched contact lists and notification settings
        tasks/                          ADHD Morning Planner UI, backlog / daily slots, carry-over
        timetrack/                      Time tracking: Android foreground service, category picker, manual logger
        today/                          Monospace timeline ledger of today's actions
    test/                               Unit tests for filename specifications and widget smoke tests
    android/                            Native Kotlin bindings, settings, wrapper configs
  docs/                                 README, permissions guides, file templates, handoff logs
  scripts/                              build-apk.ps1 (sideload build), start-claude.ps1, sync-logs.ps1
```

### 2. Toolchain & Dependencies (Verified)
- **Flutter SDK:** 3.41.6 (stable)
- **Java/JDK:** 17
- **Gradle:** 9.3.1
- **AGP:** 8.9.1 (pinned for plugin compatibility)
- **Kotlin:** 2.1.0
- **Android SDK:** targetSdk = 36, compileSdk = 36
- **Signing:** Debug key signs both debug and release configurations (enables fast USB/wireless adb installation).

### 3. Fully Working Core Features
1. **SMS to Project Capture:** Scrapes SMS messages locally via Kotlin `MethodChannel`, extracts project data (job numbers, action items, dates, and clean markdown notes) using Claude, and saves files directly to Dropbox.
2. **On-Device Fallback Parsing:** If the Anthropic API key is missing, or the call fails (network issue, rate limit, or out of tokens), it automatically and instantly falls back to a regex-based heuristic parser to avoid breaking the user flow.
3. **Time Tracking (Active + Manual):**
   - Active timer uses a native Android foreground service (`TimerForegroundService.kt`) with Android 14+ type safety.
   - Includes a time entry category picker (`design`, `meeting`, `site visit`, `coordination`, `admin`).
   - Supports logging manual time entries (project, category, duration, date, notes).
4. **Dropbox Scaffolding:** Wizard automatically creates the canonical 10-folder firm template (e.g. `06 Project Data/02 Project Directory`) inside the project Dropbox root.
5. **Expense Capture:** Snaps receipt photos, saves them under strict naming patterns (`YYYY-MMDD_jobno_Expense_vendor_amount.jpg`), and uploads a sibling `.json` metadata sidecar.
6. **Morning Planner:** Split-panel ADHD planner notebook layout (backlog backlog, configurable daily slot cap [default 3] with override warnings, roll-forward panel, and bonus pull with Chop reward points).
7. **Native Calendar Integration:** Uses a Kotlin `MethodChannel` (`lakou/calendar`) to interact with the device's native Calendar Provider (`CalendarContract`) to query today's events and write task time blocks offline.
8. **Dock Mode:** Automatically triggers `/dock` screensaver dashboard when the phone is charging in landscape orientation. Pomodoro break alarms (50m focus / 10m break) are scheduled in Kotlin.
9. **Boot Persistence:** A native Kotlin `BootReceiver` recovers active timers, registers alarms, and restores state on phone reboots.
10. **Gmail Sync:** Scrapes emails with active job numbers in the subject line, generating markdown files in the project's `03 Correspondence` Dropbox folder.
11. **Receipt OCR:** Google ML Kit Text Recognition processes receipt photos and auto-populates vendor, amount, and date.
12. **Share Sheet Target:** Registered intent filters permit Tom to share images and files directly from other apps into chosen project subfolders on Dropbox.
13. **Clean Build:** The codebase compiles with 0 warnings, 0 errors, and all tests pass.

### 4. World-Class Upgrades Roadmap
To elevate Lakou to a world-class, custom project management app for Tom, implement the following features:

#### Stage 1: SQLite Auto-Sync & Backup to Dropbox
- **Goal:** SQLite (`tpm.db`) is the canonical state on the phone, but to support multiple devices and backup, we need a robust background database backup.
- **Implementation:**
  - Write a background sync runner in `dropbox_client.dart` that uploads the `tpm.db` file to `/data/tpm.db` on Dropbox.
  - On app launch, query the metadata of `/data/tpm.db` on Dropbox. If the Dropbox file has a newer modified time than the local file:
    - Present a gentle dialog: "A newer database backup is available on Dropbox. Merge changes or overwrite?"
    - Implement a safe database overwrite (copy the downloaded file to the database path after closing the active connection).
    - To prevent data loss, automatically backup the local database to a `tpm.db.bak` file before overwriting.

#### Stage 2: Enhanced Capture (Voice Memos & Call Logs)
- **Voice Memos:**
  - Add a quick voice recording widget on the dashboard and capture screen.
  - Record audio using the device microphone.
  - Leverage Android's native `SpeechRecognizer` (via Kotlin `MethodChannel`) to perform **100% offline local speech-to-text**.
  - Pass the transcribed text to the local LLM (Tier 3) to extract project job numbers, action items, and generate meeting minutes, auto-saving them to the project's `04 Meeting Agendas and Reports` Dropbox folder.
- **Call Log Matching:**
  - Declare the `READ_CALL_LOG` permission.
  - Implement a feature to scan the device call log. Match incoming/outgoing phone numbers against the numbers stored in the `clients` or `consultants` tables.
  - Display a "Log Calls" feed where Tom can review recent matched calls and log them with one tap as a `time_entry` (using category: `meeting` or `coordination`) or append call notes to the project's diary.

#### Stage 3: Visual Drafting Timeline Ledger & Map Log
- **Monospace Ledger:**
  - Enhance the `/today` timeline screen into a beautiful monospace drafting-ledger view.
  - Draw timelines using custom drawing elements (dashed timeline vertical rules, monospace glyphs, hairline connectors, and drafting grid backgrounds).
  - Aggregate and show: focus sessions, manual time entries, SMS/email captures, and receipt photos.
- **Map Logs:**
  - If Tom inputs an address in the client intake form or adds client details, geocode it using the Maps key in `secrets.dart`.
  - On the ledger screen, display visual map card items showing the route or location pin of Tom's site visits on that day, making it easy to remember where he spent his hours.

#### Stage 4: ADHD Focus Shield & Ambient Workspaces
- **Focus Shield:**
  - While a Pomodoro focus timer is active, leverage a Kotlin `MethodChannel` to query/toggle Do Not Disturb (DND) modes or suppress non-essential system alerts.
  - Present supportive, low-friction interruptions asking Tom to check in, drink water, or take breaks without breaking his focus flow.
- **Ambient Drafting Sounds:**
  - Build a simple local sound player in the screensaver dock mode.
  - Bundle 3-4 short, looping, high-quality audio files locally (e.g., sound of sketching/pencil on paper, soft rain, gentle studio hum, low-fidelity drafting beats).
  - Allow Tom to mix and toggle these sounds on the screensaver or time-tracker to ease transition into hyperfocus.

#### Stage 5: Project Fee Estimator Worksheet
- **Estimating Engine:**
  - Create a new project setup tab or screen: "Drafting-Table Estimate Worksheet".
  - Tom can input estimated hours for standard project phases (Schematic Design [SD], Design Development [DD], Construction Documents [CD], Construction Administration [CA]), blended billing rates, and consultant fee markups.
  - Print a gorgeous, copyable monospace Text Proposal worksheet.
  - Track estimated phase hours vs. actual hours logged in time entries.
  - Display side-by-side comparison charts drawn in Lakou's draftsmanship styling.

---

Let's begin. Let me know which stage you'd like to implement first!
```
***
