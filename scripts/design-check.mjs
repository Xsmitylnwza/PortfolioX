#!/usr/bin/env node
// The design harness entry point (AI-DESIGN-HARNESS-PLAN §5).
//
// One command picks the scope, runs the checks that apply to what changed, and
// prints one result set: scope, what ran, what was skipped and why, existing
// debt, new failures, and which routes still need a human to look at them.
//
//   npm run check:design -- --files <f...> [--mode fast|final]
//   npm run check:design -- --base <git-ref>
//   npm run check:design -- --full
//
// It never writes code, never widens the baseline, and exit 0 means the
// mechanical checks passed — not that the design was accepted.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { RENDER_TARGETS, TOKEN_SOURCES } from './design-check.config.mjs';
import { isExcluded, toPosix } from './design-scope.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
function valuesAfter(flag) {
  const i = argv.indexOf(flag);
  if (i === -1) return null;
  const out = [];
  for (let j = i + 1; j < argv.length && !argv[j].startsWith('--'); j += 1) out.push(argv[j]);
  return out;
}
function valueAfter(flag) {
  return valuesAfter(flag)?.[0] ?? null;
}

// Run tools through their JS entry points with this same node binary.
// Shelling out to npm/npx would mean spawning a .cmd on Windows, which Node 24
// refuses without a shell — and adding a shell just to launch a local tool
// invites quoting bugs for no benefit.
const nodeBin = (relativePath) => [process.execPath, join(ROOT, relativePath)];

