#!/usr/bin/env python3
"""
Field Monitor — scans architecture blogs daily via RSS and outputs a trends JSON.
Consolidated to run locally on Ollama (Qwen 2.5 14B) without Anthropic.
"""

import json
import os
import sys
import xml.etree.ElementTree as ET
import email.utils
import re
from datetime import datetime, timezone, timedelta
import httpx
from llm_client import call_ollama

SOURCES = [
    "ArchDaily", "Dezeen", "Archinect", "The Architect's Newspaper",
    "Curbed", "Architectural Digest", "Designboom",
    "Architect Magazine (AIA)", "Failed Architecture",
    "McMansion Hell", "99% Invisible",
]

FEED_URLS = {
    "ArchDaily": "https://www.archdaily.com/feed",
    "Dezeen": "https://www.dezeen.com/feed",
    "Archinect": "https://archinect.com/news.xml",
    "The Architect's Newspaper": "https://www.archpaper.com/feed/",
    "Curbed": "https://www.curbed.com/feed",
    "Architectural Digest": "https://www.architecturaldigest.com/feed/rss",
    "Designboom": "https://www.designboom.com/feed/",
    "Architect Magazine (AIA)": "https://www.architectmagazine.com/rss",
    "Failed Architecture": "https://failedarchitecture.com/feed/",
    "McMansion Hell": "https://mcmansionhell.com/feed/",
    "99% Invisible": "https://99percentinvisible.org/feed/",
}

def clean_html(raw_html):
    """Strip HTML tags and convert entities for clean text representation."""
    if not raw_html:
        return ""
    cleanr = re.compile('<[^<]+?>')
    cleantext = re.sub(cleanr, '', raw_html)
    # Convert common HTML entities
    cleantext = cleantext.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"').replace('&#39;', "'")
    return cleantext.strip()

def fetch_daily_articles():
    """Fetch recent articles (last 48 hours) from architecture blog RSS feeds."""
    articles = []
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=48)  # 48 hours buffer to capture all recent news
    
    print("\nScanning architecture blog RSS feeds...")
    for source, url in FEED_URLS.items():
        try:
            print(f"  Fetching {source}...")
            with httpx.Client(timeout=15.0, follow_redirects=True) as client:
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
                resp = client.get(url, headers=headers)
                if resp.status_code != 200:
                    print(f"    WARNING: HTTP status {resp.status_code} for {source}")
                    continue
                
                # Parse RSS/XML feed
                root = ET.fromstring(resp.content)
                
                # Find channel items (standard RSS has <channel><item>...)
                items = []
                channel = root.find("channel")
                if channel is not None:
                    items = channel.findall("item")
                else:
                    # Try Atom format namespaces or direct entry matching
                    items = root.findall(".//{http://www.w3.org/2005/Atom}entry")
                    if not items:
                        items = root.findall("entry")
                        
                count = 0
                for item in items:
                    # Extract fields safely without triggering direct boolean evaluation warnings
                    title_elem = item.find("title")
                    if title_elem is None:
                        title_elem = item.find("{http://www.w3.org/2005/Atom}title")

                    link_elem = item.find("link")
                    if link_elem is None:
                        link_elem = item.find("{http://www.w3.org/2005/Atom}link")

                    pub_elem = item.find("pubDate")
                    if pub_elem is None:
                        pub_elem = item.find("{http://www.w3.org/2005/Atom}published")
                    if pub_elem is None:
                        pub_elem = item.find("{http://www.w3.org/2005/Atom}updated")

                    desc_elem = item.find("description")
                    if desc_elem is None:
                        desc_elem = item.find("summary")
                    if desc_elem is None:
                        desc_elem = item.find("{http://www.w3.org/2005/Atom}summary")
                    
                    title = title_elem.text.strip() if title_elem is not None and title_elem.text else "Untitled"
                    
                    # Handle Link attribute for Atom vs text for standard RSS
                    link = ""
                    if link_elem is not None:
                        if "href" in link_elem.attrib:
                            link = link_elem.attrib["href"]
                        else:
                            link = link_elem.text.strip() if link_elem.text else ""
                            
                    description = ""
                    if desc_elem is not None and desc_elem.text:
                        description = clean_html(desc_elem.text)[:300]
                        
                    # Parse publish date
                    pub_date = None
                    if pub_elem is not None and pub_elem.text:
                        try:
                            pub_date = email.utils.parsedate_to_datetime(pub_elem.text)
                        except Exception:
                            # Try Atom ISO format fallback
                            try:
                                date_str = pub_elem.text.strip()
                                if date_str.endswith("Z"):
                                    date_str = date_str[:-1] + "+00:00"
                                pub_date = datetime.fromisoformat(date_str)
                            except Exception:
                                pass
                                
                    if pub_date is None:
                        pub_date = now  # Fallback
                        
                    # Filter for last 48 hours
                    if pub_date >= cutoff:
                        articles.append({
                            "title": title,
                            "url": link,
                            "source": source,
                            "description": description,
                            "pub_date": pub_date.isoformat()
                        })
                        count += 1
                        
                print(f"    Found {count} recent articles")
        except Exception as e:
            print(f"    WARNING: Failed to fetch/parse {source}: {e}")
            
    print(f"Total recent articles parsed: {len(articles)}")
    return articles

