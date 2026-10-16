import { book, qa, type PageIndex } from "@/lib/book-data";

export type { PageIndex };

export function getBookPageCount(): number {
  return book.numPages;
}

export function getBookPageText(pageNumber: number): string {
  return book.pages[String(pageNumber)] ?? "";
}

/** Current page plus `radius` neighboring pages on each side, concatenated for LLM context. */
export function getPageContext(pageNumber: number, radius = 1): string {
  const chunks: string[] = [];
  for (let p = pageNumber - radius; p <= pageNumber + radius; p++) {
    const text = book.pages[String(p)];
    if (text) chunks.push(`[Book page ${p}]\n${text}`);
  }
  return chunks.join("\n\n");
}

export type SearchResult = { page: number; snippet: string; score: number };

function scorePage(text: string, terms: string[]): number {
  const lower = text.toLowerCase();
  return terms.reduce((score, term) => score + (lower.includes(term) ? 1 : 0), 0);
}

function snippetAround(text: string, term: string, length = 220): string {
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text.slice(0, length);
  const start = Math.max(0, idx - 60);
  return (start > 0 ? "…" : "") + text.slice(start, start + length) + "…";
}

/** Simple keyword search over the book's page text — powers in-book search and the
 * voice agent's "jump to the page discussing this concept" client tool. */
export function searchBookPages(query: string, limit = 3): SearchResult[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);
  if (terms.length === 0) return [];

  const results: SearchResult[] = [];
  for (const [pageStr, text] of Object.entries(book.pages)) {
    const score = scorePage(text, terms);
    if (score > 0) {
      results.push({ page: Number(pageStr), snippet: snippetAround(text, terms[0]), score });
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Best-matching practice Q&A pages for a question, used to ground quizzing/answers. */
export function searchQaPages(query: string, limit = 2): SearchResult[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);
  if (terms.length === 0) return [];

  const results: SearchResult[] = [];
  for (const [pageStr, text] of Object.entries(qa.pages)) {
    const score = scorePage(text, terms);
    if (score > 0) {
      results.push({ page: Number(pageStr), snippet: snippetAround(text, terms[0]), score });
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function getQaPageText(pageNumber: number): string {
  return qa.pages[String(pageNumber)] ?? "";
}

export function getRandomQaPage(): { page: number; text: string } {
  const pageNumbers = Object.keys(qa.pages).filter((p) => qa.pages[p]?.trim());
  const pick = pageNumbers[Math.floor(Math.random() * pageNumbers.length)];
  return { page: Number(pick), text: qa.pages[pick] };
}
