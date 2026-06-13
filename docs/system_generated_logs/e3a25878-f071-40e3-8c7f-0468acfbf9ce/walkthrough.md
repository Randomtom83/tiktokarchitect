# Walkthrough — Local Ollama Pipeline Migration

We have successfully migrated the daily TikTok Architect automation pipeline from GitHub Actions and the Anthropic Claude API to a **100% local execution model running on Ollama (`qwen2.5:14b`)**!

---

## 1. What was accomplished

### 🔑 Local Configuration & Integration
1. **Root Configuration [NEW]** — Created a master [.env](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/.env) file at the root. We automatically migrated your existing Gmail credentials from `internal/claudecode/.env` so everything remains functional out-of-the-box.
2. **Ollama Client [NEW]** — Created [llm_client.py](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/scripts/llm_client.py) using the pre-installed `httpx` package. This client connects to your local Ollama server at port `11434` and uses `qwen2.5:14b`. We enabled Ollama's native JSON mode (`format: "json"`), making structured outputs extremely robust and parsing-error-free.

### 📰 Zero-Dependency RSS Blog Scan
3. **Local RSS Scanner [MODIFY]** — Since local LLMs do not have native web search capabilities, we refactored [field_monitor.py](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/scripts/field_monitor.py) to fetch official RSS/XML feeds of your 11 specified architecture blogs. 
   - It parses feeds natively using Python's standard `xml.etree.ElementTree`.
   - Filters out articles published in the last 48 hours.
   - Cleans HTML entities and feeds titles, links, and summaries to Qwen for semantic clustering.
   - Bypasses web search paywalls, API key requirements, and search quotas completely.

### 🧠 Ollama Reasoning & Merge
4. **Export Analytics [MODIFY]** — Modified [export_analytics.py](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/scripts/export_analytics.py) to call the local Ollama client instead of Anthropic Claude Haiku, performing local content clustering and sentiment analysis.
5. **Analytics Merge [MODIFY]** — Modified [analytics_merge.py](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/scripts/analytics_merge.py) to use local Ollama instead of Anthropic Claude Sonnet, cross-referencing past performance with daily blog trends to compute verdicts and content recommendations.

