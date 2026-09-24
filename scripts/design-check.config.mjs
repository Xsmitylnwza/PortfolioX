// Design harness configuration: governed properties, token families, the token
// registry sources and the exceptions that have a stated reason.
//
// One config, shared by the CSS rule and (later) the static-JSX rule, so a
// property cannot be governed in a stylesheet and ungoverned in a style prop.
//
// Nothing here encodes a design decision. It says WHERE a value must come from,
// never WHAT the value should be. Changing the palette means editing the token
// definitions, not this file.

/**
 * Files whose declared custom properties form the token registry.
 * A `var(--x)` reference only satisfies a governed property if `--x` is
 * declared in one of these files and belongs to an allowed family.
 */
export const TOKEN_SOURCES = [
  'src/styles/tokens.css',
  // Legacy alias names (--text-primary, --bg-dark, …) still resolve; they now
  // forward to the semantic roles in tokens.css rather than holding values.
  'src/index.css',
  // The shared Liquid Glass recipe declares a few sizing roles (e.g.
  // --radius-glass-compact) for consumers outside its own file. Registering
  // it here makes those roles resolvable wherever the component is used,
  // not only inside KeshiLiquidGlass.css itself.
  'src/components/KeshiLiquidGlass.css',
  // Already a de facto shared token source across projects before this file
  // existed: --story-glass-* and --story-line/-ink/-soft/-faint are declared
  // once here and consumed by Keshi, Decrypt and now Freeflow's captions.
  'src/components/ProjectDetailsStories.css',
  // Existing scoped role declarations moved mechanically from Stories.css.
  'src/components/ProjectDetailsKeshiStory.css',
  'src/components/ProjectDetailsDecryptStory.css',
  'src/components/ProjectDetailsZuchStory.css',
  'src/components/ProjectDetailsKeshiStoryOverrides.css',
  'src/components/ProjectDetailsDecryptStoryOverrides.css',
];

/**
 * Token name -> family. Patterns are matched in order; first match wins.
 * A token that matches nothing is `unknown` and satisfies no governed property,
 * which is what stops a component from inventing `--my-red` and calling it done.
 */
export const TOKEN_FAMILY_PATTERNS = [
  { pattern: /^--(color|text|bg|red|stage|paper|glass|story)-/, family: 'color' },
  { pattern: /^--paper$/, family: 'color' },
  { pattern: /^--(space|gap|inset)-/, family: 'spacing' },
  { pattern: /^--(font|type|leading|tracking)-/, family: 'typography' },
  { pattern: /^--(radius|border-width|size|control|icon|measure)-/, family: 'shape' },
];

/**
 * Governed properties per family.
 *
 * `enabled` gates a family without deleting its definition. All four are on as
 * of step 3, now that `src/styles/tokens.css` gives each family real tokens to
 * point at. Their debt is derived from the same pre-edit snapshot captured in
 * step 1, so this migration's own work can never be absorbed into the baseline.
 */
export const GOVERNED = {
  color: {
    enabled: true,
    properties: [
      'color',
      'background',
      'background-color',
      'background-image',
      'border-color',
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
      'outline-color',
      'box-shadow',
      'text-shadow',
      'fill',
      'stroke',
      'caret-color',
      'text-decoration-color',
      'accent-color',
    ],
  },
  spacing: {
    enabled: true,
    properties: [
      'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'padding-inline', 'padding-block',
      'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
      'margin-inline', 'margin-block',
      'gap', 'row-gap', 'column-gap',
    ],
  },
  typography: {
    enabled: true,
    properties: ['font', 'font-family', 'font-size', 'line-height', 'letter-spacing'],
  },
  shape: {
    enabled: true,
    properties: [
      'border-radius', 'border-width', 'border-top-width', 'border-right-width',
      'border-bottom-width', 'border-left-width', 'max-width',
    ],
  },
};

/**
 * Values that are structure, not design, and are allowed raw on any property.
 * Percentages and `fr` describe layout relationships; a media query cannot read
 * a custom property at all, so those are excluded from the rule entirely.
 */
export const STRUCTURAL_KEYWORDS = new Set([
  'auto', 'none', 'normal', 'inherit', 'initial', 'unset', 'revert', 'revert-layer',
  'currentcolor', 'transparent', 'inset', 'solid', 'dashed', 'dotted', 'hidden',
  'to', 'from', 'at', 'in', 'cover', 'contain', 'repeat', 'no-repeat', 'center',
  'top', 'right', 'bottom', 'left', 'closest-side', 'farthest-corner', 'circle',
  'ellipse', 'border-box', 'padding-box', 'content-box', 'linear', 'ease',
]);

