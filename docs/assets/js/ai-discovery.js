"use strict";
const LOGO = document.querySelector(".brand img").src;
function sourceLink(id, short = false) {
  const s = SOURCES.find((x) => x.id === id);
  return s
    ? `<a href="${e(s.url)}" target="_blank" rel="noopener noreferrer">${e(short ? "Consultar referência ↗" : s.title)}</a>`
    : "";
}
function capName(id) {
  return CAPABILITIES.find((c) => c.id === id)?.title || "Capacidade a definir";
}
function valueOr(v) {
  return v ? e(v) : '<span class="unfilled">A definir</span>';
}
function options(map, value) {
  return Object.entries(map)
    .map(
      ([k, v]) =>
        `<option value="${e(k)}" ${value === k ? "selected" : ""}>${e(typeof v === "object" ? v.label : v)}</option>`,
    )
    .join("");
}
function input(label, bind, placeholder = "", opts = {}) {
  const [area, key] = bind.split(".");
  const value = state[area]?.[key] ?? "";
  const n = "field-" + bind.replace(".", "-");
  return `<div class="field ${opts.full ? "full" : ""}"><label for="${n}">${e(label)}</label>${opts.textarea ? `<textarea id="${n}" data-bind="${bind}" maxlength="5000" rows="${opts.rows || 3}" placeholder="${e(placeholder)}">${e(value)}</textarea>` : `<input id="${n}" data-bind="${bind}" type="${opts.type || "text"}" maxlength="${opts.max || 500}" value="${e(value)}" placeholder="${e(placeholder)}">`}${opts.help ? `<small>${e(opts.help)}</small>` : ""}</div>`;
}
function dialogField(name, label, value = "", opts = {}) {
  return `<div class="field ${opts.full ? "full" : ""}"><label for="form-${name}">${e(label)}${opts.required ? ' <span class="required">*</span>' : ""}</label>${opts.textarea ? `<textarea id="form-${name}" name="${name}" maxlength="5000" rows="${opts.rows || 3}" ${opts.required ? "required" : ""} placeholder="${e(opts.placeholder || "")}">${e(value)}</textarea>` : `<input id="form-${name}" name="${name}" type="${opts.type || "text"}" maxlength="${opts.max || 500}" value="${e(value)}" ${opts.required ? "required" : ""} placeholder="${e(opts.placeholder || "")}">`}${opts.help ? `<small>${e(opts.help)}</small>` : ""}</div>`;
}
function pilotInput(o, key, label, placeholder = "", opts = {}) {
  return `<div class="field ${opts.full ? "full" : ""}"><label for="pilot-${key}">${e(label)}</label>${opts.textarea ? `<textarea id="pilot-${key}" data-pilot="${key}" data-id="${o.id}" maxlength="5000" rows="3" placeholder="${e(placeholder)}">${e(o.pilot[key])}</textarea>` : `<input id="pilot-${key}" data-pilot="${key}" data-id="${o.id}" type="${opts.type || "text"}" maxlength="500" value="${e(o.pilot[key])}" placeholder="${e(placeholder)}">`}</div>`;
}
function intro(kicker, title, text, button = "") {
  return `<div class="page-intro"><div><span class="eyebrow">${e(kicker)}</span><h1>${title}</h1><p>${text}</p></div>${button}</div>`;
}
function empty(title, desc, button, ic = "spark") {
  return `<div class="empty"><span class="empty-icon">${icon(ic)}</span><h2>${e(title)}</h2><p>${e(desc)}</p><div class="button-row">${button || ""}</div></div>`;
}
function guideCard(title, questions, output) {
  return `<aside class="card violet facilitator-only"><span class="eyebrow">ROTEIRO DO FACILITADOR</span><h2>${e(title)}</h2><ul class="prompt-list">${questions.map((q) => `<li>${e(q)}</li>`).join("")}</ul><hr><span class="eyebrow">SAÍDA ESPERADA</span><p class="helper">${e(output)}</p><button class="btn small mt" data-action="guide">Abrir guia desta etapa ${icon("arrow")}</button></aside>`;
}
let state = defaultState();
let route = "align";
let exploreTab = "opportunities";
let capFilter = "";
let ecoFilter = "Todas";
let ecoSearch = "";
let oppSearch = "";
let pilotId = "";
let dirty = false;
let storageEnabled = false;
let storageHealthy = true;
let localDraft = null;
let toastTimer;
let saveTimer;
let dialogReturn = null;
let confirmResolver = null;
let timerRemaining = 15 * 60;
let timerDeadline = null;
let timerHandle = null;

