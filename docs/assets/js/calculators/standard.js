import { STANDARD_RATES as R } from "../calculator-data.js";
import { amount, percentage, range } from "./shared.js";

export function defaultAgent(id = 1) {
  return {
    id,
    name: `Agente ${id}`,
    audience: "b2e",
    users: 0,
    frequency: 0,
    licensed: 0,
    eligible: false,
    autonomous: 0,
    knowledge: 50,
    graph: 0,
    generative: 1,
    classic: 0,
    tools: 0,
    cua: 0,
    flowActions: 0,
    independentFlowActions: 0,
    basic: 0,
    standard: 0,
    premium: 0,
    tokens: 1000,
  };
}
export function computeAgent(config) {
  const users = amount(config.users, "Usuários", true);
  const licensed = amount(config.licensed, "Usuários licenciados", true);
  if (licensed > users)
    throw new RangeError(
      "Usuários licenciados não podem superar o total de usuários.",
    );
  const frequency = amount(config.frequency, "Interações mensais");
  const autonomous = amount(config.autonomous, "Execuções autônomas", true);
  const eligible = config.audience === "b2e" && config.eligible;
  const total = users * frequency + autonomous;
  const billed = (users - (eligible ? licensed : 0)) * frequency + autonomous;
  const knowledge = percentage(config.knowledge, "Respostas de conhecimento");
  const graph = percentage(config.graph, "Tenant graph grounding");
  const calls = billed * (1 - knowledge);
  const allCalls = total * (1 - knowledge);
  const components = [
    {
      name: "Conhecimento generativo",
      value: billed * knowledge * amount(config.generative) * R.generative,
    },
    {
      name: "Tenant graph grounding",
      value: billed * knowledge * amount(config.generative) * graph * R.graph,
    },
    {
      name: "Respostas clássicas adicionais",
      value: billed * amount(config.classic) * R.classic,
    },
    {
      name: "Ferramentas e ações",
      value: calls * amount(config.tools) * R.action,
    },
    {
      name: "Computer use (CUA)",
      value: allCalls * amount(config.cua) * R.action,
    },
    {
      name: "Ações de fluxos invocados pelo agente",
      value:
        amount(config.flowActions, "Ações mensais de fluxos") *
        R.flowAction *
        (total ? billed / total : 1),
    },
    {
      name: "Ações de fluxos com outros gatilhos",
      value:
        amount(config.independentFlowActions, "Ações mensais independentes") *
        R.flowAction,
    },
    {
      name: "IA básica",
      value:
        ((billed * amount(config.basic) * amount(config.tokens)) / 1000) *
        R.basicTokens,
    },
    {
      name: "IA standard",
      value:
        ((billed * amount(config.standard) * amount(config.tokens)) / 1000) *
        R.standardTokens,
    },
    {
      name: "IA premium / raciocínio",
      value:
        ((billed * amount(config.premium) * amount(config.tokens)) / 1000) *
        R.premiumTokens,
    },
  ];
  const credits = components.reduce((sum, item) => sum + item.value, 0);
  return {
    ...range(credits, credits),
    name: config.name,
    total,
    billed,
    components,
  };
}
export function computeStandard(configs) {
  if (!configs.length)
    throw new RangeError("Adicione pelo menos um agente Standard.");
  const details = configs.map(computeAgent);
  const total = details.reduce((sum, item) => sum + item.low, 0);
  return range(total, total, details);
}
