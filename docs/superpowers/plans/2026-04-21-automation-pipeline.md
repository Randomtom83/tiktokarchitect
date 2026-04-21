# TikTok Architect Automation Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a daily automated pipeline that scans architecture blogs, analyzes TikTok performance across two accounts, and delivers a morning "what to post next" email digest + dashboard JSON updates.

**Architecture:** Three modular subsystems connected through git pushes. Local 3am agent downloads TikTok data and pushes JSONs to repo. GitHub Actions run the Field Monitor (blog scan) and Analytics Deploy (merge, verdict, SFTP deploy, email). Each subsystem is independently testable and deployable.

**Tech Stack:** Python 3 (local scripts), GitHub Actions (CI/CD), Anthropic Claude API (semantic analysis + web search), TikTok API (metrics), SMTP (email), SFTP (deploy to IONOS), SQLite (local data store), Next.js 16 (existing site).

**Spec:** `docs/superpowers/specs/2026-04-21-automation-pipeline-design.md`

---

## File Map

### Repo files (new)

| File | Responsibility |
|---|---|
| `data/.gitkeep` | Ensure `data/` dir exists in repo |
| `.github/workflows/field-monitor.yml` | Cron Mon-Sat 5am ET — scan architecture blogs |
| `.github/workflows/analytics-deploy.yml` | Trigger on `data/` push — merge, deploy, email |
| `scripts/field_monitor.py` | Claude API blog scanner with web search |
| `scripts/analytics_merge.py` | Merge TikTok + blog data, compute verdicts + headline |
| `scripts/send_digest.py` | Format and send morning email via SMTP |
| `scripts/requirements.txt` | Python deps for GitHub Actions scripts |

### Local files (not in repo)

| File | Responsibility |
|---|---|
| `D:\tiktok\claude\download_tiktokarchitect.py` | Download @tiktokarchitect videos + comments |
| `D:\tiktok\claude\export_analytics.py` | TikTok API enrichment + Claude semantic analysis |
| `D:\tiktok\claude\push_to_github.bat` | Copy JSONs to repo, git commit + push |
| `D:\tiktok\claude\.env` | Local API keys (TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, ANTHROPIC_API_KEY) |

---

## Plan 1: Local Pipeline (3am Agent)

### Task 1: Create the @tiktokarchitect downloader

**Files:**
- Create: `D:\tiktok\claude\download_tiktokarchitect.py`

- [ ] **Step 1: Copy the existing download script**

Copy `D:\tiktok\claude\download_randomtom83.py` to `D:\tiktok\claude\download_tiktokarchitect.py`.

- [ ] **Step 2: Update constants for @tiktokarchitect**

Edit `D:\tiktok\claude\download_tiktokarchitect.py` — change these three lines at the top:

```python
PROFILE_URL = "https://www.tiktok.com/@tiktokarchitect/"
USERNAME = "tiktokarchitect"
```

And update the data directories to keep accounts separate:

```python
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data-tiktokarchitect"
VIDEO_DIR = DATA_DIR / "videos"
COMMENT_DIR = DATA_DIR / "comments"
DB_PATH = DATA_DIR / "archive.db"
ARCHIVE_FILE = DATA_DIR / "downloaded.txt"
```

- [ ] **Step 3: Test the download script**

Run: `python D:\tiktok\claude\download_tiktokarchitect.py`

Expected: Creates `D:\tiktok\claude\data-tiktokarchitect\` directory tree, downloads videos from @tiktokarchitect, scrapes comments, stores in SQLite. Console output shows progress and summary.

- [ ] **Step 4: Verify the database**

Run:
```bash
python -c "import sqlite3; conn=sqlite3.connect('D:/tiktok/claude/data-tiktokarchitect/archive.db'); print('Videos:', conn.execute('SELECT COUNT(*) FROM videos').fetchone()[0]); print('Comments:', conn.execute('SELECT COUNT(*) FROM comments').fetchone()[0])"
```

Expected: Non-zero video count, comment count may be 0 if scraping is slow.

---

### Task 2: Create the local .env file

**Files:**
- Create: `D:\tiktok\claude\.env`

- [ ] **Step 1: Create the .env file**

Write `D:\tiktok\claude\.env`:

```
TIKTOK_CLIENT_KEY=sbawzkxbrvonqf83b0
TIKTOK_CLIENT_SECRET=0qhzVpuUj6K9tW8I2BCF8akCycHYtyOV
ANTHROPIC_API_KEY=<paste from GitHub secret or Anthropic console>
```

Note: The Anthropic API key needs to be copied from wherever Tom originally set it. It's already in GitHub secrets as `ANTHROPIC_API_KEY` but we need the raw value locally. Tom will need to provide this.

- [ ] **Step 2: Verify .env loads**

Run:
```bash
python -c "from dotenv import load_dotenv; import os; load_dotenv('D:/tiktok/claude/.env'); print('TK:', os.getenv('TIKTOK_CLIENT_KEY')[:4]+'...'); print('AN:', 'set' if os.getenv('ANTHROPIC_API_KEY') else 'MISSING')"
```

Expected: Shows `TK: sbaw...` and `AN: set`.

If `dotenv` not installed: `pip install python-dotenv`

---

### Task 3: Build export_analytics.py — TikTok API client

**Files:**
- Create: `D:\tiktok\claude\export_analytics.py`

This is the largest local script. We build it in stages. This task handles the TikTok API integration for fetching watch-through and follower metrics.

- [ ] **Step 1: Create the script skeleton with TikTok API auth**

Write `D:\tiktok\claude\export_analytics.py`:

```python
#!/usr/bin/env python3
"""
Export TikTok analytics for @tiktokarchitect and @randomtom83.
Pulls metrics from TikTok API, runs Claude semantic analysis,
outputs dashboard-ready JSON.
"""

import json
import os
import sqlite3
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict

import httpx
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

BASE_DIR = Path(__file__).parent
ACCOUNTS = {
    "tiktokarchitect": {
        "db": BASE_DIR / "data-tiktokarchitect" / "archive.db",
        "transcripts": BASE_DIR / "data-tiktokarchitect" / "transcripts",
        "comments": BASE_DIR / "data-tiktokarchitect" / "comments",
        "primary": True,
    },
    "randomtom83": {
        "db": BASE_DIR / "data" / "archive.db",
        "transcripts": BASE_DIR / "data" / "transcripts",
        "comments": BASE_DIR / "data" / "comments",
        "primary": False,
    },
}
OUTPUT_DIR = BASE_DIR / "data"

