# Reusable matte surface — component contract (draft)

Status: material family selected by the owner on 2026-09-23; blur and edge treatment remain in comparison. No production component has been adopted yet.

## Purpose

`CaseMatteSurface` is a quiet boundary for a short annotation or state summary over a project scene. It uses a near-black translucent fill so the scene remains faintly visible and the primary product media keeps visual priority. The selected Keshi reference is the 27% matte treatment in `design/ab/keshi-caption-surface-r2/`; the follow-up blur/edge study is in `design/ab/keshi-matte-r3/`.

The component is reusable as a **material primitive**, not as a fixed card or page layout. A project chooses where an annotation is needed, what it says, and how its surrounding media is composed. A generic label that repeats the screenshot does not earn a large surface.

## Proposed interface

```jsx
<CaseMatteSurface as="aside" className="case-keshi-state__surface">
  <div className="case-keshi-state__content">…</div>
</CaseMatteSurface>
```

- `as`: semantic element (`div` by default); use `aside` only for a genuine supporting note.
- `className`: positions the surface in a project layout. It does not override the component's private material layers.
- `children`: project-owned content and internal grid/type layout.
- No blur, border, alpha, or shadow props in the production API until one tested recipe is selected. The comparison variants are experiments, not permanent controls for callers.

## Ownership

| Owner | Responsibility |
| --- | --- |
| `CaseMatteSurface` | Fill, edge, radius, optional backdrop blur, shadow, fallback without backdrop support. It does not animate or transform the page. |
| Semantic tokens | Shared material roles such as annotation fill/edge/shadow. Project themes override the role, not a primitive. Values are added only for the selected recipe. |
| Project wrapper | Width, placement, external spacing, and overlap with media. Preserve `data-wave-follow` and media discovery's DOM relationships when replacing Keshi's current wrapper. |
| Project content | Copy, evidence pointer, inner padding, grid and type hierarchy. These may differ between a state caption and an evidence annotation. |
| Page motion | Scroll wave and reveal. The material has no pointer animation. |

## Keshi pilot and adoption gate

Pilot Focus/Relax first, because the pair has a real state role and approved comparison images. Apply the selected material to other Keshi annotations only after checking repeated density. The current Proof caption needs a shorter, mark-specific annotation and approved evidence; a material swap alone cannot fix its mobile hierarchy.

Before wider reuse, verify the chosen treatment on a second project background, in desktop and mobile views, with rendered composite contrast and a browser without backdrop-filter support. Run the design checker on every changed source file, inspect the real render, and keep existing wave/media DOM contracts. The component is not a shared section-order template.
