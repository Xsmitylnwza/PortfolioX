// @ts-check
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';

const SOURCE_EXTENSION = /\.(?:js|jsx|ts|tsx|css)$/;

/** @param {string} root */
export function maintainedSources(root) {
  const files = [];
  /** @param {string} directory */
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = resolve(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (SOURCE_EXTENSION.test(entry.name)) files.push(relative(root, absolute).replaceAll('\\', '/'));
    }
  };
  visit(resolve(root, 'src'));
  files.push('index.html');
  return files.sort();
}

/** @param {string} root @param {string[]} [files] */
export function sourceHash(root, files = maintainedSources(root)) {
  const hash = createHash('sha256');
  for (const file of files) {
    hash.update(file);
    hash.update('\0');
    hash.update(readFileSync(resolve(root, file)));
    hash.update('\0');
  }
  return hash.digest('hex');
}

/** @param {string} root @param {string | null | undefined} id */
function toSource(root, id) {
  if (!id || id.startsWith('\0')) return null;
  const cleaned = id.split('?')[0];
  const path = relative(root, cleaned).replaceAll('\\', '/');
  return path.startsWith('src/') && SOURCE_EXTENSION.test(path) ? path : null;
}

/** @param {string} root @returns {import("vite").Plugin} */
export function qualityGraphPlugin(root) {
  const relativeOutput = process.env.PORTFOLIO_QUALITY_GRAPH_PATH;
  if (!relativeOutput) return { name: 'portfolio-quality-graph-disabled' };
  const output = resolve(root, relativeOutput);
  const outputRoot = resolve(root, 'output/quality');
  if (!output.startsWith(`${outputRoot}${sep}`) || existsSync(output)) {
    throw new Error('Quality graph path must be a new child of output/quality');
  }
  return {
    name: 'portfolio-quality-graph',
    apply: 'build',
    generateBundle(_options, bundle) {
      const files = maintainedSources(root);
      const sourceSet = new Set(files);
      const active = new Set();
      /** @type {Record<string, {static: string[], dynamic: string[]}>} */
      const edges = {};
      const chunks = [];
      for (const item of Object.values(bundle)) {
        if (item.type === 'chunk') {
          chunks.push({ file: item.fileName, bytes: Buffer.byteLength(item.code), modules: Object.keys(item.modules).map((id) => toSource(root, id)).filter((path) => path !== null) });
          for (const id of Object.keys(item.modules)) {
            const path = toSource(root, id);
            if (path) active.add(path);
          }
        } else if (item.fileName.endsWith('.css')) {
          chunks.push({ file: item.fileName, bytes: typeof item.source === 'string' ? Buffer.byteLength(item.source) : item.source.length, modules: [] });
        }
      }
      for (const id of this.getModuleIds()) {
        const path = toSource(root, id);
        if (!path) continue;
        // A JS module that only imports CSS can be removed from emitted JS
        // while its CSS remains reachable from the entry graph.
        active.add(path);
        const info = this.getModuleInfo(id);
        if (!info) continue;
        edges[path] = {
          static: info.importedIds.map((item) => toSource(root, item)).filter((item) => item !== null),
          dynamic: info.dynamicallyImportedIds.map((item) => toSource(root, item)).filter((item) => item !== null),
        };
      }
      const pending = [...active].filter((path) => path.endsWith('.css'));
      while (pending.length) {
        const parent = pending.pop();
        if (!parent) continue;
        const css = readFileSync(resolve(root, parent), 'utf8');
        for (const match of css.matchAll(/@import\s+(?:url\()?\s*['"]([^'"]+)['"]/g)) {
          if (!match[1].startsWith('.')) continue;
          const child = relative(root, resolve(root, dirname(parent), match[1])).replaceAll('\\', '/');
          if (!sourceSet.has(child)) continue;
          edges[parent] ??= { static: [], dynamic: [] };
          edges[parent].static.push(child);
          if (!active.has(child)) { active.add(child); pending.push(child); }
        }
      }
      const report = {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        sourceHash: sourceHash(root, files),
        files,
        active: [...active].sort(),
        edges,
        chunks,
      };
      mkdirSync(dirname(output), { recursive: true });
      writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
    },
  };
}