TIKTOK_CLIENT_KEY = os.getenv("TIKTOK_CLIENT_KEY")
TIKTOK_CLIENT_SECRET = os.getenv("TIKTOK_CLIENT_SECRET")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")


def get_tiktok_access_token():
    """Get OAuth2 access token from TikTok API."""
    resp = httpx.post(
        "https://open.tiktokapis.com/v2/oauth/token/",
        data={
            "client_key": TIKTOK_CLIENT_KEY,
            "client_secret": TIKTOK_CLIENT_SECRET,
            "grant_type": "client_credentials",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def fetch_video_metrics(access_token, video_ids):
    """Fetch watch-through and other metrics from TikTok API for a batch of video IDs."""
    metrics = {}
    # TikTok Research API allows batch queries of up to 20 video IDs
    for i in range(0, len(video_ids), 20):
        batch = video_ids[i:i+20]
        resp = httpx.post(
            "https://open.tiktokapis.com/v2/video/query/",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            json={
                "filters": {"video_ids": batch},
                "fields": [
                    "id", "view_count", "like_count", "comment_count",
                    "share_count", "video_duration",
                ],
            },
        )
        if resp.status_code == 200:
            data = resp.json()
            for v in data.get("data", {}).get("videos", []):
                metrics[v["id"]] = v
        time.sleep(1)  # rate limit
    return metrics


def load_db(db_path):
    """Load all videos and comments from a SQLite archive."""
    if not db_path.exists():
        return [], []
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    videos = conn.execute("SELECT * FROM videos ORDER BY upload_date DESC").fetchall()
    comments = conn.execute(
        "SELECT * FROM comments WHERE text IS NOT NULL AND text != ''"
    ).fetchall()
    conn.close()
    return videos, comments


def format_date(s):
    """Convert YYYYMMDD to YYYY-MM-DD."""
    if not s or len(s) < 8:
        return None
    return f"{s[:4]}-{s[4:6]}-{s[6:8]}"


print("export_analytics.py skeleton loaded OK")
```

- [ ] **Step 2: Test the skeleton loads and TikTok auth works**

Run: `python D:\tiktok\claude\export_analytics.py`

Expected: Prints "export_analytics.py skeleton loaded OK"

Then test TikTok auth:
```bash
python -c "
from export_analytics import get_tiktok_access_token
token = get_tiktok_access_token()
print('Token:', token[:10]+'...')
"
```

Expected: Prints a token prefix. If TikTok returns an error, note the error — we may need to adjust the OAuth flow based on the app type (some TikTok apps require user-level auth, not client_credentials).

- [ ] **Step 3: Commit**

This is a local-only file, not in the git repo. No commit needed.

---

### Task 4: Build export_analytics.py — Claude semantic analysis

**Files:**
- Modify: `D:\tiktok\claude\export_analytics.py`

- [ ] **Step 1: Add the Claude analysis functions**

Append to `export_analytics.py`:

```python
def load_transcripts(transcript_dir):
    """Load all transcript text files into a dict of {video_id: text}."""
    transcripts = {}
    if not transcript_dir.exists():
        return transcripts
    for f in transcript_dir.glob("*.txt"):
        video_id = f.stem
        text = f.read_text(encoding="utf-8").strip()
        if text:
            transcripts[video_id] = text
    return transcripts


def load_comment_texts(comment_dir):
    """Load all comment JSON files into a dict of {video_id: [text, ...]}."""
    comments = {}
    if not comment_dir.exists():
        return comments
    for f in comment_dir.glob("*_comments.json"):
        video_id = f.stem.replace("_comments", "")
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            texts = [c.get("text", "") for c in data if c.get("text", "").strip()]
            if texts:
                comments[video_id] = texts
        except (json.JSONDecodeError, KeyError):
            pass
    return comments


def claude_analyze(transcripts, comments_by_video, videos_db):
    """
    Send transcripts and comments to Claude for semantic analysis.
    Returns content_clusters, presentation_styles, audience_conversation_themes,
    questions, requests.
    """
    # Build a summary of each video for Claude
    video_summaries = []
    for v in videos_db:
        vid = v["id"]
        summary = {
            "id": vid,
            "title": v["title"] or "",
            "description": (v["description"] or "")[:200],
            "date": format_date(v["upload_date"]),
            "views": v["view_count"] or 0,
            "likes": v["like_count"] or 0,
            "comments_count": v["comment_count"] or 0,
            "duration": round(v["duration"] or 0, 1),
        }
        if vid in transcripts:
            # Truncate long transcripts to save tokens
            summary["transcript"] = transcripts[vid][:1500]
        if vid in comments_by_video:
            # Send top 20 substantive comments
            summary["sample_comments"] = comments_by_video[vid][:20]
        video_summaries.append(summary)

    # Limit to most recent 100 videos to stay within token budget
    video_summaries = video_summaries[:100]

    prompt = f"""Analyze these TikTok videos from an architectural designer's account.
Return a JSON object with these exact fields:

1. "content_clusters": Group videos by SUBJECT MATTER (what they talk about), not keywords.
   Each cluster: {{"id": "c_<short>", "label": "<descriptive name>", "video_ids": ["id1", ...]}}
   Use 4-7 clusters. Name them by the actual architectural topic.

2. "presentation_styles": Tag each video's DELIVERY FORMAT.
   Options: "walkthrough", "tutorial", "personal_story", "reaction", "talking_head"
   Return: {{"style": "<name>", "video_ids": ["id1", ...]}}

3. "audience_conversation_themes": Cluster the comments by what people are ACTUALLY DISCUSSING.
   Filter out emoji-only, "first!", low-substance comments.
   Each theme: {{"theme": "<descriptive name>", "video_ids": ["id1", ...], "trend_signal": "up|steady|down"}}

4. "questions": Substantive questions from comments (not rhetorical).
   Each: {{"text": "<the question>", "count": <approx frequency>, "cluster_id": "c_<short>"}}

5. "requests": Content requests from the audience.
   Each: {{"text": "<what they want>", "count": <approx frequency>}}

Return ONLY valid JSON. No markdown, no explanation.

Videos:
{json.dumps(video_summaries, indent=2)}"""

    resp = httpx.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-sonnet-4-6-20250514",
            "max_tokens": 4096,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=120,
    )
    resp.raise_for_status()
    text = resp.json()["content"][0]["text"]

    # Parse JSON from response (handle potential markdown wrapping)
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text)
```

- [ ] **Step 2: Test Claude analysis with a small sample**

Run:
```bash
python -c "
from export_analytics import *
videos, comments = load_db(ACCOUNTS['randomtom83']['db'])
transcripts = load_transcripts(ACCOUNTS['randomtom83']['transcripts'])
comment_texts = load_comment_texts(ACCOUNTS['randomtom83']['comments'])
print(f'Videos: {len(videos)}, Transcripts: {len(transcripts)}, Comment files: {len(comment_texts)}')
# Test with just 5 videos
result = claude_analyze(transcripts, comment_texts, videos[:5])
print(json.dumps(result, indent=2)[:500])
"
```

Expected: Returns JSON with content_clusters, presentation_styles, audience_conversation_themes, questions, requests.

---

### Task 5: Build export_analytics.py — verdict computation and JSON output

**Files:**
- Modify: `D:\tiktok\claude\export_analytics.py`

- [ ] **Step 1: Add verdict computation and main export function**

Append to `export_analytics.py`:

```python
def compute_verdict(follower_conversion, engagement, trend):
    """Apply verdict thresholds from the design spec."""
    if (follower_conversion > 0.006 and engagement > 0.08
            and trend in ("up", "steady")):
        return "STRONG"
    if (follower_conversion < 0.003
            and (trend == "down" or engagement < 0.06)):
        return "NOISE"
    return "MEH"


