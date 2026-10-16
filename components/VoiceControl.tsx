"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudy } from "@/lib/study-context";
import { pdfPageToBookLabel } from "@/lib/book-pages";

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
const NAV_COOLDOWN_MS = 4000;

// The ElevenLabs widget dispatches this event right before starting a call,
// letting us register client-side tool handlers on its config — this is how
// the voice agent can still drive the book viewer even though the widget
// itself (not our own code) owns the conversation session.
// https://elevenlabs.io/docs/agents-platform/customization/widget
type ElevenLabsCallEvent = Event & {
  detail: { config: { clientTools?: Record<string, (params: Record<string, unknown>) => Promise<unknown> | unknown> } };
};

export function VoiceControl() {
  const { currentPage, goToPage } = useStudy();
  const widgetRef = useRef<HTMLElement>(null);
  const lastNavRef = useRef<{ page: number; at: number }>({ page: 0, at: 0 });
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== "undefined" && !!customElements.get("elevenlabs-convai")
  );
  // The widget's own "Collapse" button turned out to sit almost exactly on
  // top of our chat's Send button (measured: both around x:1360-1411,
  // y:820-868), so clipping to protect our button also made the widget's
  // native collapse control unreachable — there's no rectangle that
  // includes one and excludes the other. Building our own toggle sidesteps
  // that entirely: it's a normal in-flow element we fully control, and
  // starting collapsed means the chat area is never obstructed unless the
  // student explicitly opens the voice card.
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (scriptReady) return;
    const id = setInterval(() => {
      if (customElements.get("elevenlabs-convai")) {
        setScriptReady(true);
        clearInterval(id);
      }
    }, 200);
    return () => clearInterval(id);
  }, [scriptReady]);

  // The widget's host element is a full-viewport `position: fixed` box
  // (its own doing, not ours) whose invisible overflow otherwise blocks
  // clicks on whatever's underneath it elsewhere on the page. While
  // collapsed, its wrapper is `display: none`, which already fully hides
  // and disables a `position: fixed` descendant per the CSS spec, so this
  // only matters while expanded. `pointer-events: none` on the host lets
  // clicks fall through to our own UI everywhere; the widget's own visible
  // card sets `pointer-events: auto` on itself internally (shipped as a
  // `pointer-events-auto` class in its shadow DOM), so it stays clickable
  // wherever it renders. (A clip-path hole sized to just our chat form was
  // tried first, but the widget's default bottom-right anchor lands inside
  // that same corner at common viewport widths, which hid the widget
  // entirely — clip-path removes painting, not just hit-testing.)
  useEffect(() => {
    const el = widgetRef.current;
    if (el) el.style.pointerEvents = "none";
  }, [scriptReady]);

  useEffect(() => {
    const el = widgetRef.current;
    if (!el) return;

    function onCall(event: Event) {
      const callEvent = event as ElevenLabsCallEvent;
      callEvent.detail.config.clientTools = {
        show_page_for_topic: async (params) => {
          const topic = typeof params.topic === "string" ? params.topic : "";
          if (!topic) return "No topic provided.";
          try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(topic)}`);
            const { results } = (await res.json()) as {
              results: { page: number; snippet: string }[];
            };
            const best = results[0];
            if (!best) return `No page found for "${topic}".`;

            const now = Date.now();
            const { page: lastPage, at: lastAt } = lastNavRef.current;
            if (best.page === lastPage || now - lastAt < NAV_COOLDOWN_MS) {
              return `Already showing page ${best.page}.`;
            }
            lastNavRef.current = { page: best.page, at: now };
            goToPage(best.page, "agent");
            return `Navigated the student's viewer to page ${best.page}: ${best.snippet}`;
          } catch {
            return "Couldn't look up that page right now.";
          }
        },
      };
    }

    el.addEventListener("elevenlabs-convai:call", onCall);
    return () => el.removeEventListener("elevenlabs-convai:call", onCall);
  }, [goToPage]);

  if (!AGENT_ID) {
    return (
      <p className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
        Voice agent not configured. Set NEXT_PUBLIC_ELEVENLABS_AGENT_ID.
      </p>
    );
  }

  return (
    <div className="voice-widget rounded-xl border bg-card p-2 shadow-sm">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full justify-center rounded-lg"
        onClick={() => setCollapsed((c) => !c)}
      >
        {collapsed ? (
          <>
            <Mic className="h-4 w-4" /> Start voice call
          </>
        ) : (
          <>
            <ChevronUp className="h-4 w-4" /> Hide voice tutor
          </>
        )}
      </Button>
      <div className={collapsed ? "hidden" : "flex justify-center pt-2"}>
        {scriptReady ? (
          <elevenlabs-convai
            ref={widgetRef}
            agent-id={AGENT_ID}
            variant="expanded"
            dynamic-variables={JSON.stringify({ current_page: pdfPageToBookLabel(currentPage) })}
          />
        ) : (
          <p className="py-2 text-xs text-muted-foreground">Loading voice agent…</p>
        )}
      </div>
    </div>
  );
}
