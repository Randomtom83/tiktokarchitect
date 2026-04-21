import type { Metadata } from "next";
import { Fraunces, Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TikTokArchitect | Tom Reynolds",
  description:
    "Architectural designer. Educator. Only 2% of licensed architects in the US are Black. I'm working to change that.",
  openGraph: {
    title: "TikTokArchitect | Tom Reynolds",
    description:
      "Architectural designer. Educator. Only 2% of licensed architects in the US are Black. I'm working to change that.",
    url: "https://www.tiktokarchitect.com",
    siteName: "TikTokArchitect",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${archivo.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
