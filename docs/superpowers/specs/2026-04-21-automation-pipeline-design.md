# TikTok Architect Automation Pipeline — Design Spec

**Date:** 2026-04-21
**Author:** Tom Reynolds + Claude
**Status:** Draft

---

## 1. Overview

An automated daily pipeline that answers one question: **"What should I post next?"**

The system scans architecture blogs, analyzes TikTok performance data from two accounts, merges external trends with audience signals, and delivers a morning digest email with actionable content recommendations. It also powers the analytics dashboard at tiktokarchitect.com/analytics.

### Accounts

- **@tiktokarchitect** — primary. Full analytics, architecture content.
- **@randomtom83** — supplementary. Pull engagement signals when architecture topics cross over into this account.

---

## 2. Architecture — Three Modular GitHub Actions

Each piece runs independently, fails independently, and can be re-run independently. They coordinate through git: pushing files to `data/` triggers downstream workflows.

### 2.1 Local Pipeline (3am Agent — Windows Task Scheduler)

Runs on Tom's local machine. Not in the repo. Downloads videos, comments, transcripts, and pushes only JSON analytics to GitHub.

**Schedule:**

| Time | Script | What |
|---|---|---|
| 3:00 AM | `download_randomtom83.py` | Download new videos, scrape comments, store in SQLite |
| 3:15 AM | `download_tiktokarchitect.py` | Same for @tiktokarchitect |
| 3:30 AM | `export_analytics.py` | Pull TikTok API metrics (watch-through, follower conversion), run Claude semantic analysis on transcripts/comments, output dashboard JSONs |
| 3:45 AM | `push_to_github.bat` | Copy JSONs to repo `data/`, git add, commit, push |

**Local file structure:**

```
D:\tiktok\claude\
├── download_randomtom83.py        # Existing (unchanged)
├── download_tiktokarchitect.py    # New (clone of above for second account)
├── export_analytics.py            # New (replaces export_dashboard_data.py)
├── push_to_github.bat             # New wrapper script
├── .env                            # Local-only (gitignored). TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, ANTHROPIC_API_KEY
└── data/
    ├── archive.db                  # SQLite (videos + comments)
    ├── videos/                     # MP4 + info.json (stays local)
    ├── comments/                   # Per-video comment JSONs
    ├── transcripts/                # Per-video transcript text
    └── theme_analysis.json         # Legacy (replaced by new analytics)
```

**`download_tiktokarchitect.py`:**
Clone of existing `download_randomtom83.py` with `PROFILE_URL` and `USERNAME` changed to `@tiktokarchitect`. Uses same SQLite database with account-prefixed tables, or a separate DB file.

**`export_analytics.py`:**
- Reads both accounts from SQLite
- Calls TikTok API with `TIKTOK_CLIENT_KEY` / `TIKTOK_CLIENT_SECRET` for real watch-through and follower conversion metrics on both accounts
- Calls Claude API for semantic analysis (see Section 4)
- Outputs `analytics-tiktokarchitect.json` and `analytics-randomtom83.json` matching the dashboard schema (see Section 5)
- Cross-references @randomtom83 architecture-related videos into @tiktokarchitect analysis

**`push_to_github.bat`:**
```bat
cd "C:\Users\thoma\Dropbox\My Documents\Websites\tiktokarchitect"
copy "D:\tiktok\claude\data\analytics-tiktokarchitect.json" "data\"
copy "D:\tiktok\claude\data\analytics-randomtom83.json" "data\"
git add data\*.json
git commit -m "daily: analytics update %date:~-4%-%date:~4,2%-%date:~7,2%"
git push origin main
```

### 2.2 Field Monitor (`field-monitor.yml`)

**Trigger:** Cron, Mon-Sat at 10:00 UTC (5:00 AM ET)

**What it does:**

1. Calls Claude API with web search tool. Prompt instructs it to scan these sources for the last 24 hours:
   - ArchDaily, Dezeen, Archinect, The Architect's Newspaper, Curbed, Architectural Digest, Designboom, Architect Magazine (AIA), Failed Architecture, McMansion Hell, 99% Invisible
2. Scope: strictly architecture/design (not urban planning, real estate, construction tech)
3. Clusters findings by theme — named by the claim or shift, not by source
4. Outputs `data/blog-trends-YYYY-MM-DD.json`
5. Commits and pushes to main (which triggers analytics-deploy)

**Output schema (`blog-trends-YYYY-MM-DD.json`):**