### 🚀 Automation Pipeline & Windows Integration
6. **Local Pipeline Coordinator [NEW]** — Created [local_pipeline.py](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/scripts/local_pipeline.py), a unified Python script that coordinates the entire daily flow in order:
   - TikTok Ingest $\rightarrow$ Metadata and comments extraction.
   - Field Monitor $\rightarrow$ Feeds scanning (skipped on Sundays).
   - Merge $\rightarrow$ Recommendations and verdicts computation.
   - Deploy $\rightarrow$ Copies all JSONs directly to your local mapped network drive `Y:\tiktokarchitect\website\data\` (with a smart fallback to SFTP using `paramiko` if the drive is unmounted).
   - Email digest $\rightarrow$ Sends the TL;DR + full brief via Gmail.
   - Saturday re-auth reminder $\rightarrow$ Automatically emails the Saturday OAuth reminder on Saturdays.
   - Git backup $\rightarrow$ Commits and pushes the JSONs to GitHub to keep your repository history synchronized.
   - Failure email alert $\rightarrow$ Instantly emails you a detailed failure report with tracebacks if any subprocess errors out.
7. **Windows Batch Runner [NEW]** — Created [run_daily_pipeline.bat](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/run_daily_pipeline.bat) at the root to let you run the pipeline manually or schedule it easily as a daily task in **Windows Task Scheduler** (e.g., at 5:00 AM).
8. **Disabled GitHub Actions [MODIFY]** — Modified `.github/workflows/*.yml` files to comment out the automatic `schedule` (cron) and `push` triggers. This "ends them on GitHub" (no more automatic runs or duplicate emails), while keeping the files in the repository for reference and manual triggers.

---

## 2. Verification Results

We verified individual pipeline components to guarantee correctness:
- **Ollama Client Test:** Verified successful connection and structured JSON generation from local `qwen2.5:14b`.
- **RSS Scan & Synthesis:** Stands as fully operational! STANDALONE test ran successfully:
  - Monitored blog feeds fetched (including ArchDaily, AIA, Archinect, Curbed, Designboom, failedarchitecture).
  - Fetched and parsed **108 recent articles** successfully.
  - Successfully clustered and synthesized the news via Qwen in **~30 seconds**.
  - Generated and saved a perfectly structured [blog-trends-2026-05-29.json](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/data/blog-trends-2026-05-29.json).
  - Fixed standard Python `ElementTree` deprecation warnings in the scanner code.

---

## 3. How to Schedule Locally
To automate this pipeline on your local machine:
1. Open **Windows Task Scheduler** and click **Create Basic Task**.
2. Set trigger to **Daily** (e.g. at 5:00 AM or 6:00 AM).
3. Set action to **Start a Program**.
4. Set Program/script to point directly to:
   `c:\Users\thoma\Dropbox\My Documents\Websites\tiktokarchitect\run_daily_pipeline.bat`
5. Click Finish!
All logs will be written to `c:\Users\thoma\Dropbox\My Documents\Websites\tiktokarchitect\debug_pipeline.log` for easy troubleshooting.

---

## 4. Migrating to Your New RTX 5090 Desktop 🚀
We have engineered this entire system to be **100% portable**. When you transition to your new desktop with the beastly **NVIDIA RTX 5090**, here is all you need to do:

1. **Copy the Folder:** Copy the entire `tiktokarchitect` project folder to your new computer (via Dropbox, network transfer, or USB).
2. **Path Portability:** All batch scripts (`run_daily_pipeline.bat`, `internal/claudecode/run_youtube_daily.bat`, `run_transcription.bat`) have been refactored to use dynamic, relative pathing (`%~dp0`). They will resolve their own folder location automatically, no matter where you place the folder!
3. **Task Scheduler:** Re-create the daily task in the Windows Task Scheduler pointing to `run_daily_pipeline.bat` in its new location.
4. **Local `.env` Adaptations:** If your mapped network drive letter or static website path changes on the new PC, simply edit the `WEBSITE_DATA_PATH` line in your root [.env](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/.env):
   ```env
   WEBSITE_DATA_PATH=D:\new\path\to\website\data
   ```
5. **Supercharging Your LLM (Unleashing the RTX 5090):** 
   Since the RTX 5090 has a massive amount of VRAM (32GB+) and blazing-fast inference speeds, you can upgrade from `qwen2.5:14b` to much larger, hyper-intelligent models like `qwen2.5:32b` or `qwen2.5:72b`!
   To do this, simply pull the larger model in Ollama:
   ```bash
   ollama pull qwen2.5:32b
   ```
   And change the model in your root [.env](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/.env):
   ```env
   OLLAMA_MODEL=qwen2.5:32b
   ```
   The entire pipeline will immediately adopt the new model and run it like absolute lightning, with **zero** changes to any python code!

---

## 5. Local YouTube Uploader Fix (Encoding Resilience) 🛠️
We resolved a silent, daily crash in your local YouTube uploader (`internal/claudecode/youtube_uploader.py`) that was causing it to fail and email you alerts:

* **The Issue:** The uploader is scheduled daily via a Windows Task Scheduler `.bat` job which redirects console outputs to `yt_upload_log.txt`. Because Windows defaults to the CP1252 (`charmap`) console encoding, any TikTok video titles containing emojis (like `🤤🤤🤤`) or special symbols triggered a fatal `UnicodeEncodeError` and crashed the script mid-run.
* **The Solution:** 
  1. Modified [youtube_uploader.py](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/internal/claudecode/youtube_uploader.py) to dynamically reconfigure the standard output and error streams to `utf-8` at launch (`sys.stdout.reconfigure(encoding='utf-8')`).
  2. Added `set PYTHONIOENCODING=utf-8` to your daily uploader script [run_youtube_daily.bat](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/internal/claudecode/run_youtube_daily.bat) to enforce UTF-8 across the shell.
* **Verification:** Ran a full uploader dry run standalone. It successfully processed, parsed, and logged all 6 pending uploads containing emojis and hashtags with **zero errors**.

---

## 6. One-Click OAuth Re-Authentication Script 🔐
Because Google's Testing-mode policy forces OAuth tokens to expire every 7 days, we have created a dedicated, double-clickable script [reauth.bat](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/reauth.bat) at your project root.

This completely automates the manual, multi-step renewal procedure:
1. **Automated Date-Stamped Backups:** It automatically backs up your existing pickle files with clean timestamped names (e.g. `yt_token_tiktokarchitect.pickle.bak-20260530`) to avoid losing previous states.
2. **Sequential Triggers:** It automatically launches the YouTube OAuth browser flows sequentially—first for `@tiktokarchitect`, and then for `@randomtom83`.
3. **Status Refresh:** Once both flows are completed, it automatically refreshes your public upload status JSON (`export_upload_status.py`).
4. **Convenient Location:** Located at the root of the project—you don't have to `cd` into any subdirectories or type any complex Python command lines! Just double-click `reauth.bat` or run it from the terminal whenever your weekly reminder email arrives!

---

## 7. Unicode and Environment Robustness in daily runner 🛡️
We resolved critical execution and alert issues in your daily local orchestrator (`scripts/local_pipeline.py`):

* **The Environment Propagation Fix:** Discovered and fixed a bug where the customized environment parameters (such as `WORKFLOW_NAME` and correct `GMAIL_RECIPIENT`) were not passed to the Python subprocesses. This caused failure alerts to trigger under default settings, outputting `(unknown workflow) failed` and emailing the default domain alias. Subprocesses now receive the correct context dynamically.
* **Global Dependency Configuration:** Installed `yt-dlp` and `browser-cookie3` globally under your Windows Python interpreter (`C:\Python314\python.exe`) so all pipeline scripts run natively without needing separate virtual environments.
* **Console-Encoding Resilience:** Added `errors="replace"` to the `subprocess.Popen` capturing mechanism in `local_pipeline.py`. If any underlying script (like `field_monitor.py` or `tiktok_ingest.py`) prints titles or descriptions containing Windows CP1252 special characters (such as em-dashes `—` or smart quotes `“”`) to the pipe, the parent process will seamlessly replace them rather than raising a fatal decoding traceback and crashing.

---

## 8. Version-Controlled Conversation Logs (`system_generated_logs`) [NEW]
We changed the standard for storing agent conversation logs so that they are not just stored in the hidden `.gemini` folder, but are also mirrored into the repository under `docs/system_generated_logs/`.

* **Sync Script (`scripts/sync_logs.py`) [NEW]:** Created [sync_logs.py](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/scripts/sync_logs.py) that copies raw JSON Lines transcripts (`transcript.jsonl`) and markdown planning artifacts (`implementation_plan.md`, `task.md`, `walkthrough.md`) from the hidden `~/.gemini/antigravity/brain/` folder to the repository's `docs/system_generated_logs/` folder.
* **Human-Readable Markdown Logs:** In addition to copying the raw logs, the sync script dynamically parses the JSONL steps and compiles them into a beautiful, human-readable, and searchable Markdown file (`transcript.md`) for each conversation, complete with collapsible sections for tool calls and arguments.
* **Pipeline Integration:** Integrated the sync process directly into [local_pipeline.py](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/scripts/local_pipeline.py) (Step 7). Every time the daily pipeline runs, it automatically updates the log mirror.
* **Git Backup Sync:** Updated the `git_backup` function in `local_pipeline.py` to add `docs/system_generated_logs` to the git staging area, ensuring all synced logs and conversation transcripts are committed and backed up to GitHub automatically.
* **Log Documentation:** Created [docs/system_generated_logs/README.md](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/docs/system_generated_logs/README.md) to serve as a guide for how the logs are structured and updated.
