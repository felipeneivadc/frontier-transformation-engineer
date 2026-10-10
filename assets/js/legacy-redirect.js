(function () {
  'use strict';
  var target = new URL('guias/governanca-agentes/', window.location.href);
  target.search = window.location.search;
  target.hash = window.location.hash;
  window.location.replace(target.href);
})();
