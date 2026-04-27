"use client";

import React from "react";

// ─── Design Tokens ──────────────────────────────────────────────

export const TOKENS = {
  light: {
    bg: '#f5f1ea',
    bgRaised: '#faf7f1',
    bgSunk: '#ece7dc',
    ink: '#201c17',
    inkMuted: '#6a6055',
    inkSubtle: '#9a9084',
    rule: '#d9d1c2',
    ruleSoft: '#e6dfd1',
    accent: '#b15a3c',
    accentSoft: '#f2d9cc',
    good: '#5a7a4a',
    meh: '#a68b3a',
    bad: '#9a4a3c',
  },
  dark: {
    bg: '#16130f',
    bgRaised: '#1d1a14',
    bgSunk: '#100e0a',
    ink: '#e8e2d4',
    inkMuted: '#9a9084',
    inkSubtle: '#6a6055',
    rule: '#342e24',
    ruleSoft: '#24201a',
    accent: '#d17a58',
    accentSoft: '#3a2519',
    good: '#8ba976',
    meh: '#c9a95b',
    bad: '#c47563',
  },
};

export type Theme = typeof TOKENS.light;

export const FONTS = {
  display: '"Fraunces", Georgia, serif',
  sans: '"Archivo", system-ui, -apple-system, sans-serif',
  mono: '"JetBrains Mono", "Menlo", ui-monospace, monospace',
};

// ─── Verdict Logic ──────────────────────────────────────────────

export function verdict(v: string): { label: string; kind: 'good' | 'meh' | 'bad' } {
  if (v === 'STRONG' || v === 'good' || v === 'up') return { label: 'LOAD-BEARING', kind: 'good' };
  if (v === 'MEH' || v === 'meh' || v === 'steady') return { label: 'HOLDING', kind: 'meh' };
  if (v === 'NOISE' || v === 'bad' || v === 'down') return { label: 'SETTLING', kind: 'bad' };
  return { label: '—', kind: 'meh' };
}

// ─── Formatters ─────────────────────────────────────────────────

export function fmt(n: number | null | undefined): string {
  if (n == null) return '—';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(n >= 10000 ? 0 : 1) + 'k';
  return n.toLocaleString();
}

export function pct(n: number | null | undefined, digits = 1): string {
  if (n == null) return '—';
  return (n * 100).toFixed(digits) + '%';
}

// ─── Density ────────────────────────────────────────────────────

export const DENSITY = {
  compact: { pad: 0.72, gap: 0.72, type: 0.92, row: 0.68 },
  comfortable: { pad: 1.00, gap: 1.00, type: 1.00, row: 1.00 },
  spacious: { pad: 1.30, gap: 1.35, type: 1.08, row: 1.28 },
};

export type Density = typeof DENSITY.comfortable;
export type DensityKey = keyof typeof DENSITY;

export function densityOf(key: DensityKey): Density {
  return DENSITY[key] || DENSITY.comfortable;
}

// ─── Shared Primitives ──────────────────────────────────────────

export function StatNumber({ value, unit, t, size = 48 }: {
  value: string | number; unit?: string; t: Theme; size?: number;
}) {
  return React.createElement('span', {
    style: {
      fontFamily: FONTS.display, fontWeight: 500, fontSize: size,
      letterSpacing: -1, lineHeight: 1, color: t.ink,
      fontVariantNumeric: 'tabular-nums',
    },
  },
    value,
    unit ? React.createElement('span', {
      style: { fontSize: size * 0.45, color: t.inkMuted, marginLeft: 3 },
    }, unit) : null,
  );
}

export function VerdictPill({ kind, label, t, size = 11 }: {
  kind: 'good' | 'meh' | 'bad'; label: string; t: Theme; size?: number;
}) {
  const color = kind === 'good' ? t.good : kind === 'bad' ? t.bad : t.meh;
  return React.createElement('span', {
    style: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: FONTS.mono, fontSize: size, fontWeight: 500,
      color, letterSpacing: 0.5, textTransform: 'uppercase' as const,
    },
  },
    React.createElement('span', {
      style: { width: 6, height: 6, borderRadius: 3, background: color },
    }),
    label,
  );
}

export function Rule({ t, dashed, style }: {
  t: Theme; dashed?: boolean; style?: React.CSSProperties;
}) {
  return React.createElement('div', {
    style: {
      height: 1,
      background: dashed ? 'transparent' : t.rule,
      borderTop: dashed ? `1px dashed ${t.rule}` : 'none',
      ...style,
    },
  });
}

