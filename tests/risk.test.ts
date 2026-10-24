import { describe, it, expect } from "vitest";
import {
  evaluateStressTest,
  calculateExposure,
  calculateMitigation,
} from "../src/lib/risk/riskEngine";
import { getRiskBand, SCENARIO_RULES } from "../src/lib/risk/scenarioRules";
import { generateDeterministicPlan } from "../src/lib/llm/fallbackTemplates";
import { EventIntake } from "../src/lib/validation/schemas";

describe("Risk Engine & Scenario Rules", () => {
  const baseIntake: EventIntake = {
    eventType: "wedding",
    title: "Outdoor Summer Wedding",
    date: "2026-08-15",
    locationType: "outdoor",
    guestCount: 100,
    budget: 20000,
    currency: "USD",
    dietary: ["Gluten-Free"],
    accessibilityNeeds: ["Wheelchair Ramp"],
    vibe: ["Garden Party"],
    notes: "Ceremony in the open meadow",
  };

  const plan = generateDeterministicPlan(baseIntake);

  it("maps quantitative boundary scores to exact bands correctly", () => {
    // 0-33 Low, 34-66 Medium, 67-100 High
    expect(getRiskBand(0)).toBe("Low");
    expect(getRiskBand(33)).toBe("Low");
    expect(getRiskBand(34)).toBe("Medium");
    expect(getRiskBand(66)).toBe("Medium");
    expect(getRiskBand(67)).toBe("High");
    expect(getRiskBand(100)).toBe("High");
  });

  it("increases exposure for outdoor venues and high-concentration categories", () => {
    const outdoorExposure = calculateExposure("Venue", "outdoor", 30, false);
    const indoorExposure = calculateExposure("Venue", "indoor", 30, false);

    expect(outdoorExposure).toBeGreaterThan(indoorExposure);
  });

  it("calculates mitigation correctly based on confirmed backups and bookings", () => {
    const noMitigation = calculateMitigation(false, false, false);
    const partialMitigation = calculateMitigation(false, true, true);
    const fullMitigation = calculateMitigation(true, true, true);

    expect(partialMitigation).toBeGreaterThan(noMitigation);
    expect(fullMitigation).toBeGreaterThan(partialMitigation);
    expect(fullMitigation).toBeLessThanOrEqual(0.85); // Caps at 85%
  });

  it("simulates rain scenario and evaluates risk with mitigation awareness", () => {
    const rainResult = evaluateStressTest(plan, "rain");

    expect(rainResult.scenarioId).toBe("rain");
    expect(rainResult.itemRisks.length).toBeGreaterThan(0);
    expect(rainResult.overallRiskScore).toBeGreaterThanOrEqual(0);
    expect(rainResult.overallRiskScore).toBeLessThanOrEqual(100);

    const venueRisk = rainResult.itemRisks.find((r) => r.category === "Venue");
    expect(venueRisk).toBeDefined();
    expect(venueRisk!.contingency).toBeTruthy();

    // Verify unmitigated plan has much higher risk than mitigated plan
    const unmitigatedPlan = {
      ...plan,
      vendors: plan.vendors.map((v) => ({
        ...v,
        status: "to-contact" as const,
        backupOption: undefined,
        backupNeeded: true,
      })),
    };
    const unmitigatedResult = evaluateStressTest(unmitigatedPlan, "rain");
    const unmitigatedVenueRisk = unmitigatedResult.itemRisks.find((r) => r.category === "Venue");

    expect(unmitigatedVenueRisk!.score).toBeGreaterThan(venueRisk!.score);
    expect(unmitigatedVenueRisk!.score).toBeGreaterThan(50);
  });

  it("simulates vendor no-show with critical impact on Catering & Bar", () => {
    const vendorResult = evaluateStressTest(plan, "vendor_noshow");

    const cateringRisk = vendorResult.itemRisks.find((r) => r.category === "Catering & Bar");
    expect(cateringRisk).toBeDefined();
    expect(cateringRisk!.scenarioSeverity).toBeGreaterThanOrEqual(0.90);
    expect(vendorResult.contingencyActions.length).toBeGreaterThan(0);
  });

  it("evaluates buffer adequacy and detects surplus or deficit", () => {
    const result = evaluateStressTest(plan, "guest_surge");

    expect(result.bufferAdequacy).toBeDefined();
    expect(typeof result.bufferAdequacy.currentBuffer).toBe("number");
    expect(typeof result.bufferAdequacy.requiredBuffer).toBe("number");
    expect(result.bufferAdequacy.currentBuffer).toBeGreaterThan(0);
    expect(typeof result.bufferAdequacy.isSufficient).toBe("boolean");
  });

  it("verifies all scenario rules are defined with valid numeric constants", () => {
    const scenarios = ["rain", "vendor_noshow", "guest_surge", "budget_cut"] as const;

    for (const sc of scenarios) {
      const rule = SCENARIO_RULES[sc];
      expect(rule).toBeDefined();
      expect(rule.label).toBeTruthy();
      expect(rule.categorySeverities["Venue"]).toBeGreaterThan(0);
      expect(rule.locationModifiers.outdoor).toBeGreaterThan(0);
    }
  });
});
