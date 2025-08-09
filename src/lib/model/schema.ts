import { z } from "zod";

// Generic formula-capable numeric field
export const FormulaFieldSchema = z.union([
  z.object({ formula: z.string().min(1) }),
  z.object({ amount: z.number() }),
]);

export type FormulaField = z.infer<typeof FormulaFieldSchema>;

// Revenue item supports unit pricing in EUR/AED with optional unit counts
export const RevenueItemSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  units: z.number().optional(),
  price_eur: z.number().optional(),
  price_aed: z.number().optional(),
  margin_eur: z.number().optional(),
  margin_aed: z.number().optional(),
  // Optional direct AED amount or formula
  value: FormulaFieldSchema.optional(),
});

export const RevenueGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  items: z.array(RevenueItemSchema),
});

// Cost item supports direct AED or formula fields
export const CostItemSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  value: FormulaFieldSchema.optional(),
  // Convenience primitive inputs to be used in formula, if provided
  inputs: z.record(z.string(), z.number()).optional(),
});

export const CostGroupSchema = z.object({
  cluster: z.string(),
  items: z.array(CostItemSchema),
});

// Cashflow entries for calendar visualization
export const CashflowEntrySchema = z.object({
  date: z.string(), // ISO date string
  label: z.string().optional(),
  inflow: FormulaFieldSchema.optional(),
  outflow: FormulaFieldSchema.optional(),
});

export const RiskSchema = z.object({
  risk: z.string(),
  severity: z.enum(["Low", "Med", "High"]).or(z.string()),
  mitigation: z.string(),
});

export const KpiSchema = z.object({
  label: z.string(),
  target: z.number().nullable().optional(),
  value: z.number().nullable().optional(),
  format: z.enum(["number", "currency", "percent"]).default("number"),
  unit: z.string().optional(),
});

export const ScenarioMutationSchema = z.object({
  // Apply a multiplier to matching numeric fields inside revenue items
  multiplyKeys: z.array(z.string()).optional(),
  // Multipliers to assumptions keys: { key: factor }
  multiplyAssumptions: z.record(z.string(), z.number()).optional(),
});

export const ScenarioSchema = z.object({
  id: z.string(),
  label: z.string(),
  mutations: ScenarioMutationSchema,
});

export const ModelSchema = z.object({
  assumptions: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])).default({}),
  model: z
    .object({
      revenues: z.array(RevenueGroupSchema).default([]),
      costs: z.array(CostGroupSchema).default([]),
    })
    .default({ revenues: [], costs: [] }),
  cashflow: z.array(CashflowEntrySchema).default([]),
  risks: z.array(RiskSchema).default([]),
  kpis: z.array(KpiSchema).default([]),
  scenarios: z.array(ScenarioSchema).default([]),
});

export type RevenueItem = z.infer<typeof RevenueItemSchema>;
export type RevenueGroup = z.infer<typeof RevenueGroupSchema>;
export type CostItem = z.infer<typeof CostItemSchema>;
export type CostGroup = z.infer<typeof CostGroupSchema>;
export type CashflowEntry = z.infer<typeof CashflowEntrySchema>;
export type Risk = z.infer<typeof RiskSchema>;
export type Kpi = z.infer<typeof KpiSchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;
export type Model = z.infer<typeof ModelSchema>;

export const Currency = {
  AED: "AED",
  EUR: "EUR",
} as const;

