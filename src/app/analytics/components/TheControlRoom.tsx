"use client";

import React from "react";
import {
  FONTS,
  verdict,
  fmt,
  pct,
  densityOf,
  VerdictPill,
  Label,
  Rule,
  SectionHeader,
  Bar,
  Spark,
  StatNumber,
  type Theme,
  type Density,
  type AnalyticsData,
} from "./tokens";

export default function TheControlRoom({
  data,
  t,
  d,
}: {
  data: AnalyticsData;
  t: Theme;
  d: Density;
}) {
  const h = data.headline_signal;
  const o = data.overview;
  const clusterMax = Math.max(
    ...data.content_clusters.map((c) => c.avg_follower_conversion),
    0.0001
  );
  const durMax = Math.max(
    ...data.duration_analysis.map((dur) => dur.avg_engagement),
    0.0001
  );
  const styleMax = Math.max(
    ...data.presentation_styles.map((s) => s.avg_follower_conversion),
    0.0001
  );
  const viewsByMonth = data.timeline.map((x) => x.views);
  const followersByMonth = data.timeline.map((x) => x.new_followers);

  // ── Dynamic stats strip ──────────────────────────────────────────
  const stats = [
    {
      label: "New followers",
      v: fmt(o.new_followers),
      kind: o.new_followers > 0 ? ("good" as const) : undefined,
    },
    {
      label: "Follower conversion",
      v: pct(o.follower_conversion_rate, 2),
      kind:
        o.follower_conversion_rate > 0.006
          ? ("good" as const)
          : o.follower_conversion_rate > 0.003
          ? ("meh" as const)
          : undefined,
    },
    {
      label: "Avg engagement",
      v: pct(o.engagement_rate),
      kind: o.engagement_rate > 0.08 ? ("good" as const) : ("meh" as const),
    },
    { label: "Videos posted", v: String(o.videos), kind: undefined },
    { label: "Views", v: fmt(o.views), kind: "good" as const },
  ];

  // ── Dynamic "Do this next" actions ───────────────────────────────
  const nextActions: Array<{ verb: string; text: string; kind: string }> = [];
  if (h.rec_title) {
    nextActions.push({ verb: "DOUBLE DOWN", text: h.rec_title, kind: "good" });
  }
  if ((data.audience?.questions?.length ?? 0) > 0) {
    const topQ = data.audience.questions[0];
    nextActions.push({
      verb: "ANSWER",
      text: `"${topQ.text}" (×${topQ.count})`,
      kind: "good",
    });
  }
  const mehCluster = data.content_clusters.find((c) => c.verdict === "MEH");
  if (mehCluster) {
    nextActions.push({
      verb: "TEST",
      text: `Try a new angle on ${mehCluster.label.toLowerCase()}.`,
      kind: "meh",
    });
  }
  const noiseCluster = data.content_clusters.find(
    (c) => c.verdict === "NOISE"
  );
  if (noiseCluster) {
    nextActions.push({
      verb: "SUNSET",
      text: `Pause ${noiseCluster.label.toLowerCase()} until a fresh angle.`,
      kind: "bad",
    });
  }

  // ── Local Card component ─────────────────────────────────────────
  const Card = ({
    title,
    meta,
    children,
    span = 1,
  }: {
    title: string;
    meta?: string;
    children: React.ReactNode;
    span?: number;
  }) => (
    <div
      style={{
        gridColumn: `span ${span}`,
        background: t.bgRaised,
        border: `1px solid ${t.rule}`,
        padding: 22 * d.pad,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 16 * d.gap,
          paddingBottom: 10 * d.gap,
          borderBottom: `1px solid ${t.ruleSoft}`,
        }}
      >
        <Label t={t}>{title}</Label>
        {meta && (
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 10,
              color: t.inkSubtle,
              letterSpacing: 0.5,
            }}
          >
            {meta}
          </span>
        )}
      </div>
      {children}
    </div>
  );

  return (
    <div
      style={{
        background: t.bg,
        color: t.ink,
        fontFamily: FONTS.sans,
        padding: 32 * d.pad,
        minHeight: "100%",
      }}
    >
      {/* ── Header bar ──────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: `1px solid ${t.rule}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <span
            style={{
              fontFamily: FONTS.display,
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: -0.4,
            }}
          >
            Control Room
          </span>
          <Label t={t}>{data.account.handle}</Label>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <Label t={t}>
            Updated ·{" "}
            {new Date(data.account.updated_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </Label>
          <Label t={t}>Last 90 days</Label>
        </div>
      </div>

      {/* ── Hero answer ─────────────────────────────────────────── */}
      <div
        style={{
          background: t.bgRaised,
          border: `1px solid ${t.rule}`,
          padding: `${32 * d.pad}px ${36 * d.pad}px`,
          marginBottom: 24 * d.gap,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 18,
          }}
        >
          <Label t={t}>Post this next</Label>
          <VerdictPill
            kind="good"
            label={`${Math.round((h.rec_confidence ?? 0) * 100)}% confidence`}
            t={t}
            size={11}
          />
        </div>
        <h1
          style={{
            fontFamily: FONTS.display,
            fontWeight: 400,
            fontSize: 38,
            lineHeight: 1.15,
            letterSpacing: -0.8,
            color: t.ink,
            margin: "0 0 14px",
          }}
        >
          {h.rec_title || "—"}
        </h1>
        <p
          style={{
            fontFamily: FONTS.sans,
            fontSize: 15,
            lineHeight: 1.55,
            color: t.inkMuted,
            margin: 0,
            maxWidth: 780,
          }}
        >
          {h.rec_reason || ""}
        </p>
      </div>

      {/* ── Stats strip ─────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
          gap: 1,
          background: t.rule,
          border: `1px solid ${t.rule}`,
          marginBottom: 24 * d.gap,
        }}
      >
        {stats.map((s) => {
          const color =
            s.kind === "good"
              ? t.good
              : s.kind === "meh"
              ? t.meh
              : s.kind === "bad"
              ? t.bad
              : t.ink;
          return (
            <div
              key={s.label}
              style={{
                background: t.bgRaised,
                padding: `${18 * d.pad}px ${20 * d.pad}px`,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <Label t={t}>{s.label}</Label>
              <span
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 28,
                  fontWeight: 500,
                  letterSpacing: -0.5,
                  lineHeight: 1,
                  color,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {s.v}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Main grid — 3 columns ───────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 1,
          background: t.rule,
          border: `1px solid ${t.rule}`,
          marginBottom: 24 * d.gap,
        }}
      >
        {/* Content clusters (span 2) */}
        <Card
          title="Content clusters"
          meta={`${data.content_clusters.length} clusters`}
          span={2}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 * d.gap }}>
            {data.content_clusters.map((c) => {
              const v = verdict(c.verdict);
              const color =
                v.kind === "good" ? t.good : v.kind === "bad" ? t.bad : t.meh;
              return (
                <div key={c.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                      <span
                        style={{
                          fontFamily: FONTS.sans,
                          fontSize: 13 * d.type,
                          color: t.ink,
                          fontWeight: 500,
                        }}
                      >
                        {c.label}
                      </span>
                      <span
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 10,
                          color: t.inkSubtle,
                          letterSpacing: 0.5,
                        }}
                      >
                        {c.video_count} videos
                      </span>
                    </div>
                    <VerdictPill kind={v.kind} label={v.label} t={t} size={10} />
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <Bar
                        value={c.avg_follower_conversion}
                        max={clusterMax}
                        color={color}
                        t={t}
                        height={5}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 11,
                        color: t.inkMuted,
                        minWidth: 48,
                        textAlign: "right",
                      }}
                    >
                      {pct(c.avg_follower_conversion, 2)} conv
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Trajectory card (span 1) */}
        <Card title="Trajectory" meta={`${data.timeline.length}mo`} span={1}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 * d.gap }}>
            <div>
              <Label t={t} style={{ marginBottom: 8 }}>
                Views
              </Label>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
                <Spark values={viewsByMonth} t={t} color={t.accent} width={100} height={36} />
                <div>
                  <StatNumber
                    value={fmt(o.views)}
                    t={t}
                    size={24}
                  />
                </div>
              </div>
            </div>
            <Rule t={t} dashed />
            <div>
              <Label t={t} style={{ marginBottom: 8 }}>
                New followers
              </Label>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
                <Spark
                  values={followersByMonth}
                  t={t}
                  color={t.good}
                  width={100}
                  height={36}
                />
                <div>
                  <StatNumber
                    value={fmt(o.new_followers)}
                    t={t}
                    size={24}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Second grid row ─────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 1,
          background: t.rule,
          border: `1px solid ${t.rule}`,
          marginBottom: 24 * d.gap,
        }}
      >
        {/* Duration analysis */}
        <Card
          title="Video length"
          meta={`${data.duration_analysis.length} buckets`}
          span={1}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 * d.gap }}>
            {data.duration_analysis.map((dur) => (
              <div key={dur.bucket}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 5,
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      color: t.inkMuted,
                      letterSpacing: 0.3,
                    }}
                  >
                    {dur.bucket}
                  </span>
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      color: t.inkSubtle,
                    }}
                  >
                    {pct(dur.avg_engagement)} eng
                  </span>
                </div>
                <Bar
                  value={dur.avg_engagement}
                  max={durMax}
                  color={t.accent}
                  t={t}
                  height={4}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Presentation styles */}
        <Card
          title="Presentation styles"
          meta={`${data.presentation_styles.length} styles`}
          span={1}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 * d.gap }}>
            {data.presentation_styles.map((s) => {
              const v = verdict(s.verdict);
              const color =
                v.kind === "good" ? t.good : v.kind === "bad" ? t.bad : t.meh;
              return (
                <div key={s.style}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 5,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONTS.sans,
                        fontSize: 12 * d.type,
                        color: t.ink,
                      }}
                    >
                      {s.style}
                    </span>
                    <VerdictPill kind={v.kind} label={v.label} t={t} size={9} />
                  </div>
                  <Bar
                    value={s.avg_follower_conversion}
                    max={styleMax}
                    color={color}
                    t={t}
                    height={4}
                  />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Audience segments */}
        <Card
          title="Audience segments"
          meta={`${data.audience?.inferred_segments?.length ?? 0} segments`}
          span={1}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 * d.gap }}>
            {(data.audience?.inferred_segments ?? []).map((seg) => (
              <div key={seg.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: 12 * d.type,
                      color: t.ink,
                      fontWeight: 500,
                    }}
                  >
                    {seg.label}
                  </span>
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      color: t.inkSubtle,
                    }}
                  >
                    {pct(seg.pct)} of audience
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Bar
                      value={seg.engaged_pct}
                      max={1}
                      color={t.good}
                      t={t}
                      height={4}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 10,
                      color: t.inkSubtle,
                      minWidth: 44,
                      textAlign: "right",
                    }}
                  >
                    {pct(seg.engaged_pct)} eng
                  </span>
                </div>
                {seg.cities?.length > 0 && (
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 10,
                      color: t.inkSubtle,
                      letterSpacing: 0.3,
                    }}
                  >
                    {seg.cities.slice(0, 3).join(" · ")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Third grid row ──────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 1,
          background: t.rule,
          border: `1px solid ${t.rule}`,
          marginBottom: 24 * d.gap,
        }}
      >
        {/* Questions */}
        <Card
          title="Audience questions"
          meta={`${data.audience?.questions?.length ?? 0} questions`}
          span={1}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {(data.audience?.questions ?? []).slice(0, 6).map((q, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: `${8 * d.gap}px 0`,
                  borderBottom:
                    i < Math.min((data.audience?.questions?.length ?? 0), 6) - 1
                      ? `1px solid ${t.ruleSoft}`
                      : "none",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 12 * d.type,
                    color: t.inkMuted,
                    lineHeight: 1.4,
                    flex: 1,
                  }}
                >
                  {q.text}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 10,
                    color: t.inkSubtle,
                    whiteSpace: "nowrap",
                  }}
                >
                  ×{q.count}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Requests */}
        <Card
          title="Content requests"
          meta={`${data.audience?.requests?.length ?? 0} requests`}
          span={1}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {(data.audience?.requests ?? []).slice(0, 6).map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: `${8 * d.gap}px 0`,
                  borderBottom:
                    i < Math.min((data.audience?.requests?.length ?? 0), 6) - 1
                      ? `1px solid ${t.ruleSoft}`
                      : "none",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 12 * d.type,
                    color: t.inkMuted,
                    lineHeight: 1.4,
                    flex: 1,
                  }}
                >
                  {r.text}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 10,
                    color: t.inkSubtle,
                    whiteSpace: "nowrap",
                  }}
                >
                  ×{r.count}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Do this next */}
        <Card title="Do this next" span={1}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 * d.gap }}>
            {nextActions.length === 0 && (
              <span
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 13,
                  color: t.inkSubtle,
                }}
              >
                No actions available.
              </span>
            )}
            {nextActions.map((action, i) => {
              const color =
                action.kind === "good"
                  ? t.good
                  : action.kind === "bad"
                  ? t.bad
                  : t.meh;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    paddingBottom: 12 * d.gap,
                    borderBottom:
                      i < nextActions.length - 1
                        ? `1px solid ${t.ruleSoft}`
                        : "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: 1,
                      color,
                      textTransform: "uppercase",
                      paddingTop: 2,
                      minWidth: 72,
                    }}
                  >
                    {action.verb}
                  </span>
                  <span
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: 13 * d.type,
                      color: t.inkMuted,
                      lineHeight: 1.45,
                      flex: 1,
                    }}
                  >
                    {action.text}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Conversation themes + external trends ───────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
          background: t.rule,
          border: `1px solid ${t.rule}`,
          marginBottom: 24 * d.gap,
        }}
      >
        {/* Audience conversation themes */}
        <Card
          title="Conversation themes"
          meta={`${data.audience_conversation_themes?.length ?? 0} themes`}
          span={1}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {(data.audience_conversation_themes ?? []).map((theme, i) => {
              const v = verdict(theme.trend);
              const color =
                v.kind === "good" ? t.good : v.kind === "bad" ? t.bad : t.meh;
              const total = data.audience_conversation_themes?.length ?? 1;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: `${8 * d.gap}px 0`,
                    borderBottom:
                      i < total - 1 ? `1px solid ${t.ruleSoft}` : "none",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 10,
                      flex: 1,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONTS.sans,
                        fontSize: 12 * d.type,
                        color: t.ink,
                      }}
                    >
                      {theme.theme}
                    </span>
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 10,
                        color: t.inkSubtle,
                      }}
                    >
                      {theme.comment_count} comments
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 9,
                      color,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    {v.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* External trends */}
        <Card
          title="External signals"
          meta={`${data.external_trends?.length ?? 0} trends`}
          span={1}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {(data.external_trends ?? []).map((trend, i) => {
              const total = data.external_trends?.length ?? 1;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    padding: `${8 * d.gap}px 0`,
                    borderBottom:
                      i < total - 1 ? `1px solid ${t.ruleSoft}` : "none",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        fontFamily: FONTS.sans,
                        fontSize: 12 * d.type,
                        color: t.ink,
                        display: "block",
                        marginBottom: 2,
                      }}
                    >
                      {trend.topic}
                    </span>
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 10,
                        color: t.inkSubtle,
                        letterSpacing: 0.3,
                      }}
                    >
                      {trend.source}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 13,
                        color: t.accent,
                        fontWeight: 500,
                      }}
                    >
                      {pct(trend.audience_resonance)}
                    </span>
                    <div
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 9,
                        color: t.inkSubtle,
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                      }}
                    >
                      resonance
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Topic engagement matrix ──────────────────────────────── */}
      {data.topic_engagement_matrix?.length > 0 && (
        <div
          style={{
            background: t.bgRaised,
            border: `1px solid ${t.rule}`,
            padding: 22 * d.pad,
            marginBottom: 24 * d.gap,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 16 * d.gap,
              paddingBottom: 10 * d.gap,
              borderBottom: `1px solid ${t.ruleSoft}`,
            }}
          >
            <Label t={t}>Topic engagement index</Label>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 * d.gap }}>
            {data.topic_engagement_matrix.map((row, i) => {
              const maxIdx = Math.max(
                row.views_idx,
                row.likes_idx,
                row.comments_idx
              );
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: `${6 * d.gap}px 0`,
                    borderBottom:
                      i < data.topic_engagement_matrix.length - 1
                        ? `1px solid ${t.ruleSoft}`
                        : "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: 12 * d.type,
                      color: t.ink,
                      minWidth: 140,
                      flexShrink: 0,
                    }}
                  >
                    {row.topic}
                  </span>
                  <div style={{ flex: 1, display: "flex", gap: 6 }}>
                    {[
                      { label: "Views", val: row.views_idx, color: t.accent },
                      { label: "Likes", val: row.likes_idx, color: t.good },
                      {
                        label: "Comments",
                        val: row.comments_idx,
                        color: t.meh,
                      },
                    ].map((col) => (
                      <div
                        key={col.label}
                        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}
                      >
                        <Bar
                          value={col.val}
                          max={Math.max(maxIdx, 1)}
                          color={col.color}
                          t={t}
                          height={5}
                        />
                        <span
                          style={{
                            fontFamily: FONTS.mono,
                            fontSize: 9,
                            color: t.inkSubtle,
                            letterSpacing: 0.3,
                          }}
                        >
                          {col.label} {col.val.toFixed(1)}×
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 16,
          borderTop: `1px solid ${t.ruleSoft}`,
        }}
      >
        <Label t={t}>{data.account.handle}</Label>
        <Label t={t}>
          {fmt(data.account.followers)} followers ·{" "}
          {o.videos} videos · {fmt(o.views)} views
        </Label>
      </div>
    </div>
  );
}
