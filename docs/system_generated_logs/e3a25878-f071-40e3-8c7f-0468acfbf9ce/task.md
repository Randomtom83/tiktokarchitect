# Implementation Tasks: Local Ollama Daily Pipeline

- [x] Create root `.env` file copying Gmail credentials from `internal/claudecode/.env`
- [x] Create `scripts/llm_client.py` for Ollama communication
- [x] Modify `scripts/export_analytics.py` to call Ollama
- [x] Modify `scripts/field_monitor.py` to parse RSS feeds & call Ollama
- [x] Modify `scripts/analytics_merge.py` to call Ollama
- [x] Implement consolidated `scripts/local_pipeline.py` daily runner
- [x] Create simple batch runner `run_daily_pipeline.bat`
- [x] Modify `.github/workflows/` YAMLs to disable automatic triggers (keep `workflow_dispatch`)
- [x] Verify the pipeline locally with a dry run or full test
- [x] Write walkthrough summary in `walkthrough.md`
