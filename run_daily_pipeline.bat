@echo off
REM TikTok Architect Local Daily Automation Pipeline
REM Runs all agents locally on Ollama and deploys to target website

cd /d "%~dp0"
echo ===== Starting daily pipeline run: %DATE% %TIME% ===== >> debug_pipeline.log
python scripts/local_pipeline.py >> debug_pipeline.log 2>&1
echo ===== Daily pipeline run completed: %DATE% %TIME% ===== >> debug_pipeline.log
