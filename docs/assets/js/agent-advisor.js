/* ---------- LOGO: cole aqui o símbolo oficial (data URI base64 ou URL) ---------- */
const LOGO_SRC = "../../assets/images/logo.png"; // símbolo oficial NEIVA (embutido)
const PLATFORM_ICON_ROOT = new URL(
  "../../assets/images/microsoft/",
  window.location.href,
);
const PLATFORM_ICON_ASSETS = Object.freeze({
  m365_copilot: "m365-copilot.svg",
  cowork: "copilot-cowork.png",
  scout: "microsoft-scout.png",
  agent_builder: "agent-builder.png",
  copilot_studio: "copilot-studio.svg",
  foundry: "ai-foundry.png",
  sharepoint_agents: "sharepoint.png",
  agents_toolkit: "agent-framework.png",
  github_copilot: "github-copilot.png",
  agent_365: "agent365.svg",
});

function renderLogos() {
  document.querySelectorAll("[data-logo]").forEach((el) => {
    const dark = el.closest(".on-dark");
    const word =
      '<span class="wordmark">NEIVA<small>Cloud Solutions</small></span>';
    if (LOGO_SRC) {
      const img = `<img src="${LOGO_SRC}" alt="${dark ? "NEIVA Cloud Solutions" : ""}" width="40" height="40">`;
      el.innerHTML = dark
        ? `<span class="logo-seal">${img}</span>`
        : img + word; // fundo claro: original; escuro: selo branco
    } else {
      el.innerHTML =
        (dark
          ? '<span class="logo-seal"><span class="logo-mark" aria-hidden="true">N</span></span>'
          : '<span class="logo-mark" aria-hidden="true">N</span>') +
        (dark ? "" : word);
    }
  });
}

/* ---------- Dados do catálogo ---------- */
const CAT = {
  m365_copilot: {
    name: "Microsoft 365 Copilot",
    kind: "usar",
    color: "c-indigo",
    bar: "#1E3A8A",
    status: "Disponível",
    tag: "Respostas, rascunhos e insights com chat de IA e agentes integrados como Researcher, Analyst, Facilitator e Interpreter.",
    ideal: [
      "Rascunhar, revisar e resumir documentos, e-mails e reuniões",
      "Pesquisa profunda com o Researcher e análise de dados com o Analyst",
      "Trabalhar turno a turno, mantendo você no controle",
    ],
    evite: [
      "Entregar a tarefa inteira e voltar só para o resultado",
      "Trabalho que precisa rodar sozinho por agenda ou gatilho",
    ],
    quem: "Usuários do Microsoft 365",
    link: "https://learn.microsoft.com/microsoft-365/copilot/microsoft-365-copilot-overview",
    kw: "chat researcher analyst rascunho resumo",
  },
  cowork: {
    name: "Copilot Cowork",
    kind: "usar",
    color: "c-violet",
    bar: "#6030C0",
    status: "Disponível",
    tag: "Delegue trabalho de várias etapas no Microsoft 365: ele monta um plano, executa em segundo plano com checkpoints e pode rodar por agenda ou gatilho.",
    ideal: [
      "Pacote de preparação de reunião: briefing, análise e apresentação",
      "Briefings recorrentes e triagem agendada da caixa de entrada",
      "“Quando um cliente VIP me escrever…”: gatilhos dentro do M365",
    ],
    evite: [
      "Ações no desktop, navegador ou arquivos locais (veja Scout)",
      "Iterar turno a turno (use o Copilot Chat)",
    ],
    quem: "Contas corporativas ou de estudante do Microsoft 365 (GA); contas pessoais em preview",
    link: "https://learn.microsoft.com/pt-br/microsoft-365/copilot/cowork/",
    kw: "delegar agenda gatilho recorrente plano",
  },
  scout: {
    name: "Microsoft Scout",
    kind: "usar",
    color: "c-cyan",
    bar: "#10A0C0",
    status: "Frontier · Preview",
    tag: "Autopilot pessoal sempre ativo, com identidade própria no Entra, que acompanha suas prioridades e age no M365, desktop, navegador, arquivos locais e servidores MCP.",
    ideal: [
      "Acompanhamento contínuo de entregas e riscos",
      "Coordenação de agenda e preparação proativa",
      "Trabalho que cruza Microsoft 365 e o ambiente local",
    ],
    evite: [
      "Automação corporativa de processos de negócio (use Copilot Studio)",
      "Tenants sem Frontier, política no Intune e licença GitHub Copilot Business/Enterprise",
    ],
    quem: "Usuário final no Windows ou macOS, com habilitação do administrador",
    link: "https://learn.microsoft.com/en-us/microsoft-scout/overview",
    kw: "autopilot sempre ativo desktop navegador local mcp",
  },
  agent_builder: {
    name: "Agent Builder",
    kind: "construir",
    color: "c-cyan",
    bar: "#10A0C0",
    status: "Disponível",
    tag: "Crie agentes declarativos dentro do Microsoft 365 Copilot descrevendo o que você quer em linguagem natural, sem código.",
    ideal: [
      "Assistente de conhecimento para um time pequeno",
      "Q&A sobre SharePoint, OneDrive, web, arquivos e conectores do Copilot",
      "Prototipar rápido sem depender de TI",
    ],
    evite: [
      "Usuários externos, app próprio ou execução em segundo plano",
      "Ações que atualizam sistemas, Dataverse/APIs ou RAG próprio",
    ],
    quem: "Usuário de negócio e especialista",
    link: "https://learn.microsoft.com/microsoft-365/copilot/extensibility/agent-builder",
    kw: "sem código no-code declarativo time pequeno",
  },
  copilot_studio: {
    name: "Copilot Studio",
    kind: "construir",
    color: "",
    bar: "#2563EB",
    status: "Disponível",
    tag: "Agentes corporativos low-code e governados: ferramentas, workflows, gatilhos, multiagentes, uso de computador, avaliação, monitoramento e publicação em vários canais.",
    ideal: [
      "Processos com ações, aprovações e Dataverse/conectores/MCP",
      "Público interno amplo ou externo (site, Teams, canais)",
      "Agentes autônomos disparados por eventos",
    ],
    evite: [
      "Quando a engenharia precisa ser dona do runtime, rede, identidade e retrieval (use Foundry)",
    ],
    quem: "Makers low-code e TI; desenvolvedores via VS Code e YAML",
    link: "https://learn.microsoft.com/microsoft-copilot-studio/",
    kw: "low-code workflow conectores dataverse mcp multiagente externo",
  },
  foundry: {
    name: "Microsoft Foundry",
    kind: "construir",
    color: "c-violet",
    bar: "#6030C0",
    status: "Disponível",
    tag: "Plataforma pro-code com runtime gerenciado: modelos de vários provedores, agentes hospedados, ferramentas, memória, identidade, observabilidade e escala Azure.",
    ideal: [
      "App, site ou serviço próprio com endpoint estável",
      "RAG personalizado com Azure AI Search ou Foundry IQ",
      "Rede privada, tracing, avaliação e controle total do runtime",
    ],
    evite: [
      "Times sem capacidade de engenharia",
      "Q&A simples dentro do M365 (o Agent Builder resolve)",
    ],
    quem: "Desenvolvedores e cientistas de dados",
    link: "https://learn.microsoft.com/azure/foundry/",
    kw: "pro-code sdk rag azure ai search endpoint modelos",
  },
  sharepoint_agents: {
    name: "SharePoint agents",
    kind: "adjacente",
    color: "c-cyan",
    bar: "#10A0C0",
    status: "Adjacente",
    tag: "Agentes escopados em um site ou biblioteca do SharePoint, sem código, usados no SharePoint, no Teams e no M365 Copilot.",
    ideal: ["Q&A sobre políticas, manuais ou uma biblioteca de projeto"],
    evite: ["Quando o conhecimento está espalhado em muitas fontes"],
    quem: "Donos de sites e usuários de negócio",
    link: "https://support.microsoft.com/office/get-started-with-sharepoint-agents-69e2faf9-2c1e-4baa-8305-23e625021bcf",
    kw: "sharepoint site biblioteca sem código",
  },
  agents_toolkit: {
    name: "Microsoft 365 Agents Toolkit",
    kind: "adjacente",
    color: "",
    bar: "#2563EB",
    status: "Adjacente",
    tag: "Caminho pro-code para agentes declarativos com plugins de API, Adaptive Cards e CI/CD, mantendo o orquestrador do M365 Copilot.",
    ideal: [
      "Desenvolvedor estendendo o M365 Copilot com APIs",
      "Ciclo de vida com versionamento e pipeline",
    ],
    evite: ["Quando você precisa do seu próprio orquestrador (use Foundry)"],
    quem: "Desenvolvedores profissionais",
    link: "https://learn.microsoft.com/microsoftteams/platform/toolkit/overview-agents-toolkit",
    kw: "vs code api plugin adaptive cards ci/cd declarativo",
  },
  github_copilot: {
    name: "GitHub Copilot",
    kind: "adjacente",
    color: "c-indigo",
    bar: "#1E3A8A",
    status: "Adjacente",
    tag: "Agente de código no VS Code e no GitHub que acelera quem desenvolve agentes em Foundry, Agents Toolkit ou YAML do Copilot Studio. A licença também é pré-requisito do Scout.",
    ideal: [
      "Gerar, testar e revisar o código do agente",
      "Automatizar tarefas de engenharia com o agente de código",
    ],
    evite: ["Usuários de negócio sem fluxo de desenvolvimento"],
    quem: "Desenvolvedores",
    link: "https://docs.github.com/copilot",
    kw: "código desenvolvimento vs code github",
  },
  agent_365: {
    name: "Microsoft Agent 365",
    kind: "adjacente",
    color: "c-magenta",
    bar: "#EC4899",
    status: "Governança",
    tag: "Plano de controle para registrar, governar e monitorar agentes de qualquer plataforma, com identidade Entra Agent ID e políticas do Purview.",
    ideal: [
      "Inventário e governança de todos os agentes do tenant",
      "Auditoria, permissões e ciclo de vida",
    ],
    evite: ["Não é lugar para construir agentes, e sim para governá-los"],
    quem: "TI, segurança e governança",
    link: "https://learn.microsoft.com/microsoft-agent-365/overview",
    kw: "governança entra identidade purview segurança auditoria",
  },
};

