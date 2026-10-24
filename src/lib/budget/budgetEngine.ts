import { BudgetLine, BudgetCategory } from "../validation/schemas";

export interface CategoryDefault {
  category: BudgetCategory;
  defaultPercent: number;
  volatility: number; // For Monte Carlo max variance (e.g. 0.20 = up to +20%)
  isBuffer: boolean;
  isFlexible: boolean;
  notes: string;
}

export const CATEGORY_DEFAULTS: CategoryDefault[] = [
  {
    category: "Venue",
    defaultPercent: 25,
    volatility: 0.10,
    isBuffer: false,
    isFlexible: false,
    notes: "Rental fee, security deposit, cleanup fee, liability insurance",
  },
  {
    category: "Catering & Bar",
    defaultPercent: 30,
    volatility: 0.25, // High volatility: guest count changes, corkage, dietary extras
    isBuffer: false,
    isFlexible: true,
    notes: "Per-head food, alcoholic & non-alcoholic bar, service staff gratuity",
  },
  {
    category: "Decor & Rentals",
    defaultPercent: 12,
    volatility: 0.20,
    isBuffer: false,
    isFlexible: true,
    notes: "Linens, chairs, centerpieces, lighting, floral arrangements",
  },
  {
    category: "Entertainment & AV",
    defaultPercent: 10,
    volatility: 0.12,
    isBuffer: false,
    isFlexible: true,
    notes: "DJ/Band, sound equipment, mics, acoustics, power supply",
  },
  {
    category: "Photography & Media",
    defaultPercent: 8,
    volatility: 0.08,
    isBuffer: false,
    isFlexible: false,
    notes: "Lead photographer, second shooter, drone license, digital gallery",
  },
  {
    category: "Miscellaneous & Permits",
    defaultPercent: 5,
    volatility: 0.30,
    isBuffer: false,
    isFlexible: true,
    notes: "Municipal permits, emergency transport, signage, guest favors",
  },
  {
    category: "Contingency Buffer",
    defaultPercent: 10, // Mandatory >= 8% (25+30+12+10+8+5+10 = 100)
    volatility: 0.0,
    isBuffer: true,
    isFlexible: false,
    notes: "Mandatory emergency reserve for weather shifts, guest surge, or surge fees",
  },
];

export const MIN_BUFFER_PERCENT = 8;

/**
 * Normalizes an array of budget line percentages so that:
 * 1. The contingency buffer is at least MIN_BUFFER_PERCENT (8%).
 * 2. All percentages sum to exactly 100.0%.
 * 3. All amounts match `totalBudget * (percent / 100)` rounded to 2 decimal places.
 */
