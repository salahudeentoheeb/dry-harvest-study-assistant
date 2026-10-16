"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IconTooltip } from "@/components/IconTooltip";
import { ACTIVE_BOOK } from "@/lib/books/config";

const DURATION = 25 * 60;
const SESSIONS_KEY = `${ACTIVE_BOOK.id}:timerSessions`;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readSessionsToday(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = JSON.parse(window.localStorage.getItem(SESSIONS_KEY) ?? "{}") as Record<string, number>;
    return raw[todayKey()] ?? 0;
  } catch {
    return 0;
  }
}

function incrementSessionsToday(): number {
  let raw: Record<string, number> = {};
  try {
    raw = JSON.parse(window.localStorage.getItem(SESSIONS_KEY) ?? "{}");
  } catch {
    raw = {};
  }
  const next = (raw[todayKey()] ?? 0) + 1;
  raw[todayKey()] = next;
  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(raw));
  return next;
}

export function StudyTimer() {
  const [secondsLeft, setSecondsLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(() => readSessionsToday());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          setSessionsToday(incrementSessionsToday());
          return DURATION;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <Popover>
      <IconTooltip label="Study timer">
        <PopoverTrigger
          render={<Button variant="ghost" size="icon-lg" className="rounded-full" aria-label="Study timer" />}
        >
          <Clock className="h-6 w-6" />
        </PopoverTrigger>
      </IconTooltip>
      <PopoverContent align="end" className="w-56">
        <div className="flex flex-col items-center gap-3 py-1">
          <p className="font-heading text-3xl tabular-nums">
            {mm}:{ss}
          </p>
          <div className="flex gap-2">
            <Button size="sm" className="rounded-full" onClick={() => setRunning((r) => !r)}>
              {running ? "Pause" : "Start focus"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => {
                setRunning(false);
                setSecondsLeft(DURATION);
              }}
            >
              Reset
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {sessionsToday} session{sessionsToday === 1 ? "" : "s"} completed today
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
