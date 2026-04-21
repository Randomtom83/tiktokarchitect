import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink text-bone px-10 pt-14 pb-10 border-t border-bone/20 relative">
      {/* 4-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 font-mono text-[11px] tracking-[0.14em] uppercase mb-10">
        <div>
          <h5 className="font-mono text-[10px] opacity-50 m-0 mb-3 font-medium">Drawing Set</h5>
          <div className="leading-loose opacity-85">
            A-000 · Cover<br />
            A-001 · Vitals<br />
            A-002 · Tools<br />
            A-003 · NIA<br />
            A-004 · The Game<br />
            A-005 · AnansiBuild<br />
            A-006 · Videos<br />
            A-007 · Bio<br />
            A-008 · Links
          </div>
        </div>
        <div>
          <h5 className="font-mono text-[10px] opacity-50 m-0 mb-3 font-medium">Work</h5>
          <a href="#tools" className="block no-underline opacity-85 mb-2 hover:text-orange transition-colors">Tools</a>
          <a href="#game" className="block no-underline opacity-85 mb-2 hover:text-orange transition-colors">The Game</a>
          <a href="#nia" className="block no-underline opacity-85 mb-2 hover:text-orange transition-colors">Archive</a>
          <a href="#anansi" className="block no-underline opacity-85 mb-2 hover:text-orange transition-colors">AnansiBuild</a>
        </div>
        <div>
          <h5 className="font-mono text-[10px] opacity-50 m-0 mb-3 font-medium">Find</h5>
          <a href="https://www.tiktok.com/@tiktokarchitect" target="_blank" rel="noopener noreferrer" className="block no-underline opacity-85 mb-2 hover:text-orange transition-colors">TikTok ↗</a>
          <a href="https://www.instagram.com/greenstoriesllc" target="_blank" rel="noopener noreferrer" className="block no-underline opacity-85 mb-2 hover:text-orange transition-colors">Instagram ↗</a>
          <a href="https://www.youtube.com/@TikTokArchitect" target="_blank" rel="noopener noreferrer" className="block no-underline opacity-85 mb-2 hover:text-orange transition-colors">YouTube ↗</a>
        </div>
        <div>
          <h5 className="font-mono text-[10px] opacity-50 m-0 mb-3 font-medium">Contact</h5>
          <a href="mailto:IAmThe@TikTokArchitect.com" className="block no-underline opacity-85 mb-2 hover:text-orange transition-colors">IAmThe@<br />TikTokArchitect.com</a>
          <a href="https://greenstoriesllc.com" target="_blank" rel="noopener noreferrer" className="block no-underline opacity-85 mb-2 hover:text-orange transition-colors">greenstoriesllc.com ↗</a>
        </div>
      </div>

      {/* Legal links */}
      <div className="flex gap-6 font-mono text-[10px] tracking-[0.14em] uppercase opacity-50 mb-6">
        <Link href="/privacy/" className="no-underline hover:text-orange hover:opacity-100 transition-colors">Privacy</Link>
        <Link href="/terms/" className="no-underline hover:text-orange hover:opacity-100 transition-colors">Terms</Link>
      </div>

      {/* Giant mark */}
      <h2
        className="font-serif font-light leading-[0.85] tracking-[-0.05em] m-0 border-t border-bone/20 pt-6"
        style={{ fontSize: "clamp(80px, 14vw, 200px)" }}
      >
        Tom <i className="italic text-orange">Reynolds.</i>
      </h2>

      <div className="mt-4 flex flex-wrap justify-between font-mono text-[10px] tracking-[0.18em] uppercase opacity-55">
        <span>© Green Stories LLC · Newark, NJ</span>
        <span>Drawing Set A-001 · Issue 01 · Rev 01</span>
      </div>
    </footer>
  );
}
