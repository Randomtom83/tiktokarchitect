#!/usr/bin/env python3
"""
Export Analytics — reads TikTok archive JSONs, runs Claude semantic analysis,
outputs dashboard-ready JSON. Runs on GitHub Actions.
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict

import anthropic

ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]
DATA_DIR = Path(os.path.dirname(__file__)) / ".." / "data"

ACCOUNTS = ["tiktokarchitect", "randomtom83"]


def load_archive(handle):
    """Load the TikTok archive JSON for an account."""
    path = DATA_DIR / f"tiktok-archive-{handle}.json"
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def format_date(s):
    """Convert YYYYMMDD to YYYY-MM-DD."""
    if not s or len(s) < 8:
        return None
    return f"{s[:4]}-{s[4:6]}-{s[6:8]}"


def claude_analyze(videos, comments_by_video):
    """Send video data and comments to Claude for semantic analysis."""
    video_summaries = []
    for v in videos[:100]:
        vid = v["id"]
        summary = {
            "id": vid,
            "title": v.get("title", ""),
            "description": (v.get("description", "") or "")[:200],
            "date": format_date(v.get("upload_date")),
            "views": v.get("view_count", 0),
            "likes": v.get("like_count", 0),
            "comments_count": v.get("comment_count", 0),
            "duration": round(v.get("duration", 0) or 0, 1),
        }
        vid_comments = comments_by_video.get(vid, [])
        if vid_comments:
            summary["sample_comments"] = [c["text"] for c in vid_comments[:20]]
        video_summaries.append(summary)

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

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=16384,
        messages=[{"role": "user", "content": prompt}],
    )
    text = response.content[0].text

    # Robust JSON extraction
    result = None
    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        pass

    if result is None and "```" in text:
        for chunk in text.split("```"):
            chunk = chunk.strip()
            if chunk.startswith("json"):
                chunk = chunk[4:].strip()
            try:
                result = json.loads(chunk)
                break
            except json.JSONDecodeError:
                continue

    if result is None:
        start = text.find("{")
        if start >= 0:
            depth = 0
            for i in range(start, len(text)):
                if text[i] == "{":
                    depth += 1
                elif text[i] == "}":
                    depth -= 1
                if depth == 0:
                    try:
                        result = json.loads(text[start:i + 1])
                    except json.JSONDecodeError:
                        pass
                    break

    if result is None:
        raise ValueError(f"Failed to parse JSON: {text[:200]}")
    return result


def compute_verdict(follower_conversion, engagement, trend):
    if follower_conversion > 0.006 and engagement > 0.08 and trend in ("up", "steady"):
        return "STRONG"
    if follower_conversion < 0.003 and (trend == "down" or engagement < 0.06):
        return "NOISE"
    return "MEH"


def compute_trend(videos, cluster_video_ids):
    now = datetime.now()
    cutoff = (now - timedelta(days=30)).strftime("%Y%m%d")
    prior_cutoff = (now - timedelta(days=60)).strftime("%Y%m%d")

    recent_eng = []
    older_eng = []
    for v in videos:
        if v["id"] not in cluster_video_ids:
            continue
        date = v.get("upload_date", "")
        views = v.get("view_count", 0) or 0
        likes = v.get("like_count", 0) or 0
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


def build_dashboard_json(handle, archive, claude_analysis):
    """Build dashboard JSON from archive + Claude analysis."""
    videos_raw = archive.get("videos", [])
    comments_by_video = archive.get("comments", {})

    videos_out = []
    total_views = total_likes = total_comments = total_shares = 0
    monthly = defaultdict(lambda: {"videos": 0, "views": 0, "likes": 0, "comments": 0, "new_followers": 0})
    duration_buckets = defaultdict(list)

    vid_to_cluster = {}
    for c in claude_analysis.get("content_clusters", []):
        for vid in c.get("video_ids", []):
            vid_to_cluster[vid] = c["id"]

    vid_to_style = {}
    for s in claude_analysis.get("presentation_styles", []):
        for vid in s.get("video_ids", []):
            vid_to_style[vid] = s["style"]

    for v in videos_raw:
        vid = v["id"]
        views = v.get("view_count", 0) or 0
        likes = v.get("like_count", 0) or 0
        cmts = v.get("comment_count", 0) or 0
        shares = v.get("share_count", 0) or 0
        dur = round(v.get("duration", 0) or 0, 1)
        eng = round((likes + cmts + shares) / views, 4) if views > 0 else 0
        date = format_date(v.get("upload_date"))

        total_views += views
        total_likes += likes
        total_comments += cmts
        total_shares += shares

        vid_comments = [c["text"] for c in comments_by_video.get(vid, [])]
        sentiment = analyze_sentiment(vid_comments)

        bucket = "0-15s" if dur <= 15 else "15-30s" if dur <= 30 else "30-60s" if dur <= 60 else "60-90s" if dur <= 90 else "90-120s" if dur <= 120 else "120s+"
        duration_buckets[bucket].append({"eng": eng, "views": views})

        if date:
            m = date[:7]
            monthly[m]["videos"] += 1
            monthly[m]["views"] += views
            monthly[m]["likes"] += likes
            monthly[m]["comments"] += cmts

        videos_out.append({
            "id": vid, "title": v.get("title", ""), "description": (v.get("description", "") or "")[:200],
            "date": date, "duration": dur, "views": views, "likes": likes,
            "comments": cmts, "shares": shares, "engagement_rate": eng,
            "sentiment": sentiment, "url": v.get("url", f"https://www.tiktok.com/@{handle}/video/{vid}"),
            "has_transcript": False, "cluster": vid_to_cluster.get(vid),
            "style": vid_to_style.get(vid), "watch_through": None, "follower_conversion": None,
        })

    # Build content clusters with metrics
    content_clusters = []
    for c in claude_analysis.get("content_clusters", []):
        c_vids = [v for v in videos_out if v["cluster"] == c["id"]]
        if not c_vids:
            continue
        c_views = sum(v["views"] for v in c_vids)
        c_eng = sum(v["engagement_rate"] for v in c_vids) / len(c_vids)
        trend = compute_trend(videos_raw, set(c.get("video_ids", [])))
        content_clusters.append({
            "id": c["id"], "label": c["label"], "video_count": len(c_vids),
            "share_of_views": round(c_views / max(total_views, 1), 2),
            "avg_follower_conversion": 0, "avg_engagement": round(c_eng, 4),
            "trend": trend, "verdict": compute_verdict(0, c_eng, trend),
        })

    # Presentation styles
    pres_styles = []
    for s in claude_analysis.get("presentation_styles", []):
        s_vids = [v for v in videos_out if v["style"] == s["style"]]
        if not s_vids:
            continue
        s_eng = sum(v["engagement_rate"] for v in s_vids) / len(s_vids)
        pres_styles.append({
            "style": s["style"], "video_count": len(s_vids),
            "avg_engagement": round(s_eng, 4), "avg_follower_conversion": 0,
            "verdict": compute_verdict(0, s_eng, "steady"),
        })

    # Conversation themes
    conv_themes = [{"theme": t["theme"], "comment_count": len(t.get("video_ids", [])) * 5,
                    "trend": t.get("trend_signal", "steady")}
                   for t in claude_analysis.get("audience_conversation_themes", [])]

    # Duration analysis
    dur_analysis = []
    for bucket in ["0-15s", "15-30s", "30-60s", "60-90s", "90-120s", "120s+"]:
        entries = duration_buckets.get(bucket, [])
        if not entries:
            continue
        dur_analysis.append({
            "bucket": bucket, "count": len(entries),
            "avg_views": round(sum(e["views"] for e in entries) / len(entries)),
            "avg_engagement": round(sum(e["eng"] for e in entries) / len(entries), 4),
            "avg_watch_through": None,
        })

    # Topic engagement matrix
    topic_matrix = []
    if total_views > 0:
        avg_v = total_views / max(len(videos_out), 1)
        avg_l = total_likes / max(len(videos_out), 1)
        avg_c = total_comments / max(len(videos_out), 1)
        for c in content_clusters:
            c_vids = [v for v in videos_out if v["cluster"] == c["id"]]
            if not c_vids:
                continue
            topic_matrix.append({
                "topic": c["label"],
                "views_idx": round(sum(v["views"] for v in c_vids) / len(c_vids) / max(avg_v, 1), 2),
                "likes_idx": round(sum(v["likes"] for v in c_vids) / len(c_vids) / max(avg_l, 1), 2),
                "comments_idx": round(sum(v["comments"] for v in c_vids) / len(c_vids) / max(avg_c, 1), 2),
            })

    # Overall sentiment
    all_comments = []
    for vid_comments in comments_by_video.values():
        all_comments.extend(c["text"] for c in vid_comments)
    overall_sentiment = analyze_sentiment(all_comments)

    # Top commenters
    commenter_stats = defaultdict(lambda: {"count": 0})
    for vid_comments in comments_by_video.values():
        for c in vid_comments:
            commenter_stats[c.get("author", "unknown")]["count"] += 1
    top_commenters = sorted(
        [{"handle": f"@{k}", "comments": v["count"], "sentiment": 0.7} for k, v in commenter_stats.items()],
        key=lambda x: x["comments"], reverse=True
    )[:30]

    overall_eng = round((total_likes + total_comments + total_shares) / max(total_views, 1), 4)
    sorted_dates = sorted([v["date"] for v in videos_out if v["date"]])

    return {
        "account": {"handle": f"@{handle}", "display_name": "Tom Reynolds",
                     "followers": 0, "following": 0, "updated_at": datetime.now().isoformat()},
        "overview": {
            "date_range": {"start": sorted_dates[0] if sorted_dates else None, "end": sorted_dates[-1] if sorted_dates else None},
            "videos": len(videos_out), "views": total_views, "likes": total_likes,
            "comments": total_comments, "shares": total_shares, "engagement_rate": overall_eng,
            "new_followers": 0, "follower_conversion_rate": 0,
        },
        "headline_signal": {"best_performing_cluster_id": None, "verdict": "MEH",
                            "rec_title": "", "rec_reason": "", "rec_confidence": 0},
        "videos": videos_out, "timeline": [{"month": k, **v} for k, v in sorted(monthly.items())],
        "duration_analysis": dur_analysis, "sentiment": overall_sentiment,
        "audience": {
            "inferred_segments": [], "lurker_to_fan": {},
            "questions": claude_analysis.get("questions", [])[:100],
            "requests": claude_analysis.get("requests", [])[:100],
        },
        "top_commenters": top_commenters, "content_clusters": content_clusters,
        "topic_engagement_matrix": topic_matrix, "presentation_styles": pres_styles,
        "audience_conversation_themes": conv_themes, "external_trends": [],
    }


def main():
    print(f"[{datetime.now().isoformat()}] Export Analytics starting...")

    for handle in ACCOUNTS:
        print(f"\n  Processing @{handle}...")
        archive = load_archive(handle)
        if not archive:
            print(f"  No archive found for @{handle}, skipping")
            continue

        videos = archive.get("videos", [])
        comments = archive.get("comments", {})
        print(f"    Videos: {len(videos)}, Comment files: {len(comments)}")

        try:
            claude_result = claude_analyze(videos, comments)
            print(f"    Claude: {len(claude_result.get('content_clusters', []))} clusters, "
                  f"{len(claude_result.get('presentation_styles', []))} styles")
        except Exception as e:
            print(f"    Claude: analysis failed ({e})")
            claude_result = {"content_clusters": [], "presentation_styles": [],
                             "audience_conversation_themes": [], "questions": [], "requests": []}

        dashboard = build_dashboard_json(handle, archive, claude_result)
        out_path = DATA_DIR / f"analytics-{handle}.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(dashboard, f, ensure_ascii=False, indent=2)
        print(f"    Wrote: {out_path}")

    print(f"\n[{datetime.now().isoformat()}] Export complete.")


if __name__ == "__main__":
    main()
