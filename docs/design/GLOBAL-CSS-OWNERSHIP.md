# Global CSS ownership

`src/main.tsx` imports the global styles in source order. A rule moved between these files must keep that order unless a separate visual change is intended.

| Edit | File |
| --- | --- |
| Font import, semantic-token import, compatibility aliases, reset and element defaults | `src/index.css` |
| Persistent red stage, route enter/exit, loader visibility and home scroll lock | `src/styles/room-stage.css` |
| Site-wide utilities, legacy classes, scrollbar/focus and reduced-motion behavior | `src/styles/site-utilities.css` |
| Late stage visibility and document-room backdrop/compositor overrides | `src/styles/room-stage-overrides.css` |

The late stage file remains last because those overrides originally followed the utility rules in `index.css`. The split moved contiguous blocks without changing selectors or values. `MOVED_CSS_DEBT_PATHS` maps the three new paths to the original `src/index.css` debt identity; it does not permit new literals. `RENDER_TARGETS` maps the shared styles to every active route.

Several utility class names do not appear in static JSX searches. That is a **candidate usage finding**, not proof that dynamic/legacy consumers are absent. Keep the rules until their runtime and import reachability is verified separately. For a CSS-only change, compare the flattened rule order, computed styles and actual renders; a passing build or linter is not visual acceptance.
