import { ScenarioType, BudgetCategory, RiskBand } from "../validation/schemas";

export interface ScenarioRuleDefinition {
  scenarioId: ScenarioType;
  label: string;
  description: string;
  categorySeverities: Record<BudgetCategory, number>; // Base severity between 0.0 and 1.0
  locationModifiers: {
    outdoor: number; // Multiplier on severity
    hybrid: number;
    indoor: number;
  };
  defaultContingencies: Record<BudgetCategory, {
    action: string;
    costFactor: number; // Fraction of category budget required for contingency
    timelineImpactMin: number;
  }>;
}

export const SCENARIO_RULES: Record<ScenarioType, ScenarioRuleDefinition> = {
  rain: {
    scenarioId: "rain",
    label: "Crisis 1: Sudden Downpour / Storm",
    description: "Heavy rain, wind gusts, or severe weather threatens outdoor ceremonies and open-air dining.",
    categorySeverities: {
      "Venue": 0.90,
      "Catering & Bar": 0.75,
      "Decor & Rentals": 0.85,
      "Entertainment & AV": 0.90,
      "Photography & Media": 0.70,
      "Miscellaneous & Permits": 0.60,
      "Contingency Buffer": 0.20,
    },
    locationModifiers: {
      outdoor: 1.0,
      hybrid: 0.65,
      indoor: 0.15, // Indoor has low vulnerability to rain
    },
    defaultContingencies: {
      "Venue": {
        action: "Activate tent canopy contract or transition into pre-booked indoor pavillion.",
        costFactor: 0.18,
        timelineImpactMin: 45,
      },
      "Catering & Bar": {
        action: "Shift bar and buffet service stations under covered marquee with windguards.",
        costFactor: 0.08,
        timelineImpactMin: 20,
      },
      "Decor & Rentals": {
        action: "Move floral arches indoors; swap water-soluble fabric signage for waterproof acrylic.",
        costFactor: 0.05,
        timelineImpactMin: 30,
      },
      "Entertainment & AV": {
        action: "Deploy waterproof amp covers, elevated stage pallets, and reroute outdoor power lines via GFCI.",
        costFactor: 0.07,
        timelineImpactMin: 25,
      },
      "Photography & Media": {
        action: "Switch to covered architectural portrait locations and deploy translucent bubble umbrellas.",
        costFactor: 0.03,
        timelineImpactMin: 15,
      },
      "Miscellaneous & Permits": {
        action: "Distribute bulk umbrellas, non-slip entrance floor runners, and setup towel station.",
        costFactor: 0.04,
        timelineImpactMin: 10,
      },
      "Contingency Buffer": {
        action: "Draw down buffer reserve to cover emergency weather infrastructure.",
        costFactor: 0.0,
        timelineImpactMin: 0,
      },
    },
  },

  vendor_noshow: {
    scenarioId: "vendor_noshow",
    label: "Crisis 2: Critical Vendor Cancellation / No-Show",
    description: "Lead caterer, DJ, or key vendor cancels 48 hours prior or goes unresponsive day-of.",
    categorySeverities: {
      "Catering & Bar": 0.95, // Catastrophic if guests have no meal
      "Entertainment & AV": 0.80,
      "Photography & Media": 0.75,
      "Venue": 0.98,
      "Decor & Rentals": 0.45,
      "Miscellaneous & Permits": 0.40,
      "Contingency Buffer": 0.30,
    },
    locationModifiers: {
      outdoor: 1.0,
      hybrid: 1.0,
      indoor: 1.0,
    },
    defaultContingencies: {
      "Venue": {
        action: "Trigger immediate emergency relocation to backup civic hall or hotel ballroom partner.",
        costFactor: 0.35,
        timelineImpactMin: 90,
      },
      "Catering & Bar": {
        action: "Dispatch emergency on-demand drop-off catering & food truck partner; activate backup beverage supplier.",
        costFactor: 0.25,
        timelineImpactMin: 60,
      },
      "Entertainment & AV": {
        action: "Engage backup vendor network on retainer or plug pre-curated high-fidelity Spotify playlist into house PA.",
        costFactor: 0.12,
        timelineImpactMin: 20,
      },
      "Photography & Media": {
        action: "Summon on-call freelance second shooter from local creator collective.",
        costFactor: 0.15,
        timelineImpactMin: 30,
      },
      "Decor & Rentals": {
        action: "Simplify tabletop layouts and repurpose ceremony flowers into reception decor.",
        costFactor: 0.05,
        timelineImpactMin: 25,
      },
      "Miscellaneous & Permits": {
        action: "Reassign volunteers and expedite replacement rentals via local depot.",
        costFactor: 0.08,
        timelineImpactMin: 20,
      },
      "Contingency Buffer": {
        action: "Absorb vendor emergency replacement fee and same-day surge premiums.",
        costFactor: 0.0,
        timelineImpactMin: 0,
      },
    },
  },

  guest_surge: {
    scenarioId: "guest_surge",
    label: "Crisis 3: +30% Guest Count Surge",
    description: "Unexpected +1s, community attendees, or late RSVPs push guest count beyond venue & catering capacity.",
    categorySeverities: {
      "Catering & Bar": 0.90, // Per-plate deficits, drink shortages
      "Venue": 0.75, // Seating and fire marshal occupancy pressure
      "Decor & Rentals": 0.70, // Missing chairs and place settings
      "Miscellaneous & Permits": 0.65, // Restroom lines, waste management, parking
      "Entertainment & AV": 0.30,
      "Photography & Media": 0.25,
      "Contingency Buffer": 0.40,
    },
    locationModifiers: {
      outdoor: 0.90, // Outdoor has more physical room
      hybrid: 1.0,
      indoor: 1.15, // Indoor has hard fire code limits
    },
    defaultContingencies: {
      "Catering & Bar": {
        action: "Order emergency cocktail-style heavy appetizer replenishment and supplementary case lot alcohol.",
        costFactor: 0.22,
        timelineImpactMin: 20,
      },
      "Venue": {
        action: "Open spillover terrace, adjust table spacing, and configure standing high-top cocktail zones.",
        costFactor: 0.10,
        timelineImpactMin: 30,
      },
      "Decor & Rentals": {
        action: "Order rapid-dispatch folding chairs and eco-luxe compostable place settings.",
        costFactor: 0.12,
        timelineImpactMin: 40,
      },
      "Miscellaneous & Permits": {
        action: "Deploy supplemental parking valets and add temporary sanitization stations.",
        costFactor: 0.08,
        timelineImpactMin: 15,
      },
      "Entertainment & AV": {
        action: "Add auxiliary satellite speakers for spillover audience zones.",
        costFactor: 0.05,
        timelineImpactMin: 15,
      },
      "Photography & Media": {
        action: "Instruct photographer to broaden wide-angle coverage and extend group photo sessions.",
        costFactor: 0.04,
        timelineImpactMin: 15,
      },
      "Contingency Buffer": {
        action: "Allocate buffer directly to per-head catering and seating surcharges.",
        costFactor: 0.0,
        timelineImpactMin: 0,
      },
    },
  },

  budget_cut: {
    scenarioId: "budget_cut",
    label: "Crisis 4: 15% Budget Cut / Sponsor Withdrawal",
    description: "Unexpected reduction in funds or sponsor drop-out requires immediate surgical cuts without destroying guest experience.",
    categorySeverities: {
      "Decor & Rentals": 0.85, // Most compressible category
      "Entertainment & AV": 0.70,
      "Miscellaneous & Permits": 0.65,
      "Catering & Bar": 0.60,
      "Photography & Media": 0.50,
      "Venue": 0.30, // Deposits usually non-refundable
      "Contingency Buffer": 0.20,
    },
    locationModifiers: {
      outdoor: 1.0,
      hybrid: 1.0,
      indoor: 1.0,
    },
    defaultContingencies: {
      "Decor & Rentals": {
        action: "Pivot to minimalist architectural greenery and DIY ambient candle clusters; cut specialty rental furniture.",
        costFactor: 0.0,
        timelineImpactMin: 0,
      },
      "Entertainment & AV": {
        action: "Shorten live band duration by 1 hour and transition to curated DJ playlist for late-night segment.",
        costFactor: 0.0,
        timelineImpactMin: 0,
      },
      "Catering & Bar": {
        action: "Switch from plated service to high-end family-style dining and streamline open bar to signature cocktails & beer/wine.",
        costFactor: 0.0,
        timelineImpactMin: 0,
      },
      "Photography & Media": {
        action: "Reduce photographer coverage from 10 hours to 6 peak hours; retain full digital high-res rights.",
        costFactor: 0.0,
        timelineImpactMin: 0,
      },
      "Venue": {
        action: "Negotiate waiver of setup/cleanup overtime fees in exchange for daytime breakdown by party volunteers.",
        costFactor: 0.0,
        timelineImpactMin: 0,
      },
      "Miscellaneous & Permits": {
        action: "Consolidate digital invitations and guest signage, eliminating printed collateral.",
        costFactor: 0.0,
        timelineImpactMin: 0,
      },
      "Contingency Buffer": {
        action: "Recalibrate contingency reserve to protect non-negotiables.",
        costFactor: 0.0,
        timelineImpactMin: 0,
      },
    },
  },
};

/**
 * Maps quantitative risk scores to standard categorical risk bands.
 * 0-33: Low
 * 34-66: Medium
 * 67-100: High
 */
export function getRiskBand(score: number): RiskBand {
  if (score <= 33) return "Low";
  if (score <= 66) return "Medium";
  return "High";
}
