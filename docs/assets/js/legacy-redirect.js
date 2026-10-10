(function () {
  "use strict";
  var root = new URL("../../", document.currentScript.src);
  var target = new URL("copilot-studio/governanca/", root);
  target.search = window.location.search;
  target.hash = window.location.hash;
  window.location.replace(target.href);
})();