function renderAlign() {
  return `<section class="page">
<div class="hero"><div><span class="eyebrow">AI DISCOVERY · WORKSPACE DE FACILITAÇÃO</span><h1>Antes da solução,<br>uma <em>boa pergunta.</em></h1><p>Conduza uma conversa que começa no negócio, amplia possibilidades e termina em uma decisão clara sobre o próximo experimento.</p><div class="button-row"><button class="btn primary" data-action="begin">Configurar a sessão ${icon("arrow")}</button><button class="btn" data-action="demo">Explorar exemplo fictício</button></div><div class="chips"><span class="tag outline">Negócio primeiro</span><span class="tag outline">Pessoas no centro</span><span class="tag outline">IA responsável</span></div></div><div class="hero-art"><div class="discovery-orbit" aria-hidden="true"><div class="orbit-ring"></div><div class="orbit-ring second"></div><div class="orbit-center">${icon("spark")}<strong>Discovery</strong><span>DECIDIR COM CLAREZA</span></div><div class="orbit-chip one">${icon("chart")} Valor de negócio</div><div class="orbit-chip two">${icon("people")} Experiência</div><div class="orbit-chip three">${icon("database")} Viabilidade</div></div><div class="hero-footnote">Três lentes. Uma oportunidade bem definida.</div></div></div>
<div class="stage-ribbon"><button class="stage-tile" data-route="understand"><small>01 / DESCOBRIR</small><strong>Entender o contexto</strong><span>Escutar antes de propor</span></button><button class="stage-tile" style="--discovery-accent:var(--discovery-cyan)" data-route="understand"><small>02 / DEFINIR</small><strong>Nomear a oportunidade</strong><span>Problema, pessoa e evidência</span></button><button class="stage-tile" style="--discovery-accent:var(--discovery-violet)" data-route="explore"><small>03 / DESENVOLVER</small><strong>Explorar alternativas</strong><span>Capacidades, não modismos</span></button><button class="stage-tile" style="--discovery-accent:var(--discovery-magenta)" data-route="pilot"><small>04 / VALIDAR</small><strong>Desenhar o experimento</strong><span>Aprender antes de escalar</span></button></div>
<div class="split"><div class="stack"><section class="card" id="session-config"><span class="eyebrow">CONTEXTO DA SESSÃO</span><h2>Quem está na conversa?</h2><p class="helper mb">Convide negócio, pessoas usuárias, dados/TI e segurança. Use funções em vez de dados pessoais desnecessários.</p><div class="fields">${input("Cliente / organização", "session.client", "Nome da organização")}${input("Área ou processo", "session.area", "Ex.: atendimento, operações, vendas")}${input("Facilitador", "session.facilitator", "Nome do facilitador")}${input("Data da sessão", "session.date", "", { type: "date" })}${input("Patrocinador / decisor", "session.sponsor", "Papel responsável por decidir")}${input("Participantes e papéis", "session.participants", "Ex.: negócio, operação, TI e segurança")}</div></section>
<section class="card violet"><span class="eyebrow">CONTRATO DE DESCOBERTA</span><h2>Qual resultado justifica essa conversa?</h2><p class="helper mb">Formule uma mudança desejada, não o nome de uma tecnologia.</p><div class="fields">${input("Resultado de negócio desejado", "session.objective", "Ex.: diminuir o tempo de resposta sem reduzir a qualidade", { textarea: true, full: true })}${input("Indicador principal", "session.metric", "Ex.: tempo médio de resolução")}${input("Linha de base e fonte", "session.baseline", "Valor atual, período e origem da medida")}${input("Meta e horizonte", "session.target", "Valor desejado e quando medir")}${input("Restrições e limites", "session.constraints", "Ex.: orçamento, dados sensíveis, prazo, integrações", { textarea: true, full: true })}</div></section>
<section class="card cyan"><span class="eyebrow">CONTINUIDADE E PRIVACIDADE</span><h2>Sua sessão, sob seu controle</h2><p class="helper">Por padrão, os registros ficam só nesta aba. O arquivo original não é alterado automaticamente. Use <strong>Salvar / Exportar</strong> antes de fechar.</p><label class="safe-check mt"><input type="checkbox" id="local-save" ${storageEnabled ? "checked" : ""}><span><strong>Guardar rascunho neste navegador</strong><br>Opcional. Mantém um rascunho local, sem criptografia. Não use em computador compartilhado. A persistência depende do navegador; exporte uma cópia.</span></label><div class="button-row mt"><button class="btn" data-action="import">${icon("upload")} Importar sessão</button><button class="btn warn" data-action="new">Nova sessão em branco</button></div><p class="caption">Importações substituem os registros atuais após sua confirmação. Notas também entram nas exportações.</p></section></div>
<div class="stack"><section class="card cyan"><span class="eyebrow">COMO FACILITAR</span><h2>Uma conversa, não um formulário em série.</h2><ol class="how-list"><li><span class="count">1</span><div><strong>Escute situações reais</strong><p>Peça o último exemplo, o impacto e a evidência. Separe fato de hipótese.</p></div></li><li><span class="count">2</span><div><strong>Explore mais de um caminho</strong><p>Compare adotar, estender, construir e resolver sem IA.</p></div></li><li><span class="count">3</span><div><strong>Saia com uma decisão</strong><p>Registre quem valida, o que será testado e qual condição permite avançar.</p></div></li></ol><button class="btn small" data-route="method">Entender a abordagem ${icon("arrow")}</button></section><section class="card violet"><span class="eyebrow">ALINHAMENTO MICROSOFT</span><h2>Valor + viabilidade + responsabilidade</h2><p class="helper">As orientações de estratégia e planejamento do Cloud Adoption Framework fundamentam os critérios. A combinação de métodos e as pontuações são uma adaptação NEIVA.</p><p class="caption">${sourceLink("strategy", true)} · ${sourceLink("plan", true)}</p></section><section class="card"><span class="eyebrow">LIMITES DESTA EXPERIÊNCIA</span><p class="helper">Ferramenta local para um facilitador. Não há IA gerando respostas, conexão ao tenant ou colaboração simultânea. Os cálculos usam apenas as notas que você registra.</p><p class="helper">Não insira senhas, chaves, documentos confidenciais ou dados pessoais sensíveis. Exporte e compartilhe conforme as regras do cliente.</p></section></div></div></section>`;
}
function jtbdText() {
  const j = state.jobs;
  return `<b>${e(j.persona || "[pessoa / papel]")}</b> · Quando <b>${e(j.context || "[circunstância]")}</b>, preciso <b>${e(j.task || "[progresso desejado]")}</b> para <b>${e(j.outcome || "[resultado]")}</b>. Barreira atual: <b>${e(j.barrier || "[barreira observada]")}</b>.`;
}
function renderUnderstand() {
  return `<section class="page">${intro("DESCOBRIR → DEFINIR · JOBS TO BE DONE", "Entenda o trabalho.<br>Depois, a tecnologia.", "Use situações reais para conectar pessoas, etapas de trabalho e oportunidades. Uma dor sem evidência ainda é uma hipótese.", `<button class="btn" data-action="guide">${icon("info")} Perguntas de apoio</button>`)}<div class="split mb"><section class="card"><span class="eyebrow">PESSOA + CIRCUNSTÂNCIA + PROGRESSO</span><h2>O trabalho que precisa acontecer</h2><div class="fields mt">${input("Pessoa / papel afetado", "jobs.persona", "Ex.: equipe de atendimento")}${input("Quando isso acontece?", "jobs.context", "Ex.: ao receber uma solicitação complexa")}${input("O que a pessoa precisa fazer?", "jobs.task", "Verbo + objeto, sem mencionar uma solução", { full: true })}${input("Para alcançar qual resultado?", "jobs.outcome", "O que melhora para a pessoa e para o negócio", { full: true })}${input("O que dificulta hoje?", "jobs.barrier", "Barreira concreta observada", { textarea: true })}${input("Como resolve atualmente?", "jobs.alternative", "Alternativa, improviso ou solução já utilizada", { textarea: true })}</div><div class="jtbd-sentence" id="jtbd-sentence">${jtbdText()}</div></section>${guideCard("Peça a última situação real.", ["O que disparou a tarefa? Quem participou?", "Em qual etapa houve espera, erro ou retrabalho?", "Como a pessoa sabe que concluiu bem?", "O problema está nos dados, no processo ou na falta de uma capacidade?"], "Uma necessidade compreensível e etapas do processo com dores, sistemas e evidências registradas.")}</div><div class="title-row"><div><span class="eyebrow">JORNADA DO PROCESSO</span><h2>Onde a oportunidade aparece?</h2></div><button class="btn primary" data-action="new-journey">${icon("plus")} Adicionar etapa</button></div>${state.journey.length ? `<div class="journey-list">${state.journey.map((j, i) => `<article class="journey-card"><div class="step-number">${String(i + 1).padStart(2, "0")}</div><div><h3>${e(j.title)}</h3><p><strong>Hoje:</strong> ${e(j.activity || "Ainda não descrito.")}</p><p><strong>Dor / espera:</strong> ${e(j.pain || "Ainda não descrita.")}</p><p><strong>Dados e sistemas:</strong> ${e(j.data || "A identificar.")}</p><p><strong>Evidência:</strong> ${e(j.evidence || "Hipótese sem evidência registrada.")}</p><div class="button-row"><button class="btn small" data-action="edit-journey" data-id="${j.id}">${icon("edit")} Editar</button><button class="btn small primary" data-action="journey-opportunity" data-id="${j.id}">Explorar oportunidade ${icon("arrow")}</button><button class="btn small icon-only" data-action="journey-up" data-id="${j.id}" ${i === 0 ? "disabled" : ""} aria-label="Mover ${e(j.title)} para cima">↑</button><button class="btn small icon-only" data-action="journey-down" data-id="${j.id}" ${i === state.journey.length - 1 ? "disabled" : ""} aria-label="Mover ${e(j.title)} para baixo">↓</button><button class="btn small subtle" data-action="delete-journey" data-id="${j.id}">${icon("trash")} Excluir</button></div></div></article>`).join("")}</div>` : empty("Mapeie a primeira etapa.", "Comece pelo evento que inicia o trabalho. Não é necessário desenhar o processo inteiro para localizar uma oportunidade.", `<button class="btn" data-action="new-journey">${icon("plus")} Registrar primeira etapa</button>`, "flow")}<div class="note mt"><strong>Contraprova obrigatória na conversa:</strong> antes de propor IA, verifique se informação organizada, uma regra ou uma mudança no processo resolve o problema com menos complexidade.</div></section>`;
}
function stats() {
  const rankedCount = state.opportunities.filter(
    (o) => score(o) !== null,
  ).length;
  const selected = state.opportunities.filter((o) => o.selected).length;
  return `<div class="mini-stats"><div class="stat"><span>Oportunidades</span><strong>${state.opportunities.length}</strong><small>registradas</small></div><div class="stat" style="--discovery-accent:var(--discovery-blue)"><span>Com pontuação</span><strong>${rankedCount}</strong><small>evidência documentada</small></div><div class="stat" style="--discovery-accent:var(--discovery-violet)"><span>Selecionadas</span><strong>${selected}</strong><small>para detalhar</small></div></div>`;
}
function opportunityCard(o) {
  const s = score(o);
  return `<article class="opp-card ${o.selected ? "selected" : ""}"><div class="opp-top"><div><span class="eyebrow">${e(o.area || "ÁREA A DEFINIR")}</span><h3>${e(o.title || "Caso sem título")}</h3><div class="chips"><span class="tag">${e(capName(o.capability))}</span>${o.selected ? '<span class="tag violet">Selecionado</span>' : ""}</div></div><div class="score-badge"><strong>${s === null ? "—" : fmt(s, 1)}</strong><small>DE 100</small></div></div><p><strong>Problema:</strong> ${e(o.problem || "A definir.")}</p><p><strong>Hipótese:</strong> ${e(o.hypothesis || "A formular.")}</p><div class="opp-kpi"><strong>KPI:</strong> ${e(o.kpi || "A definir")} · ${e(o.baseline || "base pendente")} → ${e(o.target || "meta pendente")}</div><div class="chips"><span class="tag outline">${e(PATHS[o.path])}</span><span class="tag outline">Risco: ${e(RISK[o.risk])}</span><span class="tag outline">Confiança: ${e(CONFIDENCE[o.confidence].label)}</span></div><div class="button-row"><button class="btn small" data-action="edit-opportunity" data-id="${o.id}">${icon("edit")} Detalhar</button><button class="btn small ${o.selected ? "violet" : ""}" data-action="select" data-id="${o.id}" aria-pressed="${o.selected}">${icon("flag")} ${o.selected ? "Selecionado" : "Selecionar"}</button><button class="btn small subtle" data-action="duplicate" data-id="${o.id}">${icon("copy")} Duplicar</button><button class="btn small subtle" data-action="delete-opportunity" data-id="${o.id}" aria-label="Excluir ${e(o.title)}">${icon("trash")}</button></div></article>`;
}
function filteredOpps() {
  const q = normalize(oppSearch);
  const ops = state.opportunities.filter((o) =>
    normalize(o.title + " " + o.problem + " " + o.area).includes(q),
  );
  return ops.length
    ? `<div class="opp-list">${ops.map(opportunityCard).join("")}</div>`
    : state.opportunities.length
      ? '<div class="no-results">Nenhuma oportunidade corresponde à busca.</div>'
      : empty(
          "Um bom caso começa com um problema.",
          "Registre a pessoa afetada, a dor, a hipótese e a mudança que você quer medir. As cartas podem ajudar a ampliar o repertório.",
          `<button class="btn primary" data-action="new-opportunity">${icon("plus")} Criar primeiro caso</button><button class="btn" data-action="explore-tab" data-tab="capabilities">Explorar capacidades</button>`,
        );
}
function capCards() {
  const q = normalize(capFilter);
  const cs = CAPABILITIES.filter((c) =>
    normalize(
      c.title + " " + c.label + " " + c.desc + " " + c.examples.join(" "),
    ).includes(q),
  );
  return cs.length
    ? cs
        .map(
          (c) =>
            `<button class="cap-card" style="--discovery-accent:var(--${c.color})" data-action="capability" data-id="${c.id}" aria-label="Explorar capacidade: ${e(c.title)}"><span class="cap-icon">${icon(c.icon)}</span><span class="eyebrow">${e(c.label)}</span><h3>${e(c.title)}</h3><p>${e(c.desc)}</p><span class="cap-action">Perguntar antes de construir ${icon("arrow")}</span></button>`,
        )
        .join("")
    : '<p class="no-results">Nenhuma capacidade corresponde à busca.</p>';
}
function renderExplore() {
  return `<section class="page">${intro("DESENVOLVER · DIVERGIR ANTES DE ESCOLHER", "Dê espaço às possibilidades.", "Converta dores em hipóteses. Explore capacidades, compare alternativas e só então associe um caminho tecnológico.", `<button class="btn primary" data-action="new-opportunity">${icon("plus")} Novo caso de uso</button>`)}${stats()}<div class="section-tabs" aria-label="Visualização de oportunidades"><button data-action="explore-tab" data-tab="opportunities" class="${exploreTab === "opportunities" ? "active" : ""}" aria-pressed="${exploreTab === "opportunities"}">Casos de uso <span class="activity-count">${state.opportunities.length}</span></button><button data-action="explore-tab" data-tab="capabilities" class="${exploreTab === "capabilities" ? "active" : ""}" aria-pressed="${exploreTab === "capabilities"}">Cartas de capacidades</button></div>${exploreTab === "opportunities" ? `<div class="toolbar"><div class="search-wrap">${icon("search")}<input class="search" id="opportunity-search" value="${e(oppSearch)}" placeholder="Buscar por caso, problema ou área" aria-label="Buscar oportunidades"></div><button class="btn" data-route="prioritize">Priorizar ${icon("arrow")}</button></div><div id="opportunity-list">${filteredOpps()}</div>` : `<div class="note mb"><strong>Cartas autorais NEIVA.</strong> São perguntas para ideação; não são cópias do baralho oficial Microsoft AI Discovery Cards. A seleção de produto é uma hipótese a validar, não uma recomendação automática.</div><div class="toolbar"><div class="search-wrap">${icon("search")}<input class="search" id="capability-search" value="${e(capFilter)}" placeholder="Buscar capacidade, problema ou tecnologia" aria-label="Buscar capacidades"></div><button class="btn" data-route="ecosystem">Ver ecossistema ${icon("arrow")}</button></div><div class="cap-grid" id="capability-grid">${capCards()}</div>`}</section>`;
}
function quadrant(o) {
  const a = bxt(o);
  if (!a) return "Completar avaliação";
  if (a.value >= 3 && a.feasible >= 3) return "Investigar primeiro";
  if (a.value >= 3) return "Preparar fundações";
  if (a.feasible >= 3) return "Rever relevância";
  return "Reformular";
}
function matrixHtml() {
  const rs = ranked();
  return `<div class="matrix-wrap"><span class="axis-y">Valor percebido →</span><div class="matrix" role="group" aria-label="Matriz de valor e viabilidade. Cada ponto abre o caso. A tabela contém os mesmos eixos."><div class="matrix-quarter q1">Preparar fundações</div><div class="matrix-quarter q2">Investigar primeiro</div><div class="matrix-quarter q3">Reformular</div><div class="matrix-quarter q4">Rever relevância</div>${rs
    .map((o, i) => {
      const b = bxt(o);
      if (!b || score(o) === null) return "";
      const x = 8 + ((b.feasible - 1) / 4) * 84;
      const y = 8 + ((b.value - 1) / 4) * 84;
      return `<button class="matrix-point ${o.selected ? "selected" : ""}" style="--discovery-x:${x}%;--discovery-y:${y}%" data-action="edit-opportunity" data-id="${o.id}" title="${e(o.title)} · valor ${fmt(b.value, 1)} · viabilidade ${fmt(b.feasible, 1)}" aria-label="Caso ${i + 1}: ${e(o.title)}. Valor ${fmt(b.value, 1)} de 5; viabilidade ${fmt(b.feasible, 1)} de 5.">${i + 1}</button>`;
    })
    .join(
      "",
    )}</div><span class="axis-x">Viabilidade técnica + dados →</span></div>`;
}
function rankingHtml() {
  if (!state.opportunities.length)
    return empty(
      "Ainda não há casos para comparar.",
      "Crie oportunidades e registre a evidência antes de atribuir pontuações.",
      `<button class="btn primary" data-route="explore">Explorar oportunidades ${icon("arrow")}</button>`,
      "chart",
    );
  return `<div class="table-wrap"><table><caption class="sr-only">Ranking indicativo de oportunidades. Bloqueios de governança são independentes da pontuação.</caption><thead><tr><th scope="col">Caso</th><th scope="col">Nota / 100</th><th scope="col">Valor / Viabilidade</th><th scope="col">Risco</th><th scope="col">Leitura</th><th scope="col">Seleção</th></tr></thead><tbody>${ranked()
    .map((o, i) => {
      const n = score(o),
        b = bxt(o);
      return `<tr><td class="table-title"><button class="text-link" data-action="edit-opportunity" data-id="${o.id}">${i + 1}. ${e(o.title)}</button><p>${e(o.area || "Área a definir")} · ${e(CONFIDENCE[o.confidence].label)}</p></td><td><span class="score-number">${n === null ? "—" : fmt(n, 1)}</span>${n === null ? "<p>Falta avaliação / evidência</p>" : ""}</td><td>${b ? `${fmt(b.value, 1)} / ${fmt(b.feasible, 1)}` : "Não avaliados"}<p>Escala de 1 a 5</p></td><td>${e(RISK[o.risk])}${o.risk === "high" ? "<p>Revisão especializada</p>" : ""}</td><td>${n === null ? "Completar avaliação" : quadrant(o)}<p>${missing(o).length ? "Pendências de qualificação" : "Plano documentado"}</p></td><td><button class="btn small ${o.selected ? "violet" : ""}" data-action="select" data-id="${o.id}" aria-pressed="${o.selected}">${o.selected ? "Selecionado" : "Selecionar"}</button></td></tr>`;
    })
    .join("")}</tbody></table></div>`;
}
function renderPrioritize() {
  return `<section class="page">${intro("CONVERGIR · NEGÓCIO + EXPERIÊNCIA + TECNOLOGIA", "Priorize com critérios visíveis.", "A nota organiza a conversa. Não comprova retorno, não aprova o piloto e não compensa riscos ou dados sem autorização.", `<button class="btn" data-route="pilot">Preparar selecionados ${icon("arrow")}</button>`)}<div id="priority-stats">${stats()}</div><div class="grid-2 mb"><section class="card"><span class="eyebrow">VALOR × VIABILIDADE</span><h2>Uma leitura do portfólio</h2><div id="matrix-container">${matrixHtml()}</div><p class="caption">Valor = média de impacto, experiência e alinhamento. Viabilidade = média de técnica e dados. Pesos afetam o ranking, não os eixos. Pontos sobrepostos podem ser acessados pela tabela.</p></section><section class="card violet"><div class="title-row"><div><span class="eyebrow">CRITÉRIOS ADAPTÁVEIS</span><h2>O que importa nesta decisão?</h2></div><button class="btn small" data-action="reset-weights">Restaurar</button></div>${SCORES.map((s) => `<div class="weight-row"><label for="weight-${s.id}">${e(s.label)}</label><input type="range" id="weight-${s.id}" data-weight="${s.id}" min="0" max="100" step="5" value="${state.weights[s.id]}"><output id="weight-out-${s.id}" for="weight-${s.id}">${state.weights[s.id]}</output></div>`).join("")}<div class="note mt"><strong id="weight-total">Soma dos pesos: ${Object.values(state.weights).reduce((a, b) => a + b, 0)}</strong><br>Pesos são normalizados automaticamente. A soma pode ser diferente de 100, mas não pode ser zero.</div><details class="mt"><summary class="text-link">Como a pontuação é calculada?</summary><p class="helper mt">Cada critério recebe nota de 1 a 5. Zero significa <strong>não avaliado</strong> e impede o ranking. Também é necessário registrar uma evidência ou hipótese e a confiança nessa evidência.</p><pre>Nota = 100 × [Σ(peso × nota) / Σ(pesos)] / 5\n       × fator de confiança\n\nBaixa: ×0,50 · Média: ×0,75 · Alta: ×1,00</pre><p class="helper">Os fatores não são probabilidades. Escalas, pesos, quadrantes e fórmula são critérios NEIVA de facilitação, não métricas oficiais Microsoft. A seleção final é do cliente.</p></details></section></div><div class="title-row"><div><span class="eyebrow">BACKLOG COMPARÁVEL</span><h2>Escolha o que vale testar.</h2></div><button class="btn" data-action="new-opportunity">${icon("plus")} Novo caso</button></div><div id="ranking-container">${rankingHtml()}</div><div class="note mt"><strong>Decisão de risco é separada.</strong> Casos com nota alta ainda podem precisar de dados, controles, análise jurídica ou uma alternativa sem IA. Se houver impacto relevante sobre pessoas, peça revisão especializada antes de qualquer piloto real.</div></section>`;
}
function selectedCase() {
  const sel = state.opportunities.filter((o) => o.selected);
  if (!sel.find((o) => o.id === pilotId)) pilotId = sel[0]?.id || "";
  return sel.find((o) => o.id === pilotId);
}
function gatePanel(o) {
  const m = missing(o);
  return `<div class="readiness"><span class="eyebrow">PRONTIDÃO DOCUMENTAL DO PILOTO</span><h3>${m.length ? "Ainda há perguntas abertas." : "Plano documentado para decisão."}</h3><p class="helper">${m.length ? `${m.length} requisitos de registro ainda precisam de atenção.` : "Os campos e justificativas foram preenchidos. Isso não certifica conformidade nem substitui aprovação humana."}</p>${o.risk === "high" ? '<p class="helper"><strong>Risco alto:</strong> revisão especializada obrigatória antes de usar dados ou impactar pessoas.</p>' : ""}${m.length ? `<details class="mt"><summary class="text-link">Ver pendências</summary><ul class="gate-list">${m.map((x) => `<li>${e(x)}</li>`).join("")}</ul></details>` : ""}<p class="caption mt">Status “verificado” exige uma evidência. “Não aplicável” exige justificativa. Nenhum controle é verificado automaticamente.</p></div>`;
}
function renderPilot() {
  const selected = state.opportunities.filter((o) => o.selected),
    o = selectedCase();
  return `<section class="page">${intro("VALIDAR · EXPERIMENTO ANTES DA ESCALA", "Transforme a aposta em aprendizado.", "Defina uma hipótese testável, uma amostra, critérios de sucesso e limites de segurança. Discovery não equivale à aprovação de produção.", `<button class="btn" data-route="prioritize">Rever seleção</button>`)}${!o ? empty("Selecione uma oportunidade primeiro.", "Use o backlog para escolher os casos que merecem um plano de experimento. A seleção não exige uma nota alta, mas exige uma decisão consciente.", `<button class="btn primary" data-route="prioritize">Abrir priorização ${icon("arrow")}</button>`, "lab") : `<div class="pilot-picker">${selected.map((c) => `<button class="btn ${c.id === o.id ? "active" : ""}" data-action="pilot-select" data-id="${c.id}" aria-pressed="${c.id === o.id}">${icon("flag")} ${e(c.title)}</button>`).join("")}</div><section class="card mb"><div class="opp-top"><div><span class="eyebrow">CASO SELECIONADO</span><h2>${e(o.title)}</h2><p class="helper">${e(o.problem || "Problema a definir.")}</p><div class="chips mt"><span class="tag">${e(PATHS[o.path])}</span><span class="tag">Risco: ${e(RISK[o.risk])}</span><span class="tag">KPI: ${e(o.kpi || "a definir")}</span></div></div><button class="btn small" data-action="edit-opportunity" data-id="${o.id}">${icon("edit")} Editar caso</button></div></section><div class="split"><div class="stack"><section class="card"><span class="eyebrow">DESENHO DO EXPERIMENTO</span><h2>O que precisamos aprender?</h2><div class="fields mt">${pilotInput(o, "hypothesis", "Hipótese testável", "Se fizermos X para Y, esperamos Z, porque...", { textarea: true, full: true })}${pilotInput(o, "experiment", "Como testar e comparar", "Descreva teste, comparação com situação atual e alternativa sem IA", { textarea: true, full: true })}${pilotInput(o, "sample", "Amostra e escopo", "Que casos, usuários e dados autorizados participam? O que fica fora?", { textarea: true, full: true })}${pilotInput(o, "acceptance", "Critério de sucesso e fonte da medição", "Métrica, limite mínimo, período e evidência para avançar", { textarea: true, full: true })}${pilotInput(o, "quality", "Qualidade, segurança e danos a avaliar", "Acurácia, respostas sem fonte, viés, vazamento, ações indevidas...", { textarea: true, full: true })}${pilotInput(o, "fallback", "Quando interromper e qual alternativa usar", "Sinais de parada, responsável, reversão e processo manual", { textarea: true, full: true })}</div></section><section class="card cyan"><span class="eyebrow">EXECUÇÃO E RESPONSABILIDADE</span><h2>Quem valida, quando e com quais limites?</h2><div class="fields mt">${pilotInput(o, "owner", "Responsável pelo piloto", "Nome ou papel responsável")}${pilotInput(o, "reviewDate", "Data de revisão", "", { type: "date" })}${pilotInput(o, "duration", "Prazo do experimento", "Ex.: duas semanas, após liberar dados")}${pilotInput(o, "budget", "Limite de custo e premissas", "Incluir licenças, consumo, equipe e operação")}${pilotInput(o, "nextAction", "Próxima ação concreta", "Verbo + entrega + responsável + prazo", { textarea: true, full: true })}</div></section></div><div class="stack"><div id="pilot-gate">${gatePanel(o)}</div><section class="card violet"><span class="eyebrow">CONTROLES DESDE A DESCOBERTA</span><h2>Registre a evidência, não só o check.</h2><p class="helper">Discussão inicial inspirada no planejamento de IA responsável do CAF. Não é avaliação jurídica, de conformidade ou certificação.</p>${GATES.map((g) => `<div class="check-card"><div><h4>${e(g.title)}</h4><p>${e(g.desc)}</p></div><div class="field"><label for="gate-${g.id}">Situação</label><select id="gate-${g.id}" data-gate="${g.id}" data-id="${o.id}">${options(GATE_STATUS, o.gates[g.id].status)}</select></div><div class="field evidence"><label for="gate-note-${g.id}">Evidência / justificativa e responsável</label><input id="gate-note-${g.id}" data-gate-note="${g.id}" data-id="${o.id}" maxlength="5000" value="${e(o.gates[g.id].note)}" placeholder="O que foi verificado? Por quem? O que falta?"></div></div>`).join("")}</section></div></div>`}</section>`;
}
function renderEcosystemCards() {
  const q = normalize(ecoSearch);
  const list = ECOSYSTEM.filter(
    (c) =>
      (ecoFilter === "Todas" || c.group === ecoFilter) &&
      normalize(
        c.title + " " + c.products + " " + c.desc + " " + c.question,
      ).includes(q),
  );
  return list.length
    ? list
        .map(
          (c) =>
            `<article class="card eco-card ${c.color}"><span class="eyebrow">${e(c.label)}</span><h3>${e(c.title)}</h3><div class="products">${e(c.products)}</div><p class="helper">${e(c.desc)}</p><p class="question"><strong>Pergunte ao cliente:</strong><br>${e(c.question)}</p><div class="note"><strong>Verificar:</strong> ${e(c.control)}</div><div class="button-row mt"><button class="btn small" data-action="eco-opportunity" data-id="${c.id}">Explorar um caso ${icon("arrow")}</button></div><p class="source-link">${sourceLink(c.source)}</p></article>`,
        )
        .join("")
    : '<p class="no-results">Nenhuma família corresponde à busca. Tente outro termo ou remova o filtro.</p>';
}
function renderEcosystem() {
  return `<section class="page">${intro("REPERTÓRIO · DO PRONTO AO PERSONALIZADO", "Um ecossistema.<br>Diferentes caminhos de valor.", "Explore as principais famílias de IA da Microsoft — incluindo produtividade, agentes, dados, operação, governança e IA local. Este mapa não é um catálogo exaustivo de recursos ou licenças.")}<div class="note mb"><strong>Adotar → estender → construir — ou não usar IA.</strong> Comece pelo caminho mais simples que atenda ao problema e aos controles. Produtos podem se complementar; a associação exige validação técnica e comercial. Referências consultadas em 13/10/2026.</div><div class="toolbar"><div class="search-wrap">${icon("search")}<input id="ecosystem-search" class="search" placeholder="Buscar produto, capacidade ou pergunta de negócio" value="${e(ecoSearch)}" aria-label="Buscar no ecossistema Microsoft"></div></div><div class="filter-row" aria-label="Filtrar famílias de produtos">${["Todas", "Trabalho", "Agentes", "Dados", "Operações", "Governança", "Local & pesquisa"].map((x) => `<button class="filter ${ecoFilter === x ? "active" : ""}" data-action="eco-filter" data-value="${e(x)}" aria-pressed="${ecoFilter === x}">${e(x)}</button>`).join("")}</div><div class="ecosystem-grid" id="ecosystem-grid">${renderEcosystemCards()}</div><div class="note mt"><strong>Antes de recomendar:</strong> confirme o nome e o status atual do recurso, região, idioma, licença, custo, conexão aos dados e limitações no ambiente do cliente. Links abrem referências externas; a ferramenta não envia o conteúdo da sessão a elas.</div></section>`;
}
function renderMethod() {
  return `<section class="page">${intro("MÉTODO & REFERÊNCIAS", "Estrutura para pensar.<br>Liberdade para investigar.", "A abordagem combina descoberta de problemas, exploração de capacidades e experimentação. Use as etapas de forma iterativa, não como um checklist que comprova sucesso.")}<section class="card violet mb"><span class="eyebrow">O QUE É — E O QUE NÃO É</span><h2>Uma adaptação NEIVA, com referências explícitas.</h2><p>Os fundamentos Microsoft vêm das orientações de estratégia e planejamento de adoção de IA do Cloud Adoption Framework. Double Diamond organiza a conversa; Jobs to Be Done ajuda a compreender a necessidade; a ligação entre resultado, oportunidade, hipótese e teste apoia a experimentação.</p><p class="helper">As lentes de negócio, experiência e tecnologia, a matriz, os pesos e os fatores de confiança são escolhas de facilitação da NEIVA. Não constituem um único framework oficial Microsoft. As cartas são autorais e não reproduzem Microsoft AI Discovery Cards. Não há endosso, certificação ou validação automática da Microsoft.</p></section><div class="method-steps mb"><section class="card"><span class="eyebrow">DESCOBRIR</span><h3>Ampliar a escuta</h3><strong>Inovação + JTBD</strong><p>Entender circunstância, progresso desejado e barreiras antes de desenhar a solução.</p><p class="helper">Saída: contexto e jornada.</p></section><section class="card cyan"><span class="eyebrow">DEFINIR</span><h3>Recortar o problema</h3><strong>Resultado + evidência</strong><p>Nomear a oportunidade, quem é afetado e o indicador que precisa mudar.</p><p class="helper">Saída: problema verificável.</p></section><section class="card violet"><span class="eyebrow">DESENVOLVER</span><h3>Comparar alternativas</h3><strong>Produto + capacidades</strong><p>Construir hipóteses distintas e incluir a opção sem IA, sem antecipar a escolha de fornecedor.</p><p class="helper">Saída: backlog comparável.</p></section><section class="card magenta"><span class="eyebrow">VALIDAR</span><h3>Reduzir a incerteza</h3><strong>Experimento + governança</strong><p>Definir como testar valor e viabilidade, com supervisão e condições explícitas para interromper.</p><p class="helper">Saída: plano para decisão.</p></section></div><div class="grid-2 mb"><section class="card"><span class="eyebrow">POR QUE A COMBINAÇÃO HÍBRIDA?</span><h2>O framework serve ao problema.</h2><ul class="prompt-list"><li><strong>Inovação:</strong> Double Diamond amplia e depois reduz o espaço de opções; é o percurso principal.</li><li><strong>Produto:</strong> JTBD e a lógica resultado → oportunidade → hipótese → teste impedem que o backlog seja só uma lista de funcionalidades.</li><li><strong>Gestão de processos:</strong> indicadores, fluxo e restrições ajudam a discutir espera, custo e retrabalho. Aqui não se aplica integralmente OKRs ou Lean Six Sigma.</li><li><strong>Engenharia de IA:</strong> CRISP-DM ou TDSP podem orientar a execução de um caso intensivo em dados. Não são o eixo desta sessão de negócio.</li></ul></section><section class="card cyan"><span class="eyebrow">REGRAS DE BOA FACILITAÇÃO</span><h2>Questione as certezas.</h2><ul class="prompt-list"><li>Marque como hipótese tudo o que não tem evidência.</li><li>Não trate confiança na evidência como probabilidade de retorno.</li><li>Uma nota alta não remove um bloqueio de governança.</li><li>Considere adoção, operação e alternativa manual desde o início.</li><li>Defina responsável, critério de sucesso e revisão para cada piloto.</li><li>Meça o processo e a solução; não avalie competência individual de funcionários.</li></ul></section></div><section class="card mb"><span class="eyebrow">GUIA DE USO E PORTABILIDADE</span><h2>Um arquivo. Uma sessão sob seu controle.</h2><ul class="prompt-list"><li><strong>HTML com a sessão:</strong> cria uma nova cópia independente da ferramenta com todos os registros atuais. Quem receber verá os dados e as notas.</li><li><strong>JSON:</strong> exporta os registros para backup e reimportação nesta versão. Não inclui código executável.</li><li><strong>Impressão:</strong> prepara a síntese completa; escolha impressão ou salvar em PDF no seu navegador.</li><li><strong>Rascunho local:</strong> opcional, sem criptografia e limitado ao contexto do navegador. O arquivo no disco não se atualiza sozinho.</li><li><strong>Sem rede:</strong> campos, ranking, busca e exportações não dependem de internet. Somente os links de referência abrem sites externos.</li><li><strong>Acessibilidade:</strong> navegação por teclado, rótulos, alternativa tabular à matriz, opção de movimento reduzido e versão de impressão.</li></ul><p class="helper mt">O logo original foi incorporado sem recoloração ou distorção a partir de Kit-de-Marca-NEIVA-Cloud-Solutions.docx, guia de junho de 2026. Texto pequeno usa contraste adequado; ciano e magenta são acentos, não cores de texto corrido.</p></section><section class="card violet"><span class="eyebrow">FONTES E ATRIBUIÇÃO</span><h2>Referências para continuar a conversa</h2><p class="helper mb">Consulta: 13/10/2026. Os títulos preservam os nomes das referências. A aplicação, os exemplos e as perguntas são adaptações autorais; o exemplo demonstrativo é fictício.</p><ol class="source-list">${SOURCES.map((s) => `<li>${sourceLink(s.id)}<small>${e(s.note)}</small></li>`).join("")}</ol><p class="helper mt">Microsoft, Microsoft 365, Azure, Dynamics 365 e demais marcas citadas pertencem a seus titulares. Double Diamond: Design Council, CC BY 4.0. Conteúdo do Cloud Adoption Framework: Microsoft, CC BY 4.0; síntese e aplicação adaptadas. Demais referências: atribuição e links, sem reprodução de materiais.</p></section></section>`;
}
function reportHtml(full = false) {
  const rs = ranked();
  const rows = rs
    .map((o, i) => {
      const n = score(o);
      return `<tr><td>${i + 1}. ${e(o.title)}</td><td>${n === null ? "Não avaliado" : fmt(n, 1)}</td><td>${e(PATHS[o.path])}</td><td>${e(RISK[o.risk])}</td><td>${o.selected ? "Selecionado" : "Não selecionado"}</td></tr>`;
    })
    .join("");
  return `<article class="report"><header class="report-head"><div><span class="eyebrow">NEIVA CLOUD SOLUTIONS · AI DISCOVERY</span><h2>${e(state.session.client || "Sessão de descoberta")}</h2><p>${e(state.session.area || "Área a definir")} · ${dateLabel(state.session.date)}</p><p>Facilitação: ${e(state.session.facilitator || "A definir")}</p></div><img src="${LOGO}" alt="Símbolo original da NEIVA Cloud Solutions" width="88" height="88"></header>${state.meta.demo ? '<div class="report-demo">EXEMPLO FICTÍCIO · Os registros e números abaixo são ilustrativos, não resultados reais.</div>' : ""}<h3>1. Resultado e contexto</h3><dl><dt>Objetivo</dt><dd>${valueOr(state.session.objective)}</dd><dt>Indicador</dt><dd>${valueOr(state.session.metric)}</dd><dt>Linha de base</dt><dd>${valueOr(state.session.baseline)}</dd><dt>Meta / horizonte</dt><dd>${valueOr(state.session.target)}</dd><dt>Patrocinador</dt><dd>${valueOr(state.session.sponsor)}</dd><dt>Participantes</dt><dd>${valueOr(state.session.participants)}</dd><dt>Restrições</dt><dd>${valueOr(state.session.constraints)}</dd></dl><h3>2. Necessidade e processo</h3><div class="report-jtbd">${jtbdText()}</div><p class="mt"><strong>Alternativa atual:</strong> ${valueOr(state.jobs.alternative)}</p>${state.journey.length ? state.journey.map((j, i) => `<section class="report-case"><h4>${i + 1}. ${e(j.title)}</h4><dl><dt>Atividade</dt><dd>${valueOr(j.activity)}</dd><dt>Dor</dt><dd>${valueOr(j.pain)}</dd><dt>Dados / sistemas</dt><dd>${valueOr(j.data)}</dd><dt>Evidência</dt><dd>${valueOr(j.evidence)}</dd></dl></section>`).join("") : '<p class="mt">Nenhuma etapa do processo registrada.</p>'}<h3>3. Portfólio e priorização</h3><p>Nota indicativa, de 0 a 100, calculada apenas com avaliações registradas. Não é ROI, previsão de sucesso ou aprovação.</p><p class="legal mt">Pesos relativos: ${SCORES.map((s) => `${e(s.label)} ${state.weights[s.id]}`).join(" · ")}. Fórmula: 100 × média ponderada das notas / 5 × confiança. Fatores: baixa 0,50; média 0,75; alta 1,00. Critérios NEIVA, não pontuação oficial Microsoft.</p>${rs.length ? `<div class="table-wrap mt"><table><caption class="sr-only">Resumo das oportunidades</caption><thead><tr><th>Caso</th><th>Nota / 100</th><th>Caminho</th><th>Risco</th><th>Decisão de seleção</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<p class="mt">Nenhum caso de uso registrado.</p>'}${rs
    .map((o) => {
      const content = `<dl><dt>Área / pessoa</dt><dd>${valueOr(o.area)} · ${valueOr(o.persona)}</dd><dt>Problema</dt><dd>${valueOr(o.problem)}</dd><dt>Hipótese de solução</dt><dd>${valueOr(o.hypothesis)}</dd><dt>Alternativa sem IA</dt><dd>${valueOr(o.alternative)}</dd><dt>Capacidade</dt><dd>${e(capName(o.capability))}</dd><dt>Etapa de origem</dt><dd>${valueOr(state.journey.find((j) => j.id === o.journeyId)?.title)}</dd><dt>KPI / base / meta</dt><dd>${valueOr(o.kpi)} · ${valueOr(o.baseline)} → ${valueOr(o.target)}</dd><dt>Evidência</dt><dd>${valueOr(o.evidence)}</dd><dt>Fontes de dados</dt><dd>${valueOr(o.dataSources)}</dd><dt>Responsável</dt><dd>${valueOr(o.owner)}</dd><dt>Notas dos critérios</dt><dd>${SCORES.map((s) => `${e(s.label)}: ${o.scores[s.id] || "não avaliado"}`).join(" · ")}</dd><dt>Confiança</dt><dd>${e(CONFIDENCE[o.confidence].label)}</dd><dt>Risco / justificativa</dt><dd>${e(RISK[o.risk])} · ${valueOr(o.riskNotes)}</dd></dl>`;
      return `<section class="report-case"><h4>${e(o.title)}</h4>${full ? content : `<details><summary>Ver evidências e avaliações deste caso</summary>${content}</details>`}</section>`;
    })
    .join("")}<h3>4. Planos de experimento</h3>${
    rs.filter((o) => o.selected).length
      ? rs
          .filter((o) => o.selected)
          .map(
            (o) =>
              `<section class="report-case"><h4>${e(o.title)}</h4><p><strong>Situação:</strong> ${missing(o).length ? `${missing(o).length} pendências de registro — piloto ainda não qualificado.` : "Plano documentado — aprovação humana continua necessária."}</p><dl>${[
                ["hypothesis", "Hipótese"],
                ["experiment", "Teste / comparação"],
                ["sample", "Amostra e escopo"],
                ["acceptance", "Critério de sucesso"],
                ["quality", "Qualidade e riscos"],
                ["owner", "Responsável"],
                ["reviewDate", "Data da revisão"],
                ["duration", "Prazo"],
                ["budget", "Limite de custo"],
                ["fallback", "Interrupção / alternativa"],
                ["nextAction", "Próxima ação"],
              ]
                .map(
                  ([k, l]) =>
                    `<dt>${l}</dt><dd>${k === "reviewDate" ? dateLabel(o.pilot[k]) : valueOr(o.pilot[k])}</dd>`,
                )
                .join(
                  "",
                )}</dl><h4>Controles e justificativas</h4><ul>${GATES.map((g) => `<li><strong>${e(g.title)} — ${e(GATE_STATUS[o.gates[g.id].status])}:</strong> ${valueOr(o.gates[g.id].note)}</li>`).join("")}</ul>${missing(o).length ? `<p class="legal mt"><strong>Falta documentar:</strong> ${missing(o).map(e).join("; ")}.</p>` : ""}</section>`,
          )
          .join("")
      : "<p>Nenhum caso selecionado para experimento.</p>"
  }<h3>5. Decisão e encaminhamento</h3><dl><dt>Decisão</dt><dd>${e(DECISIONS[state.decision])}</dd><dt>Responsável</dt><dd>${valueOr(state.session.decisionOwner)}</dd><dt>Revisão</dt><dd>${dateLabel(state.session.decisionDate)}</dd><dt>Próxima ação</dt><dd>${valueOr(state.session.nextAction)}</dd><dt>Condições / motivos</dt><dd>${valueOr(state.session.decisionNotes)}</dd><dt>Notas da facilitação</dt><dd>${valueOr(state.session.notes)}</dd></dl><h3>6. Referências e limites</h3><p class="legal">Abordagem NEIVA alinhada às orientações Microsoft do Cloud Adoption Framework; combina descoberta, lentes de negócio/experiência/tecnologia e experimentação. Não é um framework oficial único, avaliação certificada ou solução conectada a IA. Notas de risco não substituem validação jurídica, técnica ou de segurança. A ferramenta não constitui aprovação de produção.</p><ul class="legal">${["strategy", "plan", "diamond", "jtbd", "ost"].map((s) => `<li>${sourceLink(s)}</li>`).join("")}</ul>${
    full
      ? `<details open><summary>Repertório do ecossistema</summary><ul class="legal">${SOURCES.filter(
          (s) => !["strategy", "plan", "diamond", "jtbd", "ost"].includes(s.id),
        )
          .map((s) => `<li>${sourceLink(s.id)}</li>`)
          .join("")}</ul></details>`
      : ""
  }<p class="legal mt">Referências consultadas em 13/10/2026. Double Diamond: Design Council, CC BY 4.0. Cloud Adoption Framework: Microsoft, CC BY 4.0; adaptações NEIVA. Cartas autorais, sem reprodução do baralho Microsoft AI Discovery Cards. Marcas pertencem a seus titulares.</p><p class="tagline">Transformando complexidade em conhecimento.</p><p><a href="https://www.neivacloudsolutions.com/" target="_blank" rel="noopener noreferrer">www.neivacloudsolutions.com</a></p></article>`;
}
function renderSummary() {
  return `<section class="page">${intro("ENCAMINHAR · DECISÃO + RESPONSÁVEL + PRÓXIMA AÇÃO", "Feche a conversa.<br>Abra o próximo passo.", "Revise a síntese, registre a decisão do cliente e salve uma cópia. Nenhuma seleção ou nota autoriza a implementação por si só.", `<button class="btn primary" data-action="export">${icon("download")} Salvar / Exportar</button>`)}<section class="card violet mb"><span class="eyebrow">REGISTRO DA DECISÃO</span><h2>O que foi acordado?</h2><div class="fields mt"><div class="field"><label for="decision-select">Decisão do cliente</label><select id="decision-select">${options(DECISIONS, state.decision)}</select></div>${input("Quem responde pela decisão?", "session.decisionOwner", "Nome ou papel")}${input("Data de revisão", "session.decisionDate", "", { type: "date" })}${input("Próxima ação", "session.nextAction", "Entrega + responsável + prazo")}${input("Condições, discordâncias ou motivo de não avançar", "session.decisionNotes", "Registre o que precisa ser validado antes de agir", { textarea: true, full: true })}${input("Notas da facilitação — incluídas nas exportações", "session.notes", "Registro compartilhável. Não inserir dados sensíveis.", { textarea: true, full: true })}</div></section><div class="title-row"><div><span class="eyebrow">SÍNTESE DA SESSÃO</span><h2>Um registro para continuar.</h2></div><div class="button-row"><button class="btn" data-action="refresh-summary">Atualizar prévia</button><button class="btn" data-action="print">${icon("print")} Imprimir</button></div></div><p class="caption mb">A impressão inclui o detalhamento de todos os casos, controles e referências, mesmo quando recolhidos na prévia.</p><div id="summary-preview">${reportHtml(false)}</div></section>`;
}

function normalize(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
function toast(message) {
  clearTimeout(toastTimer);
  const el = document.getElementById("toast");
  el.textContent = message;
  el.hidden = false;
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, 6500);
}
function updateHeader() {
  const c = completion(),
    count = c.filter(Boolean).length;
  document.getElementById("session-progress-bar").style.inlineSize =
    (count / c.length) * 100 + "%";
  document.getElementById("session-progress-text").textContent =
    `${count}/${c.length} registros`;
  document.getElementById("client-pill").textContent =
    state.session.client || "Nova sessão";
  document.getElementById("demo-banner").hidden = !state.meta.demo;
  document.querySelectorAll("#journey-nav .nav-button").forEach((b, i) => {
    b.classList.toggle("done", !!c[i]);
    const chk = b.querySelector(".check");
    if (chk) chk.hidden = !c[i];
  });
  const st = document.getElementById("save-status");
  if (storageEnabled && storageHealthy)
    st.innerHTML = "<strong>RASCUNHO LOCAL</strong>Exporte para ter uma cópia";
  else if (storageEnabled && !storageHealthy)
    st.innerHTML =
      "<strong>RASCUNHO INDISPONÍVEL</strong>Exporte antes de fechar";
  else
    st.innerHTML = `<strong>${state.meta.demo ? "EXEMPLO FICTÍCIO" : "SESSÃO LOCAL"}</strong>${dirty ? "Alterações só nesta aba" : "Exporte para guardar"}`;
}
function persist() {
  if (!storageEnabled) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageHealthy = true;
  } catch {
    storageHealthy = false;
    toast(
      "Não foi possível guardar o rascunho neste navegador. Exporte sua sessão para não perder os registros.",
    );
  }
  updateHeader();
}
function touch() {
  dirty = true;
  state.meta.updated = new Date().toISOString();
  clearTimeout(saveTimer);
  if (storageEnabled) saveTimer = setTimeout(persist, 250);
  updateHeader();
}
function renderNav() {
  document.getElementById("journey-nav").innerHTML = STEPS.map(
    (s, i) =>
      `<button class="nav-button" data-route="${s.id}"><span class="num">${String(i + 1).padStart(2, "0")}</span><span class="nav-copy">${e(s.name)}</span><span class="check" hidden>${icon("check")}</span></button>`,
  ).join("");
}
function render() {
  const views = {
    align: renderAlign,
    understand: renderUnderstand,
    explore: renderExplore,
    prioritize: renderPrioritize,
    pilot: renderPilot,
    summary: renderSummary,
    ecosystem: renderEcosystem,
    method: renderMethod,
  };
  if (!views[route]) route = "align";
  document.getElementById("discovery-content").innerHTML = views[route]();
  document.querySelectorAll(".nav-button").forEach((b) => {
    const active = b.dataset.route === route;
    b.classList.toggle("active", active);
    if (active) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  const i = STEPS.findIndex((s) => s.id === route);
  document.getElementById("breadcrumb").textContent =
    i >= 0
      ? `WORKSHOP / ${String(i + 1).padStart(2, "0")} ${STEPS[i].name}`
      : `REPERTÓRIO / ${route === "ecosystem" ? "ECOSSISTEMA MICROSOFT" : "MÉTODO E REFERÊNCIAS"}`;
  document.getElementById("bottom-nav").innerHTML =
    i >= 0
      ? `<button class="btn" data-route="${STEPS[Math.max(0, i - 1)].id}" ${i === 0 ? "disabled" : ""}>${icon("back")} ${i > 0 ? e(STEPS[i - 1].name) : "Voltar"}</button><span class="step-note">Etapa ${i + 1} de ${STEPS.length} · você pode voltar e refinar a qualquer momento</span>${i < STEPS.length - 1 ? `<button class="btn primary" data-route="${STEPS[i + 1].id}">${e(STEPS[i + 1].name)} ${icon("arrow")}</button>` : '<button class="btn primary" data-action="export">Salvar a sessão ' + icon("download") + "</button>"}`
      : '<button class="btn" data-route="explore">' +
        icon("back") +
        ' Voltar à descoberta</button><span class="step-note">Uma tecnologia é um caminho; o resultado de negócio é o objetivo.</span>';
  updateHeader();
}
function navigate(next) {
  if (![...STEPS.map((s) => s.id), "ecosystem", "method"].includes(next))
    return;
  route = next;
  closeMenu();
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
  document.getElementById("discovery-content").focus({ preventScroll: true });
}
function closeMenu() {
  document.body.classList.remove("nav-open");
  document.querySelector(".mobile-menu").setAttribute("aria-expanded", "false");
}
function refreshPriority() {
  document.getElementById("priority-stats")?.replaceChildren();
  const statsEl = document.getElementById("priority-stats");
  if (statsEl) statsEl.innerHTML = stats();
  const m = document.getElementById("matrix-container");
  if (m) m.innerHTML = matrixHtml();
  const r = document.getElementById("ranking-container");
  if (r) r.innerHTML = rankingHtml();
}
function refreshGate() {
  const o = selectedCase(),
    el = document.getElementById("pilot-gate");
  if (o && el) el.innerHTML = gatePanel(o);
}
function refreshSummary() {
  const el = document.getElementById("summary-preview");
  if (el) el.innerHTML = reportHtml(false);
}
function askConfirm(title, message, accept = "Continuar") {
  const d = document.getElementById("confirm-dialog");
  document.getElementById("confirm-title").textContent = title;
  document.getElementById("confirm-message").textContent = message;
  document.getElementById("confirm-accept").textContent = accept;
  d.showModal();
  document.getElementById("confirm-cancel").focus();
  return new Promise((resolve) => {
    confirmResolver = resolve;
  });
}
function finishConfirm(answer) {
  document.getElementById("confirm-dialog").close();
  if (confirmResolver) {
    const r = confirmResolver;
    confirmResolver = null;
    r(answer);
  }
}
function openDialog({
  title,
  kicker = "AI DISCOVERY",
  description = "",
  body = "",
  footer = "",
  form = "",
}) {
  const d = document.getElementById("main-dialog");
  if (!d.open) dialogReturn = document.activeElement;
  d.innerHTML = `${form ? `<form id="${form}">` : ""}<div class="dialog-header"><div><span class="eyebrow">${e(kicker)}</span><h2 id="dialog-title">${e(title)}</h2>${description ? `<p>${e(description)}</p>` : ""}</div><button class="btn icon-only" type="button" data-action="close-dialog" aria-label="Fechar janela">${icon("close")}</button></div><div class="dialog-body">${body}</div>${footer ? `<div class="dialog-footer">${footer}</div>` : ""}${form ? "</form>" : ""}`;
  if (!d.open) d.showModal();
  d.scrollTop = 0;
  const first = d.querySelector(
    "[autofocus],input:not([type=range]),textarea,select",
  );
  if (first) first.focus({ preventScroll: true });
  else
    d.querySelector("[data-action=close-dialog]")?.focus({
      preventScroll: true,
    });
}
function closeDialog() {
  const d = document.getElementById("main-dialog");
  if (d.open) d.close();
}
let opportunityDraft = null;
let journeyDraftId = "";
function openOpportunity(op = null, seed = {}) {
  if (!op && state.opportunities.length >= 200) {
    toast("Limite desta sessão: 200 casos. Exporte e comece outra sessão.");
    return;
  }
  opportunityDraft = op
    ? structuredClone(op)
    : Object.assign(newOpportunity(), seed);
  const o = opportunityDraft;
  const body = `<div class="dialog-section"><h3>1. Problema e hipótese</h3><div class="fields">${dialogField("title", "Nome do caso de uso", o.title, { required: true, full: true, placeholder: "Verbo + resultado esperado", max: 200 })}${dialogField("area", "Área / processo", o.area || state.session.area)}${dialogField("persona", "Pessoa / papel afetado", o.persona || state.jobs.persona)}${dialogField("problem", "Qual problema vale resolver?", o.problem, { textarea: true, full: true, required: true, placeholder: "Descreva a dor e a consequência, sem começar pelo produto." })}${dialogField("hypothesis", "Hipótese de solução", o.hypothesis, { textarea: true, full: true, placeholder: "O que poderia mudar no trabalho e por quê?" })}${dialogField("alternative", "Alternativa sem IA e por que compará-la", o.alternative, { textarea: true, full: true, placeholder: "Melhorar o processo, regras, busca, integração, automação convencional..." })}</div></div><div class="dialog-section"><h3>2. Métrica, dados e evidência</h3><div class="fields">${dialogField("kpi", "Indicador de sucesso", o.kpi)}${dialogField("owner", "Responsável pelo caso", o.owner)}${dialogField("baseline", "Linha de base e fonte", o.baseline)}${dialogField("target", "Meta e horizonte", o.target)}${dialogField("evidence", "Evidência ou hipótese documentada", o.evidence, { textarea: true, full: true, placeholder: "Fonte, amostra, data e limitações. Se não houver evidência, marque explicitamente como hipótese." })}${dialogField("dataSources", "Fontes de dados necessárias", o.dataSources, { textarea: true, full: true, placeholder: "Sistemas, documentos, responsável, acesso e qualidade conhecidos." })}</div></div><div class="dialog-section"><h3>3. Capacidade, caminho e risco</h3><div class="fields"><div class="field"><label for="form-capability">Capacidade principal</label><select name="capability" id="form-capability">${CAPABILITIES.map((c) => `<option value="${c.id}" ${c.id === o.capability ? "selected" : ""}>${e(c.title)}</option>`).join("")}</select></div><div class="field"><label for="form-journeyId">Etapa do processo vinculada</label><select name="journeyId" id="form-journeyId"><option value="">Sem vínculo</option>${state.journey.map((j) => `<option value="${j.id}" ${j.id === o.journeyId ? "selected" : ""}>${e(j.title)}</option>`).join("")}</select></div><div class="field"><label for="form-path">Caminho a investigar</label><select name="path" id="form-path">${options(PATHS, o.path)}</select></div><div class="field"><label for="form-risk">Risco potencial do uso</label><select name="risk" id="form-risk">${options(RISK, o.risk)}</select></div>${dialogField("riskNotes", "Justificativa do risco e revisão necessária", o.riskNotes, { textarea: true, full: true, placeholder: "Quem pode ser afetado? Qual dano é possível? Qual controle ou especialista precisa ser envolvido?" })}</div></div><div class="dialog-section"><h3>4. Avaliação para a conversa</h3><div class="radio-legend"><span><strong>0</strong> Não avaliado</span><span><strong>1</strong> Muito baixo</span><span><strong>2</strong> Baixo</span><span><strong>3</strong> Médio</span><span><strong>4</strong> Alto</span><span><strong>5</strong> Muito alto</span></div>${SCORES.map((s) => `<div class="range-row"><label for="form-score-${s.id}">${e(s.label)}<small>${e(s.help)}</small></label><input name="score-${s.id}" id="form-score-${s.id}" type="range" min="0" max="5" step="1" value="${o.scores[s.id]}" data-score="${s.id}" aria-describedby="score-hint"><output id="score-out-${s.id}" for="form-score-${s.id}">${o.scores[s.id] === 0 ? "—" : o.scores[s.id] + "/5"}</output></div>`).join("")}<p id="score-hint" class="caption">Nota maior é melhor. Em viabilidade e dados, pontue o quanto está pronto — não o grau de dificuldade. Não confunda risco baixo com nota alta.</p><div class="field mt"><label for="form-confidence">Confiança na evidência, não na ideia</label><select name="confidence" id="form-confidence">${Object.entries(
    CONFIDENCE,
  )
    .map(
      ([k, v]) =>
        `<option value="${k}" ${o.confidence === k ? "selected" : ""}>${e(v.label)}${v.factor ? " · fator " + fmt(v.factor, 2) : ""}</option>`,
    )
    .join(
      "",
    )}</select></div><div class="note mt"><strong>Sem falsa precisão:</strong> todos os critérios, a confiança e uma evidência/hipótese precisam estar registrados para que a nota seja calculada. A ferramenta não verifica a evidência. Você pode salvar um caso incompleto e voltar depois.</div></div>`;
  openDialog({
    title: op ? "Detalhar caso de uso" : "Nova oportunidade",
    kicker: "PROBLEMA → HIPÓTESE → EVIDÊNCIA",
    description:
      "Um caso de uso é uma hipótese de valor. Campos com * são necessários para salvar.",
    body,
    form: "opportunity-form",
    footer:
      '<small>As alterações entram na sessão ao salvar.</small><button class="btn" type="button" data-action="close-dialog">Cancelar</button><button class="btn primary" type="submit">Salvar caso de uso</button>',
  });
}
function openJourney(j = null) {
  if (!j && state.journey.length >= 100) {
    toast("Limite desta sessão: 100 etapas.");
    return;
  }
  journeyDraftId = j?.id || "";
  openDialog({
    title: j ? "Editar etapa do processo" : "Nova etapa do processo",
    kicker: "JORNADA · OBSERVAR O TRABALHO",
    description:
      "Registre o que acontece hoje. Separe uma situação observada de uma suposição.",
    form: "journey-form",
    body: `<div class="fields">${dialogField("title", "Nome da etapa", j?.title || "", { required: true, full: true, placeholder: "Ex.: localizar orientação para responder", max: 200 })}${dialogField("activity", "O que acontece hoje?", j?.activity || "", { textarea: true, full: true })}${dialogField("pain", "Dor, espera ou retrabalho", j?.pain || "", { textarea: true, full: true })}${dialogField("data", "Dados e sistemas envolvidos", j?.data || "", { textarea: true, full: true })}${dialogField("evidence", "Evidência / situação concreta", j?.evidence || "", { textarea: true, full: true, placeholder: "Exemplo, frequência, impacto e fonte. Se for hipótese, identifique." })}</div>`,
    footer:
      '<button class="btn" type="button" data-action="close-dialog">Cancelar</button><button class="btn primary" type="submit">Salvar etapa</button>',
  });
}
function openCapability(cid) {
  const c = CAPABILITIES.find((x) => x.id === cid);
  if (!c) return;
  openDialog({
    title: c.title,
    kicker: c.label,
    description: c.desc,
    body: `<div class="card ${c.color}"><span class="eyebrow">PERGUNTAS PARA A CONVERSA</span><ul class="prompt-list">${c.questions.map((q) => `<li>${e(q)}</li>`).join("")}</ul></div><h3 class="mt">Caminhos a investigar</h3><div class="chips mt">${c.examples.map((x) => `<span class="tag">${e(x)}</span>`).join("")}</div><div class="note mt">São referências de repertório, não escolhas automáticas. Valide problema, dados, licenças e controles antes de recomendar uma arquitetura.</div>`,
    footer: `<button class="btn" type="button" data-action="close-dialog">Voltar</button><button class="btn primary" type="button" data-action="cap-create" data-id="${c.id}">Estruturar oportunidade ${icon("arrow")}</button>`,
  });
}
const GUIDE = {
  align: {
    title: "Alinhe o contrato da conversa.",
    questions: [
      "Qual decisão este discovery precisa apoiar?",
      "Que resultado está abaixo do esperado?",
      "Quem precisa participar para que a decisão seja executável?",
    ],
    output: "Objetivo, indicador e limites conhecidos.",
    trap: "Não transforme a abertura em uma demonstração de produtos.",
  },
  understand: {
    title: "Escute o trabalho como ele acontece.",
    questions: [
      "Conte a última vez em que o problema aconteceu.",
      "Que tentativa de solução já existe?",
      "O que torna a tarefa difícil, lenta ou arriscada?",
    ],
    output:
      "Necessidade e etapas com evidência ou hipótese claramente marcada.",
    trap: "Não confunda o pedido “precisamos de um agente” com a necessidade.",
  },
  explore: {
    title: "Divergir antes de convergir.",
    questions: [
      "Quais capacidades poderiam mudar esta etapa?",
      "Que outra abordagem resolveria o mesmo problema?",
      "A alternativa sem IA é suficiente?",
    ],
    output: "Casos com problema, hipótese, KPI e fonte de evidência.",
    trap: "Evite decidir o produto antes de entender as restrições.",
  },
  prioritize: {
    title: "Faça os critérios aparecerem.",
    questions: [
      "O que justifica cada nota?",
      "Estamos pontuando impacto ou apenas entusiasmo?",
      "Há um bloqueio que nenhuma nota consegue compensar?",
    ],
    output: "Casos selecionados com justificativas e lacunas conhecidas.",
    trap: "A nota não é uma medida objetiva de retorno nem uma certificação.",
  },
  pilot: {
    title: "Teste a hipótese mais arriscada.",
    questions: [
      "Que resultado faria vocês desistirem da solução?",
      "Qual amostra e comparação tornam o teste confiável?",
      "Quem pode interromper o piloto e voltar ao processo manual?",
    ],
    output:
      "Hipótese, experimento, métricas, responsável e controles documentados.",
    trap: "Não use o piloto como uma implantação sem governança.",
  },
  summary: {
    title: "Feche a sessão com uma decisão.",
    questions: [
      "O cliente aceita a recomendação e as condições?",
      "Quem é responsável pela próxima ação?",
      "Quando vamos revisar a evidência e decidir de novo?",
    ],
    output: "Síntese exportada, responsável e próxima revisão definidos.",
    trap: "Não encerre só com uma lista de ideias.",
  },
};
function openGuide() {
  const g = GUIDE[route] || GUIDE.explore;
  const step = STEPS.find((s) => s.id === route) || STEPS[2];
  openDialog({
    title: g.title,
    kicker: "GUIA DO FACILITADOR · " + step.name.toUpperCase(),
    body: `<div class="card violet"><span class="eyebrow">PERGUNTAS PARA ABRIR A CONVERSA</span><ul class="prompt-list">${g.questions.map((q) => `<li>${e(q)}</li>`).join("")}</ul></div><div class="grid-2 mt"><div class="card cyan"><span class="eyebrow">SAÍDA ESPERADA</span><p>${e(g.output)}</p></div><div class="card magenta"><span class="eyebrow">EVITE O ATALHO</span><p>${e(g.trap)}</p></div></div><p class="helper mt">Tempo sugerido: ${step.minutes} minutos, ajustável. Use o cronômetro como apoio, não como regra. O modo foco amplia a área de trabalho, mas não esconde informações sensíveis.</p><p class="helper mt">Atalhos: Alt + seta para avançar ou voltar, fora dos campos. Todas as ações principais também estão disponíveis por botão. O navegador respeita preferência por movimento reduzido.</p>`,
    footer: `<button class="btn" type="button" data-action="set-timebox" data-minutes="${step.minutes}">${icon("clock")} Usar ${step.minutes} min</button><button class="btn primary" type="button" data-action="close-dialog">Continuar a sessão</button>`,
  });
}
function openExport() {
  openDialog({
    title: "Guarde o contexto. Continue depois.",
    kicker: "EXPORTAÇÃO DA SESSÃO",
    description:
      "Todos os formatos incluem as informações registradas e as notas de facilitação. Revise antes de compartilhar.",
    body: `<div class="export-choices"><button class="export-choice" type="button" data-action="export-html">${icon("file")}<span><strong>HTML com a sessão preenchida</strong><small>Uma cópia completa e interativa. Funciona sozinha, sem instalação ou dependências externas.</small></span></button><button class="export-choice" type="button" data-action="export-json">${icon("download")}<span><strong>Backup dos registros (JSON)</strong><small>Reimporte nesta versão da ferramenta para retomar o trabalho ou manter versões da sessão.</small></span></button><button class="export-choice" type="button" data-action="print">${icon("print")}<span><strong>Síntese para impressão</strong><small>Relatório com casos, decisões e planos. Use “Salvar em PDF” na janela do seu navegador, se desejar.</small></span></button></div><div class="note mt"><strong>Não há envio automático.</strong> Você escolhe onde salvar e com quem compartilhar. Arquivos e rascunhos não são criptografados por esta ferramenta.</div><div class="button-row mt"><button class="btn" type="button" data-action="import">${icon("upload")} Importar um backup</button></div>`,
    footer:
      '<button class="btn" type="button" data-action="close-dialog">Voltar à sessão</button>',
  });
}
function slug(s) {
  return (
    normalize(s)
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 55) || "sessao"
  );
}
function download(data, type, filename) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportJson() {
  download(
    JSON.stringify(
      { ...state, meta: { ...state.meta, snapshot: true } },
      null,
      2,
    ),
    "application/json",
    "NEIVA_AI_Discovery_" + slug(state.session.client) + ".json",
  );
  dirty = false;
  updateHeader();
  toast(
    "Download do backup iniciado. Guarde o arquivo antes de fechar a sessão.",
  );
}
async function localTextAsset(id, path) {
  const inline = document.getElementById(id);
  if (inline) return inline.textContent;
  const response = await fetch(new URL(path, location.href));
  if (!response.ok)
    throw new Error(`Não foi possível incorporar ${path} à exportação.`);
  return response.text();
}
async function localImageAsset(path) {
  const current = document.querySelector("#discoveryApp .brand img")?.src;
  if (current?.startsWith("data:")) return current;
  const response = await fetch(new URL(path, location.href));
  if (!response.ok)
    throw new Error(`Não foi possível incorporar ${path} à exportação.`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(reader.error || new Error("Não foi possível ler o logo local."));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
async function exportHtml() {
  const embedded = { ...state, meta: { ...state.meta, snapshot: true } };
  const snapshot = JSON.stringify(embedded)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
  try {
    const [siteCss, discoveryCss, engine, app, logo] = await Promise.all([
      localTextAsset("neiva-site-css", "../../assets/css/site.css"),
      localTextAsset(
        "neiva-discovery-css",
        "../../assets/css/ai-discovery.css",
      ),
      localTextAsset(
        "neiva-discovery-engine",
        "../../assets/js/ai-discovery-engine.js",
      ),
      localTextAsset("neiva-discovery-app", "../../assets/js/ai-discovery.js"),
      localImageAsset("../../assets/images/logo.png"),
    ]);
    const exportedApp = document.getElementById("discoveryApp").cloneNode(true);
    const exportedDialog = exportedApp.querySelector("#main-dialog");
    if (exportedDialog) {
      exportedDialog.removeAttribute("open");
      exportedDialog.replaceChildren();
    }
    const appBody = exportedApp.outerHTML.replaceAll(
      'src="../../assets/images/logo.png"',
      `src="${logo}"`,
    );
    const theme = document.documentElement.dataset.theme || "light";
    const standalone = `<!doctype html>
