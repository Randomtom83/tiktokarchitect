@echo off
setlocal enabledelayedexpansion
set PYTHONIOENCODING=utf-8
cd /d "%~dp0internal\claudecode"

echo ==================================================
echo   YouTube OAuth Re-Authentication Ritual 🔐
echo ==================================================
echo.
echo Both accounts must be re-authed together to stay in phase.
echo This script will back up your old tokens and launch the OAuth
echo browser windows sequentially.
echo.
echo Google Testing-mode apps restrict refresh tokens to 7 days.
echo.
pause
echo.

REM Generate a clean YYYYMMDD date stamp for backup filenames
set "yr=%date:~-4%"
set "mth=%date:~4,2%"
set "day=%date:~7,2%"
set "datestr=%yr%%mth%%day%"
set "datestr=%datestr: =0%"

REM Backup old tokens
if exist yt_token_tiktokarchitect.pickle (
    echo [backup] Saving bak-yt_token_tiktokarchitect.pickle.bak-%datestr%
    move yt_token_tiktokarchitect.pickle yt_token_tiktokarchitect.pickle.bak-%datestr% >nul
)
if exist yt_token_randomtom83.pickle (
    echo [backup] Saving bak-yt_token_randomtom83.pickle.bak-%datestr%
    move yt_token_randomtom83.pickle yt_token_randomtom83.pickle.bak-%datestr% >nul
)

echo.
echo --------------------------------------------------
echo ⏳ 1. Authorizing @tiktokarchitect...
echo    A browser window will open. Grant permissions.
echo --------------------------------------------------
python -c "from youtube_uploader import authenticate; authenticate('tiktokarchitect')"

echo.
echo --------------------------------------------------
echo ⏳ 2. Authorizing @randomtom83...
echo    A browser window will open. Grant permissions.
echo --------------------------------------------------
python -c "from youtube_uploader import authenticate; authenticate('randomtom83')"

echo.
echo --------------------------------------------------
echo ⏳ 3. Refreshing upload status JSON...
echo --------------------------------------------------
python export_upload_status.py

echo.
echo ==================================================
echo   🎉 Re-Authentication Ritual Completed!
echo   Both tokens are successfully synced in phase.
echo ==================================================
echo.
pause
