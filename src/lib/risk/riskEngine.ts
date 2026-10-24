import {
  FullPlan,
  ScenarioType,
  RiskResult,
  StressTestResponse,
  BudgetCategory,
} from "../validation/schemas";
import { SCENARIO_RULES, getRiskBand } from "./scenarioRules";

/**
 * Calculates exposure for an item based on event attributes and item properties.
 * Range: 0.10 to 1.0
 */
export function calculateExposure(
  category: BudgetCategory,
  locationType: "indoor" | "outdoor" | "hybrid",
  budgetShare: number,
  hasBackup: boolean
): number {
  let baseExposure = 0.5;

  // Outdoor sensitivity
  if (locationType === "outdoor") {
    if (category === "Venue" || category === "Decor & Rentals" || category === "Entertainment & AV") {
      baseExposure += 0.35;
    }
  } else if (locationType === "hybrid") {
    if (category === "Venue" || category === "Decor & Rentals") {
      baseExposure += 0.15;
    }
  } else {
    // Indoor reduces weather exposure
    baseExposure -= 0.15;
  }

  // Budget concentration exposure
  if (budgetShare > 25) {
    baseExposure += 0.15;
  } else if (budgetShare < 8) {
    baseExposure -= 0.10;
  }

  // Lack of backup exposure
  if (!hasBackup) {
    baseExposure += 0.10;
  }

  return Math.min(1.0, Math.max(0.1, Math.round(baseExposure * 100) / 100));
}

/**
 * Calculates mitigation factor for an item (0.0 to 0.85).
 */
export function calculateMitigation(
  hasBackupPlan: boolean,
  isVendorBooked: boolean,
  hasDedicatedBuffer: boolean
): number {
  let mitigation = 0.1;

  if (hasBackupPlan) mitigation += 0.35;
  if (isVendorBooked) mitigation += 0.15;
  if (hasDedicatedBuffer) mitigation += 0.15;

  return Math.min(0.85, Math.max(0.0, Math.round(mitigation * 100) / 100));
}

/**
 * Deterministic Risk Engine: Evaluates a FullPlan against a Scenario.
 * Formulates risk per category using:
 * risk = exposure x scenarioSeverity x (1 - mitigation) x 100
 */
export function evaluateStressTest(
  plan: FullPlan,
  scenarioId: ScenarioType
): StressTestResponse {
  const rule = SCENARIO_RULES[scenarioId];
  if (!rule) {
    throw new Error(`Unknown scenario ID: ${scenarioId}`);
  }

  const locationMod = rule.locationModifiers[plan.intake.locationType] ?? 1.0;
  const currentBufferLine = plan.budget.find((b) => b.isBuffer);
  const currentBufferAmount = currentBufferLine?.amount ?? 0;

  const itemRisks: RiskResult[] = [];
  let totalExtraCost = 0;
  let weightedRiskSum = 0;
  let totalWeights = 0;

  for (const line of plan.budget) {
    const baseSev = rule.categorySeverities[line.category] ?? 0.5;
    const effectiveSeverity = Math.min(1.0, Math.max(0.05, baseSev * locationMod));

    // Determine vendor mitigation
    const matchingVendor = plan.vendors.find((v) =>
      v.category.toLowerCase().includes(line.category.toLowerCase().split(" ")[0])
    );
    const hasBackup = Boolean(matchingVendor?.backupOption || matchingVendor?.backupNeeded === false);
    const isBooked = matchingVendor?.status === "booked";

    const exposure = calculateExposure(
      line.category,
      plan.intake.locationType,
      line.percent,
      hasBackup
    );

    const mitigation = calculateMitigation(hasBackup, isBooked, currentBufferAmount > 0);

    // Core formula
    const rawScore = exposure * effectiveSeverity * (1 - mitigation) * 100;
    const score = Math.min(100, Math.max(0, Math.round(rawScore)));
    const band = getRiskBand(score);

    // Contingency & Extra Cost
    const contingencyDef = rule.defaultContingencies[line.category] || {
      action: "Review vendor agreement and reallocate buffer reserves.",
      costFactor: 0.05,
      timelineImpactMin: 15,
    };

    let itemExtraCost = 0;
    if (scenarioId !== "budget_cut") {
      itemExtraCost = Math.round(line.amount * contingencyDef.costFactor * 100) / 100;
      totalExtraCost += itemExtraCost;
    }

    const reason = `Severity: ${Math.round(effectiveSeverity * 100)}% | Exposure: ${Math.round(exposure * 100)}% | Mitigation: ${Math.round(mitigation * 100)}%`;

    itemRisks.push({
      itemId: line.id,
      itemLabel: line.category,
      category: line.category,
      scenarioId,
      exposure,
      scenarioSeverity: Math.round(effectiveSeverity * 100) / 100,
      mitigation,
      score,
      band,
      reason,
      contingency: contingencyDef.action,
      estimatedExtraCost: itemExtraCost,
      timelineImpactMin: contingencyDef.timelineImpactMin,
    });

    const weight = Math.max(1, line.percent);
    weightedRiskSum += score * weight;
    totalWeights += weight;
  }

  const overallRiskScore = Math.min(
    100,
    Math.max(0, Math.round(weightedRiskSum / (totalWeights || 1)))
  );
  const overallRiskBand = getRiskBand(overallRiskScore);

  const isSufficient = currentBufferAmount >= totalExtraCost;
  const deficitOrSurplus = Math.round((currentBufferAmount - totalExtraCost) * 100) / 100;

  // Extract actionable contingencies
  const contingencyActions = itemRisks
    .filter((r) => r.score > 25 && r.contingency)
    .map((r) => `[${r.itemLabel}] ${r.contingency}`);

  let summary = "";
  if (scenarioId === "rain") {
    summary = `Simulation reveals ${overallRiskBand.toUpperCase()} risk under precipitation. Outdoor items (Venue, Decor, AV) face exposure; buffer adequacy is ${isSufficient ? "SUFFICIENT" : "DEFICIENT by " + Math.abs(deficitOrSurplus) + " " + plan.intake.currency}.`;
  } else if (scenarioId === "vendor_noshow") {
    summary = `Critical vendor disruption simulated. High vulnerability on single-point-of-failure categories without confirmed backups. Estimated emergency premium: ${totalExtraCost} ${plan.intake.currency}.`;
  } else if (scenarioId === "guest_surge") {
    summary = `+30% guest surge pushes Catering, Bar, and Seating capacity. Required buffer buffer coverage: ${totalExtraCost} ${plan.intake.currency}. Current reserve ${isSufficient ? "covers" : "falls short of"} projected overrun.`;
  } else {
    summary = `15% budget cut simulation identifies flexible decor, entertainment, and collateral items that can be safely descoped without impacting core guest dining or venue reservations.`;
  }

  return {
    scenarioId,
    scenarioLabel: rule.label,
    overallRiskScore,
    overallRiskBand,
    summary,
    itemRisks,
    totalExtraCost: Math.round(totalExtraCost * 100) / 100,
    contingencyActions,
    bufferAdequacy: {
      currentBuffer: currentBufferAmount,
      requiredBuffer: Math.round(totalExtraCost * 100) / 100,
      isSufficient,
      deficitOrSurplus,
    },
  };
}
