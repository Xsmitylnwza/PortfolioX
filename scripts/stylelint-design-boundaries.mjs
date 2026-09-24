// Local stylelint rule: ownership boundaries.
//
// Two things the token rule cannot see:
//
//  1. `!important` — a declaration that wins by force rather than by owning the
//     property. DESIGN.md A9 says the material owns its surface and the wrapper
//     owns placement; `!important` is how that contract gets broken quietly.
//
//  2. Reaching into a locked material's internals from another stylesheet.
//     Round 11 of the design history is exactly this failure: legacy rules
//     painted over the glass component and the render broke. The component owns
//     its own internals; a consumer positions it and nothing more.
//
// Both accept registered exceptions with a stated reason.

import stylelint from 'stylelint';

import {
  IMPORTANT_ALLOWANCES,
  PROTECTED_INTERNALS,
} from './design-check.config.mjs';

const ruleName = 'design/ownership-boundaries';

const messages = stylelint.utils.ruleMessages(ruleName, {
  important: (property) =>
    `"${property}" wins with !important. Own the property instead: give the rule a selector that ` +
    `should win, or move the declaration to whichever layer owns it. If the override is genuinely ` +
    `required, register it in IMPORTANT_ALLOWANCES with a reason.`,
  protectedInternal: (selector, owner, reason) =>
    `This rule styles "${selector}", which belongs to ${owner}. ${reason} ` +
    `Position the component from the outside and change the recipe in its own file.`,
});

const ruleFunction = (primary) => (root, result) => {
  const valid = stylelint.utils.validateOptions(result, ruleName, {
    actual: primary,
    possible: [true, false],
  });
  if (!valid || primary === false) return;

  const file = (root.source?.input?.from ?? '').split(/[/\\]/).join('/');

  root.walkDecls((decl) => {
    if (!decl.important) return;
    const selector = decl.parent?.selector ?? '';
    const allowed = IMPORTANT_ALLOWANCES.some((allowance) =>
      (file === allowance.file || file.endsWith(`/${allowance.file}`)) &&
      (!allowance.selectorPattern || new RegExp(allowance.selectorPattern).test(selector)) &&
      (!allowance.properties || allowance.properties.includes(decl.prop.toLowerCase())));
    if (allowed) return;
    stylelint.utils.report({ ruleName, result, node: decl, message: messages.important(decl.prop) });
  });

  root.walkRules((rule) => {
    for (const protectedSet of PROTECTED_INTERNALS) {
      // The owning file is allowed to style its own internals.
      if (file === protectedSet.owner || file.endsWith(`/${protectedSet.owner}`)) continue;
      const hit = protectedSet.patterns.find((pattern) => new RegExp(pattern).test(rule.selector));
      if (!hit) continue;
      stylelint.utils.report({
        ruleName,
        result,
        node: rule,
        message: messages.protectedInternal(rule.selector, protectedSet.owner, protectedSet.reason),
      });
    }
  });
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = { url: 'docs/design/harness/phase-4-report.md' };

export default stylelint.createPlugin(ruleName, ruleFunction);
export { ruleName, messages };