def compute_trend(videos, cluster_video_ids):
    """Compute trend direction for a cluster based on recent vs older performance."""
    now = datetime.now()
    cutoff = (now - timedelta(days=30)).strftime("%Y%m%d")
    prior_cutoff = (now - timedelta(days=60)).strftime("%Y%m%d")

    recent_eng = []
    older_eng = []
    for v in videos:
        if v["id"] not in cluster_video_ids:
            continue
        date = v["upload_date"] or ""
        views = v["view_count"] or 0
        likes = v["like_count"] or 0
        eng = likes / views if views > 0 else 0
        if date >= cutoff:
            recent_eng.append(eng)
        elif date >= prior_cutoff:
            older_eng.append(eng)

    if not recent_eng or not older_eng:
        return "steady"
    avg_recent = sum(recent_eng) / len(recent_eng)
    avg_older = sum(older_eng) / len(older_eng)
    if avg_recent > avg_older * 1.15:
        return "up"
    if avg_recent < avg_older * 0.85:
        return "down"
    return "steady"


def analyze_sentiment(comment_texts):
    """Simple sentiment analysis for comments."""
    pos_words = set("love great amazing awesome best beautiful perfect helpful thanks thank fire lit goat dope sick nice cool good wow incredible learn learned informative interesting useful".split())
    neg_words = set("hate bad worst terrible awful boring cringe trash fake wrong stop annoying stupid ugly disagree no".split())
    pos = neg = neu = 0
    for t in comment_texts:
        words = set(t.lower().split())
        if words & pos_words:
            pos += 1
        elif words & neg_words:
            neg += 1
        else:
            neu += 1
    total = pos + neg + neu
    if total == 0:
        return {"positive": 0, "neutral": 0, "negative": 0}
    return {
        "positive": round(pos / total, 2),
        "neutral": round(neu / total, 2),
        "negative": round(neg / total, 2),
    }


