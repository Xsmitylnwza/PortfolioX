#!/usr/bin/env node
// Current-tree browser baseline for the Project Details modularization pilot.
// Writes only under output/playwright and refuses to overwrite an existing run.
/* global document, getComputedStyle, innerWidth, innerHeight, devicePixelRatio, matchMedia, window, location */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_ROOT = resolve(ROOT, 'output/playwright');
const ROUTES = [
  { id: 'modenote', path: '/project/modenote' },
  { id: 'hermes', path: '/project/hermes-command-center' },
  { id: 'freeflow', path: '/project/freeflow' },
  { id: 'veluma', path: '/project/veluma' },
  { id: 'keshi', path: '/project/keshi-pomodoro' },
  { id: 'zucchini', path: '/project/zucchini-review' },
  { id: 'decrypt', path: '/project/decrypt-password' },
  { id: 'keshi-next', path: '/project/keshi-pomodoro?layout=next' },
];
const STATES = [
  { id: 'desktop-motion', width: 1440, height: 900, reducedMotion: 'no-preference', hasTouch: false },
  { id: 'mobile-fallback', width: 390, height: 844, reducedMotion: 'no-preference', hasTouch: true },
  { id: 'desktop-reduced', width: 1440, height: 900, reducedMotion: 'reduce', hasTouch: false },
];

