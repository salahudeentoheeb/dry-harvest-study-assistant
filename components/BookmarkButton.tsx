"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IconTooltip } from "@/components/IconTooltip";
import { useStudy } from "@/lib/study-context";
import { pdfPageToBookLabel } from "@/lib/book-pages";

export function BookmarkButton() {
  const { currentPage, bookmarks, toggleBookmark, isBookmarked, goToPage } = useStudy();
  const saved = isBookmarked(currentPage);

  return (
    <Popover>
      <IconTooltip label={saved ? "Bookmarked — view saved pages" : "Bookmark this page"}>
        <PopoverTrigger render={<Button variant="ghost" size="icon" className="rounded-full" aria-label="Bookmarks" />}>
          {saved ? (
            <BookmarkCheck className="h-5 w-5 text-primary" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </PopoverTrigger>
      </IconTooltip>
      <PopoverContent align="end" className="w-60">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">Bookmarks</p>
          <Button
            variant="outline"
            size="sm"
            className="h-7 rounded-full px-2.5 text-xs"
            onClick={() => toggleBookmark(currentPage)}
          >
            {saved ? "Remove this page" : "Save this page"}
          </Button>
        </div>
        {bookmarks.length === 0 ? (
          <p className="text-xs text-muted-foreground">No saved pages yet.</p>
        ) : (
          <ul className="max-h-48 space-y-0.5 overflow-auto">
            {bookmarks.map((page) => (
              <li key={page}>
                <button
                  onClick={() => goToPage(page)}
                  className="w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  Page {pdfPageToBookLabel(page)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
