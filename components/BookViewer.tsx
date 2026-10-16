"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconTooltip } from "@/components/IconTooltip";
import { useStudy } from "@/lib/study-context";
import { ACTIVE_BOOK } from "@/lib/books/config";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const BOOK_PATH = `/${ACTIVE_BOOK.pdfFile}`;

export function BookViewer() {
  const { currentPage, numPages, setNumPages, navigationSource, goToPage } = useStudy();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>();
  const [showAgentBadge, setShowAgentBadge] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(Math.min(w - 40, 900));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Shows a temporary "following the voice agent" badge after an
  // agent-driven page jump, auto-hidden by the timer below.
  useEffect(() => {
    if (navigationSource !== "agent") return;
    const showTimer = setTimeout(() => setShowAgentBadge(true), 0);
    const hideTimer = setTimeout(() => setShowAgentBadge(false), 3000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [currentPage, navigationSource]);

  return (
    <div
      ref={containerRef}
      className="bg-dot-grid relative flex h-full w-full flex-col items-center overflow-auto bg-muted/20 px-14 py-8 sm:px-20"
    >
      {showAgentBadge && (
        <div className="pointer-events-none absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-opacity">
          📍 Following the voice agent
        </div>
      )}

      {/* Positioned relative to the page itself (not the scroll container),
          so the arrows always hug the book's actual edges regardless of
          viewport width. */}
      <div
        key={currentPage}
        className="relative animate-in fade-in zoom-in-[0.99] rounded-sm shadow-2xl ring-1 ring-foreground/10 duration-300"
      >
        <Document
          file={BOOK_PATH}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          loading={<Skeleton className="h-[700px] w-[600px] rounded-sm" />}
          error={
            <p className="p-8 text-sm text-destructive">
              Couldn&apos;t load the book PDF. Confirm {BOOK_PATH} exists.
            </p>
          }
        >
          <Page
            pageNumber={currentPage}
            width={width}
            renderAnnotationLayer={false}
            renderTextLayer
            loading={<Skeleton className="h-[700px] w-[600px] rounded-sm" />}
          />
        </Document>

        <IconTooltip label="Previous page">
          <Button
            size="icon-lg"
            className="absolute top-1/2 -left-12 -translate-y-1/2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 sm:-left-16"
            aria-label="Previous page"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </IconTooltip>
        <IconTooltip label="Next page">
          <Button
            size="icon-lg"
            className="absolute top-1/2 -right-12 -translate-y-1/2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 sm:-right-16"
            aria-label="Next page"
            disabled={numPages > 0 && currentPage >= numPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </IconTooltip>
      </div>

      {numPages === 0 && <p className="mt-3 text-xs text-muted-foreground">Loading book…</p>}
    </div>
  );
}
