import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <h1 className="text-8xl font-bold text-accent mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">
        This page doesn&apos;t exist yet.
      </h2>
      <p className="text-muted max-w-md mb-2">
        Look, I design buildings for a living. Sometimes the blueprints say
        there&apos;s a room here, but the contractor hasn&apos;t built it yet.
      </p>
      <p className="text-muted max-w-md mb-8">
        You&apos;re standing in that room right now.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-accent text-background font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Back to the Lobby
        </Link>
        <a
          href="https://www.tiktok.com/@tiktokarchitect"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 border border-border text-foreground font-semibold rounded-lg hover:bg-card transition-colors"
        >
          Watch TikTok Instead
        </a>
      </div>
      <p className="text-muted/40 text-sm mt-16">
        &ldquo;Some architects design buildings about a story. Few design
        buildings that tell a story.&rdquo;
      </p>
    </div>
  );
}
