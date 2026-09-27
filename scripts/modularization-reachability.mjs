#!/usr/bin/env node
// Report active-entry module reachability, including dynamic imports and CSS.
// A disconnected module is a review candidate, not proof it should be deleted.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
/** @param {string} name @param {string} fallback */
const option = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const output = resolve(root, option('--out', 'output/playwright/modularization-reachability.json'));
if (!output.startsWith(resolve(root, 'output/playwright') + sep) || existsSync(output)) {
  throw new Error('Choose a new output/playwright/*.json path');
}
/** @param {string} id */
const normalize = (id) => {
  if (!id || id.startsWith('\0')) return null;
  const clean = id.split('?')[0];
  const path = relative(root, clean).replaceAll('\\', '/');
  return path.startsWith('src/') ? path : null;
};
/** @type {string[]} */
const sourceFiles = [];
/** @param {string} directory */
function visit(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) visit(path);
    else if (/\.(?:js|jsx|ts|tsx|css)$/.test(entry.name)) sourceFiles.push(relative(root, path).replaceAll('\\', '/'));
  }
}
visit(resolve(root, 'src'));

/** @type {Set<string>} */
const bundleModules = new Set();
/** @type {Map<string,{static:string[],dynamic:string[]}>} */
const edges = new Map();
let emittedCss = 0;
await build({
  root,
  logLevel: 'error',
  build: { write: false },
  plugins: [{
    name: 'modularization-reachability',
    generateBundle(_options, bundle) {
      for (const item of Object.values(bundle)) {
        if (item.type === 'asset' && item.fileName.endsWith('.css')) emittedCss += 1;
        if (item.type !== 'chunk') continue;
        for (const id of Object.keys(item.modules)) {
          const path = normalize(id);
          if (path) bundleModules.add(path);
        }
      }
      for (const id of this.getModuleIds()) {
        const source = normalize(id);
        if (!source) continue;
        const info = this.getModuleInfo(id);
        if (!info) continue;
        // CSS-only entry modules may disappear from emitted JavaScript, but
        // their imports are still live. Match the single-build graph's scope.
        bundleModules.add(source);
        edges.set(source, {
          static: info.importedIds.map(normalize).filter((path) => path !== null).sort(),
          dynamic: info.dynamicallyImportedIds.map(normalize).filter((path) => path !== null).sort(),
        });
      }
    },
  }],
});

// CSS @import is flattened into emitted assets and is not always listed as a
// separate Rollup chunk module (tokens.css is the current example).
const runtimeSources = new Set(bundleModules);
const pendingCss = [...runtimeSources].filter((path) => path.endsWith('.css'));
while (pendingCss.length) {
  const parent = pendingCss.pop();
  if (!parent) continue;
  const text = readFileSync(resolve(root, parent), 'utf8');
  for (const match of text.matchAll(/@import\s+(?:url\()?\s*['"]([^'"]+)['"]/g)) {
    if (!match[1].startsWith('.')) continue;
    const child = relative(root, resolve(root, dirname(parent), match[1])).replaceAll('\\', '/');
    if (!sourceFiles.includes(child) || runtimeSources.has(child)) continue;
    runtimeSources.add(child);
    if (child.endsWith('.css')) pendingCss.push(child);
  }
}

const sourceSet = new Set(sourceFiles);
/** @param {string} parent @param {string} specifier */
const resolveImport = (parent, specifier) => {
  if (!specifier.startsWith('.')) return null;
  const base = resolve(root, dirname(parent), specifier);
  for (const candidate of [base, `${base}.js`, `${base}.jsx`, `${base}.ts`, `${base}.tsx`, `${base}.css`, resolve(base, 'index.js'), resolve(base, 'index.jsx'), resolve(base, 'index.ts'), resolve(base, 'index.tsx')]) {
    const path = relative(root, candidate).replaceAll('\\', '/');
    if (sourceSet.has(path)) return path;
  }
  return null;
};
/** @param {string} path @param {string} text */
const scannedImports = (path, text) => {
  const staticSpecs = [
    ...[...text.matchAll(/\bfrom\s*['"]([^'"]+)['"]/g)].map((match) => match[1]),
    ...[...text.matchAll(/\bimport\s*['"]([^'"]+)['"]/g)].map((match) => match[1]),
  ];
  const dynamicSpecs = [...text.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)]
    .map((match) => match[1]);
  return {
    static: [...new Set(staticSpecs.map((specifier) => resolveImport(path, specifier)).filter((item) => item !== null))].sort(),
    dynamic: [...new Set(dynamicSpecs.map((specifier) => resolveImport(path, specifier)).filter((item) => item !== null))].sort(),
  };
};

const source = sourceFiles.sort().map((path) => {
  const bytes = statSync(resolve(root, path)).size;
  const text = readFileSync(resolve(root, path), 'utf8');
  const assetRefs = [...new Set(text.match(/\/assets\/[A-Za-z0-9_./-]+/g) || [])].sort();
  const imports = edges.get(path) || scannedImports(path, text);
  return { path, bytes, runtime: runtimeSources.has(path),
    staticImports: imports.static, dynamicImports: imports.dynamic, assetRefs };
});
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  entry: sourceFiles.includes('src/main.tsx') ? 'src/main.tsx' : 'src/main.jsx',
  emittedCss,
  runtimeCount: source.filter((item) => item.runtime).length,
  disconnectedCount: source.filter((item) => !item.runtime).length,
  source,
};
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`reachability: ${source.length} source files, ${report.runtimeCount} in bundle, ${report.disconnectedCount} disconnected, ${emittedCss} CSS assets`);
for (const item of source.filter((entry) => !entry.runtime)) console.log(`  ${item.path}`);
