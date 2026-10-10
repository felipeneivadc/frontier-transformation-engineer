import { HUBS, GROUPS, RESOURCES } from "./catalog.js";
const root = new URL("../../", import.meta.url);
const esc = (value) =>
  String(value).replace(
    /[&<>"]/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char],
  );
const home = document.getElementById("hubCards");
if (home)
  home.innerHTML = HUBS.map(
    (hub) => `<a class="hub-card" href="${new URL(hub.path, root)}">
  <img src="${new URL(`assets/images/${hub.icon}`, root)}" alt="" width="52" height="52">
  <span class="hub-card-copy"><span class="eyebrow-small">${esc(hub.subtitle)}</span><h2>${esc(hub.title)}</h2><p>${esc(hub.description)}</p><span class="hub-card-action">Explorar recursos <span aria-hidden="true">→</span></span></span></a>`,
  ).join("");
const container = document.getElementById("hubResources");
if (container) {
  const hub = document.body.dataset.hub;
  const items = RESOURCES.filter((resource) => resource.hub === hub);
  const normalize = (text) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  function render() {
    const query = normalize(
      document.getElementById("resourceSearch").value.trim(),
    );
    const matches = items.filter((item) =>
      normalize(`${item.title} ${item.description} ${item.type}`).includes(
        query,
      ),
    );
    document.getElementById("resourceCount").textContent =
      `${matches.length} recurso(s)`;
    container.innerHTML =
      Object.entries(GROUPS)
        .map(([id, title]) => {
          const rows = matches.filter((item) => item.group === id);
          if (!rows.length) return "";
          return `<details class="resource-section" id="${id}" open><summary>${esc(title)} <span>${rows.length}</span></summary><ul>
        ${rows
          .map((item) => {
            const external = item.href.startsWith("https:");
            return `<li><a href="${new URL(item.href, root)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}><span class="resource-name">${esc(item.title)}${external ? ' <span aria-hidden="true">↗</span>' : ""}</span><span class="resource-desc">${esc(item.description)}</span></a><span class="resource-origin">${esc(item.type)}</span></li>`;
          })
          .join("")}</ul></details>`;
        })
        .join("") ||
      '<p class="empty-state" role="status">Nenhum recurso encontrado. Tente outro termo.</p>';
  }
  document.getElementById("resourceSearch").addEventListener("input", render);
  render();
}
