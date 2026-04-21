# TikTokArchitect Brutalist Redesign

## Overview

Redesign the existing Next.js site using a brutalist construction-document aesthetic inspired by the `tiktokarchitect-2` design prototype. The visual language draws from architectural drawing sets — drafting grids, title blocks, sheet numbers, redline annotations, hard edges, per-section color grounds. All copy comes from the existing site; all facts are verified against what we know to be true.

## Design Direction

**Source of truth for visuals:** `claude-design/tiktokarchitect-2/project/TikTokArchitect Brutalist.html`
**Source of truth for copy:** Current component files in `src/components/`
**Source of truth for facts:** Current site copy, corrected where the prototype invented details.

### Key Visual Elements

- **Typography:** Fraunces (display serif, variable) + Archivo (sans UI) + JetBrains Mono (technical/mono)
- **Per-section color grounds:** Each section has its own background color creating a "chapter" feel
- **Drafting grid overlay:** Subtle grid lines behind every section (48px or 32px)
- **Border frame:** 1px inset border at 32px from edges on each "sheet"
- **Corner coordinates:** Mono text in corners of each section
- **Title blocks:** Bottom-right metadata blocks on each section (Drawing/Sheet/Scale/Date)
- **Chapter markers:** `§01`, `§02` etc. with mono labels and a horizontal rule
- **Hard edges:** No border-radius anywhere. Offset box-shadow hover effects (translate + shadow)
- **Redline annotations:** Red drafter's annotations as decorative elements

### Color Palette

```
--ink:      #0c0c0a    (near-black base)
--ink-soft: #1b1b18
--bone:     #eeeae0    (warm off-white)
--bone-dim: #d6d1c4
--orange:   #ff5a1f    (safety orange — vitals accent)
--cyan:     #1e6a78    (blueprint — tools section)
--green:    #1f3d2a    (deep archive green — NIA)
--yellow:   #f4c430    (construction yellow — the game)
--concrete: #8a8a82    (concrete gray — AnansiBuild)
--redline:  #e8362b    (drafter's red — annotations)
```

## Section Architecture

### 1. Nav (fixed)
- Fixed top bar, dark ink background
- Brand: "TikTokArchitect" with italic orange accent (not "Tom the Reynolds")
- Subtext: "Drawing Set A-001 . Issue 01"
- Links: Vitals, Tools, Archive, The Game, AnansiBuild, Bio, Videos, Links
- Mobile: hamburger menu
- Orange bordered "Rev . 01" badge on right

### 2. Cover (Section 00) — `background: var(--ink)`
- Full-bleed portrait photo (`/images/hero.jpg`) with dark gradient overlays
- Drafting grid overlay on the photo
- Inset border frame
- Giant name treatment: "TOM REYNOLDS" or "TIKTOKARCHITECT" at massive scale (clamp 88px-280px)
- Top-left: `@TikTokArchitect . on record`
- Top-right: `Sheet A-000 . Cover`
- Bottom: `Green Stories LLC . Newark, NJ . Est. 2019`
- Orange "Rev . 01" stamp decoration

### 3. Vitals (Section 01) — `background: var(--orange)`
- Giant "2%" stat (clamp 180px-420px) in Fraunces
- Lede: "of licensed U.S. architects are Black. I'm working to change that."
- Right column with ledger grid:
  - Name: Tom Reynolds
  - Handle: @TikTokArchitect
  - City: Newark, NJ
  - Firm: Green Stories LLC
  - Credentials: Associate AIA, LEED Green Associate
  - NOMA: Co-founder, former VP NJ Chapter
- Quote placeholder (keep as placeholder for Tom to supply)
- Title block: Drawing: Vitals / Sheet: A-001

### 4. Tools (Section 02) — `background: var(--cyan)`
- Blueprint-feel with denser grid (32px)
- Headline: "Twenty-three tools." in giant Fraunces
- Dek from current site: "Code calculators, structural tools, and project management — built by an architect who actually uses them."
- Right column with stacked app cards:
  - BalyeCleaner (Windows, free)
  - ShambaWorks (platform TBD)
  - Lakou (platform TBD)
