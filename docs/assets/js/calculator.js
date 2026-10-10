import {
  PRODUCTS,
  COWORK_PROFILES,
  DEFAULT_SPLIT,
  HARNESS_RANGES,
  WORKING_DAYS,
  PRICE,
  SOURCE_DATE,
} from "./calculator-data.js";
import { computeCowork } from "./calculators/cowork.js";
import { computeHarness } from "./calculators/github-harness.js";
import { computeStandard, defaultAgent } from "./calculators/standard.js";
import { consolidate } from "./calculators/shared.js";
import { comparePricing } from "./calculators/pricing.js";

const $ = (id) => document.getElementById(id);
const root = new URL("../../", import.meta.url);
const esc = (value) =>
  String(value).replace(
    /[&<>"]/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char],
  );
const numbers = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "USD",
});
const formatter = (result, currency = false) => {
  const format = (number) =>
    currency ? money.format(number * PRICE) : numbers.format(number);
  return result.high === null
    ? `${format(result.low)}+`
    : Math.abs(result.high - result.low) < 0.000001
      ? format(result.low)
      : `${format(result.low)} – ${format(result.high)}`;
};
const freshCowork = () =>
  Object.fromEntries(
    COWORK_PROFILES.map((profile) => [
      profile.id,
      { users: 0, ...DEFAULT_SPLIT },
    ]),
  );
