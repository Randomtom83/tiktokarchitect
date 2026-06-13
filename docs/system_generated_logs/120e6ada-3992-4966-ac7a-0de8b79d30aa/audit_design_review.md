# Life of Tom — Architectural Design Audit & Code Review

This document contains a structured, ground-up audit of the entire Life of Tom codebase as of June 12, 2026. Every file in scope has been reviewed from a zero-knowledge perspective to verify architectural compliance, runtime integrity, type safety, and alignment with the build plan and original system intent.

---

## 1. System Outline & Component Map

The Life of Tom is a closed-loop cognitive system designed to ingest daily conversations, analyze them across multiple coach lenses, synthesize them into a daily focus, and coordinate actions through a mobile companion app. The system consists of 7 major subsystems:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. INGESTION & SYNC LAYER                       │
│  fieldy_sync.py  ──>  sync_transcripts.py  ──>  backfill_conversations │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        2. WATCHER & SCHEDULER                          │
│  watcher.py (Every 10 min, lock file + heartbeat daemon thread)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      3. COGNITIVE ANALYSIS LAYER                       │
│  analyzer.py (Stage A: Triage; Stage B: Specialist Coach Analyses)      │
│  prompts_loader.py (Strips frontmatter and loads from CMS)             │
│  costs.py & anthropic_client.py (Ollama local / Anthropic cloud API)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   4. MEMORY & STAGE C COMPACTION                       │
│  orchestrator.py (Daily meta-agent review & One Thing generation)      │
│  roller.py & pattern_sweep.py (Weekly compaction & sweep observer)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     5. CONCURRENCY & STORAGE LAYER                     │
│  lifeoftom.db (WAL Mode) + Optimistic concurrency version locking     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌─────────────────────────┬──────────────────────────────────────────────┐
│  6. PHP WEB DASHBOARD   │         7. NATIVE KOTLIN MOBILE APP          │
│  api.php / dashboard.php│  MainActivity / FocusScreen / SettingsScreen │
│  conv.php               │  TomRepository / NotificationReceiver       │
└─────────────────────────┴──────────────────────────────────────────────┘
```

---

## 2. Component Audits vs. System Intent

### Subsystem A: Ingestion & Metadata Sync
*   **Intended Behavior:** Securely retrieve completed transcription segments from Fieldy/Dropbox, clean up filename collisions (title drift), parse frontmatter, compute `content_hash`, and mark dirty rows as `processed_at = NULL`.
*   **Verification & Review:**
    *   `fieldy_sync.py` correctly pagination-loops using `nextCursor` and skips active recordings where `endTime` is null. It successfully deletes old files on disk when a title change (and hence filename change) is discovered for an existing ID.
    *   `backfill_conversations.py` correctly uses `content_hash` comparison in the SQLite `ON CONFLICT` block to reset `processed_at = NULL`, ensuring that when transcripts are finalized or revised, they are immediately queued for re-analysis.
    *   **Result:** **100% Aligned.** The ingestion boundary is clean, robust, and correctly handles errors on a per-conversation basis without crashing the entire run.

### Subsystem B: Watcher Locking & Heartbeat
*   **Intended Behavior:** Prevent concurrent executions over the SFTP/network shared drive (which doesn't support system-level flocking) using an atomic lock file, while avoiding lock-stealing on long analyses via a heartbeat thread.
*   **Verification & Review:**
    *   `watcher.py` uses `os.open` with `O_CREAT | O_EXCL` flags for atomic creation.
    *   A background daemon heartbeat thread updates the lock file's `mtime` every 60 seconds. Stale locks (older than 30 minutes) are safely reclaimed only if the PID is dead or inactive.
    *   **Result:** **100% Aligned.** Prevents lost updates and race conditions across network mounts.

### Subsystem C: Specialist Coaches & escalations
*   **Intended Behavior:** Triage conversations to select relevant coach agents (Therapist, Life, Parenting, Business, Dating), analyze transcripts, and escalate to Claude Opus if reasoning requirements are high or feedback is negative.
*   **Verification & Review:**
    *   `prompts_loader.py` centralizes the `AGENTS` list across the backend.
    *   `analyzer.py` triage handles errors by defaulting scores to `0.0`, avoiding runaway costs.
    *   Model escalation correctly triggers if `depth_required >= 0.70` or if the user marked that coach's steps as `not_useful` in the last 7 days.
    *   The therapist prompts are updated, and the dating coach is de-primed to automatically discover partners (Stephanie, Krystal) from the `memory_kv`.
    *   **Result:** **100% Aligned.**

### Subsystem D: Closed-Loop Annotations & Task Deduplication
*   **Intended Behavior:** Allow user annotations to trigger re-runs of the analyzer. Ensure that re-running does not duplicate tasks in the action inbox.
*   **Verification & Review:**
    *   The analyzer detects annotations targeting an agent (or `NULL` targeting all) that are newer than `last_analysis_time`, and bypasses the deduplication gate.
    *   Before inserting new tasks, `_persist_analysis()` marks prior open inbox items for that conversation/agent as `snoozed`, preventing duplicate task lists.
    *   **Result:** **100% Aligned.**

### Subsystem E: Concurrency Control (Optimistic versioning)
*   **Intended Behavior:** Mitigate lost-update race conditions between parallel background worker threads, dashboard user actions, and the Orchestrator.
*   **Verification & Review:**
    *   The `version` column is correctly incremented in `agent_state`.
    *   `UPDATE agent_state SET ..., version = version + 1 WHERE agent = ? AND version = ?` is enforced on all write paths in `analyzer.py`, `orchestrator.py`, and `dashboard.php`.
    *   Write conflicts are retried (up to 5 attempts) with a backoff.
    *   **Result:** **100% Aligned.**

### Subsystem F: Reality Validator
*   **Intended Behavior:** Prevent LLM hallucinations or unsupported memory updates from contaminating long-term state.
*   **Verification & Review:**
    *   `analyzer.py` runs a Claude Haiku validation step on proposed updates, tagging them as `fact | inference | unsupported`.
    *   Unsupported updates are stored in `memory_kv_pending_json`.
    *   `dashboard.php` displays these in a **Pending Reality Check Queue** with approve/reject form actions.
    *   **Result:** **100% Aligned.**

### Subsystem G: Android Mobile Companion
*   **Intended Behavior:** Provide a modern, dark-graphite UI surfacing the Daily Focus and Action checklist. Schedule notification alarms that recover on device reboot.
*   **Verification & Review:**
    *   `MainActivity.kt` requests runtime notification permission on startup (Android 13+).
    *   `NotificationReceiver.kt` listens to `BOOT_COMPLETED` and calls `scheduleAlarms()`.
    *   Cleartext suggestions were eliminated; settings default to secure HTTPS endpoint hooks.
    *   Token inputs are masked with a show/hide toggle.
    *   **Result:** **100% Aligned.**

---

## 3. Review of the New Action Inbox Feedback Loop

We have just executed the implementation of the **Action Inbox Feedback Loop**:
1.  **Database:** Migrated the `action_inbox` table to include `user_notes TEXT` (via `bootstrap.py` migration `M9`).
2.  **API:** Updated `api.php` and `dashboard.php` to accept and write `user_notes` when setting status.
3.  **Android UI:** Overhauled `FocusScreen.kt` to make `ActionInboxRow` expandable when tapped, revealing the detail reasons, a text field for notes, and buttons for **Done**, **Irrelevant**, and **Snooze**.
4.  **Prompts Integration:** We updated the state builder in `analyzer.py` and briefing gatherer in `orchestrator.py` to fetch recently completed/irrelevant actions and notes from the last 7 days and feed them into the prompts, completing the closed-loop system!

---

## 4. Double-Check Walkthrough & Pre-Verification

Before declaring this task fully complete, let's run compile checks and scan the files for any residual issues:
*   [x] Database migrations verified (ran `bootstrap.py`).
*   [x] Kotlin syntax check completed (fixed missing closing brace in `FocusScreen.kt` and successfully compiled!).
*   [x] APK generated successfully in the build task.
