// ─────────────────────────────────────────────────────────────────
//  Root Layout
//  Loads fonts (Nunito, Inter, JetBrains Mono) from Google Fonts,
//  wraps app in all providers. PRD Section 9.2 typography spec.
// ─────────────────────────────────────────────────────────────────
import type { Metadata } from "next";
import { Nunito, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CreativeAI — AI Creative Studio for Everyone",
    template: "%s | CreativeAI",
  },
  description:
    "Generate stunning AI images, animate them into videos, and edit with one-click tools. No design skills needed. Start free.",
  keywords: ["AI art", "AI image generator", "AI creative studio", "text to image", "free AI art"],
  openGraph: {
    title: "CreativeAI — AI Creative Studio for Everyone",
    description: "Generate stunning AI images, animate them into videos, and edit with one-click tools.",
    type: "website",
    siteName: "CreativeAI",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${inter.variable} ${jetBrainsMono.variable}`}>
      <body className="bg-background font-body text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
