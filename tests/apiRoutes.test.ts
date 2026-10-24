import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as healthGET } from "../src/app/api/health/route";
import { POST as planPOST } from "../src/app/api/plan/route";
import { POST as stressPOST } from "../src/app/api/stress/route";
import { POST as reflowPOST } from "../src/app/api/reflow/route";
import {
  SAMPLE_PERSONAS,
  generateDeterministicPlan,
} from "../src/lib/llm/fallbackTemplates";
import {
  resetRateLimitForTesting,
  MAX_BODY_BYTES,
} from "../src/lib/validation/security";

describe("API Routes Suite (/api/health, /api/plan, /api/stress, /api/reflow)", () => {
  beforeEach(() => {
    resetRateLimitForTesting();
  });

  describe("GET /api/health", () => {
    it("returns 200 with operational status and engines summary", async () => {
      const req = new NextRequest("http://localhost:3000/api/health", {
        headers: { "x-forwarded-for": "10.0.0.1" },
      });
      const res = await healthGET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.status).toBe("ok");
      expect(json.service).toContain("Plan-B");
      expect(json.engines.budget).toBe("deterministic");
      expect(json.engines.risk).toBe("deterministic");
      expect(json.engines.monteCarlo).toBe("deterministic");
      expect(json.engines.timelineReflow).toBe("deterministic");
    });

    it("returns 429 when rate limit is exceeded on /api/health", async () => {
      const testIp = "10.0.0.2";
      let lastRes = null;
      for (let i = 0; i < 65; i++) {
        const req = new NextRequest("http://localhost:3000/api/health", {
          headers: { "x-forwarded-for": testIp },
        });
        lastRes = await healthGET(req);
      }
      expect(lastRes).not.toBeNull();
      expect(lastRes?.status).toBe(429);
      const json = await lastRes?.json();
      expect(json.error).toContain("Rate limit exceeded");
    });
  });

  describe("POST /api/plan", () => {
    it("returns 200 with synthesized plan for valid intake", async () => {
      const intake = SAMPLE_PERSONAS.priya_wedding;
      const req = new NextRequest("http://localhost:3000/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "10.0.1.1",
        },
        body: JSON.stringify(intake),
      });

      const res = await planPOST(req);
      expect(res.status).toBe(200);

      const plan = await res.json();
      expect(plan.budget.length).toBe(7);
      expect(plan.timeline.length).toBeGreaterThan(0);
      expect(plan.vendors.length).toBeGreaterThan(0);
      expect(plan.ideas.theme).toBeTruthy();
    });

    it("returns 400 for invalid body failing schema validation", async () => {
      const invalidIntake = {
        title: "",
        guestCount: -50,
        budget: 5,
      };

      const req = new NextRequest("http://localhost:3000/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "10.0.1.2",
        },
        body: JSON.stringify(invalidIntake),
      });

      const res = await planPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid event intake submission.");
    });

    it("returns 413 when body size exceeds limit", async () => {
      const oversizedPayload = {
        ...SAMPLE_PERSONAS.priya_wedding,
        notes: "X".repeat(MAX_BODY_BYTES + 5000),
      };

      const req = new NextRequest("http://localhost:3000/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "10.0.1.3",
        },
        body: JSON.stringify(oversizedPayload),
      });

      const res = await planPOST(req);
      expect(res.status).toBe(413);
      const json = await res.json();
      expect(json.error).toContain("Payload too large");
    });

    it("returns 429 when rate limit is exceeded on /api/plan", async () => {
      const testIp = "10.0.1.4";
      const intake = SAMPLE_PERSONAS.aisha_birthday;
      let lastRes = null;

      for (let i = 0; i < 65; i++) {
        const req = new NextRequest("http://localhost:3000/api/plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": testIp,
          },
          body: JSON.stringify(intake),
        });
        lastRes = await planPOST(req);
      }

      expect(lastRes?.status).toBe(429);
      const json = await lastRes?.json();
      expect(json.error).toContain("Too many requests");
    });

    it("falls back gracefully to deterministic template when LLM fails or is unconfigured", async () => {
      const prevKey = process.env.GEMINI_API_KEY;
      try {
        process.env.GEMINI_API_KEY = "invalid_dummy_key_to_force_fallback";
        const intake = {
          ...SAMPLE_PERSONAS.marcus_festival,
          title: "Unique Festival For Fallback Test",
        };

        const req = new NextRequest("http://localhost:3000/api/plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "10.0.1.5",
          },
          body: JSON.stringify(intake),
        });

        const res = await planPOST(req);
        expect(res.status).toBe(200);
        const plan = await res.json();
        expect(plan.isFallback).toBe(true);
        expect(plan.budget.length).toBe(7);
      } finally {
        process.env.GEMINI_API_KEY = prevKey;
      }
    });
  });

  describe("POST /api/stress", () => {
    it("returns 200 with risk evaluation and Monte Carlo simulation", async () => {
      const plan = generateDeterministicPlan(SAMPLE_PERSONAS.priya_wedding);
      const req = new NextRequest("http://localhost:3000/api/stress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "10.0.2.1",
        },
        body: JSON.stringify({ plan, scenarioId: "rain" }),
      });

      const res = await stressPOST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.mode).toBe("single");
      expect(json.result.overallRiskScore).toBeGreaterThan(0);
      expect(json.monteCarlo.trialsCount).toBe(1000);
    });

    it("returns 200 with batch heatmap when scenarioId is 'all'", async () => {
      const plan = generateDeterministicPlan(SAMPLE_PERSONAS.priya_wedding);
      const req = new NextRequest("http://localhost:3000/api/stress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "10.0.2.2",
        },
        body: JSON.stringify({ plan, scenarioId: "all" }),
      });

      const res = await stressPOST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.mode).toBe("all");
      expect(json.results.rain).toBeDefined();
      expect(json.results.vendor_noshow).toBeDefined();
      expect(json.heatmap.length).toBe(plan.budget.length);
    });

    it("returns 400 for invalid body on /api/stress", async () => {
      const req = new NextRequest("http://localhost:3000/api/stress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "10.0.2.3",
        },
        body: JSON.stringify({ plan: "not-a-plan", scenarioId: "invalid-id" }),
      });

      const res = await stressPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid stress request payload.");
    });

    it("returns 413 for oversized body on /api/stress", async () => {
      const req = new NextRequest("http://localhost:3000/api/stress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "10.0.2.4",
        },
        body: JSON.stringify({ junk: "A".repeat(MAX_BODY_BYTES + 2000) }),
      });

      const res = await stressPOST(req);
      expect(res.status).toBe(413);
    });

    it("returns 429 when rate limit is exceeded on /api/stress", async () => {
      const plan = generateDeterministicPlan(SAMPLE_PERSONAS.priya_wedding);
      const testIp = "10.0.2.5";
      let lastRes = null;

      for (let i = 0; i < 65; i++) {
        const req = new NextRequest("http://localhost:3000/api/stress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": testIp,
          },
          body: JSON.stringify({ plan, scenarioId: "rain" }),
        });
        lastRes = await stressPOST(req);
      }

      expect(lastRes?.status).toBe(429);
    });
  });

  describe("POST /api/reflow", () => {
    it("returns 200 with shifted timeline and generated vendor notifications", async () => {
      const plan = generateDeterministicPlan(SAMPLE_PERSONAS.priya_wedding);
      const firstDayOfItem = plan.timeline.find((t) => t.phase === "day-of")!;

      const req = new NextRequest("http://localhost:3000/api/reflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "10.0.3.1",
        },
        body: JSON.stringify({
          timeline: plan.timeline,
          delayMinutes: 30,
          delayedFromItemId: firstDayOfItem.id,
          eventTitle: plan.intake.title,
        }),
      });

      const res = await reflowPOST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.delayMinutes).toBe(30);
      expect(json.vendorDraftMessages.length).toBeGreaterThan(0);
      expect(json.adjustedTimeline.length).toBe(plan.timeline.length);
    });

    it("returns 400 for invalid body on /api/reflow", async () => {
      const req = new NextRequest("http://localhost:3000/api/reflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "10.0.3.2",
        },
        body: JSON.stringify({
          timeline: [],
          delayMinutes: -10, // Invalid: negative delay
          delayedFromItemId: "unknown",
        }),
      });

      const res = await reflowPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid reflow parameters.");
    });

    it("returns 413 for oversized body on /api/reflow", async () => {
      const req = new NextRequest("http://localhost:3000/api/reflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "10.0.3.3",
        },
        body: JSON.stringify({ junk: "B".repeat(MAX_BODY_BYTES + 3000) }),
      });

      const res = await reflowPOST(req);
      expect(res.status).toBe(413);
    });

    it("returns 429 when rate limit is exceeded on /api/reflow", async () => {
      const plan = generateDeterministicPlan(SAMPLE_PERSONAS.priya_wedding);
      const firstDayOfItem = plan.timeline.find((t) => t.phase === "day-of")!;
      const testIp = "10.0.3.4";
      let lastRes = null;

      for (let i = 0; i < 65; i++) {
        const req = new NextRequest("http://localhost:3000/api/reflow", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": testIp,
          },
          body: JSON.stringify({
            timeline: plan.timeline,
            delayMinutes: 15,
            delayedFromItemId: firstDayOfItem.id,
            eventTitle: "Test",
          }),
        });
        lastRes = await reflowPOST(req);
      }

      expect(lastRes?.status).toBe(429);
    });
  });
});
