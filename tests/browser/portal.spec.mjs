import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const guide = 'guias/governanca-agentes/';
const calculator = 'ferramentas/calculadora-creditos/';
const pages = [['início', './'], ['guia', guide], ['calculadora', calculator]];

for (const [name, route] of pages) {
  test(`${name}: responsivo em cinco larguras, claro e escuro`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => { if (response.status() >= 400 && response.url().includes('127.0.0.1')) errors.push(response.url()); });
    for (const theme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        if (route === guide) await expect(page.locator('#questions .q')).toHaveCount(15);
        if (route === calculator) await expect(page.locator('#usersBody tr')).toHaveCount(4);
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('.site-nav [aria-current="page"]')).toHaveCount(1);
        const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
        expect(dimensions.scroll, `${name}, ${theme}, ${width}px`).toBeLessThanOrEqual(dimensions.width + 1);
        const images = await page.locator('img').evaluateAll((items) => items.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src));
        expect(images).toEqual([]);
      }
    }
    expect(errors).toEqual([]);
  });
  for (const theme of ['light', 'dark']) {
    test(`${name}: acessibilidade AA em tema ${theme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(route);
      if (route === guide) {
        await expect(page.locator('#questions .q')).toHaveCount(15);
        await page.locator('[data-p="3"][data-q="0"][data-v="4"]').click();
        await page.locator('.ck-box').first().click();
      }
      if (route === calculator) await page.locator('#users-0').fill('1000');
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(result.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }))).toEqual([]);
    });
  }
}

test('navegação móvel, Escape e tema compartilhado', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await page.locator('#siteMenuBtn').click();
  await expect(page.locator('#siteNav')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#siteNav')).toBeHidden();
  await expect(page.locator('#siteMenuBtn')).toBeFocused();
  await page.locator('#themeBtn').click();
  const theme = await page.locator('html').getAttribute('data-theme');
  await page.locator('#siteMenuBtn').click();
  await page.locator('.site-nav [data-page="governance"]').click();
  await expect(page).toHaveURL(new RegExp(`${guide}$`));
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await page.locator('#siteMenuBtn').click();
  await page.locator('.site-nav [data-page="calculator"]').click();
  await expect(page).toHaveURL(new RegExp(`${calculator}$`));
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
});

test('guia: modos, abas, teclado e acordeões', async ({ page }) => {
  await page.goto(guide);
  await page.locator('.mode-btn[data-mode="exec"]').click();
  await expect(page.locator('#panel-seg .tech')).toBeHidden();
  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-mode', 'exec');
  await page.locator('.mode-btn[data-mode="tech"]').click();
  await page.locator('#tab-seg').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#tab-ops')).toBeFocused();
  await expect(page.locator('#panel-ops')).toBeVisible();
  await page.keyboard.press('End');
  await expect(page.locator('#panel-rel')).toBeVisible();
  await page.keyboard.press('Home');
  await expect(page.locator('#panel-seg')).toBeVisible();
  const accordion = page.locator('#panel-seg .acc-btn').first();
  await accordion.click();
  await expect(accordion).toHaveAttribute('aria-expanded', 'true');
  const panel = page.locator(`#${await accordion.getAttribute('aria-controls')}`);
  await expect(panel).toHaveAttribute('aria-hidden', 'false');
  await accordion.click();
  await expect(panel).toHaveAttribute('inert', '');
});

test('guia: zonas prevalecem por risco e mapa aceita teclado', async ({ page }) => {
  await page.goto(guide);
  const rules = page.locator('#classifier');
  await rules.locator('[data-rule="team"]').click();
  await expect(page.locator('#classResult .cz')).toHaveText('Zona 1');
  await rules.locator('[data-rule="connector"]').click();
  await expect(page.locator('#classResult .cz')).toHaveText('Zona 2');
  await rules.locator('[data-rule="sensitive"]').click();
  await expect(page.locator('#classResult .cz')).toHaveText('Zona 3');
  await expect(page.locator('[data-zone="3"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-zone="1"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#zoneInfo')).toContainText('Desenvolvimento cidadão');
});

