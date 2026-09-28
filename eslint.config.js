import { readFileSync } from 'node:fs'

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

import designTokens, { registryFromSources } from './scripts/eslint-design-tokens.mjs'
import { TOKEN_SOURCES } from './scripts/design-check.config.mjs'

// One registry, read once, shared with the stylelint rule's config. A property
// governed in CSS must be governed the same way in a style prop.
const tokenRegistry = registryFromSources(TOKEN_SOURCES.map((path) => readFileSync(path, 'utf8')))

export default defineConfig([
  { linterOptions: { noInlineConfig: true } },
  // Scope repair (AI-DESIGN-HARNESS-PLAN step 2). `eslint .` previously walked
  // build output, browser profiles under output/, scratch files and design
  // prototypes, which made a whole-repo run meaningless. Keep this list in sync
  // with EXCLUDED_DIRS in scripts/design-scope.mjs.
  globalIgnores([
    'dist',
    'output',
    'artifacts',
    'design',
    'public',
    'tmp',
    'tmp-*',
    '.playwright-cli',
    '.impeccable',
    '.vercel',
    // Snapshots are verbatim copies of source captured before edits. Linting
    // them here would double-report every finding; the harness lints them
    // explicitly when deriving the debt baseline.
    'docs/design/harness/**/source',
  ]),

  // Production UI sources: browser globals, React rules.
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: { design: designTokens },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Reported as a warning here on purpose: ESLint has no debt mechanism,
      // so 'error' would hard-fail on 49 pre-existing findings that predate the
      // rule. The blocking decision belongs to the ratchet, which forgives
      // recorded debt and fails new violations:
      //   npm run design:baseline:verify   (and npm run check:design)
      'design/token-usage-jsx': ['warn', { registry: tokenRegistry }],
    },
  },

  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      parser: tseslint.parser,
      globals: globals.browser,
    },
    plugins: { design: designTokens },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'design/token-usage-jsx': ['warn', { registry: tokenRegistry }],
    },
  },

  // Maintained Node tooling: node globals, no React rules, but still linted —
  // the harness must not be the one part of the repo nobody checks.
  {
    files: ['scripts/**/*.{js,mjs,cjs}', '*.config.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  {
    files: ['scripts/**/*.{ts,mts,cts}', '*.config.{ts,mts}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      parser: tseslint.parser,
      globals: globals.node,
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // design-probe.mjs is genuinely dual-environment: node reads its target
  // definitions, and compareAgainstBefore() runs inside the page. Give it both
  // global sets rather than sprinkling eslint-disable comments over real code.
  {
    files: ['scripts/design-probe.mjs'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },

  // Playwright callbacks run in the browser even though their drivers run in
  // Node. Keep these globals in config so inline directives cannot waive lint.
  {
    files: [
      'scripts/modularization-capture.mjs',
      'scripts/modularization-context-recovery.mjs',
      'scripts/modularization-global-capture.mjs',
      'scripts/modularization-media-smoke.mjs',
      'scripts/modularization-runtime-lifecycle.mjs',
    ],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },

  // Fixtures deliberately contain violations for the CSS token rule. They are
  // data for stylelint, not JavaScript to lint.
  globalIgnores(['scripts/fixtures/**']),
])
