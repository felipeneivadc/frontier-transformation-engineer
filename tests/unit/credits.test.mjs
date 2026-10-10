import test from "node:test";
import assert from "node:assert/strict";
import { computeCowork } from "../../docs/assets/js/calculators/cowork.js";
import { computeHarness } from "../../docs/assets/js/calculators/github-harness.js";
import {
  computeAgent,
  computeStandard,
  defaultAgent,
} from "../../docs/assets/js/calculators/standard.js";
import { consolidate, split } from "../../docs/assets/js/calculators/shared.js";
import {
  comparePricing,
  planCost,
} from "../../docs/assets/js/calculators/pricing.js";
import {
  COWORK_PROFILES,
  DEFAULT_SPLIT,
  P3_TIERS,
  WORKING_DAYS,
} from "../../docs/assets/js/calculator-data.js";

const config = () =>
  Object.fromEntries(
    COWORK_PROFILES.map((profile) => [
      profile.id,
      { users: 0, ...DEFAULT_SPLIT },
    ]),
  );
test("Cowork reproduz as faixas públicas de quatro perfis", () => {
  assert.equal(WORKING_DAYS, 22);
  for (const [id, low, high] of [
    ["corp", 510400, 906400],
    ["mgr", 712800, 1267200],
    ["cust", 1315600, 2332000],
    ["tech", 347600, 616000],
  ]) {
    const input = config();
    input[id].users = 100;
    const result = computeCowork(input);
    assert.ok(Math.abs(result.low - low) < 0.000001);
    assert.ok(Math.abs(result.high - high) < 0.000001);
  }
});
test("Cowork calcula distribuições extremas e não arredonda usuários estimados antes do cálculo", () => {
  const input = config();
  input.corp = { users: 1, light: 100, medium: 0, heavy: 0 };
  assert.equal(computeCowork(input).low, 2200);
  input.corp = { users: 1, ...DEFAULT_SPLIT };
  assert.equal(computeCowork(input).low, 5104);
  assert.equal(computeCowork(input).high, 9064);
});
test("Harness: exemplo oficial e Heavy sem teto", () => {
  const result = computeHarness({
    people: 100,
    frequency: 1,
    ...DEFAULT_SPLIT,
  });
  assert.equal(result.interactions, 2200);
  assert.equal(result.low, 572000);
  assert.equal(result.high, null);
});
test("Harness com Heavy zerado mantém faixa finita", () => {
  const result = computeHarness({
    people: 100,
    frequency: 1,
    light: 40,
    medium: 60,
    heavy: 0,
  });
  assert.equal(result.low, 484000);
  assert.equal(result.high, 924000);
  assert.equal(
    computeHarness({ people: 0, frequency: 1, ...DEFAULT_SPLIT }).high,
    0,
  );
});
test("consolidação mantém mínimo desconhecido e reproduz a referência combinada", () => {
  const input = config();
  input.corp.users = 100;
  const sum = consolidate([
    computeCowork(input),
    computeHarness({ people: 100, frequency: 1, ...DEFAULT_SPLIT }),
  ]);
  assert.equal(sum.low, 1082400);
  assert.equal(sum.high, null);
  assert.equal(consolidate([]), null);
});
test("Standard: conhecimento e ferramentas reproduzem o cenário observado", () => {
  const input = {
    ...defaultAgent(),
    users: 100,
    frequency: 10,
    knowledge: 50,
    graph: 20,
  };
  assert.equal(computeAgent(input).low, 2000);
  assert.equal(computeAgent({ ...input, tools: 1 }).low, 4500);
});
test("Standard: medidor de fluxo usa ações executadas, não apenas configuração", () => {
  const input = {
    ...defaultAgent(),
    users: 100,
    frequency: 10,
    knowledge: 50,
    graph: 20,
    tools: 1,
    flowActions: 10000,
  };
  assert.equal(computeAgent(input).low, 5800);
});
test("Standard: inclusão elegível, CUA e fluxos independentes", () => {
  const input = {
    ...defaultAgent(),
    users: 100,
    frequency: 10,
    licensed: 100,
    eligible: true,
    knowledge: 50,
    graph: 20,
    tools: 1,
    cua: 1,
    flowActions: 10000,
    independentFlowActions: 100,
  };
  assert.equal(computeAgent(input).low, 2513);
  assert.equal(
    computeAgent({
      ...input,
      audience: "b2c",
      cua: 0,
      independentFlowActions: 0,
    }).low,
    5800,
  );
});
test("Standard: exemplos documentados e autoria autônoma sem cobertura de usuário", () => {
  assert.equal(
    computeAgent({
      ...defaultAgent(),
      users: 900,
      frequency: 1,
      knowledge: 100,
      generative: 2,
      classic: 4,
    }).low,
    7200,
  );
  assert.equal(
    computeAgent({
      ...defaultAgent(),
      users: 150,
      licensed: 50,
      eligible: true,
      frequency: 1,
      knowledge: 100,
      generative: 4,
      graph: 100,
    }).low,
    4800,
  );
  assert.equal(
    computeAgent({ ...defaultAgent(), autonomous: 1, knowledge: 0, tools: 4 })
      .low,
    20,
  );
});
test("Standard: IA é adicional ao recurso e múltiplos agentes somam", () => {
  const agent = {
    ...defaultAgent(),
    users: 1,
    frequency: 1,
    knowledge: 0,
    tools: 1,
    premium: 1,
    tokens: 2000,
  };
  assert.equal(computeAgent(agent).low, 25);
  assert.equal(computeStandard([agent, agent]).low, 50);
  assert.throws(() => computeStandard([]), RangeError);
  assert.equal(
    computeAgent({
      ...defaultAgent(),
      users: 1,
      frequency: 1,
      knowledge: 100,
      premium: 1,
      tokens: 2000,
    }).low,
    22,
  );
});
test("distribuições e entradas inválidas falham explicitamente", () => {
  for (const value of [-1, NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(
      () => computeHarness({ people: value, frequency: 1, ...DEFAULT_SPLIT }),
      RangeError,
    );
  }
  assert.throws(() => split({ light: 40, medium: 40, heavy: 30 }), RangeError);
  assert.throws(
    () => computeAgent({ ...defaultAgent(), users: 1, licensed: 2 }),
    RangeError,
  );
  assert.throws(
    () => computeAgent({ ...defaultAgent(), knowledge: 101 }),
    RangeError,
  );
});
test("P3 usa CUs em USD e reproduz o exemplo oficial de 15.000 CUs", () => {
  const second = P3_TIERS[1];
  assert.equal(planCost(second, 15000).net, 14100);
  assert.equal(planCost(second, 10000).unusedUnits, 5000);
  assert.equal(planCost(second, 20000).overage, 5000);
  const report = comparePricing({ low: 510400, high: 906400 });
  assert.equal(report.low, 61248);
  assert.equal(report.high, 108768);
});
test("P3 não cria máximo nem recomendação alta para Heavy", () => {
  const report = comparePricing({ low: 572000, high: null });
  assert.equal(report.high, null);
  assert.equal(report.bestHigh, null);
  assert.ok(report.rows.every((row) => row.high === null));
});
test("P3 escolhe mínimo real por cenário e preserva empate a favor de pay-as-you-go", () => {
  assert.equal(comparePricing({ low: 23750, high: 23750 }).bestLow, 0);
  for (const credits of [0, 1000, 510400, 572000, 10000000]) {
    const report = comparePricing({ low: credits, high: credits * 2 });
    for (const key of ["low", "high"]) {
      const costs = [report[key], ...report.rows.map((row) => row[key].net)];
      if (report[key] > 0)
        assert.equal(
          costs[key === "low" ? report.bestLow : report.bestHigh],
          Math.min(...costs),
        );
    }
  }
});
