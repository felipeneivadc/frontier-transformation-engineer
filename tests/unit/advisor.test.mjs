import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

async function loadEngine(path) {
  const module = { exports: {} };
  runInNewContext(await readFile(new URL(path, import.meta.url), "utf8"), {
    module,
  });
  return module.exports;
}

const advisor = await loadEngine(
  "../../docs/assets/js/agent-advisor-engine.js",
);
const plain = (value) => JSON.parse(JSON.stringify(value));

test("Agent Advisor aplica bloqueios de plataforma antes do ranking", () => {
  const result = advisor.computeScores({
    q1: "q1a",
    q8: "q8b",
    q2: "q2a",
    q4: "q4a",
    q3: "q3a",
  });

  assert.equal(result.score.agent_builder, 0);
  assert.match(result.zeroed.agent_builder, /externos/);
  assert.ok(result.score.copilot_studio > 0);
  assert.ok(result.score.foundry > 0);
});

test("Agent Advisor solicita a decisão de runtime quando Studio e Foundry empatam", () => {
  const answers = {
    q1: "q1d",
    q8: "q8c",
    q2: "q2c",
    q4: "q4c",
    q3: "q3f",
  };

  assert.equal(advisor.needsQ9(answers), true);
  const result = advisor.buildResult({ ...answers, q9: "q9d" });
  assert.equal(result.win, "foundry");
  assert.ok(result.zeroed.copilot_studio);
});

test("Agent Advisor separa recomendações de uso interativo e execução contínua", () => {
  assert.deepEqual(
    plain(advisor.resolveUse({ u1: "interactive", u2: "specialized" })),
    { dest: ["m365_copilot"], start: "agents" },
  );
  assert.deepEqual(
    plain(advisor.resolveUse({ u1: "delegated", u3: "alwayson", u4: "cross" })),
    { dest: ["scout"] },
  );
});
