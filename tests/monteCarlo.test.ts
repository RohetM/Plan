import { describe, it, expect } from "vitest";
import { runMonteCarloBudgetSimulation } from "../src/lib/simulation/monteCarlo";
import { createSeededRng, sampleTriangular } from "../src/lib/simulation/rng";
import { generateBaselineBudget } from "../src/lib/budget/budgetEngine";

describe("Monte Carlo Simulation Engine", () => {
  it("produces identical random sequence with identical seeds", () => {
    const rng1 = createSeededRng(999);
    const rng2 = createSeededRng(999);

    const seq1 = [rng1(), rng1(), rng1(), rng1(), rng1()];
    const seq2 = [rng2(), rng2(), rng2(), rng2(), rng2()];

    expect(seq1).toEqual(seq2);
  });

  it("triangular sampling stays strictly within bounds [a, b]", () => {
    const rng = createSeededRng(12345);
    const min = 0.95;
    const mode = 1.0;
    const max = 1.25;

    for (let i = 0; i < 500; i++) {
      const u = rng();
      const sample = sampleTriangular(min, mode, max, u);
      expect(sample).toBeGreaterThanOrEqual(min);
      expect(sample).toBeLessThanOrEqual(max);
    }
  });

  it("produces realistic P10 <= P50 <= P90 <= P99 percentiles", () => {
    const budgetLines = generateBaselineBudget(15000);
    const result = runMonteCarloBudgetSimulation(budgetLines, 15000, 1000, 42);

    expect(result.trialsCount).toBe(1000);
    expect(result.baselineCost).toBeGreaterThan(0);
    expect(result.p50).toBeGreaterThanOrEqual(result.p10);
    expect(result.p90).toBeGreaterThanOrEqual(result.p50);
    expect(result.p99).toBeGreaterThanOrEqual(result.p90);
  });

  it("is completely deterministic with fixed seed", () => {
    const budgetLines = generateBaselineBudget(20000);
    const runA = runMonteCarloBudgetSimulation(budgetLines, 20000, 1000, 777);
    const runB = runMonteCarloBudgetSimulation(budgetLines, 20000, 1000, 777);

    expect(runA.p50).toBe(runB.p50);
    expect(runA.p90).toBe(runB.p90);
    expect(runA.recommendedBufferAmount).toBe(runB.recommendedBufferAmount);
  });

  it("calculates recommended contingency buffer percentage needed to cover P90", () => {
    const budgetLines = generateBaselineBudget(25000);
    const result = runMonteCarloBudgetSimulation(budgetLines, 25000, 1000, 101);

    expect(result.recommendedBufferAmount).toBeGreaterThan(0);
    expect(result.recommendedBufferPercent).toBeGreaterThan(0);
    expect(typeof result.bufferIsAdequateForP90).toBe("boolean");
  });

  it("reports per-category variances and P90 values", () => {
    const budgetLines = generateBaselineBudget(10000);
    const result = runMonteCarloBudgetSimulation(budgetLines, 10000, 500, 55);

    expect(result.categoryVariances.length).toBeGreaterThan(0);
    for (const cat of result.categoryVariances) {
      expect(cat.p90Amount).toBeGreaterThanOrEqual(cat.baselineAmount * 0.95);
    }
  });
});
