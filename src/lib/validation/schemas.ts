import { z } from "zod";

// ==========================================
// 1. Intake Validation & Sanitization
// ==========================================

export const EventIntakeSchema = z.object({
  eventType: z.enum([
    "wedding",
    "birthday",
    "festival",
    "corporate",
    "anniversary",
    "community",
    "dinner_party",
    "other",
  ]).default("wedding"),
  title: z
    .string()
    .trim()
    .max(100, "Title must be 100 characters or fewer")
    .default("Celebration Plan"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .default(() => new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0]),
  locationType: z.enum(["indoor", "outdoor", "hybrid"]).default("hybrid"),
  guestCount: z
    .number()
    .int("Guest count must be an integer")
    .min(1, "Guest count must be at least 1")
    .max(50000, "Guest count exceeds maximum limit")
    .default(80),
  budget: z
    .number()
    .min(50, "Budget must be at least 50")
    .max(10000000, "Budget exceeds limit")
    .default(15000),
  currency: z.string().trim().max(10).default("USD"),
  dietary: z.array(z.string().trim().max(50)).default([]),
  accessibilityNeeds: z.array(z.string().trim().max(80)).default([]),
  vibe: z.array(z.string().trim().max(40)).default([]),
  notes: z.string().trim().max(500, "Notes cannot exceed 500 characters").optional().default(""),
});

export type EventIntake = z.infer<typeof EventIntakeSchema>;

// ==========================================
// 2. Budget Schemas
// ==========================================

export const BudgetCategoryEnum = z.enum([
  "Venue",
  "Catering & Bar",
  "Decor & Rentals",
  "Entertainment & AV",
  "Photography & Media",
  "Contingency Buffer",
  "Miscellaneous & Permits",
]);

export type BudgetCategory = z.infer<typeof BudgetCategoryEnum>;

export const BudgetLineSchema = z.object({
  id: z.string(),
  category: BudgetCategoryEnum,
  percent: z.number().min(0).max(100),
  amount: z.number().min(0),
  isBuffer: z.boolean().default(false),
  isFlexible: z.boolean().default(true),
  notes: z.string().default(""),
});

export type BudgetLine = z.infer<typeof BudgetLineSchema>;

// ==========================================
// 3. Timeline Schemas
// ==========================================

export const TimelineItemSchema = z.object({
  id: z.string(),
  phase: z.enum(["prep", "day-of"]),
  timeOffsetDays: z.number().optional(), // For prep countdown: -90, -30, -7, etc.
  time: z.string().optional(), // E.g., "14:00" for day-of
  durationMin: z.number().min(5).max(720),
  label: z.string().min(1).max(120),
  description: z.string().max(300).default(""),
  category: z.string().max(50).default("General"),
  isFixed: z.boolean().default(false),
  fixedCutoffTime: z.string().optional(), // E.g. "23:00" venue closing
  dependsOn: z.array(z.string()).default([]),
  completed: z.boolean().default(false),
});

export type TimelineItem = z.infer<typeof TimelineItemSchema>;

// ==========================================
// 4. Vendor Checklist Schemas
// ==========================================

export const VendorStatusEnum = z.enum(["to-contact", "quoted", "booked"]);
export type VendorStatus = z.infer<typeof VendorStatusEnum>;

export const VendorItemSchema = z.object({
  id: z.string(),
  category: z.string().min(1).max(60),
  roleTitle: z.string().max(80).default(""),
  status: VendorStatusEnum.default("to-contact"),
  estimatedCost: z.number().min(0).default(0),
  questions: z.array(z.string()).default([]),
  redFlags: z.array(z.string()).default([]),
  backupNeeded: z.boolean().default(false),
  backupOption: z.string().optional(),
  notes: z.string().max(250).default(""),
});

export type VendorItem = z.infer<typeof VendorItemSchema>;

// ==========================================
// 5. Personalized Ideas Schemas
// ==========================================

export const PersonalizedIdeasSchema = z.object({
  theme: z.string().max(100),
  decorIdeas: z.array(z.string()).default([]),
  menuHighlights: z.array(z.string()).default([]),
  activitySuggestions: z.array(z.string()).default([]),
  inclusiveNotes: z.array(z.string()).default([]),
});

