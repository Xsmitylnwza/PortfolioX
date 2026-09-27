// Fixture tests for the design harness (plan step 2 / step 4).
//
// Run: node --test scripts/design-check.test.mjs
//
// Every blocking rule must have a known-bad fixture that fails and a valid
// exception that passes. A rule with no failing fixture is a rule nobody has
// shown to work.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import stylelint from 'stylelint';
import { ESLint } from 'eslint';

import { TOKEN_SOURCES, governedPropertyMap, selectorSubjects, strictScopeFor } from './design-check.config.mjs';
import { fingerprint as fingerprintOf, newViolations } from './design-baseline.mjs';

const registrySources = TOKEN_SOURCES.map((path) => [path, readFileSync(path, 'utf8')]);

const config = {
  plugins: ['./scripts/stylelint-design-tokens.mjs'],
  rules: {
    'design/token-usage': [true, { registrySources, propertyMap: governedPropertyMap() }],
  },
};

/** @param {string} code @param {string} [codeFilename] */
async function lintCss(code, codeFilename = 'src/components/Fixture.css') {
  const { results } = await stylelint.lint({ code, codeFilename, config });
  return results[0].warnings;
}

/** @param {string | string[]} files */
async function lintFile(files) {
  const { results } = await stylelint.lint({ files, config });
  return results.flatMap((result) => result.warnings);
}

/** Bypasses the rule must catch, one per documented escape route. */
const KNOWN_BAD = [
  ['raw hex', '.a { color: #ff0000; }'],
  ['raw colour function', '.a { background-color: rgba(255, 0, 0, 0.5); }'],
  ['named colour', '.a { border-top-color: crimson; }'],
  ['local-variable bypass', '.a { --local-red: #f00; color: var(--local-red); }'],
  ['raw fallback', '.a { color: var(--text-primary, #f00); }'],
  ['undefined token', '.a { color: var(--color-nope); }'],
  ['wrong family', '.a { color: var(--font-body); }'],
  ['literal inside gradient', '.a { background-image: linear-gradient(180deg, #101010, #202020); }'],
  ['literal inside multi-layer shadow', '.a { box-shadow: 0 1px 2px rgba(0,0,0,.3), inset 0 0 0 1px #222; }'],
  ['literal inside colour-mix', '.a { color: color-mix(in srgb, #fff 50%, #000); }'],
  ['raw spacing', '.a { padding: 0.85rem 1.1rem; }'],
  ['raw radius', '.a { border-radius: 0.95rem; }'],
  ['raw font size', '.a { font-size: 0.52rem; }'],
  ['raw length inside calc', '.a { padding-top: calc(100% - 12px); }'],
];

for (const [label, code] of KNOWN_BAD) {
  test(`known-bad: ${label} fails`, async () => {
    const warnings = await lintCss(code);
    assert.ok(warnings.length > 0, `expected at least one error for: ${code}`);
    assert.equal(warnings[0].rule, 'design/token-usage');
  });
}

/** Valid usage and registered exceptions must not be reported. */
const KNOWN_GOOD = [
  ['declared semantic token', '.a { color: var(--text-secondary); }'],
  ['structural keyword', '.a { background: none; color: inherit; }'],
  ['transparent', '.a { border-color: transparent; }'],
  ['token composition in gradient', '.a { background-image: linear-gradient(180deg, var(--bg-black), var(--bg-dark)); }'],
  ['ungoverned property untouched', '.a { transform: translate3d(12px, 4px, 0); }'],
  ['spacing token', '.a { padding: var(--space-chip-pad-block) var(--space-chip-pad-inline); }'],
  ['structural length: zero and percentage', '.a { padding: 0; margin: 0 auto; gap: 0; max-width: 100%; }'],
];

for (const [label, code] of KNOWN_GOOD) {
  test(`known-good: ${label} passes`, async () => {
    const warnings = await lintCss(code);
    assert.deepEqual(warnings, [], `unexpected errors for: ${code}`);
  });
}

test('registered exception: token definitions may hold raw values', async () => {
  const warnings = await lintCss(':root { --red-primary: #e3262e; }', 'src/index.css');
  assert.deepEqual(warnings, []);
});

test('registered exception is scoped to declared families, not the whole file or every family', async () => {
  // KeshiLiquidGlass.css is excused for color/spacing/shape (the whole
  // locked recipe, DESIGN.md A6/A7) but not typography — no typography
  // value appears in the recipe, so widening to it would be an unused,
  // untested grant. An exception's scope should never exceed what it can
  // point to a reason for.
  const { EXCEPTIONS } = await import('./design-check.config.mjs');
  const glass = EXCEPTIONS.find((e) => e.id === 'keshi-liquid-glass-material');
  assert.ok(glass, 'Keshi material exception must exist');
  assert.deepEqual(glass.families, ['color', 'spacing', 'shape']);
  assert.ok(!glass.families.includes('typography'));
  assert.ok(glass.reason.length > 40, 'an exception must carry a stated reason');
});

