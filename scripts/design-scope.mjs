// Maintained source scope for the design harness.
// Single definition shared by the snapshot capture and (later) the checker,
// so "what we hashed" and "what we lint" can never drift apart.

import { sep } from 'node:path';

export const MAINTAINED_UI_GLOBS = [
  'src/**/*.js',
  'src/**/*.jsx',
  'src/**/*.css',
  'index.html',
];

// Directories that must never enter any harness scope: build output, browser
// profiles, recordings, scratch files and prototype experiments.
export const EXCLUDED_DIRS = [
  'node_modules',
  'dist',
  'output',
  'artifacts',
  'design',
  'public',
  'tmp',
  '.git',
  '.vercel',
  '.playwright-cli',
  '.impeccable',
];

export const EXCLUDED_PREFIXES = ['tmp-'];

export function toPosix(path) {
  return sep === '/' ? path : path.split(sep).join('/');
}

export function isExcluded(relPath) {
  const [head] = toPosix(relPath).split('/');
  if (EXCLUDED_DIRS.includes(head)) return true;
  return EXCLUDED_PREFIXES.some((prefix) => head.startsWith(prefix));
}