def build_dashboard_json(account_handle, videos_db, comments_db,
                         transcripts, comment_texts_by_video,
                         claude_analysis, tiktok_metrics):
    """Build the full dashboard JSON matching the design contract schema."""
    videos_out = []
    total_views = total_likes = total_comments = total_shares = 0
    monthly = defaultdict(lambda: {"videos": 0, "views": 0, "likes": 0,
                                   "comments": 0, "new_followers": 0})
    duration_buckets = defaultdict(list)

    # Map video_id -> cluster and style from Claude analysis
    vid_to_cluster = {}
    for c in claude_analysis.get("content_clusters", []):
        for vid in c.get("video_ids", []):
            vid_to_cluster[vid] = c["id"]

    vid_to_style = {}
    for s in claude_analysis.get("presentation_styles", []):
        for vid in s.get("video_ids", []):
            vid_to_style[vid] = s["style"]

    for v in videos_db:
        vid = v["id"]
        views = v["view_count"] or 0
        likes = v["like_count"] or 0
        cmts = v["comment_count"] or 0
        shares = v["share_count"] or 0
        dur = round(v["duration"] or 0, 1)
        eng = round((likes + cmts + shares) / views, 4) if views > 0 else 0
        date = format_date(v["upload_date"])

        total_views += views
        total_likes += likes
        total_comments += cmts
        total_shares += shares

        # TikTok API enrichment
        api_data = tiktok_metrics.get(vid, {})
        watch_through = api_data.get("avg_watch_time", 0)
        if watch_through and dur > 0:
            watch_through = round(watch_through / dur, 2)
        else:
            watch_through = None
        follower_conv = api_data.get("follower_conversion", None)

        # Sentiment from comments
        vid_comments = comment_texts_by_video.get(vid, [])
        sentiment = analyze_sentiment(vid_comments)

        # Duration bucket
        if dur <= 15:
            bucket = "0-15s"
        elif dur <= 30:
            bucket = "15-30s"
        elif dur <= 60:
            bucket = "30-60s"
        elif dur <= 90:
            bucket = "60-90s"
        elif dur <= 120:
            bucket = "90-120s"
        else:
            bucket = "120s+"
        duration_buckets[bucket].append({"eng": eng, "views": views,
                                         "wt": watch_through})

        # Monthly aggregation
        if date:
            m = date[:7]
            monthly[m]["videos"] += 1
            monthly[m]["views"] += views
            monthly[m]["likes"] += likes
            monthly[m]["comments"] += cmts

        videos_out.append({
            "id": vid,
            "title": v["title"] or "",
            "description": (v["description"] or "")[:200],
            "date": date,
            "duration": dur,
            "views": views,
            "likes": likes,
            "comments": cmts,
            "shares": shares,
            "engagement_rate": eng,
            "sentiment": sentiment,
            "url": v["url"] or f"https://www.tiktok.com/@{account_handle}/video/{vid}",
            "has_transcript": vid in transcripts,
            "cluster": vid_to_cluster.get(vid),
            "style": vid_to_style.get(vid),
            "watch_through": watch_through,
            "follower_conversion": follower_conv,
        })

    # Build content_clusters with metrics
    content_clusters = []
    for c in claude_analysis.get("content_clusters", []):
        c_vids = [v for v in videos_out if v["cluster"] == c["id"]]
        if not c_vids:
            continue
        c_views = sum(v["views"] for v in c_vids)
        c_eng = sum(v["engagement_rate"] for v in c_vids) / len(c_vids)
        c_fc_vals = [v["follower_conversion"] for v in c_vids
                     if v["follower_conversion"] is not None]
        c_fc = sum(c_fc_vals) / len(c_fc_vals) if c_fc_vals else 0
        trend = compute_trend(videos_db, set(c.get("video_ids", [])))
        verdict = compute_verdict(c_fc, c_eng, trend)
        content_clusters.append({
            "id": c["id"],
            "label": c["label"],
            "video_count": len(c_vids),
            "share_of_views": round(c_views / max(total_views, 1), 2),
            "avg_follower_conversion": round(c_fc, 4),
            "avg_engagement": round(c_eng, 4),
            "trend": trend,
            "verdict": verdict,
        })

    # Build presentation_styles with metrics
    pres_styles = []
    for s in claude_analysis.get("presentation_styles", []):
        s_vids = [v for v in videos_out if v["style"] == s["style"]]
        if not s_vids:
            continue
        s_eng = sum(v["engagement_rate"] for v in s_vids) / len(s_vids)
        s_fc_vals = [v["follower_conversion"] for v in s_vids
                     if v["follower_conversion"] is not None]
        s_fc = sum(s_fc_vals) / len(s_fc_vals) if s_fc_vals else 0
        verdict = compute_verdict(s_fc, s_eng, "steady")
        pres_styles.append({
            "style": s["style"],
            "video_count": len(s_vids),
            "avg_engagement": round(s_eng, 4),
            "avg_follower_conversion": round(s_fc, 4),
            "verdict": verdict,
        })

    # Build audience_conversation_themes
    conv_themes = []
    for t in claude_analysis.get("audience_conversation_themes", []):
        conv_themes.append({
            "theme": t["theme"],
            "comment_count": len(t.get("video_ids", [])) * 5,  # approximate
            "trend": t.get("trend_signal", "steady"),
        })

    # Duration analysis
    dur_analysis = []
    for bucket, entries in sorted(duration_buckets.items()):
        if not entries:
            continue
        avg_eng = sum(e["eng"] for e in entries) / len(entries)
        avg_views = sum(e["views"] for e in entries) / len(entries)
        wt_vals = [e["wt"] for e in entries if e["wt"] is not None]
        avg_wt = sum(wt_vals) / len(wt_vals) if wt_vals else None
        dur_analysis.append({
            "bucket": bucket,
            "count": len(entries),
            "avg_views": round(avg_views),
            "avg_engagement": round(avg_eng, 4),
            "avg_watch_through": round(avg_wt, 2) if avg_wt else None,
        })

    # Topic engagement matrix
    topic_matrix = []
    if total_views > 0:
        avg_views_per = total_views / max(len(videos_out), 1)
        avg_likes_per = total_likes / max(len(videos_out), 1)
        avg_cmts_per = total_comments / max(len(videos_out), 1)
        for c in content_clusters:
            c_vids = [v for v in videos_out if v["cluster"] == c["id"]]
            if not c_vids:
                continue
            c_avg_v = sum(v["views"] for v in c_vids) / len(c_vids)
            c_avg_l = sum(v["likes"] for v in c_vids) / len(c_vids)
            c_avg_c = sum(v["comments"] for v in c_vids) / len(c_vids)
            topic_matrix.append({
                "topic": c["label"],
                "views_idx": round(c_avg_v / max(avg_views_per, 1), 2),
                "likes_idx": round(c_avg_l / max(avg_likes_per, 1), 2),
                "comments_idx": round(c_avg_c / max(avg_cmts_per, 1), 2),
            })

    # Overall sentiment
    all_comment_texts = []
    for vid_comments in comment_texts_by_video.values():
        all_comment_texts.extend(vid_comments)
    overall_sentiment = analyze_sentiment(all_comment_texts)

    # Top commenters
    commenter_stats = defaultdict(lambda: {"count": 0, "total_likes": 0})
    for c in comments_db:
        author = c["author"] or "unknown"
        commenter_stats[author]["count"] += 1
        commenter_stats[author]["total_likes"] += c["likes"] or 0
    top_commenters = sorted(
        [{"handle": f"@{k}", "comments": v["count"],
          "sentiment": 0.7}  # placeholder — could run per-commenter sentiment
         for k, v in commenter_stats.items()],
        key=lambda x: x["comments"], reverse=True
    )[:30]

    # Timeline
    timeline = [{"month": k, **v} for k, v in sorted(monthly.items())]

    # Overall engagement rate
    overall_eng = round(
        (total_likes + total_comments + total_shares) / max(total_views, 1), 4
    )

    # Questions and requests
    questions = claude_analysis.get("questions", [])
    requests = claude_analysis.get("requests", [])

    sorted_dates = sorted(
        [v["date"] for v in videos_out if v["date"]], reverse=False
    )

    return {
        "account": {
            "handle": f"@{account_handle}",
            "display_name": "Tom Reynolds",
            "followers": 0,  # updated by TikTok API if available
            "following": 0,
            "updated_at": datetime.now().isoformat(),
        },
        "overview": {
            "date_range": {
                "start": sorted_dates[0] if sorted_dates else None,
                "end": sorted_dates[-1] if sorted_dates else None,
            },
            "videos": len(videos_out),
            "views": total_views,
            "likes": total_likes,
            "comments": total_comments,
            "shares": total_shares,
            "engagement_rate": overall_eng,
            "new_followers": 0,  # delta from TikTok API
            "follower_conversion_rate": 0,  # computed from API data
        },
        "headline_signal": {
            "best_performing_cluster_id": None,
            "verdict": "MEH",
            "rec_title": "",
            "rec_reason": "",
            "rec_confidence": 0,
        },  # filled by analytics_merge.py after blog trends arrive
        "videos": videos_out,
        "timeline": timeline,
        "duration_analysis": dur_analysis,
        "sentiment": overall_sentiment,
        "audience": {
            "inferred_segments": [],  # requires more data than we have locally
            "lurker_to_fan": {},
            "questions": questions[:100],
            "requests": requests[:100],
        },
        "top_commenters": top_commenters,
        "content_clusters": content_clusters,
        "topic_engagement_matrix": topic_matrix,
        "presentation_styles": pres_styles,
        "audience_conversation_themes": conv_themes,
        "external_trends": [],  # filled by analytics_merge.py
    }
