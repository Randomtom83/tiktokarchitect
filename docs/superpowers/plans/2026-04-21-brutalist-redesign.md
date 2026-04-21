# Brutalist Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the TikTokArchitect homepage with a brutalist construction-document aesthetic — per-section color grounds, drafting grids, title blocks, Fraunces/Archivo/JetBrains Mono typography — while preserving all existing real copy and correcting factual errors from the design prototype.

**Architecture:** Next.js 16 + React 19 + Tailwind CSS 4. Each page section is a full-viewport "sheet" with a shared wrapper providing drafting grid, inset border, corner coordinates, and title block. Custom CSS variables define the color palette and type scale. All content is static.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, next/font/google (Fraunces, Archivo, JetBrains Mono)

**Design reference:** `claude-design/tiktokarchitect-2/project/TikTokArchitect Brutalist.html`

**Factual corrections to apply everywhere:**
- Location: Newark, NJ (not Detroit)
- Credentials: "architectural designer", Associate AIA, LEED Green Associate (NOT "licensed architect")
- Experience: 20+ years (not 23+)
- Brand: "TikTokArchitect" or "Tom Reynolds" (not "Tom the Reynolds")
- Email: IAmThe@TikTokArchitect.com
- NOMA: Co-founder and former VP of NJ Chapter (not just "NOMA")

---

## File Structure

```
src/
  app/
    layout.tsx              — MODIFY: swap fonts, update body classes
    page.tsx                — MODIFY: new section order, new imports
    globals.css             — REWRITE: new variables, base styles, sheet chrome
  components/
    Nav.tsx                 — REWRITE: brutalist fixed nav
    Sheet.tsx               — CREATE: shared section wrapper (grid, border, coords, titleblock)
    Cover.tsx               — CREATE: full-bleed portrait hero
    Vitals.tsx              — CREATE: orange 2% stat section (replaces Hero.tsx)
    ToolsSection.tsx        — REWRITE: blueprint cyan, app cards
    NIASection.tsx          — REWRITE: deep green archive section
    GameSection.tsx         — CREATE: yellow ground, phone mock
    AnansiBuildSection.tsx  — CREATE: concrete ground, spec sheet
    FeaturedVideos.tsx      — REWRITE: brutalist card styling
    Bio.tsx                 — CREATE: bone/paper bio (replaces About.tsx)
    LinkHub.tsx             — REWRITE: brutalist card styling
    Footer.tsx              — REWRITE: colophon with drawing set index
    Hero.tsx                — DELETE: replaced by Cover + Vitals
    About.tsx               ��� DELETE: replaced by Bio
public/
  images/
    headshot-primary.webp   — COPY from design assets
```

---

## Task 1: Foundation — Fonts and Global CSS

**Files:**
- Modify: `src/app/layout.tsx`
- Rewrite: `src/app/globals.css`

- [ ] **Step 1: Update layout.tsx — swap fonts and body classes**

Replace the entire file content:

```tsx
import type { Metadata } from "next";
import { Fraunces, Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TikTokArchitect | Tom Reynolds",
  description:
    "Architectural designer. Educator. Only 2% of licensed architects in the US are Black. I'm working to change that.",
  openGraph: {
    title: "TikTokArchitect | Tom Reynolds",
    description:
      "Architectural designer. Educator. Only 2% of licensed architects in the US are Black. I'm working to change that.",
    url: "https://www.tiktokarchitect.com",
    siteName: "TikTokArchitect",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${archivo.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Rewrite globals.css with brutalist foundation**

Replace the entire file content:

```css
@import "tailwindcss";

:root {
  --ink: #0c0c0a;
  --ink-soft: #1b1b18;
  --bone: #eeeae0;
  --bone-dim: #d6d1c4;
  --orange: #ff5a1f;
  --cyan: #1e6a78;
  --green: #1f3d2a;
  --yellow: #f4c430;
  --concrete: #8a8a82;
  --redline: #e8362b;

  --font-serif-family: var(--font-serif), "Times New Roman", serif;
  --font-sans-family: var(--font-sans), Helvetica, Arial, sans-serif;
  --font-mono-family: var(--font-mono), ui-monospace, Menlo, monospace;
}

@theme inline {
  --color-ink: var(--ink);
  --color-ink-soft: var(--ink-soft);
  --color-bone: var(--bone);
  --color-bone-dim: var(--bone-dim);
  --color-orange: var(--orange);
  --color-cyan: var(--cyan);
  --color-green: var(--green);
  --color-yellow: var(--yellow);
  --color-concrete: var(--concrete);
  --color-redline: var(--redline);
  --font-serif: var(--font-serif-family);
  --font-sans: var(--font-sans-family);
  --font-mono: var(--font-mono-family);
}

*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }

body {
  background: var(--ink);
  color: var(--bone);
  font-family: var(--font-serif-family);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  padding-top: 46px;
}

a { color: inherit; }
html { scroll-behavior: smooth; }

::selection {
  background: var(--orange);
  color: var(--ink);
}

/* ============================================
   SHEET CHROME — drafting grid + border + coords
   ============================================ */
.sheet {
  position: relative;
  min-height: 100vh;
  padding: 56px 40px 48px;
  isolation: isolate;
  overflow: hidden;
}

.sheet::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(to right, currentColor 0 1px, transparent 1px 100%),
    linear-gradient(to bottom, currentColor 0 1px, transparent 1px 100%);
  background-size: 48px 48px;
  opacity: 0.07;
  color: inherit;
  z-index: 0;
}

.sheet::after {
  content: "";
  position: absolute;
  inset: 32px;
  pointer-events: none;
  border: 1px solid currentColor;
  opacity: 0.35;
  z-index: 0;
}

/* Dense grid variant for blueprint sections */
.sheet-dense::before {
  background-image:
    linear-gradient(to right, rgba(238, 234, 224, 0.18) 0 1px, transparent 1px 100%),
    linear-gradient(to bottom, rgba(238, 234, 224, 0.18) 0 1px, transparent 1px 100%);
  background-size: 32px 32px;
  opacity: 1;
}

/* Corner coordinates */
.coord {
  position: absolute;
  font-family: var(--font-mono-family);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.7;
  z-index: 2;
}
.coord-tl { top: 14px; left: 18px; }
.coord-tr { top: 14px; right: 18px; }
.coord-bl { bottom: 14px; left: 18px; }
.coord-br { bottom: 14px; right: 18px; }

/* Title block */
.titleblock {
  position: absolute;
  right: 32px;
  bottom: 32px;
  z-index: 4;
  border: 1px solid currentColor;
  background: inherit;
  display: grid;
  grid-template-columns: repeat(4, auto);
  font-family: var(--font-mono-family);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}
.titleblock > div {
  padding: 8px 12px;
  border-right: 1px solid currentColor;
}
.titleblock > div:last-child { border-right: 0; }
.titleblock .k {
  opacity: 0.55;
  font-size: 8.5px;
  display: block;
  margin-bottom: 2px;
}
.titleblock .v { font-weight: 700; }

