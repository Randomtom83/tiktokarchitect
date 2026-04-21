import Link from "next/link";

export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        <p className="text-muted mb-10">Last updated: April 4, 2026</p>

        <div className="space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-accent mb-3">
              Who We Are
            </h2>
            <p>
              This website is operated by Green Stories LLC. Our website address
              is https://www.tiktokarchitect.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-accent mb-3">
              What Data We Collect
            </h2>
            <p>
              This is a static website. We do not use cookies, tracking pixels,
              or analytics software. We do not collect personal data
              automatically.
            </p>
            <p className="mt-3">
              If you use the contact form, the information you provide (name,
              email, message) is sent directly through your email client. We do
              not store this data on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-accent mb-3">
              Embedded Content
            </h2>
            <p>
              This site embeds TikTok videos. When you view a page with embedded
              content, TikTok may collect data about your interaction with that
              content, including your IP address and browser information. This is
              governed by{" "}
              <a
                href="https://www.tiktok.com/legal/page/us/privacy-policy/en"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                TikTok&apos;s Privacy Policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-accent mb-3">
              Affiliate Links
            </h2>
            <p>
              Some links on this site are affiliate links. If you make a
              purchase through these links, we may earn a commission at no
              additional cost to you. These links are clearly labeled.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-accent mb-3">
              Third-Party Services
            </h2>
            <p>
              This site is hosted by IONOS. Their infrastructure may log
              standard server access data (IP addresses, timestamps, pages
              requested) as part of normal web hosting operations. See{" "}
              <a
                href="https://www.ionos.com/terms-gtc/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                IONOS Privacy Policy
              </a>{" "}
              for details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-accent mb-3">
              Your Rights
            </h2>
            <p>
              Since we don&apos;t collect or store personal data through this
              website, there is generally no personal data for us to provide,
              modify, or delete. If you&apos;ve contacted us via email, you can
              request deletion of that correspondence through the{" "}
              <Link href="/contact/" className="text-accent hover:underline">
                contact page
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-accent mb-3">
              Changes to This Policy
            </h2>
            <p>
              We may update this policy as the site grows. Changes will be
              posted on this page with an updated date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-accent mb-3">Contact</h2>
            <p>
              Questions about this policy? Reach out via the{" "}
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
