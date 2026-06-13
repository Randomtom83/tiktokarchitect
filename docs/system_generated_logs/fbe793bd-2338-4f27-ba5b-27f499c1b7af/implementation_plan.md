# Implementation Plan: Local Google Finance Integration & Real-Time Data Scout

This plan introduces a local, keyless solution to query Google Finance, retrieve real-time trending tickers, and pull breaking market news directly into the Trained Market Monkey (TMM) pipeline. It allows the ecosystem to run entirely locally (using local Ollama models or Claude) while operating on real, current financial data.

## Goal Description
1. **Explain API vs. Local Scraping:** Clarify the difference between using a consumer Google AI Ultra account, a Gemini developer API (which requires an AI Studio key), and local scraping.
2. **Implement Local Google Finance Scraper:** Create a python utility (`utils/google_finance.py` or within a scout) that scrapes the Google Finance homepage for active/trending tickers and individual ticker pages for prices and headlines.
3. **Introduce Google Finance Scout:** Create a new scout (`agents/google_finance.py`) that utilizes the scraper to ingest real-time market data into the central triage, giving specialists actual market signals to analyze.
4. **Provide local CLI Search Tool:** Enable users to run `python agents/google_finance.py --ticker AAPL` or `python agents/google_finance.py --trending` to query stock details and trending lists directly from the terminal.

## Proposed Changes

### Data Scouts

#### [NEW] [google_finance.py](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/TrainedMarketMonkey/agents/google_finance.py)
* Inherit from `BaseScout`.
* Implement the scraping logic using `requests` and `bs4` (BeautifulSoup):
  * `get_trending_tickers()`: Pulls active/trending stocks from `https://www.google.com/finance`, filtering out indices (`.DJI`, `.INX`) and commodities/futures.
  * `get_ticker_details(ticker, exchange)`: Retrieves current price, percentage change, and recent news articles (headline, source, age, URL) from `https://www.google.com/finance/quote/{ticker}:{exchange}`.
* Overwrite `fetch_raw_data(self)` to fetch trending tickers and pull their respective details/news into a raw text payload.
* Define `system_prompt_template` to prompt the LLM to extract high-confidence trading signals from this real-time feed.
* Implement a CLI interface for direct terminal searches using `argparse`.

### Master Orchestrator

#### [MODIFY] [run_full_zoo.py](file:///c:/Users/thoma/Dropbox/My%20Documents/Websites/TrainedMarketMonkey/run_full_zoo.py)
* Add `"google_finance"` to the list of executing scouts in `scouts` array (Line 30) so it runs automatically in the pipeline.

---

## Verification Plan

### Automated Tests
1. **Scout Execution Test:** Run `python agents/google_finance.py` to verify it successfully scrapes Google Finance, writes to `data/scout_google_finance.json`, and extracts valid JSON signals via local Ollama/Claude.
2. **Pipeline Triage Test:** Run `python utils/central_triage.py` to confirm the Google Finance signals are triaged into domain files.

### Manual Verification
1. **CLI Search Verification:** Run `python agents/google_finance.py --ticker CASY` and check that the stock price and latest news are printed cleanly to the console.
2. **CLI Trending Verification:** Run `python agents/google_finance.py --trending` and check that the list of active/trending tickers is printed to the console.
