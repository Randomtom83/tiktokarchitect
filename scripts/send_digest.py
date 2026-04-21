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
