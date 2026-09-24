#!/usr/bin/env node
// Compare an after-migration computed-style capture against the phase-1
// before-state, and report any value that moved.
//
// The token migration's whole claim is "nothing rendered changed". This is what
// checks that claim instead of asserting it.
//
// Usage: node scripts/design-compare-render.mjs <after.json>
//   after.json: { captures: [ { route, viewport, environment, results } ] }

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BEFORE = resolve(ROOT, 'docs/design/harness/phase-1-before-render.json');

const afterPath = process.argv[2];
if (!afterPath) {
  console.error('usage: node scripts/design-compare-render.mjs <after.json>');
  process.exit(1);
}

const before = JSON.parse(readFileSync(BEFORE, 'utf8'));
const after = JSON.parse(readFileSync(resolve(afterPath), 'utf8'));

const key = (capture) => `${capture.route}/${capture.viewport}`;
const beforeByKey = new Map(before.captures.map((c) => [key(c), c]));

let changed = 0;
let compared = 0;
let skipped = 0;

for (const afterCapture of after.captures) {
  const id = key(afterCapture);
  const beforeCapture = beforeByKey.get(id);
  if (!beforeCapture) {
    console.log(`? ${id}: no before-capture, skipping`);
    continue;
  }

  // devicePixelRatio changes how Chrome snaps used border widths, so comparing
  // across different dpr would report differences the migration did not cause.
  const beforeDpr = beforeCapture.environment.devicePixelRatio;
  const afterDpr = afterCapture.environment.devicePixelRatio;
  if (beforeDpr !== afterDpr) {
    console.log(`! ${id}: devicePixelRatio ${beforeDpr} -> ${afterDpr}; border widths are not comparable`);
  }

  const beforeResults = new Map(beforeCapture.results.map((r) => [r.id, r]));
  for (const afterResult of afterCapture.results) {
    const beforeResult = beforeResults.get(afterResult.id);
    if (!beforeResult) { skipped += 1; continue; }
    if (!beforeResult.found || !afterResult.found) {
      console.log(`! ${id} ${afterResult.id}: found ${beforeResult.found} -> ${afterResult.found}`);
      changed += 1;
      continue;
    }

    for (const [property, beforeValue] of Object.entries(beforeResult.values)) {
      compared += 1;
      const afterValue = afterResult.values[property];
      if (afterValue !== beforeValue) {
        changed += 1;
        const sentinel = beforeResult.sentinel ? '  [SENTINEL]' : '';
        console.log(`✗ ${id} ${afterResult.id} ${property}${sentinel}`);
        console.log(`    before: ${beforeValue}`);
        console.log(`    after:  ${afterValue}`);
      }
    }

    for (const dimension of ['width', 'height']) {
      compared += 1;
      const b = beforeResult.box?.[dimension];
      const a = afterResult.box?.[dimension];
      // Sub-pixel layout noise is not a token regression; anything that moved
      // a visible amount is.
      if (b !== undefined && a !== undefined && Math.abs(a - b) > 0.5) {
        changed += 1;
        console.log(`✗ ${id} ${afterResult.id} box.${dimension}: ${b} -> ${a}`);
      }
    }
  }
}

console.log('');
console.log(`compared ${compared} values across ${after.captures.length} capture(s)`);
console.log(`unmatched targets: ${skipped}`);
console.log(changed === 0 ? '✓ no rendered value changed' : `✗ ${changed} value(s) changed`);
process.exit(changed === 0 ? 0 : 1);
