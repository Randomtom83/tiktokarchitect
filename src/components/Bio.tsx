export default function Bio() {
  return (
    <section className="sheet bg-bone text-ink" id="bio">
      <span className="coord coord-tl text-ink">A · 07 · 01</span>
      <span className="coord coord-tr text-ink">About · Green Stories LLC</span>
      <span className="coord coord-bl text-ink">Newark, NJ</span>
      <span className="coord coord-br text-ink">Sheet A-007</span>

      <div className="chapter-mark text-ink">
        <span className="num">§07</span>
        <span>Bio · The Person</span>
        <span className="bar" />
        <span>A-007</span>
      </div>

      <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-16 pt-4">
        <figure className="relative border-2 border-ink bg-[#0a0a09] overflow-hidden m-0" style={{ aspectRatio: "4/5" }}>
          <img
            src="/images/headshot-primary.webp"
            alt="Tom Reynolds, portrait"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "saturate(0.9) contrast(1.03)" }}
          />
          <figcaption className="absolute left-0 right-0 bottom-0 py-3.5 px-4 font-mono text-[10px] tracking-[0.2em] uppercase text-bone flex justify-between" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}>
            <span>Tom Reynolds</span>
            <span className="text-orange">@TikTokArchitect</span>
          </figcaption>
        </figure>

        <div>
          <h2
            className="font-serif font-light leading-[0.9] tracking-[-0.035em] m-0"
            style={{ fontSize: "clamp(64px, 9vw, 144px)" }}
          >
            Tom <i className="italic font-normal">Reynolds.</i>
          </h2>
          <p
            className="font-serif italic leading-[1.25] mt-6 max-w-[34ch]"
            style={{ fontSize: "clamp(26px, 2.6vw, 34px)" }}
          >
            Architectural designer in Newark. Builds free tools. Runs an archive. Makes a game. Posts receipts.
          </p>
          <p className="font-serif text-lg leading-relaxed mt-5 max-w-[60ch]">
            20+ years in architectural design. Principal at{" "}
            <a href="https://greenstoriesllc.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-orange transition-colors">
              Green Stories LLC
            </a>
            . NOMA. Associate AIA. LEED Green Associate. Co-founder and former VP of
            the NJ Chapter of NOMA. Former President of the Montclair Branch of
            the NAACP.
          </p>
          <p className="font-serif text-lg leading-relaxed mt-5 max-w-[60ch]">
            I started making TikToks because the profession needed a different
            voice. Somebody who looked like the communities we build in. Not
            every architect has to come from money or look a certain way.
          </p>
          <p className="font-serif text-lg leading-relaxed mt-5 max-w-[60ch]">
            I built{" "}
            <a href="https://nia.greenstoriesllc.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-orange transition-colors">
              NIA
            </a>
            , the Black Architecture Archive. I collaborate with{" "}
            <a href="https://www.blkbrystudios.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-orange transition-colors">
              BLKBRY Studios
            </a>
            , an architectural firm in Newark. I wrote a children&apos;s book
            about Norma Merrick Sklarek, the first Black woman licensed as an
            architect in New York and California.
          </p>

          {/* Ledger */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 border-t-2 border-b-2 border-ink">
            {[
              { k: "Firm", v: <>Green Stories <i>LLC</i></> },
              { k: "Based", v: <>Newark, <i>NJ</i></> },
              { k: "Credentials", v: <>NOMA · <i>LEED GA</i></> },
            ].map((cell, i) => (
              <div key={cell.k} className={`py-4 pr-4.5 ${i < 2 ? "border-r border-ink" : ""}`}>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-60">{cell.k}</div>
                <div className="font-serif text-2xl leading-[1.1] mt-1.5 tracking-tight">{cell.v}</div>
              </div>
            ))}
          </div>

          {/* Contact buttons */}
          <div className="mt-10 flex flex-wrap gap-4">
            {[
              { label: "TikTok", href: "https://www.tiktok.com/@tiktokarchitect" },
              { label: "Instagram", href: "https://www.instagram.com/greenstoriesllc" },
              { label: "YouTube", href: "https://www.youtube.com/@TikTokArchitect" },
              { label: "IAmThe@TikTokArchitect.com", href: "mailto:IAmThe@TikTokArchitect.com" },
              { label: "greenstoriesllc.com", href: "https://greenstoriesllc.com" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="inline-flex items-center gap-2.5 py-3 px-4.5 border-[1.5px] border-ink font-mono text-[11px] tracking-[0.16em] uppercase no-underline text-ink hover:bg-ink hover:text-bone transition-colors duration-150"
              >
                <span>{link.label}</span>
                <span className="opacity-70">↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="titleblock">
        <div><span className="k">Drawing</span><span className="v">Bio</span></div>
        <div><span className="k">Sheet</span><span className="v">A-007</span></div>
        <div><span className="k">Of</span><span className="v">09</span></div>
        <div><span className="k">Date</span><span className="v">Issue 01</span></div>
      </div>
    </section>
  );
}
