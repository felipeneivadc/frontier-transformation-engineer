# Frontier Transformation Engineer

Portal da **NEIVA Cloud Solutions** para conhecimento aplicado à transformação agêntica: guias educacionais e ferramentas de governança e planejamento.

**Site:** [felipeneivadc.github.io/frontier-transformation-engineer](https://felipeneivadc.github.io/frontier-transformation-engineer/)

| Recurso | Página | Principais funcionalidades |
| --- | --- | --- |
| Início | [`index.html`](index.html) | Apresentação e acesso aos materiais |
| Governança de Agentes | [`guias/governanca-agentes/`](guias/governanca-agentes/) | Cinco pilares, zonas, avaliação, checklist, RACI, roteiro e quiz |
| Calculadora de Créditos | [`ferramentas/calculadora-creditos/`](ferramentas/calculadora-creditos/) | Consumo por perfil, comparação dos nove níveis P3, economia e impressão/PDF |

## Estrutura

```text
index.html                              Página inicial
guias/governanca-agentes/index.html      Guia educacional
ferramentas/calculadora-creditos/
  index.html                            Calculadora
assets/
  css/site.css                          Tokens e componentes comuns
  css/home.css                          Página inicial
  css/governance.css                    Layout do guia
  css/calculator.css                    Layout da calculadora
  js/theme-init.js                      Preferência de tema antes da pintura
  js/site.js                            Menu, tema e armazenamento
  js/governance-data.js                  Textos, perguntas, RACI e quiz
  js/governance.js                       Interações do guia
  js/calculator-model.js                Parâmetros e cálculos puros
  js/calculator.js                      Formulário e resultados
  images/                               Marca NEIVA e ícones oficiais Microsoft
scripts/                                Prévia e verificação do site
tests/                                  Testes numéricos e de navegador
.github/workflows/validate.yml          Validação manual opcional
```

O site usa **HTML, CSS e JavaScript estáticos**, sem framework, backend ou geração obrigatória de páginas. As dependências npm são usadas apenas na manutenção e nos testes. Não são enviadas para o navegador.

## Executar localmente

Requer Node.js 24 para os comandos de manutenção:

```powershell
npm.cmd run dev
```

Abra `http://127.0.0.1:4178/frontier-transformation-engineer/`.

A prévia usa o mesmo prefixo de URL do GitHub Pages. Isso ajuda a detectar links que funcionariam na raiz, mas quebrariam no site publicado. O servidor disponibiliza somente os arquivos públicos do portal, não a pasta `.git` ou dependências.

No PowerShell, `npm.cmd` evita depender da política de execução de `npm.ps1`. Em outros terminais, use `npm`.

Os módulos da calculadora precisam de um servidor HTTP; abrir o HTML por `file://` não é uma forma suportada de executar a ferramenta.

## Verificações

```powershell
npm.cmd ci --no-fund --no-audit
npm.cmd run check
npm.cmd test
npx.cmd playwright install chromium
npm.cmd run test:browser
```

As verificações cobrem links, assets, fragmentos e prefixo Pages; preservação de parâmetros e fórmulas; dimensões do guia; teclado, persistência e interações; temas, contraste e semântica; larguras de 320 a 1440 pixels; impressão/PDF.

Relatórios, capturas e PDFs de teste são ignorados pelo Git. Quando o serviço estiver disponível na conta, o workflow opcional **Validate portal** pode executar as mesmas verificações no GitHub Actions. Ele instala o navegador e suas dependências no runner, sem exigir configuração adicional no computador de quem acessa o site.

## Publicação

O GitHub Pages usa a publicação nativa **Deploy from a branch**, com origem na **branch `main`, pasta `/`**. Cada atualização de `main` publica os arquivos estáticos automaticamente. O arquivo `.nojekyll` evita o processamento do conteúdo com Jekyll.

Execute as verificações locais antes de enviar mudanças. A publicação não depende de um build npm ou do workflow personalizado de validação; a documentação, os testes e os scripts de desenvolvimento já são públicos no repositório, mas não são carregados pelo navegador para executar o portal. Dependências instaladas e artefatos locais permanecem ignorados pelo Git.

Em **Settings → Pages**, mantenha **Deploy from a branch → main → / (root)**. Não selecione GitHub Actions como origem sem configurar um workflow de publicação correspondente. A validação opcional pode ser iniciada em **Actions → Validate portal → Run workflow** e não altera o site publicado.

`404.html` trata endereços inexistentes. O nome antigo `governanca-agentes-copilot-studio-neiva.html` encaminha para o guia novo e preserva os parâmetros e o fragmento quando o JavaScript está disponível.

## Adicionar uma página e uma aba

1. Crie um diretório com slug ASCII em `guias` ou `ferramentas`, com seu próprio `index.html`. Use uma página existente como referência para cabeçalho, rodapé, idioma, favicon e metadados.
2. Referencie `site.css`, `theme-init.js` e `site.js`. Coloque estilos e comportamento específicos em arquivos separados, sem redefinir os componentes globais. Atualize os caminhos relativos conforme a profundidade da página.
3. Adicione o link na `.site-nav` das páginas do portal e um card na página inicial. Cada página tem exatamente um link com `aria-current="page"`; as abas entre páginas são links, não widgets ARIA `tab`.
4. Ajuste título, descrição, canonical, Open Graph e rótulos acessíveis. Atualize a contagem de recursos e esta documentação. Adicione o recurso à matriz de testes de navegador.
5. Execute as verificações e envie a alteração para `main`. Os diretórios `guias` e `ferramentas` são incluídos automaticamente na publicação e na verificação de links.

Não crie abas vazias, links fictícios ou ícones de produto desenhados para imitar marcas. Novos ícones devem vir de fontes oficiais, manter proporções e cores, e ter origem e termos registrados em [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Manter o guia e a calculadora

**Guia:** dados dinâmicos ficam em `assets/js/governance-data.js`; textos explicativos e referências também existem no HTML. Ao atualizar um controle, confira as perguntas, recomendações, checklist, RACI e quiz relacionados. Preserve os IDs usados pela navegação e pelos scripts.

**Calculadora:** perfis, preço-base, créditos por prompt e nove níveis P3 ficam em `assets/js/calculator-model.js`. A interface fica separada em `calculator.js`. Mudanças de premissas precisam atualizar as explicações, os avisos e os testes, não apenas uma constante.

As fórmulas e os parâmetros válidos da calculadora original foram preservados nesta integração. A apresentação diferencia créditos ociosos e excedente, e entradas inválidas são sinalizadas sem gerar uma estimativa aparentemente válida.

## Privacidade e persistência

Não há login, banco de dados, analytics ou envio das respostas e cenários a um backend. O navegador solicita apenas os assets locais do site; links oficiais externos são acessados quando acionados pelo usuário.

O tema e os dados do guia são armazenados no navegador:

| Chave | Uso |
| --- | --- |
| `neiva-theme` | Escolha explícita de tema, compartilhada entre páginas |
| `neiva-gov-mode` | Modo Executivo/Técnico |
| `neiva-gov-assessment-v1` | Respostas da autoavaliação |
| `neiva-gov-checklist-v1` | Controles marcados |

Sem uma escolha explícita, o tema acompanha a preferência do sistema. A calculadora e o quiz não salvam cenários ou respostas entre sessões.

O armazenamento é vinculado à origem. Dados de um HTML aberto por `file://` não migram automaticamente para o site publicado. Não reordene perguntas ou controles indexados sem planejar uma migração ou uma nova versão da chave de armazenamento.

Não publique kits de marca privados, planilhas de referência, credenciais, arquivos `.env` ou artefatos de sessão. Antes de enviar, revise `git status --short` e `git diff --cached --stat`.

## Origem e marcas

O guia é um material educacional NEIVA baseado em referências públicas Microsoft, citadas nas próprias seções. A organização do portal se inspira conceitualmente no [Microsoft Agent Resources](https://github.com/microsoft/agent-resources/), sem copiar seu conteúdo editorial, identidade visual ou scripts de analytics.

A calculadora é uma cópia integrada de [`felipeneivadc/copilot-cowork-credit-calculator`](https://github.com/felipeneivadc/copilot-cowork-credit-calculator), a partir do commit `7fbcc7669ede55bcc94d6ba9575f24ea53a95ad7`. O repositório e a publicação originais permanecem separados e não recebem atualizações automaticamente deste portal.

São usados ícones oficiais do Copilot Studio e do Microsoft 365 Copilot. O recurso de Cowork é identificado pelo ícone de Microsoft 365 Copilot, não por um símbolo exclusivo inventado. Consulte a origem e os termos em [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

**Aviso:** conteúdo educacional e estimativas independentes. Esta integração não constitui revisão atualizada de todas as afirmações técnicas, preços ou condições Microsoft. Valide decisões com documentação oficial, contratos vigentes e dados reais da organização. Não há afiliação ou endosso da Microsoft.

## Licença

Materiais próprios: © 2026 NEIVA Cloud Solutions, todos os direitos reservados. Consulte [LICENSE](LICENSE). Ícones Microsoft permanecem sujeitos aos respectivos termos e marcas.
