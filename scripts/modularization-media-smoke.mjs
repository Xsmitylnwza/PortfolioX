#!/usr/bin/env node
// Exercise the media kinds and close paths beyond the first-frame route capture.
/* global document */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_ROOT = resolve(ROOT, 'output/playwright');
const CASES = [
  { id: 'veluma-gif-escape', route: '/project/veluma', kind: 'gif', tag: 'img', close: 'escape' },
  { id: 'keshi-video-button', route: '/project/keshi-pomodoro', kind: 'video', tag: 'video', close: 'button' },
  { id: 'veluma-image-backdrop', route: '/project/veluma', kind: 'image', tag: 'img', close: 'backdrop' },
];
const STATES = [
  { id: 'desktop-motion', width: 1440, height: 900, reducedMotion: 'no-preference' },
  { id: 'mobile-fallback', width: 390, height: 844, reducedMotion: 'no-preference' },
  { id: 'desktop-reduced', width: 1440, height: 900, reducedMotion: 'reduce' },
];
const option = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
};
const origin = option('--origin', 'http://127.0.0.1:5187');
const output = resolve(ROOT, option('--out', 'output/playwright/modularization-media-smoke'));
if (!output.startsWith(`${OUTPUT_ROOT}${sep}`) || existsSync(output)) {
  throw new Error(`Output must be a new child of ${OUTPUT_ROOT}`);
}
mkdirSync(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const state of STATES) {
    const context = await browser.newContext({
      viewport: { width: state.width, height: state.height },
      deviceScaleFactor: 1,
      reducedMotion: state.reducedMotion,
      hasTouch: state.id === 'mobile-fallback',
    });
    for (const spec of CASES) {
      const page = await context.newPage();
      const key = `${spec.id}/${state.id}`;
      try {
        await page.goto(new URL(spec.route, origin).href, { waitUntil: 'domcontentloaded' });
        await page.locator('#project-details').waitFor({ state: 'visible', timeout: 30000 });
        await page.waitForFunction(() =>
          document.querySelector('#project-details')?.closest('[data-route-phase]')?.getAttribute('data-route-phase') === 'active',
        null, { timeout: 30000 });
        const frame = page.locator(`button.case-media__frame[data-media-kind="${spec.kind}"]`).first();
        await frame.waitFor({ state: 'attached', timeout: 10000 });
        const previousOverflow = await page.evaluate(() => document.documentElement.style.overflow);
        await frame.scrollIntoViewIfNeeded();
        await frame.click();
        const dialog = page.locator('.case-lightbox[role="dialog"]');
        await dialog.waitFor({ state: 'visible', timeout: 10000 });
        const media = dialog.locator('.case-lightbox__media');
        const tag = await media.evaluate((element) => element.tagName.toLowerCase());
        const source = await media.getAttribute('src');
        const focusInside = await page.evaluate(() =>
          document.querySelector('.case-lightbox')?.contains(document.activeElement) || false);
        if (spec.close === 'escape') await page.keyboard.press('Escape');
        if (spec.close === 'button') await dialog.locator('.case-lightbox__close').click();
        if (spec.close === 'backdrop') await dialog.locator('.case-lightbox__veil').click({ position: { x: 5, y: 5 } });
        await dialog.waitFor({ state: 'detached', timeout: 10000 });
        const focusReturned = await frame.evaluate((element) => document.activeElement === element);
        const overflowRestored = await page.evaluate(
          (before) => document.documentElement.style.overflow === before,
          previousOverflow,
        );
        const pass = tag === spec.tag && Boolean(source) && focusInside && focusReturned && overflowRestored;
        results.push({ key, pass, tag, source, focusInside, focusReturned, overflowRestored });
        console.log(`${pass ? 'PASS' : 'FAIL'} ${key}`);
      } catch (error) {
        results.push({ key, pass: false, error: error.message });
        console.error(`FAIL ${key}: ${error.message}`);
      } finally {
        await page.close();
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}
writeFileSync(resolve(output, 'result.json'), `${JSON.stringify({ cases: CASES, states: STATES, results }, null, 2)}\n`);
if (results.some((result) => !result.pass)) process.exitCode = 1;
