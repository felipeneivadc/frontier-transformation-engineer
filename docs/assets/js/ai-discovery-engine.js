"use strict";

const APP_VERSION = "neiva.ai-discovery.v1";
const STORAGE_KEY = "neiva-ai-discovery-v1";
const STEPS = [
  {
    id: "align",
    name: "Alinhar",
    short: "Contexto e resultado",
    phase: "DESCOBRIR",
    minutes: 15,
  },
  {
    id: "understand",
    name: "Compreender",
    short: "Pessoas e processo",
    phase: "DESCOBRIR / DEFINIR",
    minutes: 30,
  },
  {
    id: "explore",
    name: "Explorar",
    short: "Capacidades e hipóteses",
    phase: "DESENVOLVER",
    minutes: 30,
  },
  {
    id: "prioritize",
    name: "Priorizar",
    short: "Valor, viabilidade e risco",
    phase: "CONVERGIR",
    minutes: 25,
  },
  {
    id: "pilot",
    name: "Preparar piloto",
    short: "Experimento e controles",
    phase: "VALIDAR",
    minutes: 30,
  },
  {
    id: "summary",
    name: "Consolidar",
    short: "Decisões e próximos passos",
    phase: "ENCAMINHAR",
    minutes: 15,
  },
];
const ICONS = {
  arrow: "M5 12h14m-6-6 6 6-6 6",
  back: "M19 12H5m6-6-6 6 6 6",
  plus: "M12 5v14M5 12h14",
  search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  spark: "m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3Z",
  file: "M14 2H5v20h14V7Zm0 0v5h5M8 12h8M8 16h6",
  shield: "m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6ZM8 12l3 3 5-6",
  code: "m8 5-6 7 6 7m8-14 6 7-6 7m-3-16-2 18",
  chart: "M4 3v17h17M8 16v-4m5 4V7m5 9v-7",
  people:
    "M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3m7-11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m11 11v-3a4 4 0 0 0-3-4m-1-12a4 4 0 0 1 0 8",
  check: "M5 12l4 4L19 6",
  close: "m6 6 12 12M6 18 18 6",
  edit: "m16 3 5 5-12 12-6 1 1-6Zm-3 3 5 5",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  upload: "M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5",
  print: "M6 9V3h12v6M6 18H3V9h18v9h-3M6 14h12v8H6Z",
  flag: "M5 22V3m0 0c5-4 9 4 15 0v10c-6 4-10-4-15 0",
  clock: "M12 7v5l4 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  database:
    "M3 6v12c0 5 18 5 18 0V6M3 12c0 5 18 5 18 0M21 6c0 5-18 5-18 0s18-5 18 0",
  flow: "M3 3h6v6H3Zm12 12h6v6h-6ZM6 9v9h9M9 6h9v9",
  chat: "M3 3h18v14H9l-6 4ZM7 7h10M7 11h7",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  lab: "M8 3h8M9 3v7l-6 10v1h18v-1l-6-10V3M6 15h12",
  device: "M4 3h16v14H4ZM2 21h20M9 17v4m6-4v4",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7",
  copy: "M8 8h13v13H8ZM16 8V3H3v13h5",
  info: "M12 11v6m0-10v1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
};
function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[name] || ICONS.spark}"></path></svg>`;
}
const SOURCES = [
  {
    id: "strategy",
    title: "AI strategy - Guidance to set your organization's AI strategy",
    url: "https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ai/strategy",
    note: "Microsoft Learn · seções 1–4: casos de uso, tecnologia, IA responsável e dados. Conteúdo CAF sob CC BY 4.0; aplicação adaptada pela NEIVA.",
  },
  {
    id: "plan",
    title: "Plan for AI adoption - Cloud Adoption Framework | Microsoft Learn",
    url: "https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ai/plan",
    note: "Microsoft Learn · Prioritize AI use cases, Create AI proof of concepts e Implement responsible AI. Critérios e planejamento, não uma fórmula oficial de pontuação.",
  },
  {
    id: "diamond",
    title: "The Double Diamond - Design Council",
    url: "https://www.designcouncil.org.uk/resources/the-double-diamond/",
    note: "Design Council · Double Diamond, CC BY 4.0. Percurso adaptado: descobrir, definir, desenvolver e testar; não é um método criado pela Microsoft.",
  },
  {
    id: "jtbd",
    title: "Jobs to Be Done Theory - Christensen Institute",
    url: "https://www.christenseninstitute.org/theory/jobs-to-be-done/",
    note: "Lente para compreender o progresso desejado em uma circunstância concreta.",
  },
  {
    id: "ost",
    title:
      "Opportunity Solution Trees: Visualize Your Discovery to Stay Aligned and Drive Outcomes",
    url: "https://www.producttalk.org/opportunity-solution-trees/",
    note: "Teresa Torres / Product Talk · relaciona resultado, oportunidades, soluções e testes de hipóteses.",
  },
  {
    id: "copilot",
    title: "Microsoft Copilot hub | Microsoft Learn",
    url: "https://learn.microsoft.com/en-us/microsoft-365/copilot/",
    note: "Referência de Microsoft 365 Copilot, Copilot Chat, Cowork e extensibilidade.",
  },
  {
    id: "studio",
    title: "Microsoft Copilot Studio | Create AI Agents",
    url: "https://www.microsoft.com/en-us/copilot/products/copilot-studio",
    note: "Referência de criação e gestão de agentes e integrações.",
  },
  {
    id: "platforms",
    title: "AI and Machine Learning Products - Azure Architecture Center",
    url: "https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/data-science-and-machine-learning",
    note: "Comparação de plataformas de IA e machine learning. Não define uma arquitetura para o seu cliente.",
  },
  {
    id: "tools",
    title: "AI and Machine Learning - Azure Services | Microsoft Azure",
    url: "https://azure.microsoft.com/en-us/products/category/ai/",
    note: "Catálogo de serviços e capacidades. Confira disponibilidade, região e estágio de cada recurso.",
  },
  {
    id: "fabric",
    title: "Fabric Data Science | Microsoft Fabric",
    url: "https://www.microsoft.com/en-us/microsoft-fabric/features/data-science",
    note: "Referência para ciência de dados integrada ao Microsoft Fabric.",
  },
  {
    id: "dynamics",
    title: "Agents, Copilot, and AI capabilities in Dynamics 365 apps",
    url: "https://learn.microsoft.com/en-us/dynamics365/copilot/ai-get-started",
    note: "Visão de capacidades de IA em CRM e ERP; recursos variam por aplicativo.",
  },
  {
    id: "development",
    title: "Azure AI Apps and Agents | Microsoft Azure",
    url: "https://azure.microsoft.com/en-us/solutions/ai/",
    note: "Plataforma de apps e agentes, desenvolvimento e GitHub Copilot.",
  },
  {
    id: "security",
    title: "Microsoft Security Copilot – Microsoft Adoption",
    url: "https://adoption.microsoft.com/en-us/security-copilot/",
    note: "Referência de IA para operações de segurança e TI.",
  },
  {
    id: "governance",
    title: "Secure AI agents at scale using Microsoft Agent 365",
    url: "https://learn.microsoft.com/en-us/security/security-for-ai/agent-365-security",
    note: "Identidade, dados e proteção contra ameaças para agentes.",
  },
  {
    id: "edge",
    title: "Use local AI with Microsoft Foundry on Windows | Microsoft Learn",
    url: "https://learn.microsoft.com/en-us/windows/ai/overview",
    note: "Opções de IA local; valide compatibilidade do dispositivo e do modelo.",
  },
  {
    id: "science",
    title: "Microsoft Discovery | Microsoft Azure",
    url: "https://azure.microsoft.com/en-us/solutions/discovery",
    note: "Plataforma de pesquisa e desenvolvimento científico. Não confundir com este processo de AI Discovery.",
  },
];
const ECOSYSTEM = [
  {
    id: "work",
    group: "Trabalho",
    label: "PRODUTIVIDADE",
    title: "Trabalho no Microsoft 365",
    products:
      "Microsoft 365 Copilot · Copilot Chat · Copilot Cowork · extensibilidade",
    desc: "Assistência e execução de trabalho no contexto do Microsoft 365.",
    question:
      "Qual tarefa se repete no dia a dia? O resultado pode ser revisado pela pessoa antes de ser utilizado?",
    control: "Permissões, conteúdo confiável, adoção e licenças.",
    source: "copilot",
    cap: "knowledge",
    color: "blue",
  },
  {
    id: "studio",
    group: "Agentes",
    label: "AGENTES DE NEGÓCIO",
    title: "Conversar e agir em processos",
    products: "Microsoft Copilot Studio · conectores · agentes",
    desc: "Criação de agentes com conhecimento e ações conectadas ao negócio.",
    question:
      "O agente apenas orienta ou também altera sistemas? Quais ações exigem aprovação e como serão revertidas?",
    control: "Autenticação, limites de ação, DLP e custo de uso.",
    source: "studio",
    cap: "process",
    color: "violet",
  },
  {
    id: "power",
    group: "Agentes",
    label: "APLICATIVOS E AUTOMAÇÃO",
    title: "Melhorar o processo de ponta a ponta",
    products: "Power Automate · Power Apps · Dataverse · Copilot Studio",
    desc: "Combinação de aplicativos, automação e recursos de IA.",
    question:
      "Uma regra, um formulário ou uma integração convencional já resolveria? Onde existe ambiguidade que realmente justifica IA?",
    control: "Governança de ambientes, conectores, ALM e licenças.",
    source: "strategy",
    cap: "noai",
    color: "cyan",
  },
  {
    id: "foundry",
    group: "Agentes",
    label: "IA PERSONALIZADA",
    title: "Construir apps e agentes sob medida",
    products:
      "Microsoft Foundry · Foundry Models · Azure OpenAI · Foundry Agent Service · Azure AI Search",
    desc: "Plataforma para aplicações e agentes personalizados.",
    question:
      "Qual requisito não cabe em uma solução pronta? Como comparar modelos, recuperar fontes e medir qualidade antes de publicar?",
    control: "Avaliações, identidade, rede, conteúdo, latência e custo.",
    source: "strategy",
    cap: "knowledge",
    color: "blue",
  },
  {
    id: "tools",
    group: "Agentes",
    label: "DOCUMENTOS E MULTIMODAL",
    title: "Transformar conteúdo em informação",
    products:
      "Foundry Tools · Document Intelligence · Content Understanding · Speech · Language · Translator · Vision",
    desc: "Capacidades especializadas para documentos, linguagem, voz e imagem.",
    question:
      "Quais formatos e idiomas entram? Como tratar baixa confiança, documento incompleto e revisão humana?",
    control: "Amostra representativa, qualidade, finalidade e limites.",
    source: "tools",
    cap: "document",
    color: "cyan",
  },
  {
    id: "fabric",
    group: "Dados",
    label: "DADOS E ANALYTICS",
    title: "Dar contexto e evidência à decisão",
    products:
      "Microsoft Fabric · OneLake · Data Science · Power BI · Copilot no Fabric",
    desc: "Dados, analytics e ciência de dados em uma experiência integrada.",
    question:
      "As métricas têm definição e proprietário? Os dados necessários estão atualizados, autorizados e disponíveis?",
    control: "Qualidade, linhagem, acesso e capacidade.",
    source: "fabric",
    cap: "analytics",
    color: "blue",
  },
  {
    id: "ml",
    group: "Dados",
    label: "PREDIÇÃO E OTIMIZAÇÃO",
    title: "Aprender com dados históricos",
    products:
      "Azure Machine Learning · Microsoft Fabric · Azure Databricks · infraestrutura Azure",
    desc: "Opções para desenvolver e operar modelos de machine learning.",
    question:
      "Há histórico representativo e uma referência sem IA? Qual erro é aceitável e como detectar mudança no comportamento dos dados?",
    control: "Dados de treino e teste, viés, monitoramento e operação.",
    source: "strategy",
    cap: "predict",
    color: "violet",
  },
  {
    id: "business",
    group: "Trabalho",
    label: "CRM E ERP",
    title: "IA no contexto da operação",
    products:
      "Dynamics 365 · Sales · Customer Service · Finance · Supply Chain · agentes por função",
    desc: "Agentes e Copilot integrados a aplicativos de negócio.",
    question:
      "O processo já acontece no Dynamics 365? Qual capacidade nativa deve ser avaliada antes de uma construção personalizada?",
    control: "Aplicativo, região, licenciamento e permissão do usuário.",
    source: "dynamics",
    cap: "process",
    color: "indigo",
  },
  {
    id: "dev",
    group: "Operações",
    label: "ENGENHARIA DE SOFTWARE",
    title: "Apoiar quem constrói soluções",
    products: "GitHub Copilot · fluxo de desenvolvimento · plataforma Azure",
    desc: "IA como apoio ao ciclo de desenvolvimento de software.",
    question:
      "Onde estão as filas de trabalho do time? Como validar testes, segurança e revisão de código sem medir competência individual?",
    control: "Revisão, proteção de código e métricas do processo.",
    source: "development",
    cap: "code",
    color: "blue",
  },
  {
    id: "sec",
    group: "Operações",
    label: "SEGURANÇA COM IA",
    title: "Investigar e responder com contexto",
    products:
      "Microsoft Security Copilot · Defender · Entra · Intune · Purview",
    desc: "IA para apoiar operações de segurança e TI.",
    question:
      "Qual tarefa de análise consome mais tempo? Que evidências e aprovações são necessárias antes de conter uma ameaça?",
    control: "Privilégios, rastreabilidade e revisão do analista.",
    source: "security",
    cap: "security",
    color: "indigo",
  },
  {
    id: "gov",
    group: "Governança",
    label: "CAMADA TRANSVERSAL",
    title: "Governar antes de escalar",
    products:
      "Microsoft Agent 365 · Microsoft Entra · Microsoft Purview · Microsoft Defender",
    desc: "Controles de identidade, proteção de dados e segurança para agentes.",
    question:
      "Quem é responsável pelo agente? A quais dados e ferramentas ele pode acessar, por quanto tempo e com quais registros?",
    control: "Menor privilégio, retenção, auditoria e supervisão.",
    source: "governance",
    cap: "security",
    color: "magenta",
  },
  {
    id: "local",
    group: "Local & pesquisa",
    label: "LOCAL E EDGE",
    title: "Levar a inferência ao dispositivo",
    products:
      "Microsoft Foundry on Windows · Foundry Local · Windows ML · Windows AI APIs",
    desc: "Caminhos para executar IA localmente, conforme modelo e hardware.",
    question:
      "O caso exige operação sem rede ou baixa latência? O dispositivo suporta a carga e o ciclo de atualização dos modelos?",
    control: "Hardware, suporte, distribuição e proteção local.",
    source: "edge",
    cap: "multimodal",
    color: "cyan",
  },
  {
    id: "research",
    group: "Local & pesquisa",
    label: "PESQUISA CIENTÍFICA",
    title: "Explorar problemas de P&D",
    products: "Microsoft Discovery · Azure HPC · Microsoft Foundry",
    desc: "Plataforma para pesquisa e desenvolvimento científico com agentes.",
    question:
      "Qual hipótese científica será testada? Como registrar experimentos, validar resultados e manter rastreabilidade?",
    control: "Validação por especialistas e evidência reproduzível.",
    source: "science",
    cap: "research",
    color: "violet",
  },
];
const CAPABILITIES = [
  {
    id: "knowledge",
    label: "CONHECIMENTO",
    title: "Encontrar respostas confiáveis",
    icon: "search",
    color: "blue",
    desc: "Explorar acesso ao conhecimento com fonte, contexto e respeito às permissões.",
    questions: [
      "Onde a pessoa busca informação hoje?",
      "Qual fonte prevalece quando documentos se contradizem?",
      "Quando a solução deve dizer que não sabe?",
    ],
    idea: "Testar apoio à busca de informação com fontes e revisão do usuário.",
    examples: [
      "Microsoft 365 Copilot",
      "Copilot Studio",
      "Microsoft Foundry + Azure AI Search",
    ],
  },
  {
    id: "content",
    label: "CONTEÚDO",
    title: "Criar, resumir e adaptar",
    icon: "file",
    color: "violet",
    desc: "Investigar tarefas de redação e síntese sem eliminar a revisão de qualidade.",
    questions: [
      "Qual artefato é produzido e para quem?",
      "Como definir uma resposta boa e uma resposta inadequada?",
      "Que conteúdo nunca deve sair do ambiente?",
    ],
    idea: "Testar rascunhos ou resumos com critérios de qualidade explícitos.",
    examples: ["Microsoft 365 Copilot", "Copilot Cowork", "Microsoft Foundry"],
  },
  {
    id: "document",
    label: "DOCUMENTOS",
    title: "Extrair e classificar informações",
    icon: "database",
    color: "cyan",
    desc: "Descobrir oportunidades em documentos, mensagens e entradas pouco estruturadas.",
    questions: [
      "Quais campos, categorias e formatos realmente importam?",
      "Há variações de qualidade, idioma ou layout?",
      "Quem revisa as exceções e os itens de baixa confiança?",
    ],
    idea: "Testar extração ou classificação com revisão de exceções.",
    examples: ["Foundry Tools", "Document Intelligence", "Power Platform"],
  },
  {
    id: "process",
    label: "PROCESSOS",
    title: "Orquestrar ações com limites",
    icon: "flow",
    color: "blue",
    desc: "Conectar etapas de trabalho com autonomia proporcional ao risco.",
    questions: [
      "Qual evento inicia o trabalho e qual saída o encerra?",
      "Quais ações podem causar dano se estiverem erradas?",
      "Há aprovação, histórico, reversão e alternativa manual?",
    ],
    idea: "Testar uma etapa de processo com limites e aprovação humana.",
    examples: [
      "Copilot Studio",
      "Power Automate",
      "Foundry Agent Service",
      "Dynamics 365",
    ],
  },
  {
    id: "analytics",
    label: "ANÁLISE",
    title: "Explorar dados e indicadores",
    icon: "chart",
    color: "cyan",
    desc: "Transformar dúvidas de negócio em perguntas verificáveis sobre dados.",
    questions: [
      "Existe uma definição comum para a métrica?",
      "Quem tem permissão para visualizar os dados?",
      "Como confirmar o resultado sem depender só da resposta gerada?",
    ],
    idea: "Testar perguntas analíticas com métricas governadas e validação.",
    examples: ["Microsoft Fabric", "Power BI", "Copilot no Fabric"],
  },
  {
    id: "predict",
    label: "PREDIÇÃO",
    title: "Antecipar eventos e necessidades",
    icon: "chart",
    color: "violet",
    desc: "Avaliar previsão e detecção de padrões com dados históricos e referência comparável.",
    questions: [
      "Qual decisão muda com a previsão?",
      "Existe histórico suficiente e representativo?",
      "Qual custo de um falso positivo ou de um falso negativo?",
    ],
    idea: "Comparar um modelo preditivo com a referência atual, em dados separados.",
    examples: [
      "Azure Machine Learning",
      "Microsoft Fabric",
      "Azure Databricks",
    ],
  },
  {
    id: "code",
    label: "DESENVOLVIMENTO",
    title: "Apoiar construção e testes",
    icon: "code",
    color: "blue",
    desc: "Investigar gargalos do processo de engenharia, mantendo revisão humana.",
    questions: [
      "Qual etapa gera espera ou retrabalho para o time?",
      "Como medir qualidade e tempo do processo, não pessoas?",
      "Que validações impedem código inseguro ou incorreto?",
    ],
    idea: "Testar apoio ao desenvolvimento com revisão e critérios de qualidade.",
    examples: ["GitHub Copilot", "Microsoft Foundry"],
  },
  {
    id: "security",
    label: "SEGURANÇA",
    title: "Investigar com evidências",
    icon: "shield",
    color: "indigo",
    desc: "Explorar triagem e contextualização de sinais com acesso controlado.",
    questions: [
      "Quais sinais precisam ser correlacionados?",
      "Qual evidência sustenta a recomendação?",
      "Quem autoriza ações que afetam contas ou serviços?",
    ],
    idea: "Testar síntese de evidências com validação do analista.",
    examples: ["Microsoft Security Copilot", "Defender", "Entra", "Purview"],
  },
  {
    id: "multimodal",
    label: "INTERAÇÃO",
    title: "Compreender voz e imagem",
    icon: "chat",
    color: "cyan",
    desc: "Explorar modalidades de entrada e acessibilidade conforme o contexto de uso.",
    questions: [
      "Voz ou imagem resolve uma barreira real?",
      "Há autorização e finalidade para captar esse conteúdo?",
      "Como funciona com ruído, erro ou sem conexão?",
    ],
    idea: "Testar interação multimodal com controle de captura e revisão.",
    examples: ["Foundry Tools", "Speech", "Foundry Local", "Windows AI APIs"],
  },
  {
    id: "research",
    label: "PESQUISA",
    title: "Formular e testar hipóteses",
    icon: "lab",
    color: "violet",
    desc: "Estruturar investigação especializada sem confundir sugestão com descoberta validada.",
    questions: [
      "O que será aceito como evidência?",
      "O experimento pode ser repetido?",
      "Qual especialista valida a conclusão?",
    ],
    idea: "Avaliar apoio à pesquisa com fontes e experimentos reproduzíveis.",
    examples: ["Microsoft Discovery", "Microsoft Foundry", "Azure HPC"],
  },
  {
    id: "noai",
    label: "CONTRAPROVA",
    title: "Resolver sem usar IA",
    icon: "check",
    color: "magenta",
    desc: "Compare a opção sem IA: simplificação de processo, regras, busca e automação convencional.",
    questions: [
      "O problema desaparece com uma regra ou informação organizada?",
      "A tarefa precisa de variabilidade ou de resultado determinístico?",
      "A alternativa sem IA é mais simples, segura e econômica?",
    ],
    idea: "Comparar a hipótese de IA com uma alternativa sem IA.",
    examples: [
      "Melhoria de processo",
      "Power Automate",
      "Power Apps",
      "Busca e regras",
    ],
  },
];
const SCORES = [
  {
    id: "impact",
    label: "Impacto no negócio",
    help: "Ganho relevante para um resultado mensurável.",
  },
  {
    id: "human",
    label: "Valor para as pessoas",
    help: "Melhora da experiência de quem usa ou recebe o serviço.",
  },
  {
    id: "alignment",
    label: "Alinhamento estratégico",
    help: "Conexão com a prioridade acordada com o cliente.",
  },
  {
    id: "feasibility",
    label: "Viabilidade técnica",
    help: "Integrações, capacidade da equipe, prazo e operação.",
  },
  {
    id: "data",
    label: "Prontidão dos dados",
    help: "Qualidade, acesso autorizado e disponibilidade.",
  },
];
const CONFIDENCE = {
  unknown: { label: "Não avaliada", factor: 0 },
  low: { label: "Baixa · hipótese", factor: 0.5 },
  medium: { label: "Média · indícios", factor: 0.75 },
  high: { label: "Alta · evidência validada", factor: 1 },
};
const RISK = {
  unknown: "Não avaliado",
  low: "Baixo",
  medium: "Moderado",
  high: "Alto",
};
const PATHS = {
  unknown: "A avaliar",
  adopt: "Adotar solução pronta",
  extend: "Estender / low-code",
  build: "Construir solução personalizada",
  none: "Resolver sem IA",
};
const DECISIONS = {
  pending: "Aguardando decisão do cliente",
  conditional: "Avançar com condições",
  revisit: "Voltar à descoberta",
  stop: "Não prosseguir",
};
const GATES = [
  {
    id: "data",
    title: "Dados e autorização de acesso",
    desc: "Fontes, classificação, proprietário, qualidade e permissões confirmados.",
  },
  {
    id: "privacy",
    title: "Privacidade e finalidade",
    desc: "Finalidade, minimização, retenção e análise jurídica/LGPD quando aplicável.",
  },
  {
    id: "quality",
    title: "Qualidade e danos potenciais",
    desc: "Erros, vieses, exclusão, desinformação e falhas definidos em testes representativos.",
  },
  {
    id: "human",
    title: "Supervisão humana e reversão",
    desc: "Aprovações, escalonamento, limites de autonomia e saída manual definidos.",
  },
  {
    id: "security",
    title: "Segurança e rastreabilidade",
    desc: "Menor privilégio, injeção de prompt, vazamento, auditoria e resposta a incidentes.",
  },
  {
    id: "adoption",
    title: "Adoção e operação",
    desc: "Responsável pelo serviço, usuários-piloto, treinamento, feedback e suporte.",
  },
  {
    id: "cost",
    title: "Licenças, custo e disponibilidade",
    desc: "Região, status do recurso, licenciamento, consumo, orçamento e dependências.",
  },
];
const GATE_STATUS = {
  unknown: "Não avaliado",
  pending: "Pendente",
  verified: "Verificado",
  na: "Não aplicável",
};
const SESSION_FIELDS = [
  "client",
  "area",
  "facilitator",
  "date",
  "sponsor",
  "participants",
  "objective",
  "metric",
  "baseline",
  "target",
  "constraints",
  "notes",
  "nextAction",
  "decisionOwner",
  "decisionDate",
  "decisionNotes",
];
const JOB_FIELDS = [
  "persona",
  "context",
  "task",
  "outcome",
  "barrier",
  "alternative",
];
const OPP_FIELDS = [
  "title",
  "area",
  "persona",
  "problem",
  "hypothesis",
  "alternative",
  "kpi",
  "baseline",
  "target",
  "evidence",
  "dataSources",
  "owner",
  "riskNotes",
];
const PILOT_FIELDS = [
  "hypothesis",
  "experiment",
  "sample",
  "acceptance",
  "quality",
  "owner",
  "reviewDate",
  "duration",
  "budget",
  "fallback",
  "nextAction",
];
function e(v) {
  return String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function clean(v, max = 5000) {
  return typeof v === "string" ? v.slice(0, max) : "";
}
function id() {
  return (
    "n_" +
    (globalThis.crypto?.randomUUID?.() ||
      Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 12))
  );
}
function localDate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}
function fmt(n, d = 0) {
  return Number(n).toLocaleString("pt-BR", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}
function dateLabel(v) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v || "")) return "Não definida";
  return v.split("-").reverse().join("/");
}
function safeNum(v, min, max, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}
function defaultState() {
  return {
    version: APP_VERSION,
    meta: { demo: false, snapshot: false, updated: "" },
    session: Object.fromEntries(
      SESSION_FIELDS.map((k) => [
        k,
        k === "facilitator" ? "Felipe Neiva" : k === "date" ? localDate() : "",
      ]),
    ),
    jobs: Object.fromEntries(JOB_FIELDS.map((k) => [k, ""])),
    journey: [],
    opportunities: [],
    weights: {
      impact: 30,
      human: 20,
      alignment: 15,
      feasibility: 20,
      data: 15,
    },
    decision: "pending",
  };
}
function newOpportunity() {
  return {
    id: id(),
    ...Object.fromEntries(OPP_FIELDS.map((k) => [k, ""])),
    journeyId: "",
    capability: "knowledge",
    path: "unknown",
    risk: "unknown",
    confidence: "unknown",
    scores: Object.fromEntries(SCORES.map((x) => [x.id, 0])),
    selected: false,
    pilot: Object.fromEntries(PILOT_FIELDS.map((k) => [k, ""])),
    gates: Object.fromEntries(
      GATES.map((g) => [g.id, { status: "unknown", note: "" }]),
    ),
  };
}
function sanitize(raw) {
  if (!raw || raw.version !== APP_VERSION)
    throw new Error(
      "Arquivo incompatível. Importe uma sessão exportada por esta versão do NEIVA AI Discovery.",
    );
  if (
    !Array.isArray(raw.opportunities) ||
    !Array.isArray(raw.journey) ||
    raw.opportunities.length > 200 ||
    raw.journey.length > 100
  )
    throw new Error(
      "A sessão precisa conter listas válidas: até 200 casos e 100 etapas.",
    );
  const out = defaultState();
  out.meta.demo = raw.meta?.demo === true;
  out.meta.snapshot = raw.meta?.snapshot === true;
  out.meta.updated = clean(raw.meta?.updated, 50);
  for (const k of SESSION_FIELDS) out.session[k] = clean(raw.session?.[k]);
  for (const k of JOB_FIELDS) out.jobs[k] = clean(raw.jobs?.[k]);
  for (const k of Object.keys(out.weights))
    out.weights[k] = Math.round(
      safeNum(raw.weights?.[k], 0, 100, out.weights[k]),
    );
  if (Object.values(out.weights).reduce((a, b) => a + b, 0) === 0)
    out.weights = defaultState().weights;
  out.decision = Object.hasOwn(DECISIONS, raw.decision)
    ? raw.decision
    : "pending";
  const ids = new Set();
  const validId = (v) =>
    typeof v === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(v) && !ids.has(v)
      ? v
      : id();
  out.journey = raw.journey.map((j) => {
    if (!j || typeof j !== "object")
      throw new Error("Etapa inválida no arquivo.");
    const jid = validId(j.id);
    ids.add(jid);
    return {
      id: jid,
      title: clean(j.title, 300),
      activity: clean(j.activity),
      pain: clean(j.pain),
      data: clean(j.data),
      evidence: clean(j.evidence),
    };
  });
  out.opportunities = raw.opportunities.map((o) => {
    if (!o || typeof o !== "object")
      throw new Error("Caso de uso inválido no arquivo.");
    const c = newOpportunity();
    c.id = validId(o.id);
    ids.add(c.id);
    for (const k of OPP_FIELDS) c[k] = clean(o[k]);
    c.journeyId = out.journey.some((j) => j.id === o.journeyId)
      ? o.journeyId
      : "";
    c.capability = CAPABILITIES.some((x) => x.id === o.capability)
      ? o.capability
      : "knowledge";
    for (const [key, opts] of [
      ["path", PATHS],
      ["risk", RISK],
      ["confidence", CONFIDENCE],
    ])
      c[key] = Object.hasOwn(opts, o[key]) ? o[key] : "unknown";
    for (const s of SCORES)
      c.scores[s.id] = Math.round(safeNum(o.scores?.[s.id], 0, 5));
    c.selected = o.selected === true;
    for (const k of PILOT_FIELDS) c.pilot[k] = clean(o.pilot?.[k]);
    for (const g of GATES) {
      const x = o.gates?.[g.id];
      c.gates[g.id] = {
        status: Object.hasOwn(GATE_STATUS, x?.status) ? x.status : "unknown",
        note: clean(x?.note),
      };
    }
    return c;
  });
  return out;
}
function score(
  o,
  weights = typeof state === "undefined"
    ? defaultState().weights
    : state.weights,
) {
  if (
    !o ||
    SCORES.some((s) => o.scores[s.id] < 1) ||
    !CONFIDENCE[o.confidence]?.factor ||
    !o.evidence.trim()
  )
    return null;
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (total <= 0) return null;
  return (
    (SCORES.reduce((sum, s) => sum + weights[s.id] * o.scores[s.id], 0) /
      total /
      5) *
    100 *
    CONFIDENCE[o.confidence].factor
  );
}
function bxt(o) {
  if (SCORES.some((s) => o.scores[s.id] < 1)) return null;
  return {
    value: (o.scores.impact + o.scores.human + o.scores.alignment) / 3,
    feasible: (o.scores.feasibility + o.scores.data) / 2,
  };
}
function ranked() {
  return [...state.opportunities].sort(
    (a, b) =>
      (score(b) ?? -1) - (score(a) ?? -1) ||
      a.title.localeCompare(b.title, "pt-BR"),
  );
}
function missing(o) {
  const m = [];
  if (!o.problem.trim()) m.push("Problema de negócio");
  if (!o.hypothesis.trim()) m.push("Hipótese de solução");
  if (!o.alternative.trim()) m.push("Comparação com alternativa sem IA");
  if (!o.kpi.trim() || !o.baseline.trim() || !o.target.trim())
    m.push("KPI, linha de base e meta");
  if (!o.evidence.trim()) m.push("Evidência ou hipótese documentada");
  if (!o.dataSources.trim()) m.push("Fontes de dados");
  if (score(o) === null) m.push("Pontuação e confiança documentadas");
  if (o.path === "unknown") m.push("Caminho de solução");
  if (o.risk === "unknown" || !o.riskNotes.trim())
    m.push("Avaliação e justificativa de risco");
  for (const [k, label] of [
    ["hypothesis", "Hipótese do piloto"],
    ["experiment", "Desenho do experimento"],
    ["sample", "Amostra e escopo"],
    ["acceptance", "Critério de sucesso"],
    ["quality", "Avaliação de qualidade e segurança"],
    ["owner", "Responsável pelo piloto"],
    ["reviewDate", "Data da revisão"],
    ["duration", "Prazo do experimento"],
    ["budget", "Limite de custo"],
    ["fallback", "Plano de interrupção / alternativa"],
    ["nextAction", "Próxima ação"],
  ]) {
    if (!o.pilot[k].trim()) m.push(label);
  }
  for (const g of GATES) {
    const v = o.gates[g.id];
    if (!["verified", "na"].includes(v.status) || !v.note.trim())
      m.push(g.title);
  }
  return m;
}
function completion() {
  return [
    !!(
      state.session.client.trim() &&
      state.session.objective.trim() &&
      state.session.metric.trim()
    ),
    !!(
      state.jobs.persona.trim() &&
      state.jobs.task.trim() &&
      state.journey.length
    ),
    state.opportunities.some((o) => o.problem.trim() && o.hypothesis.trim()),
    state.opportunities.some((o) => o.selected && score(o) !== null),
    state.opportunities.some((o) => o.selected && missing(o).length === 0),
    !!(
      state.decision !== "pending" &&
      state.session.decisionOwner.trim() &&
      state.session.nextAction.trim() &&
      state.session.decisionDate.trim()
    ),
  ];
}
function hasWork() {
  return (
    state.opportunities.length > 0 ||
    state.journey.length > 0 ||
    SESSION_FIELDS.filter((k) => !["date", "facilitator"].includes(k)).some(
      (k) => state.session[k].trim(),
    ) ||
    JOB_FIELDS.some((k) => state.jobs[k].trim())
  );
}

if (typeof module !== "undefined")
  module.exports = {
    defaultState,
    newOpportunity,
    sanitize,
    score,
    bxt,
    ranked,
    missing,
    completion,
    hasWork,
  };
