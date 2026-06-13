# Scroll Root Cause Report

Date: 2026-06-13
Target: `http://127.0.0.1:4173/`

## Finding

The scroll jank was not primarily caused by React render work. Chrome trace showed the hot path was raster/image work during scroll:

| Trace metric | Before current pass | After current pass |
|---|---:|---:|
| ImageDecodeTask total | 815.4ms | 103.2ms |
| Decode Image total | 603.7ms | 70.5ms |
| Worst image decode | 347.2ms | 27.1ms |
| FunctionCall total | 77.7ms | 83.5ms |

The remaining expensive bucket is still rasterization, which matches the UI style: fixed full-screen blend/blur/noise layers, clipped paper shapes, filters, and scroll-linked transforms.

## Main Causes

1. Fixed full-screen visual layers were being animated or composited during scroll:
   - `.noise-overlay` used `mix-blend-mode: overlay`.
   - `.gradient-red` / `.gradient-purple` used large `filter: blur(...)`.
   - `Scribbles` was a fixed full-screen canvas.

2. Images were decoded far larger than their rendered size:
   - Unsplash project cards were requested at `w=2000` but rendered around `270-292px`.
   - `profile-logo.jpg` decoded at `768x1024` but rendered at `38x38`.
   - bank/company logos decoded up to `1024x1024` but rendered at around `50x50`.

3. Extra runtime noise existed:
   - GSAP ScrollTrigger used `.hero-container` selector inside a scoped context, producing repeated "Element not found" warnings.
   - External `grainy-gradients.vercel.app/noise.svg` mask failed CORS.
   - Navigation scroll handler called React state setter on every scroll event.

## Fixes Applied

- Kept global texture layers static instead of scroll-linked opacity/parallax updates.
- Hide heavy decorative overlay layers only while the user is actively scrolling.
- Converted `Scribbles` from a 30fps fixed canvas loop to a static draw on mount/resize.
- Added responsive Unsplash `srcSet` / `sizes` in `ProjectMedia`.
- Added optimized 128px avatar/logo assets for small rendered logos.
- Deferred/lazy decoded below-the-fold logos.
- Fixed Hero ScrollTrigger triggers to use `heroRef.current`.
- Removed the external CORS-failing noise mask.
- Reduced repeated scroll state updates in `Navigation` and `ScrollManager`.

## Verification

- `npm run build`: pass
- `npx eslint src`: pass
- Fresh browser console after build: no warning/error logs

Note: `npm run lint` over the full repo timed out because it scans the large untracked `output/` browser profile/trace folders.
