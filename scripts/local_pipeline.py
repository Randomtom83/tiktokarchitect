#!/usr/bin/env python3
"""
Local daily pipeline runner for TikTok Architect.
Consolidates the 4 daily GitHub Actions workflows into a single local execution flow.
Uses local Ollama for LLM tasks, deploys locally to Y:\, sends digests, and pushes to Git.
"""

import os
import sys
import subprocess
import shutil
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

DATA_DIR = Path(os.path.dirname(__file__)) / ".." / "data"
SCRIPTS_DIR = Path(os.path.dirname(__file__))

def log(msg):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}")

def run_script(script_name, args=None, env_override=None):
    """Run a python script as a subprocess, sharing env and piping output."""
    script_path = SCRIPTS_DIR / script_name
    cmd = [sys.executable, str(script_path)]
    if args:
        cmd.extend(args)
        
    log(f"Executing: {' '.join(cmd)}")
    
    # Merge current environment with overrides
    env = os.environ.copy()
    if env_override:
        env.update(env_override)
        
    try:
        # Run and print output in real-time
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            encoding="utf-8"
        )
        
        output_lines = []
        for line in process.stdout:
            print(f"  [{script_name}] {line.strip()}")
            output_lines.append(line)
            
        process.wait()
        
        if process.returncode != 0:
            raise subprocess.CalledProcessError(
                process.returncode, cmd, "".join(output_lines)
            )
            
        log(f"Successfully completed: {script_name}")
        
    except Exception as e:
        log(f"ERROR executing {script_name}: {e}")
        raise e

def deploy_data():
    """Deploy dashboard JSONs to target website data path."""
    dest_path_str = os.environ.get("WEBSITE_DATA_PATH", r"Y:\tiktokarchitect\website\data")
    dest_dir = Path(dest_path_str)
    
    log(f"Deploying data files to {dest_dir}...")
    
    # Check if drive/directory is mounted
    if not dest_dir.exists():
        log(f"WARNING: Local website data path {dest_dir} not accessible.")
        # Attempt fallback to SFTP upload if credentials exist
        if os.environ.get("SFTP_HOST") and os.environ.get("SFTP_PASSWORD"):
            try:
                log("Attempting SFTP fallback deployment via paramiko...")
                import paramiko
                
                host = os.environ["SFTP_HOST"]
                port = int(os.environ.get("SFTP_PORT", 22))
                user = os.environ["SFTP_USER"]
                passwd = os.environ["SFTP_PASSWORD"]
                
                ssh = paramiko.SSHClient()
                ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                ssh.connect(host, port=port, username=user, password=passwd)
                
                sftp = ssh.open_sftp()
                
                # Create/verify directory
                remote_dir = "/website/data"
                try:
                    sftp.mkdir(remote_dir)
                except Exception:
                    pass  # already exists
                    
                # Upload files
                files_to_upload = list(DATA_DIR.glob("analytics-*.json")) + list(DATA_DIR.glob("blog-trends-*.json"))
                if (DATA_DIR / ".last-digest-date").exists():
                    files_to_upload.append(DATA_DIR / ".last-digest-date")
                    
                for f in files_to_upload:
                    log(f"  SFTP Uploading: {f.name} -> {remote_dir}/{f.name}")
                    sftp.put(str(f), f"{remote_dir}/{f.name}")
                    
                sftp.close()
                ssh.close()
                log("SFTP fallback deployment completed successfully!")
                return
            except Exception as e:
                log(f"ERROR: SFTP fallback deployment failed: {e}")
                raise e
        else:
            raise FileNotFoundError(f"Website target directory {dest_dir} not found and SFTP details are incomplete.")
            
    # Local Copy deployment (Drive is mounted)
    try:
        # Copy analytics JSONs
        for f in DATA_DIR.glob("analytics-*.json"):
            dest_file = dest_dir / f.name
            log(f"  Copying: {f.name} -> {dest_file}")
            shutil.copy2(f, dest_file)
            
        # Copy blog trends JSONs
        for f in DATA_DIR.glob("blog-trends-*.json"):
            dest_file = dest_dir / f.name
            log(f"  Copying: {f.name} -> {dest_file}")
            shutil.copy2(f, dest_file)
            
        # Copy last digest date if exists
        digest_flag = DATA_DIR / ".last-digest-date"
        if digest_flag.exists():
            shutil.copy2(digest_flag, dest_dir / digest_flag.name)
            
        log("Local mapped path deployment completed successfully!")
        
    except Exception as e:
        log(f"ERROR: Local deployment failed: {e}")
        raise e

