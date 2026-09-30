#!/usr/bin/env node
// Exercise the persistent gallery canvas through a real WebGL context loss.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
/** @param {string} name @param {string} fallback */
const option = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const origin = option('--origin', 'http://127.0.0.1:5187');
const route = option('--route', '/');
const canvasSelector = option('--canvas', '.gallery-scene canvas');
const output = resolve(root, option('--out', 'output/playwright/modularization-context-recovery.json'));
if (!output.startsWith(resolve(root, 'output/playwright') + sep) || existsSync(output)) {
  throw new Error('Choose a new output/playwright/*.json path');
}
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
/** @type {string[]} */
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

async function pixels() {
  return page.evaluate((selector) => {
    const canvas = document.querySelector(selector);
    if (!(canvas instanceof HTMLCanvasElement)) return { present: false, opaquePixels: 0 };
    const probe = document.createElement('canvas');
    probe.width = 36;
    probe.height = 24;
    const context = probe.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('2D probe context unavailable');
    context.drawImage(canvas, 0, 0, probe.width, probe.height);
    const data = context.getImageData(0, 0, probe.width, probe.height).data;
    let opaquePixels = 0;
    for (let index = 3; index < data.length; index += 4) {
      if (data[index] > 8) opaquePixels += 1;
    }
    return { present: true, opaquePixels,
      marker: canvas.getAttribute('data-context-probe'),
      waveActive: Boolean(/** @type {Window & {__scrollPerspectiveWave?:{active:boolean}}} */ (window).__scrollPerspectiveWave?.active),
    };
  }, canvasSelector);
}

let report;
try {
  await page.goto(new URL(route, origin).href, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction((selector) => document.documentElement.classList.contains('portfolio-ready')
    && Boolean(document.querySelector(selector)),
  canvasSelector, { timeout: 30000 });
  await page.waitForTimeout(1200);
  const before = await pixels();
  await page.evaluate((selector) => {
    const canvas = document.querySelector(selector);
    if (!canvas) throw new Error('Probe canvas disappeared');
    canvas.setAttribute('data-context-probe', 'before');
  }, canvasSelector);
  await page.screenshot({ path: output.replace(/\.json$/, '-before.png') });
  const extension = await page.evaluate((selector) => {
    const canvas = document.querySelector(selector);
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error('WebGL canvas unavailable');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const lose = gl?.getExtension('WEBGL_lose_context');
    if (!lose) return false;
    /** @type {Window & {__wave4LoseContext?:WEBGL_lose_context}} */ (window).__wave4LoseContext = lose;
    lose.loseContext();
    return true;
  }, canvasSelector);
  if (extension) {
    await page.waitForTimeout(200);
    await page.evaluate(() => /** @type {Window & {__wave4LoseContext?:WEBGL_lose_context}} */ (window).__wave4LoseContext?.restoreContext());
    await page.waitForTimeout(1800);
  }
  const after = await pixels();
  await page.screenshot({ path: output.replace(/\.json$/, '-after.png') });
  const isWave = canvasSelector.includes('scroll-perspective-wave');
  report = { route, canvasSelector, before, after, extension, errors,
    pass: extension && before.present && after.present && after.marker !== 'before'
      && (isWave ? after.waveActive : before.opaquePixels > 0 && after.opaquePixels > 0)
      && errors.length === 0 };
} catch (error) {
  report = { error: error instanceof Error ? error.message : String(error), errors, pass: false };
} finally {
  await browser.close();
}
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`context recovery ${report.pass ? 'PASS' : 'FAIL'}: ${JSON.stringify(report)}`);
if (!report.pass) process.exitCode = 1;
