"use client";

import { useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Moon,
  Search as SearchIcon,
  Sparkles,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useStudy } from "@/lib/study-context";
import { toggleDarkMode } from "@/lib/theme";
import { bookPageToPdfPage, getMaxBookPage } from "@/lib/book-pages";

export function CommandPalette({
  open,
  onOpenChange,
  onOpenPractice,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenPractice?: () => void;
}) {
  const { currentPage, numPages, goToPage, toggleBookmark, isBookmarked } = useStudy();
  const [search, setSearch] = useState("");

  const trimmed = search.trim();
  // Typed numbers are interpreted as the book's own printed page numbers
  // (what's actually shown on the page), not the raw PDF page index.
  const asBookPage = /^\d{1,4}$/.test(trimmed) ? Number(trimmed) : null;
  const maxBookPage = numPages > 0 ? getMaxBookPage(numPages) : 0;
  const isValidPage = asBookPage !== null && asBookPage >= 1 && (numPages === 0 || asBookPage <= maxBookPage);

  function run(action: () => void) {
    action();
    onOpenChange(false);
    setSearch("");
  }

  async function searchBookAndJump(query: string) {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const { results } = (await res.json()) as { results: { page: number }[] };
      if (results[0]) goToPage(results[0].page);
    } catch {
      // best-effort — no-op on failure
    }
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Jump to a page, search the book, or run a quick action"
    >
      <Command>
        <CommandInput
          placeholder="Jump to a page, search, or run a command…"
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>

          {isValidPage && (
            <CommandGroup heading="Navigate">
              <CommandItem
                value={`jump-${asBookPage}`}
                onSelect={() => run(() => goToPage(bookPageToPdfPage(asBookPage)))}
              >
                <ChevronRight className="opacity-60" /> Jump to page {asBookPage}
              </CommandItem>
            </CommandGroup>
          )}

          {trimmed.length > 1 && !isValidPage && (
            <CommandGroup heading="Search">
              <CommandItem value={`search-${trimmed}`} onSelect={() => run(() => searchBookAndJump(trimmed))}>
                <SearchIcon className="opacity-60" /> Search book for &ldquo;{trimmed}&rdquo;
              </CommandItem>
            </CommandGroup>
          )}

          <CommandSeparator />

          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => run(() => goToPage(currentPage - 1))}>
              <ChevronLeft className="opacity-60" /> Previous page
            </CommandItem>
            <CommandItem onSelect={() => run(() => goToPage(currentPage + 1))}>
              <ChevronRight className="opacity-60" /> Next page
            </CommandItem>
            <CommandItem onSelect={() => run(() => toggleBookmark(currentPage))}>
              {isBookmarked(currentPage) ? (
                <BookmarkCheck className="opacity-60" />
              ) : (
                <Bookmark className="opacity-60" />
              )}
              {isBookmarked(currentPage) ? "Remove bookmark" : "Bookmark this page"}
            </CommandItem>
            {onOpenPractice && (
              <CommandItem onSelect={() => run(onOpenPractice)}>
                <Sparkles className="opacity-60" /> Open Practice Mode
              </CommandItem>
            )}
            <CommandItem onSelect={() => run(() => toggleDarkMode())}>
              <Moon className="opacity-60" /> Toggle dark mode
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