function run(command, args) {
  try {
    const stdout = execFileSync(command, args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { ok: true, stdout, stderr: '' };
  } catch (error) {
    return {
      ok: false,
      stdout: error.stdout?.toString() ?? '',
      stderr: error.stderr?.toString() ?? String(error),
    };
  }
}

function git(...args) {
  // Capture stderr rather than inheriting it: git's CRLF advisories would
  // otherwise bury the report under one warning per file.
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

const USAGE = `
design-check — one command for the design harness

  --files <path...>     check these files plus the consumers config maps to them
  --base <git-ref>      derive scope from the diff against that ref
  --full                check every maintained source

  --mode fast           scoped lint + token checks, no build (use while iterating)
  --mode final          adds the build and names the render evidence to look at
                        (default when --mode is omitted)

A scope is required. Reporting "pass" for an empty scope would be a lie, so
there is no default scope.
`.trimStart();

// ---------------------------------------------------------------------------
// Scope
// ---------------------------------------------------------------------------

function resolveScope() {
  if (has('--full')) {
    return { kind: 'full', files: null, note: 'every maintained source' };
  }

  const files = valuesAfter('--files');
  if (files) {
    if (files.length === 0) {
      return { kind: 'error', message: '--files needs at least one path' };
    }
    const normalized = files.map(toPosix).filter((file) => !isExcluded(file));
    const dropped = files.length - normalized.length;
    return {
      kind: 'files',
      files: normalized,
      note: `${normalized.length} file(s)${dropped ? `, ${dropped} outside maintained scope ignored` : ''}`,
    };
  }

  const base = valueAfter('--base');
  if (base) {
    let diff;
    try {
      // Staged, unstaged and committed differences against the named ref. No
      // guessed default branch: the caller says what to compare against.
      diff = git('diff', '--name-only', base, '--');
    } catch {
      return { kind: 'error', message: `--base: cannot diff against "${base}". Is it a valid git ref?` };
    }
    const changed = diff.split('\n').map(toPosix).filter(Boolean).filter((file) => !isExcluded(file));

    // Untracked files are real changes a diff will not show. Report them rather
    // than checking a scope that silently omits new work.
    const untracked = git('ls-files', '--others', '--exclude-standard')
      .split('\n').map(toPosix).filter(Boolean).filter((file) => !isExcluded(file));

    return {
      kind: 'base',
      files: changed,
      untracked,
      note: `diff vs ${base}: ${changed.length} tracked file(s)`,
    };
  }

  return { kind: 'error', message: 'no scope given' };
}

// ---------------------------------------------------------------------------
// What a scope implies
// ---------------------------------------------------------------------------

const isUiSource = (file) => /^src\/.*\.(css|jsx?|)$/.test(file) || file === 'index.html';
const isCss = (file) => file.endsWith('.css');
const isScript = (file) => /\.(js|jsx|mjs|cjs)$/.test(file);
const isRulesDoc = (file) => /^(DESIGN|AGENTS)\.md$/.test(file) || file.startsWith('docs/design/');
const isTokenSource = (file) => TOKEN_SOURCES.includes(file);
const isHarnessConfig = (file) =>
  file === 'scripts/design-check.config.mjs' || file === 'scripts/stylelint-design-tokens.mjs';

function planChecks(scope, mode) {
  const files = scope.files;
  const all = files === null;

  const touchesCss = all || files.some(isCss);
  const touchesScript = all || files.some(isScript);
  const touchesUi = all || files.some(isUiSource);
  const onlyRulesDocs = !all && files.length > 0 && files.every(isRulesDoc);

  // A change to the token registry or to the rule config can break a consumer
  // nobody named. Widen to the whole maintained UI scope in that case, even in
  // fast mode, even if only the token file was passed.
  const registryChanged = all || files.some(isTokenSource) || files.some(isHarnessConfig);

  return {
    lintJs: touchesScript || all,
    // The ratchet covers CSS and static JSX alike, so it runs for any UI
    // source. Gating it on CSS alone left a JSX-only change ungated.
    ratchet: touchesUi || touchesCss || registryChanged,
    tokenScopeWidened: registryChanged && !all,
    build: mode === 'final' && touchesUi && !onlyRulesDocs,
    renderEvidence: mode === 'final' && touchesUi && !onlyRulesDocs,
    onlyRulesDocs,
  };
}

/** Routes a changed file is known to affect. No dependency graph in v1. */
function consumersFor(scope) {
  if (scope.files === null) return { routes: RENDER_TARGETS, unmapped: [] };

  const routes = [];
  const unmapped = [];
  for (const file of scope.files) {
    if (!isUiSource(file)) continue;
    const matched = RENDER_TARGETS.filter((target) =>
      target.sources.some((pattern) => new RegExp(pattern).test(file)));
    if (matched.length === 0) unmapped.push(file);
    for (const target of matched) if (!routes.includes(target)) routes.push(target);
  }
  return { routes, unmapped };
}

// ---------------------------------------------------------------------------

const scope = resolveScope();
if (scope.kind === 'error') {
  console.error(`design-check: ${scope.message}\n`);
  console.error(USAGE);
  process.exit(1);
}

const mode = valueAfter('--mode') ?? 'final';
if (!['fast', 'final'].includes(mode)) {
  console.error(`design-check: unknown mode "${mode}". Use fast or final.\n`);
  console.error(USAGE);
  process.exit(1);
}

if (scope.files !== null && scope.files.length === 0) {
  console.error('design-check: the scope resolved to zero maintained files.');
  console.error('  Nothing was checked. This is reported as an error rather than a pass.');
  if (scope.kind === 'base' && scope.untracked?.length) {
    console.error(`  ${scope.untracked.length} untracked file(s) are present but not in the diff.`);
  }
  process.exit(1);
}

const plan = planChecks(scope, mode);
const { routes, unmapped } = consumersFor(scope);

let eslintOutput = '';
const checked = [];
const skipped = [];
const failures = [];
const timings = [];

function timed(label, fn) {
  const start = Date.now();
  const result = fn();
  timings.push({ label, ms: Date.now() - start });
  return result;
}

// --- JS/JSX ----------------------------------------------------------------
if (plan.lintJs) {
  const [node, eslintBin] = nodeBin('node_modules/eslint/bin/eslint.js');
  const targets = scope.files === null ? ['.'] : scope.files.filter(isScript);
  if (targets.length > 0) {
    const result = timed('eslint', () => run(node, [eslintBin, ...targets]));
    // Diagnostics only. ESLint's own exit code cannot distinguish a new
    // violation from debt that predates the rule, so the pass/fail decision
    // belongs to the ratchet below, which can.
    checked.push('eslint (js/jsx) — diagnostics; gated by the ratchet');
    eslintOutput = result.stdout || result.stderr;
  } else {
    skipped.push('eslint — no JS/JSX in scope');
  }
} else {
  skipped.push('eslint — no JS/JSX in scope');
}

// --- CSS tokens, against the debt baseline ---------------------------------
if (plan.ratchet) {
  const result = timed('design rules vs baseline', () =>
    run(process.execPath, [join(ROOT, 'scripts/design-baseline.mjs'), '--verify']));
  checked.push(
    plan.tokenScopeWidened
      ? 'design rules across ALL maintained CSS + JSX (token registry or rule config changed)'
      : 'design rules (CSS + static JSX) vs debt baseline',
  );
  if (!result.ok) failures.push({ check: 'design rules', output: result.stdout || result.stderr });
} else {
  skipped.push('design rules — no UI source in scope');
}

// --- build -----------------------------------------------------------------
if (plan.build) {
  const [node, viteBin] = nodeBin('node_modules/vite/bin/vite.js');
  const result = timed('build', () => run(node, [viteBin, 'build']));
  checked.push('vite build');
  if (!result.ok) failures.push({ check: 'build', output: (result.stdout || result.stderr).slice(-2000) });
} else if (mode === 'fast') {
  skipped.push('build — fast mode does not build');
} else if (plan.onlyRulesDocs) {
  skipped.push('build — rules documents only, nothing to compile');
} else {
  skipped.push('build — no UI source in scope');
}

// ---------------------------------------------------------------------------
// One result set
// ---------------------------------------------------------------------------

const line = '─'.repeat(64);
console.log(line);
console.log(`design-check  ·  mode: ${mode}  ·  scope: ${scope.kind} (${scope.note})`);
console.log(line);

if (scope.files !== null && scope.files.length <= 12) {
  for (const file of scope.files) console.log(`  in scope  ${file}`);
}
if (scope.kind === 'base' && scope.untracked?.length) {
  console.log(`\n  untracked source present (not in the diff, not checked):`);
  for (const file of scope.untracked.slice(0, 10)) console.log(`    ? ${file}`);
}

console.log('\nchecked:');
for (const item of checked) console.log(`  ✓ ${item}`);
console.log('\nskipped:');
for (const item of skipped) console.log(`  – ${item}`);

// Existing debt, shown separately from new failures.
if (existsSync(join(ROOT, 'scripts/design-check-baseline.json'))) {
  const baseline = JSON.parse(readFileSync(join(ROOT, 'scripts/design-check-baseline.json'), 'utf8'));
  console.log(`\nexisting debt: ${Object.keys(baseline.debt).length} recorded fingerprint(s), not counted as failures`);
}

if (eslintOutput.trim()) {
  const summary = eslintOutput.split('\n').filter((l) => l.includes('problem')).pop();
  if (summary) console.log(`\neslint diagnostics: ${summary.trim()}`);
  console.log('  (shown, not gated here — the ratchet decides which of these are new)');
}

if (failures.length > 0) {
  console.log('\nNEW FAILURES:');
  for (const failure of failures) {
    console.log(`\n  ✗ ${failure.check}`);
    for (const outputLine of failure.output.split('\n').filter(Boolean).slice(-30)) {
      console.log(`     ${outputLine}`);
    }
  }
}

if (plan.renderEvidence) {
  console.log('\nrender evidence to look at (mechanical checks cannot judge this):');
  if (routes.length === 0) {
    console.log('  ! no route mapping for the changed files — see needs-scope below');
  }
  for (const target of routes) {
    console.log(`  · ${target.path}  [${target.viewports.join(', ')}]  ${target.note}`);
  }
}

if (unmapped.length > 0) {
  console.log('\nNEEDS-SCOPE: no consumer route is mapped for these files.');
  console.log('  Add them to RENDER_TARGETS in scripts/design-check.config.mjs, or say which');
  console.log('  route to look at. Passing without knowing what they affect would be a guess.');
  for (const file of unmapped) console.log(`    ? ${file}`);
}

console.log('\ntiming:');
for (const entry of timings) console.log(`  ${String(entry.ms).padStart(6)}ms  ${entry.label}`);

console.log(`\n${line}`);
const needsScope = unmapped.length > 0;
if (failures.length > 0 || needsScope) {
  console.log(failures.length > 0 ? 'RESULT: fail' : 'RESULT: fail (needs-scope)');
  process.exit(1);
}
console.log('RESULT: mechanical checks pass.');
console.log('This is not visual acceptance. A green run means no rule was broken,');
console.log('not that the design is right — look at the routes listed above.');
process.exit(0);