/**
 * Registered exceptions. Each one names files, the families it covers and a
 * reason. There is no whole-repo exemption and no file-level blanket flag:
 * `families` keeps a material recipe from also excusing its spacing.
 */
export const EXCEPTIONS = [
  {
    id: 'token-definitions',
    files: TOKEN_SOURCES,
    families: ['color', 'spacing', 'typography', 'shape'],
    selectors: [':root'],
    reason: 'Canonical token definitions. Raw values are the point of this file.',
  },
  {
    id: 'keshi-liquid-glass-material',
    files: ['src/components/KeshiLiquidGlass.css'],
    families: ['color', 'spacing', 'shape'],
    reason:
      'Canonical source of the selected optical material (DESIGN.md A6, A7, A10, A11). ' +
      'The whole interior recipe is locked, not only its colours: mask-trick border widths ' +
      '(1.5px/2px) and the approved radius are as fixed as the rgba stops. Routing any of ' +
      'them through a semantic role would let an unrelated token change alter a locked material.',
  },
];

/**
 * Composite properties carry more than one kind of value: `box-shadow` is
 * offsets AND a colour, `border` is a width AND a colour. Governing such a
 * property under a single family would reject a correctly-chosen token of the
 * other kind — which is exactly what happened to
 * `box-shadow: inset 0 0 0 var(--border-width-hairline) var(--color-media-hairline)`
 * on the first run after migration.
 *
 * A property listed here accepts tokens from any of its families. Literal
 * detection still uses the property's primary family, so a raw hex in a
 * box-shadow is still an error.
 */
export const COMPOSITE_PROPERTY_FAMILIES = {
  'box-shadow': ['color', 'shape', 'spacing'],
  'text-shadow': ['color', 'shape', 'spacing'],
  'outline': ['color', 'shape'],
  'border': ['color', 'shape'],
  'border-top': ['color', 'shape'],
  'border-right': ['color', 'shape'],
  'border-bottom': ['color', 'shape'],
  'border-left': ['color', 'shape'],
  'background': ['color', 'spacing', 'shape'],
  'background-image': ['color', 'spacing', 'shape'],
  'font': ['typography', 'spacing'],
  'padding': ['spacing'],
  'margin': ['spacing'],
};

/** Token families a property will accept. Defaults to its own family. */
export function acceptedFamilies(property, family) {
  return COMPOSITE_PROPERTY_FAMILIES[property] ?? [family];
}

/**
 * Strict migrated scope.
 *
 * Once a slice has been migrated to central tokens, it loses its right to the
 * debt baseline: a governed literal there is a new violation even if an
 * identical one was recorded before migration. Without this, re-introducing a
 * raw value into migrated code would be silently forgiven by its own history.
 *
 * Scoped by selector prefix + family, never by whole file — ProjectDetails.css
 * holds many unmigrated selectors besides these.
 */
export const STRICT_SCOPES = [
  {
    id: 'pilot-media-chrome',
    migratedAt: 'plan step 3',
    files: [
      'src/components/ProjectDetails.css',
      'src/components/ProjectDetailsMux.css',
      'src/components/ProjectDetailsZuch.css',
      'src/components/ProjectCoverMedia.css',
    ],
    selectorPatterns: [
      /\.case-media__frame/,
      /\.case-media__label/,
      /\.case-media__kind/,
    ],
    families: ['color', 'spacing', 'typography', 'shape'],
    reason: 'Pilot slice migrated to central tokens; see docs/design/harness/phase-3-report.md.',
  },
];

/**
 * The rightmost compound of a selector — the element the rule actually styles.
 *
 * Matching a pattern anywhere in the selector string is wrong: in
 * `.x:has(.case-media__frame--cover) .y` the pilot class is a condition on an
 * ancestor, and the declarations belong to `.y`. Testing the whole string put
 * three unmigrated rules into the strict scope on the first run.
 *
 * Pseudo-class arguments are stripped before splitting so `:has()`, `:is()`,
 * `:where()` and `:not()` contents cannot be mistaken for the subject.
 */
export function selectorSubjects(selector) {
  return (selector ?? '')
    .split(',')
    .map((part) => part.replace(/:(?:has|is|where|not|matches)\([^)]*\)/g, ' '))
    .map((part) => part.trim().split(/[\s>+~]+/).filter(Boolean).pop() ?? '')
    .filter(Boolean);
}

