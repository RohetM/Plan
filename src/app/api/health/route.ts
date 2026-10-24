import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "Plan-B Event Stress-Tester API",
      timestamp: new Date().toISOString(),
      engines: {
        budget: "deterministic",
        risk: "deterministic",
        monteCarlo: "deterministic",
        timelineReflow: "deterministic",
        llm: process.env.GEMINI_API_KEY
          ? "gemini-1.5-flash (active)"
          : "deterministic-fallback (ready)",
      },
    },
    {
      status: 200,
      headers: {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Cache-Control": "no-store",
      },
    }
  );
}
