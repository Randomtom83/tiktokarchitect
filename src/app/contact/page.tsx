"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";

function generateChallenge() {
  const a = Math.floor(Math.random() * 10) + 2;
  const b = Math.floor(Math.random() * 10) + 1;
  return { a, b, answer: a + b };
}

export default function ContactPage() {
  const [challenge, setChallenge] = useState({ a: 0, b: 0, answer: 0 });
  const [humanAnswer, setHumanAnswer] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setChallenge(generateChallenge());
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    // Validate human check
    if (parseInt(humanAnswer) !== challenge.answer) {
      setErrorMsg("That math doesn't add up. Try again.");
      setChallenge(generateChallenge());
      setHumanAnswer("");
      return;
    }

    // Validate fields
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg("Fill out the required fields.");
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("That email doesn't look right.");
      return;
    }

    // Build mailto link with form data
    const subjectLine = subject.trim()
      ? subject.trim()
      : `Contact from ${name.trim()}`;
    const body = `From: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`;
    const mailto = `mailto:TReynolds@GreenStoriesLLC.com?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <h1 className="text-3xl font-bold text-accent mb-4">Got it.</h1>
        <p className="text-muted max-w-md mb-2">
          Your email client should have opened with the message ready to send.
        </p>
        <p className="text-muted max-w-md mb-8">
          If it didn&apos;t, you can reach me directly at{" "}
          <a
            href="mailto:TReynolds@GreenStoriesLLC.com"
            className="text-accent hover:underline"
          >
            TReynolds@GreenStoriesLLC.com
          </a>
        </p>
        <Link
          href="/"
          className="px-6 py-3 border border-border text-foreground font-semibold rounded-lg hover:bg-card transition-colors"
        >
          Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-20">
      <div className="w-full max-w-lg">
        <Link
          href="/"
          className="text-muted hover:text-accent transition-colors text-sm mb-8 inline-block"
        >
          &larr; Back
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Get in Touch</h1>
        <p className="text-muted mb-10">
          Business inquiries, collaborations, speaking — whatever it is.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Name <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted/50 focus:outline-none focus:border-accent transition-colors"
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Email <span className="text-accent">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted/50 focus:outline-none focus:border-accent transition-colors"
              placeholder="you@email.com"
            />
          </div>

          {/* Subject */}
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted/50 focus:outline-none focus:border-accent transition-colors"
              placeholder="What's this about?"
            />
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Message <span className="text-accent">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted/50 focus:outline-none focus:border-accent transition-colors resize-vertical"
              placeholder="Say what you need to say."
            />
          </div>

          {/* Human verification */}
          <div className="p-4 bg-card border border-border rounded-lg">
            <label
              htmlFor="human"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Prove you&apos;re not a bot:{" "}
              <span className="text-accent font-mono">
                {challenge.a} + {challenge.b} = ?
              </span>
            </label>
            <input
              type="text"
              id="human"
              value={humanAnswer}
              onChange={(e) => setHumanAnswer(e.target.value)}
              required
              inputMode="numeric"
              className="w-24 px-4 py-3 bg-background border border-border rounded-lg text-foreground text-center font-mono focus:outline-none focus:border-accent transition-colors"
              placeholder="?"
            />
          </div>

          {/* Error */}
          {errorMsg && (
            <p className="text-red-400 text-sm">{errorMsg}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-accent text-background font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