```

- [ ] **Step 2: Add the main function**

Append to `export_analytics.py`, replacing the `print("skeleton loaded OK")` line:

```python
def main():
    print(f"[{datetime.now().isoformat()}] Starting analytics export...")

    # Get TikTok API token
    try:
        token = get_tiktok_access_token()
        print("  TikTok API: authenticated")
    except Exception as e:
        print(f"  TikTok API: auth failed ({e}), proceeding without API metrics")
        token = None

    for handle, cfg in ACCOUNTS.items():
        print(f"\n  Processing @{handle}...")

        # Load local data
        videos_db, comments_db = load_db(cfg["db"])
        transcripts = load_transcripts(cfg["transcripts"])
        comment_texts = load_comment_texts(cfg["comments"])
        print(f"    Videos: {len(videos_db)}, Transcripts: {len(transcripts)}, Comment files: {len(comment_texts)}")

        # Fetch TikTok API metrics
        tiktok_metrics = {}
        if token:
            video_ids = [v["id"] for v in videos_db]
            try:
                tiktok_metrics = fetch_video_metrics(token, video_ids)
                print(f"    TikTok API: got metrics for {len(tiktok_metrics)} videos")
            except Exception as e:
                print(f"    TikTok API: fetch failed ({e})")

        # Run Claude semantic analysis
        try:
            claude_result = claude_analyze(transcripts, comment_texts, videos_db)
            print(f"    Claude: {len(claude_result.get('content_clusters', []))} clusters, "
                  f"{len(claude_result.get('presentation_styles', []))} styles")
        except Exception as e:
            print(f"    Claude: analysis failed ({e})")
            claude_result = {
                "content_clusters": [], "presentation_styles": [],
                "audience_conversation_themes": [], "questions": [], "requests": [],
            }

        # Build dashboard JSON
        dashboard = build_dashboard_json(
            handle, videos_db, comments_db,
            transcripts, comment_texts, claude_result, tiktok_metrics,
        )

        # Write output
        out_path = OUTPUT_DIR / f"analytics-{handle}.json"
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(dashboard, f, ensure_ascii=False, indent=2)
        print(f"    Wrote: {out_path}")

    print(f"\n[{datetime.now().isoformat()}] Export complete.")


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Test the full export**

Run: `python D:\tiktok\claude\export_analytics.py`

Expected: Processes both accounts (tiktokarchitect may be empty if not yet downloaded), writes two JSON files to `D:\tiktok\claude\data\`. Verify the output:

```bash
python -c "
import json
data = json.load(open('D:/tiktok/claude/data/analytics-randomtom83.json'))
print('Videos:', data['overview']['videos'])
print('Clusters:', len(data['content_clusters']))
print('Styles:', len(data['presentation_styles']))
print('Themes:', len(data['audience_conversation_themes']))
"
```

Expected: Non-zero counts for videos, clusters, styles, and themes.

---

### Task 6: Create push_to_github.bat

**Files:**
- Create: `D:\tiktok\claude\push_to_github.bat`

- [ ] **Step 1: Write the wrapper script**

Write `D:\tiktok\claude\push_to_github.bat`:

```bat
@echo off
echo [%date% %time%] Starting git push...

set REPO_DIR=C:\Users\thoma\Dropbox\My Documents\Websites\tiktokarchitect
set DATA_SRC=D:\tiktok\claude\data

:: Copy analytics JSONs to repo
copy /Y "%DATA_SRC%\analytics-tiktokarchitect.json" "%REPO_DIR%\data\" >nul 2>&1
copy /Y "%DATA_SRC%\analytics-randomtom83.json" "%REPO_DIR%\data\" >nul 2>&1

:: Git commit and push
cd /d "%REPO_DIR%"

:: Ensure data dir exists
if not exist "data" mkdir data

:: Copy again in case data dir was just created
copy /Y "%DATA_SRC%\analytics-tiktokarchitect.json" "data\" >nul 2>&1
copy /Y "%DATA_SRC%\analytics-randomtom83.json" "data\" >nul 2>&1

git add data\analytics-*.json
git diff --cached --quiet
if %ERRORLEVEL% EQU 0 (
    echo No changes to commit.
) else (
    git commit -m "daily: analytics update %date:~-4%-%date:~4,2%-%date:~7,2%"
    git push origin main
    echo Push complete.
)

echo [%date% %time%] Done.
```

- [ ] **Step 2: Create the data directory in the repo with a .gitkeep**

Run:
```bash
mkdir -p "/c/Users/thoma/Dropbox/My Documents/Websites/tiktokarchitect/data"
touch "/c/Users/thoma/Dropbox/My Documents/Websites/tiktokarchitect/data/.gitkeep"
```

- [ ] **Step 3: Test the bat file (dry run)**

Run `push_to_github.bat` from the command line. Since there are no JSON files yet, it should print "No changes to commit."

- [ ] **Step 4: Commit the data directory**

```bash
cd "C:\Users\thoma\Dropbox\My Documents\Websites\tiktokarchitect"
git add data/.gitkeep
git commit -m "chore: add data directory for analytics JSON output"
```

---

## Plan 2: Field Monitor (GitHub Action)

### Task 7: Create scripts/requirements.txt

**Files:**
- Create: `scripts/requirements.txt` (in repo)

- [ ] **Step 1: Write the requirements file**

Write `scripts/requirements.txt`:

```
anthropic>=0.49.0
httpx>=0.27.0
```

- [ ] **Step 2: Commit**

```bash
git add scripts/requirements.txt
git commit -m "chore: add Python deps for GitHub Actions scripts"
```

---

### Task 8: Build scripts/field_monitor.py

**Files:**
- Create: `scripts/field_monitor.py` (in repo)

- [ ] **Step 1: Write the field monitor script**

Write `scripts/field_monitor.py`:

```python
#!/usr/bin/env python3
"""
Field Monitor — scans architecture blogs daily and outputs a trends JSON.
Called by .github/workflows/field-monitor.yml
"""

import json
import os
import sys
from datetime import datetime

import anthropic

ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]

SOURCES = [
    "ArchDaily", "Dezeen", "Archinect", "The Architect's Newspaper",
    "Curbed", "Architectural Digest", "Designboom",
    "Architect Magazine (AIA)", "Failed Architecture",
    "McMansion Hell", "99% Invisible",
]

