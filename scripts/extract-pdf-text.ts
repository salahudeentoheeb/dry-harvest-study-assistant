// Run with: npm run extract (regenerates data/dry-harvest/*.json from the
// source PDF below).
// Extracts per-page plain text from the book's source PDF into
// data/dry-harvest/*.json, which power page-aware chat context, in-book
// search, and the voice agent's "jump to concept" client tool.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { ACTIVE_BOOK } from "../lib/books/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Local-only: where the book's original source PDF lives.
// Not part of lib/books/config.ts since the deployed app never reads this
// path — only this one-time local extraction step does.
const SOURCE_PDFS: Record<string, { book: string; qa?: string }> = {
  "dry-harvest": {
    book: "DRY HARVEST MAGT GUIDE-Full Book.pdf",
  },
};

type PageIndex = {
  pages: Record<number, string>;
  numPages: number;
  generatedAt: string;
};

// The PMIC and PMII source PDFs use fonts whose "ti" ligature glyph has no
// ToUnicode mapping, so pdfjs falls back to whatever raw glyph ID the font
// happens to use for it — U+0013 in the Q&A doc, U+001A throughout the book,
// and (in one section of the Q&A doc) a collision with the "%" glyph. The
// two control characters never occur legitimately, so they're always safe
// to fix. "%" is only fixed when immediately followed by a lowercase letter
// (e.g. "Ques%ons") — genuine percentages are always followed by
// whitespace/punctuation (e.g. "98%."). Harmless no-op on books that don't
// have this font issue (confirmed for all 4 new books before relying on it).
function fixTiLigature(text: string): string {
  return text.replace(/[\x13\x1a]/g, "ti").replace(/%(?=[a-z])/g, "ti");
}

async function extractPages(pdfPath: string): Promise<PageIndex> {
  const data = new Uint8Array(await (await import("node:fs/promises")).readFile(pdfPath));
  const doc = await getDocument({ data }).promise;
  const pages: Record<number, string> = {};

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = fixTiLigature(
      content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    );
    pages[pageNumber] = text;
  }

  return { pages, numPages: doc.numPages, generatedAt: new Date().toISOString() };
}

type QaPair = { id: string; question: string; answer: string; page: number };

// The practice Q&A doc is formatted as "<N>. <question> Answer: <answer>"
// repeated down each page (occasionally interrupted by "SECTION X:" headers).
// Parsing it into discrete pairs powers Practice Mode (flashcard-style
// self-review) without needing another AI call.
function parseQaPairs(pages: Record<number, string>): QaPair[] {
  const pairs: QaPair[] = [];
  // Page text is already whitespace-flattened to a single line (no newlines
  // survive the earlier `.replace(/\s+/g, " ")`), so `.` alone matches
  // everything here — no need for the dotAll flag.
  const pattern = /(\d{1,3})\.\s+(.+?)\s+Answer\s*:\s*(.+?)(?=\s\d{1,3}\.\s|$)/g;

  for (const [pageStr, text] of Object.entries(pages)) {
    const page = Number(pageStr);
    for (const match of text.matchAll(pattern)) {
      const [, number, question, answer] = match;
      const cleanQuestion = question.replace(/\s+/g, " ").trim();
      const cleanAnswer = answer.replace(/\s+/g, " ").trim();
      if (cleanQuestion.length < 5 || cleanAnswer.length < 2) continue;
      pairs.push({ id: `${page}-${number}`, question: cleanQuestion, answer: cleanAnswer, page });
    }
  }
  return pairs;
}

function emptyPageIndex(): PageIndex {
  return { pages: {}, numPages: 0, generatedAt: new Date().toISOString() };
}

async function main() {
  const source = SOURCE_PDFS[ACTIVE_BOOK.id];
  if (!source) throw new Error(`No source PDFs configured for book "${ACTIVE_BOOK.id}"`);

  const dataDir = path.join(ROOT, "data", ACTIVE_BOOK.id);
  await mkdir(dataDir, { recursive: true });

  const bookPath = path.join(ROOT, source.book);
  console.log(`Extracting book text (${ACTIVE_BOOK.id}) from`, bookPath);
  const bookIndex = await extractPages(bookPath);
  await writeFile(path.join(dataDir, "book-index.json"), JSON.stringify(bookIndex, null, 2));
  console.log(`  -> ${bookIndex.numPages} pages written to data/${ACTIVE_BOOK.id}/book-index.json`);

  let qaIndex: PageIndex;
  if (source.qa) {
    const qaPath = path.join(ROOT, source.qa);
    console.log("Extracting practice Q&A text from", qaPath);
    qaIndex = await extractPages(qaPath);
  } else {
    console.log("No companion Q&A PDF for this book — writing empty placeholder data.");
    qaIndex = emptyPageIndex();
  }
  await writeFile(path.join(dataDir, "qa-index.json"), JSON.stringify(qaIndex, null, 2));
  console.log(`  -> ${qaIndex.numPages} pages written to data/${ACTIVE_BOOK.id}/qa-index.json`);

  const pairs = source.qa ? parseQaPairs(qaIndex.pages) : [];
  await writeFile(
    path.join(dataDir, "qa-pairs.json"),
    JSON.stringify({ pairs, generatedAt: new Date().toISOString() }, null, 2)
  );
  console.log(`  -> ${pairs.length} Q&A pairs written to data/${ACTIVE_BOOK.id}/qa-pairs.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
