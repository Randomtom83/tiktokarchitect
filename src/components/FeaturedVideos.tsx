"use client";

import { useEffect, useRef } from "react";

const FEATURED_VIDEOS = [
  "https://www.tiktok.com/@tiktokarchitect/video/7620428002148519199",
  "https://www.tiktok.com/@tiktokarchitect/video/6918011082430860550",
  "https://www.tiktok.com/@tiktokarchitect/video/6933673604500507910",
];

export default function FeaturedVideos() {
  const sectionRef = useRef<HTMLElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !scriptLoaded.current) {
          scriptLoaded.current = true;
          const script = document.createElement("script");
          script.src = "https://www.tiktok.com/embed.js";
          script.async = true;
          document.body.appendChild(script);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="sheet bg-ink text-bone" id="videos" ref={sectionRef}>
      <span className="coord coord-tl">A · 06 · 01</span>
      <span className="coord coord-tr">@TikTokArchitect</span>
      <span className="coord coord-bl">1,000+ Videos</span>
      <span className="coord coord-br">Sheet A-006</span>

      <div className="chapter-mark">
        <span className="num">§06</span>
        <span>Videos · Architecture Education</span>
        <span className="bar" />
        <span>A-006</span>
      </div>

      <div className="relative z-[2] pt-4">
        <h2
          className="font-serif font-light leading-[0.9] tracking-[-0.04em] m-0 mb-12"
          style={{ fontSize: "clamp(64px, 9vw, 140px)" }}
        >
          Architecture education,<br />
          one video at <i className="italic font-normal text-orange">a time.</i>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURED_VIDEOS.map((url) => {
            const videoId = url.split("/").pop();
            return (
              <div
                key={videoId}
                className="border-[1.5px] border-bone/30 bg-ink-soft overflow-hidden"
              >
                <blockquote
                  className="tiktok-embed"
                  cite={url}
                  data-video-id={videoId}
                  style={{ maxWidth: "325px", minWidth: "100%", margin: 0 }}
                >
                  <section>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={url}
                      className="text-orange hover:underline"
                    >
                      Watch on TikTok
                    </a>
                  </section>
                </blockquote>
              </div>
            );
          })}
        </div>

        <div className="mt-12 pt-6 border-t border-bone/20">
          <a
            href="https://www.tiktok.com/@tiktokarchitect"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] uppercase text-bone no-underline hover:text-orange transition-colors"
          >
            <span>See all 1,000+ videos</span>
            <span className="text-[20px]">↗</span>
          </a>
        </div>
      </div>

      <div className="titleblock">
        <div><span className="k">Drawing</span><span className="v">Videos</span></div>
        <div><span className="k">Sheet</span><span className="v">A-006</span></div>
        <div><span className="k">Count</span><span className="v">1,000+</span></div>
        <div><span className="k">Date</span><span className="v">Issue 01</span></div>
      </div>
    </section>
  );
}