SCAN_PROMPT = f"""You are a field monitor tracking architecture and design news.

Search these sources for articles published in the LAST 24 HOURS:
{', '.join(SOURCES)}

Scope: strictly architecture and design. NOT urban planning, real estate, construction tech, or interior design.

For everything you find:

1. CLUSTER BY THEME — not by source. Name each cluster by the claim or shift, e.g. "adaptive reuse is dominating mixed-use RFPs" not "3 articles from Dezeen".

2. For each cluster: write a one-paragraph synthesis, list the 2-3 strongest source articles with title and URL, and write a "so what" line — does this change how an architect or architecture content creator should think about this topic today?

3. Separately list any architects, firms, or critics whose work drove discussion today — the "who to watch" section.

Be ruthless about signal. A project gallery with no insight is noise. A blog post that says "we shipped this and here's what broke" is signal. Prioritize controversy, shifts in practice, and emerging project types.

Return ONLY valid JSON in this exact format:
{{
  "scan_date": "{datetime.now().strftime('%Y-%m-%d')}",
  "sources_checked": {json.dumps(SOURCES)},
  "trends": [
    {{
      "topic": "descriptive theme name as a claim or shift",
      "synthesis": "one paragraph summarizing the trend",
      "sources": [
        {{"title": "article title", "url": "https://...", "source": "Source Name"}}
      ],
      "so_what": "what this means for an architecture content creator"
    }}
  ],
  "people": [
    {{"name": "Person Name", "role": "Firm / Role", "why": "what they said or did"}}
  ]
}}

If you find nothing noteworthy in the last 24 hours, return the JSON with empty trends and people arrays.
"""


