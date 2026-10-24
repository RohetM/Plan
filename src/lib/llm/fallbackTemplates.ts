import {
  EventIntake,
  FullPlan,
  TimelineItem,
  VendorItem,
  PersonalizedIdeas,
} from "../validation/schemas";
import { generateBaselineBudget } from "../budget/budgetEngine";

export function generateDeterministicPlan(intake: EventIntake): FullPlan {
  const budget = generateBaselineBudget(intake.budget);

  // Personalized ideas synthesized from intake
  const dietaryStr =
    intake.dietary.length > 0
      ? intake.dietary.join(", ")
      : "Universal Crowd-Pleasing";
  const a11yStr =
    intake.accessibilityNeeds.length > 0
      ? intake.accessibilityNeeds.join(", ")
      : "Step-free and sensory-friendly";

  const isOutdoor =
    intake.locationType === "outdoor" || intake.locationType === "hybrid";

  const ideas: PersonalizedIdeas = {
    theme: `${intake.vibe.length > 0 ? intake.vibe[0] : "Modern Elegance"} — ${intake.title}`,
    decorIdeas: [
      `${isOutdoor ? "Weatherproof architectural lighting and wind-resistant centerpieces" : "Ambient warm up-lighting and modular drapery"}`,
      "Cohesive seasonal botanical arrangements and repurposed ceremony-to-reception florals",
      "High-contrast, large-print visual signage with matte non-glare finish",
      "Eco-conscious reusable linen runners and warm candlelight accents",
    ],
    menuHighlights: [
      `Signature seasonal tasting stations with dedicated certified ${dietaryStr} selections`,
      "Zero-proof craft mocktail bar featuring botanical infusions alongside premium wine/spirits",
      "Passed hors d'oeuvres labeled with clear allergen icons and ingredient transparency",
      "Late-night artisan comfort snack bar (mini sliders and gourmet plant-based sliders)",
    ],
    activitySuggestions: [
      "Curated welcome acoustic session with designated low-sensory seating zones",
      "Interactive polaroid guestbook with tactile memory board and digital archive upload",
      "Dynamic run-of-show celebration transitions featuring guest honor toasts",
      "Late-night high-energy music block with quiet-lounge alternative area",
    ],
    inclusiveNotes: [
      `Accommodating mobility & physical access: Verified ${a11yStr} with wide 48" pathways throughout.`,
      `Accommodating dietary safety: Cross-contamination prevention protocol verified for ${dietaryStr}.`,
      "Restroom accessibility and clear directional tactile iconography established at all doorways.",
    ],
  };

  // Structured Prep & Day-Of Timeline
  const timeline: TimelineItem[] = [
    // Prep Phase
    {
      id: "prep-1",
      phase: "prep",
      timeOffsetDays: -60,
      durationMin: 120,
      label: "Secure Primary Venue & Sign Weather Addendum",
      description: `Confirm reservation with ${intake.locationType} backup clauses and accessibility verification.`,
      category: "Venue",
      isFixed: true,
      dependsOn: [],
      completed: true,
    },
    {
      id: "prep-2",
      phase: "prep",
      timeOffsetDays: -45,
      durationMin: 90,
      label: "Catering Tasting & Dietary Matrix Finalization",
      description: `Audit kitchen protocol for ${dietaryStr} and determine final per-plate headcount guarantee.`,
      category: "Catering & Bar",
      isFixed: false,
      dependsOn: ["prep-1"],
      completed: true,
    },
    {
      id: "prep-3",
      phase: "prep",
      timeOffsetDays: -30,
      durationMin: 60,
      label: "Lock AV, Sound Equipment & Power Redundancy",
      description:
        "Ensure backup generator or battery pack on site; verify outdoor microphone wind filters.",
      category: "Entertainment & AV",
      isFixed: false,
      dependsOn: [],
      completed: false,
    },
    {
      id: "prep-4",
      phase: "prep",
      timeOffsetDays: -14,
      durationMin: 45,
      label: "Final Guest Count Lock & Seating Chart Print",
      description: `Lock headcount at ${intake.guestCount} guests plus 5% overflow margin for late confirmations.`,
      category: "General",
      isFixed: false,
      dependsOn: ["prep-2"],
      completed: false,
    },
    {
      id: "prep-5",
      phase: "prep",
      timeOffsetDays: -2,
      durationMin: 60,
      label: "Emergency Protocol & Contingency Dry Run",
      description:
        "Distribute vendor emergency contact card and review rain / delay procedures with core team.",
      category: "General",
      isFixed: true,
      dependsOn: ["prep-4"],
      completed: false,
    },

    // Day-Of Phase (Run of Show)
    {
      id: "day-1",
      phase: "day-of",
      time: "14:00",
      durationMin: 90,
      label: "Vendor Load-In & Site Technical Setup",
      description:
        "AV sound check, staging setup, floral installation, and catering prep stations active.",
      category: "General",
      isFixed: false,
      dependsOn: [],
      completed: false,
    },
    {
      id: "day-2",
      phase: "day-of",
      time: "15:30",
      durationMin: 45,
      label: "Accessibility Walkthrough & Final Quality Inspection",
      description: `Inspect step-free ramps, clear wheelchair turning radiuses, and label dietary buffet trays.`,
      category: "Venue",
      isFixed: false,
      dependsOn: ["day-1"],
      completed: false,
    },
    {
      id: "day-3",
      phase: "day-of",
      time: "16:30",
      durationMin: 60,
      label: "Guest Arrival & Welcome Refreshment Service",
      description:
        "Ambient background music, welcome signature drinks and passed appetizers.",
      category: "Catering & Bar",
      isFixed: false,
      dependsOn: ["day-2"],
      completed: false,
    },
    {
      id: "day-4",
      phase: "day-of",
      time: "17:30",
      durationMin: 45,
      label: "Main Program / Ceremony Commences",
      description:
        "Keynote program, vows, or celebration toasts. Microphone audio feeds recorded.",
      category: "Entertainment & AV",
      isFixed: true, // Fixed ceremony
      dependsOn: ["day-3"],
      completed: false,
    },
    {
      id: "day-5",
      phase: "day-of",
      time: "18:30",
      durationMin: 90,
      label: "Dinner & Main Dining Service",
      description:
        "Plated or family-style meal served with dietary custom course pacing.",
      category: "Catering & Bar",
      isFixed: false,
      dependsOn: ["day-4"],
      completed: false,
    },
    {
      id: "day-6",
      phase: "day-of",
      time: "20:00",
      durationMin: 120,
      label: "Evening Entertainment & Open Dance Floor",
      description:
        "High-energy live music / DJ performance; dessert station and late-night snacks.",
      category: "Entertainment & AV",
      isFixed: false,
      dependsOn: ["day-5"],
      completed: false,
    },
    {
      id: "day-7",
      phase: "day-of",
      time: "22:00",
      durationMin: 60,
      label: "Event Wind Down & Tear-Down",
      description:
        "Music finishes promptly at noise curfew; vendor strike and guest departure.",
      category: "Venue",
      isFixed: true,
      fixedCutoffTime: "23:00", // Hard cutoff curfew
      dependsOn: ["day-6"],
      completed: false,
    },
  ];

  // Vendor Checklist
  const vendors: VendorItem[] = [
    {
      id: "v-1",
      category: "Venue",
      roleTitle: "Site Operations & Event Director",
      status: "booked",
      estimatedCost: Math.round(intake.budget * 0.3),
      questions: [
        "What is the exact backup indoor room capacity if severe weather forces an outdoor evacuation?",
        "What is the strict municipal noise curfew cutoff and fee for load-out overtime?",
        "Are all restrooms, ramps, and stage areas ADA / universal accessibility compliant?",
      ],
      redFlags: [
        "No written inclement weather transfer guarantee in the rental agreement.",
        "Refusal to disclose in-house vendor exclusive kickbacks or mandatory union fees.",
        "Vague security deposit forfeiture terms for minor floor scuffs.",
      ],
      backupNeeded: false,
      backupOption:
        "Municipal cultural hall hold with 72-hr cancellation option",
      notes: "Deposit paid. Certificate of insurance filed.",
    },
    {
      id: "v-2",
      category: "Catering & Bar",
      roleTitle: "Executive Event Caterer & Beverage Lead",
      status: "quoted",
      estimatedCost: Math.round(intake.budget * 0.3),
      questions: [
        `How do you guarantee strict cross-contamination barriers for ${dietaryStr}?`,
        "What is your grace period for the final headcount guarantee before raw ingredients are purchased?",
        "Do your staff hold active food handler and TIPS alcohol certifications?",
      ],
      redFlags: [
        "Unwillingness to provide a dedicated dietary plate for severe allergens.",
        "Undisclosed service charges, corkage fees, or per-knife cake cutting charges in fine print.",
        "Staffing ratio worse than 1 server per 20 guests for plated meals.",
      ],
      backupNeeded: true,
      backupOption:
        "Local gourmet food truck collective on standby with 24-hr mobilization notice",
      notes: "Tasting scheduled. Awaiting final itemized quotation.",
    },
    {
      id: "v-3",
      category: "Entertainment & AV",
      roleTitle: "Lead DJ / MC & Sound Technician",
      status: "to-contact",
      estimatedCost: Math.round(intake.budget * 0.1),
      questions: [
        "Do you provide battery-powered backup amplification and redundant wireless microphones?",
        "What is your replacement policy if the designated lead performer falls ill?",
        "Can you support wireless auxiliary speakers for outdoor overflow zones?",
      ],
      redFlags: [
        "Contract lacks a named-performer replacement clause with equal pedigree.",
        "Requires access to ungrounded power circuits without providing surge protectors.",
        "Refusal to play or respect strict 'do-not-play' track lists.",
      ],
      backupNeeded: true,
      backupOption:
        "Pre-loaded iPad Pro with offline high-res Spotify playlists and portable PA rental",
      notes: "Reviewing audio reels and references.",
    },
    {
      id: "v-4",
      category: "Photography & Media",
      roleTitle: "Documentary Lead Photographer & Assistant",
      status: "to-contact",
      estimatedCost: Math.round(intake.budget * 0.1),
      questions: [
        "Do your cameras write to dual memory card slots simultaneously for instant real-time backup?",
        "What is your exact turnaround timeline for sneak-peeks and full edited gallery delivery?",
        "Do you carry full commercial liability insurance required by the venue?",
      ],
      redFlags: [
        "Single-card camera bodies with no on-site image redundancy.",
        "No contractually guaranteed turnaround window for photo delivery.",
        "Demands full copyright transfer withholding without commercial reproduction license.",
      ],
      backupNeeded: true,
      backupOption:
        "Second shooter from local creative guild booked with on-call retainer",
      notes: "Portfolio matches the aesthetic vibe.",
    },
    {
      id: "v-5",
      category: "Decor & Rentals",
      roleTitle: "Floral & Rental Equipment Specialist",
      status: "to-contact",
      estimatedCost: Math.round(intake.budget * 0.12),
      questions: [
        "Are outdoor floral arches and structures reinforced against 25 mph wind gusts?",
        "What is your teardown and late-night equipment retrieval protocol?",
        "Do you provide sustainable and compostable rental alternatives?",
      ],
      redFlags: [
        "Severe weather cancellation leaves client with 100% loss of rental fees.",
        "Requires customer to clean and re-box heavy china and linens without support.",
      ],
      backupNeeded: false,
      backupOption: "Pre-packed emergency greenery and silk floral backup kits",
      notes: "Selecting color palette swatches.",
    },
  ];

  return {
    id: `plan-${Date.now()}`,
    intake,
    summary: `Plan-B strategic resilience blueprint generated for "${intake.title}". Features a dynamic ${intake.locationType} architecture optimized for ${intake.guestCount} guests, a balanced ${intake.budget} ${intake.currency} budget with an enforced 10% contingency buffer, and pre-engineered crisis mitigations for weather, vendor failover, and headcount volatility.`,
    budget,
    timeline,
    vendors,
    ideas,
    createdAt: new Date().toISOString(),
    isFallback: true,
  };
}

