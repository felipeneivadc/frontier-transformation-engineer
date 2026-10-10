(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');
  var status = document.getElementById('siteStatus');
  var statusTimer;
  var storageWarningShown = false;

  function announce(message) {
    status.textContent = message;
    status.hidden = false;
    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(function () { status.hidden = true; }, 7000);
  }

  function storageError(error) {
    console.warn('NEIVA: armazenamento local indisponível ou inválido.', error);
    if (!storageWarningShown) {
      announce('Não foi possível acessar os dados salvos. Você pode continuar, mas suas alterações podem não ser mantidas ao sair.');
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
  window.NEIVA_SITE = { announce: announce, readStorage: readStorage, writeStorage: writeStorage, removeStorage: removeStorage };
  if (window.NEIVA_THEME_STORAGE_ERROR) storageError(new Error('Preferência de tema não disponível.'));

  var themeButton = document.getElementById('themeBtn');
  var preference = readStorage('neiva-theme');
  var themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
    themeButton.setAttribute('aria-label', theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
    themeButton.title = theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro';
  }
  applyTheme(document.documentElement.dataset.theme);
  themeButton.addEventListener('click', function () {
    preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(preference);
    writeStorage('neiva-theme', preference);
  });
  themeQuery.addEventListener('change', function (event) {
    if (preference !== 'light' && preference !== 'dark') applyTheme(event.matches ? 'dark' : 'light');
  });
  window.addEventListener('storage', function (event) {
    if (event.key !== 'neiva-theme' && event.key !== null) return;
    preference = readStorage('neiva-theme');
    applyTheme(preference === 'light' || preference === 'dark' ? preference : (themeQuery.matches ? 'dark' : 'light'));
  });

  var menu = document.getElementById('siteNav');
  var menuButton = document.getElementById('siteMenuBtn');
  function closeMenu(returnFocus) {
    menu.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir navegação do portal');
    if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar navegação do portal' : 'Abrir navegação do portal');
  });
  menu.addEventListener('click', function (event) {
    if (event.target.closest('a')) closeMenu(false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) closeMenu(true);
  });
  document.addEventListener('click', function (event) {
    if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu(false);
  });
  menu.addEventListener('focusout', function () {
    window.setTimeout(function () {
      if (!menu.contains(document.activeElement) && document.activeElement !== menuButton) closeMenu(false);
    }, 0);
  });
  window.matchMedia('(min-width: 1101px)').addEventListener('change', function () { closeMenu(false); });

  var header = document.getElementById('siteHeader');
  function updateHeader() { header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
})();