export function normalizeBudget(
  lines: Array<{
    category: BudgetCategory;
    percent: number;
    notes?: string;
  }>,
  totalBudget: number
): BudgetLine[] {
  if (lines.length === 0) {
    return generateBaselineBudget(totalBudget);
  }

  // Ensure buffer line exists
  let bufferLine = lines.find((l) => l.category === "Contingency Buffer");
  if (!bufferLine) {
    bufferLine = {
      category: "Contingency Buffer",
      percent: MIN_BUFFER_PERCENT,
      notes: "Mandatory emergency reserve",
    };
    lines = [...lines, bufferLine];
  } else if (bufferLine.percent < MIN_BUFFER_PERCENT) {
    bufferLine.percent = MIN_BUFFER_PERCENT;
  }

  // Calculate sum of non-buffer items
  const nonBufferItems = lines.filter((l) => l.category !== "Contingency Buffer");
  const bufferPercent = Math.max(MIN_BUFFER_PERCENT, bufferLine.percent);
  const remainingBudgetShare = 100 - bufferPercent;

  const currentNonBufferSum = nonBufferItems.reduce((acc, curr) => acc + curr.percent, 0);

  // Re-scale non-buffer items proportionally
  const scaledNonBuffer = nonBufferItems.map((item) => {
    const rawScaled = currentNonBufferSum > 0
      ? (item.percent / currentNonBufferSum) * remainingBudgetShare
      : remainingBudgetShare / nonBufferItems.length;
    return {
      ...item,
      percent: Math.round(rawScaled * 10) / 10, // Round to 1 decimal place
    };
  });

  // Calculate rounding discrepancy
  const newSum = scaledNonBuffer.reduce((acc, curr) => acc + curr.percent, 0) + bufferPercent;
  const discrepancy = Math.round((100 - newSum) * 10) / 10;

  // Add discrepancy to the largest flexible category
  if (discrepancy !== 0 && scaledNonBuffer.length > 0) {
    scaledNonBuffer[0].percent = Math.round((scaledNonBuffer[0].percent + discrepancy) * 10) / 10;
  }

  // Assemble full BudgetLine objects
  const result: BudgetLine[] = [];

  for (const item of scaledNonBuffer) {
    const defaultMeta = CATEGORY_DEFAULTS.find((c) => c.category === item.category);
    result.push({
      id: `budget-${item.category.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      category: item.category,
      percent: item.percent,
      amount: Math.round(((item.percent / 100) * totalBudget) * 100) / 100,
      isBuffer: false,
      isFlexible: defaultMeta?.isFlexible ?? true,
      notes: item.notes || defaultMeta?.notes || "",
    });
  }

  // Add buffer line
  result.push({
    id: "budget-contingency-buffer",
    category: "Contingency Buffer",
    percent: bufferPercent,
    amount: Math.round(((bufferPercent / 100) * totalBudget) * 100) / 100,
    isBuffer: true,
    isFlexible: false,
    notes: bufferLine.notes || "Emergency buffer for unforeseen scenario expenses",
  });

  return result;
}

/**
 * Generates a standard default baseline budget allocation for a given total budget.
 */
export function generateBaselineBudget(totalBudget: number): BudgetLine[] {
  return CATEGORY_DEFAULTS.map((def) => {
    const amount = Math.round(((def.defaultPercent / 100) * totalBudget) * 100) / 100;
    return {
      id: `budget-${def.category.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      category: def.category,
      percent: def.defaultPercent,
      amount,
      isBuffer: def.isBuffer,
      isFlexible: def.isFlexible,
      notes: def.notes,
    };
  });
}

/**
 * Adjusts a single budget category percentage and balances the other categories
 * while keeping the Contingency Buffer at least MIN_BUFFER_PERCENT.
 */
export function adjustCategoryPercent(
  currentLines: BudgetLine[],
  targetCategory: BudgetCategory,
  newPercent: number,
  totalBudget: number
): BudgetLine[] {
  // Enforce buffer constraints
  let bufferLine = currentLines.find((l) => l.isBuffer);
  let bufferPercent = bufferLine ? Math.max(MIN_BUFFER_PERCENT, bufferLine.percent) : MIN_BUFFER_PERCENT;

  if (targetCategory === "Contingency Buffer") {
    bufferPercent = Math.max(MIN_BUFFER_PERCENT, Math.min(60, newPercent));
    const remainingForOthers = 100 - bufferPercent;
    const nonBuffer = currentLines.filter((l) => !l.isBuffer);
    const sumNonBuffer = nonBuffer.reduce((acc, curr) => acc + curr.percent, 0);

    const rebalanced = nonBuffer.map((l) => ({
      category: l.category,
      percent: sumNonBuffer > 0 ? (l.percent / sumNonBuffer) * remainingForOthers : remainingForOthers / nonBuffer.length,
      notes: l.notes,
    }));

    return normalizeBudget([...rebalanced, { category: "Contingency Buffer", percent: bufferPercent }], totalBudget);
  }

  // Pin target category
  const maxAllowed = 100 - bufferPercent;
  const clampedTargetPercent = Math.max(0, Math.min(maxAllowed, newPercent));

  const otherNonBuffer = currentLines.filter(
    (l) => !l.isBuffer && l.category !== targetCategory
  );
  const remainingShare = 100 - bufferPercent - clampedTargetPercent;
  const currentOtherSum = otherNonBuffer.reduce((acc, curr) => acc + curr.percent, 0);

  const rebalancedOthers = otherNonBuffer.map((l) => {
    const proportional = currentOtherSum > 0
      ? (l.percent / currentOtherSum) * remainingShare
      : remainingShare / (otherNonBuffer.length || 1);
    return {
      category: l.category,
      percent: Math.round(proportional * 10) / 10,
      notes: l.notes,
    };
  });

  const sumCalculated = clampedTargetPercent + bufferPercent + rebalancedOthers.reduce((acc, c) => acc + c.percent, 0);
  const discrepancy = Math.round((100 - sumCalculated) * 10) / 10;
  if (discrepancy !== 0 && rebalancedOthers.length > 0) {
    rebalancedOthers[0].percent = Math.round((rebalancedOthers[0].percent + discrepancy) * 10) / 10;
  }

  const allLines = [
    { category: targetCategory, percent: clampedTargetPercent },
    ...rebalancedOthers,
    { category: "Contingency Buffer" as BudgetCategory, percent: bufferPercent },
  ];

  return allLines.map((item) => {
    const defaultMeta = CATEGORY_DEFAULTS.find((c) => c.category === item.category);
    return {
      id: `budget-${item.category.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      category: item.category,
      percent: item.percent,
      amount: Math.round(((item.percent / 100) * totalBudget) * 100) / 100,
      isBuffer: item.category === "Contingency Buffer",
      isFlexible: defaultMeta?.isFlexible ?? true,
      notes: defaultMeta?.notes || "",
    };
  });
}
