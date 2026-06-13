# Implementation Plan — Migrating NIA Daily Agent to Local Ollama & Mapped Drive

This plan details how we will migrate the "NIA Daily Architect Agent" from running in GitHub Actions (using the paid Anthropic API via `claude-code`) to running **locally on your Windows desktop using Ollama (`qwen2.5:14b`) and your mapped `Y:` server drive**.

By running locally, we can completely eliminate:
1. Paid API costs (runs on local Ollama).
2. Complex and slow SFTP upload steps (we can copy files directly to `Y:\NIA\images\`).
3. Complex Dropbox API authentication and refresh tokens (since Dropbox is local, we can copy files directly to `architects/_Done/` and let the Windows Dropbox client sync it automatically).
4. Fragile autonomous agent CLI tool-use loops that can get confused, replacing them with a highly structured, 100% reliable Python orchestrator that uses local LLMs for the research, synthesis, and writing tasks.

---

## User Review Required

Please review the following key architectural details:

> [!NOTE]
> **Ollama Model**: We will default to `qwen2.5:14b` (which is already installed in your Ollama). It is an exceptionally good model for structured text generation, factual writing, and JSON formatting. We will make this configurable in the `.env` file if you ever want to change it.

> [!IMPORTANT]
> **Dropbox Sync**: Since your workspace is located in `C:\Users\thoma\Dropbox\My Documents\Websites\NIA Website\`, we can simply copy the generated logs, drafts, imports, and images directly into `architects/_Done/[Architect Name]/` on your hard drive! The Dropbox desktop app will automatically sync these files to the cloud. This eliminates the need for any Dropbox API key or OAuth credentials.

> [!TIP]
> **Local Server Copy (`Y:`)**: Since the server root is mapped as your local `Y:` drive, the local agent will directly copy portrait and building images to `Y:\NIA\images\`. This is instant and 100% reliable compared to running SFTP over the internet.

---

## Open Questions

None at this time. All paths (local Dropbox, local `Y:` drive, and your local Python/Ollama setup) have been verified to exist and be fully functional.

---

## Proposed Changes

We will implement the local agent in the existing `nia-daily-agent/` directory.

### Component: `nia-daily-agent/`

#### [NEW] [local_agent.py](file:///C:/Users/thoma/Dropbox/My%20Documents/Websites/NIA%20Website/nia-daily-agent/local_agent.py)
This Python script will replace `claude-code` and orchestrate the entire workflow:
1. **Deduplication Check**: Fetch `https://nia.greenstoriesllc.com/content/architects.json` and check if the next TODO architect is already posted.
2. **Deterministic picking**: Read `masterlist.md` and select the next TODO architect following the exact priorities specified in `AGENT.md`.
3. **Web Search & Fetching**:
   - Query DuckDuckGo using the free, no-token `duckduckgo_search` library.
   - Fetch the text of the top 3-4 web pages for the architect and each of their key works.
4. **Ollama Synthesis**:
   - Clean and feed the web text into local Ollama (`qwen2.5:14b`) to generate the draft and import markdown content, adhering strictly to the word count (1,500-2,000 words), tone, formatting, source citations, quiz questions, and TikTok script.
5. **Image Processing (Pillow)**:
   - Identify the best images from Wikimedia Commons / Library of Congress.
   - Download the images, resize them, and create center-cropped thumbnails using Python's standard `Pillow` library (already installed on your machine!). This replaces the need for the command-line `ImageMagick`.
6. **Mapped Server Copy**: Copy the processed images directly to `Y:\NIA\images\`.
7. **HTTP Posting**: Submit the architect, buildings, and quiz JSON to the live server via the `https://nia.greenstoriesllc.com/admin/agent-import.php` endpoint.
8. **Local Dropbox Archiving**: Create the directory `architects/_Done/[Architect Full Name]/` and copy all logs, drafts, imports, portraits, and building images there.
9. **Git Backup**: Run local Git commands (`git add`, `git commit`, `git push`) to backup the masterlist and agent outputs to your private GitHub repo.
10. **SMTP Email Notification**: Connect to Gmail's SMTP server using `smtplib` and your `GMAIL_APP_PASSWORD` to email the summary and the TikTok script to you.

#### [NEW] [.env](file:///C:/Users/thoma/Dropbox/My%20Documents/Websites/NIA%20Website/nia-daily-agent/.env)
Store configuration values securely:
```ini
NIA_BASE_URL=https://nia.greenstoriesllc.com
NIA_AGENT_KEY=26d12faab68e11dbf63bf16f247c4f52fc88c1833aabe0a302456c2f498ca35f
NOTIFY_EMAIL=tom@tiktokarchitect.com
OLLAMA_MODEL=qwen2.5:14b
OLLAMA_BASE_URL=http://localhost:11434

# Add your Gmail credentials below to enable email notifications
GMAIL_EMAIL=youwishthiswasyour@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password_here
```

#### [NEW] [run-agent.bat](file:///C:/Users/thoma/Dropbox/My%20Documents/Websites/NIA%20Website/nia-daily-agent/run-agent.bat)
A simple Windows Batch script that you can double-click to run the agent manually:
```batch
@echo off
cd /d "%~dp0"
echo Starting NIA Daily Architect Agent locally...
python local_agent.py
pause
```

#### [MODIFY] [daily-architect.yml](file:///C:/Users/thoma/Dropbox/My%20Documents/Websites/NIA%20Website/nia-daily-agent/.github/workflows/daily-architect.yml) (Disable on GitHub)
We will rename this workflow file to `.github/workflows/daily-architect.yml.disabled` so that GitHub Actions ceases to run the agent in the cloud.

#### [MODIFY] [CLAUDE.md](file:///C:/Users/thoma/Dropbox/My%20Documents/Websites/NIA%20Website/CLAUDE.md)
Update the documentation to explain how to run and manage the new local agent, including scheduling it with Windows Task Scheduler.

---

## Verification Plan

### Automated / Local Tests
1. **Dry-Run Mode**: We will build a `--dry-run` flag into `local_agent.py`. This will let us test the masterlist reading, web searching, Ollama profile generation, image downloading, and image processing *without* writing to the live `Y:` drive, posting to the live site, committing to Git, or sending an email.
2. **Library Installation**: Run a quick installation command to ensure `duckduckgo_search` is installed.
3. **Execution Test**: We will run the script in `dry-run` mode to verify it communicates with Ollama, extracts web search results, and successfully writes drafts.

### Manual Verification
1. Verify that the batch script opens, runs, and logs correctly.
2. Verify that the emails are successfully delivered to your inbox.
3. Verify that the files appear in your local `architects/_Done/` directory and sync.