/* ---------- Perguntas ---------- */
const QUESTIONS = {
  q1: {
    phase: 1,
    eyebrow: "Definir · Quem constrói",
    title: "Quem vai construir o agente?",
    help: "O nível de código de quem constrói é o primeiro filtro.",
    opts: [
      [
        "q1a",
        "Usuário de negócio / especialista",
        "Sem código: descrevo o que preciso em linguagem natural.",
      ],
      [
        "q1b",
        "Maker low-code / profissional de TI",
        "Monto fluxos, conectores e regras visualmente.",
      ],
      [
        "q1c",
        "Desenvolvedor profissional",
        "Escrevo código, uso SDKs, VS Code e pipelines.",
      ],
      [
        "q1d",
        "Cientista de dados / engenheiro de ML",
        "Escolho modelos, avalio, ajusto retrieval.",
      ],
    ],
  },
  q8: {
    phase: 1,
    eyebrow: "Definir · Quem usa",
    title: "Quem vai usar o agente?",
    help: "O público define alcance, governança e onde dá para publicar.",
    opts: [
      ["q8a", "Eu ou um time interno pequeno", ""],
      ["q8c", "Um departamento ou público interno amplo", ""],
      [
        "q8b",
        "Usuários externos",
        "Clientes, parceiros ou fornecedores.",
        "Elimina Agent Builder",
      ],
      ["q8d", "Ainda não definido", ""],
    ],
  },
  q2: {
    phase: 2,
    eyebrow: "Desenvolver · Canal",
    title: "Onde as pessoas vão interagir com o agente?",
    help: "O canal é uma restrição dura: nem toda plataforma publica em todo lugar.",
    opts: [
      [
        "q2a",
        "No chat do Microsoft 365 Copilot (e Teams)",
        "Fica no orquestrador e nos modelos do M365 Copilot.",
      ],
      [
        "q2b",
        "Em um app próprio (site ou mobile)",
        "Endpoints, modelos ou runtime sob seu controle.",
        "Elimina Agent Builder",
      ],
      [
        "q2c",
        "Em segundo plano, por eventos",
        "Sem conversa: dispara por gatilho, alerta ou mudança de dado.",
        "Elimina Agent Builder",
      ],
      ["q2d", "Em vários canais / ainda não definido", ""],
    ],
  },
  q4: {
    phase: 2,
    eyebrow: "Desenvolver · O trabalho",
    title: "Que trabalho o agente precisa fazer?",
    help: "A complexidade da tarefa é o critério que mais diferencia as plataformas.",
    opts: [
      ["q4a", "Perguntas e respostas / consultas simples", ""],
      ["q4b", "Conversa com várias etapas (multi-turno)", ""],
      [
        "q4e",
        "Criar ou analisar conteúdo no Copilot",
        "Documentos, apresentações, planilhas.",
      ],
      [
        "q4c",
        "Tarefas de várias etapas com ações",
        "Atualizar registros, enviar formulários, agir em sistemas.",
        "Elimina Agent Builder",
      ],
      [
        "q4d",
        "Fluxos complexos",
        "Vários agentes ou processos de longa duração.",
        "Elimina Agent Builder",
      ],
    ],
  },
  q3: {
    phase: 2,
    eyebrow: "Desenvolver · Os dados",
    title: "Que informação o agente precisa acessar?",
    help: "As fontes de conhecimento definem integração e arquitetura de retrieval.",
    opts: [
      [
        "q3a",
        "Conteúdo do Microsoft 365",
        "SharePoint, OneDrive, e-mail, Teams.",
      ],
      ["q3b", "Sistemas de negócio via conectores do Copilot", ""],
      [
        "q3c",
        "Dataverse, conectores personalizados ou APIs de negócio",
        "",
        "Elimina Agent Builder",
      ],
      ["q3d", "Microsoft 365 + sistemas via conectores", ""],
      ["q3e", "Sites públicos ou arquivos enviados", ""],
      [
        "q3f",
        "RAG próprio / Azure AI Search / índices privados / Foundry IQ",
        "",
        "Elimina Agent Builder",
      ],
    ],
  },
  q9: {
    phase: 2,
    eyebrow: "Desenvolver · Desempate",
    title: "Quem precisa operar o runtime do agente?",
    help: "Copilot Studio e Foundry ficaram a até 2 pontos. Esta resposta decide sem alterar a pontuação.",
    opts: [
      [
        "q9a",
        "A Microsoft gerencia",
        "Runtime, sandbox, ferramentas e governança da Power Platform.",
      ],
      [
        "q9d",
        "A engenharia é dona do runtime",
        "Código, framework, endpoints, rede, identidade, memória ou retrieval.",
        "Elimina Builder e Studio",
      ],
    ],
  },
  u1: {
    phase: 1,
    eyebrow: "Definir · Seu envolvimento",
    title: "Quanto você quer se envolver no trabalho?",
    help: "Essa é a bifurcação principal entre trabalhar junto e delegar.",
    opts: [
      [
        "interactive",
        "Quero trabalhar junto, passo a passo",
        "Pergunto, ajusto e conduzo o resultado.",
      ],
      [
        "delegate",
        "Quero entregar a tarefa inteira",
        "Recebo o resultado pronto e só reviso.",
      ],
    ],
    tip: "Padrão comum: fique no Copilot Chat para rascunhos e perguntas, e entregue o trabalho completo ao Cowork quando quiser voltar só para o resultado.",
  },
  u2: {
    phase: 1,
    eyebrow: "Definir · Tipo de tarefa",
    title: "Que tipo de tarefa é?",
    help: "Define por onde você começa dentro do Microsoft 365 Copilot.",
    opts: [
      [
        "general",
        "Ajuda geral",
        "Brainstorm, buscar informação, colocar e-mails e reuniões em dia, rascunhar e editar.",
      ],
      [
        "specialized",
        "Trabalho especializado e interativo",
        "Pesquisa profunda, análise de dados, facilitação de reunião ou tradução.",
      ],
    ],
  },
  u3: {
    phase: 2,
    eyebrow: "Desenvolver · Cadência",
    title: "Como o trabalho deve rodar?",
    help: "Pontual, recorrente ou contínuo muda o tipo de agente.",
    opts: [
      [
        "oneshot",
        "Entrega pontual",
        "Um trabalho de várias etapas que volta pronto.",
      ],
      [
        "recurring",
        "Recorrente ou por gatilho",
        "Agenda, gatilhos de e-mail/Teams, briefings que se repetem.",
      ],
      [
        "alwayson",
        "Autopilot pessoal sempre ativo",
        "Monitoramento proativo e acompanhamento ao longo do tempo.",
      ],
      ["unsure", "Ainda não sei", ""],
    ],
  },
  u4: {
    phase: 2,
    eyebrow: "Desenvolver · Alcance",
    title: "Até onde o agente precisa alcançar?",
    help: "O alcance é o critério principal entre Cowork e Scout.",
    opts: [
      ["m365", "Dentro do Microsoft 365", "E-mail, reuniões, arquivos, Teams."],
      [
        "cross",
        "Microsoft 365 + meu computador",
        "Desktop, navegador, arquivos locais e linha de comando.",
      ],
      ["unsure", "Ainda não sei", ""],
    ],
  },
};
const PHASES = ["Descobrir", "Definir", "Desenvolver", "Entregar"];

