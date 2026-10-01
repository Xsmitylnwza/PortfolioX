// @ts-check
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
/** @type {Record<string, string[]>} */
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
/** @param {string} property @param {string} family */
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
      'src/components/ProjectDetailsLayouts.css',
      'src/components/ProjectDetailsLightbox.css',
      'src/components/ProjectDetailsProcess.css',
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
/** @param {string} selector */
export function selectorSubjects(selector) {
  return (selector ?? '')
    .split(',')
    .map((part) => part.replace(/:(?:has|is|where|not|matches)\([^)]*\)/g, ' '))
    .map((part) => part.trim().split(/[\s>+~]+/).filter(Boolean).pop() ?? '')
    .filter(Boolean);
}

/** Is this violation inside a strict migrated scope? */
/** @param {{file: string; family: string; selector: string}} violation */
export function strictScopeFor({ file, family, selector }) {
  const subjects = selectorSubjects(selector);
  return STRICT_SCOPES.find((scope) => {
    if (!scope.families.includes(family)) return false;
    if (!scope.files.some((candidate) => file === candidate || file.endsWith(`/${candidate}`))) return false;
    return subjects.some((subject) => scope.selectorPatterns.some((pattern) => pattern.test(subject)));
  });
}

/**
 * Explicit route consumers. Full quality checks both directions against the
 * static closure of the route's selected entry in the same Vite build graph.
 * CSS may be declared for fewer routes than its shared chunk reaches because
 * selectors can be intentionally limited to one project.
 */
const PROJECT_DATA_SOURCES = [/^src\/data\/projects(?:\/[a-z0-9-]+)?[.](?:js|ts)$/];
const GALLERY_RUNTIME_SOURCES = [
  /^src\/components\/GalleryScene(?:Shaders|Geometry|PosterTexture)?[.](?:js|jsx|ts|tsx)$/,
];
const WAVE_RUNTIME_SOURCES = [
  /^src\/components\/ScrollPerspectiveWave(?:Capture|Shaders|AnimatedRaster)?[.](?:js|jsx|ts|tsx)$/,
];
const GLOBAL_SOURCES = [
  ...PROJECT_DATA_SOURCES,
  ...GALLERY_RUNTIME_SOURCES,
  /^src\/App[.](?:jsx|tsx)$/,
  /^src\/components\/(?:Navigation|Cursor|Loader|PosterSelectTransition)[.](?:jsx|tsx)$/,
  /^src\/features\/project-details\/(?:ProjectRoute|projectRenderers)[.](?:js|jsx|ts|tsx)$/,
  /^src\/index[.]css$/,
  /^src\/styles\/tokens[.]css$/,
  /^src\/styles\/(?:room-stage|site-utilities|room-stage-overrides)[.]css$/,
  /^src\/main[.](?:jsx|tsx)$/,
  /^src\/AppPageRoutes[.](?:jsx|tsx)$/,
  /^src\/components\/Loader[.]css$/,
  /^src\/components\/ScrollManager[.](?:jsx|tsx)$/,
  /^src\/data\/site[.](?:js|ts)$/,
];
const PROJECT_SHARED_SOURCES = [
  /^src\/components\/TechStackList[.](?:jsx|tsx)$/,
  /^src\/data\/techIcons[.](?:js|ts)$/,
  /^src\/hooks\/useDocumentRoomReveal[.](?:js|ts)$/,
  /^src\/components\/ProjectDetailsShell[.](?:jsx|tsx)$/,
  /^src\/components\/ProjectDetailsStyles[.](?:js|ts)$/,
];

