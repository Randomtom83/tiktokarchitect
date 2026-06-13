# Tasks

- [x] Create `.env` file in `nia-daily-agent/` with verified `NIA_AGENT_KEY` and configuration details <!-- id: 1 -->
- [x] Create `local_agent.py` script containing the full agent pipeline <!-- id: 2 -->
  - [x] Implement masterlist parser and architect selector
  - [x] Implement live-site deduplication check
  - [x] Implement Ollama-based web research scraper and content generator
  - [x] Implement Pillow-based image downloading and cropping
  - [x] Implement Y: drive deployments for portraits and building images
  - [x] Implement HTTP POST data publisher to live server
  - [x] Implement local Dropbox archiving to `architects/_Done/`
  - [x] Implement local Git commit & push
  - [x] Implement smtplib Gmail SMTP email notifications
- [x] Install required python package `duckduckgo_search` <!-- id: 3 -->
- [x] Create manual trigger batch file `run-agent.bat` <!-- id: 4 -->
- [x] Perform a test run in `--dry-run` mode to verify search, Ollama, and image download <!-- id: 5 -->
- [x] Rename GitHub Actions workflow to disable cloud triggers <!-- id: 6 -->
- [x] Update `CLAUDE.md` with local instructions and Windows Task Scheduler guide <!-- id: 7 -->
- [x] Create `walkthrough.md` to summarize migration and test run results <!-- id: 8 -->
