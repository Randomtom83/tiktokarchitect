# Saturday YouTube Re-Auth Ritual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Saturday-morning ritual that re-auths both YouTube uploader OAuth tokens together — a slash command for the local work and a scheduled email reminder.

**Architecture:** Two components. (1) A markdown slash command at `.claude/commands/saturday-reauth.md` that walks through state-display → token backup → two browser OAuth flows → dashboard refresh. (2) A remote cron-scheduled agent (created via the `superpowers:schedule` skill) that emails a reminder + manual fallback to `IAmThe@tiktokarchitect.com` every Saturday at 8:45 AM ET.

**Tech Stack:** Markdown (slash command), `superpowers:schedule` skill (cron agent), Python (existing `youtube_uploader.py` and `export_upload_status.py`), Gmail SMTP (existing creds in `internal/claudecode/.env`).

**Spec:** `docs/superpowers/specs/2026-05-07-saturday-reauth-ritual-design.md`

---

## File Structure

- **Create:** `.claude/commands/saturday-reauth.md` — the slash command
- **No code changes:** `internal/claudecode/youtube_uploader.py` (use `from youtube_uploader import authenticate` to invoke just the auth path)
- **External:** Remote scheduled agent (lives in claude.ai schedules, not in repo)

---

### Task 1: Create the slash command file

**Files:**
- Create: `.claude/commands/saturday-reauth.md`

- [ ] **Step 1: Verify state-display Python works against current data**

Run from repo root:

```bash
python -c "
import json, datetime
data = json.load(open(r'public/data/youtube_uploads.json'))
today = datetime.date.today()
for acct, info in data['accounts'].items():
    last = info['recent_uploads'][0]['uploaded_at'] if info['recent_uploads'] else 'never'
    if last != 'never':
        ago = (today - datetime.date.fromisoformat(last[:10])).days
        print(f'{acct}: last upload {last[:10]} ({ago} days ago) — {info[\"uploaded\"]} uploaded')
    else:
        print(f'{acct}: never uploaded')
"
```

Expected: Two lines, one per account, with last-upload date and days ago. Both accounts should show recent uploads (within the last day or two) post the 2026-05-07 fix.

- [ ] **Step 2: Write the slash command file**

Create `.claude/commands/saturday-reauth.md` with this exact content:

````markdown
---
description: Saturday morning ritual — re-auth both YouTube uploader OAuth tokens together
---

You are running the **Saturday YouTube re-auth ritual**. Both `tiktokarchitect` and `randomtom83` OAuth refresh tokens are on independent 7-day clocks (Google Testing-mode policy) and must be re-authed together to stay in phase. The user is at their machine and will click through two browser OAuth windows.

Run these steps in order. After each step, briefly report what happened. Stop and ask if anything fails.

## Step 1: Show state

Run this from the repo root:

```bash
python -c "
import json, datetime
data = json.load(open(r'public/data/youtube_uploads.json'))
today = datetime.date.today()
for acct, info in data['accounts'].items():
    last = info['recent_uploads'][0]['uploaded_at'] if info['recent_uploads'] else 'never'
    if last != 'never':
        ago = (today - datetime.date.fromisoformat(last[:10])).days
        print(f'{acct}: last upload {last[:10]} ({ago} days ago) — {info[\"uploaded\"]} uploaded')
    else:
        print(f'{acct}: never uploaded')
"
```

Report the output to the user.

## Step 2: Back up both tokens

Today's date is `$(date +%Y%m%d)` format (e.g. 20260509). For each account, rename the pickle file to `.bak-YYYYMMDD`. If a `.bak` for today already exists, append `-1`, `-2`, etc.

```bash
cd "internal/claudecode"
DATE=$(date +%Y%m%d)
for acct in tiktokarchitect randomtom83; do
  src="yt_token_${acct}.pickle"
  dst="yt_token_${acct}.pickle.bak-${DATE}"
  i=1
  while [ -e "$dst" ]; do dst="yt_token_${acct}.pickle.bak-${DATE}-${i}"; i=$((i+1)); done
  mv "$src" "$dst"
done
ls yt_token_*.pickle* 2>&1
```

Confirm both `.bak` files exist and the bare `.pickle` files are gone before proceeding.

## Step 3: Re-auth `tiktokarchitect`

Run in the background so the OAuth callback can be received:

```bash
cd "internal/claudecode" && python -c "from youtube_uploader import authenticate; authenticate('tiktokarchitect')"
```

The script prints an OAuth URL and opens the user's browser. Tell the user: "Browser should pop — sign in with the **tiktokarchitect** Google account, click through the unverified-app warning, approve."

Wait for the process to exit. If it doesn't open a browser within ~10 seconds, copy the printed URL and ask the user to open it.

When the process exits with code 0, verify a fresh `yt_token_tiktokarchitect.pickle` exists with mtime within the last 5 minutes.

## Step 4: Re-auth `randomtom83`

Same as Step 3, but for `randomtom83`. Tell the user: "Second browser — sign in with the **randomtom83** Google account this time."

```bash
cd "internal/claudecode" && python -c "from youtube_uploader import authenticate; authenticate('randomtom83')"
```

Wait for clean exit. Verify fresh `yt_token_randomtom83.pickle`.

## Step 5: Refresh the dashboard JSON

```bash
cd "internal/claudecode" && python export_upload_status.py
```

Expected: prints "Exported to: …\public\data\youtube_uploads.json" and totals.

## Step 6: Final report

Confirm:
- Both fresh pickle files exist with mtimes within the last 5 minutes
- Both `.bak-YYYYMMDD` files exist (the old revoked tokens, kept for rollback)
- The dashboard JSON updated