/** Is this violation inside a strict migrated scope? */
export function strictScopeFor({ file, family, selector }) {
  const subjects = selectorSubjects(selector);
  return STRICT_SCOPES.find((scope) => {
    if (!scope.families.includes(family)) return false;
    if (!scope.files.some((candidate) => file === candidate || file.endsWith(`/${candidate}`))) return false;
    return subjects.some((subject) => scope.selectorPatterns.some((pattern) => pattern.test(subject)));
  });
}

/**
 * Explicit consumer mapping: which routes a source file is known to affect.
 *
 * Deliberately hand-maintained. A dependency graph is out of scope for v1, and
 * a wrong graph is worse than a short list — a file with no mapping is reported
 * as needs-scope and fails, rather than passing on the assumption that nothing
 * consumes it.
 */
export const RENDER_TARGETS = [
  {
    path: '/project/keshi-pomodoro',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'Keshi matte surface pilot; legacy optical layout remains in the route stylesheet',
    sources: [
      /^src\/components\/ProjectDetailsKeshiStoryOverrides[.]css$/,
      /^src\/components\/ProjectDetailsStorySharedOverrides[.]css$/,
      /^src\/components\/ProjectDetailsKeshiStory[.]css$/,
      /^src\/styles\/tokens[.]css$/,
      /^src\/index[.]css$/,
      /^src\/components\/ProjectDetails(?:Media|MediaSource|Shared|Format)?[.](css|jsx?)$/,
      /^src\/components\/ProjectDetailsStories[.]css$/,
      /^src\/components\/KeshiLiquidGlass[.](css|jsx)$/,
      /^src\/components\/CaseMatteSurface[.](css|jsx)$/,
      /^src\/components\/ProjectCoverMedia[.]css$/,
      /^src\/components\/ScrollPerspectiveWave[.](css|jsx)$/,
      /^src\/components\/ProjectDetailsKeshiNext[.]css$/,
    ],
  },
  {
    path: '/project/keshi-pomodoro?layout=next',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'Keshi next-layout preview is a distinct render state of the project route',
    sources: [
      /^src\/components\/ProjectDetails(?:Media|MediaSource|Shared|Format)?[.](css|jsx?)$/,
      /^src\/components\/ProjectDetailsKeshiNext[.]css$/,
      /^src\/components\/ProjectCoverMedia[.]css$/,
      /^src\/styles\/tokens[.]css$/,
      /^src\/index[.]css$/,
    ],
  },
  {
    path: '/project/zucchini-review',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'non-pilot consumer of the same media primitives',
    sources: [
      /^src\/components\/ProjectDetailsZuchStory[.]css$/,
      /^src\/components\/ProjectDetailsZuch[.]css$/,
      /^src\/styles\/tokens[.]css$/,
      /^src\/index[.]css$/,
      /^src\/components\/ProjectDetails(?:Media|MediaSource|Shared|Format)?[.](css|jsx?)$/,
      /^src\/components\/ProjectDetailsStories[.]css$/,
      /^src\/components\/ProjectCoverMedia[.]css$/,
    ],
  },
  {
    path: '/project/freeflow',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'Liquid Glass was piloted on the hero caption here and reverted after losing a live comparison (DESIGN-DISCOVERY Round 16); back on its own flat-blur treatment',
    sources: [
      /^src\/components\/ProjectDetailsStorySharedOverrides[.]css$/,
      /^src\/styles\/tokens[.]css$/,
      /^src\/index[.]css$/,
      /^src\/components\/ProjectDetails(?:Media|MediaSource|Shared|Format)?[.](css|jsx?)$/,
      /^src\/components\/ProjectDetailsFreeflow[.]css$/,
      /^src\/components\/ProjectDetailsStories[.]css$/,
    ],
  },
  {
    path: '/project/modenote',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'project-detail monochrome chrome and story layout',
    sources: [
      /^src\/components\/ProjectDetailsStorySharedOverrides[.]css$/,
      /^src\/components\/ProjectDetailsStories[.]css$/,
      /^src\/styles\/tokens[.]css$/,
      /^src\/components\/ProjectDetails(?:Media|MediaSource|Shared|Format)?[.](css|jsx?)$/,
      /^src\/components\/ProjectDetailsModeNote(?:Story)?[.]css$/,
      /^src\/components\/ProjectCoverMedia[.]css$/,
    ],
  },
  {
    path: '/project/decrypt-password',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'project-detail monochrome state colors',
    sources: [
      /^src\/components\/ProjectDetailsDecryptStoryOverrides[.]css$/,
      /^src\/components\/ProjectDetailsStorySharedOverrides[.]css$/,
      /^src\/components\/ProjectDetailsDecryptStory[.]css$/,
      /^src\/styles\/tokens[.]css$/,
      /^src\/components\/ProjectDetails(?:Media|MediaSource|Shared|Format)?[.](css|jsx?)$/,
      /^src\/components\/ProjectDetailsStories[.]css$/,
    ],
  },
  {
    path: '/project/veluma',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'project-detail shared chrome and project composition',
    sources: [
      /^src\/components\/ProjectDetailsMux[.]css$/,
      /^src\/components\/ProjectDetailsMux[.]jsx$/,
      /^src\/styles\/tokens[.]css$/,
      /^src\/components\/ProjectDetails(?:Media|MediaSource|Shared|Format)?[.](css|jsx?)$/,
      /^src\/components\/ProjectDetailsStories[.]css$/,
      /^src\/components\/ProjectCoverMedia[.]css$/,
    ],
  },
  {
    path: '/project/hermes-command-center',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'project-detail shared chrome; private media gate remains in force',
    sources: [
      /^src\/styles\/tokens[.]css$/,
      /^src\/components\/ProjectDetails(?:Media|MediaSource|Shared|Format)?[.](css|jsx?)$/,
      /^src\/components\/ProjectDetailsHermes[.](css|jsx)$/,
    ],
  },
  {
    path: '/',
    viewports: ['desktop 1440x900'],
    note: 'WebGL poster gallery',
    sources: [
      /^src\/styles\/tokens[.]css$/,
      /^src\/index[.]css$/,
      /^src\/App[.](css|jsx)$/,
      /^src\/components\/GalleryScene[.]jsx$/,
      /^src\/components\/Navigation[.](css|jsx)$/,
      /^src\/components\/Hero[.]css$/,
      /^src\/components\/Loader[.]jsx$/,
    ],
  },
];

