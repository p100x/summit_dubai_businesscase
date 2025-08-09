import { Parser } from "expr-eval";
import { Model, RevenueGroup, CostGroup, FormulaField } from "./schema";

export type EvaluatedItem = {
  name: string;
  amountAED: number;
};

export type EvaluatedGroup = {
  name: string;
  items: EvaluatedItem[];
  subtotalAED: number;
};

export type EvaluationResult = {
  revenueGroups: EvaluatedGroup[];
  costGroups: EvaluatedGroup[];
  revenueAED: number;
  costAED: number;
  ebitdaAED: number;
  ebitdaMargin: number;
  context: Record<string, number>;
};

function toAmount(formulaField: FormulaField | undefined, context: Record<string, number>): number | undefined {
  if (!formulaField) return undefined;
  if ("amount" in formulaField && typeof (formulaField as { amount?: number }).amount === "number") {
    return formulaField.amount;
  }
  if ("formula" in formulaField && typeof (formulaField as { formula?: string }).formula === "string") {
    const expr = formulaField.formula;
    try {
      const parser = new Parser();
      const compiled = parser.parse(expr);
      const value = compiled.evaluate(context);
      return typeof value === "number" && Number.isFinite(value) ? value : 0;
    } catch {
      return 0;
    }
  }
  return undefined;
}

function evaluateRevenueGroups(groups: RevenueGroup[], ctx: Record<string, number>): EvaluatedGroup[] {
  return groups.map((g, gi) => {
    const items = g.items.map((it, ii) => {
      const keyBase = `revenues_${gi}_${ii}`;
      const units = it.units ?? ctx[`${keyBase}_units`] ?? 0;
      const priceAED =
        it.price_aed ??
        (it.price_eur !== undefined ? (it.price_eur as number) * (ctx.eur_to_aed ?? 0) : undefined) ??
        0;
      const marginAED =
        it.margin_aed ??
        (it.margin_eur !== undefined ? (it.margin_eur as number) * (ctx.eur_to_aed ?? 0) : undefined);

      // direct value via formula/amount takes precedence
      const direct = toAmount(it.value, ctx);

      let amount = 0;
      if (direct !== undefined) {
        amount = direct;
      } else if (marginAED !== undefined && units) {
        amount = marginAED * units;
      } else if (priceAED !== undefined && units) {
        amount = priceAED * units;
      }
      return { name: it.name, amountAED: round(amount) };
    });
    const subtotalAED = round(items.reduce((s, i) => s + i.amountAED, 0));
    return { name: g.name, items, subtotalAED };
  });
}

function evaluateCostGroups(groups: CostGroup[], ctx: Record<string, number>): EvaluatedGroup[] {
  return groups.map((g, gi) => {
    const items = g.items.map((it) => {
      const localCtx = { ...ctx, ...(it.inputs ?? {}) };
      const amount = toAmount(it.value, localCtx) ?? 0;
      return { name: it.name, amountAED: round(amount) };
    });
    const subtotalAED = round(items.reduce((s, i) => s + i.amountAED, 0));
    return { name: g.cluster, items, subtotalAED };
  });
}

function round(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function evaluateModel(model: Model): EvaluationResult {
  const ctx: Record<string, number> = {};

  // Flatten numeric assumptions into context
  for (const [k, v] of Object.entries(model.assumptions)) {
    if (typeof v === "number") ctx[k] = v;
  }

  const revenueGroups = evaluateRevenueGroups(model.model.revenues, ctx);
  const costGroups = evaluateCostGroups(model.model.costs, ctx);

  const revenueAED = round(revenueGroups.reduce((s, g) => s + g.subtotalAED, 0));
  const costAED = round(costGroups.reduce((s, g) => s + g.subtotalAED, 0));
  const ebitdaAED = round(revenueAED - costAED);
  const ebitdaMargin = revenueAED > 0 ? round(ebitdaAED / revenueAED) : 0;

  return {
    revenueGroups,
    costGroups,
    revenueAED,
    costAED,
    ebitdaAED,
    ebitdaMargin,
    context: ctx,
  };
}

