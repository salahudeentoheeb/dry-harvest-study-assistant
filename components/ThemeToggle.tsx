"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconTooltip } from "@/components/IconTooltip";
import { getInitialDarkMode, toggleDarkMode } from "@/lib/theme";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // One-time client-only read of localStorage/matchMedia to sync React
    // state with the theme the blocking inline script (app/layout.tsx)
    // already applied to <html> before hydration — unavoidable setState
    // since this value doesn't exist on the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(getInitialDarkMode());
  }, []);

  return (
    <IconTooltip label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <Button
        variant="ghost"
        size="icon-lg"
        className="rounded-full"
        aria-label="Toggle theme"
        onClick={() => setIsDark(toggleDarkMode())}
      >
        {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
      </Button>
    </IconTooltip>
  );
}
