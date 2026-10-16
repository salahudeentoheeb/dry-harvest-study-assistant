import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { StudyProvider } from "@/lib/study-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ACTIVE_BOOK } from "@/lib/books/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: ACTIVE_BOOK.title,
  description: ACTIVE_BOOK.metaDescription,
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("${ACTIVE_BOOK.id}:theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

// !important, not source order, is what makes this win over the matching
// :root/.dark rules in globals.css — Next.js controls where it actually
// injects that stylesheet's <link> relative to anything we render in <head>
// JSX, so relying on JSX order alone isn't reliable.
function cssBlock(selector: string, vars: Record<string, string>): string {
  const body = Object.entries(vars)
    .map(([k, v]) => `${k}:${v} !important;`)
    .join("");
  return `${selector}{${body}}`;
}

const BOOK_COLORS_STYLE = cssBlock(":root", ACTIVE_BOOK.colors.light) + cssBlock(".dark", ACTIVE_BOOK.colors.dark);

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: BOOK_COLORS_STYLE }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <TooltipProvider delay={200}>
          <StudyProvider>{children}</StudyProvider>
        </TooltipProvider>
        <Analytics />
        <Script src="https://unpkg.com/@elevenlabs/convai-widget-embed" strategy="afterInteractive" />
      </body>
    </html>
  );
}
