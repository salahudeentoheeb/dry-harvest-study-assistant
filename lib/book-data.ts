import { ACTIVE_BOOK } from "@/lib/books/config";
import dryHarvestBook from "@/data/dry-harvest/book-index.json";
import dryHarvestQa from "@/data/dry-harvest/qa-index.json";
import dryHarvestQaPairs from "@/data/dry-harvest/qa-pairs.json";

export type PageIndex = {
  pages: Record<string, string>;
  numPages: number;
  generatedAt: string;
};

const BOOK_INDEXES: Record<string, PageIndex> = {
  "dry-harvest": dryHarvestBook,
};

const QA_INDEXES: Record<string, PageIndex> = {
  "dry-harvest": dryHarvestQa,
};

export type QaPair = { id: string; question: string; answer: string; page: number };
type QaPairsFile = { pairs: QaPair[]; generatedAt: string };

const QA_PAIRS: Record<string, QaPairsFile> = {
  "dry-harvest": dryHarvestQaPairs,
};

export const book = BOOK_INDEXES[ACTIVE_BOOK.id];
export const qa = QA_INDEXES[ACTIVE_BOOK.id];
export const qaPairs = QA_PAIRS[ACTIVE_BOOK.id].pairs;