/* ---------- Estado ---------- */
const S = {
  path: null,
  i: 0,
  ans: {},
  use: {},
  jtbd: { when: "", want: "", so: "" },
  dir: 1,
};

function steps() {
  if (S.path === "build") {
    const s = ["jtbd", "q1", "q8", "q2", "q4", "q3"];
    if (S.ans.q9 || needsQ9(S.ans)) s.push("q9");
    s.push("result");
    return s;
  }
  const s = ["jtbd", "u1"];
  if (S.use.u1 === "interactive") s.push("u2");
  else if (S.use.u1 === "delegate") s.push("u3", "u4");
  else s.push("u2");
  s.push("result");
  return s;
}
const phaseOf = (id) =>
  id === "jtbd" ? 0 : id === "result" ? 3 : QUESTIONS[id].phase;
const valOf = (id) => (S.path === "build" ? S.ans : S.use)[id];

/* ---------- Double Diamond SVG ---------- */
function ddSVG(id, phase, big) {
  const lbl = big
    ? PHASES.map(
        (p, i) =>
          `<text class="lbl${i <= phase ? " on" : ""}" x="${57 + i * 95}" y="${big ? 132 : 0}" text-anchor="middle">${p}</text>`,
      ).join("")
    : "";
  const w = phase < 0 ? 0 : [105, 200, 295, 390][phase];
  return `<svg viewBox="0 0 400 ${big ? 140 : 120}" role="img" aria-label="Double Diamond: fase ${phase >= 0 ? PHASES[phase] : "inicial"}">
   <defs><linearGradient id="ddGrad${id}" x1="0" x2="1"><stop offset="0" stop-color="#10A0C0"/><stop offset=".5" stop-color="#2563EB"/><stop offset="1" stop-color="#6030C0"/></linearGradient>
   <linearGradient id="ddGrad"><stop offset="0" stop-color="#10A0C0"/><stop offset=".5" stop-color="#2563EB"/><stop offset="1" stop-color="#6030C0"/></linearGradient>
   <clipPath id="ddClip${id}"><rect class="fillband" x="0" y="0" height="120" width="${w}"/></clipPath></defs>
   <g opacity=".12"><path d="M10 60 L105 10 L200 60 L105 110 Z M200 60 L295 10 L390 60 L295 110 Z" fill="url(#ddGrad${id})"/></g>
   <g clip-path="url(#ddClip${id})" opacity=".28"><path d="M10 60 L105 10 L200 60 L105 110 Z M200 60 L295 10 L390 60 L295 110 Z" fill="url(#ddGrad${id})"/></g>
   <path class="shape" fill="none" d="M10 60 L105 10 L200 60 L105 110 Z" style="stroke:url(#ddGrad${id})"/>
   <path class="shape s2" fill="none" d="M200 60 L295 10 L390 60 L295 110 Z" style="stroke:url(#ddGrad${id})"/>
   ${[10, 105, 200, 295, 390].map((x, k) => `<circle class="node" cx="${x}" cy="60" r="6" style="animation-delay:${0.3 + k * 0.25}s"/>`).join("")}
   <line x1="105" y1="10" x2="105" y2="110" stroke="#DCE3F5" stroke-dasharray="3 4"/><line x1="295" y1="10" x2="295" y2="110" stroke="#DCE3F5" stroke-dasharray="3 4"/>
   ${lbl}</svg>`;
}

