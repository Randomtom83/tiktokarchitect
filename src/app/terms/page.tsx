import Link from "next/link";

export default function TermsOfUse() {
  return (
    <div className="flex flex-col items-center min-h-screen px-6 py-20">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="text-muted hover:text-accent transition-colors text-sm mb-8 inline-block"
        >
          &larr; Back
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">
          Terms of Use
        </h1>
        <p className="text-muted mb-10">Last updated: April 4, 2026</p>

        <div className="space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-accent mb-3">
              Agreement
            </h2>
            <p>
              By accessing and using tiktokarchitect.com, you agree to these
              terms. If you don&apos;t agree, close the tab. Simple.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-accent mb-3">
              Content Ownership
            </h2>
            <p>
              All original content on this site &mdash; text, images, videos,
              and design &mdash; is the property of Green Stories LLC unless
              otherwise noted. You may not reproduce, distribute, or use this
              content without written permission.
            </p>
            <p className="mt-3">
              TikTok videos embedded on this site remain the property of their
              respective creators and are subject to TikTok&apos;s terms of
              service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-accent mb-3">
              Professional Disclaimer
            </h2>
            <p>
              Content on this site and associated social media accounts is for
              educational and informational purposes only. It does not
              constitute professional architectural advice, engineering advice,
              or licensed professional services.
            </p>
            <p className="mt-3">
              Green Stories LLC is a building design and consulting firm.
              Projects requiring a licensed architect are completed in
              collaboration with licensed professionals.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-accent mb-3">
              Affiliate Links
            </h2>
            <p>
              This site contains affiliate links. We may earn a commission from
              qualifying purchases at no extra cost to you. We only recommend
              products and services we actually use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-accent mb-3">
              External Links
            </h2>
            <p>
              This site links to third-party websites. We are not responsible
              for the content, privacy practices, or availability of those
              sites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-accent mb-3">
              Limitation of Liability
            </h2>
            <p>
              This site is provided &ldquo;as is.&rdquo; Green Stories LLC is
              not liable for any damages arising from your use of the site or
              reliance on its content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-accent mb-3">
              Governing Law
            </h2>
            <p>
              These terms are governed by the laws of the State of New Jersey.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-accent mb-3">
              Changes
            </h2>
            <p>
              We may update these terms as needed. Continued use of the site
              after changes means you accept them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-accent mb-3">Contact</h2>
            <p>
              Questions? Reach out via the{" "}
              <Link href="/contact/" className="text-accent hover:underline">
                contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