/**
 * Pre-seeded sample plans matching the PRD target personas
 */
export const SAMPLE_PERSONAS: Record<string, EventIntake> = {
  priya_wedding: {
    eventType: "wedding",
    title: "Priya's Sister's Outdoor Garden Wedding",
    date: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
    locationType: "outdoor",
    guestCount: 120,
    budget: 25000,
    currency: "USD",
    dietary: ["Vegetarian", "Gluten-Free", "Nut-Free"],
    accessibilityNeeds: [
      "Wheelchair Ramp Access",
      "Reserved Front-Row Seating",
    ],
    vibe: ["Romantic", "Botanical", "Warm", "Celebratory"],
    notes:
      "Outdoor botanical garden ceremony with dinner pavilion. Weather resilience is paramount.",
  },
  marcus_festival: {
    eventType: "festival",
    title: "Marcus's Community Arts & Music Fest",
    date: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
    locationType: "hybrid",
    guestCount: 450,
    budget: 12000,
    currency: "USD",
    dietary: ["Vegan", "Halal"],
    accessibilityNeeds: [
      "ASL Interpreter",
      "Quiet Sensory Chill Zone",
      "Step-Free Bathrooms",
    ],
    vibe: ["High-Energy", "Eclectic", "Community-Driven", "Creative"],
    notes:
      "Volunteer-operated municipal park festival with craft stalls and live acoustic stage.",
  },
  aisha_birthday: {
    eventType: "birthday",
    title: "Aisha's 40th Milestone Celebration",
    date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    locationType: "indoor",
    guestCount: 40,
    budget: 6500,
    currency: "USD",
    dietary: ["Dairy-Free", "Pescatarian"],
    accessibilityNeeds: ["Elevator Access", "Subdued Acoustic Levels"],
    vibe: ["Intimate", "Modern Luxe", "Sophisticated"],
    notes:
      "Rooftop glasshouse lounge party with curated wine pairings and jazz trio.",
  },
};
