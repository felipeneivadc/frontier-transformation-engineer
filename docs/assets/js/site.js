(function () {
  "use strict";
  var root = new URL("../../", document.currentScript.src);
  var href = function (path) {
    return new URL(path, root).href;
  };
  var page = document.body.dataset.page || "home";
  var headerSlot = document.querySelector("[data-site-header]");
  if (headerSlot)
    headerSlot.outerHTML =
      '<header class="site-header" id="siteHeader"><div class="site-container site-header-inner">' +
      '<a class="site-brand" href="' +
      href("") +
      '" aria-label="Frontier Transformation Engineer — início"><img class="site-logo" src="' +
      href("assets/images/logo.png") +
      '" alt="" width="44" height="44"><span class="site-brand-copy"><strong>Frontier Transformation Engineer</strong><small>NEIVA Cloud Solutions</small></span></a>' +
      '<nav class="site-nav" id="siteNav" aria-label="Navegação do portal">' +
      [
        ["home", "", "Início"],
        ["studio", "copilot-studio/", "Copilot Studio"],
        ["m365", "microsoft-365-copilot/", "Microsoft 365 / Cowork"],
        ["tools", "ferramentas/", "Ferramentas"],
      ]
        .map(function (item) {
          return (
            '<a href="' +
            href(item[1]) +
            '" data-page="' +
            item[0] +
            '"' +
            (page === item[0] ? ' aria-current="page"' : "") +
            ">" +
            item[2] +
            "</a>"
          );
        })
        .join("") +
      '</nav><div class="site-controls"><button class="site-icon-button site-theme" id="themeBtn" type="button" aria-label="Ativar tema escuro" aria-pressed="false"><svg class="theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg><svg class="theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2m10-10 2-2"/></svg></button>' +
      '<button class="site-icon-button site-menu" id="siteMenuBtn" type="button" aria-label="Abrir navegação do portal" aria-expanded="false" aria-controls="siteNav"><svg class="menu-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg><svg class="menu-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button></div></div></header>';
  var footerSlot = document.querySelector("[data-site-footer]");
  if (footerSlot)
    footerSlot.outerHTML =
      '<footer class="site-footer"><div class="site-container"><div class="site-footer-top"><div class="site-footer-brand"><img src="' +
      href("assets/images/logo.png") +
      '" alt="" width="40" height="40"><div><strong>NEIVA Cloud Solutions</strong><span>Transformando complexidade em conhecimento.</span></div></div><nav class="site-footer-links" aria-label="Links institucionais"><a href="https://www.neivacloudsolutions.com" target="_blank" rel="noopener noreferrer">NEIVA ↗</a><a href="https://github.com/felipeneivadc/frontier-transformation-engineer" target="_blank" rel="noopener noreferrer">Repositório ↗</a></nav></div><div class="site-footer-bottom"><p>© 2026 NEIVA Cloud Solutions. Todos os direitos reservados.</p><p>Projeto independente, não afiliado à Microsoft. Estimativas não contratuais.</p></div></div></footer>';
  document.documentElement.classList.remove("no-js");
  var status = document.getElementById("siteStatus");
  var statusTimer;
  var storageWarningShown = false;

  function announce(message) {
    status.textContent = message;
    status.hidden = false;
    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(function () {
      status.hidden = true;
    }, 7000);
  }

  function storageError(error) {
    console.warn("NEIVA: armazenamento local indisponível ou inválido.", error);
    if (!storageWarningShown) {
      announce(
        "Não foi possível acessar os dados salvos. Você pode continuar, mas suas alterações podem não ser mantidas ao sair.",
      );
      storageWarningShown = true;
    }
  }

  function readStorage(key) {
    try {
      var value = window.localStorage.getItem(key);
      return value === null ? null : JSON.parse(value);
    } catch (error) {
      storageError(error);
      return null;
    }
  }
  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      storageError(error);
      return false;
    }
  }
  function removeStorage(key) {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      storageError(error);
      return false;
    }
  }
  window.NEIVA_SITE = {
    announce: announce,
    readStorage: readStorage,
    writeStorage: writeStorage,
    removeStorage: removeStorage,
  };
  if (window.NEIVA_THEME_STORAGE_ERROR)
    storageError(new Error("Preferência de tema não disponível."));

  var themeButton = document.getElementById("themeBtn");
  var preference = readStorage("neiva-theme");
  var themeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeButton.setAttribute("aria-pressed", String(theme === "dark"));
    themeButton.setAttribute(
      "aria-label",
      theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro",
    );
    themeButton.title =
      theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro";
  }
  applyTheme(document.documentElement.dataset.theme);
  themeButton.addEventListener("click", function () {
    preference =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(preference);
    writeStorage("neiva-theme", preference);
  });
  themeQuery.addEventListener("change", function (event) {
    if (preference !== "light" && preference !== "dark")
      applyTheme(event.matches ? "dark" : "light");
  });
  window.addEventListener("storage", function (event) {
    if (event.key !== "neiva-theme" && event.key !== null) return;
    preference = readStorage("neiva-theme");
    applyTheme(
      preference === "light" || preference === "dark"
        ? preference
        : themeQuery.matches
          ? "dark"
          : "light",
    );
  });

  var menu = document.getElementById("siteNav");
  var menuButton = document.getElementById("siteMenuBtn");
  function closeMenu(returnFocus) {
    menu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir navegação do portal");
    if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener("click", function () {
    var open = menu.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute(
      "aria-label",
      open ? "Fechar navegação do portal" : "Abrir navegação do portal",
    );
  });
  menu.addEventListener("click", function (event) {
    if (event.target.closest("a")) closeMenu(false);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menu.classList.contains("is-open"))
      closeMenu(true);
  });
  document.addEventListener("click", function (event) {
    if (!menu.contains(event.target) && !menuButton.contains(event.target))
      closeMenu(false);
  });
  menu.addEventListener("focusout", function () {
    window.setTimeout(function () {
      if (
        !menu.contains(document.activeElement) &&
        document.activeElement !== menuButton
      )
        closeMenu(false);
    }, 0);
  });
  window
    .matchMedia("(min-width: 1101px)")
    .addEventListener("change", function () {
      closeMenu(false);
    });

  var header = document.getElementById("siteHeader");
  function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
})();
