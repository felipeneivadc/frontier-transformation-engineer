import { PRICE, P3_TIERS } from "../calculator-data.js";
import { amount } from "./shared.js";

export function planCost(plan, annualCost) {
  amount(annualCost, "Custo anual");
  const purchase = plan.units * (1 - plan.discount);
  return {
    net: purchase + Math.max(0, annualCost - plan.units),
    purchase,
    unusedUnits: Math.max(0, plan.units - annualCost),
    overage: Math.max(0, annualCost - plan.units),
  };
}
export function comparePricing(result) {
  const low = result.low * PRICE * 12;
  const high = result.high === null ? null : result.high * PRICE * 12;
  const rows = P3_TIERS.map((plan) => ({
    ...plan,
    low: planCost(plan, low),
    high: high === null ? null : planCost(plan, high),
  }));
  const best = (cost) =>
    [
      { tier: 0, net: cost },
      ...rows.map((row) => ({ tier: row.tier, net: planCost(row, cost).net })),
    ].sort((a, b) => a.net - b.net)[0].tier;
  return {
    low,
    high,
    rows,
    bestLow: low > 0 ? best(low) : null,
    bestHigh: high === null || high === 0 ? null : best(high),
  };
}
