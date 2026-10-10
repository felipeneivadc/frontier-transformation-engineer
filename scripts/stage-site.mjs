import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const destination = resolve(root, '_site');
const entries = [
  'index.html', '404.html', 'governanca-agentes-copilot-studio-neiva.html',
  'assets', 'guias', 'ferramentas', '.nojekyll', 'LICENSE', 'THIRD_PARTY_NOTICES.md'
];
await rm(destination, { recursive: true, force: true });
await mkdir(destination);
for (const entry of entries) await cp(resolve(root, entry), resolve(destination, entry), { recursive: true });
console.log('Artefato estático preparado em _site, sem dependências ou arquivos de desenvolvimento.');
