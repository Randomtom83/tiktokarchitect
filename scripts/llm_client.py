#!/usr/bin/env python3
"""
Local Ollama LLM client wrapper for TikTok Architect automation.
Replaces the Anthropic Claude API calls with local Qwen inference.
"""

import os
import json
import httpx
from dotenv import load_dotenv

# Load environment variables from root .env
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:14b")

def call_ollama(prompt: str, system_prompt: str = None, json_mode: bool = True) -> dict | str:
    """
    Query the local Ollama API server.
    
    Args:
        prompt: The main user prompt.
        system_prompt: Optional developer/system prompt.
        json_mode: Enforce JSON response format natively in Ollama.
        
    Returns:
        Parsed JSON dictionary if json_mode is True, otherwise raw string content.
    """
    url = f"{OLLAMA_HOST}/api/chat"
    
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    
    payload = {
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": 0.1,  # Low temperature for highly reliable structural/factual work
        }
    }
    
    if json_mode:
        payload["format"] = "json"
        
    try:
        # High timeout (120s) in case of local model load delays
        with httpx.Client(timeout=120.0) as client:
            response = client.post(url, json=payload)
            response.raise_for_status()
            
            data = response.json()
            content = data.get("message", {}).get("content", "").strip()
            
            if json_mode:
                try:
                    return json.loads(content)
                except json.JSONDecodeError as jde:
                    print(f"ERROR: Ollama returned invalid JSON content: {content[:500]}")
                    raise jde
            return content
            
    except Exception as e:
        print(f"Error communicating with local Ollama server ({OLLAMA_MODEL}) at {OLLAMA_HOST}: {e}")
        raise e

if __name__ == "__main__":
    print(f"Testing Ollama client with model: {OLLAMA_MODEL}...")
    try:
        test_res = call_ollama("Return a JSON containing a single field 'status' set to 'ok'")
        print("Success! Response:")
        print(json.dumps(test_res, indent=2))
    except Exception as ex:
        print(f"Ollama connection test failed: {ex}")
