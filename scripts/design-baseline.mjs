#!/usr/bin/env node
// Derive the persisted debt baseline from the pre-edit source snapshot.
//
// The baseline must describe the source as it stood BEFORE the harness touched
// anything, so migration work can never be absorbed into it as "existing debt".
// That is why this lints the snapshot copy rather than the working tree, and
// why it refuses to run if the snapshot is missing.
//
// Fingerprints are `rule | path | normalized selector | normalized declaration`
// with an occurrence count — not line numbers. Moving a rule down a file must
// not read as "old violation gone, new violation appeared".
//
// Usage:
//   node scripts/design-baseline.mjs --capture [--family color]
//   node scripts/design-baseline.mjs --verify
//   node scripts/design-baseline.mjs --prune   (maintenance; retires fixed debt)

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ESLint } from 'eslint';
import stylelint from 'stylelint';

import {
  GOVERNED,
  TOKEN_SOURCES,
  governedPropertyMap,
  strictScopeFor,
} from './design-check.config.mjs';
import { toPosix } from './design-scope.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SNAPSHOT_DIR = join(ROOT, 'docs', 'design', 'harness', 'phase-1-snapshot');
const SNAPSHOT_SOURCE = join(SNAPSHOT_DIR, 'source');
const BASELINE_PATH = join(ROOT, 'scripts', 'design-check-baseline.json');

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i === -1 ? fallback : process.argv[i + 1];
}
const has = (name) => process.argv.includes(name);

/** Collapse whitespace so reformatting does not invent or retire debt. */
export const normalize = (text) => text.replace(/\s+/g, ' ').trim();

// Mechanical CSS moves retain the original pre-edit debt identity. This maps
// paths only: selector, declaration and occurrence count must still match the
// immutable snapshot, so a new violation cannot be forgiven by a move.
export const MOVED_CSS_DEBT_PATHS = new Map([
  ['src/components/ProjectDetailsMux.css', 'src/components/ProjectDetails.css'],
  ['src/components/ProjectDetailsZuch.css', 'src/components/ProjectDetails.css'],
  ['src/components/ProjectDetailsKeshiStory.css', 'src/components/ProjectDetailsStories.css'],
  ['src/components/ProjectDetailsDecryptStory.css', 'src/components/ProjectDetailsStories.css'],
  ['src/components/ProjectDetailsZuchStory.css', 'src/components/ProjectDetailsStories.css'],
  ['src/components/ProjectDetailsStorySharedOverrides.css', 'src/components/ProjectDetailsStories.css'],
  ['src/components/ProjectDetailsKeshiStoryOverrides.css', 'src/components/ProjectDetailsStories.css'],
  ['src/components/ProjectDetailsDecryptStoryOverrides.css', 'src/components/ProjectDetailsStories.css'],
]);

/**
 * Stable identity for one violation. Exported so the fixture tests exercise the
 * real implementation instead of a copy that could drift from it.
 */
export function fingerprint({ rule, path, selector, declaration }) {
  return [rule, MOVED_CSS_DEBT_PATHS.get(path) ?? path, normalize(selector ?? ''), normalize(declaration ?? '')].join(' | ');
}

/**
 * New violations are counts above the allowance, per fingerprint.
 *
 * `strict` entries are violations inside a migrated scope: they get no
 * allowance at all, so re-introducing a literal that predates the migration
 * still fails. Everything else ratchets against its recorded debt.
 */
export function newViolations(baselineDebt, currentCounts, strictKeys = new Set()) {
  const out = [];
  for (const [key, count] of currentCounts) {
    const allowed = strictKeys.has(key) ? 0 : (baselineDebt[key] ?? 0);
    if (count > allowed) out.push({ key, count, allowed, strict: strictKeys.has(key) });
  }
  return out;
}

/**
 * Lint one tree and return warnings enriched with the selector/declaration
 * context the fingerprint needs. Stylelint reports line/column, so the context
 * is recovered from the source text at that position.
 */
