export const PRICE = 0.01;
export const DEFAULT_CREDITS = Object.freeze({ light: 125, medium: 500, heavy: 1200 });
export const PERSONAS = Object.freeze([
  Object.freeze({ key: 'corp', name: 'Profissionais de conhecimento corporativo', l: 22, m: 11, h: 5, users: 0 }),
  Object.freeze({ key: 'cust', name: 'Profissionais de atendimento ao cliente', l: 17, m: 13, h: 5, users: 0 }),
  Object.freeze({ key: 'tech', name: 'Profissionais técnicos', l: 12, m: 9, h: 14, users: 0 }),
  Object.freeze({ key: 'mgr', name: 'Gestores e líderes sêniores', l: 13, m: 6, h: 3, users: 0 })
]);
export const TIERS = Object.freeze([
  Object.freeze({ t: 1, credits: 300000, disc: 0.05 }),
  Object.freeze({ t: 2, credits: 1500000, disc: 0.06 }),
  Object.freeze({ t: 3, credits: 3000000, disc: 0.07 }),
  Object.freeze({ t: 4, credits: 15000000, disc: 0.08 }),
  Object.freeze({ t: 5, credits: 30000000, disc: 0.10 }),
  Object.freeze({ t: 6, credits: 75000000, disc: 0.12 }),
  Object.freeze({ t: 7, credits: 150000000, disc: 0.14 }),
  Object.freeze({ t: 8, credits: 225000000, disc: 0.17 }),
  Object.freeze({ t: 9, credits: 300000000, disc: 0.20 })
]);

function assertCount(value) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError('Informe números inteiros não negativos, dentro da precisão numérica suportada.');
  }
}
function assertResult(value) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError('Os valores são altos demais para um cálculo preciso. Reduza as entradas.');
  }
}
export function createDefaultPersonas() { return PERSONAS.map((persona) => ({ ...persona })); }

export function computeConsumption(personas, credits) {
  [credits.light, credits.medium, credits.heavy].forEach(assertCount);
  let monthlyCredits = 0;
  let totalUsers = 0;
  const perUserCredits = personas.map((persona) => {
    [persona.l, persona.m, persona.h, persona.users].forEach(assertCount);
    const perUser = persona.l * credits.light + persona.m * credits.medium + persona.h * credits.heavy;
    assertResult(perUser);
    monthlyCredits += perUser * persona.users;
    totalUsers += persona.users;
    return perUser;
  });
  const annualCredits = monthlyCredits * 12;
  [monthlyCredits, annualCredits, totalUsers].forEach(assertResult);
  const monthlyBudget = monthlyCredits * PRICE;
  return {
    monthlyCredits,
    totalUsers,
    monthlyBudget,
    perUserMonth: totalUsers ? monthlyBudget / totalUsers : 0,
    annualCredits,
    annualBudget: annualCredits * PRICE,
    perUserCredits
  };
}

export function tierNetCost(tier, annualCredits) {
  assertCount(annualCredits);
  const poolCost = tier.credits * PRICE * (1 - tier.disc);
  const overageCredits = Math.max(0, annualCredits - tier.credits);
  const overageCost = overageCredits * PRICE;
  return {
    poolCost,
    overageCredits,
    overageCost,
    idleCredits: Math.max(0, tier.credits - annualCredits),
    net: poolCost + overageCost
  };
}

export function comparePlans(annualCredits) {
  assertCount(annualCredits);
  const listCost = annualCredits * PRICE;
  const tiers = TIERS.map((tier) => {
    const cost = tierNetCost(tier, annualCredits);
    return { tier, cost, savings: annualCredits > 0 ? listCost - cost.net : 0 };
  });
  const options = annualCredits > 0 ? [
    { type: 'list', net: listCost },
    ...tiers.map(({ tier, cost }) => ({ type: 'tier', tier, calc: cost, net: cost.net }))
  ] : [];
  // Stable sorting keeps pay-as-you-go, then the earlier tier, on an exact tie.
  options.sort((left, right) => left.net - right.net);
  return { listCost, tiers, best: options[0] || null };
}
