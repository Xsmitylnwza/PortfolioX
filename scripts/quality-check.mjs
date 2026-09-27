#!/usr/bin/env node
// @ts-check
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const stages = [
  ['app typecheck', ['node_modules/typescript/bin/tsc', '--project', 'tsconfig.json']],
  ['tooling typecheck', ['node_modules/typescript/bin/tsc', '--project', 'tsconfig.tools.json']],
  ['tooling lint', ['node_modules/eslint/bin/eslint.js', 'scripts', 'eslint.config.js', 'vite.config.js', 'stylelint.config.mjs', '--quiet']],
  ['boundary policy tests', ['scripts/quality-boundaries.test.mjs']],
  ['import boundaries', ['scripts/quality-boundaries.mjs']],
  ['growth policy tests', ['scripts/quality-growth.test.mjs']],
  ['growth budget', ['scripts/quality-growth.mjs']],
  ['design and one Vite build', ['scripts/design-check.mjs', '--full']],
];

for (const [label, [script, ...args]] of stages) {
  console.log(`quality: ${label}`);
  try {
    execFileSync(process.execPath, [resolve(ROOT, script), ...args], {
      cwd: ROOT,
      stdio: 'inherit',
    });
  } catch {
    console.error(`quality: failed at ${label}`);
    process.exit(1);
  }
}
console.log('quality: mechanical checks pass; rendering still needs route evidence');
