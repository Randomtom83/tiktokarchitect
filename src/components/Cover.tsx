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
      <span className="absolute left-4 sm:left-10 top-14 z-[3] font-mono text-xs tracking-[0.2em] uppercase text-bone flex items-center gap-2.5">
        <span className="w-2 h-2 bg-orange rounded-full" />
        <b className="font-bold">@TikTokArchitect</b> · on record
      </span>

      {/* Top-right caption */}
      <span className="absolute right-4 sm:right-10 top-14 z-[3] text-right font-mono text-[10px] tracking-[0.2em] uppercase text-bone opacity-75">
        Sheet <b className="text-orange font-bold opacity-100">A-000</b> · Cover<br />
        Scale · 1:1
      </span>

      {/* Stamp */}
      <span className="absolute right-20 top-32 z-[4]">
        <span className="stamp text-redline">Rev · 01</span>
      </span>

      {/* Giant name */}
      <h1
        className="absolute left-4 right-4 sm:left-10 sm:right-10 bottom-20 z-[3] font-serif font-light uppercase leading-[0.82] tracking-[-0.055em] text-bone m-0"
        style={{ fontSize: "clamp(48px, 18vw, 240px)" }}
      >
        TOM REYNOLDS<br />
        <span className="italic font-normal text-orange text-[0.38em] inline-block -translate-y-[0.7em] tracking-normal normal-case mx-[0.04em]">
          the
        </span>
        TIKTOKARCHITECT
      </h1>

      {/* Bottom strap */}
      <div className="absolute left-4 right-4 sm:left-10 sm:right-10 bottom-8 z-[3] flex justify-between items-end font-mono text-[10px] tracking-[0.2em] uppercase text-bone opacity-75">
        <span>Green Stories LLC · Newark, NJ · Est. <b className="font-bold">2019</b></span>
        <span className="font-serif italic text-[22px] tracking-tight normal-case opacity-100">
          A<i>-000.</i>
        </span>
      </div>
    </section>
  );
}
