"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface Video {
  id: string;
  title: string;
  description: string;
  date: string | null;
  duration: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagement: number;
  url: string;
  has_transcript: boolean;
  sentiment: { positive: number; negative: number; neutral: number };
}

interface AnalyticsData {
  generated_at: string;
  overview: {
    total_videos: number;
    total_views: number;
    total_likes: number;
    total_comments: number;
    engagement_rate: number;
    transcribed: number;
    date_range: { first: string | null; last: string | null };
  };
  videos: Video[];
  timeline: { month: string; videos: number; views: number; likes: number }[];
  duration_analysis: Record<string, { count: number; avg_engagement: number }>;
  sentiment: { positive: number; negative: number; neutral: number };
  audience: {
    questions: string[];
    requests: string[];
    total_questions: number;
    total_requests: number;
  };
  top_commenters: { author: string; count: number; total_likes: number }[];
  signals: { type: string; message: string; action: string }[];
  comment_topics?: {
    id: number; name: string; keywords: string[]; comment_count: number;
    question_count: number; avg_likes: number; video_spread: number; demand_score: number;
    sentiment: { positive: number; negative: number; neutral: number };
    sample_comments: string[]; sample_questions: string[];
    top_videos: { id: string; title: string; comments_in_topic: number }[];
  }[];
  content_opportunities?: {
    rank: number; topic: string; demand_score: number; signal: string; action: string;
    sample_questions: string[];
  }[];
  pain_points?: { theme: string; count: number; examples: string[]; opportunity: string }[];
  topic_engagement_matrix?: {
    video_theme: string; conversation_type: string; engagement_score: number;
    video_count: number; avg_comments_per_video: number; avg_comment_length: number;
    question_ratio: number; insight: string;
  }[];
  conversation_type_summary?: Record<string, { video_count: number; top_themes: string[]; action: string }>;
  cross_account?: { shared_commenters: number; shared_commenter_names: string[]; unique_to_architect: number; unique_to_randomtom: number };
}

type SortKey = "title" | "date" | "views" | "likes" | "comments" | "engagement" | "duration";
type SortDir = "asc" | "desc";

// ── Overview Cards ──────────────────────────────────────────────────

