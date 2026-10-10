import { HARNESS_RANGES, WORKING_DAYS } from "../calculator-data.js";
import { amount, split, range } from "./shared.js";

export function computeHarness(config) {
  const people = amount(config.people, "Pessoas com acesso", true);
  const frequency = amount(config.frequency, "Interações por pessoa/dia");
  const distribution = split(config);
  const interactions = people * frequency * WORKING_DAYS;
  const low =
    interactions *
    ["light", "medium", "heavy"].reduce(
      (sum, key) => sum + distribution[key] * HARNESS_RANGES[key][0],
      0,
    );
  const high =
    interactions * distribution.heavy > 0
      ? null
      : interactions *
        (distribution.light * HARNESS_RANGES.light[1] +
          distribution.medium * HARNESS_RANGES.medium[1]);
  return { ...range(low, high), interactions };
}
