const LINKS = [
  {
    category: "Work",
    items: [
      { label: "Green Stories LLC", description: "Building design & consulting", url: "https://greenstoriesllc.com" },
      { label: "BLKBRY Studios", description: "Architecture & design, Newark NJ", url: "https://www.blkbrystudios.com" },
      { label: "NIA", description: "Black Architecture Archive", url: "https://nia.greenstoriesllc.com" },
    ],
  },
  {
    category: "Social",
    items: [
      { label: "TikTok", description: "@TikTokArchitect", url: "https://www.tiktok.com/@tiktokarchitect" },
      { label: "YouTube", description: "@TikTokArchitect", url: "https://www.youtube.com/@TikTokArchitect" },
      { label: "Instagram", description: "@greenstoriesllc", url: "https://www.instagram.com/greenstoriesllc" },
      { label: "LinkedIn", description: "Tom Reynolds", url: "https://www.linkedin.com/in/tlreynolds/" },
      { label: "Snapchat", description: "@randomtom83", url: "https://www.snapchat.com/add/randomtom83" },
    ],
  },
  {
    category: "Connect",
    items: [
      { label: "Phone", description: "(917) 272-3536", url: "tel:+19172723536" },
      { label: "Email", description: "IAmThe@TikTokArchitect.com", url: "mailto:IAmThe@TikTokArchitect.com" },
      { label: "Linq", description: "Digital business card", url: "https://linqapp.com/ThomasLReynolds" },
      { label: "Venmo", description: "@ThomasLReynolds", url: "https://account.venmo.com/u/ThomasLReynolds" },
    ],
  },
  {
    category: "Tools I Use",
    items: [
      { label: "Fieldy", description: "AI notetaker — discount code", url: "https://fieldlabsinc.sjv.io/c/6409508/3068775/30711" },
      { label: "Linq", description: "Digital card — 15% off", url: "https://buy.linqapp.com/discount/thomas_reynolds_af6_15?redirect=%2F%3Fafmc%3Dthomas_reynolds_af6_15&r=amb_copy" },
    ],
  },
];

export default function LinkHub() {
  return (
    <section className="sheet bg-ink-soft text-bone" id="links">
      <span className="coord coord-tl">A · 08 · 01</span>
      <span className="coord coord-tr">Find Me Everywhere</span>
      <span className="coord coord-bl">All Platforms</span>
      <span className="coord coord-br">Sheet A-008</span>

      <div className="chapter-mark">
        <span className="num">§08</span>
        <span>Links · Find Me Everywhere</span>
        <span className="bar" />
        <span>A-008</span>
      </div>

      <div className="relative z-[2] pt-4">
        <h2
          className="font-serif font-light leading-[0.9] tracking-[-0.04em] m-0 mb-16"
          style={{ fontSize: "clamp(64px, 9vw, 140px)" }}
        >
          Find me <i className="italic font-normal text-orange">everywhere.</i>
        </h2>

        <div className="space-y-12">
          {LINKS.map((group) => (
            <div key={group.category}>
              <h3 className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase opacity-50 mb-4 pb-2 border-b border-bone/20">
                {group.category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target={link.url.startsWith("mailto:") || link.url.startsWith("tel:") ? undefined : "_blank"}
                    rel={link.url.startsWith("mailto:") || link.url.startsWith("tel:") ? undefined : "noopener noreferrer"}
                    className="flex items-center justify-between gap-4 py-4 px-5 border-[1.5px] border-bone/30 no-underline text-bone bg-transparent hover:bg-ink hover:border-orange hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[3px_3px_0_var(--orange)] transition-all duration-200"
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-xs font-bold tracking-[0.12em] uppercase">{link.label}</div>
                      <div className="font-mono text-[10px] tracking-[0.08em] opacity-60 truncate mt-0.5">{link.description}</div>
                    </div>
                    <span className="font-mono text-lg opacity-50 shrink-0">↗</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="titleblock">
        <div><span className="k">Drawing</span><span className="v">Links</span></div>
        <div><span className="k">Sheet</span><span className="v">A-008</span></div>
        <div><span className="k">Type</span><span className="v">Directory</span></div>
        <div><span className="k">Date</span><span className="v">Issue 01</span></div>
      </div>
    </section>
  );
}