test('guia: avaliação parcial, completa, persistência, resumo e radar sem cortes', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(guide);
  await page.locator('#questions [data-p="0"][data-q="0"][data-v="2"]').click();
  await page.locator('#questions [data-p="1"][data-q="0"][data-v="4"]').click();
  await expect(page.locator('#levelScore')).toHaveText('3,0');
  await expect(page.locator('#levelName')).toContainText('(parcial)');
  await page.reload();
  await expect(page.locator('#progressText')).toHaveText('2 de 15 perguntas respondidas');
  for (let pillar = 0; pillar < 5; pillar++) {
    for (let question = 0; question < 3; question++) {
      const option = page.locator(`#questions [data-p="${pillar}"][data-q="${question}"][data-v="${pillar + 1}"]`);
      if (await option.getAttribute('aria-checked') !== 'true') await option.click();
    }
  }
  await expect(page.locator('#levelScore')).toHaveText('3,0');
  await expect(page.locator('#levelName')).toHaveText('Nível Definido');
  await expect(page.locator('#progressText')).toHaveText('15 de 15 perguntas respondidas');
  await page.locator('#copyBtn').click();
  const summary = await page.evaluate(() => navigator.clipboard.readText());
  expect(summary).toContain('Segurança: 1,0/5');
  expect(summary).toContain('Confiabilidade: 5,0/5');
  const labels = await page.locator('#radarLabels text').evaluateAll((items) => items.map((item) => {
    const box = item.getBBox();
    return { x: box.x, y: box.y, right: box.x + box.width, bottom: box.y + box.height };
  }));
  for (const box of labels) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(420);
    expect(box.bottom).toBeLessThanOrEqual(420);
  }
  await page.locator('#resetBtn').click();
  await expect(page.locator('#levelScore')).toHaveText('–');
  await expect(page.locator('#progressText')).toHaveText('0 de 15 perguntas respondidas');
});

test('guia: radios com navegação por teclado', async ({ page }) => {
  await page.goto(guide);
  const first = page.locator('#questions [role="radiogroup"]').first();
  await first.locator('[data-v="1"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(first.locator('[data-v="2"]')).toBeFocused();
  await expect(first.locator('[data-v="2"]')).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('End');
  await expect(first.locator('[data-v="5"]')).toHaveAttribute('tabindex', '0');
  await page.keyboard.press('Home');
  await expect(first.locator('[data-v="1"]')).toHaveAttribute('aria-checked', 'true');
});

test('guia: checklist, copiar pendências e filtros RACI', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(guide);
  await expect(page.locator('.ck-box')).toHaveCount(31);
  await page.locator('.ck-box').first().click();
  await expect(page.locator('#ckCount')).toHaveText('1 de 31 controles implementados');
  await page.locator('#ckFilters [data-filter="open"]').click();
  await expect(page.locator('.ck-item:visible')).toHaveCount(30);
  await page.locator('#ckCopy').click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('[ ]');
  await page.reload();
  await expect(page.locator('.ck-box').first()).toHaveAttribute('aria-checked', 'true');
  await page.locator('#raciFilters [data-pillar-filter="seg"]').click();
  await expect(page.locator('#raciTable tbody tr:visible')).toHaveCount(3);
  await page.locator('#raciFilters [data-role="0"]').click();
  await expect(page.locator('#raciSummary')).toContainText('Admin Power Platform / Tenant');
  await page.locator('#ckReset').click();
  await expect(page.locator('#ckCount')).toHaveText('0 de 31 controles implementados');
});

test('guia: quiz completo, feedback, reinício e glossário', async ({ page }) => {
  await page.goto(guide);
  const answers = await page.evaluate(() => window.NEIVA_I18N.quiz.map((question) => question.a));
  for (const answer of answers) {
    await page.locator(`#quizCard .qopt[data-i="${answer}"]`).click();
    await expect(page.locator('.qfeed')).toContainText('Correto.');
    await expect(page.locator('.qfeed')).toBeFocused();
    await page.locator('#qNext').click();
  }
  await expect(page.locator('#qScoreNum')).toHaveText('10');
  await expect(page.locator('.qfinal .big')).toHaveText('10/10');
  await page.locator('#qRestart').click();
  await expect(page.locator('#qScoreNum')).toHaveText('0');
  const term = page.locator('.flip').first();
  await term.focus();
  await page.keyboard.press('Enter');
  await expect(term).toHaveAttribute('aria-pressed', 'true');
  await expect(term.locator('.flip-back')).toHaveAttribute('aria-hidden', 'false');
});

