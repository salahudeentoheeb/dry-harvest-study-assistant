"use client";

import { useEffect, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StudyTimer } from "@/components/StudyTimer";
import { PracticeMode } from "@/components/PracticeMode";
import { CommandPalette } from "@/components/CommandPalette";
import { IconTooltip } from "@/components/IconTooltip";
import { ACTIVE_BOOK } from "@/lib/books/config";

export function HeaderActions() {
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="default"
        className="hidden rounded-full text-muted-foreground sm:flex"
        onClick={() => setPaletteOpen(true)}
      >
        <Search className="h-5 w-5" />
        <span className="text-primary">Search</span>
        <kbd className="text-primary ml-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
      </Button>
      <IconTooltip label="Search & jump to page">
        <Button
          variant="ghost"
          size="icon-lg"
          className="rounded-full sm:hidden"
          aria-label="Search"
          onClick={() => setPaletteOpen(true)}
        >
          <Search className="h-6 w-6" />
        </Button>
      </IconTooltip>
      {ACTIVE_BOOK.hasQaData && (
        <IconTooltip label="Practice Mode — flashcard review">
          <Button
            variant="ghost"
            size="icon-lg"
            className="rounded-full"
            aria-label="Practice Mode"
            onClick={() => setPracticeOpen(true)}
          >
            <Sparkles className="h-6 w-6" />
          </Button>
        </IconTooltip>
      )}
      <StudyTimer />
      <ThemeToggle />

      {ACTIVE_BOOK.hasQaData && <PracticeMode open={practiceOpen} onOpenChange={setPracticeOpen} />}
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onOpenPractice={ACTIVE_BOOK.hasQaData ? () => setPracticeOpen(true) : undefined}
      />
    </div>
  );
}
