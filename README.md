# Frontier Transformation Engineer

Guias e ferramentas da **NEIVA Cloud Solutions** para transformação agêntica, organizados por plataforma.

**[Abrir o portal](https://felipeneivadc.github.io/frontier-transformation-engineer/)** · [Copilot Studio](https://felipeneivadc.github.io/frontier-transformation-engineer/copilot-studio/) · [Microsoft 365 / Cowork](https://felipeneivadc.github.io/frontier-transformation-engineer/microsoft-365-copilot/) · [Ferramentas e diagnóstico](https://felipeneivadc.github.io/frontier-transformation-engineer/ferramentas/) · [Estimador de créditos](https://felipeneivadc.github.io/frontier-transformation-engineer/ferramentas/calculadora-creditos/)

## Recursos

| Área                      | Conteúdo                                                                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Copilot Studio            | Guia interativo de governança, calculadoras Standard e GitHub Copilot Harness, documentação selecionada                                 |
| Microsoft 365 / Cowork    | Calculadora por perfil e intensidade, referências de consumo e administração                                                            |
| Ferramentas e diagnóstico | Agent Advisor, AI Discovery Studio e estimador unificado de créditos com subtotais, faixas, orçamento ilustrativo, comparativo P3 e PDF |

O guia inclui cinco pilares, zonas, 15 perguntas de autoavaliação, 31 controles, matriz RACI e quiz. Os hubs distinguem os materiais próprios de fontes externas Microsoft.

## Organização

```text
docs/                              Site publicado pelo GitHub Pages
  index.html                       Entrada compacta dos hubs
  copilot-studio/
    index.html                     Hub de Copilot Studio
    governanca/index.html          Guia educacional
  microsoft-365-copilot/index.html  Hub de Microsoft 365 / Cowork
  ferramentas/
    index.html                     Hub de ferramentas e diagnóstico
    calculadora-creditos/          Estimador unificado
    agent-advisor/                 Diagnóstico de uso e construção de agentes
    ai-discovery-studio/           Oficina local de descoberta e priorização
  assets/
    css/                           Tokens, hubs, guia e estimador
    js/
      catalog.js                   Hubs e recursos curados
      site.js                      Cabeçalho, rodapé, menu e tema comuns
      governance-data.js           Textos e dados dinâmicos do guia
      governance.js                Interações do guia
      calculator-data.js           Taxas, faixas, premissas e fontes
      calculator.js                Formulários e resultados
      calculators/                 Motores puros e comparação P3
    images/                        Marca NEIVA e ícones dos produtos
scripts/                           Prévia e integridade do site
tests/
  unit/                            Cálculos e dados do guia
  browser/                         Navegação, apresentação e acessibilidade
.github/workflows/validate.yml     Validação manual opcional
```

HTML, CSS e JavaScript estáticos, **sem framework ou build obrigatório**. Só `docs/` é publicado. Não há cópias geradas do site ou dependências de npm no navegador.

Os endereços antigos do guia são mantidos como encaminhamentos, não cópias editáveis do conteúdo. O URL do estimador permanece `ferramentas/calculadora-creditos/`.

## Desenvolvimento

Node.js 24 é usado apenas nas tarefas locais e testes:

```powershell
npm.cmd ci --no-fund --no-audit
npm.cmd run dev
```

Prévia: `http://127.0.0.1:4178/frontier-transformation-engineer/`.

O servidor reproduz o prefixo do Pages e serve somente `docs/`. Use HTTP para executar os módulos do estimador; `file://` não é suportado. No PowerShell, `npm.cmd` evita depender da política de execução de `npm.ps1`. Em outros terminais, use `npm`.

```powershell
npm.cmd run check
npm.cmd test
npx.cmd playwright install chromium
npm.cmd run test:browser
npm.cmd run format
```

Os testes cobrem exemplos públicos Microsoft, os três motores, licenciamento, todas as combinações de produtos, limites e faixas, navegação, guia, contraste, larguras de tela e impressão. Relatórios e capturas são ignorados pelo Git.

## Publicação

Em **Settings → Pages**, mantenha **Deploy from a branch → main → /docs**. O site é atualizado automaticamente ao enviar alterações para `main`, sem acrescentar `/docs/` às URLs públicas.

Execute as verificações antes de publicar. O workflow **Validate portal**, iniciado manualmente em Actions, é opcional e não realiza o deploy. Não coloque credenciais, `.env`, materiais privados ou resultados de testes em `docs/`.

## Adicionar recursos

Edite `docs/assets/js/catalog.js` para acrescentar um link, descrição, origem e grupo ao hub adequado. Não crie categorias vazias ou links fictícios.

Para uma página própria, use uma página do hub como referência, mantenha o cabeçalho e rodapé compartilhados por `site.js`, informe `data-page` e ajuste os caminhos relativos dos assets. Adicione o recurso ao catálogo e aos testes de navegador. Um novo hub também precisa entrar na navegação comum.

Textos dinâmicos do guia ficam em `governance-data.js`; textos e fontes explicativas também existem no HTML. Preserve IDs e posições dos controles indexados para não reinterpretar respostas salvas.

## Ferramentas e diagnóstico

O hub `ferramentas/` concentra experiências interativas que compartilham o
cabeçalho, rodapé, tema e navegação do portal. Uma nova ferramenta deve entrar
em `catalog.js`, usar `data-page="tools"`, manter breadcrumb e alternativa sem
JavaScript, e ter cobertura de navegador para seus fluxos e larguras suportadas.

O **Agent Advisor** compara caminhos para usar ou construir agentes, mantendo a
pontuação explícita, os links oficiais, a exportação Markdown e o fragmento de
URL compartilhável. Seus ícones são SVGs neutros locais; não adicione imagens
remotas para representar plataformas.

O **AI Discovery Studio** é uma oficina local para descoberta, priorização e
preparação de pilotos. O rascunho no navegador é opcional; importação, backup
JSON, relatório impresso e cópia HTML interativa dependem da ação explícita da
pessoa facilitadora. A cópia HTML incorpora a sessão e seus assets para poder
ser aberta offline. Não inclua dados pessoais sensíveis, credenciais ou
documentos confidenciais nos registros.

## Modelos de consumo

| Experiência            | Entradas e unidade                                                      | Resultado                       |
| ---------------------- | ----------------------------------------------------------------------- | ------------------------------- |
| Standard               | Tráfego mensal, conhecimento, grounding, ações, fluxos e tokens de IA   | Estimativa por medidores        |
| GitHub Copilot Harness | Pessoas × interações/dia × 22 dias úteis, distribuídas por complexidade | Faixa; Heavy tem somente mínimo |
| Cowork                 | Usuários por perfil × intensidade diária × 22 dias úteis                | Faixa baixa/alta                |

**Standard:** inclusão Microsoft 365 somente em uso B2E autenticado e elegível. CUA e fluxos com outros gatilhos continuam cobrados. As ações de fluxos são informadas como quantidade mensal executada: 13 créditos por 100 ações. Tokens de IA são adicionais ao medidor de recurso, inclusive em respostas generativas. Distribuição de fluxos elegíveis segue a proporção do tráfego licenciável do cenário.

**Harness:** não é a assinatura GitHub Copilot IDE. Construção, testes e avaliações também são cobrados, mas esse consumo adicional não é quantificado pelas entradas de runtime. Heavy não recebe um teto inventado e propaga o mínimo para o total.

**Cowork:** esta versão substitui intencionalmente o modelo antigo de créditos por prompt por faixas diárias dos quatro perfis. Os resultados anteriores não devem ser comparados como se fossem o mesmo modelo. Faixas e premissas assumem Anthropic Opus 4.8 na referência.

**P3:** a seção avançada compara custos anuais em cenários baixo e alto, ou apenas no mínimo quando o teto é desconhecido. Commit units pagam custos elegíveis em USD e **não são Copilot Credits**. Descontos dos nove níveis são premissas de planejamento do modelo NEIVA; confirme condições comerciais e elegibilidade antes de comprar. Não há recomendação definitiva para consumo sem teto.

Taxas, unidades, faixas e fontes ficam em `calculator-data.js`. A implementação dos cálculos é própria, baseada nas informações públicas dos [estimadores Microsoft Standard](https://microsoft.github.io/copilot-studio-estimator/) e [Cowork/Harness](https://nptnlopppecostweb.azurewebsites.net/#/estimator) e na documentação indicada pela ferramenta.

## Dados e autoria

Não há login, backend, analytics ou transmissão das respostas e cenários. O navegador carrega os assets locais. Tema e estado do guia usam `neiva-theme`, `neiva-gov-mode`, `neiva-gov-assessment-v1` e `neiva-gov-checklist-v1`; as chaves são preservadas na reorganização. O estimador não salva cenários entre sessões.

A calculadora histórica em [`felipeneivadc/copilot-cowork-credit-calculator`](https://github.com/felipeneivadc/copilot-cowork-credit-calculator) permanece intacta, sem sincronização automática com este portal.

A organização dos hubs se inspira no [Microsoft Agent Resources](https://github.com/microsoft/agent-resources/), sem copiar código fechado, catálogo editorial ou identidade corporativa. `Coworking.png` foi fornecido pelo proprietário do projeto. Fontes e termos dos ícones estão em [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

**Material educacional e estimativas independentes, não contratuais.** Valide consumo, preços e controles com documentação oficial, contratos vigentes e dados reais. Não há afiliação ou endosso da Microsoft.

Materiais próprios: © 2026 NEIVA Cloud Solutions. Consulte [LICENSE](LICENSE).
