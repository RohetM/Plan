import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FullPlanSchema, ScenarioTypeEnum } from "@/lib/validation/schemas";
import { evaluateStressTest } from "@/lib/risk/riskEngine";
import { runMonteCarloBudgetSimulation } from "@/lib/simulation/monteCarlo";
import { checkRateLimit } from "@/lib/validation/security";

const StressRequestSchema = z.object({
  plan: FullPlanSchema,
  scenarioId: z.union([ScenarioTypeEnum, z.literal("all")]),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const { allowed, remaining } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = StressRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid stress request payload.", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { plan, scenarioId } = parseResult.data;

    // Run Monte Carlo 1,000 trials simulation
    const monteCarlo = runMonteCarloBudgetSimulation(plan.budget, plan.intake.budget);

    if (scenarioId === "all") {
      const allScenarios = ["rain", "vendor_noshow", "guest_surge", "budget_cut"] as const;
      const results: Record<string, any> = {};

      for (const sc of allScenarios) {
        results[sc] = evaluateStressTest(plan, sc);
      }

      // Build Heatmap Matrix (categories x scenarios)
      const categories = plan.budget.map((b) => b.category);
      const heatmap = categories.map((cat) => {
        const scenarioScores: Record<string, { score: number; band: string; extraCost: number }> = {};
        for (const sc of allScenarios) {
          const itemRisk = results[sc].itemRisks.find((r: any) => r.category === cat);
          scenarioScores[sc] = {
            score: itemRisk?.score ?? 0,
            band: itemRisk?.band ?? "Low",
            extraCost: itemRisk?.estimatedExtraCost ?? 0,
          };
        }
        return {
          category: cat,
          scenarios: scenarioScores,
        };
      });

      return NextResponse.json(
        {
          mode: "all",
          results,
          heatmap,
          monteCarlo,
        },
        {
          status: 200,
          headers: {
            "X-RateLimit-Remaining": remaining.toString(),
            "X-Content-Type-Options": "nosniff",
          },
        }
      );
    }

    // Single scenario execution
    const singleResult = evaluateStressTest(plan, scenarioId);

    return NextResponse.json(
      {
        mode: "single",
        result: singleResult,
        monteCarlo,
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Remaining": remaining.toString(),
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (error: any) {
    console.error("API /api/stress error:", error);
    return NextResponse.json(
      { error: "Error occurred during stress simulation.", message: error.message },
      { status: 500 }
    );
  }
}
