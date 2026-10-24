import { BudgetLine } from "../validation/schemas";
import { CATEGORY_DEFAULTS } from "../budget/budgetEngine";
import { createSeededRng, sampleTriangular } from "./rng";

export interface MonteCarloResult {
  trialsCount: number;
  seed: number;
  baselineCost: number;
  p10: number;
  p50: number; // Median expected cost
  p90: number; // 90th percentile stress cost
  p99: number;
  currentBufferAmount: number;
  recommendedBufferAmount: number;
  recommendedBufferPercent: number;
  bufferIsAdequateForP90: boolean;
  categoryVariances: {
    category: string;
    volatility: number;
    baselineAmount: number;
    p90Amount: number;
  }[];
}

/**
 * Runs 1,000 Monte Carlo simulation trials over the budget lines.
 * Evaluates cost variance using triangular distribution per line.
 */
export function runMonteCarloBudgetSimulation(
  budgetLines: BudgetLine[],
  totalBudget: number,
  trials: number = 1000,
  seed: number = 1337
): MonteCarloResult {
  const rng = createSeededRng(seed);

  // Separate non-buffer lines from contingency buffer
  const nonBufferLines = budgetLines.filter((l) => !l.isBuffer);
  const bufferLine = budgetLines.find((l) => l.isBuffer);
  const currentBufferAmount = bufferLine?.amount ?? 0;
  const baselineCost = nonBufferLines.reduce((sum, l) => sum + l.amount, 0);

  // Map volatilities
  const lineConfigs = nonBufferLines.map((l) => {
    const meta = CATEGORY_DEFAULTS.find((c) => c.category === l.category);
    const volatility = meta?.volatility ?? 0.15;
    return {
      category: l.category,
      amount: l.amount,
      min: 0.95, // Vendors might discount 5%
      mode: 1.0, // Most likely baseline
      max: 1.0 + volatility, // Overrun potential
      volatility,
    };
  });

  const totals: number[] = new Array(trials);
  const perCategoryDraws: Record<string, number[]> = {};

  for (const cfg of lineConfigs) {
    perCategoryDraws[cfg.category] = new Array(trials);
  }

  // Execute 1,000 trials
  for (let t = 0; t < trials; t++) {
    let trialSum = 0;
    for (const cfg of lineConfigs) {
      const u = rng();
      const multiplier = sampleTriangular(cfg.min, cfg.mode, cfg.max, u);
      const categoryCost = cfg.amount * multiplier;
      trialSum += categoryCost;
      perCategoryDraws[cfg.category][t] = categoryCost;
    }
    totals[t] = trialSum;
  }

  // Sort totals ascending
  totals.sort((a, b) => a - b);

  // Percentiles
  const p10Index = Math.floor(trials * 0.1);
  const p50Index = Math.floor(trials * 0.5);
  const p90Index = Math.floor(trials * 0.9);
  const p99Index = Math.min(trials - 1, Math.floor(trials * 0.99));

  const p10 = Math.round(totals[p10Index] * 100) / 100;
  const p50 = Math.round(totals[p50Index] * 100) / 100;
  const p90 = Math.round(totals[p90Index] * 100) / 100;
  const p99 = Math.round(totals[p99Index] * 100) / 100;

  // Buffer needed to cover P90 cost
  const recommendedBufferAmount = Math.max(
    0,
    Math.round((p90 - baselineCost) * 100) / 100
  );
  const recommendedBufferPercent =
    totalBudget > 0
      ? Math.round((recommendedBufferAmount / totalBudget) * 1000) / 10
      : 10.0;

  const bufferIsAdequateForP90 = currentBufferAmount >= recommendedBufferAmount;

  // Category level P90
  const categoryVariances = lineConfigs.map((cfg) => {
    const draws = perCategoryDraws[cfg.category];
    draws.sort((a, b) => a - b);
    const catP90 = Math.round(draws[p90Index] * 100) / 100;
    return {
      category: cfg.category,
      volatility: cfg.volatility,
      baselineAmount: cfg.amount,
      p90Amount: catP90,
    };
  });

  return {
    trialsCount: trials,
    seed,
    baselineCost: Math.round(baselineCost * 100) / 100,
    p10,
    p50,
    p90,
    p99,
    currentBufferAmount,
    recommendedBufferAmount,
    recommendedBufferPercent,
    bufferIsAdequateForP90,
    categoryVariances,
  };
}