```json
{
  "scan_date": "2026-04-21",
  "sources_checked": ["ArchDaily", "Dezeen", ...],
  "trends": [
    {
      "topic": "Adaptive reuse is dominating mixed-use RFPs",
      "synthesis": "One paragraph summarizing the trend...",
      "sources": [
        { "title": "Article title", "url": "https://...", "source": "Dezeen" }
      ],
      "so_what": "Builders should... / This is lab-only because..."
    }
  ],
  "people": [
    { "name": "Person Name", "role": "Firm / Role", "why": "What they said/did that drove discussion" }
  ]
}
```

**Cost:** ~$0.10-0.15/day (one Claude API call with web search)

### 2.3 Analytics Deploy (`analytics-deploy.yml`)

**Trigger:** Push to `data/` on main branch

**What it does:**

1. **Merge** — Reads latest `analytics-tiktokarchitect.json`, `analytics-randomtom83.json`, and today's `blog-trends-*.json`. Claude API call cross-references blog trends against content clusters and audience conversation themes.
2. **Compute** — Adds to the analytics JSONs:
   - `external_trends[]` with `audience_resonance` scores
   - `headline_signal` — the "what to post next" recommendation
   - Verdict labels (STRONG / MEH / NOISE) on every cluster, style, theme
3. **Write** — Commits enriched analytics JSONs back to repo
4. **Deploy** — SFTP uploads `data/*.json` to IONOS (`Y:\tiktokarchitect\website\data\`)
5. **Email** — Sends morning digest via SMTP
6. **Cleanup** — Prunes `blog-trends-*.json` files older than 30 days

**Deduplication:** Checks `last_digest_date` flag in repo to avoid sending two emails if triggered twice in one morning (local push + blog push arriving separately).

**Email format:**

```
Subject: What to Post — [date]

TL;DR
═════
Post this today: [rec_title]
Why: [rec_reason] (confidence: [rec_confidence])

Top 3 blog trends:
• [trend 1 topic] — [one line]
• [trend 2 topic] — [one line]
• [trend 3 topic] — [one line]

Full Brief
══════════

§01 Recommended Topics (ranked)
[For each: topic, verdict, why it's trending, your angle from content
clusters, audience signals from comments, hook idea]

§02 Gap Analysis
[Topics your audience asks about that you haven't covered, cross-referenced
with external trends]

§03 Blog Trends Detail
[Each trend: paragraph synthesis, sources, "so what" for your content]

§04 Audience Pulse
[Top questions/requests from comments this cycle, new conversation themes]
```

**Cost:** ~$0.15-0.20/day (one Claude API call for merge/analysis)

---

## 3. Secrets (all stored in GitHub repo Randomtom83/tiktokarchitect)

| Secret | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API for Field Monitor + analytics merge |
| `GMAIL_ADDRESS` | Sender: youwishthiswasyour@gmail.com |
| `GMAIL_APP_PASSWORD` | Gmail app password for SMTP |
| `GMAIL_RECIPIENT` | Recipient: IAmThe@tiktokarchitect.com |
| `SFTP_HOST` | access830966489.webspace-data.io |
| `SFTP_PORT` | 22 |
| `SFTP_USER` | acc1691706028 |
| `SFTP_PASSWORD` | IONOS SFTP password |
| `TIKTOK_CLIENT_KEY` | TikTok API — covers both accounts |
| `TIKTOK_CLIENT_SECRET` | TikTok API secret |

---

## 4. Tiered Content Analytics Engine

The semantic analysis that makes this system answer "what to post next" at a substance level, not a metrics level. Claude performs this analysis in `export_analytics.py` (local) and again in the merge step (GitHub Action).

### Tier 1 — Content Clusters (what you talk about)

Claude reads each transcript and groups videos by subject matter. Not keyword matching — semantic understanding of what the video is actually about. Each cluster gets:

- `id`, `label` — e.g., `c_process`, "Renovation process & walkthroughs"
- `video_count`, `share_of_views`
- `avg_engagement`, `avg_follower_conversion` (from TikTok API)
- `trend` — up/steady/down (last 30 days vs prior 30)
- `verdict` — STRONG/MEH/NOISE per threshold logic

### Tier 2 — Presentation Styles (how you deliver it)

Same transcripts, different lens. Claude tags each video's delivery format:

- `walkthrough` — showing a process or space
- `tutorial` — teaching a skill or concept
- `personal_story` — narrative, lived experience
- `reaction` — responding to something (buildings, blueprints, news)
- `talking_head` — direct-to-camera opinion/update

Cross-referenced against engagement to surface: "walkthroughs convert 3x better than talking heads."

### Tier 3 — Audience Conversation Themes (what they're saying back)

Claude reads comment text. Filters out emoji-only, "first!", and low-substance comments. Semantic clustering of what people are actually discussing:

- Theme label, comment count, trend direction
- Extracted `questions[]` and `requests[]` — substantive asks only

### Tier 4 — External Trend Cross-Reference

The merge step (GitHub Action) scores each blog trend against existing content clusters and audience themes:

- `audience_resonance` = how closely the external topic maps to what the audience already engages with
- High resonance + STRONG cluster = strong signal to post about this

### Tier 5 — The Recommendation (`headline_signal`)

Weighted signal from three inputs:

1. **Audience demand** — topic appears in questions/requests
2. **External momentum** — topic is trending in today's blog scan
3. **Proven performance** — past content in this cluster had high follower conversion

Output: `rec_title`, `rec_reason`, `rec_confidence`

### Verdict Thresholds

Per the dashboard design doc:

- **STRONG** — follower conversion > 0.006 AND engagement > 0.08 AND trend in {up, steady}
- **MEH** — conversion in [0.003, 0.006] OR trend == steady with flat engagement
- **NOISE** — conversion < 0.003 AND (trend == down OR engagement < 0.06)

These thresholds are tunable per account. Stored in the analytics scripts, not in the dashboard UI.

---

## 5. Data Contract — Dashboard JSON Schema

The analytics JSON must match what the dashboard UI expects (per the Claude Design handoff CLAUDE.md). Key fields:

```json
{
  "account": { "handle", "display_name", "followers", "following", "updated_at" },
  "overview": { "date_range", "videos", "views", "likes", "comments", "shares",
                "engagement_rate", "new_followers", "follower_conversion_rate" },
  "headline_signal": { "best_performing_cluster_id", "verdict", "rec_title",
                       "rec_reason", "rec_confidence" },
  "videos": [{ "id", "title", "date", "duration", "views", "likes", "comments",
               "shares", "engagement_rate", "sentiment", "url", "has_transcript",
               "cluster", "style", "watch_through", "follower_conversion" }],
  "timeline": [{ "month", "videos", "views", "likes", "comments", "new_followers" }],
  "duration_analysis": [{ "bucket", "count", "avg_views", "avg_engagement",
                          "avg_watch_through" }],
  "sentiment": { "positive", "neutral", "negative" },
  "audience": {
    "inferred_segments": [{ "id", "label", "pct", "engaged_pct", "cities" }],
    "lurker_to_fan": { "lurkers", "occasional", "regulars", "fans" },
    "questions": [{ "text", "count", "cluster" }],
    "requests": [{ "text", "count" }]
  },
  "top_commenters": [{ "handle", "comments", "sentiment", "note" }],
  "content_clusters": [{ "id", "label", "video_count", "share_of_views",
                         "avg_follower_conversion", "avg_engagement", "trend",
                         "verdict" }],
  "topic_engagement_matrix": [{ "topic", "views_idx", "likes_idx", "comments_idx" }],
  "presentation_styles": [{ "style", "video_count", "avg_engagement",
                            "avg_follower_conversion", "verdict" }],
  "audience_conversation_themes": [{ "theme", "comment_count", "trend" }],
  "external_trends": [{ "topic", "audience_resonance", "source" }]
}
```

The UI renders verdicts — it does not compute them. All verdict logic lives in the pipeline.

---

## 6. What This Is NOT

- Not counting filler words or "um"s
- Not surface-level keyword matching
- Not raw metric dumps without context
- Not a replacement for the dashboard design — that's handled by Claude Design separately
- Not auto-refreshing — timestamped JSON, manual refresh in UI

---

## 7. Cost Estimate

| Component | Daily Cost |
|---|---|
| Field Monitor (Claude API + web search) | ~$0.10-0.15 |
| Analytics merge (Claude API) | ~$0.15-0.20 |
| Export analytics (Claude API, local) | ~$0.10-0.15 |
| TikTok API | Free tier |
| GitHub Actions | Free tier (public repo) |
| SFTP deploy | Included in IONOS hosting |
| Gmail SMTP | Free |
| **Total** | **~$0.35-0.50/day (~$10-15/month)** |

---

## 8. Acceptance Criteria

- [ ] Both TikTok accounts download and scrape comments nightly
- [ ] TikTok API provides real watch-through and follower conversion
- [ ] Semantic content clusters are substantive (not keyword-level)
- [ ] Blog scan covers all 11 sources, 24-hour lookback
- [ ] External trends cross-referenced with audience signals
- [ ] `headline_signal` recommendation is specific and actionable
- [ ] Email arrives Mon-Sat before 7am ET with TL;DR + full brief
- [ ] Dashboard JSONs match the schema contract
- [ ] SFTP deploy updates the live site
- [ ] No duplicate emails on multi-trigger mornings
- [ ] Blog trends older than 30 days auto-pruned
- [ ] Videos stay local, only JSONs in the repo
