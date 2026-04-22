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

/** Normalize old-format JSON to the new AnalyticsData schema */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(raw: any, accountId: string): AnalyticsData {
  // If the data already has `account`, it's the new format — pass through
  if (raw.account && raw.headline_signal) return raw as AnalyticsData;

  // Old format: adapt to new schema with safe defaults
  const o = raw.overview || {};
  return {
    account: {
      handle: `@${accountId}`,
      display_name: "Tom Reynolds",
      followers: 0,
      following: 0,
      updated_at: raw.generated_at || new Date().toISOString(),
    },
    overview: {
      date_range: o.date_range || { start: null, end: null },
      videos: o.total_videos || 0,
      views: o.total_views || 0,
      likes: o.total_likes || 0,
      comments: o.total_comments || 0,
      shares: 0,
      engagement_rate: o.engagement_rate || 0,
      new_followers: 0,
      follower_conversion_rate: 0,
    },
    headline_signal: {
      best_performing_cluster_id: null,
      verdict: "MEH",
      rec_title: "Waiting for pipeline data",
      rec_reason: "The analytics pipeline hasn't run yet. Once it does, you'll see a specific recommendation here based on your content clusters, audience questions, and trending architecture topics.",
      rec_confidence: 0,
    },
    videos: (raw.videos || []).map((v: Record<string, unknown>) => ({
      id: v.id || "",
      title: v.title || "",
      description: v.description || "",
      date: v.date || null,
      duration: (v.duration as number) || 0,
      views: (v.views as number) || 0,
      likes: (v.likes as number) || 0,
      comments: (v.comments as number) || 0,
      shares: (v.shares as number) || 0,
      engagement_rate: (v.engagement as number) || 0,
      sentiment: (v.sentiment as { positive: number; neutral: number; negative: number }) || { positive: 0, neutral: 0, negative: 0 },
      url: (v.url as string) || "",
      has_transcript: !!v.has_transcript,
      cluster: null,
      style: null,
      watch_through: null,
      follower_conversion: null,
    })),
    timeline: (raw.timeline || []).map((t: Record<string, unknown>) => ({
      month: t.month || "",
      videos: (t.videos as number) || 0,
      views: (t.views as number) || 0,
      likes: (t.likes as number) || 0,
      comments: 0,
      new_followers: 0,
    })),
    duration_analysis: Object.entries(raw.duration_analysis || {}).map(([bucket, v]) => ({
      bucket,
      count: ((v as Record<string, number>).count) || 0,
      avg_views: 0,
      avg_engagement: ((v as Record<string, number>).avg_engagement) || 0,
      avg_watch_through: null,
    })),
    sentiment: raw.sentiment || { positive: 0, neutral: 0, negative: 0 },
    audience: {
      inferred_segments: [],
      lurker_to_fan: {},
      questions: (raw.audience?.questions || []).map((q: string | Record<string, unknown>) =>
        typeof q === "string" ? { text: q, count: 1, cluster: "" } : q
      ),
      requests: (raw.audience?.requests || []).map((r: string | Record<string, unknown>) =>
        typeof r === "string" ? { text: r, count: 1 } : r
      ),
    },
    top_commenters: (raw.top_commenters || []).map((c: Record<string, unknown>) => ({
      handle: `@${c.author || "unknown"}`,
      comments: (c.count as number) || 0,
      sentiment: 0.7,
    })),
    content_clusters: [],
    topic_engagement_matrix: (raw.topic_engagement_matrix || []).map((r: Record<string, unknown>) => ({
      topic: (r.topic as string) || (r.video_theme as string) || "",
      views_idx: (r.views_idx as number) || 0,
      likes_idx: (r.likes_idx as number) || 0,
      comments_idx: (r.comments_idx as number) || 0,
    })),
    presentation_styles: [],
    audience_conversation_themes: [],
    external_trends: [],
  };
}

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
        setData(normalize(json, account.id));
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
