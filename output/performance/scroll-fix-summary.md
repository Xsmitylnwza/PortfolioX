# Scroll Fix Summary

Date: 2026-06-13

## What changed

- Removed Lenis smooth-scroll layer.
- Throttled decorative canvas + scroll animations.
- Swapped heavy GIF thumbnails to compressed poster/video media.
- Deferred video loading until hover or scroll idle.
- Shortened loader and removed React state churn inside it.

## Measured impact

| Metric | Before | After |
|---|---:|---:|
| Total page weight (home) | 33,869 KiB | 858 KiB |
| Wheel scroll distance in 5s benchmark | 2,334 px | 4,160 px |
| Videos loaded during scroll benchmark | 2 | 0 |
| Main JS gzip | 103 KiB | 99 KiB |

## Notes

- Touched files pass `eslint` when checked directly.
- Full-repo `npm run lint` still reports unrelated pre-existing issues in untouched files.
