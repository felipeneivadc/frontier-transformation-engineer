import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

const window = {};
runInNewContext(
  await readFile(
    new URL("../../docs/assets/js/governance-data.js", import.meta.url),
    "utf8",
  ),
  { window },
);
const data = window.NEIVA_I18N;
test("preserva as dimensões do guia original", () => {
  assert.equal(data.lang, "pt-BR");
  assert.equal(data.pillars.length, 5);
  assert.equal(
    data.pillars.reduce((total, pillar) => total + pillar.questions.length, 0),
    15,
  );
  assert.equal(
    data.checklist.reduce((total, group) => total + group.items.length, 0),
    31,
  );
  assert.equal(data.raci.rows.length, 13);
  assert.equal(data.quiz.length, 10);
  assert.equal(Object.keys(data.zones).length, 3);
});
test("cada processo RACI tem exatamente um aprovador", () => {
  data.raci.rows.forEach((row) => {
    assert.equal(
      row.cells.filter((cell) => cell === "A" || cell === "AR").length,
      1,
      row.name,
    );
    assert.equal(row.cells.length, data.raci.roles.length);
  });
});
test("quiz e classificador apontam para dados válidos", () => {
  const pillars = new Set(data.pillars.map((pillar) => pillar.id));
  data.quiz.forEach((question) => {
    assert.ok(pillars.has(question.p));
    assert.ok(question.a >= 0 && question.a < question.opts.length);
    assert.ok(question.src.startsWith("https://"));
  });
  let zone = 3;
  data.classifier.rules.forEach((rule) => {
    assert.ok(
      rule.zone <= zone,
      "a primeira regra ativa deve prevalecer por risco",
    );
    assert.ok(data.zones[rule.zone]);
    zone = rule.zone;
  });
});