test('calculadora: números de referência, situação, padrões e entradas inválidas', async ({ page }) => {
  await page.goto(calculator);
  await page.locator('#users-0').fill('1000');
  await page.locator('#users-2').fill('200');
  await expect(page.locator('#mCredits')).toHaveText('18.810.000');
  await expect(page.locator('#aCredits')).toHaveText('225.720.000');
  await expect(page.locator('#recTitle')).toHaveText('Recomendado: Nível 8 — desconto de 17%');
  await expect(page.locator('[data-tier="8"]')).toContainText('Excedente: 720.000 créditos');
  await expect(page.locator('[data-tier="9"]')).toContainText('Ociosos: 74.280.000 créditos');
  await page.locator('#cpLight').fill('1');
  await page.locator('#zeroBtn').click();
  await expect(page.locator('#mCredits')).toHaveText('0');
  await expect(page.locator('#cpLight')).toHaveValue('1');
  await page.locator('#resetBtn').click();
  await expect(page.locator('#cpLight')).toHaveValue('125');
  await expect(page.locator('#light-0')).toHaveValue('22');
  for (const value of ['-1', '1.5', '']) {
    await page.locator('#users-0').fill(value);
    await expect(page.locator('#users-0')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#calcError')).toBeVisible();
    await expect(page.locator('#mCredits')).toHaveText('—');
    await expect(page.locator('#pdfBtn')).toBeDisabled();
  }
  await page.locator('#users-0').fill('1');
  await expect(page.locator('#calcError')).toBeHidden();
  await expect(page.locator('#pdfBtn')).toBeEnabled();
  await expect(page.locator('#mCredits')).toHaveText('14.250');
});

test('impressão preserva resultados e todas as colunas', async ({ page }, testInfo) => {
  await page.goto(calculator);
  await page.locator('#users-0').fill('1000');
  await page.emulateMedia({ media: 'print', colorScheme: 'dark' });
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.toolbar.no-print')).toBeHidden();
  await expect(page.locator('#recTitle')).toBeVisible();
  const table = await page.locator('.tiers-table').boundingBox();
  const width = await page.evaluate(() => document.documentElement.clientWidth);
  expect(table.width).toBeLessThanOrEqual(width);
  await page.pdf({ path: testInfo.outputPath('calculator.pdf'), preferCSSPageSize: true, printBackground: true });
  await page.emulateMedia({ media: 'screen' });
  await page.goto(guide);
  await page.locator('.mode-btn[data-mode="exec"]').click();
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.guide-tools')).toBeHidden();
  await expect(page.locator('#panel-cost')).toBeVisible();
  await expect(page.locator('#panel-cost .tech')).toBeVisible();
  await page.pdf({ path: testInfo.outputPath('governance.pdf'), preferCSSPageSize: true, printBackground: true });
});

test('endereço legado conserva fragmento e o guia abre o pilar solicitado', async ({ page }) => {
  await page.goto('governanca-agentes-copilot-studio-neiva.html?origin=legacy#panel-cost');
  await expect(page).toHaveURL(new RegExp(`${guide}\\?origin=legacy#panel-cost$`));
  await expect(page.locator('#panel-cost')).toBeVisible();
});

test('dados salvos inválidos não interrompem o guia', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('neiva-gov-assessment-v1', '[1,2,3,4,5]');
    localStorage.setItem('neiva-gov-checklist-v1', '"invalido"');
  });
  await page.goto(guide);
  await expect(page.locator('#questions .q')).toHaveCount(15);
  await expect(page.locator('#ckCount')).toHaveText('0 de 31 controles implementados');
  await expect(page.locator('#siteStatus')).toContainText('inválido');
});

for (const theme of ['light', 'dark']) {
  test(`pilares e feedback do quiz: acessibilidade em ${theme}`, async ({ page }) => {
    test.setTimeout(90000);
    await page.emulateMedia({ colorScheme: theme });
    await page.goto(guide);
    for (const [index, pillar] of ['seg', 'ops', 'cost', 'perf', 'rel'].entries()) {
      await page.locator(`#tab-${pillar}`).click();
      await page.locator(`#panel-${pillar} .acc-btn`).first().click();
      await page.locator(`#questions [data-p="${index}"][data-q="0"][data-v="4"]`).click();
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })), pillar).toEqual([]);
    }
    await page.locator('#quizCard .qopt[data-i="0"]').click();
    await expect(page.locator('.qfeed')).toContainText('Não é isso.');
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) }))).toEqual([]);
  });
}

test('armazenamento bloqueado não impede o uso e avisa o usuário', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Bloqueado', 'SecurityError'); } });
  });
  await page.goto(guide);
  await expect(page.locator('#questions .q')).toHaveCount(15);
  await expect(page.locator('#siteStatus')).toContainText('não ser mantidas');
  await page.locator('#questions [data-p="0"][data-q="0"][data-v="3"]').click();
  await expect(page.locator('#levelScore')).toHaveText('3,0');
});

test('404 oferece retorno e conteúdo estático funciona sem JavaScript', async ({ page, browser }) => {
  const response = await page.goto('pagina-inexistente/');
  expect(response.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Esta página não foi encontrada.');
  await page.getByRole('link', { name: 'Voltar ao início' }).click();
  await expect(page.locator('h1')).toContainText('Frontier');
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto('http://127.0.0.1:4178/frontier-transformation-engineer/' + guide);
    await expect(staticPage.locator('.guide-notice')).toBeVisible();
    await expect(staticPage.locator('#panel-cost')).toBeVisible();
    await expect(staticPage.locator('.site-nav')).toBeVisible();
    await staticPage.goto('http://127.0.0.1:4178/frontier-transformation-engineer/' + calculator);
    await expect(staticPage.locator('noscript .calc-error')).toBeVisible();
    await expect(staticPage.locator('.legal')).toContainText('Avisos legais');
  } finally {
    await context.close();
  }
});
