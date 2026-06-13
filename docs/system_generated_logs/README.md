# System Generated Logs

This directory contains version-controlled conversation logs and artifacts from the local AI coding assistant (Antigravity/Claude Code), keeping a permanent record of all design decisions, plan details, and code updates.

## 📂 Directory Structure

Each conversation is stored in a directory named with its unique conversation UUID:

```text
docs/system_generated_logs/
├── README.md
└── <conversation-uuid>/
    ├── transcript.jsonl      # Raw step-by-step JSON Lines transcript
    ├── transcript.md         # Beautifully formatted human-readable transcript
    ├── implementation_plan.md# (If created) Plan presented to the user
    ├── task.md               # (If created) Task checklist for execution
    └── walkthrough.md        # (If created) Detailed summary of changes made
```

## 🔄 How to Update

The logs are synchronized in two ways:

1. **Daily Automation Pipeline**: The local daily pipeline (`scripts/local_pipeline.py`) runs the log sync automatically as part of its daily routine, committing and pushing updates back to GitHub.
2. **Manual Sync**: You can manually run the sync script at any time to pull the latest logs from the local App Data directory into the repository:

   ```bash
   python scripts/sync_logs.py
   ```

## ⚙️ How it Works

The sync script (`scripts/sync_logs.py`) reads the local App Data directory at `~/.gemini/antigravity/brain`, identifies active conversation directories, copies the raw JSONL transcripts and markdown planning artifacts, and compiles the raw transcripts into clean, readable Markdown logs.
