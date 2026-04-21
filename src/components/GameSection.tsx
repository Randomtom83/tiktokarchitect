export default function GameSection() {
  return (
    <section className="sheet bg-yellow text-ink" id="game">
      {/* Caution band */}
      <div
        className="absolute left-0 right-0 top-[72px] h-5 z-[1]"
        style={{
          background: "repeating-linear-gradient(135deg, var(--ink) 0 16px, var(--yellow) 16px 32px)",
        }}
      />

      <span className="coord coord-tl text-ink">A · 04 · 01</span>
      <span className="coord coord-tr text-ink">Android · v1.0.0</span>
      <span className="coord coord-bl text-ink">Size · 7.6 MB</span>
      <span className="coord coord-br text-ink">Sheet A-004</span>

      <div className="chapter-mark text-ink mt-7">
        <span className="num">§04</span>
        <span>The Game · Architect the Game</span>
        <span className="bar" />
        <span>A-004</span>
      </div>

      <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-[6fr_5fr] gap-16 pt-10">
        <div>
          <h2
            className="font-serif font-light leading-[0.82] tracking-[-0.05em] m-0"
            style={{ fontSize: "clamp(48px, 15vw, 220px)" }}
          >
            Architect <span className="italic text-redline">the</span>
            <br />
            <i className="italic font-normal">Game.</i>
          </h2>

          <p
            className="font-serif italic leading-[1.1] border-l-4 border-ink pl-5 py-1 mt-8 max-w-[20ch]"
            style={{ fontSize: "clamp(30px, 3.4vw, 48px)" }}
          >
            &ldquo;Sleep is for the licensed.&rdquo;
          </p>

          <p className="font-serif text-[19px] leading-relaxed max-w-[44ch] mt-7">
            A text-driven life simulation based on real data from the
            architecture profession. Choose your school, survive studio
            culture, manage money, stress, energy, and relationships
            semester by semester. Graduate — and discover that was only
            the beginning.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 mt-8 border-t-2 border-b-2 border-ink">
            {[
              { k: "Platform", v: "Android" },
              { k: "Version", v: "1.0.0" },
              { k: "Size", v: "7.6 MB" },
              { k: "Price", v: "Free", italic: true },
            ].map((s, i) => (
              <div key={s.k} className={`py-3.5 pr-3 ${i < 3 ? "border-r border-ink" : ""}`}>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-70">{s.k}</div>
                <div className={`font-serif text-[30px] leading-none mt-1.5 tracking-tight ${s.italic ? "italic" : ""}`}>
                  {s.v}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href="#"
            className="inline-flex justify-between items-center mt-8 py-5 px-6 bg-ink no-underline font-serif text-[30px] italic min-w-0 sm:min-w-[360px] border-3 border-ink gap-8 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[6px_6px_0_var(--ink)] transition-all duration-200"
            style={{ color: "#f4c430" }}
          >
            <span>Download APK<br />↓</span>
            <span className="font-mono not-italic text-[11px] tracking-[0.18em] uppercase text-right leading-relaxed">
              Android · v1.0.0<br />Size · 7.6 MB
            </span>
          </a>
        </div>

        {/* Phone mock */}
        <div className="relative">
          <div className="relative w-full max-w-[320px] lg:ml-auto bg-ink text-yellow border-2 border-ink p-4.5 px-4 flex flex-col gap-2.5 font-mono text-xs shadow-[10px_10px_0_rgba(0,0,0,0.25)]" style={{ aspectRatio: "9/19.5" }}>
            <div className="flex justify-between text-[10px] tracking-[0.15em] opacity-70 border-b border-yellow pb-2.5 mb-1.5">
              <span>9:48 AM</span>
              <span>ARCHITECT · STUDIO · S3</span>
            </div>
            <div className="font-serif text-[15px] leading-[1.4] italic py-1.5 opacity-90">
              &ldquo;It&apos;s 2 AM. Your model is due at 9. Your roommate asks if you want to come to a party.&rdquo;
            </div>
            <div className="py-2 px-2.5 border border-yellow font-bold bg-yellow text-ink text-xs">&gt; Stay. Grind. Eat foam.</div>
            <div className="py-2 px-2.5 border border-dashed border-yellow text-xs">&gt; Go for an hour.</div>
            <div className="py-2 px-2.5 border border-dashed border-yellow text-xs">&gt; Burn it all down.</div>
            <div className="mt-auto grid gap-1.5 pt-3 border-t border-yellow">
              {[
                { label: "$", w: "42%", val: "$420" },
                { label: "zzz", w: "18%", val: "12%" },
                { label: "HP", w: "58%", val: "58%" },
                { label: "rep", w: "74%", val: "74%" },
              ].map((bar) => (
                <div key={bar.label} className="grid grid-cols-[34px_1fr_auto] gap-2.5 items-center text-[10px] tracking-[0.1em]">
                  <span>{bar.label}</span>
                  <div className="h-1.5 bg-yellow/20 relative">
                    <div className="absolute left-0 top-0 bottom-0 bg-yellow" style={{ width: bar.w }} />
                  </div>
                  <span>{bar.val}</span>
                </div>
              ))}
            </div>
            <span className="absolute -bottom-7 right-0 font-mono text-[9px] tracking-[0.18em] uppercase opacity-70 text-ink">
              [ placeholder screen · illustrative ]
            </span>
          </div>
        </div>
      </div>

      <div className="titleblock">
        <div><span className="k">Drawing</span><span className="v">The Game</span></div>
        <div><span className="k">Sheet</span><span className="v">A-004</span></div>
        <div><span className="k">Platform</span><span className="v">Android</span></div>
        <div><span className="k">Cost</span><span className="v">Free</span></div>
      </div>
    </section>
  );
}
