import { DEFAULT_CREDITS, PERSONAS, createDefaultPersonas, computeConsumption, comparePlans } from './calculator-model.js';

const gid = (id) => document.getElementById(id);
const fmtN = new Intl.NumberFormat('pt-BR');
const fmtC = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' });
const fmtC0 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pct = (value) => `${fmtN.format(value * 100)}%`;
const usersBody = gid('usersBody');
const promptsBody = gid('promptsBody');
const errorBanner = gid('calcError');
const resultIds = ['mCredits', 'mBudget', 'perUser', 'aCredits', 'aBudget', 'totalUsers'];

gid('genDate').textContent = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());

PERSONAS.forEach((persona, index) => {
  const userRow = document.createElement('tr');
  userRow.innerHTML = `<th scope="row" class="persona-name">${persona.name}</th>
    <td class="num"><input id="users-${index}" type="number" min="0" step="1" value="0" data-kind="users" data-i="${index}" aria-label="Usuários: ${persona.name}"></td>`;
  usersBody.append(userRow);
  const promptRow = document.createElement('tr');
  promptRow.innerHTML = `<th scope="row" class="persona-name">${persona.name}</th>
    <td class="num"><input id="light-${index}" type="number" min="0" step="1" value="${persona.l}" data-kind="l" data-i="${index}" aria-label="Prompts leves: ${persona.name}"></td>
    <td class="num"><input id="medium-${index}" type="number" min="0" step="1" value="${persona.m}" data-kind="m" data-i="${index}" aria-label="Prompts médios: ${persona.name}"></td>
    <td class="num"><input id="heavy-${index}" type="number" min="0" step="1" value="${persona.h}" data-kind="h" data-i="${index}" aria-label="Prompts pesados: ${persona.name}"></td>
    <td class="num" data-out="peruser-${index}">0</td>`;
  promptsBody.append(promptRow);
});

const inputs = [...document.querySelectorAll('#main-content input[type="number"]')];
inputs.forEach((input) => {
  input.required = true;
  input.inputMode = 'numeric';
  const message = document.createElement('span');
  message.id = `${input.id}-error`;
  message.className = 'input-error';
  message.hidden = true;
  input.setAttribute('aria-describedby', message.id);
  input.after(message);
});

function readScenario() {
  const personas = createDefaultPersonas();
  let valid = true;
  inputs.forEach((input) => {
    const value = input.valueAsNumber;
    const acceptable = input.value.trim() !== '' && Number.isSafeInteger(value) && value >= 0;
    input.setAttribute('aria-invalid', String(!acceptable));
    input.classList.toggle('invalid', !acceptable);
    const message = gid(`${input.id}-error`);
    message.hidden = acceptable;
    message.textContent = acceptable ? '' : 'Informe um número inteiro maior ou igual a zero, dentro da precisão suportada.';
    input.setCustomValidity(acceptable ? '' : message.textContent);
    if (!acceptable) { valid = false; return; }
    if (input.dataset.kind) personas[Number(input.dataset.i)][input.dataset.kind] = value;
  });
  if (!valid) return null;
  return { personas, credits: { light: gid('cpLight').valueAsNumber, medium: gid('cpMedium').valueAsNumber, heavy: gid('cpHeavy').valueAsNumber } };
}

function showInvalid(message) {
  errorBanner.hidden = false;
  errorBanner.textContent = message;
  resultIds.forEach((id) => { gid(id).textContent = '—'; });
  document.querySelectorAll('[data-out]').forEach((cell) => { cell.textContent = '—'; });
  gid('pdfBtn').disabled = true;
  gid('exampleHint').textContent = '';
  gid('recCallout').className = 'callout flat';
  gid('recTitle').textContent = 'Corrija as entradas para calcular';
  gid('recBody').textContent = 'Nenhuma estimativa ou recomendação foi gerada para os valores inválidos.';
  gid('tiersBody').innerHTML = '<tr><td colspan="8" class="mini">A comparação será exibida quando todos os campos forem válidos.</td></tr>';
  gid('bars').innerHTML = '<p class="mini">Corrija os campos destacados para visualizar a economia.</p>';
  gid('assumpLine').textContent = 'Valores inválidos: estimativa indisponível.';
}