/**
 * Internals that belong to one component and must not be styled from elsewhere.
 *
 * The Liquid Glass integration failed exactly this way once: legacy rules in
 * another stylesheet painted over the component's layers and the production
 * render broke (DESIGN-DISCOVERY Round 11, DESIGN.md A9). The component owns
 * its surface; a consumer positions it from the outside.
 */
export const PROTECTED_INTERNALS = [
  {
    owner: 'src/components/KeshiLiquidGlass.css',
    // __content is deliberately excluded: it is the component's documented
    // extension point (KeshiLiquidGlass.jsx renders children into it), sized
    // and padded per consumer since each caller's content differs. Every
    // other layer (surface, warp, border, reflection) is the material itself
    // and stays off-limits to a consumer stylesheet.
    patterns: [/[.]keshi-liquid-glass__(?!content\b)/],
    reason:
      'The selected optical material owns every one of its visual layers (DESIGN.md A6, A9, A11); ' +
      'styling them from a consumer stylesheet is what broke the first production integration.',
  },
];

/**
 * Registered `!important` allowances. Each names a file, optionally a selector
 * pattern and properties, and a reason. There is no blanket file exemption:
 * an allowance for a reset must not also excuse a colour override.
 *
 * Existing `!important` uses across the codebase are recorded debt, not
 * allowances — they are in the baseline and stay visible as debt.
 */
export const IMPORTANT_ALLOWANCES = [];

/** Files the CSS rule reads at all. */
export const CSS_GLOBS = ['src/**/*.css'];

/** Resolve a token name to its family, or `unknown`. */
export function familyOf(tokenName) {
  for (const { pattern, family } of TOKEN_FAMILY_PATTERNS) {
    if (pattern.test(tokenName)) return family;
  }
  return 'unknown';
}

/** Families currently switched on. */
export function enabledFamilies() {
  return Object.entries(GOVERNED)
    .filter(([, spec]) => spec.enabled)
    .map(([family]) => family);
}

/** Property -> family, for enabled families only. */
export function governedPropertyMap() {
  const map = new Map();
  for (const [family, spec] of Object.entries(GOVERNED)) {
    if (!spec.enabled) continue;
    for (const property of spec.properties) map.set(property, family);
  }
  return map;
}

/** Does an exception cover this file + family (+ selector, when it names one)? */
export function exceptionFor({ file, family, selector }) {
  return EXCEPTIONS.find((exception) => {
    if (!exception.families.includes(family)) return false;
    if (!exception.files.some((candidate) => file === candidate || file.endsWith(`/${candidate}`))) return false;
    if (!exception.selectors) return true;
    return exception.selectors.some((candidate) => (selector ?? '').includes(candidate));
  });
}
