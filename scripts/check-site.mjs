import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const prefix = '/frontier-transformation-engineer/';
const origin = 'https://felipeneivadc.github.io';
async function collect(directory, extension) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) result.push(...await collect(path, extension));
    else if (entry.name.endsWith(extension)) result.push(path);
  }
  return result;
}
const pages = [resolve(root, 'index.html'), resolve(root, '404.html'), resolve(root, 'governanca-agentes-copilot-studio-neiva.html'),
  ...await collect(resolve(root, 'guias'), '.html'), ...await collect(resolve(root, 'ferramentas'), '.html')];
const contents = new Map();
const errors = [];
for (const page of pages) {
  const html = await readFile(page, 'utf8');
  contents.set(page, html);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  if (new Set(ids).size !== ids.length) errors.push(`IDs duplicados: ${relative(root, page)}`);
  if (!html.includes('lang="pt-BR"')) errors.push(`Idioma ausente: ${relative(root, page)}`);
  if (html.includes('data:image')) errors.push(`Imagem embutida em vez de asset compartilhado: ${relative(root, page)}`);
}
for (const [page, html] of contents) {
  const pageUrl = new URL(relative(root, page).replaceAll('\\', '/'), `${origin}${prefix}`);
  for (const match of html.matchAll(/\s(?:src|href)="([^"]+)"/g)) {
    const value = match[1];
    if (/^(?:https?:|mailto:|data:)/.test(value)) continue;
    const url = new URL(value, pageUrl);
    if (!url.pathname.startsWith(prefix)) { errors.push(`Link fora do prefixo Pages: ${value} em ${relative(root, page)}`); continue; }
    let path = resolve(root, ...decodeURIComponent(url.pathname.slice(prefix.length)).split('/'));
    try {
      if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
      await stat(path);
      if (url.hash && path.endsWith('.html')) {
        const target = contents.get(path) || await readFile(path, 'utf8');
        if (!target.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) errors.push(`Fragmento inexistente: ${value} em ${relative(root, page)}`);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      errors.push(`Arquivo não encontrado: ${value} em ${relative(root, page)}`);
    }
  }
}
for (const file of [...await collect(resolve(root, 'assets/js'), '.js'), ...await collect(resolve(root, 'scripts'), '.mjs')]) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) errors.push(result.stderr || `Falha de sintaxe: ${relative(root, file)}`);
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) await stat(resolve(dirname(file), match[1]));
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`${pages.length} páginas: links, assets, fragmentos, prefixo Pages e sintaxe válidos.`);
}
