#!/usr/bin/env python3
"""
Field Monitor — scans architecture blogs daily and outputs a trends JSON.
Called by .github/workflows/field-monitor.yml
"""

import json
import os
import sys
from datetime import datetime

import anthropic

ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]

SOURCES = [
    "ArchDaily", "Dezeen", "Archinect", "The Architect's Newspaper",
    "Curbed", "Architectural Digest", "Designboom",
    "Architect Magazine (AIA)", "Failed Architecture",
    "McMansion Hell", "99% Invisible",
]


def main():
    output_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(output_dir, exist_ok=True)
    date_str = datetime.now().strftime("%Y-%m-%d")
    output_path = os.path.join(output_dir, f"blog-trends-{date_str}.json")

    print(f"Field Monitor — scanning for {date_str}")
    print(f"Sources: {len(SOURCES)}")

    scan_prompt = f"""You are a field monitor tracking architecture and design news.

Search these sources for articles published in the LAST 24 HOURS:
{', '.join(SOURCES)}

Scope: strictly architecture and design. NOT urban planning, real estate, construction tech, or interior design.

For everything you find:

1. CLUSTER BY THEME — not by source. Name each cluster by the claim or shift, e.g. "adaptive reuse is dominating mixed-use RFPs" not "3 articles from Dezeen".

2. For each cluster: write a one-paragraph synthesis, list the 2-3 strongest source articles with title and URL, and write a "so what" line — does this change how an architect or architecture content creator should think about this topic today?

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

If you find nothing noteworthy in the last 24 hours, return the JSON with empty trends and people arrays.
"""

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        tools=[{"type": "web_search_20250305", "name": "web_search", "max_uses": 10}],
        messages=[{"role": "user", "content": scan_prompt}],
    )

    # Extract text from response — take the LAST text block (tool use blocks come first)
    text = ""
    for block in response.content:
        if block.type == "text":
            text = block.text

    # Extract JSON from response (may have prose around it)
    # Try direct parse first
    result = None
    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try extracting from markdown code block
    if result is None and "```" in text:
        for chunk in text.split("```"):
            chunk = chunk.strip()
            if chunk.startswith("json"):
                chunk = chunk[4:].strip()
            try:
                result = json.loads(chunk)
                break
            except json.JSONDecodeError:
                continue

    # Try finding JSON object in the text
    if result is None:
        start = text.find("{")
        if start >= 0:
            # Find the matching closing brace
            depth = 0
            for i in range(start, len(text)):
                if text[i] == "{": depth += 1
                elif text[i] == "}": depth -= 1
                if depth == 0:
                    try:
                        result = json.loads(text[start:i+1])
                    except json.JSONDecodeError:
                        pass
                    break

    if result is None:
        print(f"ERROR: Failed to parse Claude response as JSON")
        print(f"Raw response: {text[:500]}")
        sys.exit(1)

    # Validate required fields
    assert "trends" in result, "Missing 'trends' field"
    assert "people" in result, "Missing 'people' field"
    result["scan_date"] = date_str
    result["sources_checked"] = SOURCES

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"Wrote: {output_path}")
    print(f"Trends found: {len(result['trends'])}")
    print(f"People noted: {len(result['people'])}")


if __name__ == "__main__":
    main()