export const RENDER_TARGETS = [
  {
    path: '/project/keshi-pomodoro',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'Keshi shared deterministic surface with three material levels',
    sources: [
      ...GLOBAL_SOURCES,
      ...WAVE_RUNTIME_SOURCES,
      /^src\/styles\/detail-surface[.]css$/,
      ...PROJECT_SHARED_SOURCES,
      /^src\/components\/ProjectMedia[.](?:jsx|tsx)$/,
      /^src\/components\/ProjectDetailsPrimitives[.](?:jsx|tsx)$/,
      /^src\/features\/project-details\/cases\/keshi\/KeshiCase[.](?:jsx|tsx)$/,
      /^src\/components\/ProjectDetailsKeshi[.](?:jsx|tsx)$/,
      /^src\/components\/DocumentRoom[.]css$/,
      /^src\/components\/ProjectMedia[.](?:jsx|tsx)$/,
      /^src\/hooks\/useDocumentRoomReveal[.](?:js|ts)$/,
      /^src\/components\/ProjectDetailsKeshiStoryOverrides[.]css$/,
      /^src\/components\/ProjectDetailsKeshiVelumaSurface[.]css$/,
      /^src\/components\/ProjectDetailsStorySharedOverrides[.]css$/,
      /^src\/components\/ProjectDetailsKeshiStory[.]css$/,
      /^src\/styles\/tokens[.]css$/,
      /^src\/index[.]css$/,
      /^src\/components\/ProjectDetails(?:Media|MediaSource|Shared|Layouts|Lightbox|Process)?[.](css|jsx?|tsx?)$/,
      /^src\/components\/ProjectDetailsStories[.]css$/,
      /^src\/components\/KeshiLiquidGlass[.](?:css|jsx|tsx)$/,
      /^src\/components\/ProjectCoverMedia[.]css$/,
      /^src\/components\/ScrollPerspectiveWave[.](?:css|jsx|tsx)$/,
      /^src\/components\/ProjectDetailsKeshiNext[.]css$/,
    ],
  },
  {
    path: '/project/keshi-pomodoro?layout=next',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'Keshi next-layout preview is a distinct render state of the project route',
    sources: [
      ...GLOBAL_SOURCES,
      ...WAVE_RUNTIME_SOURCES,
      /^src\/styles\/detail-surface[.]css$/,
      ...PROJECT_SHARED_SOURCES,
      /^src\/components\/ProjectMedia[.](?:jsx|tsx)$/,
      /^src\/components\/ProjectDetailsPrimitives[.](?:jsx|tsx)$/,
      /^src\/features\/project-details\/cases\/keshi\/KeshiNextCase[.](?:jsx|tsx)$/,
      /^src\/components\/ProjectDetailsKeshi[.](?:jsx|tsx)$/,
      /^src\/components\/ProjectDetailsKeshiNext[.](?:jsx|tsx)$/,
      /^src\/components\/ProjectDetails(?:Media|MediaSource|Shared|Layouts|Lightbox|Process)?[.](css|jsx?|tsx?)$/,
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
      ...GLOBAL_SOURCES,
      ...WAVE_RUNTIME_SOURCES,
      /^src\/styles\/detail-surface[.]css$/,
      ...PROJECT_SHARED_SOURCES,
      /^src\/components\/ProjectMedia[.](?:jsx|tsx)$/,
      /^src\/components\/ProjectDetailsPrimitives[.](?:jsx|tsx)$/,
      /^src\/features\/project-details\/cases\/zucchini\/ZucchiniCase[.](?:jsx|tsx)$/,
      /^src\/components\/ProjectDetailsZucchini[.](?:jsx|tsx)$/,
      /^src\/components\/ProjectDetailsZuchStory[.]css$/,
      /^src\/components\/ProjectDetailsZuch[.]css$/,
      /^src\/styles\/tokens[.]css$/,
      /^src\/index[.]css$/,
      /^src\/components\/ProjectDetails(?:Media|MediaSource|Shared|Format|Layouts|Lightbox|Process)?[.](css|jsx?|tsx?)$/,
      /^src\/components\/ProjectDetailsStories[.]css$/,
      /^src\/components\/ProjectCoverMedia[.]css$/,
    ],
  },
  {
    path: '/project/freeflow',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'FreeFlow uses the shared deterministic detail surface; the historical optical Liquid Glass pilot remains superseded',
    sources: [
      ...GLOBAL_SOURCES,
      ...WAVE_RUNTIME_SOURCES,
      /^src\/styles\/detail-surface[.]css$/,
      ...PROJECT_SHARED_SOURCES,
      /^src\/components\/ProjectMedia[.](?:jsx|tsx)$/,
      /^src\/features\/project-details\/cases\/freeflow\/FreeFlowCase[.](?:jsx|tsx)$/,
      /^src\/components\/ProjectDetailsFreeflow[.](?:jsx|tsx)$/,
      /^src\/components\/ProjectDetailsStorySharedOverrides[.]css$/,
      /^src\/styles\/tokens[.]css$/,
      /^src\/index[.]css$/,
      /^src\/components\/ProjectDetails(?:Media|MediaSource|Shared|Format|Layouts|Lightbox|Process)?[.](css|jsx?|tsx?)$/,
      /^src\/components\/ProjectDetailsFreeflow[.]css$/,
      /^src\/components\/ProjectDetailsStories[.]css$/,
    ],
  },
  {
    path: '/project/modenote',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'project-detail monochrome chrome and story layout',
    sources: [
      ...GLOBAL_SOURCES,
      ...WAVE_RUNTIME_SOURCES,
      /^src\/styles\/detail-surface[.]css$/,
      ...PROJECT_SHARED_SOURCES,
      /^src\/components\/ProjectMedia[.](?:jsx|tsx)$/,
      /^src\/features\/project-details\/cases\/modenote\/ModeNoteCase[.](?:jsx|tsx)$/,
      /^src\/components\/ProjectDetailsModeNote(?:Data|Proofs)?[.](?:js|jsx|ts|tsx)$/,
      /^src\/components\/ProjectDetailsStorySharedOverrides[.]css$/,
      /^src\/components\/ProjectDetailsStories[.]css$/,
      /^src\/styles\/tokens[.]css$/,
      /^src\/components\/ProjectDetails(?:Media|MediaSource|Shared|Format|Layouts|Lightbox|Process)?[.](css|jsx?|tsx?)$/,
      /^src\/components\/ProjectDetailsModeNote(?:Story)?[.]css$/,
      /^src\/components\/ProjectCoverMedia[.]css$/,
    ],
  },
  {
    path: '/project/decrypt-password',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'project-detail monochrome state colors',
    sources: [
      ...GLOBAL_SOURCES,
      ...WAVE_RUNTIME_SOURCES,
      /^src\/styles\/detail-surface[.]css$/,
      ...PROJECT_SHARED_SOURCES,
      /^src\/components\/ProjectMedia[.](?:jsx|tsx)$/,
      /^src\/components\/ProjectDetailsPrimitives[.](?:jsx|tsx)$/,
      /^src\/features\/project-details\/cases\/decrypt\/DecryptCase[.](?:jsx|tsx)$/,
      /^src\/components\/ProjectDetailsDecrypt[.](?:jsx|tsx)$/,
      /^src\/components\/ProjectDetailsDecryptStoryOverrides[.]css$/,
      /^src\/components\/ProjectDetailsStorySharedOverrides[.]css$/,
      /^src\/components\/ProjectDetailsDecryptStory[.]css$/,
      /^src\/styles\/tokens[.]css$/,
      /^src\/components\/ProjectDetails(?:Media|MediaSource|Shared|Layouts|Lightbox|Process)?[.](css|jsx?|tsx?)$/,
      /^src\/components\/ProjectDetailsStories[.]css$/,
    ],
  },
  {
    path: '/project/veluma',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'project-detail shared chrome and project composition',
    sources: [
      ...GLOBAL_SOURCES,
      ...WAVE_RUNTIME_SOURCES,
      /^src\/styles\/detail-surface[.]css$/,
      ...PROJECT_SHARED_SOURCES,
      /^src\/components\/ProjectMedia[.](?:jsx|tsx)$/,
      /^src\/features\/project-details\/cases\/veluma\/VelumaCase[.](?:jsx|tsx)$/,
      /^src\/components\/ProjectDetailsMux[.]css$/,
      /^src\/components\/ProjectDetailsMux[.](?:jsx|tsx)$/,
      /^src\/styles\/tokens[.]css$/,
      /^src\/components\/ProjectDetails(?:Media|MediaSource|Shared|Format|Layouts|Lightbox|Process)?[.](css|jsx?|tsx?)$/,
      /^src\/components\/ProjectDetailsStories[.]css$/,
      /^src\/components\/ProjectCoverMedia[.]css$/,
    ],
  },
  {
    path: '/project/hermes-command-center',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'project-detail shared chrome; private media gate remains in force',
    sources: [
      ...GLOBAL_SOURCES,
      ...WAVE_RUNTIME_SOURCES,
      /^src\/styles\/detail-surface[.]css$/,
      ...PROJECT_SHARED_SOURCES,
      /^src\/features\/project-details\/cases\/hermes\/HermesCase[.](?:jsx|tsx)$/,
      /^src\/styles\/tokens[.]css$/,
      /^src\/components\/ProjectMedia[.](?:jsx|tsx)$/,
      /^src\/components\/ProjectDetails(?:Media|MediaSource|Shared|Format|Layouts|Lightbox|Process)?[.](css|jsx?|tsx?)$/,
      /^src\/components\/ProjectDetailsHermes[.](?:css|jsx|tsx)$/,
    ],
  },
  {
    path: '/project/unknown-project',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'invalid project id displays the missing-project state',
    sources: [
      ...GLOBAL_SOURCES,
      /^src\/features\/project-details\/MissingProject[.](?:jsx|tsx)$/,
      /^src\/components\/(?:DocumentRoom|ProjectDetails)[.]css$/,
    ],
  },
  {
    path: '/',
    viewports: ['desktop 1440x900'],
    note: 'WebGL poster gallery',
    sources: [
      ...GLOBAL_SOURCES,
      /^src\/styles\/tokens[.]css$/,
      /^src\/index[.]css$/,
      /^src\/App[.](?:css|jsx|tsx)$/,
      /^src\/components\/GalleryScene[.](?:jsx|tsx)$/,
      /^src\/components\/Navigation[.](?:css|jsx|tsx)$/,
      /^src\/components\/Hero[.]css$/,
      /^src\/components\/Loader[.](?:jsx|tsx)$/,
      /^src\/components\/Cursor[.](?:css|jsx|tsx)$/,
      /^src\/components\/PosterSelectTransition[.](?:css|jsx|tsx)$/,
    ],
  },
  {
    path: '/persona',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'persona preview reads the ordered project records',
    sources: [
      ...GLOBAL_SOURCES,
      /^src\/components\/ProjectMedia[.](?:jsx|tsx)$/,
      ...WAVE_RUNTIME_SOURCES,
      /^src\/components\/PersonaReloadView[.](?:css|jsx|tsx)$/,
      /^src\/styles\/tokens[.]css$/,
      /^src\/index[.]css$/,
    ],
  },
  {
    path: '/experience',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'experience room over the shared stage',
    sources: [
      ...GLOBAL_SOURCES,
      ...WAVE_RUNTIME_SOURCES,
      /^src\/components\/Experience[.](?:css|jsx|tsx)$/,
      /^src\/components\/TechStackList[.](?:css|jsx|tsx)$/,
      /^src\/data\/techIcons[.](?:js|ts)$/,
      /^src\/hooks\/useDocumentRoomReveal[.](?:js|ts)$/,
      /^src\/components\/ScrollPerspectiveWave[.](?:css|jsx|tsx)$/,
    ],
  },
  {
    path: '/stack',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'stack document room and shared engine styles',
    sources: [
      ...GLOBAL_SOURCES,
      ...WAVE_RUNTIME_SOURCES,
      /^src\/components\/TechStack[.](?:css|jsx|tsx)$/,
      /^src\/components\/StackPage[.](?:jsx|tsx)$/,
      /^src\/components\/DocumentRoom[.]css$/,
      /^src\/components\/TechStackList[.](?:css|jsx|tsx)$/,
      /^src\/data\/techIcons[.](?:js|ts)$/,
      /^src\/hooks\/useDocumentRoomReveal[.](?:js|ts)$/,
    ],
  },
  {
    path: '/contact',
    viewports: ['desktop 1440x900', 'mobile 390x844'],
    note: 'contact document room consumes shared engine styles',
    sources: [
      ...GLOBAL_SOURCES,
      ...WAVE_RUNTIME_SOURCES,
      /^src\/components\/Contact[.](?:css|jsx|tsx)$/,
      /^src\/components\/ContactPage[.](?:jsx|tsx)$/,
      /^src\/components\/DocumentRoom[.]css$/,
      /^src\/hooks\/useDocumentRoomReveal[.](?:js|ts)$/,
      /^src\/components\/TechStack[.]css$/,
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
    owner: 'src/styles/detail-surface.css',
    patterns: [/[.]detail-surface__/, /\[data-surface(?:-sheen)?(?:[\s~|^$*]*=[^\]]*)?\][\s)]*::before/],
    reason: 'The shared detail surface owns its sheen and material layers (DESIGN.md A28).',
  },
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

