import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.6-flash";
const MAX_RETRIES = 2;

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Add it to .env.local (see .env.example)."
      );
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export type ChatTurn = { role: "user" | "model"; content: string };

function isTransientOverload(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  const message = err instanceof Error ? err.message : String(err);
  return status === 503 || /UNAVAILABLE|high demand/i.test(message);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Streams a Gemini answer as an async generator of text chunks. Retries a
 * couple of times on Gemini's transient "high demand" 503s before giving up
 * — these are common on the free tier and usually clear within a second or
 * two, so it's worth absorbing rather than failing the student's question. */
export async function* streamTutorAnswer(
  systemInstruction: string,
  history: ChatTurn[],
  question: string
): AsyncGenerator<string> {
  const ai = getClient();

  const contents = [
    ...history.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.content }],
    })),
    { role: "user" as const, parts: [{ text: question }] },
  ];

  let stream: Awaited<ReturnType<typeof ai.models.generateContentStream>> | undefined;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      stream = await ai.models.generateContentStream({
        model: MODEL,
        contents,
        config: { systemInstruction },
      });
      break;
    } catch (err) {
      if (attempt === MAX_RETRIES || !isTransientOverload(err)) throw err;
      await sleep(500 * 2 ** attempt);
    }
  }

  for await (const chunk of stream!) {
    const text = chunk.text;
    if (text) yield text;
  }
}
