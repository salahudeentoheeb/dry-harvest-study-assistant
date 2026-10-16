import { ACTIVE_BOOK } from "@/lib/books/config";

function toRoman(n: number): string {
  const numerals: [number, string][] = [
    [1000, "m"],
    [900, "cm"],
    [500, "d"],
    [400, "cd"],
    [100, "c"],
    [90, "xc"],
    [50, "l"],
    [40, "xl"],
    [10, "x"],
    [9, "ix"],
    [5, "v"],
    [4, "iv"],
    [1, "i"],
  ];
  let result = "";
  let remaining = n;
  for (const [value, symbol] of numerals) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}

/**
 * PDF page index -> the label printed on that page in the book itself.
 * Covers all 5 book layouts with one formula: an unnumbered cover, then
 * roman-numeral front matter, then Arabic body numbers restarting at 1.
 * Any page that doesn't resolve to a positive body number (the literal
 * cover/back-cover, or a stray unnumbered page some books have between
 * front matter and body) falls back to "Cover" rather than showing a
 * confusing 0 or negative number.
 */
export function pdfPageToBookLabel(pdfPage: number): string {
  const { frontMatterStart, frontMatterEnd, romanStart, bodyOffset, backCoverFromPdfPage } =
    ACTIVE_BOOK.pageNumbering;
  if (pdfPage < frontMatterStart || (backCoverFromPdfPage !== undefined && pdfPage >= backCoverFromPdfPage)) {
    return "Cover";
  }
  if (pdfPage <= frontMatterEnd) {
    return toRoman(pdfPage - frontMatterStart + romanStart);
  }
  const bodyPage = pdfPage - bodyOffset;
  return bodyPage >= 1 ? String(bodyPage) : "Cover";
}

/** The book's own printed (Arabic, main-body) page number -> the PDF page index that renders it. */
export function bookPageToPdfPage(bookPage: number): number {
  return bookPage + ACTIVE_BOOK.pageNumbering.bodyOffset;
}

/** Highest numeric body page a student can type/jump to, given the PDF's total page count. */
export function getMaxBookPage(numPages: number): number {
  return numPages - 1 - ACTIVE_BOOK.pageNumbering.bodyOffset;
}