/* ---------- Render: wizard ---------- */
const host = document.getElementById("stepHost");
function start(path) {
  if (path === "explore") {
    document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
    return;
  }
  S.path = path;
  S.i = 0;
  S.ans = {};
  S.use = {};
  S.dir = 1;
  const w = document.getElementById("wizard");
  w.classList.add("on");
  render();
  w.scrollIntoView({ behavior: "smooth" });
}
function render() {
  const st = steps();
  if (S.i >= st.length) S.i = st.length - 1;
  const id = st[S.i],
    ph = phaseOf(id);
  document.getElementById("progBar").style.width =
    (S.i / (st.length - 1)) * 100 + "%";
  document.getElementById("wizPath").innerHTML =
    `${S.path === "build" ? "Construir um agente" : "Usar um agente"} · Fase <b>${PHASES[ph]}</b> · Passo ${Math.min(S.i + 1, st.length - 1)}/${st.length - 1}`;
  host.innerHTML = "";
  const box = document.createElement("div");
  box.className = "step" + (S.dir < 0 ? " back" : "");
  if (id === "jtbd") box.innerHTML = jtbdHTML();
  else if (id === "result")
    box.innerHTML = S.path === "build" ? buildResultHTML() : useResultHTML();
  else box.innerHTML = questionHTML(id);
  host.appendChild(box);
  wireStep(id);
  renderAside(ph);
  updateHash();
  if (id === "result") animateResult();
}
function questionHTML(id) {
  const q = QUESTIONS[id],
    v = valOf(id);
  const two =
    q.opts.length <= 4 &&
    q.opts.every((o) => !o[2] || o[2].length < 70) &&
    id !== "q4" &&
    id !== "q3";
  return `<span class="eyebrow">${q.eyebrow}</span><h2 tabindex="-1">${q.title}</h2><p class="help">${q.help}</p>
   <div class="opts${two ? " two" : ""}" role="radiogroup" aria-label="${q.title}">
   ${q.opts
     .map(
       (
         o,
         k,
       ) => `<button class="opt" role="radio" aria-checked="${v === o[0]}" data-v="${o[0]}" data-k="${k + 1}">
      <span class="radio" aria-hidden="true"></span><span><b>${o[1]}</b>${o[2] ? `<small>${o[2]}</small>` : ""}${o[3] ? `<span class="zap">${o[3]}</span>` : ""}</span></button>`,
     )
     .join("")}
   </div>${q.tip ? `<div class="tip"><b>Dica</b>${q.tip}</div>` : ""}
   ${navHTML(!!v)}`;
}
function navHTML(canNext) {
  return `<div class="wiz-nav"><button class="btn btn-ghost btn-sm" data-nav="back">← Voltar</button>
    <span class="kbd-hint">Atalho: teclas 1–6 para escolher · Enter para avançar</span>
    <button class="btn btn-primary btn-sm" data-nav="next" ${canNext ? "" : "disabled"}>${S.i === steps().length - 2 ? "Ver recomendação" : "Avançar"} →</button></div>`;
}
const SUG = {
  when: [
    "tenho reuniões com clientes",
    "um processo se repete toda semana",
    "recebo muitas solicitações internas",
    "preciso consultar políticas e manuais",
  ],
  want: [
    "um agente que prepare o material",
    "automatizar a triagem",
    "responder perguntas com nossas fontes",
    "executar ações em sistemas",
  ],
  so: [
    "ganhar tempo para o cliente",
    "reduzir erros e retrabalho",
    "escalar sem aumentar o time",
    "decidir com dados confiáveis",
  ],
};
function jtbdHTML() {
  const f = (
    k,
    l,
    ph,
  ) => `<div><label for="j_${k}">${l}</label><input id="j_${k}" data-j="${k}" value="${esc(S.jtbd[k])}" placeholder="${ph}" maxlength="120">
    <div class="chips">${SUG[k].map((s) => `<button type="button" class="chip${S.jtbd[k] === s ? " on" : ""}" data-chip="${k}">${s}</button>`).join("")}</div></div>`;
  return `<span class="eyebrow">Descobrir · Jobs-to-be-Done</span><h2 tabindex="-1">Qual trabalho você quer resolver?</h2>
   <p class="help">Comece pelo resultado, não pela ferramenta. Este passo é opcional, mas deixa a recomendação e o relatório mais úteis.</p>
   <div class="jtbd">${f("when", "Quando…", "descreva a situação")}${f("want", "Eu quero…", "o que o agente deve fazer")}${f("so", "Para…", "o resultado esperado")}
   <div class="jtbd-preview" id="jPrev">${jtbdSentence()}</div></div>${navHTML(true)}`;
}
function jtbdSentence() {
  const j = S.jtbd;
  if (!j.when && !j.want && !j.so)
    return "Seu trabalho a ser feito aparecerá aqui.";
  return `Quando <em>${esc(j.when) || "…"}</em>, eu quero <em>${esc(j.want) || "…"}</em>, para <em>${esc(j.so) || "…"}</em>.`;
}
function esc(s) {
  return (s || "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

function wireStep(id) {
  host
    .querySelectorAll("[data-nav]")
    .forEach(
      (b) => (b.onclick = () => (b.dataset.nav === "next" ? next() : back())),
    );
  const h = host.querySelector("h2");
  if (h) h.focus({ preventScroll: true });
  if (id === "jtbd") {
    host.querySelectorAll("[data-j]").forEach(
      (inp) =>
        (inp.oninput = () => {
          S.jtbd[inp.dataset.j] = inp.value;
          document.getElementById("jPrev").innerHTML = jtbdSentence();
          host
            .querySelectorAll(`[data-chip="${inp.dataset.j}"]`)
            .forEach((c) =>
              c.classList.toggle("on", c.textContent === inp.value),
            );
        }),
    );
    host.querySelectorAll("[data-chip]").forEach(
      (c) =>
        (c.onclick = () => {
          const k = c.dataset.chip;
          S.jtbd[k] = c.textContent;
          host.querySelector(`#j_${k}`).value = c.textContent;
          host
            .querySelectorAll(`[data-chip="${k}"]`)
            .forEach((x) => x.classList.toggle("on", x === c));
          document.getElementById("jPrev").innerHTML = jtbdSentence();
        }),
    );
  }
  host
    .querySelectorAll(".opt")
    .forEach((b) => (b.onclick = () => choose(id, b.dataset.v)));
  if (id === "result") wireResult();
}
let autoT;
function choose(id, v) {
  const bag = S.path === "build" ? S.ans : S.use;
  bag[id] = v;
  if (
    S.path === "build" &&
    id !== "q9" &&
    S.ans.q9 &&
    !needsQ9({ ...S.ans, q9: undefined })
  )
    delete S.ans.q9;
  if (S.path === "use" && id === "u1") {
    delete S.use.u2;
    delete S.use.u3;
    delete S.use.u4;
  }
  host
    .querySelectorAll(".opt")
    .forEach((b) => b.setAttribute("aria-checked", b.dataset.v === v));
  const nb = host.querySelector('[data-nav="next"]');
  if (nb) {
    nb.disabled = false;
    nb.innerHTML =
      (S.i === steps().length - 2 ? "Ver recomendação" : "Avançar") + " →";
  }
  renderAside(phaseOf(id));
  updateHash();
  clearTimeout(autoT);
  autoT = setTimeout(next, 480);
}
function next() {
  clearTimeout(autoT);
  const st = steps();
  const id = st[S.i];
  if (id !== "jtbd" && id !== "result" && !valOf(id)) return;
  if (S.i < st.length - 1) {
    S.i++;
    S.dir = 1;
    render();
  }
}
function back() {
  clearTimeout(autoT);
  if (S.i > 0) {
    S.i--;
    S.dir = -1;
    render();
  } else {
    document.getElementById("wizard").classList.remove("on");
    document.getElementById("start").scrollIntoView({ behavior: "smooth" });
  }
}

document.addEventListener("keydown", (e) => {
  if (!document.getElementById("wizard").classList.contains("on")) return;
  if (e.target.tagName === "INPUT") {
    if (e.key === "Enter") {
      e.preventDefault();
      next();
    }
    return;
  }
  if (document.getElementById("modal").classList.contains("on")) return;
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= 6) {
    const o = host.querySelector(`.opt[data-k="${n}"]`);
    if (o) {
      o.click();
    }
  }
  if (e.key === "Enter" && e.target.closest && !e.target.closest("button"))
    next();
});

/* ---------- Aside: placar ao vivo / rota ---------- */
function renderAside(ph) {
  const a = document.getElementById("aside");
  let html = `<div class="card c-violet"><span class="tag">Sua jornada</span><div class="mini-dd dd">${ddSVG("m", ph, true)}</div></div>`;
  if (S.path === "build") {
    const { score, zeroed } = computeScores(S.ans);
    html += `<div class="card"><span class="tag">Placar ao vivo</span><h4>Pontuação por plataforma (0–15)</h4>
      ${BUILD.map(
        (
          p,
        ) => `<div class="bar-row${zeroed[p] ? " zero" : ""}"><div class="top"><span class="nm">${ico(p, 20)}${CAT[p].name}</span><span>${score[p]}/15</span></div>
      <div class="bar"><i style="width:${(score[p] / 15) * 100}%;background:${CAT[p].bar}"></i></div><div class="why">✕ ${zeroed[p] || ""}</div></div>`,
      ).join("")}
      <p style="font-size:.8rem;color:var(--advisor-muted)">Atualiza a cada resposta. Regras eliminatórias zeram a plataforma.</p></div>`;
  } else {
    const u = S.use,
      lab = {
        interactive: "Trabalhar junto",
        delegate: "Delegar",
        general: "Ajuda geral",
        specialized: "Especializado",
        oneshot: "Entrega pontual",
        recurring: "Recorrente/gatilho",
        alwayson: "Sempre ativo",
        unsure: "Ainda não sei",
        m365: "Dentro do M365",
        cross: "M365 + computador",
      };
    const items = [["Envolvimento", u.u1]];
    if (u.u1 === "interactive") items.push(["Tipo de tarefa", u.u2]);
    else items.push(["Cadência", u.u3], ["Alcance", u.u4]);
    html += `<div class="card c-cyan"><span class="tag">Rota de decisão</span><ul class="route">${items.map(([k, v]) => `<li class="${v ? "done" : ""}"><span><b>${k}:</b> ${v ? lab[v] : "—"}</span></li>`).join("")}</ul></div>`;
  }
  a.innerHTML = html;
}

/* ---------- Resultado: construir ---------- */
const NEXT = {
  agent_builder: {
    steps: [
      "Abra o Microsoft 365 Copilot e selecione Criar agente.",
      "Descreva em linguagem natural o trabalho do agente (use sua frase JTBD).",
      "Adicione as fontes de conhecimento: sites do SharePoint, arquivos, web e conectores.",
      "Teste com 10 perguntas reais do time e ajuste as instruções.",
      "Compartilhe com o time e colete feedback em uma semana.",
    ],
  },
  copilot_studio: {
    steps: [
      "Acesse o Copilot Studio e crie o agente descrevendo o objetivo.",
      "Comece pelo ponto de partida recomendado abaixo.",
      "Conecte ferramentas: conectores, Dataverse, servidores MCP ou fluxos de agente.",
      "Crie um conjunto de avaliação e rode antes de publicar.",
      "Publique nos canais e registre o agente no Agent 365 para governança.",
    ],
  },
  foundry: {
    steps: [
      "Crie um projeto no Microsoft Foundry e escolha o modelo no catálogo.",
      "Instale o Foundry Toolkit no VS Code e gere o agente a partir de um template.",
      "Rode localmente, conecte ferramentas (Toolboxes) e a fonte de retrieval.",
      "Publique como agente hospedado no Foundry Agent Service com tracing e avaliação.",
      "Publique no Microsoft 365 Copilot e no Teams, se o público estiver lá.",
    ],
    code: `<span class="c"># Foundry Toolkit no VS Code ou Azure Developer CLI</span>\nmkdir meu-agente &amp;&amp; cd meu-agente\nazd ai agent init -m &lt;manifesto-do-template&gt; --advisor-src src/agente`,
  },
  m365_copilot: { steps: [] },
  cowork: {
    steps: [
      "Confirme com o admin que o Cowork está habilitado no tenant e como funciona a cobrança por uso.",
      "Abra o Cowork em m365.cloud.microsoft, no app Microsoft Copilot (Windows, Mac) ou no celular e descreva o resultado final que você quer.",
      "Revise o plano proposto antes de liberar a execução.",
      "Acompanhe os checkpoints e ajuste no meio do caminho.",
      "Para trabalho recorrente, configure agenda ou gatilho.",
    ],
  },
  scout: {
    steps: [
      "Confirme os pré-requisitos com o admin: Frontier, política no Intune e licença GitHub Copilot Business ou Enterprise.",
      "Instale o Scout no Windows ou macOS e conecte Teams, Outlook, OneDrive e SharePoint.",
      "Defina prioridades e limites: o que ele pode fazer sozinho e o que pede aprovação.",
      "Conecte recursos locais ou servidores MCP apenas se necessário.",
      "Revise semanalmente as ações registradas na identidade do agente.",
    ],
  },
};
const ANS_LABEL = (id) => {
  const q = QUESTIONS[id];
  const v = valOf(id);
  const o = q && q.opts.find((x) => x[0] === v);
  return o ? o[1] : "—";
};

function buildResultHTML() {
  const R = buildResult(S.ans),
    W = CAT[R.win];
  const why = [];
  why.push(`Quem constrói: <b>${ANS_LABEL("q1")}</b>.`);
  why.push(
    `Público: <b>${ANS_LABEL("q8")}</b>; canal: <b>${ANS_LABEL("q2")}</b>.`,
  );
  why.push(
    `Trabalho: <b>${ANS_LABEL("q4")}</b>; dados: <b>${ANS_LABEL("q3")}</b>.`,
  );
  if (S.ans.q9) why.push(`Runtime: <b>${ANS_LABEL("q9")}</b>.`);
  if (S.ans.q1 === "q1d")
    why.push(
      "Perfil de dados/ML: Copilot Studio é preferido ao Agent Builder (seleção de modelos, avaliações, Foundry IQ).",
    );
  const pv = (s) => (/Frontier|Preview/.test(s) ? "pv" : "status");
  const rows = SCORED_Q.map((q) => {
    const v = S.ans[q];
    const sc = SCORES[v] || [0, 0, 0];
    return `<tr><td>${QUESTIONS[q].title.replace("?", "")}</td>${BUILD.map((p, i) => `<td>${sc[i]}</td>`).join("")}</tr>`;
  }).join("");
  const { raw } = computeScores(S.ans);
  return `<div class="res-hero on-dark">
     <div class="row"><div><span class="eyebrow">Entregar · Recomendação NEIVA</span>
     <h2 class="with-ico"><span class="pico-tile">${ico(R.win, 40)}</span><span>${W.name}</span></h2><p>${W.tag}</p></div><span class="logo" data-logo="dark" aria-label="NEIVA Cloud Solutions"></span></div>
     <div class="pair"><span class="badge fit">${R.label} · <span class="count" data-to="${R.score[R.win]}">0</span>/15</span>
     <span class="badge ${pv(W.status)}">${W.status}</span>
     ${R.isPair ? `<span class="plus">+</span><span class="badge fit">Par complementar: ${CAT[R.second].name}</span>` : ""}</div>
   </div>
   ${S.jtbd.want ? `<div class="jtbd-preview" style="margin-top:16px"><b style="font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--advisor-violet)">Seu trabalho a ser feito</b><br>${jtbdSentence()}</div>` : ""}
   <div class="res-grid">
     <div class="card ${W.color}"><span class="tag">Por que esta plataforma</span><ul class="list">${why.map((w) => `<li>${w}</li>`).join("")}</ul></div>
     <div class="card c-indigo"><span class="tag">Placar transparente</span>
       ${R.order
         .map(
           (
             p,
           ) => `<div class="bar-row${R.zeroed[p] ? " zero" : ""}"><div class="top"><span class="nm">${ico(p, 20)}${CAT[p].name}${p === R.win ? " ★" : ""}</span><span><span class="count" data-to="${R.score[p]}">0</span>/15 · ${fitLabel(R.score[p])}</span></div>
       <div class="bar"><i data-w="${(R.score[p] / 15) * 100}" style="background:${CAT[p].bar}"></i></div><div class="why">✕ Eliminado: ${R.zeroed[p] || ""}</div></div>`,
         )
         .join("")}
       <details class="how"><summary>Veja como pontuamos</summary>
         <table class="score-table"><thead><tr><th>Pergunta</th><th>Builder</th><th>Studio</th><th>Foundry</th></tr></thead><tbody>${rows}</tbody>
         <tfoot><tr><td>Total bruto</td>${BUILD.map((p) => `<td class="${R.zeroed[p] ? "z" : ""}">${R.zeroed[p] ? "0 ✕" : raw[p]}</td>`).join("")}</tr></tfoot></table></details>
     </div>
     ${R.start ? `<div class="card full"><span class="tag">Ponto de partida no Copilot Studio</span><h3>${R.start.n}</h3><p>${R.start.d}</p></div>` : ""}
     ${R.secondViable && !R.isPair ? `<div class="card ${CAT[R.second].color} full"><div class="cat-head">${ico(R.second, 36)}<div><span class="tag">Considere também</span><h3>${CAT[R.second].name} · ${R.score[R.second]}/15</h3></div></div><p>${CAT[R.second].tag}</p></div>` : ""}
     ${R.isPair ? `<div class="card ${CAT[R.second].color} full"><span class="tag">Par complementar</span><h3>${W.name} + ${CAT[R.second].name}</h3><p>${pairText(R.win, R.second)}</p></div>` : ""}
     <div class="card c-violet full"><span class="tag">Próximos passos</span>${checklist(NEXT[R.win].steps)}
       ${NEXT[R.win].code ? `<pre class="code">${NEXT[R.win].code}</pre>` : ""}
       <p style="margin-top:12px">Documentação oficial: <a href="${W.link}" target="_blank" rel="noopener">${W.name} no Microsoft Learn ↗</a> · Governança: <a href="${CAT.agent_365.link}" target="_blank" rel="noopener">Agent 365 ↗</a></p></div>
     ${R.callouts.length ? `<div class="full" style="display:grid;gap:12px">${R.callouts.map((c) => `<div class="card ${CAT[c.id].color}"><div class="cat-head">${ico(c.id, 36)}<div><span class="tag">Caminho adjacente</span><h3>${c.t}</h3></div></div><p>${c.d} <a href="${CAT[c.id].link}" target="_blank" rel="noopener">Saiba mais ↗</a></p></div>`).join("")}</div>` : ""}
     ${R.notes.length ? `<div class="full">${R.notes.map((n) => `<div class="note"><b>Atenção</b>${n}</div>`).join("")}</div>` : ""}
   </div>${resultActions()}`;
}
function pairText(a, b) {
  const k = [a, b].sort().join("|");
  return k === "copilot_studio|foundry"
    ? "Copilot Studio para o harness de raciocínio gerenciado pela Microsoft e a governança da Power Platform; Foundry para runtime, endpoints, rede, identidade, memória e retrieval sob controle da engenharia."
    : "Agent Builder para assistentes de conhecimento rápidos e sem código no M365; Copilot Studio para ações, governança, público amplo e publicação em vários canais.";
}
function checklist(arr) {
  return `<ul class="check">${arr.map((s, i) => `<li><label><input type="checkbox" data-ck="${i}"><span>${s}</span></label></li>`).join("")}</ul>`;
}
function resultActions() {
  return `<div class="res-actions">
    <button class="btn btn-primary btn-sm" data-act="md">⬇ Baixar Markdown</button>
    <button class="btn btn-ghost btn-sm" data-act="print">🖨 Imprimir / PDF</button>
    <button class="btn btn-ghost btn-sm" data-act="link">🔗 Copiar link do resultado</button>
    <button class="btn btn-ghost btn-sm" data-act="back">← Revisar respostas</button>
    <button class="btn btn-ghost btn-sm" data-act="restart">↺ Recomeçar</button></div>`;
}

/* ---------- Resultado: usar ---------- */
function useResultHTML() {
  const R = resolveUse(S.use),
    d = R.dest;
  const main = CAT[d[0]];
  let startHTML = "";
  if (d[0] === "m365_copilot") {
    startHTML =
      R.start === "agents"
        ? `<div class="card full"><span class="tag">Comece aqui</span><h3>Agentes integrados</h3><p>Use o <b>Researcher</b> para pesquisa profunda com fontes, o <b>Analyst</b> para análise de dados, o <b>Facilitator</b> em reuniões e o <b>Interpreter</b> para tradução. Prefere receber um pacote de pesquisa pronto? Delegue ao Cowork.</p></div>`
        : `<div class="card full"><span class="tag">Comece aqui</span><h3>Copilot Chat</h3><p>Escreva prompts com <b>objetivo, contexto, fonte e formato</b>. Ex.: “Resuma as decisões das reuniões desta semana com o cliente X em 5 tópicos e liste pendências com responsáveis.”</p></div>`;
  }
  const steps =
    d[0] === "m365_copilot"
      ? R.start === "agents"
        ? [
            "Abra o Microsoft 365 Copilot e acesse Agentes.",
            "Escolha Researcher ou Analyst conforme a tarefa.",
            "Informe objetivo, fontes e formato da entrega.",
            "Revise as fontes citadas antes de compartilhar.",
          ]
        : [
            "Abra o Microsoft 365 Copilot (app, Teams ou Outlook).",
            "Use sua frase JTBD como primeiro prompt.",
            "Itere: peça ajustes de tom, formato e profundidade.",
            "Salve os prompts que funcionaram para reutilizar.",
          ]
      : NEXT[d[0]].steps;
  const both = d.length > 1;
  return `<div class="res-hero on-dark"><div class="row"><div><span class="eyebrow">Entregar · Recomendação NEIVA</span>
     <h2 class="with-ico">${d.map((x) => `<span class="pico-tile">${ico(x, 40)}</span>`).join("")}<span>${both ? "Copilot Cowork + Microsoft Scout" : main.name}</span></h2>
     <p>${both ? "Ainda falta definir cadência ou alcance. Cowork e Scout se complementam: Cowork executa tarefas que você define dentro do M365; Scout mantém o trabalho andando em segundo plano, também no seu computador." : main.tag}</p></div>
     <span class="logo" data-logo="dark" aria-label="NEIVA Cloud Solutions"></span></div>
     <div class="pair">${d.map((x) => `<span class="badge ${/Frontier|Preview/.test(CAT[x].status) ? "pv" : "fit"}">${CAT[x].name} · ${CAT[x].status}</span>`).join("")}</div></div>
   ${S.jtbd.want ? `<div class="jtbd-preview" style="margin-top:16px"><b style="font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--advisor-violet)">Seu trabalho a ser feito</b><br>${jtbdSentence()}</div>` : ""}
   <div class="res-grid">
     ${startHTML}
     ${d
       .map(
         (
           x,
         ) => `<div class="card ${CAT[x].color}"><div class="cat-head">${ico(x, 36)}<div><span class="tag">Ideal para</span><h3>${CAT[x].name}</h3></div></div><ul class="list">${CAT[x].ideal.map((i) => `<li>${i}</li>`).join("")}</ul></div>
       <div class="card c-magenta"><span class="tag">Evite quando</span><ul class="list">${CAT[x].evite.map((i) => `<li>${i}</li>`).join("")}</ul><p style="margin-top:10px;font-size:.9rem;color:var(--advisor-muted)">Para quem: ${CAT[x].quem}</p></div>`,
       )
       .join("")}
     <div class="card c-violet full"><span class="tag">Próximos passos</span>${checklist(both ? [...NEXT.cowork.steps.slice(0, 2), ...NEXT.scout.steps.slice(0, 1), "Defina cadência e alcance e refaça o diagnóstico para decidir."] : steps)}
       <p style="margin-top:12px">Documentação: ${d.map((x) => `<a href="${CAT[x].link}" target="_blank" rel="noopener">${CAT[x].name} ↗</a>`).join(" · ")}</p></div>
     <div class="card c-indigo full"><span class="tag">Precisa de algo sob medida?</span><h3>Quer construir o seu próprio agente?</h3><p>Se nenhum agente pronto cobre o processo, faça o diagnóstico de construção e compare Agent Builder, Copilot Studio e Foundry.</p>
       <button class="btn btn-primary btn-sm" style="margin-top:12px" data-act="tobuild">Fazer diagnóstico de construção →</button></div>
   </div>${resultActions()}`;
}

/* ---------- Ações do resultado ---------- */
function wireResult() {
  renderLogos();
  host.querySelectorAll("[data-act]").forEach(
    (b) =>
      (b.onclick = () => {
        const a = b.dataset.act;
        if (a === "md") downloadMD();
        else if (a === "print") window.print();
        else if (a === "link") {
          updateHash();
          copy(location.href);
        } else if (a === "back") back();
        else if (a === "restart") restart();
        else if (a === "tobuild") {
          const j = { ...S.jtbd };
          start("build");
          S.jtbd = j;
          render();
        }
      }),
  );
}
function animateResult() {
  requestAnimationFrame(() =>
    setTimeout(() => {
      host
        .querySelectorAll(".bar i[data-w]")
        .forEach((i) => (i.style.width = i.dataset.w + "%"));
      host.querySelectorAll(".count").forEach((c) => {
        const to = +c.dataset.to;
        let n = 0;
        const t = setInterval(() => {
          n++;
          c.textContent = Math.min(n, to);
          if (n >= to) clearInterval(t);
        }, 60);
        if (!to) c.textContent = 0;
      });
    }, 120),
  );
}
function restart() {
  S.ans = {};
  S.use = {};
  S.jtbd = { when: "", want: "", so: "" };
  history.replaceState(null, "", location.pathname);
  document.getElementById("wizard").classList.remove("on");
  document.getElementById("start").scrollIntoView({ behavior: "smooth" });
}
document.getElementById("restartTop").onclick = restart;

function downloadMD() {
  const L = [];
  const d = new Date().toLocaleDateString("pt-BR");
  L.push(
    "# Recomendação de agentes · NEIVA Cloud Solutions",
    "",
    `_Gerado em ${d} com o NEIVA Agent Advisor (Double Diamond + JTBD)._`,
    "",
  );
  if (S.jtbd.want || S.jtbd.when)
    L.push(
      "## Trabalho a ser feito",
      `Quando ${S.jtbd.when || "…"}, eu quero ${S.jtbd.want || "…"}, para ${S.jtbd.so || "…"}.`,
      "",
    );
  if (S.path === "build") {
    const R = buildResult(S.ans);
    L.push(
      `## Recomendação: ${CAT[R.win].name}`,
      `**${R.label}** · ${R.score[R.win]}/15${R.isPair ? ` · Par complementar com ${CAT[R.second].name}` : ""}`,
      "",
      CAT[R.win].tag,
      "",
    );
    L.push("## Respostas");
    [...SCORED_Q, ...(S.ans.q9 ? ["q9"] : [])].forEach((q) =>
      L.push(`- **${QUESTIONS[q].title}** ${ANS_LABEL(q)}`),
    );
    L.push("");
    L.push(
      "## Placar",
      "| Plataforma | Pontos | Faixa | Observação |",
      "|---|---|---|---|",
    );
    R.order.forEach((p) =>
      L.push(
        `| ${CAT[p].name} | ${R.score[p]}/15 | ${fitLabel(R.score[p])} | ${R.zeroed[p] ? "Eliminado: " + R.zeroed[p] : ""} |`,
      ),
    );
    L.push("");
    if (R.start)
      L.push(`## Ponto de partida`, `**${R.start.n}** — ${R.start.d}`, "");
    if (R.callouts.length) {
      L.push("## Caminhos adjacentes");
      R.callouts.forEach((c) => L.push(`- **${c.t}:** ${c.d}`));
      L.push("");
    }
    if (R.notes.length) {
      L.push("## Atenção");
      R.notes.forEach((n) => L.push(`- ${n}`));
      L.push("");
    }
    L.push("## Próximos passos");
    NEXT[R.win].steps.forEach((s) => L.push(`- [ ] ${s}`));
    L.push("", `Documentação: ${CAT[R.win].link}`);
  } else {
    const R = resolveUse(S.use);
    L.push(
      `## Recomendação: ${R.dest.map((x) => CAT[x].name).join(" + ")}`,
      "",
    );
    R.dest.forEach((x) => {
      L.push(
        `### ${CAT[x].name} (${CAT[x].status})`,
        CAT[x].tag,
        "",
        "**Ideal para:**",
      );
      CAT[x].ideal.forEach((i) => L.push(`- ${i}`));
      L.push("", `Documentação: ${CAT[x].link}`, "");
    });
    if (R.start)
      L.push(
        `**Comece por:** ${R.start === "agents" ? "Agentes integrados (Researcher, Analyst, Facilitator, Interpreter)" : "Copilot Chat"}`,
        "",
      );
  }
  L.push(
    "",
    "---",
    "**Transformando complexidade em conhecimento.**",
    "[www.neivacloudsolutions.com](https://www.neivacloudsolutions.com/)",
  );
  const blob = new Blob([L.join("\n")], {
    type: "text/markdown;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "recomendacao-agentes-neiva.md";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  toast("Relatório em Markdown baixado.");
}

/* ---------- Link compartilhável (validado por pergunta) ---------- */
function updateHash() {
  if (!S.path) return;
  const p = new URLSearchParams({ p: S.path });
  const bag = S.path === "build" ? S.ans : S.use;
  Object.entries(bag).forEach(([k, v]) => v && p.set(k, v));
  const st = steps();
  if (st[S.i] === "result") p.set("r", "1");
  history.replaceState(null, "", "#" + p.toString());
}
function loadHash() {
  if (!location.hash.includes("p=")) return;
  const p = new URLSearchParams(location.hash.slice(1));
  const path = p.get("p");
  if (!["build", "use"].includes(path)) return;
  S.path = path;
  const bag = path === "build" ? S.ans : S.use;
  Object.keys(QUESTIONS).forEach((q) => {
    const v = p.get(q);
    if (
      v &&
      QUESTIONS[q].opts.some((o) => o[0] === v) &&
      (path === "build" ? q.startsWith("q") : q.startsWith("u"))
    )
      bag[q] = v;
  });
  if (path === "build" && S.ans.q9 && !needsQ9({ ...S.ans, q9: undefined }))
    delete S.ans.q9;
  const st = steps();
  const done = st.every((id) => id === "jtbd" || id === "result" || valOf(id));
  S.i =
    p.get("r") === "1" && done
      ? st.length - 1
      : Math.max(
          1,
          st.findIndex((id) => id !== "jtbd" && id !== "result" && !valOf(id)),
        );
  document.getElementById("wizard").classList.add("on");
  render();
  setTimeout(() => document.getElementById("wizard").scrollIntoView(), 50);
}

/* ---------- Catálogo ---------- */
function renderCatalog() {
  const g = document.getElementById("catGrid");
  const kindLbl = {
    usar: "Usar agentes",
    construir: "Construir agentes",
    adjacente: "Adjacente",
  };
  g.innerHTML = Object.entries(CAT)
    .map(
      (
        [id, c],
        k,
      ) => `<button class="card ${c.color} cat-card reveal" data-id="${id}" data-kind="${c.kind}" style="transition-delay:${k * 40}ms">
     <div class="cat-head">${ico(id, 40)}<div><span class="tag">${c.status === "Governança" ? "Governança" : kindLbl[c.kind]}</span><h3>${c.name}</h3></div></div><p>${c.tag}</p>
     <div class="foot"><span>Ver detalhes →</span><span class="badge ${/Frontier|Preview/.test(c.status) ? "pv" : "status"}">${c.status}</span></div></button>`,
    )
    .join("");
  g.querySelectorAll(".cat-card").forEach(
    (b) => (b.onclick = () => openModal(b.dataset.id)),
  );
}
let catF = "all";
function filterCatalog() {
  const q = document.getElementById("catSearch").value.toLowerCase().trim();
  let n = 0;
  document.querySelectorAll(".cat-card").forEach((c) => {
    const d = CAT[c.dataset.id];
    const txt = (
      d.name +
      " " +
      d.tag +
      " " +
      d.kw +
      " " +
      d.ideal.join(" ")
    ).toLowerCase();
    const ok = (catF === "all" || d.kind === catF) && (!q || txt.includes(q));
    c.classList.toggle("hide", !ok);
    if (ok) {
      n++;
      c.classList.add("in");
    }
  });
  document.getElementById("catEmpty").style.display = n ? "none" : "block";
}
document.querySelectorAll(".filters button").forEach(
  (b) =>
    (b.onclick = () => {
      catF = b.dataset.f;
      document
        .querySelectorAll(".filters button")
        .forEach((x) => x.setAttribute("aria-pressed", x === b));
      filterCatalog();
    }),
);
document.getElementById("catSearch").oninput = filterCatalog;

let lastFocus;
function openModal(id) {
  const c = CAT[id],
    m = document.getElementById("modal"),
    b = document.getElementById("mBox");
  lastFocus = document.activeElement;
  const border = {
    "c-cyan": "#10A0C0",
    "c-violet": "#6030C0",
    "c-indigo": "#1E3A8A",
    "c-magenta": "#EC4899",
    "": "#2563EB",
  }[c.color];
  b.style.borderLeftColor = border;
  b.innerHTML = `<button class="x" aria-label="Fechar">✕</button><div class="cat-head">${ico(id, 48)}<div><span class="eyebrow">${c.status}</span><h3 id="mTitle" style="font-size:1.5rem;margin:2px 0 0">${c.name}</h3></div></div><p>${c.tag}</p>
   <h4>Ideal para</h4><ul class="list">${c.ideal.map((i) => `<li>${i}</li>`).join("")}</ul>
   <h4>Evite quando</h4><ul class="list">${c.evite.map((i) => `<li>${i}</li>`).join("")}</ul>
   <h4>Para quem</h4><p>${c.quem}</p>
   <div class="res-actions"><a class="btn btn-primary btn-sm" href="${c.link}" target="_blank" rel="noopener">Documentação oficial ↗</a>
   ${c.kind !== "adjacente" ? `<button class="btn btn-ghost btn-sm" data-go="${c.kind === "usar" ? "use" : "build"}">Fazer o diagnóstico →</button>` : ""}</div>`;
  m.classList.add("on");
  b.querySelector(".x").focus();
  b.querySelector(".x").onclick = closeModal;
  const go = b.querySelector("[data-go]");
  if (go)
    go.onclick = () => {
      closeModal();
      start(go.dataset.go);
    };
}
function closeModal() {
  document.getElementById("modal").classList.remove("on");
  if (lastFocus) lastFocus.focus();
}
document.getElementById("modal").onclick = (e) => {
  if (e.target.id === "modal") closeModal();
};
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* ---------- Utilidades ---------- */
function toast(t) {
  const el = document.getElementById("toast");
  el.textContent = t;
  el.classList.add("on");
  setTimeout(() => el.classList.remove("on"), 2400);
}
function copy(t) {
  (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject())
    .then(() => toast("Link copiado."))
    .catch(() => {
      const ta = document.createElement("textarea");
      ta.value = t;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        toast("Link copiado.");
      } catch (e) {
        toast("Copie o endereço da barra do navegador.");
      }
      ta.remove();
    });
}

/* ---------- Init ---------- */
document.getElementById("heroDD").innerHTML = ddSVG("h", -1, true).replace(
  /class="lbl on"/g,
  'class="lbl"',
);
document
  .querySelectorAll("[data-path]")
  .forEach((b) => (b.onclick = () => start(b.dataset.path)));
const mb = document.getElementById("menuBtn"),
  nav = document.getElementById("nav");
mb.onclick = () => {
  const o = nav.classList.toggle("open");
  mb.setAttribute("aria-expanded", o);
};
nav
  .querySelectorAll("a")
  .forEach((a) => (a.onclick = () => nav.classList.remove("open")));
renderLogos();
renderCatalog();
document.querySelectorAll("[data-icons]").forEach(
  (el) =>
    (el.innerHTML = el.dataset.icons
      .split(",")
      .map((i) => `<span class="pico-tile sm">${ico(i, 30)}</span>`)
      .join("")),
);
const io =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          }),
        { threshold: 0.12 },
      )
    : null;
