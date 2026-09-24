#!/usr/bin/env node
// Capture the task-start source snapshot required by AI-DESIGN-HARNESS-PLAN step 1.
//
// Writes a copy of every maintained UI source plus a manifest recording git
// state, dirty/untracked files and per-file sha256. Step 2 lints this copy to
// derive the persisted debt baseline, so the baseline provably describes the
// pre-edit source rather than post-migration code.
//
// Usage: node scripts/design-snapshot.mjs [--out <dir>] [--label <name>]

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { MAINTAINED_UI_GLOBS, isExcluded, toPosix } from './design-scope.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i === -1 ? fallback : process.argv[i + 1];
}

function git(...args) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

async function collectFiles() {
  const found = new Set();
  for (const pattern of MAINTAINED_UI_GLOBS) {
    for await (const entry of glob(pattern, { cwd: ROOT })) {
      const rel = toPosix(entry);
      if (!isExcluded(rel)) found.add(rel);
    }
  }
  return [...found].sort();
}

const label = arg('--label', 'phase-1');
const outDir = resolve(ROOT, arg('--out', join('docs', 'design', 'harness', `${label}-snapshot`)));

const files = await collectFiles();
if (files.length === 0) {
  console.error('design-snapshot: maintained scope resolved to zero files — refusing to write an empty snapshot.');
  process.exit(1);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(join(outDir, 'source'), { recursive: true });

const entries = files.map((rel) => {
  const abs = join(ROOT, rel);
  const bytes = readFileSync(abs);
  const dest = join(outDir, 'source', rel);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(abs, dest);
  return {
    path: rel,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
});

// Dirty state matters: this checkout carries uncommitted UI work, so a bare
// commit hash would not identify the source that produced the baseline.
const porcelain = git('status', '--porcelain=v1');
const dirty = porcelain
  .split('\n')
  .filter(Boolean)
  .map((line) => ({ status: line.slice(0, 2).trim(), path: toPosix(line.slice(3)) }))
  .filter((entry) => !isExcluded(entry.path));

const treeHash = createHash('sha256')
  .update(entries.map((e) => `${e.path}:${e.sha256}`).join('\n'))
  .digest('hex');

const manifest = {
  label,
  capturedAt: new Date().toISOString(),
  git: {
    head: git('rev-parse', 'HEAD'),
    branch: git('rev-parse', '--abbrev-ref', 'HEAD'),
    cleanCheckout: porcelain === '',
  },
  scope: { globs: MAINTAINED_UI_GLOBS, fileCount: entries.length },
  treeHash,
  dirtyOrUntrackedInScope: dirty,
  files: entries,
};

writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`design-snapshot: ${entries.length} files -> ${toPosix(relative(ROOT, outDir))}`);
console.log(`  head      ${manifest.git.head} (${manifest.git.branch})`);
console.log(`  treeHash  ${treeHash}`);
console.log(`  dirty in scope: ${dirty.length} path(s)`);
