import test from 'node:test';
import assert from 'node:assert/strict';
import { PRICE, DEFAULT_CREDITS, PERSONAS, TIERS, createDefaultPersonas, computeConsumption, tierNetCost, comparePlans } from '../assets/js/calculator-model.js';

test('preserva os parâmetros da calculadora de origem', () => {
  assert.equal(PRICE, 0.01);
  assert.deepEqual(DEFAULT_CREDITS, { light: 125, medium: 500, heavy: 1200 });
  assert.deepEqual(PERSONAS.map(({ key, l, m, h }) => [key, l, m, h]), [
    ['corp', 22, 11, 5], ['cust', 17, 13, 5], ['tech', 12, 9, 14], ['mgr', 13, 6, 3]
  ]);
  assert.deepEqual(TIERS.map(({ credits, disc }) => [credits, disc]), [
    [300000, .05], [1500000, .06], [3000000, .07], [15000000, .08], [30000000, .1],
    [75000000, .12], [150000000, .14], [225000000, .17], [300000000, .2]
  ]);
});
test('zero usuários não gera recomendação de pré-compra', () => {
  const result = computeConsumption(createDefaultPersonas(), DEFAULT_CREDITS);
  assert.equal(result.monthlyCredits, 0);
  assert.equal(result.annualBudget, 0);
  assert.equal(result.totalUsers, 0);
  assert.deepEqual(result.perUserCredits, [14250, 14625, 22800, 8225]);
  assert.equal(comparePlans(0).best, null);
});
test('cenário pequeno mantém pay-as-you-go', () => {
  const personas = createDefaultPersonas();
  personas[0].users = 1;
  const result = computeConsumption(personas, DEFAULT_CREDITS);
  assert.equal(result.monthlyCredits, 14250);
  assert.equal(result.annualCredits, 171000);
  assert.equal(result.monthlyBudget, 142.5);
  assert.equal(comparePlans(result.annualCredits).best.type, 'list');
});
test('cenário de referência: 1.000 corporativos e 200 técnicos', () => {
  const personas = createDefaultPersonas();
  personas[0].users = 1000;
  personas[2].users = 200;
  const result = computeConsumption(personas, DEFAULT_CREDITS);
  assert.equal(result.monthlyCredits, 18810000);
  assert.equal(result.annualCredits, 225720000);
  assert.equal(result.totalUsers, 1200);
  assert.equal(result.monthlyBudget, 188100);
  assert.equal(result.annualBudget, 2257200);
  const { best } = comparePlans(result.annualCredits);
  assert.equal(best.tier.t, 8);
  assert.equal(best.net, 1874700);
  assert.equal(best.calc.overageCredits, 720000);
  assert.equal(result.annualBudget - best.net, 382500);
});
test('créditos customizados não alteram a soma por perfil', () => {
  const personas = createDefaultPersonas();
  personas.forEach((persona, index) => { persona.users = index + 1; });
  const result = computeConsumption(personas, { light: 1, medium: 2, heavy: 3 });
  assert.deepEqual(result.perUserCredits, [59, 58, 72, 34]);
  assert.equal(result.monthlyCredits, 527);
  assert.equal(result.annualCredits, 6324);
  assert.equal(result.annualBudget, 63.24);
});
test('fronteiras dos nove pools: ociosos, pool exato e excedente', () => {
  for (const tier of TIERS) {
    for (const difference of [-1, 0, 1]) {
      const annual = tier.credits + difference;
      const cost = tierNetCost(tier, annual);
      assert.equal(cost.idleCredits, difference < 0 ? 1 : 0);
      assert.equal(cost.overageCredits, difference > 0 ? 1 : 0);
      assert.equal(cost.net, tier.credits * .01 * (1 - tier.disc) + Math.max(0, difference) * .01);
    }
  }
});
test('preserva desempate da origem: lista antes do nível 1', () => {
  assert.equal(comparePlans(285000).best.type, 'list');
  assert.equal(comparePlans(285001).best.tier.t, 1);
  assert.equal(comparePlans(1425000).best.tier.t, 1);
  assert.equal(comparePlans(1425001).best.tier.t, 2);
});
test('sempre escolhe o menor custo líquido, incluindo os nove níveis', () => {
  const credits = [1, 171000, 285000, 300000, 1425000, 225720000, 999999999, ...TIERS.flatMap((tier) => [tier.credits - 1, tier.credits, tier.credits + 1])];
  for (const annual of credits) {
    const comparison = comparePlans(annual);
    const originalCosts = [.01 * annual, ...TIERS.map((tier) => tier.credits * .01 * (1 - tier.disc) + Math.max(0, annual - tier.credits) * .01)];
    assert.equal(comparison.best.net, Math.min(...originalCosts));
  }
});
test('rejeita valores inválidos, não finitos e sem precisão suficiente', () => {
  for (const value of [-1, NaN, Infinity, .5, Number.MAX_SAFE_INTEGER + 1]) {
    const personas = createDefaultPersonas();
    personas[0].users = value;
    assert.throws(() => computeConsumption(personas, DEFAULT_CREDITS), RangeError);
  }
  const personas = createDefaultPersonas();
  personas[0].users = Number.MAX_SAFE_INTEGER;
  assert.throws(() => computeConsumption(personas, DEFAULT_CREDITS), RangeError);
});
test('restaurar padrões não compartilha estado mutável', () => {
  const one = createDefaultPersonas();
  one[0].users = 100;
  one[0].l = 200;
  const two = createDefaultPersonas();
  assert.equal(two[0].users, 0);
  assert.equal(two[0].l, 22);
});