document
  .querySelectorAll(".reveal")
  .forEach((el) => (io ? io.observe(el) : el.classList.add("in")));
loadHash();

function ico(id, s) {
  const size = Number.isFinite(Number(s)) ? Number(s) : 32;
  const asset = PLATFORM_ICON_ASSETS[id];
  if (asset)
    return `<img class="pico advisor-platform-icon" src="${new URL(asset, PLATFORM_ICON_ROOT).href}" alt="" width="${size}" height="${size}">`;
  const glyphs = {
    m365_copilot: '<path d="M5 5h14v10H9l-4 4V5Z"/><path d="M8 9h8M8 12h5"/>',
    cowork: '<path d="M4 5h16v10H8l-4 4V5Z"/><path d="m9 10 2 2 4-4"/>',
    scout:
      '<circle cx="12" cy="12" r="8"/><path d="m12 8 2.5 4L12 16l-2.5-4L12 8Z"/>',
    agent_builder: '<path d="M5 4h14v16H5z"/><path d="M8 9h8M8 13h5"/>',
    copilot_studio:
      '<path d="M4 7h16v10H4z"/><path d="M8 7V4h8v3M8 17v3h8v-3"/>',
    foundry: '<path d="M6 20 4 9h16l-2 11H6Z"/><path d="M8 9V4h8v5M9 14h6"/>',
    github_copilot: '<path d="M5 6h14v12H5z"/><path d="m8 10 2 2-2 2m5 0h3"/>',
    agent_365:
      '<circle cx="9" cy="9" r="3"/><circle cx="16" cy="10" r="2"/><path d="M4 20v-2a5 5 0 0 1 10 0v2M14 20v-2a4 4 0 0 1 4-3"/>',
  };
  const paths =
    glyphs[id] || '<circle cx="12" cy="12" r="8"/><path d="M8 12h8M12 8v8"/>';
  return (
    '<svg class="pico advisor-platform-icon" viewBox="0 0 24 24" width="' +
    size +
    '" height="' +
    size +
    '" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    paths +
    "</svg>"
  );
}