def main():
    output_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(output_dir, exist_ok=True)
    date_str = datetime.now().strftime("%Y-%m-%d")
    output_path = os.path.join(output_dir, f"blog-trends-{date_str}.json")

    print(f"Field Monitor — scanning for {date_str}")
    print(f"Sources: {len(SOURCES)}")

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    # Use Claude with web search tool
    response = client.messages.create(
        model="claude-sonnet-4-6-20250514",
        max_tokens=4096,
        tools=[{"type": "web_search_20250305"}],
        messages=[{"role": "user", "content": SCAN_PROMPT}],
    )

    # Extract text from response (may have multiple content blocks due to tool use)
    text = ""
    for block in response.content:
        if block.type == "text":
            text = block.text
            break

    # Parse JSON
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]

    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        print(f"ERROR: Failed to parse Claude response as JSON")
        print(f"Raw response: {text[:500]}")
        sys.exit(1)

    # Validate required fields
    assert "trends" in result, "Missing 'trends' field"
    assert "people" in result, "Missing 'people' field"
    result["scan_date"] = date_str
    result["sources_checked"] = SOURCES

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"Wrote: {output_path}")
    print(f"Trends found: {len(result['trends'])}")
    print(f"People noted: {len(result['people'])}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Commit**

```bash
git add scripts/field_monitor.py
git commit -m "feat: add field monitor — daily architecture blog scanner"
```

---

### Task 9: Create .github/workflows/field-monitor.yml

**Files:**
- Create: `.github/workflows/field-monitor.yml`

- [ ] **Step 1: Write the workflow**

Write `.github/workflows/field-monitor.yml`:

```yaml
name: Field Monitor — Architecture Blog Scan

on:
  schedule:
    # Mon-Sat at 10:00 UTC (5:00 AM ET)
    - cron: '0 10 * * 1-6'
  workflow_dispatch:  # allow manual trigger

permissions:
  contents: write

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: pip install -r scripts/requirements.txt

      - name: Run Field Monitor
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: python scripts/field_monitor.py

      - name: Prune old blog trends (>30 days)
        run: |
          find data/ -name 'blog-trends-*.json' -mtime +30 -delete 2>/dev/null || true

      - name: Commit and push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/blog-trends-*.json
          git diff --cached --quiet && echo "No changes" && exit 0
          git commit -m "field-monitor: blog trends $(date +%Y-%m-%d)"
          git push
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/field-monitor.yml
git commit -m "feat: add field monitor GitHub Action — cron Mon-Sat 5am ET"
```

---

## Plan 3: Analytics Deploy (GitHub Action)

### Task 10: Build scripts/analytics_merge.py

**Files:**
- Create: `scripts/analytics_merge.py` (in repo)

- [ ] **Step 1: Write the merge script**

Write `scripts/analytics_merge.py`:

```python
#!/usr/bin/env python3
"""
Analytics Merge — cross-references TikTok analytics with blog trends,
computes verdicts and headline recommendation.
Called by .github/workflows/analytics-deploy.yml
"""

import json
import os
import sys
from datetime import datetime
from glob import glob
from pathlib import Path

import anthropic

ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]
DATA_DIR = Path(os.path.dirname(__file__)) / ".." / "data"


def load_analytics(handle):
    """Load the analytics JSON for an account."""
    path = DATA_DIR / f"analytics-{handle}.json"
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def load_latest_blog_trends():
    """Load today's blog trends, or the most recent available."""
    pattern = str(DATA_DIR / "blog-trends-*.json")
    files = sorted(glob(pattern), reverse=True)
    if not files:
        return None
    return json.loads(Path(files[0]).read_text(encoding="utf-8"))


def merge_and_recommend(analytics, blog_trends):
    """Use Claude to cross-reference blog trends with TikTok analytics
    and generate the headline recommendation."""

    clusters_summary = json.dumps(analytics.get("content_clusters", []), indent=2)
    themes_summary = json.dumps(analytics.get("audience_conversation_themes", []), indent=2)
    questions = json.dumps(analytics.get("audience", {}).get("questions", [])[:20], indent=2)
    requests = json.dumps(analytics.get("audience", {}).get("requests", [])[:10], indent=2)
    styles_summary = json.dumps(analytics.get("presentation_styles", []), indent=2)
    trends_summary = json.dumps(blog_trends.get("trends", []) if blog_trends else [], indent=2)

    prompt = f"""You are analyzing TikTok content strategy for an architectural designer.

CONTENT CLUSTERS (what topics perform well):
{clusters_summary}

AUDIENCE CONVERSATION THEMES (what viewers discuss):
{themes_summary}

AUDIENCE QUESTIONS:
{questions}

AUDIENCE REQUESTS:
{requests}

PRESENTATION STYLES (what formats work):
{styles_summary}

TODAY'S ARCHITECTURE BLOG TRENDS:
{trends_summary}

Tasks:
1. Score each blog trend for "audience_resonance" (0.0-1.0) — how closely it maps to existing content clusters and audience themes. High score = the audience already cares about this.

2. Generate the "headline_signal" — the single best recommendation for what to post next. Consider:
   - Audience demand (questions + requests)
   - External momentum (blog trends with high resonance)
   - Proven performance (STRONG clusters and styles)
   Pick the intersection. Be specific — not "post about architecture" but "post a walkthrough of [specific topic] because [specific reason]."

3. Set confidence (0.0-1.0): high if multiple signals align, low if it's a guess.

Return ONLY valid JSON:
{{
  "external_trends": [
    {{"topic": "trend topic from blog scan", "audience_resonance": 0.85, "source": "Source Name"}}
  ],
  "headline_signal": {{
    "best_performing_cluster_id": "c_<id of best cluster>",
    "verdict": "STRONG|MEH|NOISE",
    "rec_title": "specific actionable recommendation",
    "rec_reason": "why this, with data references",
    "rec_confidence": 0.82
  }}
}}"""

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    response = client.messages.create(
        model="claude-sonnet-4-6-20250514",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )

    text = response.content[0].text
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]

    return json.loads(text)


def main():
    print(f"[{datetime.now().isoformat()}] Analytics merge starting...")

    # Load primary account
    analytics = load_analytics("tiktokarchitect")
    if not analytics:
        print("  No tiktokarchitect analytics found, checking randomtom83...")
        analytics = load_analytics("randomtom83")
    if not analytics:
        print("  ERROR: No analytics JSON found in data/")
        sys.exit(1)

    # Load blog trends
    blog_trends = load_latest_blog_trends()
    if blog_trends:
        print(f"  Blog trends: {len(blog_trends.get('trends', []))} trends from {blog_trends.get('scan_date', 'unknown')}")
    else:
        print("  No blog trends found — proceeding without external data")

    # Run Claude merge
    try:
        result = merge_and_recommend(analytics, blog_trends)
        print(f"  Recommendation: {result['headline_signal']['rec_title'][:60]}...")
        print(f"  Confidence: {result['headline_signal']['rec_confidence']}")
        print(f"  External trends scored: {len(result.get('external_trends', []))}")
    except Exception as e:
        print(f"  ERROR: Claude merge failed: {e}")
        result = {
            "external_trends": [],
            "headline_signal": {
                "best_performing_cluster_id": None,
                "verdict": "MEH",
                "rec_title": "Merge failed — check logs",
                "rec_reason": str(e),
                "rec_confidence": 0,
            },
        }

    # Update analytics with merged data
    analytics["headline_signal"] = result["headline_signal"]
    analytics["external_trends"] = result.get("external_trends", [])

    # Write back
    handle = analytics["account"]["handle"].lstrip("@")
    out_path = DATA_DIR / f"analytics-{handle}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(analytics, f, ensure_ascii=False, indent=2)
    print(f"  Wrote enriched: {out_path}")

    # Also enrich randomtom83 if it exists and is different
    if handle != "randomtom83":
        rm_analytics = load_analytics("randomtom83")
        if rm_analytics:
            rm_analytics["external_trends"] = result.get("external_trends", [])
            rm_path = DATA_DIR / "analytics-randomtom83.json"
            with open(rm_path, "w", encoding="utf-8") as f:
                json.dump(rm_analytics, f, ensure_ascii=False, indent=2)
            print(f"  Wrote enriched: {rm_path}")

    print(f"[{datetime.now().isoformat()}] Merge complete.")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Commit**

```bash
git add scripts/analytics_merge.py
git commit -m "feat: add analytics merge — cross-references TikTok data with blog trends"
```

---

### Task 11: Build scripts/send_digest.py

**Files:**
- Create: `scripts/send_digest.py` (in repo)

- [ ] **Step 1: Write the email digest script**

Write `scripts/send_digest.py`:

```python
#!/usr/bin/env python3
"""
Send morning digest email — TL;DR + full brief.
Called by .github/workflows/analytics-deploy.yml
"""

import json
import os
import smtplib
import sys
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from glob import glob
from pathlib import Path

GMAIL_ADDRESS = os.environ["GMAIL_ADDRESS"]
GMAIL_APP_PASSWORD = os.environ["GMAIL_APP_PASSWORD"]
GMAIL_RECIPIENT = os.environ["GMAIL_RECIPIENT"]
DATA_DIR = Path(os.path.dirname(__file__)) / ".." / "data"


def load_analytics():
    """Load the primary analytics JSON."""
    for handle in ["tiktokarchitect", "randomtom83"]:
        path = DATA_DIR / f"analytics-{handle}.json"
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
    return None


def load_latest_blog_trends():
    """Load the most recent blog trends."""
    pattern = str(DATA_DIR / "blog-trends-*.json")
    files = sorted(glob(pattern), reverse=True)
    if not files:
        return None
    return json.loads(Path(files[0]).read_text(encoding="utf-8"))


def format_digest(analytics, blog_trends):
    """Format the email body."""
    date_str = datetime.now().strftime("%A, %B %d, %Y")
    hs = analytics.get("headline_signal", {})

    # TL;DR section
    tldr = f"""TL;DR
{'=' * 60}

Post this today: {hs.get('rec_title', 'No recommendation available')}
Why: {hs.get('rec_reason', 'N/A')}
Confidence: {hs.get('rec_confidence', 0):.0%}
"""

    # Top blog trends
    if blog_trends and blog_trends.get("trends"):
        tldr += "\nTop architecture trends today:\n"
        for t in blog_trends["trends"][:3]:
            tldr += f"  * {t['topic']}\n"

    # Full brief
    brief = f"""

Full Brief
{'=' * 60}

S01 Recommended Topics (ranked by signal strength)
{'-' * 40}
"""
    clusters = sorted(
        analytics.get("content_clusters", []),
        key=lambda c: {"STRONG": 3, "MEH": 2, "NOISE": 1}.get(c.get("verdict", ""), 0),
        reverse=True,
    )
    for c in clusters:
        brief += f"\n[{c.get('verdict', '?')}] {c.get('label', 'Unknown')}\n"
        brief += f"  Videos: {c.get('video_count', 0)} | "
        brief += f"Engagement: {c.get('avg_engagement', 0):.1%} | "
        brief += f"Trend: {c.get('trend', '?')}\n"

    # Gap analysis
    brief += f"""
S02 Gap Analysis
{'-' * 40}
Topics your audience asks about:
"""
    questions = analytics.get("audience", {}).get("questions", [])
    for q in questions[:7]:
        brief += f"  ? {q.get('text', '')} (asked ~{q.get('count', 0)} times)\n"

    requests = analytics.get("audience", {}).get("requests", [])
    if requests:
        brief += "\nContent requests:\n"
        for r in requests[:5]:
            brief += f"  > {r.get('text', '')} (requested ~{r.get('count', 0)} times)\n"

    # Blog trends detail
    if blog_trends and blog_trends.get("trends"):
        brief += f"""
S03 Blog Trends Detail
{'-' * 40}
"""
        for t in blog_trends["trends"]:
            brief += f"\n{t['topic']}\n"
            brief += f"  {t.get('synthesis', '')}\n"
            for s in t.get("sources", []):
                brief += f"  - {s.get('title', '')} ({s.get('source', '')})\n"
                if s.get("url"):
                    brief += f"    {s['url']}\n"
            brief += f"  So what: {t.get('so_what', '')}\n"

    # Audience pulse
    brief += f"""
S04 Audience Pulse
{'-' * 40}
"""
    themes = analytics.get("audience_conversation_themes", [])
    for t in themes[:6]:
        arrow = {"up": "^", "down": "v", "steady": "-"}.get(t.get("trend", ""), "?")
        brief += f"  [{arrow}] {t.get('theme', '')} ({t.get('comment_count', 0)} comments)\n"

    return tldr + brief


def check_already_sent():
    """Check if we already sent a digest today."""
    flag_path = DATA_DIR / ".last-digest-date"
    today = datetime.now().strftime("%Y-%m-%d")
    if flag_path.exists() and flag_path.read_text().strip() == today:
        return True
    return False


def mark_sent():
    """Record that we sent today's digest."""
    flag_path = DATA_DIR / ".last-digest-date"
    flag_path.write_text(datetime.now().strftime("%Y-%m-%d"))


def main():
    if check_already_sent():
        print("Digest already sent today — skipping.")
        return

    analytics = load_analytics()
    if not analytics:
        print("ERROR: No analytics JSON found")
        sys.exit(1)

    blog_trends = load_latest_blog_trends()
    body = format_digest(analytics, blog_trends)

    date_str = datetime.now().strftime("%b %d")
    subject = f"What to Post — {date_str}"

    msg = MIMEMultipart()
    msg["From"] = GMAIL_ADDRESS
    msg["To"] = GMAIL_RECIPIENT
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain", "utf-8"))

    print(f"Sending digest to {GMAIL_RECIPIENT}...")
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
        server.send_message(msg)

    mark_sent()
    print(f"Sent: {subject}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Commit**

```bash
git add scripts/send_digest.py
git commit -m "feat: add email digest — morning TL;DR + full brief"
```

---

### Task 12: Create .github/workflows/analytics-deploy.yml

**Files:**
- Create: `.github/workflows/analytics-deploy.yml`

- [ ] **Step 1: Write the workflow**

Write `.github/workflows/analytics-deploy.yml`:

```yaml
name: Analytics Deploy — Merge, Deploy, Email

on:
  push:
    branches: [main]
    paths:
      - 'data/analytics-*.json'
      - 'data/blog-trends-*.json'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    # Don't run on commits from this workflow (prevent infinite loop)
    if: github.actor != 'github-actions[bot]'
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: pip install -r scripts/requirements.txt

      - name: Merge analytics with blog trends
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: python scripts/analytics_merge.py

      - name: Commit enriched analytics
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/analytics-*.json data/.last-digest-date
          git diff --cached --quiet && echo "No changes" || {
            git commit -m "analytics: enriched with verdicts and recommendations $(date +%Y-%m-%d)"
            git push
          }

      - name: Deploy to IONOS via SFTP
        uses: wlixcc/SFTP-Deploy-Action@v1.2.4
        with:
          server: ${{ secrets.SFTP_HOST }}
          port: ${{ secrets.SFTP_PORT }}
          username: ${{ secrets.SFTP_USER }}
          password: ${{ secrets.SFTP_PASSWORD }}
          local_path: './data/'
          remote_path: '/data/'
          sftp_only: true

      - name: Send morning digest email
        env:
          GMAIL_ADDRESS: ${{ secrets.GMAIL_ADDRESS }}
          GMAIL_APP_PASSWORD: ${{ secrets.GMAIL_APP_PASSWORD }}
          GMAIL_RECIPIENT: ${{ secrets.GMAIL_RECIPIENT }}
        run: python scripts/send_digest.py
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/analytics-deploy.yml
git commit -m "feat: add analytics deploy workflow — merge, SFTP, email"
```

---

### Task 13: Initial push to GitHub

**Files:**
- All committed files from previous tasks

- [ ] **Step 1: Verify all files are committed**

Run: `git status`

Expected: Clean working tree with all new files committed.

- [ ] **Step 2: Check what will be pushed**

Run: `git log --oneline main..HEAD` (or `git log --oneline` if no remote tracking yet)

Expected: Multiple commits covering data dir, scripts, and workflows.

- [ ] **Step 3: Push to GitHub**

Run: `git push -u origin main`

Expected: All commits pushed to Randomtom83/tiktokarchitect.

- [ ] **Step 4: Verify workflows appear on GitHub**

Run: `gh workflow list --repo Randomtom83/tiktokarchitect`

Expected: Shows "Field Monitor" and "Analytics Deploy" workflows.

- [ ] **Step 5: Test Field Monitor manually**

Run: `gh workflow run field-monitor.yml --repo Randomtom83/tiktokarchitect`

Watch: `gh run list --repo Randomtom83/tiktokarchitect --limit 1`

Expected: Workflow runs, scans blogs, commits a `blog-trends-*.json` file.

---

### Task 14: Set up Windows Task Scheduler for 3am agent

- [ ] **Step 1: Document the task schedule**

The user needs to configure Windows Task Scheduler with four tasks:

| Task Name | Time | Action |
|---|---|---|
| TikTok Download - randomtom83 | 3:00 AM daily | `python D:\tiktok\claude\download_randomtom83.py` |
| TikTok Download - tiktokarchitect | 3:15 AM daily | `python D:\tiktok\claude\download_tiktokarchitect.py` |
| TikTok Export Analytics | 3:30 AM daily | `python D:\tiktok\claude\export_analytics.py` |
| TikTok Push to GitHub | 3:45 AM daily | `D:\tiktok\claude\push_to_github.bat` |

For each, in Task Scheduler:
- General tab: Run whether user is logged on or not
- Trigger: Daily at the specified time
- Action: Start a program
  - Program: `python` (or full path to python.exe)
  - Arguments: the script path
  - Start in: `D:\tiktok\claude`

- [ ] **Step 2: Verify the existing 3am task**

Run: `schtasks /query /tn "TikTok*" /fo LIST` to see if any existing tasks need updating.

---

## Execution Order

Plans are independent but share the `data/` directory contract:

1. **Plan 1 (Local Pipeline)** — Tasks 1-6. Can be tested immediately on the local machine.
2. **Plan 2 (Field Monitor)** — Tasks 7-9. Deploy to GitHub, test with manual workflow trigger.
3. **Plan 3 (Analytics Deploy)** — Tasks 10-13. Deploy to GitHub, test by pushing a JSON to `data/`.
4. **Task 14** — Wire up the Windows scheduler last, once everything else works.

Each plan produces independently testable output. Plan 1 produces JSONs locally. Plan 2 produces `blog-trends-*.json` on GitHub. Plan 3 reads both and produces the email + deployment.