<html lang="pt-BR" data-theme="${theme}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <title>NEIVA · AI Discovery Studio</title>
    <style id="neiva-site-css">${siteCss}</style>
    <style id="neiva-discovery-css">${discoveryCss}</style>
    <style>
      #discoveryApp .topbar { inset-block-start: 0; }
      #discoveryApp .sidebar { inset-block-start: var(--discovery-header); }
      #discoveryApp .workspace { min-block-size: calc(100vh - var(--discovery-header)); }
    </style>
  </head>
  <body>
    <script type="application/json" id="session-data">${snapshot}</script>
    ${appBody}
    <script id="neiva-discovery-engine">${engine}</script>
    <script id="neiva-discovery-app">${app}</script>
  </body>
</html>`;
    download(
      standalone,
      "text/html;charset=utf-8",
      "NEIVA_AI_Discovery_" + slug(state.session.client) + ".html",
    );
    dirty = false;
    updateHeader();
    toast(
      "Download da cópia interativa iniciado. Ela inclui os registros e as notas atuais.",
    );
  } catch (error) {
    console.error("NEIVA: não foi possível gerar a cópia interativa.", error);
    toast(
      "Não foi possível gerar a cópia interativa. Exporte o backup JSON ou use a impressão.",
    );
  }
}
function printReport() {
  closeDialog();
  document.getElementById("print-root").innerHTML = reportHtml(true);
  window.print();
}
async function newSession() {
  if (
    hasWork() &&
    !(await askConfirm(
      "Começar uma sessão em branco?",
      "Os registros atuais e o rascunho local serão retirados desta aba. Exporte uma cópia antes de continuar. Arquivos já baixados não serão apagados.",
      "Começar em branco",
    ))
  )
    return;
  clearTimeout(saveTimer);
  state = defaultState();
  dirty = false;
  storageEnabled = false;
  localDraft = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  document.getElementById("restore-banner").hidden = true;
  pilotId = "";
  oppSearch = "";
  closeDialog();
  navigate("align");
  toast("Nova sessão pronta. Nenhum arquivo já exportado foi alterado.");
}
function demoState() {
  const d = defaultState();
  d.meta.demo = true;
  Object.assign(d.session, {
    client: "Cliente demonstrativo",
    area: "Operações de atendimento",
    sponsor: "Papel de liderança — a definir",
    participants: "Negócio · Atendimento · Dados/TI · Segurança",
    objective:
      "Testar se uma busca assistida reduz o tempo de resposta sem piorar a qualidade.",
    metric: "Tempo de preparação de resposta",
    baseline: "18 minutos por solicitação — premissa fictícia, não medida",
    target: "12 minutos em um piloto — meta hipotética a validar",
    constraints:
      "Somente conteúdo sintético na demonstração. Nenhuma ação automática sobre clientes.",
    nextAction:
      "Validar o problema e a linha de base com o responsável pelo processo.",
    decisionNotes:
      "Exemplo para explorar a ferramenta. Não é recomendação de implantação.",
  });
  Object.assign(d.jobs, {
    persona: "Equipe de atendimento",
    context: "chega uma solicitação com informações dispersas",
    task: "encontrar a orientação correta",
    outcome: "responder com clareza e rastreabilidade",
    barrier: "documentos fragmentados e versões diferentes",
    alternative: "busca manual e consulta a colegas",
  });
  const j = {
    id: id(),
    title: "Localizar orientação",
    activity: "Consultar documentos e histórico antes de redigir a resposta.",
    pain: "Demora para identificar a versão vigente.",
    data: "Base de conhecimento e histórico fictícios.",
    evidence: "Hipótese demonstrativa. Ainda não houve entrevista ou medição.",
  };
  d.journey = [j];
  const a = newOpportunity();
  Object.assign(a, {
    title: "Apoiar respostas com fontes confiáveis",
    area: "Atendimento",
    persona: "Equipe de atendimento",
    problem: j.pain,
    hypothesis: "Testar busca assistida com referências e revisão humana.",
    alternative: "Organizar a base e melhorar a busca convencional.",
    kpi: "Tempo de preparação de resposta",
    baseline: "18 min — premissa fictícia",
    target: "12 min — hipótese",
    evidence: "Premissa ilustrativa, sem medição real. Requer validação.",
    dataSources: "Base sintética de perguntas e documentos.",
    owner: "Responsável do processo — a definir",
    journeyId: j.id,
    capability: "knowledge",
    path: "extend",
    risk: "medium",
    riskNotes:
      "Resposta incorreta ou fonte desatualizada. Manter revisão humana.",
    confidence: "low",
    selected: true,
    scores: { impact: 4, human: 4, alignment: 5, feasibility: 4, data: 3 },
  });
  Object.assign(a.pilot, {
    hypothesis:
      "A busca assistida com fontes pode reduzir tempo sem aumentar respostas incorretas.",
    experiment:
      "Comparar a busca assistida com o processo manual em casos equivalentes.",
    sample: "A definir após confirmar acesso autorizado e representatividade.",
    acceptance:
      "Acordar limite de qualidade e tempo com o cliente antes do teste.",
    quality:
      "Verificar aderência à fonte e ocorrência de respostas sem sustentação.",
    fallback:
      "Interromper se houver exposição de dados ou orientação sem evidência.",
    nextAction: "Validar a linha de base e a amostra com o dono do processo.",
  });
  a.gates.data = {
    status: "pending",
    note: "Identificar fonte vigente e proprietário dos dados.",
  };
  a.gates.human = {
    status: "pending",
    note: "Acordar revisão das respostas com a liderança.",
  };
  const b = newOpportunity();
  Object.assign(b, {
    title: "Organizar a base antes de adicionar IA",
    area: "Atendimento",
    persona: "Equipe de atendimento",
    problem: "Conteúdo duplicado e sem indicação da versão vigente.",
    hypothesis: "Padronizar documentos e usar busca convencional.",
    alternative: "A própria proposta é a alternativa sem IA.",
    kpi: "Tempo para localizar documento vigente",
    baseline: "A medir",
    target: "Definir após medir",
    evidence: "Hipótese ilustrativa; validar em entrevistas.",
    dataSources: "Inventário de documentos — a levantar",
    path: "none",
    capability: "noai",
    risk: "low",
    riskNotes: "Revisão de acesso e retenção ainda necessária.",
    confidence: "low",
    scores: { impact: 3, human: 4, alignment: 4, feasibility: 5, data: 3 },
  });
  const c = newOpportunity();
  Object.assign(c, {
    title: "Prever volume de solicitações",
    area: "Planejamento",
    persona: "Responsável pelo processo",
    problem: "Picos de demanda dificultam o planejamento.",
    hypothesis: "Avaliar previsão de volume com dados históricos.",
    capability: "predict",
    path: "build",
  });
  d.opportunities = [a, b, c];
  return d;
}
async function loadDemo() {
  if (
    hasWork() &&
    !(await askConfirm(
      "Abrir o exemplo fictício?",
      "O exemplo substitui os registros atuais nesta aba. Exporte sua sessão antes de continuar.",
      "Abrir exemplo",
    ))
  )
    return;
  state = demoState();
  pilotId = state.opportunities[0].id;
  touch();
  navigate("align");
  toast(
    "Exemplo fictício carregado. Os números são premissas ilustrativas, não resultados reais.",
  );
}
function timerPaint() {
  const now = timerDeadline
    ? Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000))
    : timerRemaining;
  document.getElementById("timer-display").textContent =
    String(Math.floor(now / 60)).padStart(2, "0") +
    ":" +
    String(now % 60).padStart(2, "0");
  document.getElementById("timer-toggle").textContent = timerDeadline
    ? "Pausar"
    : now === 0
      ? "Recomeçar"
      : "Iniciar";
  if (timerDeadline && now === 0) {
    timerDeadline = null;
    timerRemaining = 0;
    clearInterval(timerHandle);
    timerHandle = null;
    document.getElementById("timer-toggle").textContent = "Recomeçar";
    document.getElementById("timer-note").textContent =
      "Timebox concluído. Faça uma síntese antes de avançar.";
    toast(
      "Timebox concluído. Registre o aprendizado e combine o próximo passo.",
    );
  }
}
function timerReset(minutes) {
  if (timerHandle) clearInterval(timerHandle);
  timerHandle = null;
  timerDeadline = null;
  const field = document.getElementById("timer-minutes");
  const m = Math.round(safeNum(minutes ?? field.value, 1, 180, 15));
  field.value = m;
  timerRemaining = m * 60;
  document.getElementById("timer-note").textContent =
    "O tempo continua ao trocar de etapa.";
  timerPaint();
}
function timerToggle() {
  if (timerDeadline) {
    timerRemaining = Math.max(
      0,
      Math.ceil((timerDeadline - Date.now()) / 1000),
    );
    timerDeadline = null;
    clearInterval(timerHandle);
    timerHandle = null;
  } else {
    if (timerRemaining <= 0) timerReset();
    timerDeadline = Date.now() + timerRemaining * 1000;
    timerHandle = setInterval(timerPaint, 250);
  }
  timerPaint();
}
async function doAction(action, el) {
  const oid = el.dataset.id;
  const o = state.opportunities.find((x) => x.id === oid);
  const j = state.journey.find((x) => x.id === oid);
  switch (action) {
    case "menu": {
      const b = document.body.classList.toggle("nav-open");
      document
        .querySelector(".mobile-menu")
        .setAttribute("aria-expanded", String(b));
      break;
    }
    case "menu-close":
      closeMenu();
      break;
    case "motion": {
      const reduced =
        document.documentElement.classList.toggle("reduce-motion");
      document
        .querySelector(".motion-toggle")
        .setAttribute("aria-pressed", String(reduced));
      document
        .querySelector(".motion-toggle")
        .setAttribute(
          "aria-label",
          reduced ? "Restaurar animações" : "Reduzir animações",
        );
      toast(
        reduced
          ? "Animações reduzidas."
          : "Animações seguem a preferência do seu dispositivo.",
      );
      break;
    }
    case "focus": {
      const focus = document.body.classList.toggle("focus-mode");
      document.querySelectorAll(".focus-toggle").forEach((b) => {
        b.setAttribute("aria-pressed", String(focus));
        b.textContent = focus ? "Sair do foco" : "Modo foco";
      });
      closeMenu();
      break;
    }
    case "begin":
      document.getElementById("session-config")?.scrollIntoView({
        behavior:
          document.documentElement.classList.contains("reduce-motion") ||
          matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        block: "center",
      });
      document
        .getElementById("field-session-client")
        ?.focus({ preventScroll: true });
      break;
    case "guide":
      openGuide();
      break;
    case "close-dialog":
      closeDialog();
      break;
    case "export":
      openExport();
      break;
    case "export-html":
      exportHtml();
      break;
    case "export-json":
      exportJson();
      break;
    case "print":
      printReport();
      break;
    case "import":
      document.getElementById("import-file").click();
      break;
    case "new":
      await newSession();
      break;
    case "demo":
      await loadDemo();
      break;
    case "new-journey":
      openJourney();
      break;
    case "edit-journey":
      if (j) openJourney(j);
      break;
    case "delete-journey":
      if (
        j &&
        (await askConfirm(
          "Excluir etapa?",
          "A etapa será removida. Casos de uso vinculados serão mantidos, mas ficarão sem vínculo com esta etapa.",
          "Excluir etapa",
        ))
      ) {
        state.journey = state.journey.filter((x) => x.id !== oid);
        state.opportunities.forEach((x) => {
          if (x.journeyId === oid) x.journeyId = "";
        });
        touch();
        render();
      }
      break;
    case "journey-up":
    case "journey-down": {
      const index = state.journey.findIndex((x) => x.id === oid),
        to = index + (action === "journey-up" ? -1 : 1);
      if (index >= 0 && to >= 0 && to < state.journey.length) {
        [state.journey[index], state.journey[to]] = [
          state.journey[to],
          state.journey[index],
        ];
        touch();
        render();
      }
      break;
    }
    case "journey-opportunity":
      if (j)
        openOpportunity(null, {
          journeyId: j.id,
          problem: j.pain,
          dataSources: j.data,
          evidence: j.evidence,
          area: state.session.area,
          persona: state.jobs.persona,
        });
      break;
    case "new-opportunity":
      openOpportunity();
      break;
    case "edit-opportunity":
      if (o) openOpportunity(o);
      break;
    case "select":
      if (o) {
        o.selected = !o.selected;
        touch();
        if (route === "prioritize") refreshPriority();
        else render();
        toast(
          o.selected
            ? "Caso selecionado para detalhar. Isso não aprova o piloto."
            : "Caso retirado da seleção. Seu registro foi mantido.",
        );
      }
      break;
    case "delete-opportunity":
      if (
        o &&
        (await askConfirm(
          "Excluir caso de uso?",
          `“${o.title}” e seu plano de experimento serão removidos desta sessão. Exporte antes se precisar guardar uma cópia.`,
          "Excluir caso",
        ))
      ) {
        state.opportunities = state.opportunities.filter((x) => x.id !== oid);
        touch();
        render();
        toast("Caso removido da sessão.");
      }
      break;
    case "duplicate":
      if (o) {
        if (state.opportunities.length >= 200) {
          toast("Limite desta sessão: 200 casos.");
          break;
        }
        const c = newOpportunity();
        for (const k of OPP_FIELDS) c[k] = o[k];
        c.title = o.title + " — alternativa";
        c.capability = o.capability;
        c.journeyId = o.journeyId;
        c.path = "unknown";
        c.riskNotes = "";
        state.opportunities.push(c);
        touch();
        render();
        toast(
          "Cópia criada sem notas de avaliação, controles ou aprovações herdadas.",
        );
        openOpportunity(c);
      }
      break;
    case "explore-tab":
      exploreTab =
        el.dataset.tab === "capabilities" ? "capabilities" : "opportunities";
      render();
      break;
    case "capability":
      openCapability(oid);
      break;
    case "cap-create": {
      const c = CAPABILITIES.find((x) => x.id === oid);
      if (c)
        openOpportunity(null, {
          capability: c.id,
          hypothesis: c.idea,
          path: c.id === "noai" ? "none" : "unknown",
        });
      break;
    }
    case "eco-opportunity": {
      const c = ECOSYSTEM.find((x) => x.id === oid);
      if (c) openOpportunity(null, { capability: c.cap });
      break;
    }
    case "eco-filter":
      ecoFilter = el.dataset.value;
      render();
      break;
    case "reset-weights":
      state.weights = defaultState().weights;
      touch();
      render();
      toast("Pesos iniciais restaurados.");
      break;
    case "pilot-select":
      pilotId = oid;
      render();
      break;
    case "refresh-summary":
      refreshSummary();
      toast("Prévia atualizada com os registros desta sessão.");
      break;
    case "timer-toggle":
      timerToggle();
      break;
    case "timer-reset":
      timerReset();
      break;
    case "set-timebox":
      timerReset(Number(el.dataset.minutes));
      closeDialog();
      toast("Timebox ajustado. Inicie quando a atividade começar.");
      break;
    case "restore":
      if (
        localDraft &&
        (await askConfirm(
          "Restaurar o rascunho local?",
          "O rascunho substituirá os registros desta aba. Nenhum arquivo no disco será alterado.",
          "Restaurar",
        ))
      ) {
        state = localDraft;
        storageEnabled = true;
        storageHealthy = true;
        dirty = false;
        document.getElementById("restore-banner").hidden = true;
        localDraft = null;
        navigate("align");
        toast(
          "Rascunho restaurado. Exporte uma cópia para guardar o trabalho.",
        );
      }
      break;
    case "discard-draft":
      if (
        await askConfirm(
          "Apagar o rascunho deste navegador?",
          "Essa ação remove apenas o rascunho local, não arquivos exportados.",
          "Apagar rascunho",
        )
      ) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
        localDraft = null;
        document.getElementById("restore-banner").hidden = true;
        toast("Rascunho local descartado.");
      }
      break;
  }
}
document.addEventListener("click", (event) => {
  const el = event.target.closest("[data-action],[data-route]");
  if (!el || el.disabled) return;
  if (el.dataset.route) {
    event.preventDefault();
    navigate(el.dataset.route);
    return;
  }
  if (el.dataset.action) {
    event.preventDefault();
    doAction(el.dataset.action, el).catch(() =>
      toast(
        "Não foi possível concluir esta ação. Os registros atuais foram mantidos. Exporte uma cópia.",
      ),
    );
  }
});
document.addEventListener("input", (event) => {
  const t = event.target;
  if (t.dataset.bind) {
    const [area, key] = t.dataset.bind.split(".");
    if (
      (area === "session" && SESSION_FIELDS.includes(key)) ||
      (area === "jobs" && JOB_FIELDS.includes(key))
    ) {
      state[area][key] = t.value.slice(0, 5000);
      touch();
      if (area === "jobs") {
        const el = document.getElementById("jtbd-sentence");
        if (el) el.innerHTML = jtbdText();
      }
    }
  }
  if (t.dataset.score) {
    const k = t.dataset.score;
    const el = document.getElementById("score-out-" + k);
    if (el) el.textContent = Number(t.value) === 0 ? "—" : t.value + "/5";
  }
  if (t.dataset.weight) {
    const k = t.dataset.weight;
    if (!SCORES.some((s) => s.id === k)) return;
    const val = Math.round(safeNum(t.value, 0, 100));
    const total = Object.entries(state.weights).reduce(
      (n, [key, v]) => n + (key === k ? val : v),
      0,
    );
    if (total === 0) {
      t.value = state.weights[k];
      toast("Mantenha pelo menos um peso maior que zero.");
      return;
    }
    state.weights[k] = val;
    document.getElementById("weight-out-" + k).textContent = val;
    document.getElementById("weight-total").textContent =
      "Soma dos pesos: " + total;
    touch();
    refreshPriority();
  }
  if (t.dataset.pilot) {
    const o = state.opportunities.find((x) => x.id === t.dataset.id);
    if (o && PILOT_FIELDS.includes(t.dataset.pilot)) {
      o.pilot[t.dataset.pilot] = t.value.slice(0, 5000);
      touch();
      refreshGate();
    }
  }
  if (t.dataset.gateNote) {
    const o = state.opportunities.find((x) => x.id === t.dataset.id);
    if (o && GATES.some((g) => g.id === t.dataset.gateNote)) {
      o.gates[t.dataset.gateNote].note = t.value.slice(0, 5000);
      touch();
      refreshGate();
    }
  }
  if (t.id === "opportunity-search") {
    oppSearch = t.value;
    document.getElementById("opportunity-list").innerHTML = filteredOpps();
  }
  if (t.id === "capability-search") {
    capFilter = t.value;
    document.getElementById("capability-grid").innerHTML = capCards();
  }
  if (t.id === "ecosystem-search") {
    ecoSearch = t.value;
    document.getElementById("ecosystem-grid").innerHTML =
      renderEcosystemCards();
  }
  if (t.closest("#opportunity-form,#journey-form") && t.setCustomValidity)
    t.setCustomValidity("");
});
document.addEventListener("change", (event) => {
  const t = event.target;
  if (t.dataset.gate) {
    const o = state.opportunities.find((x) => x.id === t.dataset.id);
    if (
      o &&
      GATES.some((g) => g.id === t.dataset.gate) &&
      Object.hasOwn(GATE_STATUS, t.value)
    ) {
      o.gates[t.dataset.gate].status = t.value;
      touch();
      refreshGate();
    }
  }
  if (t.id === "decision-select" && Object.hasOwn(DECISIONS, t.value)) {
    state.decision = t.value;
    touch();
    refreshSummary();
  }
  if (t.id === "timer-minutes") timerReset();
  if (t.id === "local-save") {
    storageEnabled = t.checked;
    storageHealthy = true;
    if (storageEnabled) {
      persist();
      toast(
        storageHealthy
          ? "Rascunho ativado apenas neste navegador. Exporte também uma cópia."
          : "Use a exportação para guardar sua sessão.",
      );
    } else {
      clearTimeout(saveTimer);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      toast(
        "Rascunho local desativado. Os dados continuam nesta aba até você fechá-la.",
      );
    }
    updateHeader();
  }
  if (t.dataset.bind && route === "summary") refreshSummary();
});
document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!["opportunity-form", "journey-form"].includes(form.id)) return;
  event.preventDefault();
  const data = new FormData(form);
  for (const name of form.id === "opportunity-form"
    ? ["title", "problem"]
    : ["title"]) {
    const field = form.elements.namedItem(name);
    field.setCustomValidity(
      String(data.get(name) || "").trim()
        ? ""
        : "Preencha este campo com uma descrição.",
    );
  }
  if (!form.reportValidity()) return;
  if (form.id === "journey-form") {
    const current = state.journey.find((j) => j.id === journeyDraftId);
    const j = { id: current?.id || id() };
    for (const key of ["title", "activity", "pain", "data", "evidence"])
      j[key] = String(data.get(key) || "")
        .trim()
        .slice(0, 5000);
    if (current) state.journey[state.journey.indexOf(current)] = j;
    else state.journey.push(j);
    touch();
    closeDialog();
    render();
    toast("Etapa registrada. Você pode conectá-la a uma oportunidade.");
  } else {
    const o = opportunityDraft;
    for (const key of OPP_FIELDS)
      o[key] = String(data.get(key) || "")
        .trim()
        .slice(0, 5000);
    for (const key of ["capability", "journeyId", "path", "risk", "confidence"])
      o[key] = String(data.get(key) || "");
    for (const s of SCORES)
      o.scores[s.id] = Math.round(safeNum(data.get("score-" + s.id), 0, 5));
    const i = state.opportunities.findIndex((x) => x.id === o.id);
    if (i >= 0) state.opportunities[i] = o;
    else state.opportunities.push(o);
    touch();
    closeDialog();
    render();
    toast(
      score(o) === null
        ? "Caso registrado. Complete notas, confiança e evidência para calcular a pontuação."
        : "Caso registrado. Pontuação atualizada com os critérios desta sessão.",
    );
    opportunityDraft = null;
  }
});
document
  .getElementById("import-file")
  .addEventListener("change", async (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast("O backup ultrapassa o limite de 2 MB desta ferramenta.");
      return;
    }
    let candidate;
    try {
      candidate = sanitize(JSON.parse(await file.text()));
    } catch (error) {
      toast(
        error instanceof SyntaxError
          ? "O arquivo não contém um backup JSON válido."
          : error.message ||
              "Backup inválido. A sessão atual não foi alterada.",
      );
      return;
    }
    if (
      !(await askConfirm(
        "Importar esta sessão?",
        `Serão carregados ${candidate.opportunities.length} casos e ${candidate.journey.length} etapas de “${candidate.session.client || "sessão sem nome"}”. Os registros atuais desta aba serão substituídos.`,
        "Importar sessão",
      ))
    )
      return;
    state = candidate;
    pilotId = "";
    oppSearch = "";
    touch();
    closeDialog();
    navigate("align");
    toast("Sessão importada. Revise os registros antes de compartilhar.");
  });
document
  .getElementById("confirm-cancel")
  .addEventListener("click", () => finishConfirm(false));
document
  .getElementById("confirm-accept")
  .addEventListener("click", () => finishConfirm(true));
document
  .getElementById("confirm-dialog")
  .addEventListener("cancel", (event) => {
    event.preventDefault();
    finishConfirm(false);
  });
document.getElementById("main-dialog").addEventListener("close", () => {
  if (dialogReturn?.isConnected) dialogReturn.focus({ preventScroll: true });
});
document.addEventListener("keydown", (event) => {
  if (
    event.altKey &&
    ["ArrowRight", "ArrowLeft"].includes(event.key) &&
    !event.target.closest("input,textarea,select,[contenteditable=true]") &&
    !document.querySelector("dialog[open]")
  ) {
    const i = STEPS.findIndex((s) => s.id === route);
    const n = i + (event.key === "ArrowRight" ? 1 : -1);
    if (i >= 0 && n >= 0 && n < STEPS.length) {
      event.preventDefault();
      navigate(STEPS[n].id);
    }
  }
  if (event.key === "Escape") closeMenu();
});
window.addEventListener("beforeprint", () => {
  document.getElementById("print-root").innerHTML = reportHtml(true);
});
window.addEventListener("beforeunload", (event) => {
  if (storageEnabled) persist();
  if (dirty && (!storageEnabled || !storageHealthy)) {
    event.preventDefault();
    event.returnValue = "";
  }
});
function boot() {
  let snapshot = false;
  try {
    const raw = JSON.parse(document.getElementById("session-data").textContent);
    if (raw) {
      state = sanitize(raw);
      snapshot = true;
    }
  } catch {
    toast(
      "A sessão incorporada não pôde ser lida. A ferramenta abriu em branco; preserve a cópia original.",
    );
  }
  if (!snapshot) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) localDraft = sanitize(JSON.parse(raw));
    } catch {
      localDraft = null;
    }
  }
  renderNav();
  render();
  timerPaint();
  if (localDraft) {
    const b = document.getElementById("restore-banner");
    b.hidden = false;
    b.className = "notice";
    b.innerHTML = `<div class="button-row"><div class="grow"><strong>Há um rascunho neste navegador.</strong><p class="helper">${e(localDraft.session.client || "Sessão sem nome")} · os dados não são carregados sem sua escolha.</p></div><button class="btn small primary" data-action="restore">Restaurar</button><button class="btn small" data-action="discard-draft">Descartar rascunho</button></div>`;
  }
}
boot();
