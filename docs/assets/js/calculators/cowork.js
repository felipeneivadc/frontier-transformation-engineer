import { COWORK_PROFILES, WORKING_DAYS } from "../calculator-data.js";
import { amount, split, range } from "./shared.js";

export function computeCowork(config) {
  const details = COWORK_PROFILES.map((profile) => {
    const value = config[profile.id];
    const users = amount(value.users, "Usuários", true);
    const distribution = split(value);
    const low =
      users *
      WORKING_DAYS *
      ["light", "medium", "heavy"].reduce(
        (sum, key) => sum + distribution[key] * profile[key][0],
        0,
      );
    const high =
      users *
      WORKING_DAYS *
      ["light", "medium", "heavy"].reduce(
        (sum, key) => sum + distribution[key] * profile[key][1],
        0,
      );
    return { name: profile.name, users, ...range(low, high) };
  });
  return range(
    details.reduce((sum, item) => sum + item.low, 0),
    details.reduce((sum, item) => sum + item.high, 0),
    details,
  );
}
