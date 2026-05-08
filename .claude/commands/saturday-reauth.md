---
description: Saturday morning ritual - re-auth both YouTube uploader OAuth tokens together
---

You are running the **Saturday YouTube re-auth ritual**. Both `tiktokarchitect` and `randomtom83` OAuth refresh tokens are on independent 7-day clocks (Google Testing-mode policy) and must be re-authed together to stay in phase. The user is at their machine and will click through two browser OAuth windows.

Run these steps in order. After each step, briefly report what happened. Stop and ask if anything fails.

## Step 1: Show state

Run from the repo root:

```bash
python -c "
import json, datetime
data = json.load(open(r'public/data/youtube_uploads.json'))
today = datetime.date.today()
for acct, info in data['accounts'].items():
    last = info['recent_uploads'][0]['uploaded_at'] if info['recent_uploads'] else 'never'
    if last != 'never':
        ago = (today - datetime.date.fromisoformat(last[:10])).days
        print(f'{acct}: last upload {last[:10]} ({ago} days ago) - {info[\"uploaded\"]} uploaded')
    else:
        print(f'{acct}: never uploaded')
"
```

Report the output to the user. Flag any account whose last upload is 2+ days ago - that's likely a token that already expired (the ritual will fix it).

## Step 2: Back up both tokens

For each account, rename the pickle file to `.bak-YYYYMMDD` (today's date). If a `.bak` for today already exists, append `-1`, `-2`, etc.

```bash
cd "internal/claudecode" && DATE=$(date +%Y%m%d) && for acct in tiktokarchitect randomtom83; do
  src="yt_token_${acct}.pickle"
  dst="yt_token_${acct}.pickle.bak-${DATE}"
  i=1
  while [ -e "$dst" ]; do dst="yt_token_${acct}.pickle.bak-${DATE}-${i}"; i=$((i+1)); done
  mv "$src" "$dst" && echo "moved $src -> $dst"
done
ls yt_token_*.pickle 2>&1 || echo "(no bare .pickle files - good)"
```

Confirm both `.bak` files exist and the bare `.pickle` files are gone before proceeding.

## Step 3: Re-auth `tiktokarchitect`

Run in the background so the OAuth callback can be received without blocking:

```bash
cd "internal/claudecode" && python -c "from youtube_uploader import authenticate; authenticate('tiktokarchitect')"
```

Use the `run_in_background: true` Bash flag. The script prints an OAuth URL and opens the user's browser.

Tell the user: **"Browser should pop - sign in with the @tiktokarchitect Google account, click through the unverified-app warning, approve."**

Wait for the process to exit. If no browser opens within ~10 seconds, read the background output, copy the printed URL, and ask the user to open it manually.

When the process exits with code 0, verify a fresh `internal/claudecode/yt_token_tiktokarchitect.pickle` exists with mtime within the last 5 minutes:

```bash
ls -la "internal/claudecode/yt_token_tiktokarchitect.pickle"
```

## Step 4: Re-auth `randomtom83`

Same as Step 3, but for `randomtom83`. Tell the user: **"Second browser - sign in with the @randomtom83 Google account this time."**

```bash
cd "internal/claudecode" && python -c "from youtube_uploader import authenticate; authenticate('randomtom83')"
```

Wait for clean exit. Verify fresh `yt_token_randomtom83.pickle`.

## Step 5: Refresh the dashboard JSON

```bash
cd "internal/claudecode" && python export_upload_status.py
```

Expected: prints `Exported to: ...\public\data\youtube_uploads.json` and totals.

## Step 6: Final report

Confirm:
- Both fresh pickle files exist with mtimes within the last 5 minutes
- Both `.bak-YYYYMMDD` files exist (the old revoked tokens, kept for rollback)
- The dashboard JSON updated

Tell the user: "Both tokens re-authed. Next forced expiry is ~7 days from now at the latest. The 3am bat job will use these new tokens tomorrow morning."

If anything in this ritual fails, surface the error verbatim and stop. Do not improvise - re-auth issues need user judgment.
