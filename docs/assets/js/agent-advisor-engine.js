const BUILD = ["agent_builder", "copilot_studio", "foundry"];
const SCORES = {
  // [Agent Builder, Copilot Studio, Foundry]
  q1a: [3, 2, 0],
  q1b: [1, 3, 0],
  q1c: [0, 2, 3],
  q1d: [0, 2, 3],
  q8a: [3, 2, 1],
  q8c: [1, 3, 2],
  q8b: [0, 3, 3],
  q8d: [2, 2, 1],
  q2a: [3, 3, 2],
  q2b: [0, 3, 3],
  q2c: [0, 3, 3],
  q2d: [1, 3, 3],
  q4a: [3, 3, 1],
  q4b: [2, 3, 2],
  q4e: [3, 3, 2],
  q4c: [0, 3, 3],
  q4d: [0, 3, 3],
  q3a: [3, 2, 1],
  q3b: [2, 3, 2],
  q3c: [0, 3, 2],
  q3d: [2, 3, 2],
  q3e: [3, 2, 1],
  q3f: [0, 1, 3],
};
const HARD = {
  q8b: { z: ["agent_builder"], why: "Não publica para usuários externos" },
  q4d: {
    z: ["agent_builder"],
    why: "Não orquestra multiagentes ou processos longos",
  },
  q4c: { z: ["agent_builder"], why: "Não executa ações em sistemas" },
  q2b: { z: ["agent_builder"], why: "Só roda dentro do Microsoft 365 Copilot" },
  q2c: { z: ["agent_builder"], why: "Sem runtime em segundo plano" },
  q3c: { z: ["agent_builder"], why: "Sem acesso direto a Dataverse/APIs" },
  q3f: { z: ["agent_builder"], why: "Sem arquitetura de RAG própria" },
  q9d: {
    z: ["agent_builder", "copilot_studio"],
    why: "Runtime de propriedade da engenharia",
  },
};
const SCORED_Q = ["q1", "q8", "q2", "q4", "q3"];
const VALID_PAIRS = [
  ["copilot_studio", "foundry"],
  ["agent_builder", "copilot_studio"],
];

function fitLabel(s) {
  return s >= 12
    ? "Encaixe forte"
    : s >= 8
      ? "Bom encaixe"
      : s >= 4
        ? "Encaixe parcial"
        : "Não recomendado";
}

function computeScores(ans) {
  const raw = { agent_builder: 0, copilot_studio: 0, foundry: 0 },
    zeroed = {},
    perQ = {};
  SCORED_Q.forEach((q) => {
    const a = ans[q];
    if (a && SCORES[a]) {
      perQ[q] = SCORES[a];
      BUILD.forEach((p, i) => (raw[p] += SCORES[a][i]));
    }
  });
  Object.values(ans).forEach((a) => {
    if (HARD[a])
      HARD[a].z.forEach((p) => {
        if (!zeroed[p]) zeroed[p] = HARD[a].why;
      });
  });
  const score = {};
  BUILD.forEach((p) => (score[p] = zeroed[p] ? 0 : raw[p]));
  return { raw, score, zeroed, perQ };
}

function rank(ans) {
  const { score, zeroed } = computeScores(ans);
  let order = [...BUILD].sort((a, b) => {
    if (score[b] !== score[a]) return score[b] - score[a];
    // desempates por persona
    const pair = [a, b].sort().join("|");
    if (ans.q1 === "q1c" && pair === "agent_builder|copilot_studio")
      return a === "copilot_studio" ? -1 : 1;
    if (ans.q1 === "q1d" && pair === "copilot_studio|foundry")
      return a === "copilot_studio" ? -1 : 1;
    return BUILD.indexOf(a) - BUILD.indexOf(b);
  });
  // preferências de persona (sobrepõem a ordem, preservam pontuação)
  const prefer = (p, over) => {
    if (zeroed[p]) return;
    const ip = order.indexOf(p),
      io = order.indexOf(over);
    if (ip > io) {
      order.splice(ip, 1);
      order.splice(io, 0, p);
    }
  };
  if (ans.q1 === "q1d") prefer("copilot_studio", "agent_builder");
  if (ans.q9 === "q9a") prefer("copilot_studio", "foundry");
  return { order, score, zeroed };
}

function needsQ9(ans) {
  if (!SCORED_Q.every((q) => ans[q])) return false;
  const a = { ...ans };
  delete a.q9;
  const { order, score, zeroed } = rank(a);
  const top = order.slice(0, 2).sort().join("|");
  return (
    top === "copilot_studio|foundry" &&
    !zeroed.copilot_studio &&
    !zeroed.foundry &&
    score.copilot_studio > 0 &&
    score.foundry > 0 &&
    Math.abs(score.copilot_studio - score.foundry) <= 2
  );
}

