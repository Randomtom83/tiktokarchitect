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
