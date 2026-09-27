// Computed-style probe definition for the design harness.
//
// AI-DESIGN-HARNESS-PLAN requires before/after computed values for the pilot
// slice AND one non-pilot consumer, so a central-token migration can be shown
// not to have changed rendered values or project overrides.
//
// The probe lives in source (not in a transcript) so the exact same selectors
// and properties can be re-captured after migration, and later driven by
// Playwright without redefining what "the same measurement" means.

/** Routes the probe runs against. */
export const PROBE_ROUTES = [
  {
    id: 'pilot-keshi',
    role: 'pilot',
    path: '/project/keshi-pomodoro',
    note: 'Pilot slice lives here; also carries the KeshiLiquidGlass regression sentinel.',
  },
  {
    id: 'nonpilot-zucchini',
    role: 'non-pilot consumer',
    path: '/project/zucchini-review',
    note: 'Consumes the same .case-media__frame primitives through a different project renderer and its own overrides.',
  },
];

/** Viewports captured for every route. Matches the existing QA plan, not a new matrix. */
export const PROBE_VIEWPORTS = [
  { id: 'desktop', width: 1440, height: 900 },
  { id: 'mobile', width: 390, height: 844 },
];

/**
 * Governed properties, grouped the way the token contract groups them.
 * Only properties the harness intends to govern are measured — measuring
 * everything would turn incidental layout noise into false regressions.
 */
export const PROBE_PROPERTIES = {
  color: ['color', 'background-color', 'border-top-color', 'box-shadow'],
  typography: ['font-family', 'font-size', 'line-height', 'letter-spacing', 'font-weight'],
  spacing: [
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'row-gap', 'column-gap',
    // Inset positions are spacing too. Added after the G3a merge moved a chip
    // 0.8px and the comparison could not see it.
    'top', 'right', 'bottom', 'left',
  ],
  shape: ['border-top-left-radius', 'border-top-width', 'aspect-ratio'],
};

/**
 * Probe targets. `sentinel: true` marks surfaces whose rendered result must not
 * move at all during the token migration (the selected Liquid Glass recipe).
 */