function option(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

const origin = option('--origin', 'http://127.0.0.1:5187');
const output = resolve(ROOT, option('--out', 'output/playwright/modularization-capture'));
const sourceManifestPath = option('--source-manifest', '');
const routeFilter = option('--routes', '').split(',').filter(Boolean);
const stateFilter = option('--states', '').split(',').filter(Boolean);
const routes = routeFilter.length ? ROUTES.filter((route) => routeFilter.includes(route.id)) : ROUTES;
const states = stateFilter.length ? STATES.filter((state) => stateFilter.includes(state.id)) : STATES;
if (routes.length === 0 || states.length === 0
  || routes.length !== (routeFilter.length || ROUTES.length)
  || states.length !== (stateFilter.length || STATES.length)) {
  throw new Error('Unknown or duplicate --routes/--states selection');
}

if (!output.startsWith(`${OUTPUT_ROOT}${sep}`) || output === OUTPUT_ROOT) {
  throw new Error(`Output must be a child of ${OUTPUT_ROOT}`);
}
if (existsSync(output)) throw new Error(`Refusing to overwrite existing capture: ${output}`);
if (!/^https?:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
  throw new Error('Use a dedicated local server URL such as http://127.0.0.1:5187');
}

const sourceManifest = sourceManifestPath
  ? JSON.parse(readFileSync(resolve(ROOT, sourceManifestPath), 'utf8'))
  : null;
if (sourceManifest) {
  const changed = sourceManifest.files.filter((entry) => {
    const current = readFileSync(resolve(ROOT, entry.path));
    return createHash('sha256').update(current).digest('hex') !== entry.sha256;
  });
  if (changed.length) {
    throw new Error(`Source manifest is stale (${changed.length} changed file(s)): ${changed.slice(0, 5).map((entry) => entry.path).join(', ')}`);
  }
}
mkdirSync(join(output, 'screenshots'), { recursive: true });
const browser = await chromium.launch({ headless: true });
const captures = [];
const failures = [];

function hash(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function domSnapshot(page) {
  return page.evaluate(() => {
    const root = document.querySelector('#project-details');
    const targetSelectors = [
      ['root', '#project-details'],
      ['title', '#case-title'],
      ['top', '.case-top'],
      ['first-frame', '.case-media__frame'],
      ['first-label', '.case-media__label'],
      ['first-kind', '.case-media__kind'],
      ['mux-hero', '.case-mux-hero'],
    ];
    const targets = targetSelectors.flatMap(([id, selector]) => {
      const element = root?.querySelector(selector) || (id === 'root' ? root : null);
      if (!element) return [];
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return [{
        id,
        tag: element.tagName.toLowerCase(),
        values: {
          color: style.color,
          backgroundColor: style.backgroundColor,
          borderTopColor: style.borderTopColor,
          borderTopWidth: style.borderTopWidth,
          borderRadius: style.borderTopLeftRadius,
          boxShadow: style.boxShadow,
          backdropFilter: style.backdropFilter,
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
          paddingTop: style.paddingTop,
          paddingRight: style.paddingRight,
          paddingBottom: style.paddingBottom,
          paddingLeft: style.paddingLeft,
        },
        box: { width: box.width, height: box.height },
      }];
    });
    const frames = [...(root?.querySelectorAll('.case-media__frame') || [])].map((frame) => ({
      tag: frame.tagName.toLowerCase(),
      className: frame.className,
      cursor: frame.getAttribute('data-cursor'),
      cursorText: frame.getAttribute('data-cursor-text'),
      mediaKind: frame.getAttribute('data-media-kind'),
      posterTarget: frame.hasAttribute('data-poster-transition-target'),
      waveFollow: frame.hasAttribute('data-wave-follow'),
      ariaLabel: frame.getAttribute('aria-label'),
      label: frame.querySelector('.case-media__label')?.textContent?.trim() || null,
      media: [...frame.querySelectorAll('img,video,source')].map((media) => ({
        tag: media.tagName.toLowerCase(),
        src: media.getAttribute('src'),
        srcSet: media.getAttribute('srcset'),
        poster: media.getAttribute('poster'),
        alt: media.getAttribute('alt'),
      })),
    }));
    const headings = [...(root?.querySelectorAll('h1,h2,h3') || [])].map((heading) => ({
      tag: heading.tagName.toLowerCase(),
      id: heading.id,
      text: heading.textContent.trim().replace(/\s+/g, ' '),
    }));
    const directMedia = root?.querySelectorAll([
      '[data-wave-follow] > img',
      '[data-wave-follow] > video',
      '[data-wave-follow] > picture > img',
    ].join(',')).length || 0;
    return {
      title: root?.querySelector('#case-title')?.textContent?.trim() || null,
      text: root?.innerText?.replace(/\s+/g, ' ').trim() || '',
      headings,
      targets,
      frames,
      waveFollowers: root?.querySelectorAll('[data-wave-follow]').length || 0,
      waveDirectMedia: directMedia,
      posterTargets: root?.querySelectorAll('[data-poster-transition-target]').length || 0,
      waveCanvases: root?.querySelectorAll('canvas').length || 0,
      environment: {
        width: innerWidth,
        height: innerHeight,
        dpr: devicePixelRatio,
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        fonts: document.fonts.status,
      },
    };
  });
}

async function mediaInteraction(page) {
  const frame = page.locator('button.case-media__frame--expandable').first();
  if (await frame.count() === 0) return { applicable: false, reason: 'no expandable frame' };
  const initialOverflow = await page.evaluate(() => document.documentElement.style.overflow);
  await frame.scrollIntoViewIfNeeded();
  await frame.click();
  const dialog = page.locator('.case-lightbox[role="dialog"]');
  await dialog.waitFor({ state: 'visible', timeout: 10000 });
  // Reduced-motion CSS can make the dialog visible before its focus RAF fires.
  await page.waitForFunction(
    () => document.activeElement?.classList?.contains('case-lightbox__close'),
    null,
    { timeout: 1000 },
  );
  const opened = await page.evaluate(() => ({
    dialogCount: document.querySelectorAll('.case-lightbox[role="dialog"]').length,
    overflow: document.documentElement.style.overflow,
    focusClose: document.activeElement?.classList?.contains('case-lightbox__close') || false,
  }));
  await page.keyboard.press('Tab');
  const tabInside = await page.evaluate(() => document.querySelector('.case-lightbox')?.contains(document.activeElement) || false);
  await page.keyboard.press('Shift+Tab');
  const shiftTabInside = await page.evaluate(() => document.querySelector('.case-lightbox')?.contains(document.activeElement) || false);
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached', timeout: 10000 });
  const closed = {
    focusReturned: await frame.evaluate((element) => document.activeElement === element),
    overflowRestored: await page.evaluate((before) => document.documentElement.style.overflow === before, initialOverflow),
    portalGone: await page.locator('.case-lightbox').count() === 0,
  };
  return {
    applicable: true,
    opened,
    tabInside,
    shiftTabInside,
    closed,
    pass: opened.dialogCount === 1 && opened.overflow === 'hidden' && opened.focusClose
      && tabInside && shiftTabInside && Object.values(closed).every(Boolean),
  };
}

async function captureRoute(context, route, state) {
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  const key = `${route.id}/${state.id}`;
  try {
    await page.goto(new URL(route.path, origin).href, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => {
      const section = document.querySelector('#project-details');
      return section && section.closest('[data-route-phase]')?.getAttribute('data-route-phase') === 'active';
    }, null, { timeout: 30000 });
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.waitForTimeout(350);
    await page.evaluate(() => window.scrollTo(0, 0));
    const snapshot = await domSnapshot(page);
    snapshot.textHash = hash(snapshot.text);
    delete snapshot.text;
    const screenshot = `screenshots/${route.id}-${state.id}.png`;
    await page.screenshot({ path: join(output, screenshot), animations: 'disabled' });
    const interaction = await mediaInteraction(page);
    if (interaction.applicable && !interaction.pass) failures.push(`${key}: lightbox interaction failed`);
    const capture = { key, route: route.path, state: state.id, screenshot, ...snapshot, interaction, consoleErrors, pageErrors };
    if (pageErrors.length) failures.push(`${key}: ${pageErrors.length} page error(s)`);
    captures.push(capture);
    console.log(`${key}: ${snapshot.frames.length} frames, media ${interaction.applicable ? (interaction.pass ? 'PASS' : 'FAIL') : 'N/A'}`);
  } catch (error) {
    failures.push(`${key}: ${error.message}`);
    captures.push({ key, route: route.path, state: state.id, error: error.message, consoleErrors, pageErrors });
    console.error(`${key}: ${error.message}`);
  } finally {
    await page.close();
  }
}

async function captureHomeNavigation(context, state) {
  const page = await context.newPage();
  try {
    await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const link = page.locator('.orbit-static-projects a[href="/project/veluma"]');
    if (state.reducedMotion === 'reduce') {
      await link.waitFor({ state: 'visible', timeout: 30000 });
      await link.click();
    } else {
      // Motion mode intentionally hides the static link; posters own navigation.
      await page.locator('.gallery-scene canvas').waitFor({ state: 'visible', timeout: 30000 });
      const x = state.width * 0.4;
      const y = state.height * 0.5;
      let posterReady = false;
      for (let attempt = 0; attempt < 30; attempt += 1) {
        await page.mouse.move(x, y);
        await page.waitForTimeout(300);
        posterReady = Boolean((await page.locator('.gallery-scene__active').textContent())?.trim());
        if (posterReady) break;
      }
      if (!posterReady) throw new Error('No interactive poster appeared at the gallery test point');
      await page.mouse.click(x, y);
    }
    await page.locator('#project-details #case-title').waitFor({ state: 'visible', timeout: 30000 });
    const reachedProject = new URL(page.url()).pathname.startsWith('/project/');
    await page.locator('.case-top__back').click();
    if (state.reducedMotion === 'reduce') {
      await link.waitFor({ state: 'visible', timeout: 30000 });
    } else {
      await page.waitForFunction(() =>
        location.pathname === '/'
        && Boolean(document.querySelector('.orbit-hero'))
        && Boolean(document.querySelector('.gallery-scene canvas')),
      null, { timeout: 30000 });
    }
    const returnedHome = new URL(page.url()).pathname === '/';
    return { state: state.id, reachedProject, returnedHome, pass: reachedProject && returnedHome };
  } catch (error) {
    failures.push(`navigation/${state.id}: ${error.message}`);
    return { state: state.id, pass: false, error: error.message };
  } finally {
    await page.close();
  }
}

const navigation = [];
try {
  for (const state of states) {
    const context = await browser.newContext({
      viewport: { width: state.width, height: state.height },
      deviceScaleFactor: 1,
      reducedMotion: state.reducedMotion,
      hasTouch: state.hasTouch,
    });
    for (const route of routes) await captureRoute(context, route, state);
    const result = await captureHomeNavigation(context, state);
    navigation.push(result);
    if (!result.pass && !result.error) failures.push(`navigation/${state.id}: flow failed`);
    await context.close();
  }
} finally {
  await browser.close();
}

const report = {
  schemaVersion: 1,
  capturedAt: new Date().toISOString(),
  origin,
  sourceTreeHash: sourceManifest?.treeHash || null,
  routes,
  states,
  captures,
  navigation,
  failures,
};
writeFileSync(join(output, 'capture.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`capture: ${relative(ROOT, output)}, ${captures.length} route-states, ${failures.length} failure(s)`);
if (failures.length) process.exitCode = 1;
