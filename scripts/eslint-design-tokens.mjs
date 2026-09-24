// Local ESLint rule: governed values in static JSX `style={{ … }}`.
//
// The stylelint rule only sees stylesheets. A component can put the same
// governed value in a style prop and nothing would notice, so the same config
// drives both — a property cannot be governed in CSS and free in JSX.
//
// Scope is deliberately narrow (see docs/design/harness/phase-1-report.md §3):
// object literals with literal values, and `const` bindings to literals in the
// same file. Anything that needs evaluation is reported as unsupported rather
// than guessed at or silently skipped.

import {
  acceptedFamilies,
  familyOf,
  governedPropertyMap,
} from './design-check.config.mjs';

/** React style props are camelCase; the config speaks CSS. */
function toCssProperty(name) {
  if (name.startsWith('--')) return name;
  return name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

const HEX = /#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b/i;
const COLOR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\s*\(/i;
const LENGTH = /(?:^|[\s(,])-?(?:\d+\.?\d*|\.\d+)(?:px|rem|em|ch|ex|vw|vh|vmin|vmax|pt|pc|cm|mm|in)\b/i;
const VAR_REF = /var\(\s*(--[\w-]+)/g;
const STRUCTURAL = /^(?:0|auto|none|normal|inherit|initial|unset|revert|transparent|currentcolor|\d+(?:\.\d+)?%|\d+(?:\.\d+)?fr)$/i;

export const rules = {
  'token-usage-jsx': {
    meta: {
      type: 'problem',
      docs: { description: 'Governed values in static JSX style props must come from the token registry.' },
      schema: [{
        type: 'object',
        properties: { registry: { type: 'object' } },
        additionalProperties: false,
      }],
      messages: {
        rawValue: 'Raw {{family}} value "{{value}}" in style prop "{{property}}". Use a declared {{family}} token: style={{ {{property}}: "var(--…)" }}.',
        unknownToken: '"{{token}}" in style prop "{{property}}" is not declared in the token registry.',
        wrongFamily: '"{{token}}" is a {{tokenFamily}} token but "{{property}}" accepts {{accepted}} tokens.',
        unsupported: 'Cannot statically resolve the value of style prop "{{property}}". The harness does not evaluate expressions — use a token, or register a runtime exception with a reason.',
      },
    },

    create(context) {
      const registry = new Map(Object.entries(context.options[0]?.registry ?? {}));
      const propertyMap = governedPropertyMap();

      /** Literal string/number, or a same-file const bound to one. */
      function staticValueOf(node, scope) {
        if (node.type === 'Literal') return typeof node.value === 'string' || typeof node.value === 'number'
          ? String(node.value) : null;
        if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
          return node.quasis[0].value.cooked;
        }
        if (node.type === 'Identifier') {
          const variable = scope.references.find((ref) => ref.identifier === node)?.resolved;
          const def = variable?.defs?.[0];
          if (!def || def.type !== 'Variable' || def.parent?.kind !== 'const') return null;
          if (variable.references.some((ref) => ref.isWrite() && ref.init !== true)) return null;
          const init = def.node.init;
          return init && init.type === 'Literal' && typeof init.value !== 'object'
            ? String(init.value) : null;
        }
        return null;
      }

      function check(property, value, node) {
        const family = propertyMap.get(property);
        if (!family) return;
        if (STRUCTURAL.test(value.trim())) return;

        const accepted = acceptedFamilies(property, family);

        let sawToken = false;
        for (const match of value.matchAll(VAR_REF)) {
          sawToken = true;
          const token = match[1];
          if (!registry.has(token)) {
            context.report({ node, messageId: 'unknownToken', data: { token, property } });
            return;
          }
          const tokenFamily = registry.get(token);
          if (!accepted.includes(tokenFamily)) {
            context.report({
              node,
              messageId: 'wrongFamily',
              data: { token, tokenFamily, property, accepted: accepted.join(' or ') },
            });
            return;
          }
        }

        const rawColor = family === 'color' && (HEX.test(value) || COLOR_FN.test(value));
        const rawLength = LENGTH.test(value);
        if (rawColor || (rawLength && !sawToken) || (rawLength && sawToken)) {
          context.report({
            node,
            messageId: 'rawValue',
            data: { family, value, property },
          });
        }
      }

      return {
        JSXAttribute(node) {
          if (node.name?.name !== 'style') return;
          const expression = node.value?.expression;
          if (!expression || expression.type !== 'ObjectExpression') return;

          const scope = context.sourceCode.getScope(node);

          for (const prop of expression.properties) {
            if (prop.type !== 'Property' || prop.computed) continue;
            const name = prop.key.type === 'Identifier' ? prop.key.name
              : prop.key.type === 'Literal' ? String(prop.key.value) : null;
            if (!name) continue;

            const property = toCssProperty(name);
            if (!propertyMap.has(property)) continue;

            const value = staticValueOf(prop.value, scope);
            if (value === null) {
              // A governed property whose value cannot be resolved is reported,
              // not skipped. Silence here would be a coverage claim we cannot make.
              context.report({ node: prop, messageId: 'unsupported', data: { property } });
              continue;
            }
            check(property, value, prop);
          }
        },
      };
    },
  },
};

/** Build the registry argument from the token sources. */
export function registryFromSources(sources) {
  const registry = {};
  for (const css of sources) {
    for (const match of css.matchAll(/(--[\w-]+)\s*:/g)) registry[match[1]] = familyOf(match[1]);
  }
  return registry;
}

export default { rules };
