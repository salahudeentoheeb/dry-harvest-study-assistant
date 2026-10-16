"use client";

import { useEffect, useState } from "react";
import { NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { IconTooltip } from "@/components/IconTooltip";
import { useStudy } from "@/lib/study-context";
import { pdfPageToBookLabel } from "@/lib/book-pages";
import { ACTIVE_BOOK } from "@/lib/books/config";
import { cn } from "@/lib/utils";

const NOTES_KEY = `${ACTIVE_BOOK.id}:notes`;

function readNotes(): Record<number, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(NOTES_KEY) ?? "{}") as Record<number, string>;
  } catch {
    return {};
  }
}

export function NotesButton() {
  const { currentPage } = useStudy();
  // Starts empty (matches SSR) — restored from localStorage after mount so
  // the "has a note" indicator doesn't cause a hydration mismatch.
  const [notes, setNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotes(readNotes());
  }, []);

  const hasNote = Boolean(notes[currentPage]?.trim());

  function updateNote(text: string) {
    const next = { ...notes, [currentPage]: text };
    setNotes(next);
    window.localStorage.setItem(NOTES_KEY, JSON.stringify(next));
  }

  return (
    <Popover>
      <IconTooltip label={hasNote ? "Edit note for this page" : "Add a note for this page"}>
        <PopoverTrigger
          render={<Button variant="ghost" size="icon" className="rounded-full" aria-label="Page notes" />}
        >
          <NotebookPen className={cn("h-5 w-5", hasNote && "text-primary")} />
        </PopoverTrigger>
      </IconTooltip>
      <PopoverContent align="end" className="w-64">
        <p className="mb-2 text-sm font-medium">Notes — page {pdfPageToBookLabel(currentPage)}</p>
        <Textarea
          value={notes[currentPage] ?? ""}
          onChange={(e) => updateNote(e.target.value)}
          placeholder="Jot down anything about this page…"
          className="min-h-24 text-sm"
        />
      </PopoverContent>
    </Popover>
  );
}
