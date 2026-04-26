#!/usr/bin/env python3
"""
TikTok Ingest — pulls video metadata and comments for both accounts.
Runs on GitHub Actions (no browser cookies needed).
Uses yt-dlp for metadata and TikTok web API for comments.
Stores in JSON files in data/ directory.
"""

import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

import httpx
import yt_dlp

DATA_DIR = Path(os.path.dirname(__file__)) / ".." / "data"

ACCOUNTS = [
    {"handle": "tiktokarchitect", "url": "https://www.tiktok.com/@tiktokarchitect/"},
    {"handle": "randomtom83", "url": "https://www.tiktok.com/@randomtom83/"},
]

COMMENT_DELAY = 2.5
COMMENTS_PER_PAGE = 30
MAX_COMMENTS_PER_VIDEO = 200  # cap per video for speed on GitHub Actions


def fetch_videos(profile_url, existing_ids):
    """Fetch video metadata from a TikTok profile using yt-dlp."""
    videos = []
    opts = {
        "simulate": True,
        "quiet": True,
        "extract_flat": False,
        "ignoreerrors": True,
    }

    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(profile_url, download=False)
            for entry in info.get("entries", []):
                if entry is None:
                    continue
                vid = entry.get("id", "")
                videos.append({
                    "id": vid,
                    "title": entry.get("title", ""),
                    "description": entry.get("description", ""),
                    "upload_date": entry.get("upload_date", ""),
                    "duration": entry.get("duration", 0),
                    "view_count": entry.get("view_count", 0),
                    "like_count": entry.get("like_count", 0),
                    "comment_count": entry.get("comment_count", 0),
                    "share_count": entry.get("repost_count", 0),
                    "url": entry.get("webpage_url", ""),
                    "is_new": vid not in existing_ids,
                })
    except Exception as e:
        print(f"  WARNING: yt-dlp error: {e}")

    return videos


def scrape_comments(video_id, username):
    """Scrape comments for a single video via TikTok web API."""
    comments = []
    cursor = 0
    retries = 0

    with httpx.Client(timeout=30, follow_redirects=True) as client:
        while len(comments) < MAX_COMMENTS_PER_VIDEO:
            params = {
                "aid": "1988",
                "aweme_id": video_id,
                "count": str(COMMENTS_PER_PAGE),
                "cursor": str(cursor),
            }
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": f"https://www.tiktok.com/@{username}/video/{video_id}",
            }
            try:
                resp = client.get(
                    "https://www.tiktok.com/api/comment/list/",
                    params=params, headers=headers,
                )
                if resp.status_code == 429:
                    time.sleep(30)
                    retries += 1
                    if retries > 2:
                        break
                    continue
                if resp.status_code != 200:
                    break
                data = resp.json()
                batch = data.get("comments", [])
                if not batch:
                    break
                for c in batch:
                    text = c.get("text", "").strip()
                    if text:
                        comments.append({
                            "text": text,
                            "author": c.get("user", {}).get("unique_id", ""),
                            "likes": c.get("digg_count", 0),
                            "created_at": c.get("create_time", ""),
                        })
                if not data.get("has_more", False):
                    break
                cursor = data.get("cursor", cursor + COMMENTS_PER_PAGE)
                retries = 0
                time.sleep(COMMENT_DELAY)
            except Exception:
                retries += 1
                if retries > 2:
                    break
                time.sleep(5)

    return comments


def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    print(f"[{datetime.now().isoformat()}] TikTok Ingest starting...")

    for account in ACCOUNTS:
        handle = account["handle"]
        archive_path = DATA_DIR / f"tiktok-archive-{handle}.json"

        # Load existing archive
        existing = {}
        if archive_path.exists():
            try:
                existing = json.loads(archive_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                existing = {}

        existing_videos = {v["id"]: v for v in existing.get("videos", [])}
        existing_comments = existing.get("comments", {})

        print(f"\n  @{handle}: {len(existing_videos)} existing videos")

        # Fetch all video metadata
        print(f"  Fetching video metadata...")
        videos = fetch_videos(account["url"], set(existing_videos.keys()))
        new_count = sum(1 for v in videos if v["is_new"])
        print(f"  Found {len(videos)} videos ({new_count} new)")

        # Update video metadata (keep existing data, add new)
        for v in videos:
            vid = v["id"]
            v.pop("is_new", None)
            if vid in existing_videos:
                # Update metrics but keep existing comments flag
                existing_videos[vid].update({
                    "view_count": v["view_count"],
                    "like_count": v["like_count"],
                    "comment_count": v["comment_count"],
                    "share_count": v["share_count"],
                })
            else:
                existing_videos[vid] = v

        # Scrape comments for videos that don't have them yet
        videos_needing_comments = [
            vid for vid in existing_videos
            if vid not in existing_comments or not existing_comments[vid]
        ]
        # Also re-scrape videos with new comments (comment_count changed)
        for vid, vdata in existing_videos.items():
            if vid in existing_comments:
                old_count = len(existing_comments[vid])
                new_count_api = vdata.get("comment_count", 0)
                if new_count_api > old_count + 5 and vid not in videos_needing_comments:
                    videos_needing_comments.append(vid)

        # Cap at 50 videos per run to stay within GitHub Actions time limits
        videos_needing_comments = videos_needing_comments[:50]
        print(f"  Scraping comments for {len(videos_needing_comments)} videos...")

        for i, vid in enumerate(videos_needing_comments):
            comments = scrape_comments(vid, handle)
            if comments:
                existing_comments[vid] = comments
            if (i + 1) % 10 == 0:
                print(f"    {i+1}/{len(videos_needing_comments)} done")

        total_comments = sum(len(c) for c in existing_comments.values())
        print(f"  Total: {len(existing_videos)} videos, {total_comments} comments")

        # Write archive
        archive = {
            "handle": handle,
            "updated_at": datetime.now().isoformat(),
            "video_count": len(existing_videos),
            "comment_count": total_comments,
            "videos": list(existing_videos.values()),
            "comments": existing_comments,
        }
        with open(archive_path, "w", encoding="utf-8") as f:
            json.dump(archive, f, ensure_ascii=False, indent=2)
        print(f"  Wrote: {archive_path}")

    print(f"\n[{datetime.now().isoformat()}] Ingest complete.")


if __name__ == "__main__":
    main()