// Selectors are scoped to one specific instance each. `document.querySelector`
// on a bare class would drift to whichever element happens to come first in the
// DOM, which made the hero frame masquerade as the pilot slice.
/** @typedef {keyof typeof PROBE_PROPERTIES} ProbeGroup */
/** @typedef {{id:string,selector:string,groups:ProbeGroup[],routes?:string[],extraProperties?:string[],sentinel?:boolean}} ProbeTarget */
/** @type {ProbeTarget[]} */
export const PROBE_TARGETS = [
  // --- pilot slice: the Keshi state media frame, its chips and its caption ---
  {
    id: 'pilot-frame',
    selector: '.case-keshi-state .case-media__frame--keshi-state',
    groups: ['color', 'spacing', 'shape'],
    routes: ['pilot-keshi'],
  },
  {
    id: 'pilot-frame-label',
    selector: '.case-keshi-state .case-media__frame--keshi-state .case-media__label',
    groups: ['color', 'typography', 'spacing', 'shape'],
    routes: ['pilot-keshi'],
  },
  // The Keshi state frame holds an image, so it renders no media-kind chip.
  // The atmosphere frame is the route's instance that does.
  {
    id: 'pilot-frame-kind',
    selector: '.case-media__frame--keshi-atmosphere .case-media__kind',
    groups: ['color', 'typography', 'spacing', 'shape'],
    routes: ['pilot-keshi'],
  },
  {
    id: 'pilot-frame-kind-dot',
    selector: '.case-media__frame--keshi-atmosphere .case-media__kind-dot',
    groups: ['color', 'shape'],
    routes: ['pilot-keshi'],
  },
  // The state caption's text now lives inside the glass content layer, so
  // these double as evidence that migration did not disturb the sentinel's
  // typography. `.case-keshi-state__caption` itself is only a layout slot.
  {
    id: 'pilot-caption-slot',
    selector: '.case-keshi-state--focus .case-keshi-state__caption',
    groups: ['color', 'spacing', 'shape'],
    extraProperties: ['box-shadow', 'backdrop-filter'],
    routes: ['pilot-keshi'],
  },
  {
    id: 'pilot-caption-cue',
    selector: '.case-keshi-state--focus .keshi-liquid-glass__content > span',
    groups: ['color', 'typography'],
    routes: ['pilot-keshi'],
  },
  {
    id: 'pilot-caption-body',
    selector: '.case-keshi-state--focus .keshi-liquid-glass__content p',
    groups: ['color', 'typography'],
    routes: ['pilot-keshi'],
  },

  // --- regression sentinel: the accepted optical material must not move ---
  {
    id: 'glass-surface',
    selector: '.case-keshi-state__glass',
    groups: ['color', 'shape'],
    extraProperties: ['backdrop-filter', 'border-radius'],
    sentinel: true,
    routes: ['pilot-keshi'],
  },
  {
    id: 'glass-inner',
    selector: '.case-keshi-state__glass .keshi-liquid-glass__glass',
    groups: ['color', 'shape'],
    extraProperties: ['box-shadow'],
    sentinel: true,
    routes: ['pilot-keshi'],
  },
  {
    id: 'glass-atmosphere',
    selector: '.case-keshi-atmosphere__glass',
    groups: ['color', 'shape'],
    extraProperties: ['backdrop-filter', 'border-radius'],
    sentinel: true,
    routes: ['pilot-keshi'],
  },

  // --- non-pilot consumer: same primitives, different project overrides ---
  {
    id: 'nonpilot-frame',
    selector: '.case-media__frame--zucchini-proof',
    groups: ['color', 'spacing', 'shape'],
    routes: ['nonpilot-zucchini'],
  },
  {
    id: 'nonpilot-frame-label',
    selector: '.case-media__frame--zucchini-proof .case-media__label',
    groups: ['color', 'typography', 'spacing', 'shape'],
    routes: ['nonpilot-zucchini'],
  },
  {
    id: 'nonpilot-frame-kind',
    selector: '.case-media__frame--zucchini-proof .case-media__kind',
    groups: ['color', 'typography', 'spacing', 'shape'],
    routes: ['nonpilot-zucchini'],
  },
  {
    id: 'nonpilot-frame-hero',
    selector: '.case-media__frame--zucchini-hero',
    groups: ['color', 'spacing', 'shape'],
    routes: ['nonpilot-zucchini'],
  },

  // --- shared environment on both routes: catches global token drift ---
  { id: 'case-section-body', selector: '.case-section p', groups: ['color', 'typography'] },
];

/** Resolve the property list for one target. */
/** @param {ProbeTarget} target */
export function propertiesFor(target) {
  const fromGroups = target.groups.flatMap((group) => PROBE_PROPERTIES[group] ?? []);
  return [...new Set([...fromGroups, ...(target.extraProperties ?? [])])];
}

/**
 * Serializable browser-side collector. Returned as a string so the same code
 * can be evaluated by any driver (devtools, Playwright) without bundling.
 */
