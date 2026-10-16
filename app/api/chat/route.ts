import { NextRequest } from "next/server";
import { STUDY_TUTOR_SYSTEM_PROMPT } from "@/lib/persona";
import { getPageContext, getBookPageText, searchBookPages, searchQaPages } from "@/lib/pdf-index";
import { streamTutorAnswer, type ChatTurn } from "@/lib/gemini";
import { pdfPageToBookLabel } from "@/lib/book-pages";

export const runtime = "nodejs";

type ChatRequestBody = {
  question: string;
  currentPage: number;
  history?: ChatTurn[];
};

export async function POST(req: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { question, currentPage, history = [] } = body;
  if (!question || typeof question !== "string") {
    return new Response("`question` is required", { status: 400 });
  }
  if (!Number.isInteger(currentPage) || currentPage < 1) {
    return new Response("`currentPage` must be a positive integer", { status: 400 });
  }

  const pageContext = getPageContext(currentPage, 1);

  // The student can ask about anything in the book, not just the page
  // they're currently looking at — search the whole book for pages
  // relevant to the question and include those too, not just the
  // current-page ± neighbor window.
  const nearbyPages = new Set([currentPage - 1, currentPage, currentPage + 1]);
  const bookMatches = searchBookPages(question, 3).filter((m) => !nearbyPages.has(m.page));
  const bookMatchContext = bookMatches
    .map((m) => `[Book page ${m.page}]\n${getBookPageText(m.page)}`)
    .join("\n\n");

  const qaMatches = searchQaPages(question, 2);
  const qaContext = qaMatches
    .map((m) => `[Practice Q&A page ${m.page}]\n${m.snippet}`)
    .join("\n\n");

  const systemInstruction = [
    STUDY_TUTOR_SYSTEM_PROMPT,
    "",
    `The student is currently viewing page ${pdfPageToBookLabel(currentPage)} of the book (as printed on the page). Here is the text of that page and its immediate neighbors:`,
    pageContext || "(no extracted text available for this page)",
    bookMatchContext
      ? "\nThe student's question may also relate to these other pages elsewhere in the book — use them too if relevant, the student is not limited to asking about the page they're currently viewing:\n" +
        bookMatchContext
      : "",
    qaContext ? "\nRelevant practice Q&A excerpts that may help:\n" + qaContext : "",
  ].join("\n");

  const trimmedHistory = history.slice(-12);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamTutorAnswer(systemInstruction, trimmedHistory, question)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        const status = (err as { status?: number })?.status;
        const message =
          status === 503
            ? "\n\n[Gemini is temporarily overloaded (this happens sometimes on the free tier) — please try asking again in a moment.]"
            : "\n\n[Sorry, something went wrong generating a response. Please try again.]";
        controller.enqueue(encoder.encode(message));
        console.error("chat route error:", err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
