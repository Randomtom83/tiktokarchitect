# Analytics Dashboard Rebuild — Design Spec

**Date:** 2026-04-21
**Author:** Tom Reynolds + Claude
**Status:** Draft

---

## 1. Goal

Replace the current dark-mode raw-stats analytics dashboard with the Claude Design prototype — warm paper aesthetic, AuDHD-friendly structure, three layout variations, verdict-driven metrics. Every number rendered must come from real pipeline data, not mock values.

## 2. File Structure

```
src/app/analytics/
├── page.tsx                    # Data loading, account switcher, variation toggle, tweaks
├── components/
│   ├── tokens.ts               # Design tokens, helpers, shared primitives
│   ├── TheBrief.tsx             # Variation 1 — weekly planning read
│   ├── TheControlRoom.tsx       # Variation 2 — quick daily scan
│   └── TheDraftingTable.tsx     # Variation 3 — default landing
```

## 3. Component Responsibilities

### page.tsx

- `"use client"` — client-side data fetching and state management
- Fetches `/data/analytics-tiktokarchitect.json` or `/data/analytics-randomtom83.json`
- Account switcher: controlled component in top bar, persists selection to `localStorage` under `ttka.account`
- Variation toggle: segmented control switching between Brief, Control Room, Drafting Table
- Default variation: **The Drafting Table**
- Tweaks panel (user-facing): theme (light/dark, default light), accent (terracotta default), density (compact/comfortable/spacious, default comfortable)
- Passes `data`, `t` (theme object from TOKENS), `d` (density object) as props to active variation
- Shows "Loading..." state while fetching, handles missing/failed data gracefully

### tokens.ts

Direct port from `claude-design/tiktokarchitect-analytics/project/src/tokens.jsx`. Exports:

- `TOKENS` — light and dark palettes (bone paper `#f5f1ea` / deep ink `#201c17` in light; near-black `#16130f` / warm cream `#e8e2d4` in dark). Single accent: terracotta `#b15a3c`. Verdict colors: sage (good), ochre (meh), clay (bad).
- `FONTS` — Fraunces (display/serif), Archivo (sans/UI), JetBrains Mono (numbers, labels, metadata). No additional font families.
- `DENSITY` — compact, comfortable, spacious. Scales padding, gaps, type, row heights.
- `densityOf(key)` — returns density multipliers
- `verdict(v)` — maps STRONG→LOAD-BEARING/good, MEH→HOLDING/meh, NOISE→SETTLING/bad
- `fmt(n)` — number formatting (1.2k, 3.4M)
- `pct(n)` — percentage formatting

Shared primitives (React components):
- `StatNumber` — large display number with optional unit
- `VerdictPill` — colored dot + uppercase label (LOAD-BEARING, HOLDING, SETTLING)
- `Rule` — hairline divider (solid or dashed)
- `Label` — mono uppercase label
- `SectionHeader` — `§01 Title` format with optional note
- `Bar` — minimal horizontal comparison bar
- `Spark` — tiny SVG sparkline for timeline

### TheBrief.tsx

- Props: `{ data, t, d }`
- Use case: Monday morning weekly planning session, read top-to-bottom
- Direct port from `claude-design/tiktokarchitect-analytics/project/src/TheBrief.jsx`
- Adapted to use TypeScript and the real data schema

### TheControlRoom.tsx

- Props: `{ data, t, d }`
- Use case: Quick daily scan, 30-second check, pattern-match
- Direct port from `claude-design/tiktokarchitect-analytics/project/src/TheControlRoom.jsx`

### TheDraftingTable.tsx

- Props: `{ data, t, d }`
- Use case: Default landing, balance of detail + always-visible next actions
- Direct port from `claude-design/tiktokarchitect-analytics/project/src/TheDraftingTable.jsx`

## 4. Data Contract

The page fetches one JSON file per account. Filenames:
- `/data/analytics-tiktokarchitect.json` (primary)
- `/data/analytics-randomtom83.json` (supplementary)

Schema matches the pipeline output (see automation pipeline spec). Key fields the UI depends on:

