#!/usr/bin/env node
// Repeat real room transitions on one mounted app to catch canvas, RAF, and
// global-listener accumulation before/after runtime module moves.
/* global document, window, location */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const option = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const origin = option('--origin', 'http://127.0.0.1:5187');
const output = resolve(root, option('--out', 'output/playwright/modularization-runtime-lifecycle.json'));
if (!output.startsWith(resolve(root, 'output/playwright') + sep) || existsSync(output)) {
  throw new Error('Choose a new output/playwright/*.json path');
}
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) throw new Error('Use a local 127.0.0.1 origin');

const states = [
  { id: 'desktop-motion', width: 1440, height: 900, reducedMotion: 'no-preference', hasTouch: false },
  { id: 'mobile-fallback', width: 390, height: 844, reducedMotion: 'no-preference', hasTouch: true },
  { id: 'desktop-reduced', width: 1440, height: 900, reducedMotion: 'reduce', hasTouch: false },
];
const results = [];
const browser = await chromium.launch({ headless: true });

async function sample(page) {
  return page.evaluate(() => ({
    path: location.pathname,
    canvases: document.querySelectorAll('canvas').length,
    stageCanvases: document.querySelectorAll('.gallery-scene canvas').length,
    waveCanvases: document.querySelectorAll('.scroll-perspective-wave__canvas').length,
    stageConnected: Boolean(document.querySelector('.gallery-stage-layer .gallery-scene')),
    routePhase: document.querySelector('.route-shell')?.getAttribute('data-route-phase'),
    activeRaf: window.__runtimeProbe.raf.size,
    globalListeners: [...window.__runtimeProbe.listeners].sort(),
    navigationCount: performance.getEntriesByType('navigation').length,
  }));
}

async function navigateMenu(page, path) {
  await page.locator('.corner-menu__trigger').click();
  await page.locator(`.corner-menu__link[href="${path}"]`).click();
  await page.waitForFunction((to) => location.pathname === to, path, { timeout: 15000 });
  await page.waitForFunction((to) => to === '/'
    ? Boolean(document.querySelector('.orbit-hero'))
      && !document.documentElement.classList.contains('room-is-entering')
    : document.querySelector('.route-shell')?.getAttribute('data-route-phase') === 'active'
      || (to === '/experience' && Boolean(document.querySelector('.experience-room'))
        && !document.documentElement.classList.contains('room-is-entering')),
  path, { timeout: 15000 });
}

