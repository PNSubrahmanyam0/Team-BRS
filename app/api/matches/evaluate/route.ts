import { NextResponse } from "next/server";
import { evaluateMatch } from "@/lib/matching";
import type { Candidate, Vacancy } from "@/lib/types";

/**
 * Internal deterministic matching evaluator. Background jobs should call this
 * logic after validating organisation access; it has no AI or notification side
 * effects and therefore cannot accidentally message a candidate.
 */
export async function POST(request: Request) {
  try {
    const { candidate, vacancy } = (await request.json()) as { candidate: Candidate; vacancy: Vacancy };
    if (!candidate || !vacancy) {
      return NextResponse.json({ error: "Candidate and vacancy are required." }, { status: 400 });
    }
    return NextResponse.json(evaluateMatch(candidate, vacancy));
  } catch {
    return NextResponse.json({ error: "Invalid matching payload." }, { status: 400 });
  }
}
