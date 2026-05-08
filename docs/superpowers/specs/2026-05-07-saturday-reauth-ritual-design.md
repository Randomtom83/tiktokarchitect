# Saturday YouTube Re-Auth Ritual

**Date:** 2026-05-07
**Status:** Approved
**Owner:** Tom Reynolds

## Problem

The YouTube uploader (`internal/claudecode/youtube_uploader.py`) uses an OAuth app in Google's Testing mode, which revokes refresh tokens every ~7 days. Two TikTok accounts (`tiktokarchitect` and `randomtom83`) feed the same YouTube channel, each with its own pickle file and independent 7-day expiry clock.

Until 2026-05-07, the Saturday 8:45 AM re-auth ritual covered only `tiktokarchitect`. The `randomtom83` token expired ~Apr 28 and silently failed the daily upload (with email alerts) until 2026-05-07. Root cause was that the procedural memory implied a single token; the second account drifted out of phase and stayed broken.

## Goals

- A repeatable Saturday ritual that re-auths **both** tokens together so they stay in phase.
- A weekly email reminder that fires at 8:45 AM ET (the existing calendar slot), so a missed calendar dismissal doesn't translate to a missed re-auth.
- The ritual itself runs in Claude Code in this project; the user only has to type one command.

## Non-Goals

- Publishing the OAuth app (would eliminate the 7-day expiry, but requires branding info and a privacy policy URL the user isn't ready for).
- Automating the browser OAuth flow itself — Google requires a human to click through the consent screen.
- Replacing the existing daily-failure email alert from `youtube_uploader.py:send_failure_alert()`. That stays as the safety net.

## Design

Two components: a remote scheduled agent (the reminder) and a local slash command (the ritual).

### Component 1: Remote scheduled agent

Created via the `superpowers:schedule` skill.

- **Cron:** Every Saturday at 8:45 AM America/New_York
- **Action:** Send a reminder email via Gmail SMTP
- **From:** `youwishthiswasyour@gmail.com` (existing app password)
- **To:** `IAmThe@tiktokarchitect.com`
- **Subject:** `[tiktokarchitect] Saturday YouTube re-auth ritual`
- **Body:**
  - One-line reminder ("Time for the weekly YouTube OAuth re-auth.")
  - Action: "Open Claude Code in the `tiktokarchitect` project and type `/saturday-reauth`. I'll handle the rest."
  - Manual fallback (in case Claude is unavailable):
    ```
    cd internal\claudecode
    move yt_token_tiktokarchitect.pickle yt_token_tiktokarchitect.pickle.bak-YYYYMMDD
    move yt_token_randomtom83.pickle    yt_token_randomtom83.pickle.bak-YYYYMMDD
    python -c "from youtube_uploader import authenticate; authenticate('tiktokarchitect')"
    python -c "from youtube_uploader import authenticate; authenticate('randomtom83')"
    python export_upload_status.py
    ```
  - Note about why: "Both tokens have independent 7-day clocks; re-auth both together to keep them in phase."

The agent does **not** include a status snapshot in the email. The freshest copy of `public/data/youtube_uploads.json` lives on the local Windows machine (the 3am bat job updates it locally and doesn't auto-commit), so a remote fetch from GitHub master would be days stale and misleading. The slash command shows the snapshot from the fresh local copy instead.

### Component 2: Local slash command `/saturday-reauth`

A markdown file at `.claude/commands/saturday-reauth.md`. When the user types `/saturday-reauth`, the command instructs Claude to run the following ritual in order:

1. **Show state.** Read `public/data/youtube_uploads.json` and echo, for each account: last-upload timestamp, days ago, total uploaded.

2. **Back up both tokens.** Move (rename) both `internal/claudecode/yt_token_*.pickle` files to `.bak-YYYYMMDD` (today's date). Confirm both `.bak` files exist before proceeding.

3. **Re-auth tiktokarchitect.** Run, in `internal/claudecode/`:
   ```
   python -c "from youtube_uploader import authenticate; authenticate('tiktokarchitect')"
   ```
   Run in background. The script will print an OAuth URL and open the user's browser. Wait for the process to exit cleanly. Verify a fresh `yt_token_tiktokarchitect.pickle` exists.

4. **Re-auth randomtom83.** Same as step 3 but for the `randomtom83` account.

5. **Refresh dashboard.** Run `python export_upload_status.py` in `internal/claudecode/`. Confirm `public/data/youtube_uploads.json` updated.

6. **Verify and report.** Confirm both fresh `.pickle` mtimes are within the last 5 minutes. Report total elapsed time and a one-line success message ("Both tokens re-authed; next expiry ~2026-MM-DD").

If any step fails:
- Browser doesn't open → fall back to printing the auth URL and waiting for the user to paste it.
- OAuth flow times out (no user interaction) → report and offer to retry.
- A `.bak` file already exists for today → append `-1`, `-2`, etc.
- The fresh `.pickle` is missing after a successful exit → unexpected; surface the script output and stop the ritual.

### Component 3: Memory update

Already done on 2026-05-07. The `project_youtube_uploader.md` memory now states the ritual must cover both tokens, and `MEMORY.md` index reflects "two OAuth tokens (one per account, independent 7-day clocks)."

## Implementation Plan

This goes to the `writing-plans` skill next.

- Create `.claude/commands/saturday-reauth.md`
- Create the remote scheduled agent via `schedule` skill — needs Gmail credentials, recipient email, and the email body
- Test the slash command end-to-end on the next Saturday or a manual dry run

## Open Questions

None. All decisions resolved during brainstorming.
