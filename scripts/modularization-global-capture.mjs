#!/usr/bin/env node
// Browser evidence for global CSS ownership moves across every active room.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_ROOT = resolve(ROOT, 'output/playwright');
const ROUTES = [
  { id: 'home', path: '/', root: '.orbit-hero', title: '#orbit-title' },
  { id: 'experience', path: '/experience', root: '.experience-room', title: '#experience-room-title' },
  { id: 'stack', path: '/stack', root: '.engine-section', title: '.engine-hero h1' },
  { id: 'contact', path: '/contact', root: '.engine-section--contact', title: '.engine-hero h1' },
  { id: 'persona', path: '/persona', root: '.p3-page', title: '.p3-command h1' },
];
/** @type {Array<{id:string,width:number,height:number,reducedMotion:'reduce'|'no-preference',hasTouch:boolean}>} */
const STATES = [
  { id: 'desktop-motion', width: 1440, height: 900, reducedMotion: 'no-preference', hasTouch: false },
  { id: 'mobile-fallback', width: 390, height: 844, reducedMotion: 'no-preference', hasTouch: true },
  { id: 'desktop-reduced', width: 1440, height: 900, reducedMotion: 'reduce', hasTouch: false },
];
/** @param {string} name @param {string} fallback */
const option = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
};
const origin = option('--origin', 'http://127.0.0.1:5187');
const output = resolve(ROOT, option('--out', 'output/playwright/modularization-global-capture'));
const sourceManifestPath = option('--source-manifest', '');
if (!output.startsWith(`${OUTPUT_ROOT}${sep}`) || existsSync(output)) {
  throw new Error(`Output must be a new child of ${OUTPUT_ROOT}`);
}
if (!/^https?:\/\/127\.0\.0\.1:\d+$/.test(origin)) throw new Error('Expected a dedicated local server URL');
/** @type {{files:Array<{path:string,sha256:string}>,treeHash:string} | null} */
const sourceManifest = sourceManifestPath
  ? JSON.parse(readFileSync(resolve(ROOT, sourceManifestPath), 'utf8'))
  : null;
if (sourceManifest) {
  const changed = sourceManifest.files.filter((entry) =>
    createHash('sha256').update(readFileSync(resolve(ROOT, entry.path))).digest('hex') !== entry.sha256);
  if (changed.length) throw new Error(`Stale source manifest: ${changed.slice(0, 5).map((item) => item.path).join(', ')}`);
}
mkdirSync(join(output, 'screenshots'), { recursive: true });

/** @param {import('playwright').Page} page @param {(typeof ROUTES)[number]} route */
async function snapshot(page, route) {
  return page.evaluate((config) => {
    const root = document.querySelector(config.root);
    const title = document.querySelector(config.title);
    const targets = [
      ['root', config.root], ['title', config.title], ['top', 'body'],
      ['html', 'html'], ['shell', '.app-shell'], ['stage', '.gallery-stage'],
      ['stage-layer', '.gallery-stage-layer'], ['route-shell', '.route-shell'],
      ['menu', '.corner-menu'],
    ].flatMap(([id, selector]) => {
      const element = document.querySelector(selector);
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
          display: style.display,
          visibility: style.visibility,
          overflowX: style.overflowX,
          overflowY: style.overflowY,
        },
        box: { width: box.width, height: box.height },
      }];
    });
    const headings = [...(root?.querySelectorAll('h1,h2,h3') || [])].map((heading) => ({
      tag: heading.tagName.toLowerCase(),
      id: heading.id,
      text: heading.textContent?.trim().replace(/\s+/g, ' ') ?? '',
    }));
    const media = [...(root?.querySelectorAll('img,video,source') || [])].map((element) => ({
      tag: element.tagName.toLowerCase(),
      src: element.getAttribute('src'),
      srcSet: element.getAttribute('srcset'),
      alt: element.getAttribute('alt'),
      className: element.getAttribute('class'),
    }));
    const directMedia = root?.querySelectorAll([
      '[data-wave-follow] > img', '[data-wave-follow] > video',
      '[data-wave-follow] > picture > img',
    ].join(',')).length || 0;
    const text = config.id === 'persona' ? '' : (root instanceof HTMLElement ? root.innerText : '').replace(/\s+/g, ' ').trim();
    return {
      title: title?.textContent?.trim().replace(/\s+/g, ' ') || null,
      text,
      headings,
      targets,
      frames: media,
      waveFollowers: root?.querySelectorAll('[data-wave-follow]').length || 0,
      waveDirectMedia: directMedia,
      posterTargets: root?.querySelectorAll('[data-poster-transition-target]').length || 0,
      waveCanvases: document.querySelectorAll('canvas').length,
      environment: {
        width: innerWidth, height: innerHeight, dpr: devicePixelRatio,
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        fonts: document.fonts.status,
      },
      htmlClasses: [...document.documentElement.classList].filter((name) => !name.includes('loading')).sort(),
    };
  }, route);
}