/** Deterministic fill/rim/sheen/shadow material: backdrop sampling is forbidden. */
export const DETAIL_SURFACE = {
  tokenPattern: /--color-detail-surface-[\w-]+/,
  selectorPattern: /\[data-surface(?:-sheen)?(?:[\s~|^$*]*=[^\]]*)?\]|[.]detail-surface(?:--|__|\b)/,
};

/**
 * Registered `!important` allowances. Each names a file, optionally a selector
 * pattern and properties, and a reason. There is no blanket file exemption:
 * an allowance for a reset must not also excuse a colour override.
 *
 * Existing `!important` uses across the codebase are recorded debt, not
 * allowances — they are in the baseline and stay visible as debt.
 */
/** @type {Array<{file: string; selectorPattern?: string; properties?: string[]; reason: string}>} */
export const IMPORTANT_ALLOWANCES = [];

/** Files the CSS rule reads at all. */
export const CSS_GLOBS = ['src/**/*.css'];

/** Resolve a token name to its family, or `unknown`. */
/** @param {string} tokenName */
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
/** @param {{file: string; family: string; selector?: string}} violation */
export function exceptionFor({ file, family, selector }) {
  return EXCEPTIONS.find((exception) => {
    if (!exception.families.includes(family)) return false;
    if (!exception.files.some((candidate) => file === candidate || file.endsWith(`/${candidate}`))) return false;
    if (!exception.selectors) return true;
    return exception.selectors.some((candidate) => (selector ?? '').includes(candidate));
  });
}