async function lintTree({ sourceRoot, registrySources }) {
  const config = {
    plugins: [
      join(ROOT, 'scripts', 'stylelint-design-tokens.mjs'),
      join(ROOT, 'scripts', 'stylelint-design-boundaries.mjs'),
    ],
    rules: {
      'design/token-usage': [true, { registrySources, propertyMap: governedPropertyMap() }],
      'design/ownership-boundaries': true,
    },
  };

  const files = [];
  for await (const entry of glob('src/**/*.css', { cwd: sourceRoot })) {
    files.push(toPosix(entry));
  }
  files.sort();

  const out = [];
  for (const rel of files) {
    const abs = join(sourceRoot, rel);
    const css = readFileSync(abs, 'utf8');
    const lines = css.split('\n');
    const { results } = await stylelint.lint({ code: css, codeFilename: rel, config });
    for (const warning of results[0].warnings) {
      const line = lines[warning.line - 1] ?? '';
      // Nearest preceding selector gives stable context without parsing twice.
      let selector = '';
      for (let i = warning.line - 2; i >= 0; i -= 1) {
        const candidate = lines[i].trim();
        if (candidate.endsWith('{')) { selector = candidate.slice(0, -1).trim(); break; }
        if (candidate.endsWith('}')) break;
      }
      const property = (line.trim().split(':')[0] ?? '').trim().toLowerCase();
      out.push({
        rule: warning.rule,
        path: rel,
        selector,
        declaration: line.trim(),
        family: governedPropertyMap().get(property) ?? 'unknown',
        text: warning.text,
      });
    }
  }
  return out;
}

/**
 * Lint the JS/JSX of one tree and return every finding worth ratcheting.
 *
 * ESLint has no debt mechanism of its own. Without this, two things break:
 * `design/token-usage-jsx` would hard-fail on 49 findings that predate the
 * rule, and the two long-standing React errors would make `--full` impossible
 * to pass. Both are existing debt, so both belong in the ratchet: visible,
 * forgiven, and impossible to add to.
 */
async function lintJsTree({ sourceRoot }) {
  // cwd is the tree being linted, because the repo config's `files` patterns
  // are relative to cwd: with cwd=ROOT the snapshot's nested path would match
  // no config block and its pre-existing JSX debt would read as zero, i.e. as
  // brand new. overrideConfigFile keeps the rules identical for both trees.
  const eslint = new ESLint({
    cwd: sourceRoot,
    overrideConfigFile: join(ROOT, 'eslint.config.js'),
    errorOnUnmatchedPattern: false,
  });

  let results;
  try {
    results = await eslint.lintFiles(['src/**/*.{js,jsx}']);
  } catch (error) {
    console.error(`design-baseline: eslint failed for ${sourceRoot}: ${error.message}`);
    process.exit(1);
  }

  const out = [];
  for (const result of results) {
    // Report paths relative to the tree being linted, so a snapshot finding and
    // the same finding in the checkout share one fingerprint.
    const rel = toPosix(relative(sourceRoot, result.filePath));
    const lines = (result.source ?? readFileSync(result.filePath, 'utf8')).split(String.fromCharCode(10));
    for (const message of result.messages) {
      // Warnings that are not design rules are advisory; ratcheting them would
      // turn style preferences into gates.
      if (!message.ruleId) continue;
      if (!message.ruleId.startsWith('design/') && message.severity < 2) continue;
      out.push({
        rule: message.ruleId,
        path: rel,
        selector: '',
        declaration: (lines[message.line - 1] ?? '').trim(),
        family: 'jsx',
        text: message.message,
      });
    }
  }
  return out;
}

