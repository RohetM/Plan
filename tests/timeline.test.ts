import { describe, it, expect } from "vitest";
import {
  reflowTimeline,
  timeStringToMinutes,
  minutesToTimeString,
} from "../src/lib/timeline/reflowEngine";
import { TimelineItem } from "../src/lib/validation/schemas";

describe("Timeline Reflow Engine", () => {
  it("converts between time string and minutes accurately", () => {
    expect(timeStringToMinutes("00:00")).toBe(0);
    expect(timeStringToMinutes("14:30")).toBe(870);
    expect(timeStringToMinutes("23:59")).toBe(1439);

    expect(minutesToTimeString(0)).toBe("00:00");
    expect(minutesToTimeString(870)).toBe("14:30");
    expect(minutesToTimeString(1439)).toBe("23:59");
  });

  const mockTimeline: TimelineItem[] = [
    {
      id: "prep-1",
      phase: "prep",
      timeOffsetDays: -30,
      durationMin: 60,
      label: "Order Invitations",
      description: "Mail to guests",
      category: "General",
      isFixed: false,
      dependsOn: [],
      completed: true,
    },
    {
      id: "day-1",
      phase: "day-of",
      time: "14:00",
      durationMin: 60,
      label: "Guest Arrival",
      description: "Welcome drinks",
      category: "Catering & Bar",
      isFixed: false,
      dependsOn: [],
      completed: true,
    },
    {
      id: "day-2",
      phase: "day-of",
      time: "15:00",
      durationMin: 60,
      label: "Main Program",
      description: "Ceremony speeches",
      category: "Entertainment & AV",
      isFixed: false,
      dependsOn: ["day-1"],
      completed: false,
    },
    {
      id: "day-3",
      phase: "day-of",
      time: "21:30",
      durationMin: 60,
      label: "Final Musical Set",
      description: "Wind down music",
      category: "Entertainment & AV",
      isFixed: true,
      fixedCutoffTime: "22:00", // Hard cutoff at 22:00
      dependsOn: ["day-2"],
      completed: false,
    },
  ];

  it("shifts day-of items from the delayed item without touching prep items", () => {
    const result = reflowTimeline(mockTimeline, 30, "day-2", "Golden Anniversary");

    // Prep item remains unchanged
    const prepItem = result.adjustedTimeline.find((i) => i.id === "prep-1");
    expect(prepItem?.timeOffsetDays).toBe(-30);

    // Prior day-of item remains unchanged
    const day1 = result.adjustedTimeline.find((i) => i.id === "day-1");
    expect(day1?.time).toBe("14:00");

    // Delayed item and subsequent items shift by +30 min
    const day2 = result.adjustedTimeline.find((i) => i.id === "day-2");
    expect(day2?.time).toBe("15:30"); // 15:00 + 30 min

    const day3 = result.adjustedTimeline.find((i) => i.id === "day-3");
    expect(day3?.time).toBe("22:00"); // 21:30 + 30 min
  });

  it("detects critical fixed cutoff curfew violations", () => {
    // 30 min delay causes day-3 (start 22:00, duration 60m => end 23:00) to exceed curfew 22:00
    const result = reflowTimeline(mockTimeline, 30, "day-2", "Summer Fest");

    expect(result.conflicts.length).toBeGreaterThan(0);
    const curfewConflict = result.conflicts.find((c) => c.severity === "violation");
    expect(curfewConflict).toBeDefined();
    expect(curfewConflict?.fixedCutoffTime).toBe("22:00");
  });

  it("generates ready-to-send vendor draft SMS and emails with urgency rating", () => {
    const result = reflowTimeline(mockTimeline, 35, "day-2", "Priya's Wedding");

    expect(result.vendorDraftMessages.length).toBeGreaterThan(0);
    for (const draft of result.vendorDraftMessages) {
      expect(draft.draftSms).toContain("35 minutes");
      expect(draft.draftEmail).toContain("Priya's Wedding");
      expect(draft.urgency).toBe("high"); // >= 30 min is high
    }
  });

  it("sets urgency to medium for short delays under 30 minutes", () => {
    const result = reflowTimeline(mockTimeline, 15, "day-2", "Priya's Wedding");
    const msg = result.vendorDraftMessages[0];
    expect(msg.urgency).toBe("medium");
  });
});