try {
  for (const state of states) {
    const context = await browser.newContext({
      viewport: { width: state.width, height: state.height },
      deviceScaleFactor: 1, reducedMotion: state.reducedMotion, hasTouch: state.hasTouch,
    });
    await context.addInitScript(() => {
      const nativeRaf = window.requestAnimationFrame.bind(window);
      const nativeCancel = window.cancelAnimationFrame.bind(window);
      const raf = new Set();
      window.requestAnimationFrame = (callback) => {
        const id = nativeRaf((time) => { raf.delete(id); callback(time); });
        raf.add(id);
        return id;
      };
      window.cancelAnimationFrame = (id) => { raf.delete(id); nativeCancel(id); };
      const add = EventTarget.prototype.addEventListener;
      const remove = EventTarget.prototype.removeEventListener;
      const listenerIds = new WeakMap();
      let nextId = 0;
      const listeners = new Set();
      const keyFor = (target, type, listener, options) => {
        if (!listener || (target !== window && target !== document)) return null;
        if (!listenerIds.has(listener)) listenerIds.set(listener, ++nextId);
        const capture = typeof options === 'boolean' ? options : Boolean(options?.capture);
        return `${target === window ? 'window' : 'document'}:${type}:${listenerIds.get(listener)}:${capture}`;
      };
      EventTarget.prototype.addEventListener = function (type, listener, options) {
        const key = keyFor(this, type, listener, options);
        if (key && !options?.once) listeners.add(key);
        return add.call(this, type, listener, options);
      };
      EventTarget.prototype.removeEventListener = function (type, listener, options) {
        const key = keyFor(this, type, listener, options);
        if (key) listeners.delete(key);
        return remove.call(this, type, listener, options);
      };
      window.__runtimeProbe = { raf, listeners };
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    const cycles = [];
    let visibilityProbe = null;
    try {
      await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForFunction(() => document.documentElement.classList.contains('portfolio-ready')
        && !document.documentElement.classList.contains('boot-loader-active'),
      null, { timeout: 30000 });
      await page.waitForTimeout(1000);
      const baseline = await sample(page);
      await page.screenshot({ path: output.replace(/\.json$/, `-${state.id}-before.png`) });
      for (let index = 0; index < 10; index += 1) {
        await page.evaluate(() => document.dispatchEvent(new CustomEvent('portfolio:poster-select', {
          detail: { projectId: 'veluma', title: 'Veluma', startedAt: performance.now() },
        })));
        await page.waitForFunction(() => location.pathname === '/project/veluma'
          && document.querySelector('.route-shell')?.getAttribute('data-route-phase') === 'active',
        null, { timeout: 20000 });
        if (index === 0) {
          await page.evaluate(() => window.scrollTo(0, 650));
          await page.waitForTimeout(250);
          await page.setViewportSize({ width: state.width - 1, height: state.height });
          await page.setViewportSize({ width: state.width, height: state.height });
          const beforeHide = await sample(page);
          await page.evaluate(() => {
            Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
            document.dispatchEvent(new Event('visibilitychange'));
          });
          await page.waitForTimeout(120);
          const hidden = await sample(page);
          await page.evaluate(() => {
            delete document.hidden;
            document.dispatchEvent(new Event('visibilitychange'));
          });
          await page.waitForTimeout(180);
          visibilityProbe = { beforeHide, hidden, restored: await sample(page) };
        }
        const project = await sample(page);
        await navigateMenu(page, '/');
        await page.waitForTimeout(250);
        const home = await sample(page);
        cycles.push({ index: index + 1, project, home });
        console.log(`${state.id}: cycle ${index + 1}/10, canvas ${home.canvases}, RAF ${home.activeRaf}`);
      }
      for (const path of ['/experience', '/stack', '/contact']) {
        await navigateMenu(page, path);
        await navigateMenu(page, '/');
      }
      await page.waitForTimeout(350);
      const final = await sample(page);
      await page.screenshot({ path: output.replace(/\.json$/, `-${state.id}-after.png`) });
      const failures = [];
      for (const { index, project, home } of cycles) {
        if (project.stageCanvases !== baseline.stageCanvases || !project.stageConnected) {
          failures.push(`cycle ${index}: stage identity/canvas changed`);
        }
        if (state.id === 'desktop-motion' && project.waveCanvases < 1) {
          failures.push(`cycle ${index}: missing project wave canvas`);
        }
        if (home.canvases !== baseline.canvases || home.stageCanvases !== baseline.stageCanvases) {
          failures.push(`cycle ${index}: home canvas count changed`);
        }
        if (home.activeRaf > baseline.activeRaf + 1) failures.push(`cycle ${index}: RAF count grew`);
        if (home.globalListeners.length > baseline.globalListeners.length + 2) {
          failures.push(`cycle ${index}: global listener count grew`);
        }
        if (home.navigationCount !== 1) failures.push(`cycle ${index}: full page navigation`);
      }
      if (final.canvases !== baseline.canvases || final.activeRaf > baseline.activeRaf + 1
        || final.globalListeners.length > baseline.globalListeners.length + 2) {
        failures.push('final home resource count changed');
      }
      if (errors.length) failures.push(`${errors.length} browser errors`);
      if (state.reducedMotion === 'no-preference'
        && visibilityProbe.hidden.activeRaf >= visibilityProbe.beforeHide.activeRaf) {
        failures.push('visibility hide did not pause a scheduled RAF');
      }
      if (visibilityProbe.restored.stageCanvases !== visibilityProbe.beforeHide.stageCanvases
        || visibilityProbe.restored.waveCanvases !== visibilityProbe.beforeHide.waveCanvases) {
        failures.push('visibility restore changed canvas count');
      }
      results.push({ state: state.id, baseline, cycles, final, visibilityProbe, errors, failures });
    } catch (error) {
      results.push({ state: state.id, cycles, errors, failures: [error.message] });
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify({ schemaVersion: 1, origin, states, results }, null, 2)}\n`);
const failures = results.flatMap((result) => result.failures.map((failure) => `${result.state}: ${failure}`));
console.log(`runtime lifecycle: ${results.length} states, ${failures.length} failure(s)`);
for (const failure of failures) console.error(failure);
if (failures.length) process.exitCode = 1;
