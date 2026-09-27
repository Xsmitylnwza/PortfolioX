// Local stylelint rule: governed CSS properties must take their value from the
// declared token registry.
//
// Values are parsed, not pattern-matched, so `calc()`, gradients, multi-layer
// box-shadows and shorthand all get walked rather than skimmed. The diagnostic
// carries file:line, the rule, the offending value and the allowed token
// family, because the feedback loop in the plan requires an agent to be able to
// act on the message without opening the config.

import stylelint from 'stylelint';
import valueParser from 'postcss-value-parser';

import {
  STRUCTURAL_KEYWORDS,
  acceptedFamilies,
  exceptionFor,
  familyOf,
  governedPropertyMap,
} from './design-check.config.mjs';

const ruleName = 'design/token-usage';

const messages = stylelint.utils.ruleMessages(ruleName, {
  rawValue: (value, property, family) =>
    `Raw ${family} value "${value}" in "${property}". Use a declared ${family} token (var(--…)) instead.`,
  unknownToken: (token, property, family) =>
    `"${token}" in "${property}" is not declared in the token registry. ` +
    `Declare it in a token source, or use an existing ${family} token.`,
  wrongFamily: /** @type {(token:string,tokenFamily:string,property:string,accepted:string[])=>string} */ ((token, tokenFamily, property, accepted) =>
    `"${token}" is a ${tokenFamily} token but "${property}" accepts ${accepted.join(' or ')} tokens. ` +
    `Reuse the semantic role that means the right thing rather than the value that looks closest.`),
  unclassifiedToken: (token, property, family) =>
    `"${token}" belongs to no token family, so it cannot stand in for a ${family} role on "${property}". ` +
    `Declaring a local custom property does not make its value a token — use an existing ${family} token.`,
  rawFallback: (token, property) =>
    `"var(${token}, …)" in "${property}" carries a raw fallback. ` +
    `A fallback bypasses the registry silently — drop it and make the token resolve.`,
  unsupported: (value, property) =>
    `Cannot statically resolve "${value}" in "${property}". ` +
    `Register a runtime exception with a reason, or use a token.`,
});

const COLOR_FUNCTIONS = new Set([
  'rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'color',
  'color-mix', 'light-dark',
]);

const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const LENGTH = /^-?(?:\d+\.?\d*|\.\d+)(px|rem|em|ch|ex|vw|vh|vmin|vmax|pt|pc|cm|mm|in|q)$/i;
const ZERO = /^-?0(?:\.0+)?[a-z%]*$/i;

// Named CSS colours a component might reach for. Not exhaustive by design:
// the hex/function checks catch the rest, and an exhaustive list would go stale.
const NAMED_COLORS = new Set([
  'red', 'blue', 'green', 'black', 'white', 'gray', 'grey', 'yellow', 'orange',
  'purple', 'pink', 'brown', 'cyan', 'magenta', 'lime', 'navy', 'teal', 'olive',
  'maroon', 'silver', 'gold', 'beige', 'ivory', 'coral', 'crimson', 'indigo',
  'salmon', 'khaki', 'violet', 'turquoise', 'tan', 'plum', 'orchid', 'wheat',
]);

/** Collect every custom property declared by the registry sources. */
/** @param {import('postcss').Root} root @param {Array<[string,string]>} registrySources */
function buildRegistry(root, registrySources) {
  const registry = new Map();
  for (const [, css] of registrySources) {
    for (const match of css.matchAll(/(--[\w-]+)\s*:/g)) {
      registry.set(match[1], familyOf(match[1]));
    }
  }
  // Custom properties declared in the file under test count too, so a file can
  // define and use its own token — but the family check still applies, which is
  // what stops `--local-red: #f00` from passing as a colour role.
  root.walkDecls(/^--/, (decl) => {
    if (!registry.has(decl.prop)) registry.set(decl.prop, familyOf(decl.prop));
  });
  return registry;
}

/** @param {string} word */
function isStructural(word) {
  const lower = word.toLowerCase();
  return STRUCTURAL_KEYWORDS.has(lower) || ZERO.test(lower) || lower.endsWith('%') || lower.endsWith('fr');
}

/** @param {string} word */
function looksLikeRawColor(word) {
  const lower = word.toLowerCase();
  return HEX.test(lower) || NAMED_COLORS.has(lower);
}

/** @param {string} word */
function looksLikeRawLength(word) {
  return LENGTH.test(word);
}

/** @type {import('stylelint').Rule<boolean, {registrySources?:Array<[string,string]>,propertyMap?:ReturnType<typeof governedPropertyMap>}>} */
const ruleFunction = (primary, secondaryOptions = {}) => (root, result) => {
  const valid = stylelint.utils.validateOptions(result, ruleName, {
    actual: primary,
    possible: [true, false],
  });
  if (!valid || primary === false) return;

  const registrySources = secondaryOptions.registrySources ?? [];
  const propertyMap = secondaryOptions.propertyMap ?? governedPropertyMap();
  const file = (root.source?.input?.from ?? '').replace(/\\/g, '/');
  const registry = buildRegistry(root, registrySources);

/** @param {import('postcss').Declaration} decl @param {string} message @param {string | undefined} word */
  const report = (decl, message, word) => {
    stylelint.utils.report({
      ruleName,
      result,
      node: decl,
      message,
      word: word ?? undefined,
    });
  };

  root.walkDecls((decl) => {
    const property = decl.prop.toLowerCase();
    const family = propertyMap.get(property);
    if (!family) return;

    const selector = decl.parent?.type === 'rule' ? decl.parent.selector : '';
    if (exceptionFor({ file, family, selector })) return;

    const parsed = valueParser(decl.value);

    parsed.walk((node) => {
      if (node.type === 'function') {
        if (node.value === 'var') {
          const [nameNode, ...rest] = node.nodes.filter((n) => n.type !== 'div' && n.type !== 'space');
          const token = nameNode?.value ?? '';
          if (rest.length > 0) {
            report(decl, messages.rawFallback(token, property), token);
            return false;
          }
          if (!registry.has(token)) {
            report(decl, messages.unknownToken(token, property, family), token);
            return false;
          }
          const tokenFamily = registry.get(token);
          const accepted = acceptedFamilies(property, family);
          if (tokenFamily === 'unknown') {
            report(decl, messages.unclassifiedToken(token, property, family), token);
          } else if (!accepted.includes(tokenFamily)) {
            report(decl, messages.wrongFamily(token, tokenFamily, property, accepted), token);
          }
          return false;
        }
        if (family === 'color' && COLOR_FUNCTIONS.has(node.value.toLowerCase())) {
          report(decl, messages.rawValue(valueParser.stringify(node), property, family), node.value);
          return false;
        }
        // calc(), gradients, min/max/clamp: keep walking so a literal buried
        // inside an expression is still reported.
        return true;
      }

      if (node.type !== 'word') return true;
      const word = node.value;
      if (isStructural(word)) return true;

      if (family === 'color' && looksLikeRawColor(word)) {
        report(decl, messages.rawValue(word, property, family), word);
        return true;
      }
      if (family !== 'color' && looksLikeRawLength(word)) {
        report(decl, messages.rawValue(word, property, family), word);
      }
      return true;
    });
  });
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = { url: 'docs/design/harness/phase-2-report.md' };

export default stylelint.createPlugin(ruleName, ruleFunction);
export { ruleName, messages };