- Catalog link-out card to greenstoriesllc.com/tools.php (inverted bone/ink with hover effect)
- Title block: Drawing: Tools / Sheet: A-002 / Cost: $0.00

### 5. NIA (Section 03) — `background: var(--green)`
- Giant "NIA." with yellow dot accent
- Subtitle from current site: "Documenting Black contributions to architecture and the built world."
- Right panel with bordered card:
  - Description from current site: "NIA is the Black Architecture Archive. Architect profiles, video interviews, and data on diversity within the profession. Only 2% of licensed architects in the US are Black. NIA exists to make sure those stories don't disappear."
  - CTA: "Visit the Archive" linking to nia.greenstoriesllc.com
- Tag: "Black Architecture Archive"
- Title block: Drawing: NIA / Sheet: A-003 / Status: Ongoing

### 6. The Game (Section 04) — `background: var(--yellow)`
- Caution-stripe band at top (diagonal repeating black/yellow)
- Giant "Architect the Game." title
- Sub-quote: "Sleep is for the licensed."
- Body copy from current site (text-driven life simulation description)
- Stats ledger: Platform: Android / Version: 1.0.0 / Size: 7.6 MB / Price: Free
- Dark CTA button: "Download APK" with meta info
- Phone mock on right (illustrative game screen with choices and stat bars)
- Title block: Drawing: The Game / Sheet: A-004

### 7. AnansiBuild (Section 05) — `background: var(--concrete)`
- Concrete texture overlay
- Giant "AnansiBuild." title
- Description from current site: "Export Revit architectural models to multi-color 3MF files for 3D printing. Auto material separation, 26 printer database, 19 architectural scales."
- Right panel spec sheet:
  - Type: Revit Plugin
  - Platform: Revit 2026
  - Status: Beta
  - Cost: Free
  - For: Architects, engineers
- Title block: Drawing: AnansiBuild / Sheet: A-005

### 8. Featured Videos (Section 06) — `background: var(--ink)`
- New section not in the Brutalist prototype — styled to match the aesthetic
- Chapter marker: `§06 . Videos . Architecture Education`
- Heading in Fraunces serif, large
- Three TikTok embeds in a grid, each wrapped in bordered cards (no border-radius)
- Hard-edge card treatment matching the brutalist style
- CTA: "See all 1,000+ videos" linking to TikTok profile
- Title block: Drawing: Videos / Sheet: A-006

### 9. Bio (Section 07) — `background: var(--bone), color: var(--ink)`
- Paper flip — light background section
- Portrait photo with 2px ink border, no radius
- Caption overlay at bottom: "Tom Reynolds / @TikTokArchitect"
- Giant "Tom Reynolds." heading
- Lede: "Architect in Newark. Builds free tools. Runs an archive. Makes a game. Posts receipts."
- Bio copy from current site:
  - "20+ years in architectural design. Principal at Green Stories LLC. Associate AIA. LEED Green Associate. Co-founder and former VP of the NJ Chapter of NOMA. Former President of the Montclair Branch of the NAACP."
  - "I started making TikToks because the profession needed a different voice..."
  - "I built NIA, the Black Architecture Archive. I collaborate with BLKBRY Studios... I wrote a children's book about Norma Merrick Sklarek..."
- Bio ledger: Firm: Green Stories LLC / Based: Newark, NJ / Credentials: Assoc. AIA, LEED GA
- Contact links (brutalist bordered buttons): TikTok, Instagram, YouTube, email
- Title block: Drawing: Bio / Sheet: A-007

