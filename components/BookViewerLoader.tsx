"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// react-pdf/pdfjs-dist depends on browser-only APIs (DOMMatrix, canvas, etc.)
// that don't exist during server-side prerendering, so it must load client-only.
export const BookViewerLoader = dynamic(
  () => import("@/components/BookViewer").then((m) => m.BookViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted/30 p-6">
        <Skeleton className="h-[700px] w-[600px] rounded-lg" />
      </div>
    ),
  }
);
