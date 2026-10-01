// Render evidence for one Project Details route: scrolled viewport screenshots at
// desktop 1440x900 and mobile 390x844, plus a section outline used to compare
// section order against accepted pages (DESIGN.md A31).
//
//   node docs/design/loop/shoot.cjs --route veluma --port 5201 --out <dir> [--query "?layout=next"]
//
// Run from the repo root of the worktree being checked (needs ./node_modules).
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(path.join(process.cwd(), 'node_modules', 'playwright'));

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, all) => (cur.startsWith('--') ? [...acc, [cur.slice(2), all[i + 1]]] : acc), []),
);
const { route, port, out, query = '' } = args;
if (!/^[a-z0-9-]+$/.test(route || '') || !/^\d+$/.test(port || '') || Number(port) < 1 || Number(port) > 65535 || !out || (query && !query.startsWith('?'))) {
  console.error('usage: shoot.cjs --route <id> --port <n> --out <dir> [--query "?x=y"]');
  process.exit(2);
}
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const summary = { route, query, origin: `http://127.0.0.1:${port}`, viewports: {} };
  let failed = false;
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const pageErrors = [];
    const consoleErrors = [];
    const httpErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('response', (response) => { if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() }); });
    const response = await page.goto(`${summary.origin}/project/${route}${query}`, { waitUntil: 'load', timeout: 90000 });
    const title = await page.title();
    if (!response?.ok() || !title.includes('Chaimongkon Sokgampang')) throw new Error(`Unexpected application/HTTP status: ${title}, ${response?.status()}`);
    await page.waitForFunction(() => {
      const section = document.querySelector('#project-details');
      return section && section.closest('[data-route-phase]')?.getAttribute('data-route-phase') === 'active';
    }, null, { timeout: 90000 });
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.waitForTimeout(2000);

    // Scroll the whole page so scroll-triggered reveals have fired, then return to top.
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(vp.height * 0.8)) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.mouse.wheel(0, 1);
      await page.waitForTimeout(450);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1200);

    const metrics = await page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      heading: (document.querySelector('#project-details h1, #project-details h2')?.textContent || '').trim(),
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      // Top-level blocks of the case: class + first heading, in DOM order.
      outline: [...document.querySelectorAll('#project-details section, #project-details header')]
        .filter((el) => {
          const ancestor = el.parentElement?.closest('section, header');
          return !ancestor || ancestor.id === 'project-details';
        })
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          cls: (el.className && String(el.className).split(/\s+/)[0]) || '',
          heading: (el.querySelector('h1, h2, h3')?.textContent || '').trim().slice(0, 80),
        })),
    }));
    const frames = [];
    const framePositions = [];
    // WebGL surfaces render only the visible viewport. Full-page image clipping
    // would capture blank/stale canvas content below it, so scroll each view.
    for (let y = 0, i = 0; y < metrics.height; y += vp.height, i += 1) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(700);
      const scrollY = await page.evaluate(() => window.scrollY);
      const file = `${route}-${vp.name}-${String(i).padStart(2, '0')}.png`;
      await page.screenshot({
        path: path.join(out, file),
        fullPage: false,
      });
      frames.push(file);
      framePositions.push({ file, scrollY, requestedY: y });
    }
    summary.viewports[vp.name] = {
      height: metrics.height,
      horizontalScroll: metrics.scrollWidth > metrics.innerWidth,
      title,
      heading: metrics.heading,
      status: response.status(),
      pageErrors,
      consoleErrors,
      httpErrors,
      frames,
      framePositions,
      outline: metrics.outline,
    };
    const v = summary.viewports[vp.name];
    if (v.horizontalScroll || pageErrors.length || consoleErrors.length || httpErrors.length || !metrics.heading) failed = true;
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(out, `${route}-summary.json`), JSON.stringify(summary, null, 2));
  for (const [name, v] of Object.entries(summary.viewports)) {
    console.log(`${route}${query} ${name}: ${v.height}px, ${v.frames.length} frames, horizontalScroll=${v.horizontalScroll}, pageErrors=${v.pageErrors.length}, consoleErrors=${v.consoleErrors.length}, httpErrors=${v.httpErrors.length}`);
  }
  if (failed) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exit(1); });
