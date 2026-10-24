import { NextRequest, NextResponse } from "next/server";
import { EventIntakeSchema } from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/validation/security";
import { generateEventPlan } from "@/lib/llm/geminiClient";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const { allowed, remaining } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Too many requests. Please wait a minute before generating another plan.",
        },
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
      );
    }

    const body = await req.json();
    const parseResult = EventIntakeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid event intake submission.",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const plan = await generateEventPlan(parseResult.data);

    return NextResponse.json(plan, {
      status: 200,
      headers: {
        "X-RateLimit-Remaining": remaining.toString(),
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    });
  } catch (error: unknown) {
    console.error("API /api/plan error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while synthesizing plan." },
      { status: 500 }
    );
  }
}