Tell the user: "Both tokens re-authed. Next forced expiry is ~7 days from now (~$(date -d '+7 days' +%Y-%m-%d) at the latest). The 3am bat job will use these new tokens tomorrow morning."

If anything in this ritual fails, surface the error verbatim and stop. Do not improvise — re-auth issues need user judgment.
````

- [ ] **Step 3: Verify the file is well-formed**

```bash
ls -la ".claude/commands/saturday-reauth.md"
head -5 ".claude/commands/saturday-reauth.md"
```

Expected: file exists, frontmatter `---\ndescription: …\n---` is present at the top.

- [ ] **Step 4: Commit (only if user explicitly approves)**

```bash
git add ".claude/commands/saturday-reauth.md"
git commit -m "saturday-reauth: add slash command for weekly OAuth ritual"
```

---

### Task 2: Create the remote scheduled email reminder

**Files:**
- External: claude.ai scheduled agent (no repo file)

- [ ] **Step 1: Confirm Gmail credentials available to the schedule skill**

The existing `internal/claudecode/.env` contains `GMAIL_ADDRESS`, `GMAIL_APP_PASSWORD`, `GMAIL_RECIPIENT`. The remote scheduled agent runs in claude.ai and will need these as env vars or inline in the prompt. Confirm the values with the user before creating the agent (don't paste the password into the plan or chat — read it from `.env` only when invoking the schedule skill).

- [ ] **Step 2: Invoke the schedule skill to create the agent**

Use `superpowers:schedule` with these inputs:

- **Cron:** `45 8 * * 6` in `America/New_York` (Saturday 8:45 AM ET)
- **Prompt for the remote agent:** something equivalent to:

  > Send an email reminder for the Saturday YouTube OAuth re-auth ritual.
  >
  > From: `youwishthiswasyour@gmail.com` via Gmail SMTP (port 465, app password from env)
  > To: `IAmThe@tiktokarchitect.com`
  > Subject: `[tiktokarchitect] Saturday YouTube re-auth ritual`
  > Body:
  > ```
  > Time for the weekly YouTube OAuth re-auth.
  >
  > Both tiktokarchitect and randomtom83 OAuth tokens have independent
  > 7-day expiry clocks (Google Testing-mode policy). Re-auth both
  > together to keep them in phase — if you only do one, the other will
  > silently fail mid-week and email-alert daily.
  >
  > To run: open Claude Code in the tiktokarchitect project and type:
  >
  >     /saturday-reauth
  >
  > Claude handles the rest. You'll click through two browser OAuth
  > windows (one per account).
  >
  > Manual fallback (if Claude unavailable):
  >
  >     cd internal\claudecode
  >     move yt_token_tiktokarchitect.pickle yt_token_tiktokarchitect.pickle.bak-YYYYMMDD
  >     move yt_token_randomtom83.pickle    yt_token_randomtom83.pickle.bak-YYYYMMDD
  >     python -c "from youtube_uploader import authenticate; authenticate('tiktokarchitect')"
  >     python -c "from youtube_uploader import authenticate; authenticate('randomtom83')"
  >     python export_upload_status.py
  > ```

- [ ] **Step 3: Trigger a one-off test run of the agent**

If the schedule skill supports manual trigger, run it once now and confirm the email lands at `IAmThe@tiktokarchitect.com`. Subject line should match exactly. Ask the user to confirm receipt.

- [ ] **Step 4: List scheduled agents to confirm the cron is registered**

Use the schedule skill's list command. Confirm:
- Name matches "Saturday YouTube re-auth reminder" (or similar)
- Cron is `45 8 * * 6` in `America/New_York`
- Status is enabled/active

- [ ] **Step 5: Commit memory update (if not already)**

The 2026-05-07 memory updates to `MEMORY.md` and `project_youtube_uploader.md` were saved during the debug session. They live in `~/.claude/projects/.../memory/` (outside the repo). No repo commit needed.

---

## Self-Review

**Spec coverage:**
- Goal "re-auth both tokens together" → Task 1 (slash command). ✓
- Goal "weekly email reminder" → Task 2 (scheduled agent). ✓
- Goal "user types one command" → slash command in Task 1. ✓
- Non-goal "publish OAuth app" — explicitly skipped. ✓
- Non-goal "automate browser flow" — preserved (user clicks through). ✓
- Non-goal "replace failure-alert email" — daily failure alert in `youtube_uploader.py:74` untouched. ✓
- Component 1 (remote agent: cron, sender, recipient, subject, body, manual fallback) → Task 2 Step 2. ✓
- Component 2 (slash command: state-display, backup, two OAuth flows, dashboard refresh, verify) → Task 1 Step 2. ✓
- Component 3 (memory update) → already done 2026-05-07; Task 2 Step 5 confirms. ✓

**Placeholder scan:** No TBDs, no "implement appropriate error handling" — error paths in the slash command are explicit (browser doesn't open → fall back to URL paste; bak collision → numeric suffix; clean exit but missing pickle → stop).

**Type consistency:** Account names `tiktokarchitect` and `randomtom83` consistent throughout. File paths use the same convention (`internal/claudecode/yt_token_<account>.pickle`).

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-07-saturday-reauth-ritual.md`.

Two execution options:

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks
2. **Inline Execution** — execute in this session with checkpoints

The work is small (2 tasks, ~6 steps total) and Task 2 needs your confirmation on the email recipient before going live. **Inline execution is the better fit here** — let me execute and we'll checkpoint at the email-test step.

Which approach?
