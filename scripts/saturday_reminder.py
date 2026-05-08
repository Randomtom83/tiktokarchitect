#!/usr/bin/env python3
"""
Saturday morning reminder for the YouTube uploader OAuth re-auth ritual.

Both `tiktokarchitect` and `randomtom83` OAuth refresh tokens are on
independent 7-day clocks (Google Testing-mode policy). They must be
re-authed together to stay in phase — re-authing only one lets the other
drift, fail mid-week, and email-alert daily.
"""

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

GMAIL_ADDRESS = os.environ["GMAIL_ADDRESS"]
GMAIL_APP_PASSWORD = os.environ["GMAIL_APP_PASSWORD"]
GMAIL_RECIPIENT = os.environ["GMAIL_RECIPIENT"]

subject = "[tiktokarchitect] Saturday YouTube re-auth ritual"
body = """Time for the weekly YouTube OAuth re-auth.

Both tiktokarchitect and randomtom83 OAuth tokens have independent
7-day expiry clocks (Google Testing-mode policy). Re-auth both
together to keep them in phase -- if you only do one, the other will
silently fail mid-week and email-alert daily.

To run: open Claude Code in the tiktokarchitect project and type:

    /saturday-reauth

Claude handles the rest. You'll click through two browser OAuth
windows (one per account).

Manual fallback (if Claude is unavailable):

    cd internal\\claudecode
    move yt_token_tiktokarchitect.pickle yt_token_tiktokarchitect.pickle.bak-YYYYMMDD
    move yt_token_randomtom83.pickle    yt_token_randomtom83.pickle.bak-YYYYMMDD
    python -c "from youtube_uploader import authenticate; authenticate('tiktokarchitect')"
    python -c "from youtube_uploader import authenticate; authenticate('randomtom83')"
    python export_upload_status.py
"""

msg = MIMEMultipart()
msg["From"] = GMAIL_ADDRESS
msg["To"] = GMAIL_RECIPIENT
msg["Subject"] = subject
msg.attach(MIMEText(body, "plain", "utf-8"))

print(f"Sending Saturday re-auth reminder to {GMAIL_RECIPIENT}")
with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
    server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
    server.send_message(msg)
print("Reminder sent.")
