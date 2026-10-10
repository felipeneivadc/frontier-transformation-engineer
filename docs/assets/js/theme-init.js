(function () {
  "use strict";
  var theme = null;
  try {
    var stored = window.localStorage.getItem("neiva-theme");
    if (stored) theme = JSON.parse(stored);
  } catch (error) {
    console.warn("NEIVA: não foi possível ler a preferência de tema.", error);
    window.NEIVA_THEME_STORAGE_ERROR = true;
  }
  if (theme !== "light" && theme !== "dark") {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  document.documentElement.dataset.theme = theme;
})();