/* Chapter marker */
.chapter-mark {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: baseline;
  gap: 14px;
  font-family: var(--font-mono-family);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 32px;
}
.chapter-mark .num {
  font-family: var(--font-serif-family);
  font-style: italic;
  font-weight: 500;
  font-size: 28px;
  letter-spacing: -0.02em;
  opacity: 0.85;
}
.chapter-mark .bar {
  flex: 1;
  height: 1px;
  background: currentColor;
  opacity: 0.4;
}

/* Redline annotation */
.redline {
  position: absolute;
  color: var(--redline);
  font-family: var(--font-mono-family);
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  z-index: 5;
}
.redline .tick {
  width: 22px;
  height: 22px;
  border: 1.5px solid currentColor;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: var(--font-serif-family);
  font-style: italic;
  font-size: 13px;
  flex: 0 0 22px;
}
.redline .line {
  max-width: 220px;
  line-height: 1.45;
  border-bottom: 1.5px solid currentColor;
  padding-bottom: 3px;
}

/* Stamp */
.stamp {
  display: inline-grid;
  place-items: center;
  padding: 10px 16px;
  border: 2px solid currentColor;
  font-family: var(--font-mono-family);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  transform: rotate(-4deg);
  position: relative;
}
.stamp::before, .stamp::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: currentColor;
}
.stamp::before { top: -5px; }
.stamp::after { bottom: -5px; }

/* Brutalist card hover */
.brutal-card {
  display: block;
  text-decoration: none;
  color: inherit;
  border: 1.5px solid currentColor;
  transition: transform 0.2s ease, background 0.2s ease;
  position: relative;
}
.brutal-card:hover {
  transform: translate(-3px, -3px);
  box-shadow: 3px 3px 0 currentColor;
}

/* Responsive */
@media (max-width: 960px) {
  .sheet { padding: 48px 24px 40px; }
  .titleblock { position: static; margin-top: 32px; }
}
```

- [ ] **Step 3: Copy headshot image from design assets**

Run:
```bash
cp "claude-design/tiktokarchitect-2/project/images/headshot-primary.webp" public/images/headshot-primary.webp
```

- [ ] **Step 4: Verify dev server starts**

Run: `npm run dev`
Expected: Server starts without errors. Page may look broken (that's fine — components not yet updated).

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css public/images/headshot-primary.webp
git commit -m "feat: brutalist redesign foundation — fonts, CSS variables, sheet chrome"
```

---

## Task 2: Nav Component

**Files:**
- Rewrite: `src/components/Nav.tsx`

- [ ] **Step 1: Rewrite Nav.tsx**

