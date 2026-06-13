# Website Performance Matrix

Test date: 2026-06-13
Target: `http://127.0.0.1:4173`
Build: `npm run build` + `vite preview`
Tools: Lighthouse mobile + desktop, Vite bundle output, network request audit

## Global Standards

| Metric | Good | Needs improvement | Poor | Source standard |
|---|---:|---:|---:|---|
| Lighthouse Performance | 90-100 | 50-89 | 0-49 | Lighthouse scoring |
| LCP | <= 2.5s | 2.5-4.0s | > 4.0s | Core Web Vitals |
| INP / interaction proxy | <= 200ms | 200-500ms | > 500ms | Core Web Vitals |
| CLS | <= 0.1 | 0.1-0.25 | > 0.25 | Core Web Vitals |
| TBT lab proxy | <= 200ms | 200-600ms | > 600ms | Lighthouse lab proxy |
| Total page weight | <= 2 MB target | 2-5 MB | > 5 MB | Practical web perf budget |
| JS initial gzip | <= 170 KB target | 170-300 KB | > 300 KB | Practical SPA budget |

## Test Matrix

| Area | Test | Method | Pass target |
|---|---|---|---|
| Page load | Home mobile | Lighthouse mobile throttling | Perf >= 90, LCP <= 2.5s, TBT <= 200ms |
| Page load | Home desktop | Lighthouse desktop | Perf >= 90, LCP <= 2.5s, TBT <= 200ms |
| Page load | Project detail mobile | Lighthouse mobile throttling | Perf >= 90, LCP <= 2.5s, TBT <= 200ms |
| Page load | Project detail desktop | Lighthouse desktop | Perf >= 90, LCP <= 2.5s, TBT <= 200ms |
| Stability | CLS | Lighthouse | CLS <= 0.1 |
| Payload | Total byte weight | Lighthouse network audit | <= 2 MB target, <= 5 MB max |
| Bundle | Initial JS/CSS | Vite build output | JS gzip <= 170 KB, CSS gzip <= 30 KB |
| Media | Top network requests | Lighthouse network audit | No initial asset > 500 KB unless critical |
| Runtime | Main-thread work | Lighthouse diagnostics | <= 3s mobile, <= 2s desktop |
| Accessibility/SEO | Lighthouse categories | Lighthouse | >= 90 |

## Results

| Route | Profile | Perf | FCP | LCP | TBT | CLS | Speed Index | Total weight | Requests | Result |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| `/` | Mobile | 48 | 4.0s | 8.4s | 530ms | 0.016 | 7.2s | 33,869 KiB | 40 | Fail |
| `/` | Desktop | 92 | 1.0s | 1.5s | 0ms | 0.052 | 1.3s | 33,869 KiB | 38 | Pass speed, fail weight |
| `/project/keshi-pomodoro` | Mobile | 78 | 3.2s | 4.2s | 130ms | 0.018 | 3.2s | 18,629 KiB | 21 | Fail |
| `/project/keshi-pomodoro` | Desktop | 98 | 0.9s | 0.9s | 0ms | 0.044 | 1.1s | 18,629 KiB | 21 | Pass speed, fail weight |

## Bundle Result

| Asset | Raw | Gzip | Status |
|---|---:|---:|---|
| Main JS | 312.99 KB | 102.64 KB | Pass |
| React vendor | 46.08 KB | 16.37 KB | Pass |
| GSAP vendor | 69.89 KB | 27.48 KB | Pass |
| ProjectDetails lazy chunk | 5.37 KB | 1.98 KB | Pass |
| CSS | 31.50 KB | 7.55 KB | Pass |

## Heaviest Initial Requests

| Request | Transfer |
|---|---:|
| `/assets/keshi-pomodoro/demo.webp` | 15,522 KB |
| `/assets/zuchini-review/homepage.gif` | 14,016 KB |
| `/assets/decrypt-secret-pwd/gameplay.gif` | 2,395 KB |
| Unsplash kanban image | 459 KB |
| Unsplash wild-oasis image | 368 KB |
| Unsplash nurse image | 302 KB |
| `/profile-logo.jpg` | 170 KB |
| Main JS gzip | 101 KB |

## Verdict

Website is optimized well for desktop execution but not optimized enough for international mobile performance standards.

Main issue is not JS bundle. Main issue is media payload. Home loads about 33 MB, mostly animated GIF/WebP project thumbnails. This makes mobile LCP 8.4s, far above Core Web Vitals good threshold of 2.5s.

## Priority Fixes

1. Replace animated GIF thumbnails with compressed poster images on listing cards.
2. Load demos only on project detail page or on hover/click.
3. Convert GIF demos to MP4/WebM with poster image.
4. Add `loading="lazy"` and `decoding="async"` to non-critical images.
5. Use smaller image URLs for Unsplash, e.g. `w=800` for cards instead of `w=2000`.
6. Self-host or reduce Google font families/weights.
7. Add explicit width/height or stable aspect containers for every image.

## Overall Grade

Desktop: A-
Mobile: D+
Production readiness: needs media optimization before public launch.
