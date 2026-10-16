// Single source of truth for the tutor's persona/behavior. Each book's actual
// prompt text lives in lib/books/config.ts (ACTIVE_BOOK.persona) — this just
// re-exports whichever one is active.
// Used by the Gemini-backed text chat (lib/gemini.ts) — and should be pasted
// verbatim into the ElevenLabs agent's system prompt in their dashboard, so
// the text and voice tutor stay consistent even though they're separate
// integrations. If this changes, update the ElevenLabs agent to match.
import { ACTIVE_BOOK } from "@/lib/books/config";

export const STUDY_TUTOR_SYSTEM_PROMPT = ACTIVE_BOOK.persona;

/** Instruction appended only for the voice agent, which can also drive the
 * book viewer to the page it's discussing via a client tool. */
export const VOICE_NAVIGATION_INSTRUCTION = `You can also control the student's book viewer. Whenever you begin
explaining a new concept from the book, call the \`show_page_for_topic\`
tool with a short topic phrase (2-6 words) describing what you're about to
discuss, BEFORE or as you start explaining it, so the student's screen
follows along with what you're saying. Don't call it more than once for the
same topic in a row, and don't call it for small follow-up clarifications on
a concept you already navigated to.`;