- `headline_signal.rec_title` / `.rec_reason` / `.rec_confidence` — hero answer, always first on page
- `overview.*` — follower_conversion_rate is THE headline metric, privileged over views/likes
- `content_clusters[]` — semantic groupings, variable count, components must `.map()`
- `presentation_styles[]`, `audience_conversation_themes[]`, `external_trends[]` — same: map, don't index
- `audience.questions[]` / `audience.requests[]` — substantive only, emoji-only filtered upstream
- `videos[]` — per-video with cluster, style, watch_through, follower_conversion, sentiment

The UI **renders** verdicts; it does not **compute** them. The `verdict` field comes from the pipeline.

## 5. Styling Approach

- **Inline React styles** with token props, matching the Claude Design prototype exactly
- Not Tailwind for dashboard internals (different aesthetic from public site, and tokens need dynamic theme switching)
- All colors read from `t` (theme object), all spacing scaled by `d` (density object)
- No hardcoded colors or sizes in components

## 6. AuDHD-Friendly Rules (non-negotiable)

1. **Inverted pyramid** — ONE big answer at top. Supporting evidence below in chunked sections. Never open with a stat grid.
2. **Plain-language verdicts** — every number paired with a label: LOAD-BEARING (good), HOLDING (meh), SETTLING (fading). Never show a raw number without context.
3. **No motion by default** — no auto-animating charts, carousels, pulsing loaders. Motion only on explicit user interaction.
4. **Muted palette** — warm neutrals + one accent. No rainbow chart palettes. Color encodes verdict (good/meh/bad), not category.
5. **Chunking over lists** — 3-5 sections max. Grids of 3 over lists of 12.
6. **Scan-first hierarchy** — display type, `§01` section numbers, mono labels, generous leading. Find any section in under 2 seconds.
7. **Prompts, not just data** — each section ends with or implies a "do this next" action.

## 7. Variation Routing

| Layout | Use case | When |
|---|---|---|
| The Brief | Weekly planning, read top-to-bottom | Monday morning |
| The Control Room | Quick daily scan, pattern-match | Every day, 30-second check |
| The Drafting Table | Balance of detail + always-visible actions | **Default / landing** |

Segmented toggle in top bar. Do not show all three at once. Persist selection in `localStorage`.

## 8. What NOT To Do

- Don't add icons to every list item. No emoji.
- Don't add a welcome screen, onboarding, tour, or feature-discovery UI.
- Don't add notifications, toasts, or a bell.
- Don't introduce sidebar navigation. Top-bar only.
- Don't add raw TikTok metrics (FYP impressions, trending hashtags) unless they serve "what should I post next?"
- Don't replace plain-language verdicts with numeric grades.
- Don't introduce gradients, glassmorphism, or shadows deeper than `0 1px 3px rgba(0,0,0,0.08)`.
- Don't auto-refresh. Show the timestamp, let Tom refresh manually.
- Don't carry forward ANY mock data from the Claude Design prototype (18,420 followers, Fulton Street, @amyhbcu, etc.)

## 9. Fonts

Load Fraunces, Archivo, and JetBrains Mono. These are already configured in the Next.js app (visible in the current page's HTML class names: `fraunces_*`, `archivo_*`, `jetbrains_mono_*`). Use the CSS variable names that Next.js generates.

## 10. What Gets Deleted

The entire current content of `src/app/analytics/page.tsx`. None of the old dark-mode dashboard code carries forward.

## 11. Acceptance Checklist

- [ ] Hero answer ("What should I post next?") is the first thing on every variation
- [ ] Every number has a verdict label or plain-language context
- [ ] No colors outside TOKENS + ACCENTS
- [ ] No new font families loaded
- [ ] Components iterate over arrays without assuming length
- [ ] Works at all three densities without overflow
- [ ] Works in both light and dark (light default)
- [ ] Renders if a data field is missing (no white screen)
- [ ] No motion added without explicit user trigger
- [ ] Account switcher persists to localStorage
- [ ] All three variations render and toggle works
- [ ] Data comes from pipeline JSONs, not mock values
