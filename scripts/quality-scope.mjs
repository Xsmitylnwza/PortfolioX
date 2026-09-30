// @ts-check
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { RENDER_TARGETS } from './design-check.config.mjs';
import { maintainedSources, sourceHash } from './quality-graph.mjs';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PARKED = new Set(JSON.parse(readFileSync(resolve(ROOT, 'scripts/quality-parked-sources.json'), 'utf8')));
/** @type {Array<{path: string; owner: string; proof: string; reason: string}>} */
const extensions = JSON.parse(readFileSync(resolve(ROOT, 'scripts/quality-extension-sources.json'), 'utf8'));
const EXTENSIONS = new Map(extensions
  .map((entry) => [entry.path, entry]));
/** @type {Array<{path: string; owner: string; proof: string; reason: string}>} */
const typeSources = JSON.parse(readFileSync(resolve(ROOT, 'scripts/quality-type-sources.json'), 'utf8'));
const TYPE_ONLY = new Map(typeSources
  .map((entry) => [entry.path, entry]));

/**
 * Each route has one selected lazy entry. Traverse static dependencies only:
 * following every dynamic edge from projectRenderers would incorrectly assign
 * all case stories to every route. The shared CSS entry remains in the graph.
 */
/** @type {Record<string, string | null>} */
const ROUTE_ENTRIES = {
  '/': null,
  '/persona': 'src/components/PersonaReloadView.tsx',
  '/experience': 'src/components/Experience.tsx',
  '/stack': 'src/components/StackPage.tsx',
  '/contact': 'src/components/ContactPage.tsx',
  '/project/keshi-pomodoro': 'src/features/project-details/cases/keshi/KeshiCase.tsx',
  '/project/keshi-pomodoro?layout=next': 'src/features/project-details/cases/keshi/KeshiNextCase.tsx',
  '/project/zucchini-review': 'src/features/project-details/cases/zucchini/ZucchiniCase.tsx',
  '/project/freeflow': 'src/features/project-details/cases/freeflow/FreeFlowCase.tsx',
  '/project/modenote': 'src/features/project-details/cases/modenote/ModeNoteCase.tsx',
  '/project/decrypt-password': 'src/features/project-details/cases/decrypt/DecryptCase.tsx',
  '/project/veluma': 'src/features/project-details/cases/veluma/VelumaCase.tsx',
  '/project/hermes-command-center': 'src/features/project-details/cases/hermes/HermesCase.tsx',
  '/project/unknown-project': 'src/features/project-details/MissingProject.tsx',
};
const ENTRY = 'src/main.tsx';
const ROUTER = 'src/features/project-details/projectRenderers.ts';
const PAGE_ROUTER = 'src/AppPageRoutes.tsx';
const APP = 'src/App.tsx';

/** @typedef {{schemaVersion: number; sourceHash: string; active: string[]; edges: Record<string, {static: string[]; dynamic: string[]}>}} QualityGraph */
/** @param {QualityGraph} graph @param {string[]} roots */
function staticReachability(graph, roots) {
  const visited = new Set();
  const pending = [...roots];
  while (pending.length) {
    const file = pending.pop();
    if (!file || visited.has(file)) continue;
    visited.add(file);
    pending.push(...(graph.edges[file]?.static ?? []));
  }
  return visited;
}

/** @param {QualityGraph | null} graph */
export function inspectScope(graph) {
  const failures = [];
  const files = maintainedSources(ROOT);
  if (graph?.schemaVersion !== 1 || graph.sourceHash !== sourceHash(ROOT, files)) {
    return ['missing or stale single-build quality graph'];
  }
  const active = new Set(graph.active);
  if (!graph.edges || !active.has(ENTRY)) return ['quality graph has no entry or dependency edges'];
  const declaredPaths = new Set(RENDER_TARGETS.map((target) => target.path));
  const common = staticReachability(graph, [ENTRY]);
  for (const target of RENDER_TARGETS) {
    if (!(target.path in ROUTE_ENTRIES)) {
      failures.push(`needs-scope: no graph entry registered for route ${target.path}`);
      continue;
    }
    const selected = ROUTE_ENTRIES[target.path];
    if (selected && !active.has(selected)) {
      failures.push(`missing route entry in quality graph: ${target.path} -> ${selected}`);
      continue;
    }
    const importer = target.path.startsWith('/project/') ? ROUTER
      : target.path === '/experience' ? APP : PAGE_ROUTER;
    if (selected && (!common.has(importer) || !(graph.edges[importer]?.dynamic ?? []).includes(selected))) {
      failures.push(`missing selected lazy import in quality graph: ${target.path} -> ${selected}`);
      continue;
    }
    if (selected && common.has(selected)) {
      failures.push(`eager route entry defeats lazy boundary: ${target.path} -> ${selected}`);
    }
    const reachable = selected ? staticReachability(graph, [...common, selected]) : common;
    if (selected && !target.sources.some((pattern) => pattern.test(selected))) {
      failures.push(`needs-scope: route entry is not declared: ${target.path} -> ${selected}`);
    }
    for (const file of active) {
      const declared = target.sources.some((pattern) => pattern.test(file));
      if (reachable.has(file) && /\.(?:js|jsx|ts|tsx)$/.test(file) && !declared
        && !EXTENSIONS.has(file)) {
        failures.push(`missing route mapping: ${target.path} -> ${file}`);
      }
      if (declared && !reachable.has(file)) {
        failures.push(`false route mapping: ${target.path} -> ${file}`);
      }
    }
  }
  for (const path of Object.keys(ROUTE_ENTRIES)) {
    if (!declaredPaths.has(path)) failures.push(`missing render target for route: ${path}`);
  }
  for (const file of files) {
    if (file === 'index.html') continue;
    const routes = RENDER_TARGETS.filter((target) => target.sources.some((pattern) => pattern.test(file)));
    if (active.has(file)) {
      if (PARKED.has(file)) failures.push(`active source still declared parked: ${file}`);
      if (routes.length === 0 && !EXTENSIONS.has(file)) failures.push(`needs-scope: active source has no route: ${file}`);
    } else if (!PARKED.has(file) && !TYPE_ONLY.has(file)) {
      failures.push(`needs-scope: disconnected source has no parked owner: ${file}`);
    }
  }
  for (const file of PARKED) {
    if (!files.includes(file)) failures.push(`stale parked declaration: ${file}`);
  }
  for (const [file, entry] of EXTENSIONS) {
    if (!files.includes(file) || !active.has(file)) failures.push(`stale extension declaration: ${file}`);
    if (!entry.owner || !entry.proof || !entry.reason) failures.push(`incomplete extension declaration: ${file}`);
  }
  for (const [file, entry] of TYPE_ONLY) {
    if (!files.includes(file) || active.has(file)) failures.push(`stale type-only declaration: ${file}`);
    if (!entry.owner || !entry.proof || !entry.reason) failures.push(`incomplete type-only declaration: ${file}`);
  }
  return failures;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const index = process.argv.indexOf('--graph');
  const graphPath = index >= 0 ? process.argv[index + 1] : null;
  if (!graphPath) {
    console.error('usage: node scripts/quality-scope.mjs --graph <output/quality/graph.json>');
    process.exit(2);
  }
  const graph = JSON.parse(readFileSync(resolve(ROOT, graphPath), 'utf8'));
  const failures = inspectScope(graph);
  for (const failure of failures) console.error(failure);
  console.log(`quality scope: ${graph.active.length} active, ${PARKED.size} parked, ${failures.length} failure(s)`);
  if (failures.length) process.exitCode = 1;
}
