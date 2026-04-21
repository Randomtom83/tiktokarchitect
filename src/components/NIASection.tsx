export default function NIASection() {
  return (
    <section className="sheet bg-green text-bone" id="nia">
      <span className="coord coord-tl">A · 03 · 01</span>
      <span className="coord coord-tr">The Archive</span>
      <span className="coord coord-bl">Black Architecture · Ongoing</span>
      <span className="coord coord-br">Sheet A-003</span>

      <div className="chapter-mark">
        <span className="num">§03</span>
        <span>NIA · Black Architecture Archive</span>
        <span className="bar" />
        <span>A-003</span>
      </div>

      <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-[5fr_6fr] gap-14 items-end pt-4">
        <div className="lg:pr-6">
          <h2
            className="font-serif font-light leading-[0.78] tracking-[-0.055em] m-0"
            style={{ fontSize: "clamp(80px, 26vw, 360px)" }}
          >
            NIA<span className="text-yellow">.</span>
          </h2>
          <p className="font-serif text-[22px] italic mt-4 leading-[1.35] max-w-[28ch] opacity-90">
            Documenting Black contributions to architecture and the built world.
          </p>
          <span className="inline-block mt-6 font-mono text-[10.5px] tracking-[0.2em] uppercase border border-bone py-1.5 px-3 opacity-90">
            Black Architecture Archive
          </span>
        </div>

        <div className="border-[1.5px] border-bone p-7 px-8 bg-black/15">
          <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] uppercase opacity-75 mb-5">
            <span>Sheet A-003</span>
            <span>Ongoing · Web · Free</span>
          </div>
          <h3 className="font-serif font-normal text-[40px] leading-[1.05] m-0 mb-3.5 tracking-tight">
            An archive of <i className="italic">every</i> Black architect this country chose to forget.
          </h3>
          <p className="font-serif text-[17px] leading-relaxed m-0 mb-4 italic opacity-90">
            NIA is the Black Architecture Archive. Architect profiles, video
            interviews, and data on diversity within the profession.
          </p>
          <p className="font-serif text-[17px] leading-relaxed m-0 mb-4 italic opacity-90">
            Only 2% of licensed architects in the US are Black. NIA exists to
            make sure those stories don&apos;t disappear.
          </p>
          <a
            href="https://nia.greenstoriesllc.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-between items-center font-mono text-[11px] tracking-[0.2em] uppercase border-t border-bone mt-5 pt-4 no-underline text-bone"
          >
            <span>Visit the Archive</span>
            <span className="text-[20px] hover:text-yellow transition-colors">→</span>
          </a>
        </div>
      </div>

      <div className="titleblock">
        <div><span className="k">Drawing</span><span className="v">NIA</span></div>
        <div><span className="k">Sheet</span><span className="v">A-003</span></div>
        <div><span className="k">Type</span><span className="v">Archive</span></div>
        <div><span className="k">Status</span><span className="v">Ongoing</span></div>
      </div>

      <div className="redline hidden lg:flex" style={{ top: "10%", right: "4%" }}>
        <span className="tick">2</span>
        <span className="line">Every Black<br />architect.<br />Every one.</span>
      </div>
    </section>
  );
}