function buildResult(ans) {
  const { order, score, zeroed } = rank(ans);
  const win = order[0],
    second = order[1];
  const secondViable = !zeroed[second] && score[second] >= 4;
  const isPair =
    secondViable &&
    Math.abs(score[win] - score[second]) <= 2 &&
    VALID_PAIRS.some((p) => p.includes(win) && p.includes(second)) &&
    ans.q9 !== "q9d" &&
    ans.q9 !== "q9a";
  const notes = [];
  if (ans.q2 === "q2c" && ans.q4 === "q4a")
    notes.push(
      "Agente em segundo plano fazendo apenas perguntas e respostas é contraditório: Q&A pede uma conversa. Revise o canal ou a tarefa.",
    );
  if (ans.q8 === "q8b" && ans.q2 === "q2a")
    notes.push(
      "Usuários externos não acessam o chat do Microsoft 365 Copilot do seu tenant. Planeje um site, app ou canal externo.",
    );
  if (ans.q1 === "q1a" && ans.q4 === "q4d")
    notes.push(
      "Orquestração multiagente de negócio pede parceria entre área de negócio e makers/TI.",
    );
  if (ans.q1 === "q1a" && ans.q3 === "q3c")
    notes.push(
      "Integração direta com sistemas de negócio exige apoio técnico (conectores, Dataverse, APIs).",
    );
  if (ans.q1 === "q1a" && ans.q3 === "q3f")
    notes.push(
      "Arquitetura de retrieval personalizada exige time de engenharia.",
    );
  if (win === "foundry" && ans.q1 === "q1a")
    notes.push(
      "Foundry é pro-code: como usuário de negócio, forme parceria com um time de desenvolvimento.",
    );
  const callouts = [];
  if (
    (win === "agent_builder" || win === "copilot_studio") &&
    ans.q8 === "q8a" &&
    ans.q3 === "q3a" &&
    (ans.q4 === "q4a" || ans.q4 === "q4e")
  )
    callouts.push({
      id: "sharepoint_agents",
      t: "Considere primeiro os SharePoint agents",
      d: "Para Q&A sobre um site ou biblioteca específica, um agente do SharePoint resolve sem código e aparece no SharePoint, Teams e M365 Copilot.",
    });
  if (
    (win === "copilot_studio" || win === "foundry") &&
    ans.q1 === "q1c" &&
    ans.q2 === "q2a" &&
    ans.q4 === "q4c"
  )
    callouts.push({
      id: "agents_toolkit",
      t: "Agents Toolkit (declarativo) pode servir melhor",
      d: "Se o agente vive no chat do M365 Copilot e precisa chamar APIs, um agente declarativo com plugin de API no Microsoft 365 Agents Toolkit mantém o orquestrador do Copilot com ciclo de vida pro-dev.",
    });
  if (win === "agent_builder" && ans.q1 === "q1c")
    callouts.push({
      id: "agents_toolkit",
      t: "Desenvolvedor? Prefira o Agents Toolkit",
      d: "Você ganha versionamento, CI/CD, plugins de API e Adaptive Cards mantendo o agente declarativo no M365 Copilot.",
    });
  if (
    (ans.q1 === "q1c" || ans.q1 === "q1d") &&
    (win === "foundry" || win === "copilot_studio")
  )
    callouts.push({
      id: "github_copilot",
      t: "Acelere o desenvolvimento com GitHub Copilot",
      d: "Use o GitHub Copilot no VS Code junto com o Foundry Toolkit, o Agents Toolkit ou a extensão do Copilot Studio para gerar, testar e revisar o código e o YAML do agente.",
    });
  let start = null;
  if (win === "copilot_studio") {
    if (ans.q4 === "q4d" || ans.q4 === "q4e")
      start = {
        n: "Harness do GitHub Copilot",
        d: "Planejamento adaptativo gerenciado, uso de ferramentas, criação de arquivos e recuperação de falhas.",
      };
    else if (ans.q2 === "q2c" || ans.q4 === "q4c")
      start = {
        n: "Workflow do Copilot Studio",
        d: "Gatilhos determinísticos, lógica de controle, ações via conectores e handoffs.",
      };
    else if (ans.q2 === "q2a" && ans.q4 === "q4a")
      start = {
        n: "Harness de chat do Copilot",
        d: "Extensão de conhecimento interno dentro do Microsoft 365 Copilot Chat.",
      };
    else
      start = {
        n: "Harness padrão",
        d: "Conversas previsíveis orientadas por tópicos e regras explícitas.",
      };
  }
  return {
    order,
    score,
    zeroed,
    win,
    second,
    secondViable,
    isPair,
    notes,
    callouts,
    start,
    label: fitLabel(score[win]),
  };
}

function resolveUse(u) {
  if (u.u1 === "interactive")
    return {
      dest: ["m365_copilot"],
      start: u.u2 === "specialized" ? "agents" : "chat",
    };
  if (u.u4 === "cross") return { dest: ["scout"] };
  if (u.u4 === "m365" && ["oneshot", "recurring", "alwayson"].includes(u.u3))
    return { dest: ["cowork"] };
  return { dest: ["cowork", "scout"] };
}
if (typeof module !== "undefined")
  module.exports = {
    computeScores,
    rank,
    needsQ9,
    buildResult,
    resolveUse,
    fitLabel,
  };
