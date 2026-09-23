# Project Details CSS ownership

The case-study CSS was split by consumer on 2026-09-23. A project-specific selector belongs in that project's stylesheet. Shared rules belong in the common files only when at least two case studies use the same behavior.

| Edit | File |
| --- | --- |
| Case shell, actions, media frame, common layouts | `src/components/ProjectDetails.css` |
| Shared Keshi/Decrypt story heading and backdrop-root rules | `src/components/ProjectDetailsStories.css` |
| Shared Keshi/Decrypt material and responsive rules | `src/components/ProjectDetailsStorySharedOverrides.css` |
| Veluma / ProjectMux composition | `src/components/ProjectDetailsMux.css` |
| Zucchini composition outside its story | `src/components/ProjectDetailsZuch.css` |
| Zucchini story | `src/components/ProjectDetailsZuchStory.css` |
| Keshi story structure | `src/components/ProjectDetailsKeshiStory.css` |
| Keshi later material, mobile, monochrome and wave refinements | `src/components/ProjectDetailsKeshiStoryOverrides.css` |
| Decrypt story structure | `src/components/ProjectDetailsDecryptStory.css` |
| Decrypt later material, mobile, monochrome and wave refinements | `src/components/ProjectDetailsDecryptStoryOverrides.css` |
| FreeFlow, ModeNote, Hermes, Keshi next preview | Their existing `ProjectDetailsFreeflow.css`, `ProjectDetailsModeNote*.css`, `ProjectDetailsHermes.css`, `ProjectDetailsKeshiNext.css` |

The shared override file sits between project base and project refinement imports in `ProjectDetails.jsx`. Its responsive rules must retain that position: moving them to the top changes Keshi and Decrypt mobile grids. The two files per Keshi/Decrypt are a cascade boundary, not two competing sources of truth. Edit the relevant file and keep the import order until a separately verified CSS migration removes that dependency.

Verification for the split: the rule/declaration multiset is unchanged; computed styles at 1440×900 and 390×844 matched before and after across Keshi, Decrypt, Zucchini, ModeNote and FreeFlow. The project-specific selectors that remain in shared files deliberately share identical material or responsive behavior between Keshi and Decrypt. Put new project-only rules in the corresponding project file.
