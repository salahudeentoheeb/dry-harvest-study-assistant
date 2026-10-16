"use client";

import { useEffect, useRef, useState } from "react";
import { useStudy } from "@/lib/study-context";

const MILESTONES = [25, 50, 75, 100];

export function ProgressBar() {
  const { progressPercent, streakDays } = useStudy();
  const [toast, setToast] = useState<string | null>(null);
  const seenMilestones = useRef(new Set<number>());

  useEffect(() => {
    const hit = MILESTONES.find(
      (m) => progressPercent >= m && !seenMilestones.current.has(m)
    );
    if (hit) {
      seenMilestones.current.add(hit);
      setToast(hit === 100 ? "🎉 You've reached the end of the book!" : `Nice — ${hit}% through the book`);
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [progressPercent]);

  return (
    <div className="relative border-b bg-card px-4 py-2">
      <div className="flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs font-medium tabular-nums text-muted-foreground">{progressPercent}%</span>
        {streakDays > 1 && (
          <span className="flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground whitespace-nowrap">
            🔥 {streakDays}-day streak
          </span>
        )}
      </div>
      {toast && (
        <div className="absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 rounded-md border bg-popover px-3 py-1.5 text-xs shadow-md animate-in fade-in slide-in-from-top-1">
          {toast}
        </div>
      )}
    </div>
  );
}