function OverviewCards({ data }: { data: AnalyticsData }) {
  const cards = [
    { label: "Videos", value: data.overview.total_videos.toLocaleString() },
    { label: "Total Views", value: data.overview.total_views.toLocaleString() },
    { label: "Total Likes", value: data.overview.total_likes.toLocaleString() },
    { label: "Comments", value: data.overview.total_comments.toLocaleString() },
    { label: "Engagement", value: `${data.overview.engagement_rate}%` },
    { label: "Transcribed", value: `${data.overview.transcribed}/${data.overview.total_videos}` },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
      {cards.map((c) => (
        <div key={c.label} className="p-4 rounded-xl bg-card border border-border text-center">
          <div className="text-2xl font-bold text-accent">{c.value}</div>
          <div className="text-xs text-muted mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Timeline Chart ──────────────────────────────────────────────────

function TimelineChart({ timeline }: { timeline: AnalyticsData["timeline"] }) {
  const [metric, setMetric] = useState<"videos" | "views" | "likes">("views");
  const [expandedYear, setExpandedYear] = useState<string | null>(null);

  // Group by year
  const years = useMemo(() => {
    const grouped: Record<string, typeof timeline> = {};
    timeline.forEach((t) => {
      const year = t.month.slice(0, 4);
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(t);
    });
    return Object.entries(grouped).map(([year, months]) => ({
      year,
      months,
      videos: months.reduce((s, m) => s + m.videos, 0),
      views: months.reduce((s, m) => s + m.views, 0),
      likes: months.reduce((s, m) => s + m.likes, 0),
    }));
  }, [timeline]);

  const maxYearVal = Math.max(...years.map((y) => y[metric]), 1);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Posting Timeline</h3>
        <div className="flex gap-2">
          {(["views", "likes", "videos"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                metric === m
                  ? "bg-accent text-white"
                  : "bg-card border border-border text-muted hover:text-foreground"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Yearly bars */}
      <div className="space-y-3">
        {years.map((y) => {
          const pct = (y[metric] / maxYearVal) * 100;
          const isExpanded = expandedYear === y.year;
          const maxMonthVal = Math.max(...y.months.map((m) => m[metric]), 1);

          return (
            <div key={y.year}>
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setExpandedYear(isExpanded ? null : y.year)}
              >
                <div className="w-10 text-sm font-mono text-muted shrink-0">
                  {y.year}
                </div>
                <div className="flex-1 h-8 bg-card rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-accent/70 group-hover:bg-accent rounded-lg transition-all"
                    style={{ width: `${Math.max(pct, 1)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-xs font-semibold" style={{ color: pct > 40 ? 'white' : undefined }}>
                      {y[metric].toLocaleString()} {metric}
                    </span>
                  </div>
                </div>
                <div className="w-16 text-right text-xs text-muted shrink-0">
                  {y.videos} vids
                </div>
                <div className="text-xs text-muted shrink-0">
                  {isExpanded ? "▲" : "▼"}
                </div>
              </div>

              {/* Monthly breakdown */}
              {isExpanded && (
                <div className="ml-14 mt-2 space-y-1.5 pb-2">
                  {y.months.map((m) => {
                    const mPct = (m[metric] / maxMonthVal) * 100;
                    const monthName = new Date(m.month + "-01").toLocaleDateString("en-US", { month: "short" });
                    return (
                      <div key={m.month} className="flex items-center gap-2">
                        <div className="w-8 text-xs font-mono text-muted shrink-0">
                          {monthName}
                        </div>
                        <div className="flex-1 h-5 bg-card rounded overflow-hidden relative">
                          <div
                            className="h-full bg-accent/50 rounded"
                            style={{ width: `${Math.max(mPct, 1)}%` }}
                          />
                          <div className="absolute inset-0 flex items-center px-2">
                            <span className="text-[10px] text-muted">
                              {m[metric].toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="w-12 text-right text-[10px] text-muted shrink-0">
                          {m.videos} vids
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Duration Analysis ───────────────────────────────────────────────

function DurationAnalysis({ data }: { data: Record<string, { count: number; avg_engagement: number }> }) {
  const buckets = Object.entries(data);
  const maxEng = Math.max(...buckets.map(([, v]) => v.avg_engagement), 1);

  return (
    <div className="mb-12 p-6 rounded-xl bg-card border border-border">
      <h3 className="text-lg font-bold mb-4">Engagement by Video Length</h3>
      <div className="space-y-3">
        {buckets.map(([bucket, stats]) => (
          <div key={bucket} className="flex items-center gap-4">
            <div className="w-16 text-sm font-mono text-muted shrink-0">{bucket}</div>
            <div className="flex-1 h-6 bg-background-alt rounded overflow-hidden">
              <div
                className="h-full bg-accent/70 rounded"
                style={{ width: `${(stats.avg_engagement / maxEng) * 100}%` }}
              />
            </div>
            <div className="w-20 text-right text-sm">
              <span className="font-semibold">{stats.avg_engagement}%</span>
              <span className="text-muted text-xs ml-1">({stats.count})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Strategy Signals ────────────────────────────────────────────────

function StrategySignals({ signals }: { signals: AnalyticsData["signals"] }) {
  return (
    <div className="mb-12">
      <h3 className="text-lg font-bold mb-4">Strategy Signals</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {signals.map((s, i) => (
          <div key={i} className="p-5 rounded-xl bg-card border border-accent/20">
            <div className="text-sm text-foreground mb-2">{s.message}</div>
            <div className="text-xs text-accent font-semibold">{s.action}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sentiment Bar ───────────────────────────────────────────────────

function SentimentBar({ sentiment }: { sentiment: { positive: number; negative: number; neutral: number } }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-3 rounded-full overflow-hidden bg-background-alt flex">
        <div className="h-full bg-green-500" style={{ width: `${sentiment.positive}%` }} title={`Positive: ${sentiment.positive}%`} />
        <div className="h-full bg-gray-400" style={{ width: `${sentiment.neutral}%` }} title={`Neutral: ${sentiment.neutral}%`} />
        <div className="h-full bg-red-400" style={{ width: `${sentiment.negative}%` }} title={`Negative: ${sentiment.negative}%`} />
      </div>
      <span className="text-xs text-muted w-12 text-right">{sentiment.positive}%</span>
    </div>
  );
}

// ── Video Table ─────────────────────────────────────────────────────

function VideoTable({ videos }: { videos: Video[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const PER_PAGE = 25;

  const filtered = useMemo(() => {
    let result = videos;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) => (v.title || "").toLowerCase().includes(q) || (v.description || "").toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return result;
  }, [videos, search, sortKey, sortDir]);

  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  }

  function exportCSV() {
    const headers = ["Title", "Date", "Views", "Likes", "Comments", "Engagement%", "Duration", "URL"];
    const rows = filtered.map((v) => [
      `"${(v.title || "").replace(/"/g, '""')}"`,
      v.date || "",
      v.views,
      v.likes,
      v.comments,
      v.engagement,
      v.duration,
      v.url,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tiktokarchitect_videos.csv";
    a.click();
  }

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      className="px-3 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
      onClick={() => toggleSort(field)}
    >
      {label} {sortKey === field ? (sortDir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="mb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-bold">Video Explorer</h3>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="px-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder-muted/50 focus:outline-none focus:border-accent w-48"
          />
          <button
            onClick={exportCSV}
            className="text-xs px-3 py-2 rounded-lg bg-card border border-border text-muted hover:text-foreground transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="text-xs text-muted mb-2">
        Showing {page * PER_PAGE + 1}-{Math.min((page + 1) * PER_PAGE, filtered.length)} of {filtered.length} videos
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full">
          <thead className="bg-card border-b border-border">
            <tr>
              <SortHeader label="Title" field="title" />
              <SortHeader label="Date" field="date" />
              <SortHeader label="Views" field="views" />
              <SortHeader label="Likes" field="likes" />
              <SortHeader label="Comments" field="comments" />
              <SortHeader label="Eng%" field="engagement" />
              <SortHeader label="Dur" field="duration" />
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                Sentiment
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.map((v) => (
              <>
                <tr
                  key={v.id}
                  className="border-b border-border-light hover:bg-card-hover cursor-pointer transition-colors"
                  onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                >
                  <td className="px-3 py-3 text-sm max-w-[250px] truncate">{v.title || v.id}</td>
                  <td className="px-3 py-3 text-sm text-muted font-mono">{v.date?.slice(0, 7) || "—"}</td>
                  <td className="px-3 py-3 text-sm text-right font-mono">{v.views.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-right font-mono">{v.likes.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-right font-mono">{v.comments.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-right font-mono text-accent">{v.engagement}%</td>
                  <td className="px-3 py-3 text-sm text-right font-mono text-muted">{v.duration}s</td>
                  <td className="px-3 py-3 w-28">
                    <SentimentBar sentiment={v.sentiment} />
                  </td>
                </tr>
                {expanded === v.id && (
                  <tr key={`${v.id}-detail`} className="bg-card">
                    <td colSpan={8} className="px-6 py-4">
                      <div className="text-sm space-y-2">
                        <div className="font-semibold">{v.title}</div>
                        <div className="text-muted text-xs">{v.description}</div>
                        <div className="flex gap-6 text-xs text-muted">
                          <span>Views: {v.views.toLocaleString()}</span>
                          <span>Likes: {v.likes.toLocaleString()}</span>
                          <span>Shares: {v.shares.toLocaleString()}</span>
                          <span>Duration: {v.duration}s</span>
                          <span>Transcript: {v.has_transcript ? "Yes" : "No"}</span>
                        </div>
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline text-sm"
                        >
                          Open on TikTok →
                        </a>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-xs rounded bg-card border border-border text-muted hover:text-foreground disabled:opacity-30 transition-colors"
          >
            Prev
          </button>
          <span className="text-xs text-muted">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-xs rounded bg-card border border-border text-muted hover:text-foreground disabled:opacity-30 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// ── Audience Insights ───────────────────────────────────────────────

function AudienceInsights({ data }: { data: AnalyticsData }) {
  const [tab, setTab] = useState<"questions" | "requests" | "commenters">("questions");

  return (
    <div className="mb-12">
      <h3 className="text-lg font-bold mb-4">Audience Insights</h3>
      <div className="flex gap-2 mb-4">
        {[
          { key: "questions" as const, label: `Questions (${data.audience.total_questions})` },
          { key: "requests" as const, label: `Requests (${data.audience.total_requests})` },
          { key: "commenters" as const, label: `Top Commenters (${data.top_commenters.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              tab === t.key
                ? "bg-accent text-white"
                : "bg-card border border-border text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 rounded-xl bg-card border border-border max-h-96 overflow-y-auto">
        {tab === "questions" && (
          <ul className="space-y-2">
            {data.audience.questions.map((q, i) => (
              <li key={i} className="text-sm text-foreground/80 py-1 border-b border-border-light last:border-0">
                {q}
              </li>
            ))}
          </ul>
        )}
        {tab === "requests" && (
          <ul className="space-y-2">
            {data.audience.requests.map((r, i) => (
              <li key={i} className="text-sm text-foreground/80 py-1 border-b border-border-light last:border-0">
                {r}
              </li>
            ))}
          </ul>
        )}
        {tab === "commenters" && (
          <div className="space-y-2">
            {data.top_commenters.map((c, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-border-light last:border-0">
                <span className="text-sm font-medium">{c.author}</span>
                <span className="text-xs text-muted">
                  {c.count} comments / {c.total_likes} likes
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Comment Topics ──────────────────────────────────────────────────

function CommentTopics({ topics }: { topics: NonNullable<AnalyticsData["comment_topics"]> }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div className="mb-12">
      <h3 className="text-lg font-bold mb-2">Comment Topics</h3>
      <p className="text-sm text-muted mb-4">What your audience talks about, clustered by theme. Higher demand score = create content about this.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((t) => (
          <div key={t.id}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${expanded === t.id ? "border-accent bg-card col-span-full" : "border-border bg-card hover:border-accent/30"}`}
            onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
            <div className="flex justify-between items-start mb-2">
              <div className="font-semibold text-sm">{t.name}</div>
              <span className="text-xs text-accent font-mono font-bold">{t.demand_score}</span>
            </div>
            <div className="flex gap-3 text-xs text-muted mb-2">
              <span>{t.comment_count} comments</span>
              <span>{t.question_count} questions</span>
              <span>{t.video_spread} videos</span>
            </div>
            <SentimentBar sentiment={t.sentiment} />
            <div className="flex flex-wrap gap-1 mt-2">
              {t.keywords.slice(0, 5).map((k) => (
                <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-background-alt text-muted">{k}</span>
              ))}
            </div>
            {expanded === t.id && (
              <div className="mt-4 border-t border-border pt-4 space-y-3">
                {t.sample_questions.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-accent mb-1">Questions Asked:</div>
                    {t.sample_questions.map((q, i) => (
                      <div key={i} className="text-xs text-muted py-1 border-b border-border-light last:border-0">{q}</div>
                    ))}
                  </div>
                )}
                <div>
                  <div className="text-xs font-semibold mb-1">Sample Comments:</div>
                  {t.sample_comments.slice(0, 4).map((c, i) => (
                    <div key={i} className="text-xs text-muted py-1 border-b border-border-light last:border-0">{c}</div>
                  ))}
                </div>
                {t.top_videos.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold mb-1">Top Videos:</div>
                    {t.top_videos.map((v) => (
                      <div key={v.id} className="text-xs text-muted py-0.5">{v.title} ({v.comments_in_topic} comments)</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Content Opportunities ───────────────────────────────────────────

function ContentOpportunities({ opportunities }: { opportunities: NonNullable<AnalyticsData["content_opportunities"]> }) {
  return (
    <div className="mb-12">
      <h3 className="text-lg font-bold mb-2">Content Opportunities</h3>
      <p className="text-sm text-muted mb-4">What to create next, ranked by audience demand.</p>
      <div className="space-y-3">
        {opportunities.map((o) => (
          <div key={o.rank} className="p-4 rounded-xl bg-card border border-accent/20 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">
              {o.rank}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm mb-1">{o.topic}</div>
              <div className="text-xs text-muted mb-1">{o.signal}</div>
              <div className="text-xs text-accent font-semibold">{o.action}</div>
              {o.sample_questions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {o.sample_questions.map((q, i) => (
                    <div key={i} className="text-[11px] text-muted/70 italic">&ldquo;{q}&rdquo;</div>
                  ))}
                </div>
              )}
            </div>
            <div className="shrink-0 text-right">
              <div className="text-lg font-bold text-accent">{o.demand_score}</div>
              <div className="text-[10px] text-muted">demand</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Engagement Matrix ───────────────────────────────────────────────

function EngagementMatrix({ matrix, summary }: { matrix: NonNullable<AnalyticsData["topic_engagement_matrix"]>; summary?: AnalyticsData["conversation_type_summary"] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const themes = [...new Set(matrix.map((m) => m.video_theme))];
  const convTypes = ["Learning", "Debate", "Praise", "Viral Reaction", "Community"];
  const maxEng = Math.max(...matrix.map((m) => m.engagement_score), 1);
  const getCell = (th: string, ct: string) => matrix.find((m) => m.video_theme === th && m.conversation_type === ct);

  return (
    <div className="mb-12">
      <h3 className="text-lg font-bold mb-2">Topic x Conversation Type</h3>
      <p className="text-sm text-muted mb-4">What you talk about vs. how audiences respond. Darker = higher engagement.</p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-xs">
          <thead><tr className="bg-card">
            <th className="p-2 text-left font-semibold text-muted">Video Theme</th>
            {convTypes.map((ct) => <th key={ct} className="p-2 text-center font-semibold text-muted">{ct}</th>)}
          </tr></thead>
          <tbody>
            {themes.map((th) => (
              <tr key={th} className="border-t border-border-light">
                <td className="p-2 font-medium max-w-[150px] truncate">{th}</td>
                {convTypes.map((ct) => {
                  const cell = getCell(th, ct);
                  const key = `${th}|||${ct}`;
                  if (!cell) return <td key={ct} className="p-2 text-center text-muted/30">-</td>;
                  const intensity = Math.min(cell.engagement_score / maxEng, 1);
                  return (
                    <td key={ct} className="p-2 text-center cursor-pointer hover:ring-1 hover:ring-accent"
                      style={{ background: `rgba(201, 169, 110, ${intensity * 0.4})` }}
                      onClick={() => setSelected(selected === key ? null : key)}>
                      <div className="font-bold">{cell.engagement_score}%</div>
                      <div className="text-[10px] text-muted">{cell.video_count} vids</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (() => {
        const [th, ct] = selected.split("|||");
        const cell = getCell(th, ct);
        if (!cell) return null;
        return (
          <div className="mt-3 p-4 rounded-xl bg-card border border-accent/20 text-sm">
            <div className="font-semibold mb-1">{cell.video_theme} x {cell.conversation_type}</div>
            <div className="text-xs text-muted mb-2">{cell.insight}</div>
            <div className="flex gap-4 text-xs text-muted">
              <span>{cell.avg_comments_per_video} comments/video</span>
              <span>Avg length: {cell.avg_comment_length} chars</span>
              <span>Questions: {Math.round(cell.question_ratio * 100)}%</span>
            </div>
          </div>
        );
      })()}
      {summary && Object.keys(summary).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {Object.entries(summary).map(([type, data]) => (
            <div key={type} className="p-3 rounded-xl bg-card border border-border">
              <div className="font-semibold text-sm text-accent mb-1">{type}</div>
              <div className="text-xs text-muted mb-1">{data.video_count} videos | Top: {data.top_themes.join(", ")}</div>
              <div className="text-xs text-accent/80 font-medium">{data.action}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Pain Points ─────────────────────────────────────────────────────

function PainPoints({ painPoints }: { painPoints: NonNullable<AnalyticsData["pain_points"]> }) {
  return (
    <div className="mb-12">
      <h3 className="text-lg font-bold mb-2">Audience Pain Points</h3>
      <p className="text-sm text-muted mb-4">What your audience is struggling with -- in their own words.</p>
      <div className="space-y-3">
        {painPoints.map((p, i) => (
          <div key={i} className="p-4 rounded-xl bg-card border border-border">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold text-sm">{p.theme}</div>
              <span className="text-xs text-muted">{p.count} mentions</span>
            </div>
            <div className="space-y-1 mb-2">
              {p.examples.slice(0, 3).map((ex, j) => (
                <div key={j} className="text-xs text-muted/80 italic pl-3 border-l-2 border-accent/30">&ldquo;{ex}&rdquo;</div>
              ))}
            </div>
            <div className="text-xs text-accent font-semibold">{p.opportunity}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── YouTube Upload Status ───────────────────────────────────────────

interface UploadStatus {
  generated_at: string;
  accounts: Record<string, {
    total_videos: number; uploaded: number; remaining: number; percentage: number;
    daily_average: number; days_to_complete: number | null; estimated_completion: string | null;
    recent_uploads: { video_id: string; youtube_id: string; youtube_url: string; tiktok_url: string; title: string; uploaded_at: string }[];
  }>;
  summary: {
    total_videos: number; total_uploaded: number; total_remaining: number; percentage: number;
    daily_average: number; days_to_complete: number | null; estimated_completion: string | null;
  };
  recent_uploads: { video_id: string; youtube_id: string; youtube_url: string; tiktok_url: string; title: string; uploaded_at: string; account: string }[];
  upload_timeline: { date: string; count: number }[];
}

function YouTubeUploadStatus() {
  const [status, setStatus] = useState<UploadStatus | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("/data/youtube_uploads.json")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStatus)
      .catch(() => {});
  }, []);

  if (!status) return null;

  const { summary, accounts, recent_uploads, upload_timeline } = status;
  const maxDaily = Math.max(...upload_timeline.map((d) => d.count), 1);

  return (
    <div className="mb-12">
      <h3 className="text-lg font-bold mb-2">YouTube Migration Progress</h3>
      <p className="text-sm text-muted mb-4">Automated daily uploads from TikTok to YouTube.</p>

      {/* Overall summary */}
      <div className="p-6 rounded-xl bg-card border border-accent/20 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-3xl font-bold text-accent">
              {summary.total_uploaded.toLocaleString()} / {summary.total_videos.toLocaleString()}
            </div>
            <div className="text-sm text-muted">videos uploaded ({summary.percentage}%)</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{summary.daily_average}/day</div>
            <div className="text-xs text-muted">average upload rate</div>
            {summary.estimated_completion && (
              <div className="text-xs text-accent mt-1">
                Est. complete: {new Date(summary.estimated_completion).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-background-alt rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent-dark rounded-full transition-all"
            style={{ width: `${summary.percentage}%` }}
          />
        </div>

        {/* Per-account breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {Object.entries(accounts).map(([name, a]) => (
            <div key={name} className="p-3 rounded-lg bg-background-alt">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold">@{name}</span>
                <span className="text-xs text-accent">{a.percentage}%</span>
              </div>
              <div className="text-xs text-muted mb-2">
                {a.uploaded.toLocaleString()} / {a.total_videos.toLocaleString()} uploaded
              </div>
              <div className="h-1.5 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${a.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline chart */}
      <div className="p-4 rounded-xl bg-card border border-border mb-4">
        <div className="text-xs text-muted mb-2">Last 30 Days</div>
        <div className="flex items-end gap-1 h-16">
          {upload_timeline.map((d) => {
            const h = (d.count / maxDaily) * 100;
            return (
              <div
                key={d.date}
                className="flex-1 group relative"
                title={`${d.date}: ${d.count} uploads`}
              >
                <div
                  className="w-full bg-accent/60 hover:bg-accent rounded-t transition-colors"
                  style={{ height: `${Math.max(h, 2)}%`, minHeight: 2 }}
                />
                {d.count > 0 && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] text-accent opacity-0 group-hover:opacity-100">
                    {d.count}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent uploads */}
      {recent_uploads.length > 0 && (
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-semibold">Recent Uploads</div>
            {recent_uploads.length > 5 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-xs text-accent hover:underline"
              >
                {showAll ? "Show less" : `Show all ${recent_uploads.length}`}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {(showAll ? recent_uploads : recent_uploads.slice(0, 5)).map((u) => (
              <div key={u.youtube_id} className="flex items-start gap-3 py-2 border-b border-border-light last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{u.title}</div>
                  <div className="text-xs text-muted">
                    @{u.account} · {new Date(u.uploaded_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </div>
                </div>
                <a
                  href={u.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1 rounded bg-accent/10 text-accent hover:bg-accent/20 transition-colors shrink-0"
                >
                  YouTube →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────

const ACCOUNTS = [
  { id: "tiktokarchitect", label: "@TikTokArchitect", file: "/data/analytics.json" },
  { id: "randomtom83", label: "@randomtom83", file: "/data/analytics-randomtom83.json" },
];

export default function AnalyticsPage() {
  const [accountId, setAccountId] = useState("tiktokarchitect");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const account = ACCOUNTS.find((a) => a.id === accountId) || ACCOUNTS[0];

  useEffect(() => {
    setLoading(true);
    setError(null);
    setData(null);
    fetch(account.file)
      .then((r) => {
        if (!r.ok) throw new Error(`No data for ${account.label}. Run the export script first.`);
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [accountId, account.file]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Dashboard Unavailable</h1>
          <p className="text-muted">{error}</p>
          <p className="text-muted text-sm mt-2">
            Run <code className="bg-card px-2 py-0.5 rounded">python export_dashboard_data.py</code> to generate the data.
          </p>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted">Loading {account.label} analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border-light">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between h-16">
          <div>
            <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors">
              ← Back to Site
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {ACCOUNTS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAccountId(a.id)}
                className={`text-sm px-4 py-1.5 rounded-lg font-semibold transition-colors ${
                  accountId === a.id
                    ? "bg-foreground text-background"
                    : "bg-card border border-border text-muted hover:text-foreground"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted">
            Updated: {new Date(data.generated_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12">
        {/* Overview */}
        <OverviewCards data={data} />

        {/* Sentiment overview */}
        <div className="mb-12 p-6 rounded-xl bg-card border border-border">
          <h3 className="text-lg font-bold mb-3">Overall Comment Sentiment</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SentimentBar sentiment={data.sentiment} />
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" /> {data.sentiment.positive}% positive
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400" /> {data.sentiment.neutral}% neutral
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400" /> {data.sentiment.negative}% negative
              </span>
            </div>
          </div>
        </div>

        {/* Strategy Signals */}
        {data.signals.length > 0 && <StrategySignals signals={data.signals} />}

        {/* Timeline */}
        {data.timeline.length > 0 && <TimelineChart timeline={data.timeline} />}

        {/* Duration Analysis */}
        {Object.keys(data.duration_analysis).length > 0 && (
          <DurationAnalysis data={data.duration_analysis} />
        )}

        {/* Video Table */}
        <VideoTable videos={data.videos} />

        {/* Audience Insights */}
        <AudienceInsights data={data} />

        {/* Comment Topics */}
        {data.comment_topics && data.comment_topics.length > 0 && (
          <CommentTopics topics={data.comment_topics} />
        )}

        {/* Content Opportunities */}
        {data.content_opportunities && data.content_opportunities.length > 0 && (
          <ContentOpportunities opportunities={data.content_opportunities} />
        )}

        {/* Topic × Conversation Matrix */}
        {data.topic_engagement_matrix && data.topic_engagement_matrix.length > 0 && (
          <EngagementMatrix matrix={data.topic_engagement_matrix} summary={data.conversation_type_summary} />
        )}

        {/* Pain Points */}
        {data.pain_points && data.pain_points.length > 0 && (
          <PainPoints painPoints={data.pain_points} />
        )}

        {/* YouTube Upload Status */}
        <YouTubeUploadStatus />

        {/* Cross-Account */}
        {data.cross_account && data.cross_account.shared_commenters > 0 && (
          <div className="mb-12 p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-bold mb-3">Cross-Account Audience</h3>
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <div className="text-2xl font-bold text-accent">{data.cross_account.shared_commenters}</div>
                <div className="text-xs text-muted">Shared Commenters</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{data.cross_account.unique_to_architect?.toLocaleString()}</div>
                <div className="text-xs text-muted">Only @TikTokArchitect</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{data.cross_account.unique_to_randomtom?.toLocaleString()}</div>
                <div className="text-xs text-muted">Only @randomtom83</div>
              </div>
            </div>
            <div className="text-xs text-muted">
              Shared: {data.cross_account.shared_commenter_names?.slice(0, 10).join(", ")}
              {(data.cross_account.shared_commenter_names?.length || 0) > 10 && "..."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
