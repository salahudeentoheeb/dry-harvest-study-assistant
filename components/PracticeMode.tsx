"use client";

import { useMemo, useState } from "react";
import { Check, RotateCcw, Shuffle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconTooltip } from "@/components/IconTooltip";
import { getAllQaPairs, type QaPair } from "@/lib/qa-pairs";
import { ACTIVE_BOOK } from "@/lib/books/config";
import { cn } from "@/lib/utils";

const STATUS_KEY = `${ACTIVE_BOOK.id}:practice-status`;

type Status = Record<string, "known" | "learning">;

function readStatus(): Status {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STATUS_KEY) ?? "{}") as Status;
  } catch {
    return {};
  }
}

function shuffledIds(pool: QaPair[]): string[] {
  const ids = pool.map((p) => p.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

function buildDeck(all: QaPair[], learningOnly: boolean, status: Status): string[] {
  const pool = learningOnly ? all.filter((p) => status[p.id] !== "known") : all;
  return shuffledIds(pool);
}

export function PracticeMode({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const allPairs = useMemo(() => getAllQaPairs(), []);
  const pairsById = useMemo(() => new Map(allPairs.map((p) => [p.id, p])), [allPairs]);

  const [status, setStatus] = useState<Status>(() => readStatus());
  const [learningOnly, setLearningOnly] = useState(false);
  const [orderIds, setOrderIds] = useState<string[]>(() => buildDeck(allPairs, false, {}));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const currentPair = orderIds.length > 0 ? pairsById.get(orderIds[index]) : undefined;
  const knownCount = Object.values(status).filter((s) => s === "known").length;

  function grade(know: boolean) {
    if (!currentPair) return;
    const nextStatus: Status = { ...status, [currentPair.id]: know ? "known" : "learning" };
    setStatus(nextStatus);
    window.localStorage.setItem(STATUS_KEY, JSON.stringify(nextStatus));
    setFlipped(false);
    if (index + 1 >= orderIds.length) {
      setOrderIds(buildDeck(allPairs, learningOnly, nextStatus));
      setIndex(0);
    } else {
      setIndex(index + 1);
    }
  }

  function reshuffle(nextLearningOnly = learningOnly) {
    setOrderIds(buildDeck(allPairs, nextLearningOnly, status));
    setIndex(0);
    setFlipped(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl italic">Practice Mode</DialogTitle>
          <DialogDescription>
            {knownCount} of {allPairs.length} marked as known
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between">
          <div className="flex gap-1 rounded-full border bg-muted/50 p-0.5 text-xs">
            <button
              onClick={() => {
                setLearningOnly(false);
                reshuffle(false);
              }}
              className={cn(
                "rounded-full px-2.5 py-1 font-medium transition-colors",
                !learningOnly ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              All
            </button>
            <button
              onClick={() => {
                setLearningOnly(true);
                reshuffle(true);
              }}
              className={cn(
                "rounded-full px-2.5 py-1 font-medium transition-colors",
                learningOnly ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              Still learning
            </button>
          </div>
          <IconTooltip label="Shuffle deck">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => reshuffle()} aria-label="Shuffle">
              <Shuffle className="h-5 w-5" />
            </Button>
          </IconTooltip>
        </div>

        {currentPair ? (
          <>
            <button
              onClick={() => setFlipped((f) => !f)}
              className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border bg-gradient-to-b from-muted/30 to-transparent p-6 text-center transition-colors hover:bg-muted/40"
            >
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {flipped ? "Answer" : "Question"} · page {currentPair.page}
              </span>
              <p key={flipped ? "a" : "q"} className="animate-in fade-in text-base leading-snug duration-200">
                {flipped ? currentPair.answer : currentPair.question}
              </p>
              {!flipped && <span className="text-xs text-muted-foreground">Tap to reveal answer</span>}
            </button>

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                {index + 1} / {orderIds.length}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => grade(false)}>
                  <X className="mr-1 h-3.5 w-3.5 text-destructive" /> Still learning
                </Button>
                <Button size="sm" className="rounded-full" onClick={() => grade(true)}>
                  <Check className="mr-1 h-3.5 w-3.5" /> Got it
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <p>🎉 You&apos;ve marked every question as known.</p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => {
                setLearningOnly(false);
                reshuffle(false);
              }}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Review all again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
