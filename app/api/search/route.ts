import { NextRequest, NextResponse } from "next/server";
import { searchBookPages } from "@/lib/pdf-index";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const results = searchBookPages(query, 5);
  return NextResponse.json({ results });
}