export function Label({ children, t, style }: {
  children: React.ReactNode; t: Theme; style?: React.CSSProperties;
}) {
  return React.createElement('div', {
    style: {
      fontFamily: FONTS.mono, fontSize: 10, letterSpacing: 1.4,
      textTransform: 'uppercase' as const, color: t.inkSubtle, ...style,
    },
  }, children);
}

export function SectionHeader({ num, title, note, t }: {
  num: string; title: string; note?: string; t: Theme;
}) {
  return React.createElement('div', {
    style: { display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18 },
  },
    React.createElement('span', {
      style: { fontFamily: FONTS.mono, fontSize: 11, color: t.inkSubtle, letterSpacing: 1 },
    }, `§${num}`),
    React.createElement('span', {
      style: { fontFamily: FONTS.display, fontSize: 22, fontWeight: 500, color: t.ink, letterSpacing: -0.3 },
    }, title),
    note ? React.createElement('span', {
      style: { fontFamily: FONTS.sans, fontSize: 13, color: t.inkMuted, marginLeft: 'auto' },
    }, note) : null,
  );
}

export function Bar({ value, max, color, t, height = 6 }: {
  value: number; max: number; color?: string; t: Theme; height?: number;
}) {
  const w = Math.max(2, (value / max) * 100);
  return React.createElement('div', {
    style: { width: '100%', height, background: t.ruleSoft, borderRadius: 0, position: 'relative' as const },
  },
    React.createElement('div', {
      style: { width: `${w}%`, height: '100%', background: color || t.accent },
    }),
  );
}

export function Spark({ values, t, color, width = 80, height = 28 }: {
  values: number[]; t: Theme; color?: string; width?: number; height?: number;
}) {
  if (!values || !values.length) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return React.createElement('svg', { width, height, style: { display: 'block' } },
    React.createElement('polyline', {
      points: pts, fill: 'none', stroke: color || t.accent,
      strokeWidth: '1.5', strokeLinejoin: 'round', strokeLinecap: 'round',
    }),
  );
}

// ─── Data Types ─────────────────────────────────────────────────

export interface AnalyticsData {
  account: {
    handle: string;
    display_name: string;
    followers: number;
    following: number;
    updated_at: string;
  };
  overview: {
    date_range: { start: string | null; end: string | null };
    videos: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement_rate: number;
    new_followers: number;
    follower_conversion_rate: number;
  };
  headline_signal: {
    best_performing_cluster_id: string | null;
    verdict: string;
    rec_title: string;
    rec_reason: string;
    rec_confidence: number;
    talking_points?: string[];
    reference_urls?: Array<{ title: string; url: string; source: string }>;
    suggested_format?: string;
    suggested_length?: string;
  };
  videos: Array<{
    id: string;
    title: string;
    description: string;
    date: string | null;
    duration: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement_rate: number;
    sentiment: { positive: number; neutral: number; negative: number };
    url: string;
    has_transcript: boolean;
    cluster: string | null;
    style: string | null;
    watch_through: number | null;
    follower_conversion: number | null;
  }>;
  timeline: Array<{
    month: string;
    videos: number;
    views: number;
    likes: number;
    comments: number;
    new_followers: number;
  }>;
  duration_analysis: Array<{
    bucket: string;
    count: number;
    avg_views: number;
    avg_engagement: number;
    avg_watch_through: number | null;
  }>;
  sentiment: { positive: number; neutral: number; negative: number };
  audience: {
    inferred_segments: Array<{
      id: string;
      label: string;
      pct: number;
      engaged_pct: number;
      cities: string[];
    }>;
    lurker_to_fan: Record<string, number>;
    questions: Array<{ text: string; count: number; cluster: string }>;
    requests: Array<{ text: string; count: number }>;
  };
  top_commenters: Array<{
    handle: string;
    comments: number;
    sentiment: number;
    note?: string;
  }>;
  content_clusters: Array<{
    id: string;
    label: string;
    video_count: number;
    share_of_views: number;
    avg_follower_conversion: number;
    avg_engagement: number;
    trend: string;
    verdict: string;
  }>;
  topic_engagement_matrix: Array<{
    topic: string;
    views_idx: number;
    likes_idx: number;
    comments_idx: number;
  }>;
  presentation_styles: Array<{
    style: string;
    video_count: number;
    avg_engagement: number;
    avg_follower_conversion: number;
    verdict: string;
  }>;
  audience_conversation_themes: Array<{
    theme: string;
    comment_count: number;
    trend: string;
  }>;
  external_trends: Array<{
    topic: string;
    audience_resonance: number;
    source: string;
  }>;
}