/** @param {string} routeId */
export function buildCollectorSource(routeId) {
  const targets = PROBE_TARGETS
    .filter((target) => !target.routes || target.routes.includes(routeId))
    .map((target) => ({ id: target.id, selector: target.selector, properties: propertiesFor(target) }));

  return `(() => {
  const targets = ${JSON.stringify(targets)};
  // Chrome snaps used border widths to device pixels, so a 1px border reads
  // back as 0.8px at dpr 1.25. Record the environment or before/after
  // comparisons will disagree for reasons that have nothing to do with tokens.
  const environment = {
    routeId: ${JSON.stringify(routeId)},
    href: location.href,
    innerWidth: innerWidth,
    innerHeight: innerHeight,
    devicePixelRatio: devicePixelRatio,
    rootFontSize: getComputedStyle(document.documentElement).fontSize,
    fontsStatus: document.fonts.status,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
  const results = targets.map((target) => {
    const el = document.querySelector(target.selector);
    if (!el) return { id: target.id, selector: target.selector, found: false };
    const computed = getComputedStyle(el);
    const values = {};
    for (const property of target.properties) values[property] = computed.getPropertyValue(property).trim();
    const rect = el.getBoundingClientRect();
    return {
      id: target.id,
      selector: target.selector,
      found: true,
      box: { width: Math.round(rect.width * 100) / 100, height: Math.round(rect.height * 100) / 100 },
      values,
    };
  });
  return { environment, results };
})()`;
}

/**
 * Compare the current render against the phase-1 before-state, in the page.
 *
 * Capturing into a file and diffing offline needs the whole capture to travel
 * back through the driver; this returns only what moved. The offline
 * equivalent is scripts/design-compare-render.mjs, which step 4 drives from
 * Playwright once devicePixelRatio can be pinned.
 */
/** @param {string} routeId @param {string} viewportId @param {string} [beforeUrl] */
export async function compareAgainstBefore(routeId, viewportId, beforeUrl = '/docs/design/harness/phase-1-before-render.json') {
  /** @type {{captures:Array<{route:string,viewport:string,environment:{devicePixelRatio:number},results:Array<{id:string,found:boolean,values:Record<string,string>,box?:Record<string,number>,sentinel?:boolean}>}>}} */
  const before = await (await fetch(beforeUrl)).json();
  const baseline = before.captures.find((c) => c.route === routeId && c.viewport === viewportId);
  if (!baseline) return { error: `no before-capture for ${routeId}/${viewportId}` };

  await document.fonts.ready;
  /** @type {{environment:{devicePixelRatio:number},results:Array<{id:string,found:boolean,values:Record<string,string>,box?:Record<string,number>}>}} */
  const { environment, results } = eval(buildCollectorSource(routeId));

  const byId = new Map(results.map((r) => [r.id, r]));
  const changes = [];
  const noBaseline = [];
  let compared = 0;

  for (const beforeResult of baseline.results) {
    const afterResult = byId.get(beforeResult.id);
    if (!afterResult) { changes.push({ id: beforeResult.id, issue: 'missing after migration' }); continue; }
    if (beforeResult.found !== afterResult.found) {
      changes.push({ id: beforeResult.id, issue: `found ${beforeResult.found} -> ${afterResult.found}` });
      continue;
    }
    for (const [property, beforeValue] of Object.entries(beforeResult.values ?? {})) {
      compared += 1;
      const afterValue = afterResult.values[property];
      if (afterValue !== beforeValue) {
        changes.push({ id: beforeResult.id, sentinel: Boolean(beforeResult.sentinel), property, before: beforeValue, after: afterValue });
      }
    }
    // Properties the probe gained after the before-state was captured have
    // nothing to compare against. Say so instead of passing them silently.
    for (const property of Object.keys(afterResult.values ?? {})) {
      if (!(property in (beforeResult.values ?? {}))) {
        noBaseline.push(`${beforeResult.id}.${property}`);
      }
    }
    for (const dimension of ['width', 'height']) {
      compared += 1;
      const b = beforeResult.box?.[dimension];
      const a = afterResult.box?.[dimension];
      if (b !== undefined && a !== undefined && Math.abs(a - b) > 0.5) {
        changes.push({ id: beforeResult.id, property: `box.${dimension}`, before: b, after: a });
      }
    }
  }

  return {
    route: `${routeId}/${viewportId}`,
    dprBefore: baseline.environment.devicePixelRatio,
    dprAfter: environment.devicePixelRatio,
    dprComparable: baseline.environment.devicePixelRatio === environment.devicePixelRatio,
    compared,
    changes,
    noBaseline,
  };
}