def git_backup():
    """Git commit and push JSON files back to GitHub to keep sync backup."""
    log("Running Git backup...")
    try:
        # Add files
        subprocess.run(["git", "add", "data/tiktok-archive-*.json", "data/analytics-*.json", "data/blog-trends-*.json", "data/.last-digest-date"], capture_output=True)
        
        # Check if changes exist to commit
        diff_res = subprocess.run(["git", "diff", "--cached", "--quiet"])
        if diff_res.returncode == 0:
            log("No data changes to commit to Git.")
            return
            
        # Commit
        date_str = datetime.now().strftime("%Y-%m-%d")
        subprocess.run(["git", "commit", "-m", f"local-pipeline: daily update {date_str}"], capture_output=True)
        
        # Pull latest master (rebase)
        subprocess.run(["git", "pull", "--rebase", "origin", "master"], capture_output=True)
        
        # Push
        push_res = subprocess.run(["git", "push", "origin", "master"], capture_output=True, text=True)
        if push_res.returncode == 0:
            log("Successfully pushed daily data backup to GitHub!")
        else:
            log(f"WARNING: Git push failed: {push_res.stderr.strip()}")
            
    except Exception as e:
        log(f"WARNING: Git backup failed: {e}")

def main():
    log("==================================================")
    log("Starting Local Daily Automation Pipeline...")
    log("==================================================")
    
    current_day = datetime.now().weekday()  # Monday is 0, Sunday is 6
    is_sunday = (current_day == 6)
    is_saturday = (current_day == 5)
    
    try:
        # Step 1: Ingest TikTok metrics & comments
        log("--- Step 1: TikTok Ingest & Analyze ---")
        run_script("tiktok_ingest.py")
        run_script("export_analytics.py")
        
        # Step 2: Architecture Blog Scan (Field Monitor)
        # Scan Mon-Sat (exclude Sunday)
        log("--- Step 2: Architecture Blog Scan (Field Monitor) ---")
        if is_sunday:
            log("Today is Sunday. Skipping Field Monitor news scan.")
        else:
            run_script("field_monitor.py")
            # Prune old trends (>30 days) in data/
            log("Pruning blog trends older than 30 days...")
            cutoff = datetime.now() - timedelta(days=30)
            for f in DATA_DIR.glob("blog-trends-*.json"):
                try:
                    # extract date from file name: blog-trends-YYYY-MM-DD.json
                    date_match = re.search(r'blog-trends-(\d{4}-\d{2}-\d{2})\.json', f.name)
                    if date_match:
                        file_date = datetime.strptime(date_match.group(1), "%Y-%m-%d")
                        if file_date < cutoff:
                            log(f"  Deleting old file: {f.name}")
                            f.unlink()
                except Exception as ex:
                    log(f"  Error checking/deleting old trend file {f.name}: {ex}")
                    
        # Step 3: Merge analytics & news + compute recommendations
        log("--- Step 3: Analytics Merge & Recommendations ---")
        run_script("analytics_merge.py")
        
        # Step 4: Deploy JSONs to website
        log("--- Step 4: Deploying JSON data to Live Website ---")
        deploy_data()
        
        # Step 5: Send Morning Digest email
        log("--- Step 5: Sending Email Morning Digest ---")
        run_script("send_digest.py")
        
        # Step 6: Saturday OAuth Reminder (only on Saturday)
        if is_saturday:
            log("--- Step 6: Saturday YouTube OAuth Re-Auth Reminder ---")
            run_script("saturday_reminder.py")
            
        # Step 7: Push changes to GitHub
        log("--- Step 7: GitHub Sync Backup ---")
        git_backup()
        
        log("==================================================")
        log("Local Daily Pipeline COMPLETED SUCCESSFULLY!")
        log("==================================================")
        
    except Exception as e:
        log("==================================================")
        log(f"Pipeline FAILED at some step: {e}")
        log("Sending failure email alert...")
        log("==================================================")
        
        # Prepare env for notify_failure.py
        env_override = {
            "WORKFLOW_NAME": "Local Daily Pipeline",
            "RUN_URL": "Local execution logs inside c:\\Users\\thoma\\Dropbox\\My Documents\\Websites\\tiktokarchitect\\debug_pipeline.log",
            "REPO": "Randomtom83/tiktokarchitect (Local)",
            "REF": "master",
            "SHA": "LOCAL",
            "EVENT": "Local Task Scheduler"
        }
        
        try:
            run_script("notify_failure.py", env_override=env_override)
            log("Failure email alert sent successfully.")
        except Exception as alert_ex:
            log(f"CRITICAL: Failed to send failure email alert: {alert_ex}")
            
        sys.exit(1)

if __name__ == "__main__":
    main()
