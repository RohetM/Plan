import { describe, it, expect } from "vitest";
import {
  generateDeterministicPlan,
  SAMPLE_PERSONAS,
} from "../src/lib/llm/fallbackTemplates";
import { FullPlanSchema } from "../src/lib/validation/schemas";
import { hashPayload } from "../src/lib/llm/hash";

describe("LLM Fallback & Persona Generator", () => {
  it("synthesizes valid FullPlan matching schema without external network", () => {
    const intake = SAMPLE_PERSONAS.priya_wedding;
    const plan = generateDeterministicPlan(intake);

    const validation = FullPlanSchema.safeParse(plan);
    expect(validation.success).toBe(true);
    expect(plan.isFallback).toBe(true);
  });

  it("reflects specific dietary and accessibility needs in generated ideas", () => {
    const intake = SAMPLE_PERSONAS.marcus_festival;
    const plan = generateDeterministicPlan(intake);

    const menuStr = plan.ideas.menuHighlights.join(" ");
    const inclusiveStr = plan.ideas.inclusiveNotes.join(" ");

    expect(menuStr.toLowerCase()).toContain("vegan");
    expect(inclusiveStr.toLowerCase()).toContain("sensory");
  });

  it("includes prep countdown and day-of run-of-show in the timeline", () => {
    const intake = SAMPLE_PERSONAS.aisha_birthday;
    const plan = generateDeterministicPlan(intake);

    const prepItems = plan.timeline.filter((t) => t.phase === "prep");
    const dayOfItems = plan.timeline.filter((t) => t.phase === "day-of");

    expect(prepItems.length).toBeGreaterThanOrEqual(3);
    expect(dayOfItems.length).toBeGreaterThanOrEqual(4);

    const lastDayItem = dayOfItems[dayOfItems.length - 1];
    expect(lastDayItem.fixedCutoffTime).toBeDefined();
  });

  it("generates deterministic hash keys for payload caching", () => {
    const hash1 = hashPayload({ title: "My Event", budget: 10000 });
    const hash2 = hashPayload({ title: "My Event", budget: 10000 });
    const hash3 = hashPayload({ title: "Other Event", budget: 10000 });

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });

  it("all three PRD personas generate fully compliant plans", () => {
    for (const [key, intake] of Object.entries(SAMPLE_PERSONAS)) {
      const plan = generateDeterministicPlan(intake);
      expect(plan.budget.length).toBe(7);
      expect(plan.vendors.length).toBeGreaterThanOrEqual(4);
      expect(plan.intake.title).toBeTruthy();
    }
  });
});