def main():
    output_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(output_dir, exist_ok=True)
    date_str = datetime.now().strftime("%Y-%m-%d")
    output_path = os.path.join(output_dir, f"blog-trends-{date_str}.json")

    print(f"Field Monitor — scanning for {date_str}")
    
    # 1. Fetch articles from RSS feeds
    recent_articles = fetch_daily_articles()
    if not recent_articles:
        print("No new articles found in the last 48 hours. Creating empty trends JSON.")
        result = {"scan_date": date_str, "sources_checked": SOURCES, "trends": [], "people": []}
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(f"Wrote empty scan: {output_path}")
        return

    # 2. Cluster and synthesize using local Ollama model
    print("\nSynthesizing trends using Ollama (Qwen 2.5)...")
    
    scan_prompt = f"""You are a field monitor tracking architecture and design news.
Here are the articles published in the last 48 hours from the monitored sources:

{json.dumps(recent_articles, indent=2)}

Scope: strictly architecture and design. NOT urban planning, real estate, construction tech, or interior design.

For everything you find:

1. CLUSTER BY THEME — not by source. Name each cluster by the claim or shift, e.g. "adaptive reuse is dominating mixed-use RFPs" not "3 articles from Dezeen".

2. For each cluster: write a one-paragraph synthesis, list the 2-3 strongest source articles with title and URL, and write a "so what" line — does this change how an architecture content creator or designer should think about this topic today?

3. Separately list any architects, firms, or critics whose work drove discussion today — the "who to watch" section.

Be ruthless about signal. A project gallery with no insight is noise. A blog post that says "we shipped this and here's what broke" is signal. Prioritize controversy, shifts in practice, and emerging project types.

Return ONLY valid JSON in this exact format:
{{
  "scan_date": "{date_str}",
  "sources_checked": {json.dumps(SOURCES)},
  "trends": [
    {{
      "topic": "descriptive theme name as a claim or shift",
      "synthesis": "one paragraph summarizing the trend",
      "sources": [
        {{"title": "article title", "url": "https://...", "source": "Source Name"}}
      ],
      "so_what": "what this means for an architecture content creator"
    }}
  ],
  "people": [
    {{"name": "Person Name", "role": "Firm / Role", "why": "what they said or did"}}
  ]
}}
"""

    system_prompt = "You are a professional design researcher and architectural curator. Respond ONLY with valid, raw JSON matching the requested schema."
    
    try:
        result = call_ollama(scan_prompt, system_prompt=system_prompt, json_mode=True)
        print("Successfully generated trends synthesis!")
    except Exception as e:
        print(f"ERROR: Ollama trends synthesis failed ({e}). Saving fallback empty trends.")
        result = {"trends": [], "people": []}

    # Ensure required fields exist
    if "trends" not in result:
        result["trends"] = []
    if "people" not in result:
        result["people"] = []
    result["scan_date"] = date_str
    result["sources_checked"] = SOURCES

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"Wrote: {output_path}")
    print(f"Trends found: {len(result['trends'])}")
    print(f"People noted: {len(result['people'])}")

if __name__ == "__main__":
    main()
