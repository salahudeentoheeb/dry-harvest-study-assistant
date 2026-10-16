"use client";

import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudy } from "@/lib/study-context";
import { BookmarkButton } from "@/components/BookmarkButton";
import { NotesButton } from "@/components/NotesButton";
import { pdfPageToBookLabel } from "@/lib/book-pages";

export function PageControls() {
  const { currentPage, numPages, goToPage } = useStudy();

  // Global left/right arrow-key paging — the visible prev/next controls
  // live as overlay buttons flanking the book itself (see BookViewer.tsx).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (e.key === "ArrowLeft") goToPage(currentPage - 1);
      if (e.key === "ArrowRight") goToPage(currentPage + 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentPage, goToPage]);

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b bg-card px-3 py-2">
      <div />

      <div className="flex items-center justify-self-center gap-2">
        {numPages > 0 ? (
          <Select value={String(currentPage)} onValueChange={(v) => goToPage(Number(v))}>
            <SelectTrigger className="h-8 rounded-full border-none bg-muted/50 px-3" aria-label="Jump to page">
              {/* Select.Value shows the raw stored value by default — format it
                  to the book's printed page number to match the open list. */}
              <SelectValue>{(value: string) => `Page ${pdfPageToBookLabel(Number(value))}`}</SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                <SelectItem key={p} value={String(p)}>
                  Page {pdfPageToBookLabel(p)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-xs text-muted-foreground">Loading…</span>
        )}
        <span className="rounded-full bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground tabular-nums">
          {pdfPageToBookLabel(currentPage)} / {numPages || "…"}
        </span>
      </div>

      <div className="flex items-center justify-self-end gap-0.5">
        <NotesButton />
        <BookmarkButton />
      </div>
    </div>
  );
}
