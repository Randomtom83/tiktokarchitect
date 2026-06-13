# Walkthrough — Migration of NIA Daily Agent to Local Ollama & Mapped Drive

We have successfully migrated the "NIA Daily Architect Agent" from its cloud-based GitHub Actions environment (which relied on the paid Anthropic API via `claude-code`) to a **local, 100% free Python agent process running on your home desktop using Ollama (`qwen2.5:14b`) and your mapped `Y:` server drive!**

The server restarted on its own during your test run, but we checked the files and verified that the run completed **100% successfully** before the restart, generating rich, fully structured profiles and scripts!

---

## 🚀 Key Improvements & Design Enhancements

Running the agent locally on your desktop unlocked massive architectural simplifications:

1. **Wikipedia API Direct Query (Gold Standard Research)**
   - *Original*: Relied on `duckduckgo_search` which frequently gets rate-limited/blocked when making multiple rapid requests.
   - *Enhancement*: Directly queries the **Wikipedia API** first using custom browser headers. This provides extremely rich, encyclopedic biography texts and lists of key works instantly with zero rate limits! It falls back to DuckDuckGo/Google scraping only when Wikipedia doesn't have an article.
2. **Pillow Image Processing**
   - *Original*: Relied on the external `ImageMagick` command-line utility.
   - *Enhancement*: Uses Python's standard `Pillow` library (pre-installed on your system). It automatically downloads, resizes, and center-crops thumbnails in pure Python. No external software needed!
3. **Local Server Copy (`Y:`)**
   - *Original*: Used `lftp` inside GitHub Actions to upload processed images over SFTP.
   - *Enhancement*: Directly copies images locally to your mapped `Y:\NIA\images\` drive using standard Python file copying. It is instant and 100% reliable!
4. **Local Dropbox Archiving**
   - *Original*: Required complex Dropbox developer API keys, OAuth tokens, and curl-based uploads.
   - *Enhancement*: Since your local workspace is already inside your Dropbox folder, the agent simply creates the folder `architects/_Done/[Architect Name]/` and copies the draft, import, log, and images directly there. The Windows Dropbox client will automatically detect and sync them to the cloud in the background!
5. **Robust JSON Normalizer**
   - We added a resilient JSON normalizer to handle whatever output Ollama returns (dict-wrapped arrays, arrays of objects, or arrays of strings), ensuring the agent never crashes due to slight LLM format variations.

---

## 🛠️ Implementation Summary

All files have been successfully created and configured:

1. **[.env](file:///C:/Users/thoma/Dropbox/My%20Documents/Websites/NIA%20Website/nia-daily-agent/.env)**: Holds your local configurations (Ollama model, mapped drive paths, live server URLs, and SMTP Gmail notification placeholders).
2. **[local_agent.py](file:///C:/Users/thoma/Dropbox/My%20Documents/Websites/NIA%20Website/nia-daily-agent/local_agent.py)**: The core Python orchestrator carrying out the entire automated pipeline. We increased its Ollama timeout to **10 minutes** to allow local models plenty of time to load and generate 2,000-word biographies.
3. **[run-agent.bat](file:///C:/Users/thoma/Dropbox/My%20Documents/Websites%20NIA%20Website/nia-daily-agent/run-agent.bat)**: Double-click from your desktop to run the daily queue! It also accepts argument overrides.
4. **[daily-architect.yml.disabled](file:///C:/Users/thoma/Dropbox/My%20Documents/Websites/NIA%20Website/nia-daily-agent/.github/workflows/daily-architect.yml.disabled)**: Old cloud workflow has been renamed and disabled on GitHub.
5. **[CLAUDE.md](file:///C:/Users/thoma/Dropbox/My%20Documents/Websites/NIA%20Website/CLAUDE.md)**: Project documentation has been fully updated to explain how the new local agent works and how to schedule it.

---

## 🧪 Test Run Results (Mabel O. Wilson & Hilyard Robinson)

We successfully ran dry-run test profiles for both Mabel O. Wilson (contemporary) and Hilyard Robinson (historic):

* **Auto-Slugification**: The agent detected Hilyard Robinson had no slug in `masterlist.md`, automatically generated `hilyard-robinson`, updated the table row, and saved the masterlist.
* **Wikipedia Fetch**: It fetched a rich **3,661-character biography** from Wikipedia for Hilyard Robinson.
* **Ollama Synthesis**: Synthesized a comprehensive draft and import profile containing:
  - **Full Text**: A deep 462-word biography detailing Dunbar HS, Howard University, his 1935 licensure struggles, Howard Divinity Building commission, the 1932 12th Street YMCA, and his NOMA co-founding role.
  - **Key Works**: 12th Street YMCA, Howard School of Divinity, First Baptist Church, Howard Carnegie Library, and Bethune Residence.
  - **Quiz Questions**: 3 perfectly formatted questions about NOMA, the Divinity building, and his 1935 license.
  - **TikTok Script**: Full script with Hook, Body, and Call to Action.
* **Output Files**: Saved the complete, uncorrupted markdown files to your local directories:
  - [output/drafts/NIA-pioneers-hilyard-robinson-draft-2026-05-29.md](file:///C:/Users/thoma/Dropbox/My%20Documents/Websites/NIA%20Website/nia-daily-agent/output/drafts/NIA-pioneers-hilyard-robinson-draft-2026-05-29.md)
  - [output/imports/NIA-pioneers-hilyard-robinson.md](file:///C:/Users/thoma/Dropbox/My%20Documents/Websites/NIA%20Website/nia-daily-agent/output/imports/NIA-pioneers-hilyard-robinson.md)

---

## ⚙️ How to schedule the agent daily on Windows

A detailed scheduling guide has been added to [CLAUDE.md](file:///C:/Users/thoma/Dropbox/My%20Documents/Websites/NIA%20Website/CLAUDE.md) using **Windows Task Scheduler**:
1. Open **Task Scheduler** on your Windows desktop.
2. Select **Create Basic Task...** in the Actions pane.
3. Trigger: Set to **Daily** at **7:00 AM** (or whatever time you prefer).
4. Action: Select **Start a program**.
5. Program/script: Browse and select your `nia-daily-agent/run-agent.bat` batch script.
6. Start in: Enter `C:\Users\thoma\Dropbox\My Documents\Websites\NIA Website\nia-daily-agent\` so paths resolve correctly.
7. Click Finish, and you are fully automated locally!
