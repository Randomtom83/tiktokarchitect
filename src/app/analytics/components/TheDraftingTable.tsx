"use client";

import { FONTS, verdict, fmt, pct, densityOf, VerdictPill, Label, Rule, SectionHeader, Bar, StatNumber, type Theme, type Density, type AnalyticsData } from './tokens';

export default function TheDraftingTable({ data, t, d }: { data: AnalyticsData; t: Theme; d: Density }) {
  const h = data.headline_signal;
  const o = data.overview;
  const clusters = [...data.content_clusters].sort((a, b) => b.avg_follower_conversion - a.avg_follower_conversion);
  const clusterMax = Math.max(...clusters.map(c => c.avg_follower_conversion));
  const topVideos = [...data.videos].sort((a, b) => (b.follower_conversion || 0) - (a.follower_conversion || 0)).slice(0, 4);
  const themes = data.audience_conversation_themes || [];
  const themeMax = Math.max(...themes.map(x => x.comment_count), 1);

  const nextActions: Array<{ verb: string; text: string; kind: string }> = [];
  if (h.rec_title) {
    nextActions.push({ verb: 'DOUBLE DOWN', text: h.rec_title, kind: 'good' });
  }
  if ((data.audience?.questions?.length ?? 0) > 0) {
    const topQ = data.audience.questions[0];
    nextActions.push({ verb: 'ANSWER', text: `"${topQ.text}" — ${topQ.count} asks.`, kind: 'good' });
  }
  const mehTrend = (data.external_trends || []).find(t => t.audience_resonance > 0.7);
  if (mehTrend) {
    nextActions.push({ verb: 'TEST', text: `${mehTrend.topic}. External trend resonance: ${Math.round(mehTrend.audience_resonance * 100)}%.`, kind: 'meh' });
  }
  const noiseCluster = data.content_clusters.find(c => c.verdict === 'NOISE');
  if (noiseCluster) {
    nextActions.push({ verb: 'SUNSET', text: `Pause ${noiseCluster.label.toLowerCase()} until a fresh angle.`, kind: 'bad' });
  }

  return (
    <div style={{ background: t.bg, color: t.ink, fontFamily: FONTS.sans, minHeight: '100%', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 0 }}>
      {/* LEFT — main content */}
      <div style={{ padding: `${36 * d.pad}px ${44 * d.pad}px ${60 * d.pad}px`, borderRight: `1px solid ${t.rule}` }}>
        {/* Masthead */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontFamily: FONTS.display, fontSize: 20, fontWeight: 500, letterSpacing: -0.3 }}>The Drafting Table</span>
            <Label t={t}>{data.account.handle}</Label>
          </div>
          <Label t={t}>Updated · {new Date(data.account.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Label>
        </div>
        <Rule t={t} style={{ marginBottom: 40 * d.gap }} />

        {/* Stats row — DYNAMIC */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 * d.gap, marginBottom: 48 * d.gap }}>
          {[
            { label: 'Followers', v: fmt(data.account.followers), sub: `+${fmt(o.new_followers)} · 90d` },
            { label: 'Follower conversion', v: pct(o.follower_conversion_rate, 2), sub: 'of all views' },
            { label: 'Engagement', v: pct(o.engagement_rate), sub: 'avg per video' },
            { label: 'Videos', v: String(o.videos), sub: 'last 90d' },
          ].map((s, i) => (
            <div key={i} style={{ borderLeft: `2px solid ${t.rule}`, paddingLeft: 14 }}>
              <Label t={t} style={{ marginBottom: 8 }}>{s.label}</Label>
              <StatNumber value={s.v} t={t} size={30} />
              <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: t.inkSubtle, marginTop: 6, letterSpacing: 0.5 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* §01 Clusters */}
        <SectionHeader num="01" title="Content clusters" note="sorted by follower conversion" t={t} />
        <div style={{ marginBottom: 48 * d.gap }}>
          {clusters.map((c, i) => {
            const v = verdict(c.verdict);
            return (
              <div key={c.id} style={{
                padding: `${18 * d.row}px 0`, borderBottom: i === clusters.length - 1 ? 'none' : `1px solid ${t.ruleSoft}`,
                display: 'grid', gridTemplateColumns: '22px 1fr 160px 100px 90px', gap: 16, alignItems: 'center',
              }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: t.inkSubtle }}>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <div style={{ fontFamily: FONTS.display, fontSize: 17, color: t.ink, letterSpacing: -0.2, marginBottom: 3 }}>{c.label}</div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: t.inkSubtle, letterSpacing: 0.5 }}>
                    {c.video_count} VIDEOS · {pct(c.share_of_views, 0)} OF VIEWS · TREND {c.trend.toUpperCase()}
                  </div>
                </div>
                <Bar value={c.avg_follower_conversion} max={clusterMax} color={v.kind === 'good' ? t.accent : v.kind === 'meh' ? t.meh : t.rule} t={t} height={6} />
                <span style={{ fontFamily: FONTS.mono, fontSize: 14, color: t.ink, textAlign: 'right' }}>{pct(c.avg_follower_conversion, 2)}</span>
                <VerdictPill kind={v.kind} label={v.label} t={t} />
              </div>
            );
          })}
        </div>

        {/* §02 + §03 two column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 40 * d.gap, marginBottom: 48 * d.gap }}>
          <div>
            <SectionHeader num="02" title="Top converters" t={t} />
            {topVideos.map((v, i) => (
              <div key={v.id} style={{ padding: '12px 0', borderBottom: i === topVideos.length - 1 ? 'none' : `1px solid ${t.ruleSoft}` }}>
                <div style={{ fontFamily: FONTS.sans, fontSize: 14, color: t.ink, marginBottom: 4 }}>{v.title}</div>
                <div style={{ display: 'flex', gap: 18, fontFamily: FONTS.mono, fontSize: 11, color: t.inkMuted, letterSpacing: 0.3 }}>
                  <span>{pct(v.follower_conversion, 2)} CONV</span>
                  <span>{pct(v.watch_through, 0)} WATCH</span>
                  <span>{fmt(v.views)} VIEWS</span>
                  <span style={{ color: t.inkSubtle }}>{(v.style || '').replace('_', ' ').toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
          <div>
            <SectionHeader num="03" title="What they talk about" t={t} />
            {themes.map((th, i) => (
              <div key={i} style={{ padding: '10px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                  <span style={{ fontFamily: FONTS.sans, fontSize: 13, color: t.ink }}>{th.theme}</span>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: t.inkMuted }}>
                    {th.comment_count} · {th.trend === 'up' ? '↑' : th.trend === 'down' ? '↓' : '→'}
                  </span>
                </div>
                <Bar value={th.comment_count} max={themeMax} color={th.trend === 'up' ? t.accent : t.inkSubtle} t={t} height={3} />
              </div>
            ))}
          </div>
        </div>

        {/* §04 Audience */}
        <SectionHeader num="04" title="Who is actually watching" t={t} />
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min((data.audience?.inferred_segments || []).length, 5)}, 1fr)`, gap: 0, border: `1px solid ${t.rule}`, background: t.bgRaised }}>
          {(data.audience?.inferred_segments || []).map((s, i, arr) => (
            <div key={s.id} style={{ padding: '18px 16px', borderRight: i < arr.length - 1 ? `1px solid ${t.ruleSoft}` : 'none' }}>
              <div style={{ fontFamily: FONTS.display, fontSize: 24, color: t.ink, fontWeight: 500, letterSpacing: -0.3 }}>{pct(s.pct, 0)}</div>
              <div style={{ fontFamily: FONTS.sans, fontSize: 12, color: t.inkMuted, marginTop: 4, lineHeight: 1.35, minHeight: 32 }}>{s.label}</div>
              <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px dashed ${t.rule}` }}>
                <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: t.inkSubtle, letterSpacing: 0.8, marginBottom: 3 }}>ENGAGED</div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: s.engaged_pct > 0.5 ? t.good : t.inkMuted }}>{pct(s.engaged_pct, 0)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — persistent answer + next actions */}
      <div style={{ padding: `${36 * d.pad}px ${28 * d.pad}px`, background: t.bgSunk, display: 'flex', flexDirection: 'column', gap: 32 * d.gap }}>
        {/* The answer */}
        <div>
          <Label t={t} style={{ marginBottom: 14 }}>Post this next</Label>
          <h2 style={{
            fontFamily: FONTS.display, fontWeight: 400, fontSize: 26, lineHeight: 1.2,
            letterSpacing: -0.5, color: t.ink, margin: '0 0 14px', textWrap: 'pretty',
          } as React.CSSProperties}>
            {h.rec_title || 'No recommendation yet'}
          </h2>
          <p style={{ fontFamily: FONTS.sans, fontSize: 13, lineHeight: 1.55, color: t.inkMuted, margin: '0 0 16px' }}>
            {h.rec_reason || 'Waiting for enough data to make a recommendation.'}
          </p>
          <VerdictPill kind="good" label={`${Math.round((h.rec_confidence || 0) * 100)}% confidence`} t={t} />
        </div>

        <Rule t={t} />

        {/* Next actions — DYNAMIC */}
        <div>
          <Label t={t} style={{ marginBottom: 14 }}>This week&apos;s moves</Label>
          {nextActions.map((action, i) => (
            <div key={i} style={{ padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${t.ruleSoft}` }}>
              <VerdictPill kind={action.kind as 'good' | 'meh' | 'bad'} label={action.verb} t={t} />
              <div style={{ fontFamily: FONTS.sans, fontSize: 13, color: t.inkMuted, marginTop: 5, lineHeight: 1.45 }}>{action.text}</div>
            </div>
          ))}
        </div>

        <Rule t={t} />

        {/* Asked questions */}
        <div>
          <Label t={t} style={{ marginBottom: 14 }}>They keep asking</Label>
          {(data.audience?.questions || []).slice(0, 4).map((q, i) => (
            <div key={i} style={{ padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${t.ruleSoft}`, display: 'flex', gap: 10, alignItems: 'baseline' }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 10, color: t.accent, minWidth: 26 }}>×{q.count}</span>
              <span style={{ fontFamily: FONTS.display, fontStyle: 'italic', fontSize: 13, color: t.ink, lineHeight: 1.4 }}>&ldquo;{q.text}&rdquo;</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
