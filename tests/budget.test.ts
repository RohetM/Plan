import { describe, it, expect } from "vitest";
import {
  normalizeBudget,
  generateBaselineBudget,
  adjustCategoryPercent,
  MIN_BUFFER_PERCENT,
  CATEGORY_DEFAULTS,
} from "../src/lib/budget/budgetEngine";
import { BudgetCategory } from "../src/lib/validation/schemas";

describe("Budget Engine", () => {
  it("enforces mandatory contingency buffer floor of at least 8%", () => {
    const input = [
      { category: "Venue" as BudgetCategory, percent: 50 },
      { category: "Catering & Bar" as BudgetCategory, percent: 48 },
      { category: "Contingency Buffer" as BudgetCategory, percent: 2 }, // Below 8% floor
    ];

    const result = normalizeBudget(input, 10000);
    const bufferLine = result.find((l) => l.category === "Contingency Buffer");

    expect(bufferLine).toBeDefined();
    expect(bufferLine!.percent).toBeGreaterThanOrEqual(MIN_BUFFER_PERCENT);
  });

  it("automatically inserts a buffer line if none was provided", () => {
    const input = [
      { category: "Venue" as BudgetCategory, percent: 60 },
      { category: "Catering & Bar" as BudgetCategory, percent: 40 },
    ];

    const result = normalizeBudget(input, 20000);
    const bufferLine = result.find((l) => l.category === "Contingency Buffer");

    expect(bufferLine).toBeDefined();
    expect(bufferLine!.isBuffer).toBe(true);
    expect(bufferLine!.percent).toBeGreaterThanOrEqual(MIN_BUFFER_PERCENT);
  });

  it("always sums percentages to exactly 100.0%", () => {
    const testCases = [
      { budget: 5000, lines: [{ category: "Venue" as BudgetCategory, percent: 33.3 }] },
      {
        budget: 15450,
        lines: [
          { category: "Venue" as BudgetCategory, percent: 25 },
          { category: "Catering & Bar" as BudgetCategory, percent: 35 },
          { category: "Decor & Rentals" as BudgetCategory, percent: 15 },
          { category: "Entertainment & AV" as BudgetCategory, percent: 15 },
        ],
      },
    ];

    for (const testCase of testCases) {
      const result = normalizeBudget(testCase.lines, testCase.budget);
      const sumPercent = result.reduce((acc, curr) => acc + curr.percent, 0);
      expect(Math.round(sumPercent * 10) / 10).toBe(100.0);
    }
  });

  it("calculates exact monetary amounts matching percent of total budget", () => {
    const total = 50000;
    const result = generateBaselineBudget(total);

    const sumAmounts = result.reduce((acc, curr) => acc + curr.amount, 0);
    // Sum of amounts should match total within rounding of 1 dollar
    expect(Math.abs(sumAmounts - total)).toBeLessThanOrEqual(1);

    for (const line of result) {
      const expectedAmount = Math.round(((line.percent / 100) * total) * 100) / 100;
      expect(line.amount).toBe(expectedAmount);
    }
  });

  it("adjusts a category percentage and re-balances remaining categories", () => {
    const baseline = generateBaselineBudget(20000);
    const adjusted = adjustCategoryPercent(baseline, "Venue", 45, 20000);

    const venueLine = adjusted.find((l) => l.category === "Venue");
    const bufferLine = adjusted.find((l) => l.category === "Contingency Buffer");
    const sumPercent = adjusted.reduce((acc, curr) => acc + curr.percent, 0);

    expect(venueLine!.percent).toBe(45);
    expect(bufferLine!.percent).toBeGreaterThanOrEqual(MIN_BUFFER_PERCENT);
    expect(Math.round(sumPercent * 10) / 10).toBe(100.0);
  });

  it("provides non-zero volatility metadata for each realistic category", () => {
    for (const def of CATEGORY_DEFAULTS) {
      if (!def.isBuffer) {
        expect(def.volatility).toBeGreaterThan(0);
      }
    }
  });
});