let state = {
  standard: [defaultAgent()],
  harness: { people: 0, frequency: 0, ...DEFAULT_SPLIT },
  cowork: freshCowork(),
};
let nextId = 2;
const selected = new Set();
const query = new URLSearchParams(location.search).get("products");
if (query) {
  const requested = query.split(",");
  requested
    .filter((id) => PRODUCTS.some((product) => product.id === id))
    .forEach((id) => selected.add(id));
  if (requested.some((id) => !PRODUCTS.some((product) => product.id === id))) {
    $("queryNotice").textContent =
      "Um produto do endereço não é reconhecido. Selecione as experiências disponíveis abaixo.";
    $("queryNotice").hidden = false;
  }
}
function field(
  product,
  owner,
  key,
  title,
  value,
  help = "",
  integer = false,
  max = "",
) {
  const id = `${product}-${owner}-${key}`;
  return `<label class="field" for="${id}">${esc(title)}<input id="${id}" type="number" min="0" ${max === "" ? "" : `max="${max}"`} step="${integer ? "1" : "any"}" value="${Number.isFinite(value) ? value : ""}" data-product="${product}" data-owner="${owner}" data-field="${key}" required>${help ? `<small>${esc(help)}</small>` : ""}</label>`;
}
function distribution(product, owner, config) {
  return `<div class="split-grid">${[
    ["light", "Leve"],
    ["medium", "Médio"],
    ["heavy", "Pesado"],
  ]
    .map(([key, title]) =>
      field(product, owner, key, `${title} (%)`, config[key], "", false, 100),
    )
    .join(
      "",
    )}</div><p class="profile-ranges">A distribuição deve somar 100%.</p>`;
}
const standardFields = [
  ["users", "Total de usuários", true],
  ["frequency", "Interações por usuário/mês", false],
  ["licensed", "Usuários com licença Microsoft 365 Copilot", true],
  ["autonomous", "Execuções autônomas por mês", true],
  ["knowledge", "Respostas de conhecimento (%)", false, 100],
  ["graph", "Tenant graph dentro do conhecimento (%)", false, 100],
  ["generative", "Respostas generativas por interação de conhecimento", false],
  ["classic", "Respostas clássicas adicionais por interação", false],
];
const advancedFields = [
  [
    "tools",
    "Chamadas médias de ferramentas/ações",
    "Por interação que não é de conhecimento. Medidor de 5 créditos por chamada.",
  ],
  [
    "cua",
    "Chamadas médias de computer use",
    "Por interação que não é de conhecimento. CUA não é incluído na licença Microsoft 365.",
  ],
  [
    "flowActions",
    "Ações mensais executadas em fluxos chamados pelo agente",
    "Total mensal de ações internas, não número de fluxos configurados. Distribuição proporcional ao tráfego elegível/licenciado.",
  ],
  [
    "independentFlowActions",
    "Ações mensais de fluxos com outros gatilhos",
    "Sempre cobradas: 13 créditos por 100 ações.",
  ],
  [
    "basic",
    "Prompts básicos por interação",
    "Adicional de IA em cada interação, de conhecimento ou ferramenta.",
  ],
  [
    "standard",
    "Prompts standard por interação",
    "Adicional de IA em cada interação, de conhecimento ou ferramenta.",
  ],
  [
    "premium",
    "Prompts premium/raciocínio por interação",
    "Inclui interações de conhecimento: 10 créditos por 1.000 tokens, além do recurso utilizado.",
  ],
  [
    "tokens",
    "Tokens médios por prompt",
    "Os medidores de IA usam 0,1 / 1,5 / 10 créditos por 1.000 tokens.",
  ],
];
function renderForms() {
  $("productOptions").innerHTML = PRODUCTS.map(
    (product) =>
      `<label class="product-choice"><input type="checkbox" data-select="${product.id}" aria-controls="form-${product.id}" ${selected.has(product.id) ? "checked" : ""}><img src="${new URL(`assets/images/${product.icon}`, root)}" alt="" width="36" height="36"><span><strong>${product.title}</strong><small>${product.caption}</small></span></label>`,
  ).join("");
  $("productForms").innerHTML = PRODUCTS.map((product) => {
    let body;
    if (product.id === "cowork") {
      body =
        `<p class="section-help">Créditos por usuário/dia · ${WORKING_DAYS} dias úteis/mês. Distribua os usuários de cada perfil, não os prompts.</p>` +
        COWORK_PROFILES.map(
          (profile) =>
            `<section class="profile-card"><h3>${profile.name}</h3><p>${profile.description}</p>${field("cowork", profile.id, "users", "Usuários", state.cowork[profile.id].users, "", true)}${distribution("cowork", profile.id, state.cowork[profile.id])}<p class="profile-ranges">Créditos por dia: Leve ${profile.light.join("–")} · Médio ${profile.medium.join("–")} · Pesado ${profile.heavy.join("–")}.</p></section>`,
        ).join("");
    } else if (product.id === "harness") {
      body = `<p class="section-help">Uso em agentes do Copilot Studio, não na assinatura GitHub Copilot IDE. ${WORKING_DAYS} dias úteis/mês.</p><div class="field-grid">${field("harness", "usage", "people", "Pessoas com acesso", state.harness.people, "", true)}${field("harness", "usage", "frequency", "Interações por pessoa/dia", state.harness.frequency)}</div>${distribution("harness", "usage", state.harness)}<p class="profile-ranges">Créditos por interação: Leve ${HARNESS_RANGES.light.join("–")} · Médio ${HARNESS_RANGES.medium.join("–")} · Pesado 500+, sem teto definido.</p>`;
    } else {
      body =
        '<p class="section-help">Configure agentes customizados B2E/B2C. Conhecimento e ferramentas usam as parcelas de tráfego configuradas; respostas clássicas adicionais são explícitas.</p>' +
        state.standard
          .map(
            (
              agent,
            ) => `<details class="agent-card" data-agent-card open><summary>${esc(agent.name || `Agente ${agent.id}`)} · ${agent.audience.toUpperCase()}</summary><div class="field-grid">
        <label class="field">Nome<input type="text" maxlength="80" value="${esc(agent.name)}" data-product="standard" data-owner="${agent.id}" data-field="name"></label>
        <label class="field">Público<select data-product="standard" data-owner="${agent.id}" data-field="audience"><option value="b2e" ${agent.audience === "b2e" ? "selected" : ""}>Funcionários · B2E</option><option value="b2c" ${agent.audience === "b2c" ? "selected" : ""}>Clientes · B2C</option></select></label>
        ${standardFields.map(([key, title, integer, max]) => field("standard", agent.id, key, title, agent[key], "", integer, max ?? "")).join("")}</div>
        <label class="eligibility"><input type="checkbox" data-product="standard" data-owner="${agent.id}" data-field="eligible" ${agent.eligible ? "checked" : ""}>Uso B2E autenticado e elegível em canal Microsoft 365. A inclusão não cobre CUA ou execuções autônomas.</label>
        <details data-agent-advanced><summary>Ferramentas, fluxos e IA</summary><div class="field-grid">${advancedFields.map(([key, title, help]) => field("standard", agent.id, key, title, agent[key], help)).join("")}</div></details>
        <div class="agent-actions"><button type="button" data-remove-agent="${agent.id}">Remover agente</button></div></details>`,
          )
          .join("") +
        '<div class="agent-actions"><button type="button" id="addAgent">Adicionar agente</button></div>';
    }
    return `<section class="calc-section" id="form-${product.id}" ${selected.has(product.id) ? "" : "hidden"}><header class="product-heading"><img src="${new URL(`assets/images/${product.icon}`, root)}" alt="" width="38" height="38"><h2>${product.title}</h2></header>${body}</section>`;
  }).join("");
}
function pricing(total) {
  if (!total || total.low === 0) {
    $("p3Results").innerHTML =
      '<p class="section-help">Configure volume de uso para comparar os cenários.</p>';
    return;
  }
  const comparison = comparePricing(total);
  const tierName = (tier) => (tier === 0 ? "Pay-as-you-go" : `Nível ${tier}`);
  $("p3Results").innerHTML =
    `<p class="section-help">Projeção anual com 12 meses de uso constante. Menor custo no cenário ${total.high === null ? "mínimo" : "baixo"}: <strong>${tierName(comparison.bestLow)}</strong>. ${comparison.high === null ? "O teto não é definido; não há recomendação definitiva de pré-compra." : `No cenário alto: <strong>${tierName(comparison.bestHigh)}</strong>. As opções podem mudar com o consumo efetivo.`}</p>
    <div class="pricing-table-wrap" tabindex="0" role="region" aria-label="Comparação de planos P3 com rolagem horizontal"><table class="pricing-table"><caption class="sr-only">Custos anuais ilustrativos por cenário</caption><thead><tr><th scope="col">Plano</th><th scope="col">CUs pré-compradas</th><th scope="col">Desconto</th><th scope="col">Pagamento inicial</th><th scope="col">Custo anual baixo/mínimo</th><th scope="col">Custo anual alto</th></tr></thead><tbody>
    <tr><th scope="row">Pay-as-you-go</th><td>—</td><td>0%</td><td>—</td><td>${money.format(comparison.low)}</td><td>${comparison.high === null ? "Não definido" : money.format(comparison.high)}</td></tr>
    ${comparison.rows.map((row) => `<tr class="${row.tier === comparison.bestLow || row.tier === comparison.bestHigh ? "match" : ""}"><th scope="row">Nível ${row.tier}</th><td>${numbers.format(row.units)} CUs</td><td>${numbers.format(row.discount * 100)}%</td><td>${money.format(row.low.purchase)}</td><td>${money.format(row.low.net)}<small>Saldo: ${numbers.format(row.low.unusedUnits)} CUs · Excedente: ${money.format(row.low.overage)}</small></td><td>${row.high === null ? "Não definido" : `${money.format(row.high.net)}<small>Saldo: ${numbers.format(row.high.unusedUnits)} CUs · Excedente: ${money.format(row.high.overage)}</small>`}</td></tr>`).join("")}
    </tbody></table></div><p class="profile-ranges">1 CU paga US$ 1 de custo elegível. Compra antecipada anual; não somar descontos de contratos distintos. Preços e condições devem ser validados comercialmente.</p>`;
}
function update() {
  let invalid = false;
  document
    .querySelectorAll("#productForms input[type=number]")
    .forEach((input) => {
      const active = selected.has(input.dataset.product);
      const valid = !active || input.validity.valid;
      input.setAttribute("aria-invalid", String(!valid));
      if (!valid) invalid = true;
    });
  const results = [];
  const errors = [];
  for (const product of PRODUCTS.filter((item) => selected.has(item.id))) {
    try {
      const result =
        product.id === "cowork"
          ? computeCowork(state.cowork)
          : product.id === "harness"
            ? computeHarness(state.harness)
            : computeStandard(state.standard);
      results.push({ ...result, product });
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      errors.push({ product, message: error.message });
    }
  }
  $("productResults").innerHTML =
    results
      .map(
        (
          result,
        ) => `<section class="subtotal"><h3>${result.product.title}</h3><div class="value">${formatter(result)} créditos/mês</div><p class="range-status">${result.high === null ? "Mínimo estimado; sem limite superior definido." : result.low === result.high ? "Estimativa por recursos configurados." : "Faixa de planejamento, não limite de consumo."}</p>
    ${
      result.details?.length
        ? `<details><summary>Ver composição</summary><ul>${result.details
            .map(
              (detail) =>
                `<li>${esc(detail.name)}: ${formatter(detail)} créditos${
                  detail.components
                    ? `<ul>${detail.components
                        .filter((item) => item.value > 0)
                        .map(
                          (item) =>
                            `<li>${item.name}: ${numbers.format(item.value)}</li>`,
                        )
                        .join("")}</ul>`
                    : ""
                }</li>`,
            )
            .join("")}</ul></details>`
        : `<p class="range-status">${numbers.format(result.interactions)} interações/mês.</p>`
    }</section>`,
      )
      .join("") +
    errors
      .map(
        (error) =>
          `<section class="subtotal"><h3>${error.product.title}</h3><p class="estimate-error">${esc(error.message)}</p></section>`,
      )
      .join("");
  const total = invalid || errors.length ? null : consolidate(results);
  $("totalSummary").innerHTML = !selected.size
    ? '<p class="section-help">Selecione uma experiência para configurar seu cenário.</p>'
    : !total
      ? '<p class="estimate-error">Confira os campos e as distribuições. O total está indisponível até que todas as configurações selecionadas sejam válidas.</p>'
      : `<span class="total-label">Créditos mensais consolidados</span><div class="total-value" id="totalCredits">${formatter(total)}</div><div class="total-cost">${formatter(total, true)} / mês</div><p class="range-status">${total.high === null ? "Mínimo estimado. Heavy impede definir um teto para o total." : "Projeção indicativa das experiências selecionadas."}${total.low === 0 ? " Defina o volume de uso para estimar o consumo." : ""}</p>`;
  $("pdfBtn").disabled = !total;
  pricing(total);
}
$("productOptions").addEventListener("change", (event) => {
  const id = event.target.dataset.select;
  if (!id) return;
  if (event.target.checked) selected.add(id);
  else selected.delete(id);
  $(`form-${id}`).hidden = !selected.has(id);
  update();
});
function readChange(event) {
  const input = event.target;
  if (!input.dataset.field) return;
  const { product, owner, field: key } = input.dataset;
  const value =
    input.type === "checkbox"
      ? input.checked
      : input.type === "number"
        ? input.valueAsNumber
        : input.value;
  const config =
    product === "cowork"
      ? state.cowork[owner]
      : product === "harness"
        ? state.harness
        : state.standard.find((agent) => agent.id === Number(owner));
  config[key] = value;
  if (key === "name" || key === "audience")
    input.closest("[data-agent-card]").querySelector("summary").textContent =
      `${config.name || `Agente ${config.id}`} · ${config.audience.toUpperCase()}`;
  update();
}
$("productForms").addEventListener("input", readChange);
$("productForms").addEventListener("change", (event) => {
  if (event.target.type === "checkbox" || event.target.tagName === "SELECT")
    readChange(event);
});
$("productForms").addEventListener("click", (event) => {
  if (event.target.closest("#addAgent")) {
    const addedId = nextId++;
    state.standard.push(defaultAgent(addedId));
    renderForms();
    update();
    document
      .querySelector(
        `[data-product="standard"][data-owner="${addedId}"][data-field="name"]`,
      )
      .focus();
  }
  const remove = event.target.closest("[data-remove-agent]");
  if (remove) {
    state.standard = state.standard.filter(
      (agent) => agent.id !== Number(remove.dataset.removeAgent),
    );
    renderForms();
    update();
    $("addAgent").focus();
  }
});
$("resetBtn").addEventListener("click", () => {
  state = {
    standard: [defaultAgent()],
    harness: { people: 0, frequency: 0, ...DEFAULT_SPLIT },
    cowork: freshCowork(),
  };
  nextId = 2;
  renderForms();
  update();
  window.NEIVA_SITE.announce(
    "Parâmetros restaurados. Os produtos selecionados foram mantidos.",
  );
  $("resetBtn").focus({ preventScroll: true });
});
let printState = [];
window.addEventListener("beforeprint", () => {
  printState = [...document.querySelectorAll("#productForms details")].map(
    (element) => ({ element, open: element.open }),
  );
  printState.forEach(({ element }) => {
    element.open = true;
  });
});
window.addEventListener("afterprint", () => {
  printState.forEach(({ element, open }) => {
    element.open = open;
  });
});
$("pdfBtn").addEventListener("click", () => window.print());
$("referenceStamp").textContent =
  `Fontes e faixas consultadas em ${SOURCE_DATE.split("-").reverse().join("/")}. Relatório gerado em ${new Intl.DateTimeFormat("pt-BR").format(new Date())}.`;
renderForms();
update();
