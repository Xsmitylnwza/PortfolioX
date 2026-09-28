#!/usr/bin/env node
// Render the three retained generic Project Details compositions without
// exporting them from production code or adding a public test route.
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
/** @param {string} name @param {string} fallback */
const option = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const output = resolve(root, option('--out', `output/playwright/modularization-fallback-fixture-${randomUUID()}.json`));
if (!output.startsWith(resolve(root, 'output/playwright') + sep) || existsSync(output)) {
  throw new Error('Choose a new output/playwright/*.json path');
}

const server = await createServer({
  root,
  logLevel: 'silent',
  optimizeDeps: { noDiscovery: true, entries: [] },
  server: { middlewareMode: true },
  appType: 'custom',
});
const results = [];
try {
  const { projects } = /** @type {typeof import('../src/data/projects.ts')} */ (await server.ssrLoadModule('/src/data/projects.ts'));
  const layouts = await server.ssrLoadModule('/src/components/ProjectDetailsFallback.tsx');
  const project = projects.find((item) => item.id === 'veluma');
  if (!project) throw new Error('Veluma fixture record missing');
  const props = {
    project,
    decision: 'A fixture-only design decision.',
    techItems: project.tags || [],
    gallery: project.gallery || [],
    hasLive: false,
    hasRepo: false,
  };
  for (const [name, marker] of [
    ['CinemaLayout', 'case-layout-hero--cinema'],
    ['FeatureLayout', 'case-feature'],
    ['DossierLayout', 'case-dossier-top'],
  ]) {
    const Component = layouts[name];
    if (typeof Component !== 'function') throw new Error(`${name} is not a component`);
    const html = renderToStaticMarkup(createElement(MemoryRouter, null,
      createElement(Component, props)));
    const pass = html.includes('id="case-title"') && html.includes('Veluma')
      && html.includes(marker) && html.includes('data-wave-follow')
      && html.includes('case-media__frame');
    results.push({ name, marker, bytes: Buffer.byteLength(html), pass });
  }
} finally {
  await server.close();
}
const pass = results.length === 3 && results.every((item) => item.pass);
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify({ schemaVersion: 1, pass, results }, null, 2)}\n`);
console.log(`generic layout fixture ${pass ? 'PASS' : 'FAIL'}: ${results.map((item) => `${item.name}=${item.pass}`).join(', ')}`);
if (!pass) process.exitCode = 1;
