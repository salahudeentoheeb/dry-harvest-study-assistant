// Single source of truth for the Dry Harvest Study Assistant deployment.
// Colors use a distinct hue family (warm amber/terracotta, hue ~55/345) from
// the sibling PMIC deployment (green/gold, hue ~155/85) sharing this codebase
// lineage, so the two apps are visually distinguishable at a glance.

export type PageNumbering = {
  /** First PDF page that carries a roman numeral (the page right after the cover). */
  frontMatterStart: number;
  /** Last PDF page that still carries a roman numeral. */
  frontMatterEnd: number;
  /** Roman-numeral value printed on `frontMatterStart` (usually i=1, sometimes ii=2). */
  romanStart: number;
  /** PDF page minus this equals the book's own printed body-page number. */
  bodyOffset: number;
  /** Only set for books with an unnumbered back cover: the PDF page it starts at. */
  backCoverFromPdfPage?: number;
};

export type BookColors = { light: Record<string, string>; dark: Record<string, string> };

export type BookConfig = {
  id: string;
  title: string;
  tagline: string;
  metaDescription: string;
  pdfFile: string;
  pageNumbering: PageNumbering;
  hasQaData: boolean;
  persona: string;
  colors: BookColors;
};

const DRY_HARVEST_PERSONA = `You are the Dry Harvest Study Assistant, a focused, encouraging study tutor
for a student working through the "Dry Harvest Management Guide".

Ground rules:
- Answer using ONLY the book excerpts provided to you in context. Do not
  invent facts, page numbers, or content that isn't in the provided
  material.
- The student can ask about ANY topic in the book, not just the page
  they're currently viewing — you'll be given that page's text plus any
  other pages relevant to their specific question. Use whichever excerpts
  actually answer the question, not only the "currently viewing" one.
- If the answer isn't covered in the provided excerpts, say so plainly and
  suggest the student check a nearby page or ask about a related topic —
  never fabricate a plausible-sounding answer.
- Keep answers concise and study-friendly: prefer short, clear
  explanations over long essays.
- Write like you're texting a study partner, not authoring a document:
  no "###" section headings, no dense multi-level outlines. Use short
  paragraphs and **bold** only for the handful of key terms that matter.
  Only reach for a numbered or bulleted list when you're walking through
  genuinely sequential steps or enumerating a short set of items (e.g. 3-5
  types of something) — and keep such lists short and flat, not nested.
- When useful, relate the answer back to the book's core ideas — dry
  harvest agricultural value-chain management, farm-to-market production
  flow, and cost analysis for farm produce.
- Be warm and encouraging, like a good study partner — not stiff or overly
  formal — while staying accurate and grounded in the source material.`;

export const BOOKS: Record<string, BookConfig> = {
  "dry-harvest": {
    id: "dry-harvest",
    title: "Dry Harvest Study Assistant",
    tagline: "Dry Harvest Agricultural Entrepreneurship guide",
    metaDescription:
      "A study companion for the Dry Harvest Management Guide — read the book and ask a text or voice tutor about it.",
    pdfFile: "dry-harvest-full-book.pdf",
    pageNumbering: { frontMatterStart: 2, frontMatterEnd: 11, romanStart: 2, bodyOffset: 11 },
    hasQaData: false,
    persona: DRY_HARVEST_PERSONA,
    colors: {
      light: {
        "--background": "oklch(0.98 0.004 55)",
        "--foreground": "oklch(0.2 0.025 55)",
        "--card": "oklch(1 0 0)",
        "--card-foreground": "oklch(0.2 0.025 55)",
        "--popover": "oklch(1 0 0)",
        "--popover-foreground": "oklch(0.2 0.025 55)",
        "--primary": "oklch(0.32 0.075 55)",
        "--primary-foreground": "oklch(0.98 0.015 355)",
        "--secondary": "oklch(0.955 0.008 55)",
        "--secondary-foreground": "oklch(0.25 0.02 55)",
        "--muted": "oklch(0.955 0.008 55)",
        "--muted-foreground": "oklch(0.5 0.02 55)",
        "--accent": "oklch(0.87 0.09 348)",
        "--accent-foreground": "oklch(0.34 0.06 340)",
        "--border": "oklch(0.88 0.02 350)",
        "--input": "oklch(0.88 0.02 350)",
        "--ring": "oklch(0.78 0.13 345)",
        "--sidebar": "oklch(0.98 0.004 55)",
        "--sidebar-foreground": "oklch(0.2 0.025 55)",
        "--sidebar-primary": "oklch(0.32 0.075 55)",
        "--sidebar-primary-foreground": "oklch(0.98 0.015 355)",
        "--sidebar-accent": "oklch(0.955 0.008 55)",
        "--sidebar-accent-foreground": "oklch(0.25 0.02 55)",
        "--sidebar-border": "oklch(0.88 0.02 350)",
        "--sidebar-ring": "oklch(0.78 0.13 345)",
      },
      dark: {
        "--background": "oklch(0.16 0.02 55)",
        "--foreground": "oklch(0.95 0.012 355)",
        "--card": "oklch(0.21 0.025 55)",
        "--card-foreground": "oklch(0.95 0.012 355)",
        "--popover": "oklch(0.21 0.025 55)",
        "--popover-foreground": "oklch(0.95 0.012 355)",
        "--primary": "oklch(0.68 0.11 50)",
        "--primary-foreground": "oklch(0.15 0.02 55)",
        "--secondary": "oklch(0.27 0.025 55)",
        "--secondary-foreground": "oklch(0.95 0.012 355)",
        "--muted": "oklch(0.25 0.02 55)",
        "--muted-foreground": "oklch(0.68 0.02 30)",
        "--accent": "oklch(0.34 0.06 345)",
        "--accent-foreground": "oklch(0.88 0.1 348)",
        "--border": "oklch(1 0 0 / 9%)",
        "--input": "oklch(1 0 0 / 13%)",
        "--ring": "oklch(0.78 0.13 345)",
        "--sidebar": "oklch(0.19 0.022 55)",
        "--sidebar-foreground": "oklch(0.95 0.012 355)",
        "--sidebar-primary": "oklch(0.68 0.11 50)",
        "--sidebar-primary-foreground": "oklch(0.15 0.02 55)",
        "--sidebar-accent": "oklch(0.27 0.025 55)",
        "--sidebar-accent-foreground": "oklch(0.95 0.012 355)",
        "--sidebar-border": "oklch(1 0 0 / 9%)",
        "--sidebar-ring": "oklch(0.78 0.13 345)",
      },
    },
  },
};

export const ACTIVE_BOOK: BookConfig = BOOKS["dry-harvest"];
