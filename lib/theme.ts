import { ACTIVE_BOOK } from "@/lib/books/config";

const THEME_KEY = `${ACTIVE_BOOK.id}:theme`;

export function getInitialDarkMode(): boolean {
  const stored = window.localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return stored ? stored === "dark" : prefersDark;
}

export function isDarkModeActive(): boolean {
  return document.documentElement.classList.contains("dark");
}

export function setDarkMode(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  window.localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
}

export function toggleDarkMode(): boolean {
  const next = !isDarkModeActive();
  setDarkMode(next);
  return next;
}