### 10. LinkHub (Section 08) — `background: var(--ink-soft)`
- New section styled for the brutalist aesthetic
- Chapter marker: `§08 . Links . Find Me Everywhere`
- All current link categories preserved: Work, Social, Connect, Tools I Use
- Each link as a bordered card with mono typography, hard edges, offset hover shadow
- All real URLs preserved from current LinkHub component
- Title block: Drawing: Links / Sheet: A-008

### 11. Footer/Colophon — `background: var(--ink)`
- 4-column grid: Drawing Set index, Work links, Social links, Contact
- Giant "Tom Reynolds." in Fraunces at bottom
- Email: IAmThe@TikTokArchitect.com
- Copyright: Green Stories LLC, Newark, NJ
- "Drawing Set A-001 . Issue 01 . Rev 01"

## Factual Corrections from Prototype

| Prototype says | Reality |
|---|---|
| "Licensed" / "Architect" | Architectural designer, Associate AIA |
| Detroit, MI | Newark, NJ |
| AIA . NOMA (as credentials) | Associate AIA, LEED Green Associate, former VP NJ NOMA |
| 23+ years | 20+ years |
| "Tom the Reynolds" cover treatment | "TikTokArchitect" or "Tom Reynolds" |
| hello@greenstoriesllc.com | IAmThe@TikTokArchitect.com (for this site) |
| Est. 2019 . 6 years | Est. 2019 (keep, appears accurate) |

## Technical Approach

- **Framework:** Next.js 16 with React 19 (existing stack)
- **Styling:** Tailwind CSS 4 + custom CSS variables for the color palette and typography
- **Fonts:** Google Fonts — Fraunces (variable), Archivo, JetBrains Mono (loaded via next/font or link)
- **Components:** Rewrite each existing component to match the brutalist aesthetic. Add new components for Cover, Vitals, and the shared "sheet" wrapper.
- **Images:** Copy `headshot-primary.webp` from design assets to `public/images/`. Keep existing images.
- **Responsive:** Single-column collapse at 960px as in the prototype. Mobile hamburger nav preserved.
- **No JS animations needed** — the aesthetic is static/mechanical. Hover states via CSS transitions only.

## Components to Create/Modify

| Component | Action | Notes |
|---|---|---|
| `Sheet.tsx` | **New** | Shared wrapper for the drafting-grid + border + corner coords + title block |
| `ChapterMark.tsx` | **New** | Reusable `§XX . Title` component |
| `TitleBlock.tsx` | **New** | Bottom-right metadata block |
| `Nav.tsx` | **Rewrite** | New brutalist fixed nav |
| `Cover.tsx` | **New** | Full-bleed portrait cover section |
| `Vitals.tsx` | **New** | Replaces Hero.tsx — orange ground, 2% stat |
| `Hero.tsx` | **Delete** | Replaced by Cover + Vitals |
| `ToolsSection.tsx` | **Rewrite** | Blueprint cyan, app cards, catalog linkout |
| `NIASection.tsx` | **Rewrite** | Deep green, giant NIA title, archive card |
| `GameSection.tsx` | **New** | Yellow ground, phone mock, game details |
| `AnansiBuildSection.tsx` | **New** | Concrete ground, spec sheet |
| `FeaturedVideos.tsx` | **Rewrite** | Brutalist card styling, ink background |
| `About.tsx` | **Rewrite** → `Bio.tsx` | Bone/paper ground, bio ledger |
| `LinkHub.tsx` | **Rewrite** | Brutalist card styling, ink-soft background |
| `Footer.tsx` | **Rewrite** | Colophon with drawing set index |
| `layout.tsx` | **Modify** | New fonts, remove Geist, update body classes |
| `globals.css` | **Rewrite** | New CSS variables, base styles, sheet styles |
| `page.tsx` | **Modify** | New section order, new component imports |

## Out of Scope

- No sub-pages redesigned (contact, privacy, terms, analytics)
- No CMS or dynamic data — all content is static in components
- No JS-driven animations or scroll effects
- Placeholder text in the prototype stays as placeholder unless we have real copy to fill it
