// @ts-check
import { existsSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { maintainedSources } from './quality-graph.mjs';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sources = maintainedSources(ROOT).filter((path) => /\.(?:js|jsx|ts|tsx)$/.test(path));
const sourceSet = new Set(sources);
const graph = new Map();
const failures = [];

/** @param {string} parent @param {string} specifier */
function resolveSource(parent, specifier) {
  if (!specifier.startsWith('.')) return null;
  const base = resolve(ROOT, dirname(parent), specifier);
  const withoutExtension = base.replace(/\.(?:js|jsx|ts|tsx)$/, '');
  const candidates = [base, ...['.ts', '.tsx', '.js', '.jsx'].map((ext) => `${withoutExtension}${ext}`),
    ...['index.ts', 'index.tsx', 'index.js', 'index.jsx'].map((name) => resolve(base, name))];
  for (const candidate of candidates) {
    const path = relative(ROOT, candidate).replaceAll('\\', '/');
    if (sourceSet.has(path) && existsSync(candidate)) return path;
  }
  return null;
}

const APP_SHELL = new Set([
  'src/main.tsx', 'src/App.tsx', 'src/AppPageRoutes.tsx',
]);
const APP_AND_ROUTE_OWNERS = new Set([
  ...APP_SHELL,
  'src/features/project-details/ProjectRoute.tsx',
  'src/features/project-details/projectRenderers.ts',
]);
/** @type {Record<string, string>} */
const CASE_LAYOUT_OWNERS = {
  ProjectDetailsDecrypt: 'decrypt',
  ProjectDetailsFreeflow: 'freeflow',
  ProjectDetailsHermes: 'hermes',
  ProjectDetailsKeshi: 'keshi',
  ProjectDetailsKeshiNext: 'keshi',
  ProjectDetailsModeNote: 'modenote',
  ProjectDetailsModeNoteData: 'modenote',
  ProjectDetailsModeNoteProofs: 'modenote',
  ProjectDetailsMux: 'veluma',
  ProjectDetailsVibe: 'vibe',
  ProjectDetailsVibeData: 'vibe',
  ProjectDetailsVibeLive: 'vibe',
  ProjectDetailsZucchini: 'zucchini',
  ProjectDetailsFallback: 'fallback',
};
const SHARED_DETAIL_MODULES = new Set([
  'ProjectDetailsFormat', 'ProjectDetailsMediaSource', 'ProjectDetailsMedia',
  'ProjectDetailsPrimitives', 'ProjectDetailsShared', 'ProjectDetailsShell',
  'ProjectDetailsStyles',
]);

/** @param {string} path */
function owner(path) {
  const caseDirectory = path.match(/^src\/features\/project-details\/cases\/([^/]+)\//)?.[1];
  if (caseDirectory) return caseDirectory;
  const layout = path.match(/^src\/components\/([^/]+)\.(?:ts|tsx)$/)?.[1];
  return layout ? CASE_LAYOUT_OWNERS[layout] ?? null : null;
}

/** @param {string} path */
function isShared(path) {
  return /^src\/(?:data|hooks|types)\//.test(path)
    || /^src\/features\/project-details\/shared\//.test(path)
    || (/^src\/components\//.test(path) && !owner(path));
}

/** @param {string} path */
export function unclassifiedDetail(path) {
  const name = path.match(/^src\/components\/(ProjectDetails[^/]+)\.(?:ts|tsx)$/)?.[1];
  return Boolean(name && !CASE_LAYOUT_OWNERS[name] && !SHARED_DETAIL_MODULES.has(name));
}

/** @param {string} file @param {string} target */
export function edgeViolations(file, target) {
  const violations = [];
  const fromCase = owner(file);
  const toCase = owner(target);
  if (fromCase && toCase && fromCase !== toCase) {
    violations.push(`${file}: imports another case owner ${target}`);
  }
  if (fromCase && (APP_AND_ROUTE_OWNERS.has(target) || /^src\/app\//.test(target))) {
    violations.push(`${file}: imports app shell ${target}`);
  }
  if ((isShared(file) || /^src\/features\//.test(file)) && !fromCase
    && (APP_SHELL.has(target) || /^src\/app\//.test(target))) {
    violations.push(`${file}: lower layer imports app shell ${target}`);
  }
  if (isShared(file) && toCase) {
    violations.push(`${file}: shared code imports case owner ${target}`);
  }
  return violations;
}

for (const file of sources) {
  if (unclassifiedDetail(file)) failures.push(`${file}: unclassified project-detail owner`);
  const text = readFileSync(resolve(ROOT, file), 'utf8');
  const tree = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true,
    file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const imports = new Set();
  /** @param {import("typescript").Node} node */
  const visit = (node) => {
    let specifier = null;
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
      && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      specifier = node.moduleSpecifier.text;
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword
      && node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0])) {
      specifier = node.arguments[0].text;
    }
    if (specifier) {
      const target = resolveSource(file, specifier);
      if (target) imports.add(target);
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
  graph.set(file, imports);
  for (const target of imports) {
    failures.push(...edgeViolations(file, target));
  }
}

const visiting = new Set();
const visited = new Set();
/** @param {string} node @param {string[]} trail */
function detectCycle(node, trail) {
  if (visiting.has(node)) {
    failures.push(`import cycle: ${[...trail, node].join(' -> ')}`);
    return;
  }
  if (visited.has(node)) return;
  visiting.add(node);
  for (const target of graph.get(node) ?? []) detectCycle(target, [...trail, node]);
  visiting.delete(node);
  visited.add(node);
}
for (const file of sources) detectCycle(file, []);

// Advisory signals only: a single consumer is not proof of a bad wrapper.
// Include dynamic case edges when measuring the longest source import path.
const consumers = new Map(sources.map((file) => [file, new Set()]));
for (const [file, dependencies] of graph) {
  for (const dependency of dependencies) consumers.get(dependency)?.add(file);
}
const shortSingleConsumer = sources.filter((file) =>
  /\.tsx$/.test(file) && consumers.get(file)?.size === 1
  && readFileSync(resolve(ROOT, file), 'utf8').split(/\r?\n/).length <= 41);
const depthCache = new Map();
/** @param {string} file @param {Set<string>} trail */
function maxHops(file, trail = new Set()) {
  if (trail.has(file)) return 0;
  if (depthCache.has(file)) return depthCache.get(file);
  const next = new Set(trail);
  next.add(file);
  const hops = Math.max(0, ...[...(graph.get(file) ?? [])].map((child) => 1 + maxHops(child, next)));
  depthCache.set(file, hops);
  return hops;
}
console.log(`quality review: longest import path from main ${maxHops('src/main.tsx')} hops; ${shortSingleConsumer.length} short TSX modules have one consumer (candidates: ${shortSingleConsumer.slice(0, 12).join(', ') || 'none'}${shortSingleConsumer.length > 12 ? ', …' : ''})`);
for (const failure of failures) console.error(`quality boundaries: ${failure}`);
console.log(`quality boundaries: ${sources.length} modules, ${failures.length} failure(s)`);
if (failures.length) process.exitCode = 1;