/** @typedef {{key:string,route:string,state:string,[field:string]:unknown}} Capture */
/** @param {import('playwright').BrowserContext} context @param {(typeof ROUTES)[number]} route @param {(typeof STATES)[number]} state @param {Capture[]} captures @param {string[]} failures */
async function captureRoute(context, route, state, captures, failures) {
  const page = await context.newPage();
  /** @type {string[]} */
  const consoleErrors = [];
  /** @type {string[]} */
  const pageErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  const key = `${route.id}/${state.id}`;
  try {
    await page.goto(new URL(route.path, origin).href, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator(route.root).waitFor({ state: 'attached', timeout: 30000 });
    if (route.id === 'home') {
      await page.waitForFunction(() =>
        document.documentElement.classList.contains('portfolio-ready')
        && !document.documentElement.classList.contains('boot-loader-active'),
      null, { timeout: 30000 });
    } else {
      await page.waitForFunction((selector) =>
        document.querySelector(selector)?.closest('[data-route-phase]')?.getAttribute('data-route-phase') === 'active',
      route.root, { timeout: 30000 });
    }
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.waitForTimeout(route.id === 'home' ? 1200 : 350);
    const data = await snapshot(page, route);
    const { text, ...snapshotData } = data;
    const screenshot = `screenshots/${route.id}-${state.id}.png`;
    await page.screenshot({ path: join(output, screenshot), animations: 'disabled' });
    captures.push({ key, route: route.path, state: state.id, screenshot, ...snapshotData, textHash: createHash('sha256').update(text).digest('hex'),
      interaction: { applicable: false, reason: 'global style capture' }, consoleErrors, pageErrors });
    if (!data.title || pageErrors.length) failures.push(`${key}: missing title or page error`);
    console.log(`${key}: ${data.targets.length} style targets`);
  } catch (error) {
    captures.push({ key, route: route.path, state: state.id, error: error instanceof Error ? error.message : String(error), consoleErrors, pageErrors });
    failures.push(`${key}: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`${key}: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await page.close();
  }
}

/** @param {import('playwright').BrowserContext} context @param {(typeof STATES)[number]} state @param {string[]} failures */
async function navigationSmoke(context, state, failures) {
  const page = await context.newPage();
  try {
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    const trigger = page.locator('.corner-menu__trigger');
    await trigger.waitFor({ state: 'visible', timeout: 30000 });
    await trigger.click();
    await page.locator('.corner-menu__link[href="/experience"]').click();
    await page.waitForFunction(() =>
      location.pathname === '/experience'
      && document.querySelector('.experience-room')?.closest('[data-route-phase]')?.getAttribute('data-route-phase') === 'active',
    null, { timeout: 30000 });
    await trigger.click();
    await page.locator('.corner-menu__link[href="/"]').click();
    await page.waitForFunction(() => location.pathname === '/' && Boolean(document.querySelector('.orbit-hero')),
      null, { timeout: 30000 });
    return { state: state.id, pass: true };
  } catch (error) {
    failures.push(`navigation/${state.id}: ${error instanceof Error ? error.message : String(error)}`);
    return { state: state.id, pass: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    await page.close();
  }
}

const browser = await chromium.launch({ headless: true });
/** @type {Capture[]} */
const captures = [];
/** @type {string[]} */
const failures = [];
const navigation = [];
try {
  for (const state of STATES) {
    const context = await browser.newContext({
      viewport: { width: state.width, height: state.height }, deviceScaleFactor: 1,
      reducedMotion: state.reducedMotion, hasTouch: state.hasTouch,
    });
    for (const route of ROUTES) await captureRoute(context, route, state, captures, failures);
    navigation.push(await navigationSmoke(context, state, failures));
    await context.close();
  }
} finally {
  await browser.close();
}
const report = { schemaVersion: 1, capturedAt: new Date().toISOString(), origin,
  sourceTreeHash: sourceManifest?.treeHash || null, routes: ROUTES, states: STATES,
  captures, navigation, failures };
writeFileSync(join(output, 'capture.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`global capture: ${relative(ROOT, output)}, ${captures.length} route-states, ${failures.length} failure(s)`);
if (failures.length) process.exitCode = 1;
