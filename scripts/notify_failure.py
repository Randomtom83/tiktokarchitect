#!/usr/bin/env python3
"""
Send a failure email when a GitHub Actions workflow fails.
Called from each workflow's `if: failure()` step.
"""

import os
import smtplib
import sys
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

GMAIL_ADDRESS = os.environ["GMAIL_ADDRESS"]
GMAIL_APP_PASSWORD = os.environ["GMAIL_APP_PASSWORD"]
GMAIL_RECIPIENT = os.environ["GMAIL_RECIPIENT"]

WORKFLOW = os.environ.get("WORKFLOW_NAME", "(unknown workflow)")
RUN_URL = os.environ.get("RUN_URL", "")
REPO = os.environ.get("REPO", "")
REF = os.environ.get("REF", "")
SHA = os.environ.get("SHA", "")[:7]
EVENT = os.environ.get("EVENT", "")

subject = f"[tiktokarchitect] {WORKFLOW} failed"
body = f"""A scheduled workflow failed and the daily data pipeline did not complete.

Workflow:  {WORKFLOW}
Repo:      {REPO}
Branch:    {REF}
Commit:    {SHA}
Trigger:   {EVENT}

Logs:      {RUN_URL}

Common causes:
  - Anthropic credit balance depleted (top up at console.anthropic.com)
  - yt-dlp broken by a TikTok change (pip install -U yt-dlp)
  - SFTP credentials rotated or IONOS reachability issue
  - Gmail app-password rotated

Open the run URL above for the full traceback.
"""

msg = MIMEMultipart()
msg["From"] = GMAIL_ADDRESS
msg["To"] = GMAIL_RECIPIENT
msg["Subject"] = subject
msg.attach(MIMEText(body, "plain", "utf-8"))

print(f"Sending failure alert to {GMAIL_RECIPIENT}: {subject}")
with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
    server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
    server.send_message(msg)
print("Alert sent.")
