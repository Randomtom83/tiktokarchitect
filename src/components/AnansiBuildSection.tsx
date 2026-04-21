export default function AnansiBuildSection() {
  return (
    <section className="sheet bg-concrete text-ink" id="anansi">
      {/* Concrete texture */}
      <div
        className="absolute pointer-events-none z-[1] opacity-90 mix-blend-multiply"
        style={{
          inset: "32px",
          background: [
            "radial-gradient(circle at 20% 30%, rgba(0,0,0,.08) 0 2px, transparent 3px)",
            "radial-gradient(circle at 70% 60%, rgba(0,0,0,.06) 0 1.5px, transparent 2px)",
            "radial-gradient(circle at 45% 85%, rgba(0,0,0,.07) 0 2px, transparent 3px)",
            "radial-gradient(circle at 90% 20%, rgba(0,0,0,.08) 0 1.5px, transparent 2px)",
            "radial-gradient(circle at 10% 75%, rgba(0,0,0,.05) 0 1px, transparent 2px)",
          ].join(", "),
          backgroundSize: "120px 120px, 90px 90px, 140px 140px, 80px 80px, 110px 110px",
        }}
      />

      <span className="coord coord-tl text-ink">A · 05 · 01</span>
      <span className="coord coord-tr text-ink">The Build</span>
      <span className="coord coord-bl text-ink">Revit 2026 · Beta</span>
      <span className="coord coord-br text-ink">Sheet A-005</span>

      <div className="chapter-mark text-ink">
        <span className="num">§05</span>
        <span>AnansiBuild · The Build</span>
        <span className="bar" />
        <span>A-005</span>
      </div>

      <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-14 pt-4">
        <div>
          <h2
            className="font-serif font-light leading-[0.82] tracking-[-0.055em] m-0"
            style={{ fontSize: "clamp(64px, 18vw, 260px)" }}
          >
            Anansi<i className="italic font-normal">Build.</i>
          </h2>
          <p className="font-serif italic text-2xl leading-[1.35] max-w-[34ch] mt-7">
            Export Revit architectural models to multi-color 3MF files for 3D
            printing. Auto material separation, 26 printer database, 19
            architectural scales.
          </p>
        </div>

        <aside className="grid content-start gap-5 border-2 border-ink p-6 bg-white/18">
          <h4 className="font-serif italic font-normal text-[26px] leading-none m-0 mb-2 tracking-tight">
            Spec Sheet
          </h4>
          {[
            { k: "Type", v: "Revit Plugin" },
            { k: "Platform", v: "Revit 2026" },
            { k: "Status", v: "Beta" },
            { k: "Cost", v: "Free" },
            { k: "For", v: "Architects, Engineers" },
          ].map((row, i, arr) => (
            <div
              key={row.k}
              className={`grid grid-cols-[90px_1fr] gap-3.5 font-mono text-xs tracking-[0.12em] uppercase pb-2.5 ${i < arr.length - 1 ? "border-b border-ink" : ""}`}
            >
              <span className="opacity-60">{row.k}</span>
              <span className="font-bold">{row.v}</span>
            </div>
          ))}
          <a
            href="https://greenstoriesllc.com/anansibuild.php"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-between items-center font-mono text-[11px] tracking-[0.18em] uppercase border-t-2 border-ink mt-2 pt-4 no-underline text-ink"
          >
            <span>Download Free</span>
            <span className="text-[20px]">↗</span>
          </a>
        </aside>
      </div>

      <div className="titleblock">
        <div><span className="k">Drawing</span><span className="v">AnansiBuild</span></div>
        <div><span className="k">Sheet</span><span className="v">A-005</span></div>
        <div><span className="k">Status</span><span className="v">Beta</span></div>
        <div><span className="k">Date</span><span className="v">Issue 01</span></div>
      </div>
    </section>
  );
}
