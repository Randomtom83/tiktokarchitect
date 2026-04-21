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
              { k: "Credentials", v: <>NOMA<small className="block mt-1 text-sm font-mono font-normal opacity-60 uppercase tracking-[0.08em]">LEED GA · Assoc. AIA</small></> },
              { k: "Est.", v: <>2013<small className="block mt-1 text-sm font-mono font-normal opacity-60 uppercase tracking-[0.08em]">· Green Stories</small></> },
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
