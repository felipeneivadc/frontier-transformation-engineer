export const PRICE = 0.01;
export const WORKING_DAYS = 22;
export const DEFAULT_SPLIT = Object.freeze({
  light: 40,
  medium: 40,
  heavy: 20,
});
export const SOURCE_DATE = "2026-10-10";
export const SOURCES = Object.freeze({
  standard: "https://microsoft.github.io/copilot-studio-estimator/",
  consumption: "https://nptnlopppecostweb.azurewebsites.net/#/estimator",
  rates:
    "https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management",
  harness:
    "https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/billing-credit-overview",
  p3: "https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/copilot-credit-p3",
});
export const PRODUCTS = Object.freeze([
  {
    id: "standard",
    title: "Copilot Studio Standard",
    caption: "Recursos e volume de execução",
    icon: "copilot-studio.png",
    source: SOURCES.standard,
  },
  {
    id: "harness",
    title: "Copilot Studio GitHub Copilot Harness",
    caption: "Interações e complexidade das tarefas",
    icon: "copilot-studio.png",
    source: SOURCES.consumption,
  },
  {
    id: "cowork",
    title: "Copilot Cowork",
    caption: "Perfis de usuários e intensidade diária",
    icon: "Coworking.png",
    source: SOURCES.consumption,
  },
]);
export const COWORK_PROFILES = Object.freeze([
  {
    id: "corp",
    name: "Conhecimento corporativo",
    description: "E-mail, reuniões, documentos e prioridades variadas.",
    light: [100, 280],
    medium: [280, 400],
    heavy: [400, 700],
  },
  {
    id: "mgr",
    name: "Gestão e liderança",
    description: "Sínteses, riscos, recomendações e decisões.",
    light: [140, 390],
    medium: [390, 560],
    heavy: [560, 980],
  },
  {
    id: "cust",
    name: "Conhecimento voltado a clientes",
    description: "Contas, relacionamento e colaboração com equipes internas.",
    light: [260, 720],
    medium: [720, 1030],
    heavy: [1030, 1800],
  },
  {
    id: "tech",
    name: "Profissionais técnicos",
    description: "Código, projetos, sistemas e trabalho especializado.",
    light: [70, 190],
    medium: [190, 270],
    heavy: [270, 480],
  },
]);
export const HARNESS_RANGES = Object.freeze({
  light: [100, 300],
  medium: [300, 500],
  heavy: [500, null],
});
export const STANDARD_RATES = Object.freeze({
  classic: 1,
  generative: 2,
  graph: 10,
  action: 5,
  flowAction: 0.13,
  basicTokens: 0.1,
  standardTokens: 1.5,
  premiumTokens: 10,
});
export const P3_TIERS = Object.freeze([
  { tier: 1, units: 3000, discount: 0.05 },
  { tier: 2, units: 15000, discount: 0.06 },
  { tier: 3, units: 30000, discount: 0.07 },
  { tier: 4, units: 150000, discount: 0.08 },
  { tier: 5, units: 300000, discount: 0.1 },
  { tier: 6, units: 750000, discount: 0.12 },
  { tier: 7, units: 1500000, discount: 0.14 },
  { tier: 8, units: 2250000, discount: 0.17 },
  { tier: 9, units: 3000000, discount: 0.2 },
]);
