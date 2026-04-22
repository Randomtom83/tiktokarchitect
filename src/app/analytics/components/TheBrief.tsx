"use client";

import { FONTS, verdict, fmt, pct, densityOf, VerdictPill, Label, Rule, SectionHeader, Bar, StatNumber, type Theme, type Density, type AnalyticsData } from './tokens';

export default function TheBrief({ data, t, d }: { data: AnalyticsData; t: Theme; d: Density }) {
  const h = data.headline_signal;
  const o = data.overview;
  const strongest = [...data.content_clusters].sort((a,b) => b.avg_follower_conversion - a.avg_follower_conversion);
  const topVideos = [...data.videos].sort((a,b) => (b.follower_conversion ?? 0) - (a.follower_conversion ?? 0)).slice(0, 5);
  const clusterMax = Math.max(...data.content_clusters.map(c => c.avg_follower_conversion));

  // §05 Do this next — dynamic actions from data
  const nextActions: Array<{ n: string; verb: string; text: string }> = [];
  if (h.rec_title) {
    nextActions.push({ n: '01', verb: 'DOUBLE DOWN', text: h.rec_title });
  }
  if ((data.audience?.questions?.length ?? 0) > 0) {
    const topQ = data.audience.questions[0];
    nextActions.push({ n: String(nextActions.length + 1).padStart(2, '0'), verb: 'ANSWER', text: `"${topQ.text}" — ${topQ.count} people asked. One video answers a month of comments.` });
  }
  const noiseCluster = data.content_clusters.find(c => c.verdict === 'NOISE');
  if (noiseCluster) {
    nextActions.push({ n: String(nextActions.length + 1).padStart(2, '0'), verb: 'SUNSET', text: `Pause ${noiseCluster.label.toLowerCase()} content until you have a fresh angle.` });
  }
  if (nextActions.length === 0) {
    nextActions.push({ n: '01', verb: 'WAIT', text: 'No recommendations yet — data still accumulating.' });
  }

  return (
    <div style={{
      background: t.bg, color: t.ink, fontFamily: FONTS.sans,
      padding: `${56 * d.pad}px ${72 * d.pad}px ${80 * d.pad}px`, minHeight: '100%',
      maxWidth: 980, margin: '0 auto',
    }}>
      {/* Masthead */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <Label t={t}>The Brief · Week of Apr 21, 2026</Label>
        <Label t={t}>{data.account.handle} · {fmt(data.account.followers)} followers</Label>
      </div>
      <Rule t={t} style={{ marginBottom: 56 * d.gap }} />

      {/* Hero answer */}
      <div style={{ marginBottom: 72 * d.gap }}>
        <Label t={t} style={{ marginBottom: 20 * d.gap }}>What should you post next</Label>
        <h1 style={{
          fontFamily: FONTS.display, fontWeight: 400, fontSize: 56 * d.type, lineHeight: 1.08,
          letterSpacing: -1.2, color: t.ink, margin: `0 0 ${24 * d.gap}px`, textWrap: 'pretty',
        }}>
          {h.rec_title}.
        </h1>
        <p style={{
          fontFamily: FONTS.display, fontStyle: 'italic', fontSize: 20 * d.type, lineHeight: 1.5,
          color: t.inkMuted, maxWidth: 680, margin: `0 0 ${28 * d.gap}px`, textWrap: 'pretty',
        }}>
          {h.rec_reason}
        </p>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <VerdictPill kind="good" label={`${Math.round(h.rec_confidence * 100)}% confidence`} t={t} size={12} />
          <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: t.inkSubtle, letterSpacing: 1 }}>
            BASED ON {o.videos} VIDEOS · {fmt(o.new_followers)} NEW FOLLOWERS · {pct(o.engagement_rate)} ENGAGEMENT
          </span>
        </div>
      </div>

      <Rule t={t} dashed style={{ marginBottom: 48 * d.gap }} />

      {/* §01 The shape of what's working */}
      <SectionHeader num="01" title="The shape of what's working" note="by follower conversion" t={t} />
      <div style={{ marginBottom: 64 * d.gap }}>
        {strongest.map((c, i) => {
          const v = verdict(c.verdict);
          return (
            <div key={c.id} style={{ padding: `${20 * d.row}px 0`, borderBottom: i === strongest.length - 1 ? 'none' : `1px solid ${t.ruleSoft}` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: t.inkSubtle, width: 22 }}>{String(i+1).padStart(2, '0')}</span>
                  <span style={{ fontFamily: FONTS.display, fontSize: 22, color: t.ink, letterSpacing: -0.3 }}>{c.label}</span>
                </div>
                <VerdictPill kind={v.kind} label={v.label} t={t} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', gap: 24, alignItems: 'center', paddingLeft: 36 }}>
                <div>
                  <Label t={t} style={{ marginBottom: 4 }}>Videos</Label>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 15, color: t.ink }}>{c.video_count}</span>
                </div>
                <div>
                  <Label t={t} style={{ marginBottom: 4 }}>Follower conv.</Label>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 15, color: t.ink }}>{pct(c.avg_follower_conversion, 2)}</span>
                </div>
                <div>
                  <Label t={t} style={{ marginBottom: 4 }}>Share of views</Label>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 15, color: t.ink }}>{pct(c.share_of_views, 0)}</span>
                </div>
                <Bar value={c.avg_follower_conversion} max={clusterMax} color={v.kind === 'good' ? t.accent : v.kind === 'meh' ? t.meh : t.rule} t={t} />
              </div>
            </div>
          );
        })}
      </div>

      {/* §02 Who's listening */}
      <SectionHeader num="02" title="Who's actually listening" t={t} />
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 56 * d.gap, marginBottom: 64 * d.gap }}>
        <div>
          <Label t={t} style={{ marginBottom: 16 }}>Inferred segments</Label>
          {(data.audience?.inferred_segments || []).map(s => (
            <div key={s.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontFamily: FONTS.sans, fontSize: 14, color: t.ink }}>{s.label}</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: t.inkMuted }}>{pct(s.pct, 0)}</span>
              </div>
              <Bar value={s.pct} max={0.4} color={s.engaged_pct > 0.5 ? t.accent : t.inkSubtle} t={t} height={4} />
              {s.cities.length > 0 && (
                <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: t.inkSubtle, marginTop: 4, letterSpacing: 0.5 }}>
                  {s.cities.join(' · ')}
                </div>
              )}
            </div>
          ))}
        </div>
        <div>
          <Label t={t} style={{ marginBottom: 16 }}>Lurker → fan</Label>
          {Object.entries(data.audience?.lurker_to_fan || {}).map(([k, v], i, arr) => {
            const total = Object.values(data.audience?.lurker_to_fan || {}).reduce((a,b)=>a+b,0);
            const opacities = [0.2, 0.4, 0.65, 1];
            return (
              <div key={k} style={{ padding: '12px 0', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${t.ruleSoft}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: FONTS.sans, fontSize: 14, color: t.ink, textTransform: 'capitalize' }}>{k.replace('_', ' ')}</span>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: t.ink }}>{fmt(v)}</span>
                </div>
                <div style={{ marginTop: 6, height: 3, background: t.ruleSoft }}>
                  <div style={{ height: '100%', width: `${(v/Math.max(total,1))*100}%`, background: t.accent, opacity: opacities[i] || 1 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* §03 Top performers */}
      <SectionHeader num="03" title="Top converters" note="videos that turned lurkers into followers" t={t} />
      <div style={{ marginBottom: 64 * d.gap }}>
        {topVideos.map((v, i) => (
          <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto auto auto', gap: 20, padding: `${14 * d.row}px 0`, borderBottom: i === topVideos.length - 1 ? 'none' : `1px solid ${t.ruleSoft}`, alignItems: 'baseline' }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: t.inkSubtle }}>{String(i+1).padStart(2, '0')}</span>
            <div>
              <div style={{ fontFamily: FONTS.sans, fontSize: 15, color: t.ink, marginBottom: 3 }}>{v.title}</div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: t.inkSubtle, letterSpacing: 0.5 }}>
                {v.date} · {v.duration}S · {(v.style || '').toUpperCase().replace('_', ' ')}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: t.ink }}>{pct(v.follower_conversion, 2)}</div>
              <Label t={t}>conv</Label>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: t.ink }}>{pct(v.watch_through, 0)}</div>
              <Label t={t}>watch</Label>
            </div>
            <div style={{ textAlign: 'right', minWidth: 60 }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: t.ink }}>{fmt(v.views)}</div>
              <Label t={t}>views</Label>
            </div>
          </div>
        ))}
      </div>

      {/* §04 What they asked for */}
      <SectionHeader num="04" title="What they asked for" note="actual requests from comments" t={t} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 * d.gap, marginBottom: 64 * d.gap }}>
        <div>
          <Label t={t} style={{ marginBottom: 14 }}>Questions</Label>
          {(data.audience?.questions || []).slice(0, 5).map((q, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: `1px solid ${t.ruleSoft}`, display: 'flex', gap: 14, alignItems: 'baseline' }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: t.accent, minWidth: 24 }}>×{q.count}</span>
              <span style={{ fontFamily: FONTS.display, fontStyle: 'italic', fontSize: 15, color: t.ink, lineHeight: 1.4 }}>&ldquo;{q.text}&rdquo;</span>
            </div>
          ))}
        </div>
        <div>
          <Label t={t} style={{ marginBottom: 14 }}>Explicit requests</Label>
          {(data.audience?.requests || []).map((r, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: `1px solid ${t.ruleSoft}`, display: 'flex', gap: 14, alignItems: 'baseline' }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: t.accent, minWidth: 24 }}>×{r.count}</span>
              <span style={{ fontFamily: FONTS.sans, fontSize: 14, color: t.ink, lineHeight: 1.4 }}>{r.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* §05 Do this next */}
      <SectionHeader num="05" title="Do this next" t={t} />
      <div style={{ background: t.bgRaised, border: `1px solid ${t.rule}`, padding: 28 * d.pad, marginBottom: 32 * d.gap }}>
        {nextActions.map((action, i) => (
          <div key={action.n} style={{ display: 'flex', alignItems: 'baseline', gap: 16, padding: `${12 * d.row}px 0`, borderBottom: i === nextActions.length - 1 ? 'none' : `1px solid ${t.ruleSoft}` }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: t.inkSubtle, minWidth: 22 }}>{action.n}</span>
            <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: t.accent, letterSpacing: 1, minWidth: 100 }}>{action.verb}</span>
            <span style={{ fontFamily: FONTS.display, fontSize: 17, color: t.ink, lineHeight: 1.4 }}>{action.text}</span>
          </div>
        ))}
      </div>

      <Rule t={t} style={{ marginBottom: 16, marginTop: 48 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Label t={t}>End of brief</Label>
        <Label t={t}>Updated · {data.account?.updated_at ? new Date(data.account.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</Label>
      </div>
    </div>
  );
}
