import { readFileSync } from 'node:fs';

import { TOKEN_SOURCES, governedPropertyMap } from './scripts/design-check.config.mjs';

// The registry is read once here and handed to the rule, so every file is
// checked against the same declared token set regardless of lint order.
const registrySources = TOKEN_SOURCES.map((path) => [path, readFileSync(path, 'utf8')]);

export default {
  plugins: [
    './scripts/stylelint-design-tokens.mjs',
    './scripts/stylelint-design-boundaries.mjs',
  ],
  rules: {
    'design/token-usage': [true, { registrySources, propertyMap: governedPropertyMap() }],
    'design/ownership-boundaries': true,
  },
  ignoreFiles: [
    'dist/**',
    'output/**',
    'artifacts/**',
    'design/**',
    'public/**',
    'tmp/**',
    'tmp-*/**',
    'node_modules/**',
    'docs/design/harness/**/source/**',
  ],
};