function render() {
  const scenario = readScenario();
  if (!scenario) {
    showInvalid('Confira os campos destacados. Use números inteiros não negativos; campos vazios não são tratados como zero.');
    return;
  }
  let result;
  try {
    result = computeConsumption(scenario.personas, scenario.credits);
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    showInvalid(error.message);
    return;
  }
  errorBanner.hidden = true;
  gid('pdfBtn').disabled = false;
  result.perUserCredits.forEach((value, index) => { document.querySelector(`[data-out="peruser-${index}"]`).textContent = fmtN.format(value); });
  gid('mCredits').textContent = fmtN.format(result.monthlyCredits);
  gid('mBudget').textContent = fmtC.format(result.monthlyBudget);
  gid('perUser').textContent = result.totalUsers ? fmtC.format(result.perUserMonth) : '—';
  gid('aCredits').textContent = fmtN.format(result.annualCredits);
  gid('aBudget').textContent = fmtC.format(result.annualBudget);
  gid('totalUsers').textContent = fmtN.format(result.totalUsers);
  gid('exampleHint').textContent = result.totalUsers ? '' : 'Dica: experimente 1.000 usuários corporativos + 200 profissionais técnicos.';

  const comparison = comparePlans(result.annualCredits);
  const bestIsTier = comparison.best?.type === 'tier';
  const bestTier = bestIsTier ? comparison.best.tier.t : null;
  const table = gid('tiersBody');
  table.replaceChildren();
  const listRow = document.createElement('tr');
  listRow.className = result.annualCredits > 0 && !bestIsTier ? 'rec' : 'dim';
  listRow.innerHTML = `<th scope="row">Sem P3</th><td class="num">—</td><td class="num">0%</td><td class="num">—</td>
    <td class="num">${result.annualCredits > 0 ? fmtC.format(comparison.listCost) : '—'}</td>
    <td class="num">${result.annualCredits > 0 ? fmtC.format(comparison.listCost) : '—'}</td><td class="num">—</td>
    <td>${result.annualCredits > 0 && !bestIsTier ? '<span class="tag2 rec">Recomendado</span>' : '<span class="tag2 no">Pague conforme o uso</span>'}</td>`;
  table.append(listRow);
  comparison.tiers.forEach(({ tier, cost, savings }) => {
    const recommended = tier.t === bestTier;
    const row = document.createElement('tr');
    row.dataset.tier = String(tier.t);
    if (recommended) row.className = 'rec';
    let situation = '<span class="tag2 no">—</span>';
    if (result.annualCredits > 0) {
      const description = cost.overageCredits > 0 ? `Excedente: ${fmtN.format(cost.overageCredits)} créditos`
        : cost.idleCredits > 0 ? `Ociosos: ${fmtN.format(cost.idleCredits)} créditos` : 'Pool exato: sem excedente ou créditos ociosos';
      situation = `${recommended ? '<span class="tag2 rec">Recomendado</span>' : ''}
        <span class="tier-usage">${description}</span>`;
    }
    row.innerHTML = `<th scope="row">Nível ${tier.t}</th><td class="num">${fmtN.format(tier.credits)}</td>
      <td class="num">${pct(tier.disc)}</td><td class="num">${fmtC.format(cost.poolCost)}</td>
      <td class="num">${cost.overageCredits > 0 ? fmtC.format(cost.overageCost) : '—'}</td>
      <td class="num" data-net>${fmtC.format(cost.net)}</td>
      <td class="num">${result.annualCredits <= 0 ? '—' : savings > 0 ? `<span class="pos">${fmtC.format(savings)}</span>` : fmtC.format(savings)}</td>
      <td>${situation}</td>`;
    table.append(row);
  });

  const callout = gid('recCallout');
  if (result.annualCredits <= 0) {
    callout.className = 'callout flat';
    gid('recTitle').textContent = 'Informe o número de usuários para ver a recomendação';
    gid('recBody').textContent = 'Preencha o Passo 1 para calcular qual nível de desconto rende o menor custo total.';
  } else if (!bestIsTier) {
    callout.className = 'callout flat';
    gid('recTitle').textContent = 'Pague conforme o uso (sem P3) é o mais econômico agora';
    gid('recBody').innerHTML = `Seu consumo anual estimado é de <strong>${fmtN.format(result.annualCredits)} créditos</strong>
      (${fmtC.format(comparison.listCost)}/ano). Neste cenário, a pré-compra não reduz o custo líquido em relação ao pagamento conforme o uso.`;
  } else {
    callout.className = 'callout';
    const { tier, calc: cost, net } = comparison.best;
    const savings = comparison.listCost - net;
    gid('recTitle').textContent = `Recomendado: Nível ${tier.t} — desconto de ${pct(tier.disc)}`;
    gid('recBody').innerHTML = `Para o consumo anual estimado de <strong>${fmtN.format(result.annualCredits)} créditos</strong>,
      o menor custo líquido é <strong>${fmtC.format(net)}/ano</strong>, contra ${fmtC.format(comparison.listCost)} na lista —
      <span class="big">economia de ${fmtC.format(savings)} (${fmtN.format(savings / comparison.listCost * 100)}% de economia)</span>.`
      + (cost.overageCredits > 0 ? ` Inclui <strong>${fmtN.format(cost.overageCredits)}</strong> créditos de excedente pagos à parte.` : '')
      + (cost.idleCredits > 0 ? ` Sobram ~${fmtN.format(cost.idleCredits)} créditos do pool (expiram ao fim do ano).` : '');
  }

  const bars = gid('bars');
  bars.replaceChildren();
  if (result.annualCredits > 0) {
    const maximum = Math.max(1, ...comparison.tiers.map(({ savings }) => Math.max(0, savings)));
    comparison.tiers.forEach(({ tier, savings }) => {
      const width = Math.max(0, savings) / maximum * 100;
      const row = document.createElement('div');
      row.className = `bar-row${tier.t === bestTier ? ' rec' : ''}`;
      row.innerHTML = `<div>Nível ${tier.t} · ${pct(tier.disc)}</div>
        <div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${width.toFixed(1)}%"></div></div>
        <div class="bar-val">${savings > 0 ? fmtC0.format(savings) : '—'}</div>`;
      bars.append(row);
    });
  } else {
    bars.innerHTML = '<p class="mini">Preencha os usuários para visualizar a economia por nível.</p>';
  }
  gid('assumpLine').innerHTML = `Premissa de preço: 100 créditos = US$ 1,00 (lista).
    Consumo anual estimado: <strong>${fmtN.format(result.annualCredits)}</strong> créditos ·
    Custo anual de lista: <strong>${fmtC.format(comparison.listCost)}</strong>.`;
}

gid('main-content').addEventListener('input', (event) => {
  if (event.target.matches('input[type="number"]')) render();
});
gid('resetBtn').addEventListener('click', () => {
  document.querySelectorAll('input[data-kind]').forEach((input) => {
    input.value = PERSONAS[Number(input.dataset.i)][input.dataset.kind];
  });
  gid('cpLight').value = DEFAULT_CREDITS.light;
  gid('cpMedium').value = DEFAULT_CREDITS.medium;
  gid('cpHeavy').value = DEFAULT_CREDITS.heavy;
  render();
  window.NEIVA_SITE.announce('Padrões restaurados e usuários zerados.');
});
gid('zeroBtn').addEventListener('click', () => {
  document.querySelectorAll('input[data-kind="users"]').forEach((input) => { input.value = 0; });
  render();
  window.NEIVA_SITE.announce('Quantidades de usuários zeradas. Os parâmetros de consumo foram mantidos.');
});
gid('pdfBtn').addEventListener('click', () => { window.print(); });
render();
