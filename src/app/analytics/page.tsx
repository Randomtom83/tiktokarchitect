"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TOKENS, FONTS, DENSITY, densityOf, Label, type Theme, type DensityKey, type AnalyticsData } from "./components/tokens";
import TheBrief from "./components/TheBrief";
import TheControlRoom from "./components/TheControlRoom";
import TheDraftingTable from "./components/TheDraftingTable";

const ACCOUNTS = [
  { id: "tiktokarchitect", label: "@TikTokArchitect", file: "/data/analytics-tiktokarchitect.json" },
  { id: "randomtom83", label: "@randomtom83", file: "/data/analytics-randomtom83.json" },
];

type Variation = "drafting-table" | "brief" | "control-room";

const VARIATIONS: Array<{ id: Variation; label: string }> = [
  { id: "drafting-table", label: "Drafting Table" },
  { id: "brief", label: "Brief" },
  { id: "control-room", label: "Control Room" },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Persisted state
  const [accountId, setAccountId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ttka.account") || "tiktokarchitect";
    }
    return "tiktokarchitect";
  });
  const [variation, setVariation] = useState<Variation>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("ttka.variation") as Variation) || "drafting-table";
    }
    return "drafting-table";
  });
  const [mode, setMode] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("ttka.mode") as "light" | "dark") || "light";
    }
    return "light";
  });
  const [densityKey, setDensityKey] = useState<DensityKey>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("ttka.density") as DensityKey) || "comfortable";
    }
    return "comfortable";
  });
  const [showTweaks, setShowTweaks] = useState(false);

  const account = ACCOUNTS.find((a) => a.id === accountId) || ACCOUNTS[0];
  const t: Theme = TOKENS[mode];
  const d = densityOf(densityKey);

  // Fetch data when account changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(account.file)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${account.file}`);
        return r.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [account.file]);

  // Persist preferences
  useEffect(() => { localStorage.setItem("ttka.account", accountId); }, [accountId]);
  useEffect(() => { localStorage.setItem("ttka.variation", variation); }, [variation]);
  useEffect(() => { localStorage.setItem("ttka.mode", mode); }, [mode]);
  useEffect(() => { localStorage.setItem("ttka.density", densityKey); }, [densityKey]);

  // Loading state
  if (loading) {
    return (
      <div style={{
        background: t.bg, color: t.inkMuted, fontFamily: FONTS.sans,
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>
          Loading {account.label} analytics...
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div style={{
        background: t.bg, color: t.bad, fontFamily: FONTS.sans,
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 16,
      }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 12, letterSpacing: 1 }}>
          {error || "No data available"}
        </div>
        <Link href="/" style={{ fontFamily: FONTS.mono, fontSize: 11, color: t.accent }}>
          ← Back to site
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: t.bg, minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: `${12 * d.pad}px ${24 * d.pad}px`,
        borderBottom: `1px solid ${t.rule}`, background: t.bgRaised,
      }}>
        {/* Left: back link */}
        <Link href="/" style={{
          fontFamily: FONTS.mono, fontSize: 11, color: t.inkMuted,
          textDecoration: "none", letterSpacing: 0.5,
        }}>
          ← Back to Site
        </Link>

        {/* Center: account switcher + variation toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Account switcher */}
          <div style={{ display: "flex", gap: 0, border: `1px solid ${t.rule}` }}>
            {ACCOUNTS.map((acc) => (
              <button
                key={acc.id}
                onClick={() => setAccountId(acc.id)}
                style={{
                  fontFamily: FONTS.mono, fontSize: 11, letterSpacing: 0.5,
                  padding: "6px 14px", border: "none", cursor: "pointer",
                  background: acc.id === accountId ? t.ink : "transparent",
                  color: acc.id === accountId ? t.bg : t.inkMuted,
                  transition: "none",
                }}
              >
                {acc.label}
              </button>
            ))}
          </div>

          {/* Variation toggle */}
          <div style={{ display: "flex", gap: 0, border: `1px solid ${t.rule}` }}>
            {VARIATIONS.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariation(v.id)}
                style={{
                  fontFamily: FONTS.mono, fontSize: 10, letterSpacing: 0.8,
                  padding: "6px 12px", border: "none", cursor: "pointer",
                  textTransform: "uppercase",
                  background: v.id === variation ? t.accent : "transparent",
                  color: v.id === variation ? "#fff" : t.inkSubtle,
                  transition: "none",
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: tweaks + timestamp */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={() => setShowTweaks(!showTweaks)}
            style={{
              fontFamily: FONTS.mono, fontSize: 10, letterSpacing: 1,
              textTransform: "uppercase", padding: "5px 10px",
              border: `1px solid ${t.rule}`, background: "transparent",
              color: t.inkSubtle, cursor: "pointer",
            }}
          >
            Tweaks
          </button>
          <span style={{ fontFamily: FONTS.mono, fontSize: 10, color: t.inkSubtle, letterSpacing: 0.5 }}>
            {data.account?.updated_at
              ? new Date(data.account.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "—"}
          </span>
        </div>
      </div>

      {/* Tweaks panel */}
      {showTweaks && (
        <div style={{
          display: "flex", gap: 32, padding: `${12 * d.pad}px ${24 * d.pad}px`,
          borderBottom: `1px solid ${t.rule}`, background: t.bgSunk,
          alignItems: "center",
        }}>
          {/* Theme */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Label t={t}>Theme</Label>
            <div style={{ display: "flex", gap: 0, border: `1px solid ${t.rule}` }}>
              {(["light", "dark"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    fontFamily: FONTS.mono, fontSize: 10, padding: "4px 10px",
                    border: "none", cursor: "pointer", textTransform: "uppercase",
                    background: m === mode ? t.ink : "transparent",
                    color: m === mode ? t.bg : t.inkSubtle,
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Density */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Label t={t}>Density</Label>
            <div style={{ display: "flex", gap: 0, border: `1px solid ${t.rule}` }}>
              {(["compact", "comfortable", "spacious"] as const).map((dk) => (
                <button
                  key={dk}
                  onClick={() => setDensityKey(dk)}
                  style={{
                    fontFamily: FONTS.mono, fontSize: 10, padding: "4px 10px",
                    border: "none", cursor: "pointer", textTransform: "uppercase",
                    background: dk === densityKey ? t.ink : "transparent",
                    color: dk === densityKey ? t.bg : t.inkSubtle,
                  }}
                >
                  {dk}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active variation */}
      {variation === "drafting-table" && <TheDraftingTable data={data} t={t} d={d} />}
      {variation === "brief" && <TheBrief data={data} t={t} d={d} />}
      {variation === "control-room" && <TheControlRoom data={data} t={t} d={d} />}
    </div>
  );
}
