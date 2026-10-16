"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ACTIVE_BOOK } from "@/lib/books/config";

export type ChatMessage = { role: "user" | "model"; content: string };
export type NavigationSource = "manual" | "agent";

type StudyContextValue = {
  numPages: number;
  setNumPages: (n: number) => void;
  currentPage: number;
  navigationSource: NavigationSource;
  goToPage: (page: number, source?: NavigationSource) => void;
  furthestPage: number;
  progressPercent: number;
  bookmarks: number[];
  toggleBookmark: (page: number) => void;
  isBookmarked: (page: number) => boolean;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  streakDays: number;
};

const StudyContext = createContext<StudyContextValue | null>(null);

const LAST_PAGE_KEY = `${ACTIVE_BOOK.id}:lastPage`;
const PROGRESS_KEY = `${ACTIVE_BOOK.id}:progress`;
const BOOKMARKS_KEY = `${ACTIVE_BOOK.id}:bookmarks`;
const VISITED_DAYS_KEY = `${ACTIVE_BOOK.id}:visitedDays`;

function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function computeStreak(days: string[]): number {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < days.length + 1; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (!days.includes(key)) break;
    streak++;
  }
  return streak;
}

export function StudyProvider({ children }: { children: ReactNode }) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPageState] = useState(1);
  const [navigationSource, setNavigationSource] = useState<NavigationSource>("manual");
  const [furthestPage, setFurthestPage] = useState(1);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [streakDays, setStreakDays] = useState(1);

  // Restore persisted state on mount. This value doesn't exist on the
  // server (localStorage is client-only), so a post-mount setState here is
  // unavoidable — it's a one-time hydration read, not derived-state churn.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const lastPage = readLocalStorage(LAST_PAGE_KEY, 1);
    const progress = readLocalStorage(PROGRESS_KEY, { furthestPage: 1 });
    const savedBookmarks = readLocalStorage<number[]>(BOOKMARKS_KEY, []);
    const visitedDays = readLocalStorage<string[]>(VISITED_DAYS_KEY, []);

    setCurrentPageState(lastPage > 0 ? lastPage : 1);
    setFurthestPage(progress.furthestPage ?? 1);
    setBookmarks(savedBookmarks);

    const todayKey = new Date().toISOString().slice(0, 10);
    const updatedDays = visitedDays.includes(todayKey)
      ? visitedDays
      : [...visitedDays, todayKey].slice(-90);
    window.localStorage.setItem(VISITED_DAYS_KEY, JSON.stringify(updatedDays));
    setStreakDays(computeStreak(updatedDays));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const goToPage = useCallback(
    (page: number, source: NavigationSource = "manual") => {
      setCurrentPageState((prev) => {
        const clamped = numPages > 0 ? Math.min(Math.max(page, 1), numPages) : Math.max(page, 1);
        if (clamped === prev) return prev;
        window.localStorage.setItem(LAST_PAGE_KEY, JSON.stringify(clamped));
        setFurthestPage((f) => {
          const next = Math.max(f, clamped);
          window.localStorage.setItem(PROGRESS_KEY, JSON.stringify({ furthestPage: next }));
          return next;
        });
        return clamped;
      });
      setNavigationSource(source);
    },
    [numPages]
  );

  const toggleBookmark = useCallback((page: number) => {
    setBookmarks((prev) => {
      const next = prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page].sort((a, b) => a - b);
      window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isBookmarked = useCallback((page: number) => bookmarks.includes(page), [bookmarks]);

  const progressPercent = numPages > 0 ? Math.round((furthestPage / numPages) * 100) : 0;

  const value = useMemo<StudyContextValue>(
    () => ({
      numPages,
      setNumPages,
      currentPage,
      navigationSource,
      goToPage,
      furthestPage,
      progressPercent,
      bookmarks,
      toggleBookmark,
      isBookmarked,
      chatHistory,
      setChatHistory,
      streakDays,
    }),
    [
      numPages,
      currentPage,
      navigationSource,
      goToPage,
      furthestPage,
      progressPercent,
      bookmarks,
      toggleBookmark,
      isBookmarked,
      chatHistory,
      streakDays,
    ]
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy(): StudyContextValue {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used within a StudyProvider");
  return ctx;
}
