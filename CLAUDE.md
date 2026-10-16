# Dry Harvest Study Assistant

A web-based study companion that pairs a readable book viewer with an AI voice/chat tutor, so a student can read the source material and ask an agent about it in the same view.

Built from the same codebase lineage as the PMIC Study Assistant (https://github.com/salahudeentoheeb/pmic-study-assistant), trimmed down to serve only this one book. Uses a distinct warm amber/terracotta color scheme (vs. PMIC's green/gold) so the two apps are visually distinguishable.

## Source material

- `DRY HARVEST MAGT GUIDE-Full Book.pdf` — the book. Rendered in the reader pane. Also copied to `public/dry-harvest-full-book.pdf` for the viewer to load client-side.

This PDF is the content source of truth. Don't hardcode excerpts from it into app code — `data/dry-harvest/book-index.json` holds the pre-extracted per-page text (via `npm run extract`); edit the source PDF and re-run extraction instead of hand-editing the JSON.

## Product shape

Two-pane layout, single screen, no scrolling page-within-page:

**Left pane — Book viewer**
- Renders the full PDF page by page.
- Prev/Next page buttons.
- Dropdown (or searchable jump box) to go directly to a specific page number.
- Current page number / total pages always visible.

**Right pane — Study agent**
- Chat interface: student types questions about the material and gets answers.
- Voice mode: ElevenLabs conversational voice agent — student can start a live voice call instead of typing.
- Agent answers with awareness of what page/section the student is currently viewing, and can search any page of the book, not just the current one.

## Stack & infrastructure

- **Text chat**: Gemini (`lib/gemini.ts`), server-side only — `GEMINI_API_KEY` in `.env.local`.
- **Voice agent**: ElevenLabs Conversational AI — `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` (and optionally `ELEVENLABS_API_KEY` for private agents) in `.env.local`.
- **Framework**: Next.js (App Router), React, Tailwind v4, shadcn/ui components.
- This book has no companion practice Q&A PDF (`hasQaData: false` in `lib/books/config.ts`), so Practice Mode and Q&A grounding run on empty data — the tutor still answers from the book text alone.

## Working conventions

- Keep API keys out of client-side bundles — they're only read server-side (`GEMINI_API_KEY`, `ELEVENLABS_API_KEY`) except `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`, which is a public ID, not a secret.
- This repo was trimmed from a 5-book multi-tenant codebase to serve only `dry-harvest` — `lib/books/config.ts` and `lib/book-data.ts` now only reference this one book. If re-merging upstream changes from the PMIC repo, re-apply that trim rather than reintroducing the other books' data/personas.
- When touching PDF rendering or chat/voice integration, verify it actually works in a running dev server before calling it done — these are UI-heavy features that don't get meaningfully validated by type-checking alone.