function tally(warnings) {
  const counts = new Map();
  for (const warning of warnings) {
    const key = fingerprint(warning);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/**
 * Read the token registry as it exists IN THAT TREE.
 *
 * The pre-edit snapshot predates src/styles/tokens.css, so a missing source is
 * expected there, not an error: the snapshot's registry is what the project
 * actually had before the migration, which is the whole point of measuring the
 * baseline against it.
 */
function registryFrom(sourceRoot) {
  return TOKEN_SOURCES
    .map((path) => {
      const abs = join(sourceRoot, path);
      return existsSync(abs) ? [path, readFileSync(abs, 'utf8')] : null;
    })
    .filter(Boolean);
}

// --- CLI -------------------------------------------------------------------
// Guarded so the pure helpers above can be imported by the fixture tests
// without the process exiting on import.

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (!isCli) { /* imported as a module: stop here */ }
else if (!existsSync(SNAPSHOT_SOURCE)) {
  console.error(
    'design-baseline: no pre-edit snapshot at docs/design/harness/phase-1-snapshot/source.\n' +
    '  Run `node scripts/design-snapshot.mjs` before the first application-code edit.\n' +
    '  Refusing to derive a baseline from the working tree: post-edit diagnostics are not existing debt.',
  );
  process.exit(1);
}

else if (has('--capture')) {
  const family = arg('--family', null);
  const enabled = Object.entries(GOVERNED).filter(([, spec]) => spec.enabled).map(([f]) => f);
  if (family && !enabled.includes(family)) {
    console.error(`design-baseline: family "${family}" is not enabled (enabled: ${enabled.join(', ') || 'none'}).`);
    process.exit(1);
  }

  const snapshotWarnings = [
    ...await lintTree({
      sourceRoot: SNAPSHOT_SOURCE,
      registrySources: registryFrom(SNAPSHOT_SOURCE),
    }),
    // The snapshot has no eslint config of its own; lint it from the repo root
    // config by pointing ESLint at the snapshot's files.
    ...await lintJsTree({ sourceRoot: SNAPSHOT_SOURCE }),
  ];
  const snapshotCounts = tally(snapshotWarnings);

  // Cross-check against the current checkout. If they disagree, something was
  // edited between the snapshot and now, and the operator must know which.
  const currentWarnings = [
    ...await lintTree({ sourceRoot: ROOT, registrySources: registryFrom(ROOT) }),
    ...await lintJsTree({ sourceRoot: ROOT }),
  ];
  const currentCounts = tally(currentWarnings);

  const onlyInSnapshot = [...snapshotCounts.keys()].filter((k) => !currentCounts.has(k));
  const onlyInCurrent = [...currentCounts.keys()].filter((k) => !snapshotCounts.has(k));

  const manifest = JSON.parse(readFileSync(join(SNAPSHOT_DIR, 'manifest.json'), 'utf8'));

  const baseline = {
    derivedFrom: {
      snapshot: 'docs/design/harness/phase-1-snapshot',
      treeHash: manifest.treeHash,
      gitHead: manifest.git.head,
      capturedAt: manifest.capturedAt,
    },
    rulesHash: createHash('sha256')
      .update(readFileSync(join(ROOT, 'scripts', 'stylelint-design-tokens.mjs')))
      .update(readFileSync(join(ROOT, 'scripts', 'stylelint-design-boundaries.mjs')))
      .update(readFileSync(join(ROOT, 'scripts', 'design-check.config.mjs')))
      .digest('hex'),
    enabledFamilies: enabled,
    generatedAt: new Date().toISOString(),
    totals: {
      snapshotViolations: snapshotWarnings.length,
      distinctFingerprints: snapshotCounts.size,
      currentCheckoutViolations: currentWarnings.length,
    },
    crossCheck: {
      note: 'Fingerprints present in only one tree. Non-empty means the checkout drifted from the snapshot.',
      onlyInSnapshot,
      onlyInCurrent,
    },
    // Sorted so a re-capture produces a reviewable diff, not a reshuffle.
    debt: Object.fromEntries([...snapshotCounts.entries()].sort(([a], [b]) => a.localeCompare(b))),
  };

  writeFileSync(BASELINE_PATH, `${JSON.stringify(baseline, null, 2)}\n`);

  console.log(`design-baseline: captured from snapshot ${manifest.treeHash.slice(0, 12)}`);
  console.log(`  families enabled      ${enabled.join(', ') || 'none'}`);
  console.log(`  snapshot violations   ${snapshotWarnings.length} (${snapshotCounts.size} distinct)`);
  console.log(`  current checkout      ${currentWarnings.length}`);
  console.log(`  drift snapshot-only   ${onlyInSnapshot.length}`);
  console.log(`  drift current-only    ${onlyInCurrent.length}`);
  process.exit(0);
}

else if (has('--verify')) {
  if (!existsSync(BASELINE_PATH)) {
    console.error('design-baseline: no baseline yet. Run with --capture.');
    process.exit(1);
  }
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  const currentWarnings = [
    ...await lintTree({ sourceRoot: ROOT, registrySources: registryFrom(ROOT) }),
    ...await lintJsTree({ sourceRoot: ROOT }),
  ];
  const current = tally(currentWarnings);

  const strictKeys = new Set(
    currentWarnings
      .filter((warning) => strictScopeFor({ file: warning.path, family: warning.family, selector: warning.selector }))
      .map((warning) => fingerprint(warning)),
  );

  const added = newViolations(baseline.debt, current, strictKeys);
  const fixed = Object.keys(baseline.debt).filter((key) => !current.has(key));

  console.log(`design-baseline --verify`);
  console.log(`  existing debt entries ${Object.keys(baseline.debt).length}`);
  console.log(`  fixed since baseline  ${fixed.length}`);
  console.log(`  strict-scope hits     ${strictKeys.size}`);
  console.log(`  NEW violations        ${added.length}`);
  for (const entry of added) {
    const tag = entry.strict ? ' [STRICT SCOPE — no baseline allowance]' : '';
    console.log(`    + ${entry.key}  (${entry.count} > ${entry.allowed})${tag}`);
  }
  process.exit(added.length > 0 ? 1 : 0);
}

else if (has('--prune')) {
  // Retire debt that has actually been fixed.
  //
  // Reduce-only by construction: entries are removed or their counts lowered,
  // never added or raised. It re-lints rather than trusting a previous run, so
  // a stale or partial result cannot be used to clear debt that still exists.
  if (!existsSync(BASELINE_PATH)) {
    console.error('design-baseline: no baseline to prune. Run with --capture.');
    process.exit(1);
  }
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));

  const rulesHash = createHash('sha256')
    .update(readFileSync(join(ROOT, 'scripts', 'stylelint-design-tokens.mjs')))
    .update(readFileSync(join(ROOT, 'scripts', 'stylelint-design-boundaries.mjs')))
    .update(readFileSync(join(ROOT, 'scripts', 'design-check.config.mjs')))
    .digest('hex');
  if (rulesHash !== baseline.rulesHash) {
    console.error('design-baseline: the rules changed since this baseline was captured.');
    console.error('  Pruning now would retire debt measured against different rules.');
    console.error('  Re-capture from the snapshot instead: --capture');
    process.exit(1);
  }

  const currentWarnings = [
    ...await lintTree({ sourceRoot: ROOT, registrySources: registryFrom(ROOT) }),
    ...await lintJsTree({ sourceRoot: ROOT }),
  ];
  const current = tally(currentWarnings);

  const strictKeys = new Set(
    currentWarnings
      .filter((warning) => strictScopeFor({ file: warning.path, family: warning.family, selector: warning.selector }))
      .map((warning) => fingerprint(warning)),
  );
  const outstanding = newViolations(baseline.debt, current, strictKeys);
  if (outstanding.length > 0) {
    console.error(`design-baseline: ${outstanding.length} new violation(s) outstanding.`);
    console.error('  Refusing to prune from a failing tree — fix them first.');
    process.exit(1);
  }

  const pruned = {};
  let removed = 0;
  let lowered = 0;
  for (const [key, allowed] of Object.entries(baseline.debt)) {
    const actual = current.get(key) ?? 0;
    if (actual === 0) { removed += 1; continue; }
    if (actual < allowed) lowered += 1;
    pruned[key] = Math.min(actual, allowed);
  }

  writeFileSync(BASELINE_PATH, `${JSON.stringify({
    ...baseline,
    prunedAt: new Date().toISOString(),
    totals: { ...baseline.totals, afterPrune: Object.keys(pruned).length },
    debt: pruned,
  }, null, 2)}
`);

  console.log('design-baseline --prune');
  console.log(`  entries before   ${Object.keys(baseline.debt).length}`);
  console.log(`  retired          ${removed}`);
  console.log(`  count lowered    ${lowered}`);
  console.log(`  entries after    ${Object.keys(pruned).length}`);
  process.exit(0);
}

else {
  console.error('design-baseline: specify --capture, --verify or --prune.');
  process.exit(1);
}
