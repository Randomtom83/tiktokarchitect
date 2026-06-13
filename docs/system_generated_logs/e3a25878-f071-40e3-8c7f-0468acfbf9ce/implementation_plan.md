# Local Ollama Transition & Local Automation Pipeline

Transition the entire TikTok Architect daily pipeline—currently scattered across four GitHub Actions workflows—to run fully on the local machine using **Ollama** (`qwen2.5:14b`) and standard local automation, completely eliminating dependencies on the Anthropic Claude API and cloud hosting.

---

## User Review Required

> [!IMPORTANT]
> **Key Architecture Decisions:**
> 1. **Ollama Integration:** We will use `qwen2.5:14b` (which is already running on your machine) for all LLM calls. We will enforce JSON mode natively via Ollama (`format: "json"`), making structured outputs extremely reliable.
> 2. **Local RSS Scanner:** Since Ollama doesn't have a native web search tool, `field_monitor.py` will fetch the official RSS feeds of the 11 target architecture blogs, extract the last 24-48 hours of articles, and feed them directly to Qwen. This is 100% local, free, fast, and bypasses search quotas or web scraping blocks.
> 3. **Consolidated Daily Runner:** Instead of orchestrating three separate async workflows via Git pushes (which had race conditions), we will provide a single Python coordinator script (`scripts/local_pipeline.py`) that runs everything in sequence: Ingest -> Field Monitor -> Merge -> Deploy -> Email.
> 4. **SFTP/Local Drive Deploy:** The deploy step will copy files directly to `Y:\tiktokarchitect\website\data\` (your mapped network drive), falling back to standard SFTP upload if the drive is not mounted.
> 5. **Ending GitHub Actions:** We will modify the `.github/workflows/` files to comment out the `schedule` and `push` triggers. This preserves the workflow files for your reference but stops GitHub from ever running them automatically.

---

## Open Questions

None at this time. The local model `qwen2.5:14b` is already verified as running and responsive on port `11434`, and your `Y:\` drive contains the target static site directories.

---

## Proposed Changes

### 1. Configuration & Secrets

#### [NEW] [.env](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/.env)
Create a root `.env` file containing all necessary keys. We will automatically copy your existing Gmail keys from `internal/claudecode/.env` so you don't have to re-type them.
- `ANTHROPIC_API_KEY`: Kept as optional/ignored.
- `OLLAMA_HOST`: Defaults to `http://localhost:11434`.
- `OLLAMA_MODEL`: Defaults to `qwen2.5:14b`.
- `GMAIL_ADDRESS`, `GMAIL_APP_PASSWORD`, `GMAIL_RECIPIENT`: Copied from `internal/claudecode/.env`.
- `SFTP_HOST`, `SFTP_PORT`, `SFTP_USER`, `SFTP_PASSWORD`: Copied from GitHub secret specs (with fallback to copy directly to `Y:\`).

---

### 2. LLM Abstract Client

#### [NEW] [llm_client.py](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/scripts/llm_client.py)
A lightweight client that manages communication with the local Ollama instance using `httpx`.
- Enforces JSON output natively using Ollama's `"format": "json"` payload parameter.
- Handles temperature settings and timeout margins.

---

### 3. Adapting Scripts to Ollama

#### [MODIFY] [export_analytics.py](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/scripts/export_analytics.py)
- Replace `anthropic` imports and `client.messages.create` with calls to `llm_client.py`.
- Keep the same detailed prompting and JSON schema.

#### [MODIFY] [field_monitor.py](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/scripts/field_monitor.py)
- Replace the Anthropic `web_search` tool call with a robust, zero-dependency RSS feed reader.
- Parse feed XML (from ArchDaily, Dezeen, AD, Curbed, etc.) using python's built-in `xml.etree.ElementTree`.
- Format the articles published in the last 24-48 hours into a text list and pass it to Qwen for clustering and synthesis.

#### [MODIFY] [analytics_merge.py](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/scripts/analytics_merge.py)
- Replace the Anthropic Sonnet calls with local Qwen calls via `llm_client.py`.
- Retain the exact recommendation logic, content clusters, and verdict thresholds.

---

### 4. Daily Coordinator & Local Runner

#### [NEW] [local_pipeline.py](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/scripts/local_pipeline.py)
A single Python orchestrator that runs the entire pipeline sequentially:
1. **TikTok Ingest:** Executes `tiktok_ingest.py` and `export_analytics.py` via subprocess.
2. **Field Monitor:** Check if today is Saturday/weekday (excluding Sundays) and runs `field_monitor.py`.
3. **Merge & Verdicts:** Runs `analytics_merge.py`.
4. **Deploy:** Copies JSON files directly to `Y:\tiktokarchitect\website\data\`.
5. **Email Digest:** Runs `send_digest.py`.
6. **Saturday OAuth Reminder:** If today is Saturday, runs `saturday_reminder.py`.
7. **Git Backup:** Run standard git commit and push to keep the GitHub repo synchronized.
8. **Failure handling:** If any subprocess fails, calls `notify_failure.py` automatically to email you the failure traceback immediately.

#### [NEW] [run_daily_pipeline.bat](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/run_daily_pipeline.bat)
A simple Windows batch file to trigger the daily pipeline. You can run this manually, or schedule it as a single task in **Windows Task Scheduler** (e.g. daily at 5:00 AM).

---

### 5. Ending GitHub Actions Cloud Triggers

#### [MODIFY] [.github/workflows/analytics-deploy.yml](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/.github/workflows/analytics-deploy.yml)
#### [MODIFY] [.github/workflows/field-monitor.yml](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/.github/workflows/field-monitor.yml)
#### [MODIFY] [.github/workflows/saturday-reminder.yml](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/.github/workflows/saturday-reminder.yml)
#### [MODIFY] [.github/workflows/tiktok-ingest.yml](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/tiktokarchitect/.github/workflows/tiktok-ingest.yml)
- Comment out or remove the `schedule` (cron) and `push` triggers.
- Keep the `workflow_dispatch` trigger so you can still trigger them manually on GitHub if you ever want to.

---

## Verification Plan

### Automated Tests
1. **Ollama Connection:** Verify that `llm_client.py` connects and communicates successfully with Qwen 2.5 14B.
2. **RSS parsing:** Run the new `field_monitor.py` standalone to verify RSS feed scraping, filtering, and Ollama clustering.
3. **End-to-End Test Run:** Run `python scripts/local_pipeline.py --dry-run` or standard execution to verify that each stage executes, deploys to `Y:\`, and sends the email digest without errors.

### Manual Verification
1. Open the Gmail morning digest email and check that the recommendations generated by local Qwen are actionable and structured.
2. Verify that the analytics dashboard on your website displays the updated JSON values after copying.
