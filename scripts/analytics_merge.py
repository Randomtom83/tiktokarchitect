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


def merge_and_recommend(analytics, blog_trends, account_context="architecture"):
    """Use Claude to cross-reference blog trends with TikTok analytics
    and generate the headline recommendation."""

    clusters_summary = json.dumps(analytics.get("content_clusters", []), indent=2)
    themes_summary = json.dumps(analytics.get("audience_conversation_themes", []), indent=2)
    questions = json.dumps(analytics.get("audience", {}).get("questions", [])[:20], indent=2)
    requests = json.dumps(analytics.get("audience", {}).get("requests", [])[:10], indent=2)
    styles_summary = json.dumps(analytics.get("presentation_styles", []), indent=2)
    trends_summary = json.dumps(blog_trends.get("trends", []) if blog_trends else [], indent=2)

    is_personal = account_context == "personal"

    # Recent videos — so Claude knows what was already posted
    # Include title AND description for better topic matching
    recent_videos = []
    for v in analytics.get("videos", []):
        if v.get("date"):
            recent_videos.append({
                "title": v["title"],
                "description": (v.get("description", "") or "")[:200],
                "date": v["date"],
                "cluster": v.get("cluster"),
            })
    recent_videos.sort(key=lambda x: x["date"], reverse=True)
    recent_videos = recent_videos[:50]
    recent_summary = json.dumps(recent_videos, indent=2)

    # Previously recommended topics (from headline_signal if it exists)
    prev_rec = analytics.get("headline_signal", {}).get("rec_title", "")

    if is_personal:
        account_intro = """You are analyzing TikTok content strategy for Tom Reynolds' PERSONAL account (@randomtom83).

This is NOT an architecture account. This is a dad/family/personal life account. Content includes:
- Daily car ride conversations with his daughter Sophia (preschool drop-off)
- Bambi the rescue dog
- Personal grief, family memories, and life moments
- Pop culture reactions (Bluey, etc.)
- Occasional personal projects (garden, home)

Do NOT suggest architecture content. Do NOT reference architecture blogs or trends.
Recommend content based purely on what performs well on THIS account and what THIS audience engages with."""
    else:
        account_intro = "You are analyzing TikTok content strategy for an architectural designer named Tom Reynolds (@tiktokarchitect)."

    trends_section = ""
    if not is_personal and trends_summary != "[]":
        trends_section = f"""
TODAY'S ARCHITECTURE BLOG TRENDS:
{trends_summary}
"""

    prompt = f"""{account_intro}

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
{trends_section}

RECENTLY POSTED VIDEOS (most recent first — includes title AND description):
{recent_summary}

PREVIOUS RECOMMENDATION (already suggested, do NOT repeat):
{prev_rec}

CRITICAL RULES:
1. Do NOT recommend any topic, person, project, or building that appears in the recent videos list above. Scan EVERY title and description. If "Kéré", "Goethe-Institut", "LACMA", or any other specific subject appears in ANY recent video, it is OFF LIMITS.
2. Do NOT repeat the previous recommendation shown above.
3. The recommendation must be about a topic the creator has NOT covered in the last 30 days.
4. If all trending topics were already covered, recommend something from audience questions/requests that hasn't been addressed yet.

Tasks:
1. Score each blog trend for "audience_resonance" (0.0-1.0) — how closely it maps to existing content clusters and audience themes.

2. Generate the "headline_signal" — the single best recommendation for what to post next. Must be FRESH (not covered recently). Include:
   - A specific, actionable title
   - Why this topic (data references)
   - 3-5 talking points the video could cover
   - 2-3 reference article URLs from the blog trends (if applicable)
   - Suggested video format and length

3. Set confidence (0.0-1.0): high if multiple signals align, low if it's a guess.

Return ONLY valid JSON:
{{
  "external_trends": [
    {{"topic": "trend topic from blog scan", "audience_resonance": 0.85, "source": "Source Name"}}
  ],
  "headline_signal": {{
    "best_performing_cluster_id": "c_<id of best cluster>",
    "verdict": "STRONG|MEH|NOISE",
    "rec_title": "specific actionable recommendation (MUST be a new topic)",
    "rec_reason": "why this, with data references",
    "rec_confidence": 0.82,
    "talking_points": [
      "First key point the video should cover",
      "Second key point",
      "Third key point"
    ],
    "reference_urls": [
      {{"title": "Article title", "url": "https://...", "source": "ArchDaily"}},
      {{"title": "Article title", "url": "https://...", "source": "Dezeen"}}
    ],
    "suggested_format": "walkthrough|tutorial|personal_story|reaction|talking_head",
    "suggested_length": "60-90s"
  }}
}}"""

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=8192,
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

    # Also enrich randomtom83 with its own recommendation
    # This is a PERSONAL/DAD LIFE account — no architecture blog trends
    if handle != "randomtom83":
        rm_analytics = load_analytics("randomtom83")
        if rm_analytics and rm_analytics.get("content_clusters"):
            print(f"\n  Generating recommendation for @randomtom83 (personal account, no arch trends)...")
            try:
                rm_result = merge_and_recommend(rm_analytics, None, account_context="personal")
                rm_analytics["headline_signal"] = rm_result["headline_signal"]
                rm_analytics["external_trends"] = []
                print(f"  Recommendation: {rm_result['headline_signal']['rec_title'][:60]}...")
            except Exception as e:
                print(f"  ERROR: @randomtom83 merge failed: {e}")
                rm_analytics["external_trends"] = []
            rm_path = DATA_DIR / "analytics-randomtom83.json"
            with open(rm_path, "w", encoding="utf-8") as f:
                json.dump(rm_analytics, f, ensure_ascii=False, indent=2)
            print(f"  Wrote enriched: {rm_path}")

    print(f"[{datetime.now().isoformat()}] Merge complete.")


if __name__ == "__main__":
    main()