```tsx
"use client";

import { useState } from "react";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center gap-8 px-5 py-3.5 bg-ink border-b border-bone/20 font-mono text-[11px] tracking-[0.16em] uppercase text-bone">
      <span className="font-serif font-bold tracking-tight normal-case text-base">
        Tom <i className="text-orange">Reynolds.</i>
      </span>
      <span className="opacity-60 ml-2 hidden lg:inline">Drawing Set A-001 · Issue 01</span>
      <span className="flex-1" />

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-8">
        <a href="#vitals" className="no-underline opacity-70 hover:opacity-100 transition-opacity">Vitals</a>
        <a href="#tools" className="no-underline opacity-70 hover:opacity-100 transition-opacity">Tools</a>
        <a href="#nia" className="no-underline opacity-70 hover:opacity-100 transition-opacity">Archive</a>
        <a href="#game" className="no-underline opacity-70 hover:opacity-100 transition-opacity">The Game</a>
        <a href="#anansi" className="no-underline opacity-70 hover:opacity-100 transition-opacity">AnansiBuild</a>
        <a href="#bio" className="no-underline opacity-70 hover:opacity-100 transition-opacity">Bio</a>
        <a href="#videos" className="no-underline opacity-70 hover:opacity-100 transition-opacity">Videos</a>
        <a href="#links" className="no-underline opacity-70 hover:opacity-100 transition-opacity">Links</a>
        <span className="px-2.5 py-1 border border-orange text-orange">Rev · 01</span>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2 text-bone"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden bg-ink border-b border-bone/20 px-5 py-4 flex flex-col gap-3">
          {["vitals", "tools", "nia", "game", "anansi", "bio", "videos", "links"].map((id) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setMenuOpen(false)}
              className="block py-2 opacity-70 hover:opacity-100 no-underline"
            >
              {id === "nia" ? "Archive" : id === "game" ? "The Game" : id === "anansi" ? "AnansiBuild" : id.charAt(0).toUpperCase() + id.slice(1)}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 2: Verify nav renders**

Run: `npm run dev`, check browser. Fixed dark bar with links should appear.

- [ ] **Step 3: Commit**

```bash
git add src/components/Nav.tsx
git commit -m "feat: brutalist nav with drawing-set branding"
```

---

## Task 3: Cover Section

**Files:**
- Create: `src/components/Cover.tsx`

- [ ] **Step 1: Create Cover.tsx**

```tsx
export default function Cover() {
  return (
    <section className="relative min-h-[calc(100vh-46px)] text-bone bg-ink overflow-hidden" id="cover">
      {/* Full-bleed photo */}
      <div
        className="absolute inset-0 bg-cover bg-[center_30%]"
        style={{
          backgroundImage: "url('/images/headshot-primary.webp')",
          filter: "saturate(0.85) contrast(1.08)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0) 70%), linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%)",
          }}
        />
      </div>

      {/* Drafting grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(238,234,224,0.12) 0 1px, transparent 1px 100%), linear-gradient(to bottom, rgba(238,234,224,0.12) 0 1px, transparent 1px 100%)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Inset border */}
      <div className="absolute pointer-events-none border border-bone/50" style={{ inset: "32px" }} />

      {/* Top-left handle */}
      <span className="absolute left-10 top-14 z-[3] font-mono text-xs tracking-[0.2em] uppercase text-bone flex items-center gap-2.5">
        <span className="w-2 h-2 bg-orange rounded-full" />
        <b className="font-bold">@TikTokArchitect</b> · on record
      </span>

      {/* Top-right caption */}
      <span className="absolute right-10 top-14 z-[3] text-right font-mono text-[10px] tracking-[0.2em] uppercase text-bone opacity-75">
        Sheet <b className="text-orange font-bold opacity-100">A-000</b> · Cover<br />
        Scale · 1:1
      </span>

      {/* Stamp */}
      <span className="absolute right-20 top-32 z-[4]">
        <span className="stamp text-redline">Rev · 01</span>
      </span>

      {/* Giant name */}
      <h1
        className="absolute left-10 right-10 bottom-20 z-[3] font-serif font-light uppercase leading-[0.82] tracking-[-0.055em] text-bone m-0"
        style={{ fontSize: "clamp(88px, 22vw, 280px)" }}
      >
        TIKTOK<br />
        <span className="italic font-normal text-orange text-[0.38em] inline-block -translate-y-[0.7em] tracking-normal normal-case mx-[0.04em]">
          the
        </span>
        ARCHITECT
      </h1>

      {/* Bottom strap */}
      <div className="absolute left-10 right-10 bottom-8 z-[3] flex justify-between items-end font-mono text-[10px] tracking-[0.2em] uppercase text-bone opacity-75">
        <span>Green Stories LLC · Newark, NJ · Est. <b className="font-bold">2019</b></span>
        <span className="font-serif italic text-[22px] tracking-tight normal-case opacity-100">
          A<i>-000.</i>
        </span>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Cover.tsx
git commit -m "feat: full-bleed cover section with portrait and giant name"
```

---

## Task 4: Vitals Section

**Files:**
- Create: `src/components/Vitals.tsx`

- [ ] **Step 1: Create Vitals.tsx**

```tsx
export default function Vitals() {
  return (
    <section className="sheet bg-orange text-ink" id="vitals">
      <span className="coord coord-tl text-ink">A · 01 · 01</span>
      <span className="coord coord-tr text-ink">X: 00 — Y: 00</span>
      <span className="coord coord-bl text-ink">N 40.74° · W 74.17°</span>
      <span className="coord coord-br text-ink">Sheet A-001</span>

      <div className="chapter-mark text-ink">
        <span className="num">§01</span>
        <span>Vitals · One Stat That Explains Everything</span>
        <span className="bar" />
        <span>A-001</span>
      </div>

      <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-18 pt-4">
        <div>
          <h2
            className="font-serif font-light leading-[0.78] tracking-[-0.06em] m-0"
            style={{ fontSize: "clamp(180px, 30vw, 420px)" }}
          >
            2<span className="italic font-normal">%</span>
          </h2>
          <p
            className="font-serif font-normal leading-[1.08] tracking-[-0.015em] mt-6 max-w-[22ch]"
            style={{ fontSize: "clamp(28px, 3.4vw, 48px)" }}
          >
            of licensed U.S. architects are{" "}
            <i className="italic bg-ink text-orange px-[0.08em]">Black.</i>
            <br />
            I&apos;m working to change that.
          </p>
        </div>

        <div className="flex flex-col justify-between pt-12 pl-0 lg:pl-8 border-t-2 lg:border-t-0 lg:border-l-2 border-ink">
          {/* Ledger */}
          <div className="grid grid-cols-2 border-t-2 border-ink">
            {[
              { k: "Name", v: <>Tom <i>Reynolds</i></> },
              { k: "Handle", v: "@TikTokArchitect" },
              { k: "City", v: <>Newark, <i>NJ</i></> },
              { k: "Firm", v: <>Green Stories <i>LLC</i></> },
              { k: "Credentials", v: <>Assoc. AIA<small className="block mt-1 text-sm font-mono font-normal opacity-60 uppercase tracking-[0.08em]">LEED GA · NOMA</small></> },
              { k: "Est.", v: <>2019<small className="block mt-1 text-sm font-mono font-normal opacity-60 uppercase tracking-[0.08em]">· Green Stories</small></> },
            ].map((item, i) => (
              <div
                key={item.k}
                className={`border-b border-ink py-4.5 px-4 ${i % 2 === 0 ? "border-r border-ink" : ""}`}
              >
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-70">{item.k}</div>
                <div className="font-serif text-[34px] leading-[1.05] mt-1.5 tracking-tight">{item.v}</div>
              </div>
            ))}
          </div>

          <blockquote className="mt-10 pt-6 border-t border-ink font-serif italic text-[22px] leading-[1.3] max-w-[28ch]">
            &ldquo;I started making TikToks because the profession needed a different voice. Somebody who looked like the communities we build in.&rdquo;
            <cite className="block mt-3 font-mono not-italic text-[10px] tracking-[0.18em] uppercase opacity-65">
              — Tom Reynolds
            </cite>
          </blockquote>
        </div>
      </div>

      <div className="titleblock">
        <div><span className="k">Drawing</span><span className="v">Vitals</span></div>
        <div><span className="k">Sheet</span><span className="v">A-001</span></div>
        <div><span className="k">Scale</span><span className="v">As noted</span></div>
        <div><span className="k">Date</span><span className="v">Issue 01</span></div>
      </div>

      <div className="redline hidden lg:flex" style={{ top: "20%", right: "6%" }}>
        <span className="tick">1</span>
        <span className="line">Lede is the stat.<br />Everything else is margin.</span>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Vitals.tsx
git commit -m "feat: vitals section — orange ground, 2% stat, credential ledger"
```

---

## Task 5: Tools Section

**Files:**
- Rewrite: `src/components/ToolsSection.tsx`

- [ ] **Step 1: Rewrite ToolsSection.tsx**

```tsx
export default function ToolsSection() {
  return (
    <section className="sheet sheet-dense bg-cyan text-bone" id="tools">
      <span className="coord coord-tl">A · 02 · 01</span>
      <span className="coord coord-tr">GREENSTORIESLLC.COM/TOOLS.PHP</span>
      <span className="coord coord-bl">Free · All 23</span>
      <span className="coord coord-br">Sheet A-002</span>

      <div className="chapter-mark">
        <span className="num">§02</span>
        <span>Tools · Twenty-Three Free Builds</span>
        <span className="bar" />
        <span>A-002</span>
      </div>

      <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-[6fr_5fr] gap-18 pt-4">
        <div>
          <h2
            className="font-serif font-light leading-[0.84] tracking-[-0.05em] m-0"
            style={{ fontSize: "clamp(96px, 14vw, 200px)" }}
          >
            Twenty-<br />three <i className="italic font-normal text-yellow">tools.</i>
          </h2>
          <p className="font-serif text-[22px] leading-[1.4] max-w-[34ch] mt-7 italic opacity-90">
            Code calculators, structural tools, and project management — built by
            an architect who actually uses them. Free for anyone doing the work.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* App cards */}
          {[
            { num: "01", name: "BalyeCleaner", platform: "Windows", desc: "Desktop cleanup and file management utility for architects." },
            { num: "02", name: "ShambaWorks", platform: "Platform TBD", desc: "[ description placeholder — one line on what ShambaWorks does. ]" },
            { num: "03", name: "Lakou", platform: "Platform TBD", desc: "[ description placeholder — one line on what Lakou does. ]" },
          ].map((app) => (
            <a
              key={app.num}
              href="#"
              className="brutal-card block no-underline text-bone p-5.5 px-6 bg-black/18 hover:bg-ink"
            >
              <div className="flex justify-between items-baseline font-mono text-[10px] tracking-[0.2em] uppercase opacity-75">
                <span>App · {app.num}</span>
                <span>{app.platform}</span>
              </div>
              <h3 className="font-serif font-normal italic text-[56px] leading-[0.95] my-2 tracking-tight">
                {app.name}
              </h3>
              <p className="font-mono text-xs leading-relaxed m-0 opacity-85 max-w-[48ch]">
                {app.desc}
              </p>
              <span className="absolute right-6 bottom-5.5 font-mono text-[22px] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                ↗
              </span>
            </a>
          ))}

          {/* Catalog link-out */}
          <a
            href="https://greenstoriesllc.com/tools.php"
            target="_blank"
            rel="noopener noreferrer"
            className="block no-underline p-6 px-7 border-2 border-bone bg-bone text-ink hover:bg-ink hover:text-bone transition-colors duration-200 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[3px_3px_0_var(--bone)]"
          >
            <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] uppercase">
              <span>Full catalog</span>
              <span>Live · greenstoriesllc.com</span>
            </div>
            <h3 className="font-serif font-light text-[48px] leading-[0.95] mt-2.5 mb-1 tracking-tight">
              All <i className="italic text-orange">23.</i> Maintained at the source.
            </h3>
            <div className="font-mono text-[13px] tracking-[0.02em] mt-3 border-t border-current pt-2.5 flex justify-between items-center">
              <span className="text-[15px] font-bold">greenstoriesllc.com/tools.php</span>
              <span className="text-[22px]">↗</span>
            </div>
          </a>
        </div>
      </div>

      <div className="titleblock">
        <div><span className="k">Drawing</span><span className="v">Tools</span></div>
        <div><span className="k">Sheet</span><span className="v">A-002</span></div>
        <div><span className="k">Cost</span><span className="v">$0.00</span></div>
        <div><span className="k">Date</span><span className="v">Issue 01</span></div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ToolsSection.tsx
git commit -m "feat: tools section — blueprint cyan, app cards, catalog linkout"
```

---

## Task 6: NIA Section

**Files:**
- Rewrite: `src/components/NIASection.tsx`

- [ ] **Step 1: Rewrite NIASection.tsx**

```tsx
export default function NIASection() {
  return (
    <section className="sheet bg-green text-bone" id="nia">
      <span className="coord coord-tl">A · 03 · 01</span>
      <span className="coord coord-tr">The Archive</span>
      <span className="coord coord-bl">Black Architecture · Ongoing</span>
      <span className="coord coord-br">Sheet A-003</span>

      <div className="chapter-mark">
        <span className="num">§03</span>
        <span>NIA · Black Architecture Archive</span>
        <span className="bar" />
        <span>A-003</span>
      </div>

      <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-[5fr_6fr] gap-14 items-end pt-4">
        <div className="lg:pr-6">
          <h2
            className="font-serif font-light leading-[0.78] tracking-[-0.055em] m-0"
            style={{ fontSize: "clamp(160px, 26vw, 360px)" }}
          >
            NIA<span className="text-yellow">.</span>
          </h2>
          <p className="font-serif text-[22px] italic mt-4 leading-[1.35] max-w-[28ch] opacity-90">
            Documenting Black contributions to architecture and the built world.
          </p>
          <span className="inline-block mt-6 font-mono text-[10.5px] tracking-[0.2em] uppercase border border-bone py-1.5 px-3 opacity-90">
            Black Architecture Archive
          </span>
        </div>

        <div className="border-[1.5px] border-bone p-7 px-8 bg-black/15">
          <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] uppercase opacity-75 mb-5">
            <span>Sheet A-003</span>
            <span>Ongoing · Web · Free</span>
          </div>
          <h3 className="font-serif font-normal text-[40px] leading-[1.05] m-0 mb-3.5 tracking-tight">
            An archive of <i className="italic">every</i> Black architect this country chose to forget.
          </h3>
          <p className="font-serif text-[17px] leading-relaxed m-0 mb-4 italic opacity-90">
            NIA is the Black Architecture Archive. Architect profiles, video
            interviews, and data on diversity within the profession.
          </p>
          <p className="font-serif text-[17px] leading-relaxed m-0 mb-4 italic opacity-90">
            Only 2% of licensed architects in the US are Black. NIA exists to
            make sure those stories don&apos;t disappear.
          </p>
          <a
            href="https://nia.greenstoriesllc.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-between items-center font-mono text-[11px] tracking-[0.2em] uppercase border-t border-bone mt-5 pt-4 no-underline text-bone"
          >
            <span>Visit the Archive</span>
            <span className="text-[20px] hover:text-yellow transition-colors">→</span>
          </a>
        </div>
      </div>

      <div className="titleblock">
        <div><span className="k">Drawing</span><span className="v">NIA</span></div>
        <div><span className="k">Sheet</span><span className="v">A-003</span></div>
        <div><span className="k">Type</span><span className="v">Archive</span></div>
        <div><span className="k">Status</span><span className="v">Ongoing</span></div>
      </div>

      <div className="redline hidden lg:flex" style={{ top: "10%", right: "4%" }}>
        <span className="tick">2</span>
        <span className="line">Every Black<br />architect.<br />Every one.</span>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/NIASection.tsx
git commit -m "feat: NIA section — deep green archive with real copy"
```

---

## Task 7: Game Section

**Files:**
- Create: `src/components/GameSection.tsx`

- [ ] **Step 1: Create GameSection.tsx**

```tsx
export default function GameSection() {
  return (
    <section className="sheet bg-yellow text-ink" id="game">
      {/* Caution band */}
      <div
        className="absolute left-0 right-0 top-[72px] h-5 z-[1]"
        style={{
          background: "repeating-linear-gradient(135deg, var(--ink) 0 16px, var(--yellow) 16px 32px)",
        }}
      />

      <span className="coord coord-tl text-ink">A · 04 · 01</span>
      <span className="coord coord-tr text-ink">Android · v1.0.0</span>
      <span className="coord coord-bl text-ink">Size · 7.6 MB</span>
      <span className="coord coord-br text-ink">Sheet A-004</span>

      <div className="chapter-mark text-ink mt-7">
        <span className="num">§04</span>
        <span>The Game · Architect the Game</span>
        <span className="bar" />
        <span>A-004</span>
      </div>

      <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-[6fr_5fr] gap-16 pt-10">
        <div>
          <h2
            className="font-serif font-light leading-[0.82] tracking-[-0.05em] m-0"
            style={{ fontSize: "clamp(96px, 15vw, 220px)" }}
          >
            Architect <span className="italic text-redline">the</span>
            <br />
            <i className="italic font-normal">Game.</i>
          </h2>

          <p
            className="font-serif italic leading-[1.1] border-l-4 border-ink pl-5 py-1 mt-8 max-w-[20ch]"
            style={{ fontSize: "clamp(30px, 3.4vw, 48px)" }}
          >
            &ldquo;Sleep is for the licensed.&rdquo;
          </p>

          <p className="font-serif text-[19px] leading-relaxed max-w-[44ch] mt-7">
            A text-driven life simulation based on real data from the
            architecture profession. Choose your school, survive studio
            culture, manage money, stress, energy, and relationships
            semester by semester. Graduate — and discover that was only
            the beginning.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-4 mt-8 border-t-2 border-b-2 border-ink">
            {[
              { k: "Platform", v: "Android" },
              { k: "Version", v: "1.0.0" },
              { k: "Size", v: "7.6 MB" },
              { k: "Price", v: "Free", italic: true },
            ].map((s, i) => (
              <div key={s.k} className={`py-3.5 pr-3 ${i < 3 ? "border-r border-ink" : ""}`}>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-70">{s.k}</div>
                <div className={`font-serif text-[30px] leading-none mt-1.5 tracking-tight ${s.italic ? "italic" : ""}`}>
                  {s.v}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href="#"
            className="inline-flex justify-between items-center mt-8 py-5 px-6 bg-ink text-yellow no-underline font-serif text-[30px] italic min-w-[360px] border-2 border-ink gap-8 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[6px_6px_0_var(--ink)] transition-all duration-200"
          >
            <span>Download APK<br />↓</span>
            <span className="font-mono not-italic text-[11px] tracking-[0.18em] uppercase opacity-75 text-right leading-relaxed">
              Android · v1.0.0<br />Size · 7.6 MB
            </span>
          </a>
        </div>

        {/* Phone mock */}
        <div className="relative">
          <div className="relative w-full max-w-[320px] lg:ml-auto bg-ink text-yellow border-2 border-ink p-4.5 px-4 flex flex-col gap-2.5 font-mono text-xs shadow-[10px_10px_0_rgba(0,0,0,0.25)]" style={{ aspectRatio: "9/19.5" }}>
            <div className="flex justify-between text-[10px] tracking-[0.15em] opacity-70 border-b border-yellow pb-2.5 mb-1.5">
              <span>9:48 AM</span>
              <span>ARCHITECT · STUDIO · S3</span>
            </div>
            <div className="font-serif text-[15px] leading-[1.4] italic py-1.5 opacity-90">
              &ldquo;It&apos;s 2 AM. Your model is due at 9. Your roommate asks if you want to come to a party.&rdquo;
            </div>
            <div className="py-2 px-2.5 border border-yellow font-bold bg-yellow text-ink text-xs">&gt; Stay. Grind. Eat foam.</div>
            <div className="py-2 px-2.5 border border-dashed border-yellow text-xs">&gt; Go for an hour.</div>
            <div className="py-2 px-2.5 border border-dashed border-yellow text-xs">&gt; Burn it all down.</div>
            <div className="mt-auto grid gap-1.5 pt-3 border-t border-yellow">
              {[
                { label: "$", w: "42%", val: "$420" },
                { label: "zzz", w: "18%", val: "12%" },
                { label: "HP", w: "58%", val: "58%" },
                { label: "rep", w: "74%", val: "74%" },
              ].map((bar) => (
                <div key={bar.label} className="grid grid-cols-[34px_1fr_auto] gap-2.5 items-center text-[10px] tracking-[0.1em]">
                  <span>{bar.label}</span>
                  <div className="h-1.5 bg-yellow/20 relative">
                    <div className="absolute left-0 top-0 bottom-0 bg-yellow" style={{ width: bar.w }} />
                  </div>
                  <span>{bar.val}</span>
                </div>
              ))}
            </div>
            <span className="absolute -bottom-7 right-0 font-mono text-[9px] tracking-[0.18em] uppercase opacity-70 text-ink">
              [ placeholder screen · illustrative ]
            </span>
          </div>
        </div>
      </div>

      <div className="titleblock">
        <div><span className="k">Drawing</span><span className="v">The Game</span></div>
        <div><span className="k">Sheet</span><span className="v">A-004</span></div>
        <div><span className="k">Platform</span><span className="v">Android</span></div>
        <div><span className="k">Cost</span><span className="v">Free</span></div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GameSection.tsx
git commit -m "feat: game section — yellow ground, phone mock, caution band"
```

---

## Task 8: AnansiBuild Section

**Files:**
- Create: `src/components/AnansiBuildSection.tsx`

- [ ] **Step 1: Create AnansiBuildSection.tsx**

```tsx
export default function AnansiBuildSection() {
  return (
    <section className="sheet bg-concrete text-ink" id="anansi">
      {/* Concrete texture */}
      <div
        className="absolute pointer-events-none z-[1] opacity-90 mix-blend-multiply"
        style={{
          inset: "32px",
          background: [
            "radial-gradient(circle at 20% 30%, rgba(0,0,0,.08) 0 2px, transparent 3px)",
            "radial-gradient(circle at 70% 60%, rgba(0,0,0,.06) 0 1.5px, transparent 2px)",
            "radial-gradient(circle at 45% 85%, rgba(0,0,0,.07) 0 2px, transparent 3px)",
            "radial-gradient(circle at 90% 20%, rgba(0,0,0,.08) 0 1.5px, transparent 2px)",
            "radial-gradient(circle at 10% 75%, rgba(0,0,0,.05) 0 1px, transparent 2px)",
          ].join(", "),
          backgroundSize: "120px 120px, 90px 90px, 140px 140px, 80px 80px, 110px 110px",
        }}
      />

      <span className="coord coord-tl text-ink">A · 05 · 01</span>
      <span className="coord coord-tr text-ink">The Build</span>
      <span className="coord coord-bl text-ink">Revit 2026 · Beta</span>
      <span className="coord coord-br text-ink">Sheet A-005</span>

      <div className="chapter-mark text-ink">
        <span className="num">§05</span>
        <span>AnansiBuild · The Build</span>
        <span className="bar" />
        <span>A-005</span>
      </div>

      <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-14 pt-4">
        <div>
          <h2
            className="font-serif font-light leading-[0.82] tracking-[-0.055em] m-0"
            style={{ fontSize: "clamp(120px, 18vw, 260px)" }}
          >
            Anansi<i className="italic font-normal">Build.</i>
          </h2>
          <p className="font-serif italic text-2xl leading-[1.35] max-w-[34ch] mt-7">
            Export Revit architectural models to multi-color 3MF files for 3D
            printing. Auto material separation, 26 printer database, 19
            architectural scales.
          </p>
        </div>

        <aside className="grid content-start gap-5 border-2 border-ink p-6 bg-white/18">
          <h4 className="font-serif italic font-normal text-[26px] leading-none m-0 mb-2 tracking-tight">
            Spec Sheet
          </h4>
          {[
            { k: "Type", v: "Revit Plugin" },
            { k: "Platform", v: "Revit 2026" },
            { k: "Status", v: "Beta" },
            { k: "Cost", v: "Free" },
            { k: "For", v: "Architects, Engineers" },
          ].map((row, i, arr) => (
            <div
              key={row.k}
              className={`grid grid-cols-[90px_1fr] gap-3.5 font-mono text-xs tracking-[0.12em] uppercase pb-2.5 ${i < arr.length - 1 ? "border-b border-ink" : ""}`}
            >
              <span className="opacity-60">{row.k}</span>
              <span className="font-bold">{row.v}</span>
            </div>
          ))}
          <a
            href="https://greenstoriesllc.com/anansibuild.php"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-between items-center font-mono text-[11px] tracking-[0.18em] uppercase border-t-2 border-ink mt-2 pt-4 no-underline text-ink"
          >
            <span>Download Free</span>
            <span className="text-[20px]">↗</span>
          </a>
        </aside>
      </div>

      <div className="titleblock">
        <div><span className="k">Drawing</span><span className="v">AnansiBuild</span></div>
        <div><span className="k">Sheet</span><span className="v">A-005</span></div>
        <div><span className="k">Status</span><span className="v">Beta</span></div>
        <div><span className="k">Date</span><span className="v">Issue 01</span></div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AnansiBuildSection.tsx
git commit -m "feat: AnansiBuild section — concrete ground, spec sheet with real details"
```

---

## Task 9: Featured Videos Section

**Files:**
- Rewrite: `src/components/FeaturedVideos.tsx`

- [ ] **Step 1: Rewrite FeaturedVideos.tsx**

```tsx
"use client";

import { useEffect } from "react";

const FEATURED_VIDEOS = [
  "https://www.tiktok.com/@tiktokarchitect/video/7620428002148519199",
  "https://www.tiktok.com/@tiktokarchitect/video/6918011082430860550",
  "https://www.tiktok.com/@tiktokarchitect/video/6933673604500507910",
];

export default function FeaturedVideos() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className="sheet bg-ink text-bone" id="videos">
      <span className="coord coord-tl">A · 06 · 01</span>
      <span className="coord coord-tr">@TikTokArchitect</span>
      <span className="coord coord-bl">1,000+ Videos</span>
      <span className="coord coord-br">Sheet A-006</span>

      <div className="chapter-mark">
        <span className="num">§06</span>
        <span>Videos · Architecture Education</span>
        <span className="bar" />
        <span>A-006</span>
      </div>

      <div className="relative z-[2] pt-4">
        <h2
          className="font-serif font-light leading-[0.9] tracking-[-0.04em] m-0 mb-12"
          style={{ fontSize: "clamp(64px, 9vw, 140px)" }}
        >
          Architecture education,<br />
          one video at <i className="italic font-normal text-orange">a time.</i>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURED_VIDEOS.map((url) => {
            const videoId = url.split("/").pop();
            return (
              <div
                key={videoId}
                className="border-[1.5px] border-bone/30 bg-ink-soft overflow-hidden"
              >
                <blockquote
                  className="tiktok-embed"
                  cite={url}
                  data-video-id={videoId}
                  style={{ maxWidth: "325px", minWidth: "250px", margin: 0 }}
                >
                  <section>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={url}
                      className="text-orange hover:underline"
                    >
                      Watch on TikTok
                    </a>
                  </section>
                </blockquote>
              </div>
            );
          })}
        </div>

        <div className="mt-12 pt-6 border-t border-bone/20">
          <a
            href="https://www.tiktok.com/@tiktokarchitect"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] uppercase text-bone no-underline hover:text-orange transition-colors"
          >
            <span>See all 1,000+ videos</span>
            <span className="text-[20px]">↗</span>
          </a>
        </div>
      </div>

      <div className="titleblock">
        <div><span className="k">Drawing</span><span className="v">Videos</span></div>
        <div><span className="k">Sheet</span><span className="v">A-006</span></div>
        <div><span className="k">Count</span><span className="v">1,000+</span></div>
        <div><span className="k">Date</span><span className="v">Issue 01</span></div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/FeaturedVideos.tsx
git commit -m "feat: featured videos — brutalist card styling with TikTok embeds"
```

---

## Task 10: Bio Section

**Files:**
- Create: `src/components/Bio.tsx`
- Delete: `src/components/About.tsx`

- [ ] **Step 1: Create Bio.tsx**

```tsx
export default function Bio() {
  return (
    <section className="sheet bg-bone text-ink" id="bio">
      <span className="coord coord-tl text-ink">A · 07 · 01</span>
      <span className="coord coord-tr text-ink">About · Green Stories LLC</span>
      <span className="coord coord-bl text-ink">Newark, NJ</span>
      <span className="coord coord-br text-ink">Sheet A-007</span>

      <div className="chapter-mark text-ink">
        <span className="num">§07</span>
        <span>Bio · The Person</span>
        <span className="bar" />
        <span>A-007</span>
      </div>

      <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-16 pt-4">
        <figure className="relative border-2 border-ink bg-[#0a0a09] overflow-hidden m-0" style={{ aspectRatio: "4/5" }}>
          <img
            src="/images/headshot-primary.webp"
            alt="Tom Reynolds, portrait"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "saturate(0.9) contrast(1.03)" }}
          />
          <figcaption className="absolute left-0 right-0 bottom-0 py-3.5 px-4 font-mono text-[10px] tracking-[0.2em] uppercase text-bone flex justify-between" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}>
            <span>Tom Reynolds</span>
            <span className="text-orange">@TikTokArchitect</span>
          </figcaption>
        </figure>

        <div>
          <h2
            className="font-serif font-light leading-[0.9] tracking-[-0.035em] m-0"
            style={{ fontSize: "clamp(64px, 9vw, 144px)" }}
          >
            Tom <i className="italic font-normal">Reynolds.</i>
          </h2>
          <p
            className="font-serif italic leading-[1.25] mt-6 max-w-[34ch]"
            style={{ fontSize: "clamp(26px, 2.6vw, 34px)" }}
          >
            Architectural designer in Newark. Builds free tools. Runs an archive. Makes a game. Posts receipts.
          </p>
          <p className="font-serif text-lg leading-relaxed mt-5 max-w-[60ch]">
            20+ years in architectural design. Principal at{" "}
            <a href="https://greenstoriesllc.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-orange transition-colors">
              Green Stories LLC
            </a>
            . Associate AIA. LEED Green Associate. Co-founder and former VP of
            the NJ Chapter of NOMA. Former President of the Montclair Branch of
            the NAACP.
          </p>
          <p className="font-serif text-lg leading-relaxed mt-5 max-w-[60ch]">
            I started making TikToks because the profession needed a different
            voice. Somebody who looked like the communities we build in. Not
            every architect has to come from money or look a certain way.
          </p>
          <p className="font-serif text-lg leading-relaxed mt-5 max-w-[60ch]">
            I built{" "}
            <a href="https://nia.greenstoriesllc.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-orange transition-colors">
              NIA
            </a>
            , the Black Architecture Archive. I collaborate with{" "}
            <a href="https://www.blkbrystudios.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-orange transition-colors">
              BLKBRY Studios
            </a>
            , an architectural firm in Newark. I wrote a children&apos;s book
            about Norma Merrick Sklarek, the first Black woman licensed as an
            architect in New York and California.
          </p>

          {/* Ledger */}
          <div className="mt-10 grid grid-cols-3 border-t-2 border-b-2 border-ink">
            {[
              { k: "Firm", v: <>Green Stories <i>LLC</i></> },
              { k: "Based", v: <>Newark, <i>NJ</i></> },
              { k: "Credentials", v: <>Assoc. AIA · <i>LEED GA</i></> },
            ].map((cell, i) => (
              <div key={cell.k} className={`py-4 pr-4.5 ${i < 2 ? "border-r border-ink" : ""}`}>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-60">{cell.k}</div>
                <div className="font-serif text-2xl leading-[1.1] mt-1.5 tracking-tight">{cell.v}</div>
              </div>
            ))}
          </div>

          {/* Contact buttons */}
          <div className="mt-10 flex flex-wrap gap-4">
            {[
              { label: "TikTok", href: "https://www.tiktok.com/@tiktokarchitect" },
              { label: "Instagram", href: "https://www.instagram.com/greenstoriesllc" },
              { label: "YouTube", href: "https://www.youtube.com/@TikTokArchitect" },
              { label: "IAmThe@TikTokArchitect.com", href: "mailto:IAmThe@TikTokArchitect.com" },
              { label: "greenstoriesllc.com", href: "https://greenstoriesllc.com" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="inline-flex items-center gap-2.5 py-3 px-4.5 border-[1.5px] border-ink font-mono text-[11px] tracking-[0.16em] uppercase no-underline text-ink hover:bg-ink hover:text-bone transition-colors duration-150"
              >
                <span>{link.label}</span>
                <span className="opacity-70">↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="titleblock">
        <div><span className="k">Drawing</span><span className="v">Bio</span></div>
        <div><span className="k">Sheet</span><span className="v">A-007</span></div>
        <div><span className="k">Of</span><span className="v">09</span></div>
        <div><span className="k">Date</span><span className="v">Issue 01</span></div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Delete About.tsx**

Run: `rm src/components/About.tsx`

- [ ] **Step 3: Commit**

```bash
git add src/components/Bio.tsx
git rm src/components/About.tsx
git commit -m "feat: bio section — bone ground, real copy, brutalist contact buttons"
```

---

## Task 11: LinkHub Section

**Files:**
- Rewrite: `src/components/LinkHub.tsx`

- [ ] **Step 1: Rewrite LinkHub.tsx**

```tsx
const LINKS = [
  {
    category: "Work",
    items: [
      { label: "Green Stories LLC", description: "Building design & consulting", url: "https://greenstoriesllc.com" },
      { label: "BLKBRY Studios", description: "Architecture & design, Newark NJ", url: "https://www.blkbrystudios.com" },
      { label: "NIA", description: "Black Architecture Archive", url: "https://nia.greenstoriesllc.com" },
    ],
  },
  {
    category: "Social",
    items: [
      { label: "TikTok", description: "@TikTokArchitect", url: "https://www.tiktok.com/@tiktokarchitect" },
      { label: "YouTube", description: "@TikTokArchitect", url: "https://www.youtube.com/@TikTokArchitect" },
      { label: "Instagram", description: "@greenstoriesllc", url: "https://www.instagram.com/greenstoriesllc" },
      { label: "LinkedIn", description: "Tom Reynolds", url: "https://www.linkedin.com/in/tlreynolds/" },
      { label: "Snapchat", description: "@randomtom83", url: "https://www.snapchat.com/@randomtom83" },
    ],
  },
  {
    category: "Connect",
    items: [
      { label: "Phone", description: "(917) 272-3536", url: "tel:+19172723536" },
      { label: "Email", description: "IAmThe@TikTokArchitect.com", url: "mailto:IAmThe@TikTokArchitect.com" },
      { label: "Linq", description: "Digital business card", url: "https://linqapp.com/ThomasLReynolds" },
      { label: "Venmo", description: "@ThomasLReynolds", url: "https://account.venmo.com/u/ThomasLReynolds" },
    ],
  },
  {
    category: "Tools I Use",
    items: [
      { label: "Fieldy", description: "AI notetaker — discount code", url: "https://fieldlabsinc.sjv.io/c/6409508/3068775/30711" },
      { label: "Linq", description: "Digital card — 15% off", url: "https://buy.linqapp.com/discount/thomas_reynolds_af6_15?redirect=%2F%3Fafmc%3Dthomas_reynolds_af6_15&r=amb_copy" },
    ],
  },
];

export default function LinkHub() {
  return (
    <section className="sheet bg-ink-soft text-bone" id="links">
      <span className="coord coord-tl">A · 08 · 01</span>
      <span className="coord coord-tr">Find Me Everywhere</span>
      <span className="coord coord-bl">All Platforms</span>
      <span className="coord coord-br">Sheet A-008</span>

      <div className="chapter-mark">
        <span className="num">§08</span>
        <span>Links · Find Me Everywhere</span>
        <span className="bar" />
        <span>A-008</span>
      </div>

      <div className="relative z-[2] pt-4">
        <h2
          className="font-serif font-light leading-[0.9] tracking-[-0.04em] m-0 mb-16"
          style={{ fontSize: "clamp(64px, 9vw, 140px)" }}
        >
          Find me <i className="italic font-normal text-orange">everywhere.</i>
        </h2>

        <div className="space-y-12">
          {LINKS.map((group) => (
            <div key={group.category}>
              <h3 className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 mb-4 pb-2 border-b border-bone/20">
                {group.category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target={link.url.startsWith("mailto:") || link.url.startsWith("tel:") ? undefined : "_blank"}
                    rel={link.url.startsWith("mailto:") || link.url.startsWith("tel:") ? undefined : "noopener noreferrer"}
                    className="flex items-center justify-between gap-4 py-4 px-5 border-[1.5px] border-bone/30 no-underline text-bone bg-transparent hover:bg-ink hover:border-orange hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[3px_3px_0_var(--orange)] transition-all duration-200"
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-xs font-bold tracking-[0.12em] uppercase">{link.label}</div>
                      <div className="font-mono text-[10px] tracking-[0.08em] opacity-60 truncate mt-0.5">{link.description}</div>
                    </div>
                    <span className="font-mono text-lg opacity-50 shrink-0">↗</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="titleblock">
        <div><span className="k">Drawing</span><span className="v">Links</span></div>
        <div><span className="k">Sheet</span><span className="v">A-008</span></div>
        <div><span className="k">Type</span><span className="v">Directory</span></div>
        <div><span className="k">Date</span><span className="v">Issue 01</span></div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LinkHub.tsx
git commit -m "feat: link hub — brutalist directory with all real links and URLs"
```

---

## Task 12: Footer / Colophon

**Files:**
- Rewrite: `src/components/Footer.tsx`

- [ ] **Step 1: Rewrite Footer.tsx**

```tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink text-bone px-10 pt-14 pb-10 border-t border-bone/20 relative">
      {/* 4-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 font-mono text-[11px] tracking-[0.14em] uppercase mb-10">
        <div>
          <h5 className="font-mono text-[10px] opacity-50 m-0 mb-3 font-medium">Drawing Set</h5>
          <div className="leading-loose opacity-85">
            A-000 · Cover<br />
            A-001 · Vitals<br />
            A-002 · Tools<br />
            A-003 · NIA<br />
            A-004 · The Game<br />
            A-005 · AnansiBuild<br />
            A-006 · Videos<br />
            A-007 · Bio<br />
            A-008 · Links
          </div>
        </div>
        <div>
          <h5 className="font-mono text-[10px] opacity-50 m-0 mb-3 font-medium">Work</h5>
          <a href="#tools" className="block no-underline opacity-85 mb-2 hover:text-orange transition-colors">Tools</a>
          <a href="#game" className="block no-underline opacity-85 mb-2 hover:text-orange transition-colors">The Game</a>
          <a href="#nia" className="block no-underline opacity-85 mb-2 hover:text-orange transition-colors">Archive</a>
          <a href="#anansi" className="block no-underline opacity-85 mb-2 hover:text-orange transition-colors">AnansiBuild</a>
        </div>
        <div>
          <h5 className="font-mono text-[10px] opacity-50 m-0 mb-3 font-medium">Find</h5>
          <a href="https://www.tiktok.com/@tiktokarchitect" target="_blank" rel="noopener noreferrer" className="block no-underline opacity-85 mb-2 hover:text-orange transition-colors">TikTok ↗</a>
          <a href="https://www.instagram.com/greenstoriesllc" target="_blank" rel="noopener noreferrer" className="block no-underline opacity-85 mb-2 hover:text-orange transition-colors">Instagram ↗</a>
          <a href="https://www.youtube.com/@TikTokArchitect" target="_blank" rel="noopener noreferrer" className="block no-underline opacity-85 mb-2 hover:text-orange transition-colors">YouTube ↗</a>
        </div>
        <div>
          <h5 className="font-mono text-[10px] opacity-50 m-0 mb-3 font-medium">Contact</h5>
          <a href="mailto:IAmThe@TikTokArchitect.com" className="block no-underline opacity-85 mb-2 hover:text-orange transition-colors">IAmThe@<br />TikTokArchitect.com</a>
          <a href="https://greenstoriesllc.com" target="_blank" rel="noopener noreferrer" className="block no-underline opacity-85 mb-2 hover:text-orange transition-colors">greenstoriesllc.com ↗</a>
        </div>
      </div>

      {/* Legal links */}
      <div className="flex gap-6 font-mono text-[10px] tracking-[0.14em] uppercase opacity-50 mb-6">
        <Link href="/privacy/" className="no-underline hover:text-orange hover:opacity-100 transition-colors">Privacy</Link>
        <Link href="/terms/" className="no-underline hover:text-orange hover:opacity-100 transition-colors">Terms</Link>
      </div>

      {/* Giant mark */}
      <h2
        className="font-serif font-light leading-[0.85] tracking-[-0.05em] m-0 border-t border-bone/20 pt-6"
        style={{ fontSize: "clamp(80px, 14vw, 200px)" }}
      >
        Tom <i className="italic text-orange">Reynolds.</i>
      </h2>

      <div className="mt-4 flex flex-wrap justify-between font-mono text-[10px] tracking-[0.18em] uppercase opacity-55">
        <span>© Green Stories LLC · Newark, NJ</span>
        <span>Drawing Set A-001 · Issue 01 · Rev 01</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "feat: footer colophon with drawing set index"
```

---

## Task 13: Assemble Page and Clean Up

**Files:**
- Modify: `src/app/page.tsx`
- Delete: `src/components/Hero.tsx`
- Delete: `src/components/About.tsx` (if not already deleted in Task 10)

- [ ] **Step 1: Rewrite page.tsx**

```tsx
import Nav from "@/components/Nav";
import Cover from "@/components/Cover";
import Vitals from "@/components/Vitals";
import ToolsSection from "@/components/ToolsSection";
import NIASection from "@/components/NIASection";
import GameSection from "@/components/GameSection";
import AnansiBuildSection from "@/components/AnansiBuildSection";
import FeaturedVideos from "@/components/FeaturedVideos";
import Bio from "@/components/Bio";
import LinkHub from "@/components/LinkHub";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <Cover />
      <Vitals />
      <ToolsSection />
      <NIASection />
      <GameSection />
      <AnansiBuildSection />
      <FeaturedVideos />
      <Bio />
      <LinkHub />
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Delete old components**

Run:
```bash
rm src/components/Hero.tsx src/components/About.tsx 2>/dev/null; echo "done"
```

- [ ] **Step 3: Verify build compiles**

Run: `npm run build`
Expected: Build completes without errors.

- [ ] **Step 4: Verify dev server renders all sections**

Run: `npm run dev`
Check: All 10 sections render, scroll through each. Verify:
- Cover shows portrait with giant "TIKTOK the ARCHITECT" and Newark, NJ
- Vitals shows 2% on orange with correct credentials (Associate AIA, not licensed)
- Tools shows blueprint cyan with app cards
- NIA shows green with real archive copy
- Game shows yellow with phone mock
- AnansiBuild shows concrete with real Revit details
- Videos shows TikTok embeds
- Bio shows bone/paper with full real bio copy
- LinkHub shows all links
- Footer shows colophon with IAmThe@TikTokArchitect.com

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git rm src/components/Hero.tsx 2>/dev/null
git commit -m "feat: assemble brutalist redesign — all sections wired up"
```

---

## Task 14: Responsive Polish and Final Tweaks

**Files:**
- Modify: `src/app/globals.css` (add responsive rules if needed)
- Modify: Various components for mobile edge cases

- [ ] **Step 1: Test at 960px and 640px breakpoints**

Run: `npm run dev`, resize browser to 960px and 640px.

Check for:
- Title blocks repositioning to static on mobile
- Grids collapsing to single column
- Giant type sizes scaling down
- Phone mock not overflowing
- Nav hamburger working
- No horizontal scroll

- [ ] **Step 2: Fix any overflow or layout issues found**

Apply fixes directly to the affected components. Common fixes:
- Add `overflow-hidden` to sections with giant text
- Reduce font-size clamp minimums if they overflow
- Ensure game CTA min-width is responsive (`min-w-[360px]` → `min-w-0 sm:min-w-[360px]`)

- [ ] **Step 3: Final build check**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: responsive polish for mobile breakpoints"
```
