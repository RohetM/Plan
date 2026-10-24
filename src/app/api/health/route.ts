import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/validation/security";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again shortly." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    );
  }

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
          ? "gemini-3.8-flash (active)"
          : "deterministic-fallback (ready)",
      },
    },
    {
      status: 200,
      headers: {
        "X-RateLimit-Remaining": remaining.toString(),
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Cache-Control": "no-store",
      },
    }
  );
}
