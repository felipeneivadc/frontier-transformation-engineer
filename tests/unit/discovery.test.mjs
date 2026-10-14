import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

async function loadEngine() {
  const module = { exports: {} };
  runInNewContext(
    await readFile(
      new URL("../../docs/assets/js/ai-discovery-engine.js", import.meta.url),
      "utf8",
    ),
    {
      Array,
      Boolean,
      Date,
      JSON,
      Math,
      Number,
      Object,
      Set,
      String,
      crypto: webcrypto,
      module,
    },
  );
  return module.exports;
}

const discovery = await loadEngine();

test("AI Discovery Studio calcula prioridade e eixos com pesos padrão", () => {
  const opportunity = discovery.newOpportunity();
  opportunity.evidence = "Entrevistas e dados operacionais.";
  opportunity.confidence = "high";
  opportunity.scores = {
    impact: 5,
    human: 4,
    alignment: 4,
    feasibility: 4,
    data: 3,
  };

  assert.equal(discovery.score(opportunity), 83);
  assert.deepEqual(
    { ...discovery.bxt(opportunity) },
    { value: 13 / 3, feasible: 3.5 },
  );
  assert.equal(
    discovery
      .missing(opportunity)
      .includes("Pontuação e confiança documentadas"),
    false,
  );
});

test("AI Discovery Studio restaura pesos válidos e rejeita versões incompatíveis", () => {
  const raw = discovery.defaultState();
  raw.session.client = "  Organização de teste  ";
  raw.weights = {
    impact: 0,
    human: 0,
    alignment: 0,
    feasibility: 0,
    data: 0,
  };

  const sanitized = discovery.sanitize(raw);
  assert.equal(sanitized.session.client, "  Organização de teste  ");
  assert.deepEqual(
    { ...sanitized.weights },
    { impact: 30, human: 20, alignment: 15, feasibility: 20, data: 15 },
  );
  assert.throws(
    () => discovery.sanitize({ ...raw, version: "incompatível" }),
    /incompatível/,
  );
});
