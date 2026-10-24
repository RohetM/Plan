import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TimelineItemSchema } from "@/lib/validation/schemas";
import { reflowTimeline } from "@/lib/timeline/reflowEngine";

const ReflowBodySchema = z.object({
  timeline: z.array(TimelineItemSchema),
  delayMinutes: z.number().int().min(1).max(360),
  delayedFromItemId: z.string(),
  eventTitle: z.string().optional().default("Celebration Event"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = ReflowBodySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid reflow parameters.", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { timeline, delayMinutes, delayedFromItemId, eventTitle } = parseResult.data;

    const reflowResponse = reflowTimeline(
      timeline,
      delayMinutes,
      delayedFromItemId,
      eventTitle
    );

    return NextResponse.json(reflowResponse, {
      status: 200,
      headers: {
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: any) {
    console.error("API /api/reflow error:", error);
    return NextResponse.json(
      { error: "Failed to recalculate timeline reflow." },
      { status: 500 }
    );
  }
}