export type PersonalizedIdeas = z.infer<typeof PersonalizedIdeasSchema>;

// ==========================================
// 6. Full Plan Schema
// ==========================================

export const FullPlanSchema = z.object({
  id: z.string(),
  intake: EventIntakeSchema,
  summary: z.string(),
  budget: z.array(BudgetLineSchema),
  timeline: z.array(TimelineItemSchema),
  vendors: z.array(VendorItemSchema),
  ideas: PersonalizedIdeasSchema,
  createdAt: z.string(),
  isFallback: z.boolean().default(false),
});

export type FullPlan = z.infer<typeof FullPlanSchema>;

// ==========================================
// 7. Stress Testing & Scenario Schemas
// ==========================================

export const ScenarioTypeEnum = z.enum([
  "rain",
  "vendor_noshow",
  "guest_surge",
  "budget_cut",
]);

export type ScenarioType = z.infer<typeof ScenarioTypeEnum>;

export const ScenarioConfigSchema = z.object({
  id: ScenarioTypeEnum,
  label: z.string(),
  description: z.string(),
  guestMultiplier: z.number().optional(),
  rainProbability: z.number().optional(),
  budgetCutPercent: z.number().optional(),
  affectedCategory: z.string().optional(),
});

export type ScenarioConfig = z.infer<typeof ScenarioConfigSchema>;

export const RiskBandEnum = z.enum(["Low", "Medium", "High"]);
export type RiskBand = z.infer<typeof RiskBandEnum>;

export const RiskResultSchema = z.object({
  itemId: z.string(),
  itemLabel: z.string(),
  category: z.string(),
  scenarioId: ScenarioTypeEnum,
  exposure: z.number().min(0).max(1),
  scenarioSeverity: z.number().min(0).max(1),
  mitigation: z.number().min(0).max(1),
  score: z.number().min(0).max(100),
  band: RiskBandEnum,
  reason: z.string(),
  contingency: z.string(),
  estimatedExtraCost: z.number().min(0),
  timelineImpactMin: z.number().default(0),
});

export type RiskResult = z.infer<typeof RiskResultSchema>;

export const StressTestResponseSchema = z.object({
  scenarioId: ScenarioTypeEnum,
  scenarioLabel: z.string(),
  overallRiskScore: z.number().min(0).max(100),
  overallRiskBand: RiskBandEnum,
  summary: z.string(),
  itemRisks: z.array(RiskResultSchema),
  totalExtraCost: z.number(),
  contingencyActions: z.array(z.string()),
  bufferAdequacy: z.object({
    currentBuffer: z.number(),
    requiredBuffer: z.number(),
    isSufficient: z.boolean(),
    deficitOrSurplus: z.number(),
  }),
});

export type StressTestResponse = z.infer<typeof StressTestResponseSchema>;

// ==========================================
// 8. Day-of Timeline Reflow Schemas
// ==========================================

export const ReflowRequestSchema = z.object({
  delayMinutes: z.number().int().min(1).max(360),
  delayedFromItemId: z.string(),
  timeline: z.array(TimelineItemSchema),
});

export type ReflowRequest = z.infer<typeof ReflowRequestSchema>;

export const ReflowConflictSchema = z.object({
  itemId: z.string(),
  label: z.string(),
  originalTime: z.string(),
  projectedTime: z.string(),
  fixedCutoffTime: z.string(),
  severity: z.enum(["warning", "violation"]),
  message: z.string(),
});

export type ReflowConflict = z.infer<typeof ReflowConflictSchema>;

export const VendorDraftMessageSchema = z.object({
  vendorCategory: z.string(),
  urgency: z.enum(["high", "medium"]),
  recipient: z.string(),
  draftSms: z.string(),
  draftEmail: z.string(),
});

export type VendorDraftMessage = z.infer<typeof VendorDraftMessageSchema>;

export const ReflowResponseSchema = z.object({
  delayMinutes: z.number(),
  delayedFromItemId: z.string(),
  adjustedTimeline: z.array(TimelineItemSchema),
  conflicts: z.array(ReflowConflictSchema),
  vendorDraftMessages: z.array(VendorDraftMessageSchema),
});

export type ReflowResponse = z.infer<typeof ReflowResponseSchema>;
