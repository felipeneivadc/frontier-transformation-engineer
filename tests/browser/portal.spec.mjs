import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { text } from "node:stream/consumers";
import { pathToFileURL } from "node:url";
const guide = "copilot-studio/governanca/";
const tools = "ferramentas/";
const calculator = "ferramentas/calculadora-creditos/";
const advisor = "ferramentas/agent-advisor/";
const discovery = "ferramentas/ai-discovery-studio/";
const pages = [
  ["home", "./"],
  ["studio", "copilot-studio/"],
  ["m365", "microsoft-365-copilot/"],
  ["tools", tools],
  ["guide", guide],
  ["calculator", calculator],
  ["advisor", advisor],
  ["discovery", discovery],
];
for (const [name, route] of pages) {
  test(`${name}: layouts e assets em cinco larguras e dois temas`, async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400 && response.url().includes("127.0.0.1"))
        errors.push(response.url());
    });
    for (const theme of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(page.locator("h1")).toBeVisible();
        if (name === "home")
          await expect(page.locator(".hub-card")).toHaveCount(3);
        if (name === "tools")
          await expect(page.locator(".resource-section")).toHaveCount(3);
        if (name === "guide")
          await expect(page.locator("#questions .q")).toHaveCount(15);
        if (name === "calculator") {
          await page.locator('[data-select="cowork"]').check();
          await page.locator("#cowork-corp-users").fill("100");
        }
        if (name === "advisor")
          await expect(page.locator("#catGrid .cat-card")).toHaveCount(10);
        if (name === "discovery")
          await expect(page.locator("#journey-nav .nav-button")).toHaveCount(6);
        await expect(
          page.locator('.site-nav [aria-current="page"]'),
        ).toHaveCount(1);
        const size = await page.evaluate(() => ({
          width: document.documentElement.clientWidth,
          scroll: document.documentElement.scrollWidth,
        }));
        expect(size.scroll, `${name} ${theme} ${width}`).toBeLessThanOrEqual(
          size.width + 1,
        );
        expect(
          await page
            .locator("img")
            .evaluateAll((images) =>
              images
                .filter((image) => !image.complete || !image.naturalWidth)
                .map((image) => image.src),
            ),
        ).toEqual([]);
      }
    }
    expect(errors).toEqual([]);
  });
}
for (const theme of ["light", "dark"]) {
  test(`AA: hubs, guia e três produtos em ${theme}`, async ({ page }) => {
    test.setTimeout(90000);
    await page.emulateMedia({ colorScheme: theme });
    for (const route of [
      "./",
      "copilot-studio/",
      "microsoft-365-copilot/",
      tools,
      guide,
      calculator,
      advisor,
      discovery,
    ]) {
      await page.goto(route);
      if (route === calculator) {
        for (const id of ["standard", "harness", "cowork"])
          await page.locator(`[data-select="${id}"]`).check();
        await page.locator("#cowork-corp-users").fill("100");
        await page.locator("#harness-usage-people").fill("100");
        await page.locator("#harness-usage-frequency").fill("1");
      }
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        result.violations.map(({ id, nodes }) => ({
          id,
          nodes: nodes.map(({ target, failureSummary }) => ({
            target,
            failureSummary,
          })),
        })),
        route,
      ).toEqual([]);
    }
  });
}
test("navegação móvel e tema compartilhado entre hubs e ferramenta", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await page.locator("#siteMenuBtn").click();
  await expect(page.locator("#siteNav")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#siteMenuBtn")).toBeFocused();
  await page.locator("#themeBtn").click();
  const theme = await page.locator("html").getAttribute("data-theme");
  await page.locator("#siteMenuBtn").click();
  await page.locator('.site-nav [data-page="studio"]').click();
  await expect(page).toHaveURL(/copilot-studio\/$/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  await page
    .getByRole("link", { name: /^Guia de governança de agentes/ })
    .click();
  await expect(page).toHaveURL(new RegExp(`${guide}$`));
  await page.locator("#siteMenuBtn").click();
  await page.locator('.site-nav [data-page="tools"]').click();
  await expect(page).toHaveURL(new RegExp(`${tools}$`));
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
});
test("catálogo: busca sem acentos, nenhum resultado e links corretos", async ({
  page,
}) => {
  await page.goto("copilot-studio/");
  await expect(page.locator(".resource-section")).toHaveCount(3);
  await page.locator("#resourceSearch").fill("governanca");
  await expect(
    page.getByRole("link", {
      name: /^Guia de governança de agentes/,
    }),
  ).toBeVisible();
  await page.locator("#resourceSearch").fill("termo-inexistente-xyz");
  await expect(page.locator(".empty-state")).toContainText("Nenhum recurso");
  await page.goto("microsoft-365-copilot/");
  await page.getByRole("link", { name: /^Estimar Copilot Cowork/ }).click();
  await expect(page.locator('[data-select="cowork"]')).toBeChecked();
  await expect(page.locator("#form-cowork")).toBeVisible();
  await expect(page.locator("#form-standard")).toBeHidden();
});
test("Agent Advisor: filtra o catálogo, recomenda e exporta o diagnóstico", async ({
  page,
}) => {
  await page.goto(advisor);
  await page.locator("#catSearch").fill("Foundry");
  expect(await page.locator(".cat-card:not(.hide)").count()).toBeGreaterThan(0);
  await page.locator("#catSearch").fill("");
  await page.locator('[data-path="build"]').click();
  await page.locator('[data-nav="next"]').click();
  for (let index = 0; index < 5; index += 1) {
    await page.locator("#stepHost .opt").first().click();
    await page.locator('[data-nav="next"]').click();
  }
  await expect(page.locator(".res-hero")).toBeVisible();
  await expect(page).toHaveURL(/#p=build.*r=1/);
  const download = page.waitForEvent("download");
  await page.locator('[data-act="md"]').click();
  expect((await download).suggestedFilename()).toBe(
    "recomendacao-agentes-neiva.md",
  );
});
test("AI Discovery Studio: muda de etapa e exporta a sessão local", async ({
  page,
}, testInfo) => {
  await page.goto(discovery);
  await page.locator("#local-save").check();
  await expect(page.locator("#save-status")).toContainText("RASCUNHO LOCAL");
  await page.locator('#journey-nav [data-route="understand"]').click();
  await expect(page.locator("#discovery-content h1")).toContainText(
    "Entenda o trabalho",
  );
  await page.locator('[data-action="new-journey"]').first().click();
  await expect(page.locator("#main-dialog[open]")).toBeVisible();
  await page
    .locator('#main-dialog [data-action="close-dialog"]')
    .first()
    .click();
  await page.locator('[data-action="export"]').first().click();
  await expect(page.locator("#main-dialog[open]")).toContainText(
    /exportação da sessão/i,
  );
  const download = page.waitForEvent("download");
  await page.locator('[data-action="export-json"]').click();
  await expect((await download).suggestedFilename()).toMatch(
    /^NEIVA_AI_Discovery_.*\.json$/,
  );
  const standaloneDownload = page.waitForEvent("download");
  await page.locator('[data-action="export-html"]').click();
  const standalone = await standaloneDownload;
  expect(standalone.suggestedFilename()).toMatch(
    /^NEIVA_AI_Discovery_.*\.html$/,
  );
  const standaloneContent = await text(await standalone.createReadStream());
  expect(standaloneContent).toContain('id="neiva-discovery-engine"');
  const standalonePath = testInfo.outputPath("discovery-session.html");
  await standalone.saveAs(standalonePath);
  await page.goto(pathToFileURL(standalonePath).href);
  await expect(page.locator("#discovery-content .page")).toHaveCount(1);
});
test("calculadora: todas as combinações e consolidação sem teto", async ({
  page,
}) => {
  for (const ids of [
    ["standard"],
    ["harness"],
    ["cowork"],
    ["standard", "harness"],
    ["standard", "cowork"],
    ["harness", "cowork"],
    ["standard", "harness", "cowork"],
  ]) {
    await page.goto(calculator + "?products=" + ids.join(","));
    await expect(page.locator(".subtotal")).toHaveCount(ids.length);
    for (const id of ids)
      await expect(page.locator(`#form-${id}`)).toBeVisible();
  }
  await page.locator("#cowork-corp-users").fill("100");
  await page.locator("#harness-usage-people").fill("100");
  await page.locator("#harness-usage-frequency").fill("1");
  await expect(page.locator("#totalCredits")).toHaveText("1.082.400+");
  await expect(page.locator("#totalSummary")).toContainText("Mínimo estimado");
  await page.locator("#p3Panel").click();
  await expect(page.locator("#p3Results")).toContainText(
    "não há recomendação definitiva",
  );
  await expect(page.locator(".pricing-table tbody tr")).toHaveCount(10);
  await page.locator("#harness-usage-heavy").fill("0");
  await page.locator("#harness-usage-medium").fill("60");
  await expect(page.locator("#totalCredits")).toHaveText("994.400 – 1.830.400");
});
test("calculadora: Standard, licença, agentes e unidades explícitas", async ({
  page,
}) => {
  await page.goto(calculator + "?products=standard");
  await page.locator("#standard-1-users").fill("100");
  await page.locator("#standard-1-frequency").fill("10");
  await page.locator("#standard-1-graph").fill("20");
  await expect(page.locator("#totalCredits")).toHaveText("2.000");
  await page.locator("[data-agent-advanced] > summary").click();
  await page.locator("#standard-1-tools").fill("1");
  await page.locator("#standard-1-flowActions").fill("10000");
  await expect(page.locator("#totalCredits")).toHaveText("5.800");
  await page.locator("#standard-1-licensed").fill("100");
  await page.locator('[data-field="eligible"]').check();
  await expect(page.locator("#totalCredits")).toHaveText("0");
  await page.locator("#standard-1-cua").fill("1");
  await expect(page.locator("#totalCredits")).toHaveText("2.500");
  await page.locator("#addAgent").click();
  await expect(page.locator("[data-agent-card]")).toHaveCount(2);
  await page.locator('[data-remove-agent="2"]').click();
  await expect(page.locator("[data-agent-card]")).toHaveCount(1);
});
test("calculadora: entradas inválidas, percentuais e restauração", async ({
  page,
}) => {
  await page.goto(calculator + "?products=cowork");
  await page.locator("#cowork-corp-users").fill("100");
  await expect(page.locator("#totalCredits")).toHaveText("510.400 – 906.400");
  for (const value of ["-1", "1.5", ""]) {
    await page.locator("#cowork-corp-users").fill(value);
    await expect(page.locator("#totalSummary")).toContainText("indisponível");
    await expect(page.locator("#pdfBtn")).toBeDisabled();
  }
  await page.locator("#cowork-corp-users").fill("100");
  await page.locator("#cowork-corp-heavy").fill("30");
  await expect(page.locator("#productResults")).toContainText("somar 100%");
  await page.locator("#resetBtn").click();
  await expect(page.locator("#cowork-corp-heavy")).toHaveValue("20");
  await expect(page.locator("#cowork-corp-users")).toHaveValue("0");
  await expect(page.locator('[data-select="cowork"]')).toBeChecked();
});
test("guia: modos, abas, acordeões, avaliação e persistência", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(guide);
  await expect(page.locator("#questions .q")).toHaveCount(15);
  await page.locator('.mode-btn[data-mode="exec"]').click();
  await expect(page.locator("#panel-seg .tech")).toBeHidden();
  await page.reload();
  await expect(page.locator("body")).toHaveAttribute("data-mode", "exec");
  await page.locator('.mode-btn[data-mode="tech"]').click();
  await page.locator("#tab-seg").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#panel-ops")).toBeVisible();
  await page.keyboard.press("End");
  await expect(page.locator("#panel-rel")).toBeVisible();
  await page.keyboard.press("Home");
  const button = page.locator("#panel-seg .acc-btn").first();
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await page.locator('#questions [data-p="0"][data-q="0"][data-v="2"]').click();
  await page.locator('#questions [data-p="1"][data-q="0"][data-v="4"]').click();
  await expect(page.locator("#levelScore")).toHaveText("3,0");
  await page.reload();
  await expect(page.locator("#progressText")).toContainText("2 de 15");
  await page.locator("#copyBtn").click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "Segurança",
  );
  await page.locator("#resetBtn").click();
  await expect(page.locator("#levelScore")).toHaveText("–");
});
test("guia: zonas, checklist, RACI, quiz completo e glossário", async ({
  page,
}) => {
  await page.goto(guide);
  await page.locator('#classifier [data-rule="connector"]').click();
  await expect(page.locator("#classResult .cz")).toHaveText("Zona 2");
  await page.locator('#classifier [data-rule="sensitive"]').click();
  await expect(page.locator("#classResult .cz")).toHaveText("Zona 3");
  await expect(page.locator(".ck-box")).toHaveCount(31);
  await page.locator(".ck-box").first().click();
  await page.locator('#ckFilters [data-filter="open"]').click();
  await expect(page.locator(".ck-item:visible")).toHaveCount(30);
  await page.reload();
  await expect(page.locator(".ck-box").first()).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(page.locator("#raciTable tbody tr")).toHaveCount(13);
  await page.locator('#raciFilters [data-pillar-filter="seg"]').click();
  await expect(page.locator("#raciTable tbody tr:visible")).toHaveCount(3);
  const answers = await page.evaluate(() =>
    window.NEIVA_I18N.quiz.map((question) => question.a),
  );
  for (const answer of answers) {
    await page.locator(`#quizCard .qopt[data-i="${answer}"]`).click();
    await expect(page.locator(".qfeed")).toBeFocused();
    await page.locator("#qNext").click();
  }
  await expect(page.locator(".qfinal .big")).toHaveText("10/10");
  await page.locator("#qRestart").click();
  const term = page.locator(".flip").first();
  await term.focus();
  await page.keyboard.press("Enter");
  await expect(term).toHaveAttribute("aria-pressed", "true");
});
test("URLs antigas preservam parâmetros e fragmentos", async ({ page }) => {
  for (const route of [
    "governanca-agentes-copilot-studio-neiva.html",
    "guias/governanca-agentes/",
  ]) {
    await page.goto(route + "?origin=legacy#panel-cost");
    await expect(page).toHaveURL(
      new RegExp(`${guide}\\?origin=legacy#panel-cost$`),
    );
    await expect(page.locator("#panel-cost")).toBeVisible();
  }
});
test("PDF inclui produtos e parâmetros, sem controles globais", async ({
  page,
}, testInfo) => {
  await page.goto(calculator + "?products=standard,harness,cowork");
  await page.locator("#cowork-corp-users").fill("100");
  await page.locator("#harness-usage-people").fill("100");
  await page.locator("#harness-usage-frequency").fill("1");
  await page.locator("#p3Panel").click();
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator("#totalCredits")).toHaveText("1.082.400+");
  await page.pdf({
    path: testInfo.outputPath("estimate.pdf"),
    preferCSSPageSize: true,
    printBackground: true,
  });
  await page.emulateMedia({ media: "screen" });
  await page.goto(guide);
  await page.locator('.mode-btn[data-mode="exec"]').click();
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("#panel-cost .tech")).toBeVisible();
  await page.pdf({
    path: testInfo.outputPath("governance.pdf"),
    preferCSSPageSize: true,
    printBackground: true,
  });
});
test("armazenamento bloqueado não impede o guia", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    }),
  );
  await page.goto(guide);
  await expect(page.locator("#questions .q")).toHaveCount(15);
  await expect(page.locator("#siteStatus")).toContainText("não ser mantidas");
});
test("404 e alternativa sem JavaScript", async ({ page, browser }) => {
  const response = await page.goto("inexistente/");
  expect(response.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText(
    "Esta página não foi encontrada.",
  );
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto(
      "http://127.0.0.1:4178/frontier-transformation-engineer/" + guide,
    );
    await expect(staticPage.locator(".guide-notice")).toBeVisible();
    await expect(staticPage.locator("#panel-cost")).toBeVisible();
    await expect(staticPage.locator(".fallback-nav")).toBeVisible();
  } finally {
    await context.close();
  }
});