test('exception does not leak to a different file', async () => {
  const warnings = await lintCss(
    '.case-keshi-state__glass { color: #ffffff; }',
    'src/components/ProjectDetailsStories.css',
  );
  assert.equal(warnings.length, 1, 'a raw colour outside the canonical material file must still fail');
});

test('feedback loop: error -> semantic token -> pass', async () => {
  const broken = '.case-media__label { color: #151513; background-color: #ffffff; }';
  const before = await lintCss(broken);
  assert.equal(before.length, 2, 'both raw colours must be reported');

  // The diagnostic must name the file:line, the offending value and the family,
  // or an agent cannot act on it without opening the config.
  const [first] = before;
  assert.ok(first.line > 0 && first.column > 0);
  assert.match(first.text, /#151513/);
  assert.match(first.text, /color token/);

  const fixed = '.case-media__label { color: var(--text-primary); background-color: var(--paper); }';
  const after = await lintCss(fixed);
  assert.deepEqual(after, [], 'correcting to declared semantic tokens must clear the errors');
});

// --- baseline fingerprint behaviour -----------------------------------------
// The baseline keys on `rule | path | selector | declaration` with a count, so
// these assert the properties that keying on line numbers would break.


test('baseline fingerprint: a moved line keeps its identity', () => {
  const before = fingerprintOf({
    rule: 'design/token-usage', path: 'src/a.css', selector: '.x', declaration: 'color: #fff;',
  });
  const afterLineShift = fingerprintOf({
    rule: 'design/token-usage', path: 'src/a.css', selector: '.x', declaration: '  color:   #fff;  ',
  });
  assert.equal(before, afterLineShift);
});

test('baseline fingerprint: a rename is a new path, not the same debt', () => {
  const before = fingerprintOf({
    rule: 'design/token-usage', path: 'src/a.css', selector: '.x', declaration: 'color: #fff;',
  });
  const afterRename = fingerprintOf({
    rule: 'design/token-usage', path: 'src/renamed.css', selector: '.x', declaration: 'color: #fff;',
  });
  assert.notEqual(before, afterRename);
});

test('registered CSS split keeps only the original debt allowance', () => {
  const original = fingerprintOf({
    rule: 'design/token-usage', path: 'src/components/ProjectDetailsStories.css',
    selector: '.case-decrypt-level', declaration: 'border-radius: 0.8rem;',
  });
  const moved = fingerprintOf({
    rule: 'design/token-usage', path: 'src/components/ProjectDetailsDecryptStory.css',
    selector: '.case-decrypt-level', declaration: 'border-radius: 0.8rem;',
  });
  const newValue = fingerprintOf({
    rule: 'design/token-usage', path: 'src/components/ProjectDetailsDecryptStory.css',
    selector: '.case-decrypt-level', declaration: 'border-radius: 1.2rem;',
  });
  assert.equal(moved, original, 'a mechanical move retains its pre-edit identity');
  assert.equal(newViolations({ [original]: 1 }, new Map([[newValue, 1]])).length, 1,
    'a new value in the moved file is still a new violation');
  assert.equal(newViolations({ [original]: 1 }, new Map([[moved, 2]])).length, 1,
    'the move cannot duplicate an old violation');
});

test('shared Project Details CSS moves retain debt identity and strict media scope', () => {
  const original = fingerprintOf({
    rule: 'design/token-usage', path: 'src/components/ProjectDetails.css',
    selector: '.case-media__frame--demo-lead', declaration: 'border-radius: 1rem;',
  });
  for (const name of ['Layouts', 'Lightbox', 'Process']) {
    const path = `src/components/ProjectDetails${name}.css`;
    const moved = fingerprintOf({
      rule: 'design/token-usage', path,
      selector: '.case-media__frame--demo-lead', declaration: 'border-radius: 1rem;',
    });
    assert.equal(moved, original, `${name} retains the original fingerprint`);
    assert.ok(strictScopeFor({ file: path, family: 'shape', selector: '.case-media__frame--demo-lead' }),
      `${name} keeps migrated media chrome strict`);
  }
});

test('global CSS split retains only the index.css debt identity', () => {
  const original = fingerprintOf({
    rule: 'design/token-usage', path: 'src/index.css',
    selector: '.glass-panel', declaration: 'border-radius: 1rem;',
  });
  for (const name of ['room-stage', 'site-utilities', 'room-stage-overrides']) {
    const moved = fingerprintOf({
      rule: 'design/token-usage', path: `src/styles/${name}.css`,
      selector: '.glass-panel', declaration: 'border-radius: 1rem;',
    });
    assert.equal(moved, original, `${name} retains the original fingerprint`);
    assert.equal(newViolations({ [original]: 1 }, new Map([[moved, 2]])).length, 1,
      `${name} cannot duplicate recorded debt`);
  }
});

test('baseline fingerprint: same declaration under a different selector is distinct', () => {
  const a = fingerprintOf({
    rule: 'design/token-usage', path: 'src/a.css', selector: '.x', declaration: 'color: #fff;',
  });
  const b = fingerprintOf({
    rule: 'design/token-usage', path: 'src/a.css', selector: '.y', declaration: 'color: #fff;',
  });
  assert.notEqual(a, b);
});

test('baseline: an added duplicate exceeds its allowance', () => {
  const key = fingerprintOf({
    rule: 'design/token-usage', path: 'src/a.css', selector: '.x', declaration: 'color: #fff;',
  });
  const added = newViolations({ [key]: 1 }, new Map([[key, 2]]));
  assert.equal(added.length, 1, 'a second copy of a known violation must not hide behind the first');
});

test('baseline: a deleted violation does not offset a new one in the same file', () => {
  const removed = fingerprintOf({
    rule: 'design/token-usage', path: 'src/a.css', selector: '.x', declaration: 'color: #fff;',
  });
  const added = fingerprintOf({
    rule: 'design/token-usage', path: 'src/a.css', selector: '.z', declaration: 'color: #000;',
  });
  const reported = newViolations({ [removed]: 1 }, new Map([[added, 1]]));
  assert.equal(reported.length, 1, 'fixing one violation must not license a different one');
});

// --- composite properties (step 3) ------------------------------------------

test('composite property accepts a token from either of its families', async () => {
  // box-shadow is offsets AND a colour. Governing it as colour-only rejected a
  // correctly-chosen shape token on the first post-migration run.
  const warnings = await lintCss(
    '.a { box-shadow: inset 0 0 0 var(--border-width-hairline) var(--color-media-hairline); }',
  );
  assert.deepEqual(warnings, []);
});

test('composite property still rejects a raw literal', async () => {
  const warnings = await lintCss('.a { box-shadow: inset 0 0 0 1px #222222; }');
  assert.ok(warnings.length > 0, 'a raw hex inside box-shadow must still fail');
});

test('composite allowance does not leak to a simple property', async () => {
  const warnings = await lintCss('.a { color: var(--border-width-hairline); }');
  assert.equal(warnings.length, 1, 'color accepts colour tokens only');
});

// --- strict migrated scope (step 3) -----------------------------------------

test('strict scope matches the selector subject, not any mention', () => {
  /** @type {Array<[string,boolean]>} */
  const cases = [
    ['.case-section .case-media__frame.case-media__frame--cover', true],
    ['.case-media__frame--expandable:hover', true],
    ['.case-media__frame::after', true],
    ['.case-media__label', true],
    // The pilot class is a condition on an ancestor; the declarations belong to
    // the rightmost compound, which was never migrated.
    ['.case-freeflow-hero__media:has(.case-media__frame--cover) .case-freeflow-hero__caption-motion', false],
    ['.modenote-story__hero:has(.case-media__frame--cover) h1', false],
    ['.case-keshi-state__caption', false],
  ];
  for (const [selector, expected] of cases) {
    const actual = Boolean(strictScopeFor({
      file: 'src/components/ProjectDetails.css', family: 'color', selector,
    }));
    assert.equal(actual, expected, selector);
  }
});

test('selectorSubjects strips pseudo-class arguments', () => {
  assert.deepEqual(selectorSubjects('.a:has(.b) .c'), ['.c']);
  assert.deepEqual(selectorSubjects('.a, .b > .c'), ['.a', '.c']);
});

test('strict scope is limited to its declared files', () => {
  const inScope = strictScopeFor({
    file: 'src/components/ProjectDetails.css', family: 'color', selector: '.case-media__label',
  });
  const outOfScope = strictScopeFor({
    file: 'src/components/ProjectDetailsStories.css', family: 'color', selector: '.case-media__label',
  });
  assert.ok(inScope);
  assert.equal(outOfScope, undefined);
});

test('strict scope gets no baseline allowance', () => {
  const key = fingerprintOf({
    rule: 'design/token-usage',
    path: 'src/components/ProjectDetails.css',
    selector: '.case-media__label',
    declaration: 'color: #151513;',
  });
  // The literal IS recorded debt from before the migration.
  const baseline = { [key]: 1 };

  const ratcheted = newViolations(baseline, new Map([[key, 1]]));
  assert.equal(ratcheted.length, 0, 'outside a strict scope, recorded debt is forgiven');

  const strict = newViolations(baseline, new Map([[key, 1]]), new Set([key]));
  assert.equal(strict.length, 1, 'inside a strict scope, its own history must not forgive it');
  assert.equal(strict[0].strict, true);
});

test('fixture files on disk match their intent', async () => {
  const bad = await lintFile('scripts/fixtures/known-bad.css');
  assert.ok(bad.length >= KNOWN_BAD.length - 1, `known-bad.css should fail broadly, got ${bad.length}`);

  const good = await lintFile('scripts/fixtures/known-good.css');
  assert.deepEqual(good, [], 'known-good.css must stay clean');
});

// --- ownership boundaries (step 4) ------------------------------------------

import { RuleTester } from 'eslint';

import boundaries from './stylelint-design-boundaries.mjs';
import designJsx, { registryFromSources } from './eslint-design-tokens.mjs';

const boundaryConfig = {
  plugins: ['./scripts/stylelint-design-boundaries.mjs'],
  rules: { 'design/ownership-boundaries': true },
};
void boundaries;

/** @param {string} code @param {string} [codeFilename] */
async function lintBoundaries(code, codeFilename = 'src/components/Fixture.css') {
  const { results } = await stylelint.lint({ code, codeFilename, config: boundaryConfig });
  return results[0].warnings;
}

test('boundary: !important is reported', async () => {
  const warnings = await lintBoundaries('.a { color: red !important; }');
  assert.equal(warnings.length, 1);
  assert.match(warnings[0].text, /Own the property instead/);
});

test('boundary: a normal declaration is not', async () => {
  assert.deepEqual(await lintBoundaries('.a { color: red; }'), []);
});

test('boundary: styling a locked material from another file is reported', async () => {
  const warnings = await lintBoundaries(
    '.case-keshi-state__glass .keshi-liquid-glass__glass { border: 0; }',
    'src/components/ProjectDetailsStories.css',
  );
  assert.equal(warnings.length, 1);
  assert.match(warnings[0].text, /belongs to src\/components\/KeshiLiquidGlass\.css/);
});

test('boundary: the owning file may style its own internals', async () => {
  const warnings = await lintBoundaries(
    '.keshi-liquid-glass__glass { border: 0; }',
    'src/components/KeshiLiquidGlass.css',
  );
  assert.deepEqual(warnings, []);
});

test('boundary: __content is the documented extension point, not a protected internal', async () => {
  // Generalizing the glass beyond Keshi (harness Round 15 follow-up) means a
  // second project's stylesheet must be able to size the content box its own
  // children sit in — the component only renders children there, it does not
  // own their layout. Every OTHER internal stays off-limits.
  const contentWarnings = await lintBoundaries(
    '.case-freeflow-hero__caption .keshi-liquid-glass__content { padding: 1rem; }',
    'src/components/ProjectDetailsFreeflow.css',
  );
  assert.deepEqual(contentWarnings, []);

  const surfaceWarnings = await lintBoundaries(
    '.case-freeflow-hero__caption .keshi-liquid-glass__border { opacity: 0; }',
    'src/components/ProjectDetailsFreeflow.css',
  );
  assert.equal(surfaceWarnings.length, 1);
});

// --- static JSX style props (step 4) ----------------------------------------

const jsxRegistry = registryFromSources(TOKEN_SOURCES.map((path) => readFileSync(path, 'utf8')));

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

test('jsx: rule accepts tokens and rejects literals', () => {
  ruleTester.run('token-usage-jsx', designJsx.rules['token-usage-jsx'], {
    valid: [
      { code: 'const a = <div style={{ color: "var(--color-text-primary)" }} />;', options: [{ registry: jsxRegistry }] },
      { code: 'const a = <div style={{ padding: "var(--space-chip-pad-block)" }} />;', options: [{ registry: jsxRegistry }] },
      // Structural values are not design values.
      { code: 'const a = <div style={{ width: "88%" }} />;', options: [{ registry: jsxRegistry }] },
      { code: 'const a = <div style={{ margin: "0 auto" }} />;', options: [{ registry: jsxRegistry }] },
      // Ungoverned properties are left alone.
      { code: 'const a = <div style={{ transform: "rotate(5deg)" }} />;', options: [{ registry: jsxRegistry }] },
      // A CSS custom property passed through is the documented pattern.
      { code: 'const a = <div style={{ "--reveal-index": 0 }} />;', options: [{ registry: jsxRegistry }] },
    ],
    invalid: [
      {
        code: 'const a = <div style={{ color: "#ff0000" }} />;',
        options: [{ registry: jsxRegistry }],
        errors: [{ messageId: 'rawValue' }],
      },
      {
        code: 'const a = <div style={{ padding: "8rem 1.5rem" }} />;',
        options: [{ registry: jsxRegistry }],
        errors: [{ messageId: 'rawValue' }],
      },
      {
        code: 'const a = <div style={{ borderRadius: "4px" }} />;',
        options: [{ registry: jsxRegistry }],
        errors: [{ messageId: 'rawValue' }],
      },
      {
        code: 'const a = <div style={{ color: "var(--nope)" }} />;',
        options: [{ registry: jsxRegistry }],
        errors: [{ messageId: 'unknownToken' }],
      },
      {
        code: 'const a = <div style={{ color: "var(--type-family-mono)" }} />;',
        options: [{ registry: jsxRegistry }],
        errors: [{ messageId: 'wrongFamily' }],
      },
      {
        // A const bound to a literal in the same file is in the supported
        // syntax set, so the bypass is closed.
        code: 'const red = "#f00"; const a = <div style={{ color: red }} />;',
        options: [{ registry: jsxRegistry }],
        errors: [{ messageId: 'rawValue' }],
      },
      {
        // Anything needing evaluation is reported as unsupported, never
        // silently skipped — silence would be a coverage claim we cannot make.
        code: 'const a = ({ c }) => <div style={{ color: c }} />;',
        options: [{ registry: jsxRegistry }],
        errors: [{ messageId: 'unsupported' }],
      },
    ],
  });
});

// --- prune is reduce-only (step 4) ------------------------------------------

test('prune retires fixed debt and never adds', () => {
  const fixed = fingerprintOf({ rule: 'r', path: 'a.css', selector: '.x', declaration: 'color: #fff;' });
  const still = fingerprintOf({ rule: 'r', path: 'a.css', selector: '.y', declaration: 'color: #000;' });
  const fresh = fingerprintOf({ rule: 'r', path: 'a.css', selector: '.z', declaration: 'color: #111;' });

  const baseline = { [fixed]: 1, [still]: 3 };
  const current = new Map([[still, 2], [fresh, 1]]);

  /** @type {Record<string,number>} */
  const pruned = {};
  for (const [key, allowed] of Object.entries(baseline)) {
    const actual = current.get(key) ?? 0;
    if (actual === 0) continue;
    pruned[key] = Math.min(actual, allowed);
  }

  assert.ok(!(fixed in pruned), 'a fixed violation is retired');
  assert.equal(pruned[still], 2, 'a partially fixed violation has its count lowered');
  assert.ok(!(fresh in pruned), 'prune never grants an allowance that was not already there');
  assert.ok(Object.keys(pruned).length < Object.keys(baseline).length);
});

test('moved JSX debt keeps exact line identity and cannot gain an occurrence', () => {
  const original = fingerprintOf({ rule: 'design/token-usage-jsx', path: 'src/components/TVModal.jsx', declaration: "boxShadow: '0 0 5px red'" });
  const moved = fingerprintOf({ rule: 'design/token-usage-jsx', path: 'src/components/TVModal.tsx', declaration: "boxShadow: '0 0 5px red'" });
  const changed = fingerprintOf({ rule: 'design/token-usage-jsx', path: 'src/components/TVModal.tsx', declaration: "boxShadow: '0 0 6px red'" });
  assert.equal(moved, original);
  assert.notEqual(changed, original);
  assert.equal(newViolations({ [original]: 1 }, new Map([[moved, 2]])).length, 1);
  assert.equal(newViolations({ [original]: 1 }, new Map([[changed, 1]])).length, 1);
});

test('tsx receives the same static style token rule as jsx', async () => {
  const eslint = new ESLint();
  const [bad] = await eslint.lintText(
    'export default function Fixture() { return <div style={{ color: "#ffffff" }} />; }',
    { filePath: 'src/DesignTokenFixture.tsx' },
  );
  const [good] = await eslint.lintText(
    'export default function Fixture() { return <div style={{ color: "var(--color-detail-ink)" }} />; }',
    { filePath: 'src/DesignTokenFixture.tsx' },
  );
  assert.ok(bad.messages.some((message) => message.ruleId === 'design/token-usage-jsx'));
  assert.ok(!good.messages.some((message) => message.ruleId === 'design/token-usage-jsx'));
});
