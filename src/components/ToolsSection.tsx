export default function ToolsSection() {
  return (
    <section className="sheet sheet-dense bg-cyan text-bone" id="tools">
      <span className="coord coord-tl">A · 02 · 01</span>
      <span className="coord coord-tr">GREENSTORIESLLC.COM/TOOLS.PHP</span>
      <span className="coord coord-bl">Free · All 23</span>
      <span className="coord coord-br">Sheet A-002</span>

      <div className="chapter-mark">
        <span className="num">§02</span>
        <span>Tools · Twenty-Three Free Builds</span>
        <span className="bar" />
        <span>A-002</span>
      </div>

      <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-[6fr_5fr] gap-18 pt-4">
        <div>
          <h2
            className="font-serif font-light leading-[0.84] tracking-[-0.05em] m-0"
            style={{ fontSize: "clamp(48px, 14vw, 200px)" }}
          >
            Twenty-<br />three <i className="italic font-normal text-yellow">tools.</i>
          </h2>
          <p className="font-serif text-[22px] leading-[1.4] max-w-[34ch] mt-7 italic opacity-90">
            Code calculators, structural tools, and project management — built by
            an architect who actually uses them. Free for anyone doing the work.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {[
            { num: "01", name: "BalyeCleaner", platform: "Windows · 36 MB", desc: "Sweep your project folders clean. Find and remove outdated Revit and AutoCAD backup files in one pass.", href: "https://reynoldsfamily.co/builds/BalyeCleaner-1.0.0.exe" },
            { num: "02", name: "ShambaWorks", platform: "Android · 17.7 MB", desc: "Plan your flower bed at the nursery. Smart layouts, spacing, and budgeting.", href: "https://reynoldsfamily.co/builds/ShambaWorks-1.0.0.apk" },
            { num: "03", name: "Lakou", platform: "Android · 55.6 MB", desc: "Your practice. Your pace. Your app. Project management built for solo architects.", href: "https://reynoldsfamily.co/builds/Lakou-1.0.0.apk" },
          ].map((app) => (
            <a
              key={app.num}
              href={app.href}
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-card block no-underline text-bone p-5.5 px-6 bg-black/18 hover:bg-ink"
            >
              <div className="flex justify-between items-baseline font-mono text-[10px] tracking-[0.2em] uppercase opacity-75">
                <span>App · {app.num}</span>
                <span>{app.platform}</span>
              </div>
              <h3 className="font-serif font-normal italic text-[56px] leading-[0.95] my-2 tracking-tight">
                {app.name}
              </h3>
              <p className="font-mono text-xs leading-relaxed m-0 opacity-85 max-w-[48ch]">
                {app.desc}
              </p>
              <span className="absolute right-6 bottom-5.5 font-mono text-[22px]">↗</span>
            </a>
          ))}

          <a
            href="https://greenstoriesllc.com/tools.php"
            target="_blank"
            rel="noopener noreferrer"
            className="block no-underline p-6 px-7 border-2 border-bone bg-bone hover:bg-ink hover:text-bone transition-colors duration-200 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[3px_3px_0_var(--bone)]"
            style={{ color: "var(--ink)" }}
          >
            <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] uppercase">
              <span>Full catalog</span>
              <span>Live · greenstoriesllc.com</span>
            </div>
            <h3 className="font-serif font-light text-[48px] leading-[0.95] mt-2.5 mb-1 tracking-tight">
              All <i className="italic text-orange">23.</i> Maintained at the source.
            </h3>
            <div className="font-mono text-[13px] tracking-[0.02em] mt-3 border-t border-current pt-2.5 flex justify-between items-center">
              <span className="text-[15px] font-bold">greenstoriesllc.com/tools.php</span>
              <span className="text-[22px]">↗</span>
            </div>
          </a>
        </div>
      </div>

      <div className="titleblock">
        <div><span className="k">Drawing</span><span className="v">Tools</span></div>
        <div><span className="k">Sheet</span><span className="v">A-002</span></div>
        <div><span className="k">Cost</span><span className="v">$0.00</span></div>
        <div><span className="k">Date</span><span className="v">Issue 01</span></div>
      </div>
    </section>
  );
}
