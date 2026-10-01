# Phase 2 — Five branded project covers

Status: **art direction reopened; Phase 2 incomplete** · 5 September 2026.

Latest polish: user judged the restored composition/copy revision better and requested a small increase in visual interest. Added a copper audio imprint, sticker-edge treatment and 18% presentation enlargement of authentic Buddy, and controlled warm edge/shadow separation. Preserved screenshot layout, crops, and all authored copy. Existing preview route includes a before-polish comparison; source assets and production covers are unchanged. Design acceptance remains pending.

Current correction supersedes the entries below: the creator rejected the three-step redesign as an unrequested composition change and poor thumbnail typography. The earlier software/session-library composition is restored. Only three authored labels, their type size/contrast, and matching role-icon sizes changed. All screenshot geometry and brand/background geometry remain at the earlier baseline. Review is at native 240px/120px as well as the master. New copy direction is **AI voice notes**, **Record**, **Transcript**; it is still awaiting creator review, with no production integration.

Latest ModeNote feedback: the software composition looked better but the product category remained unclear. The default now says **Voice to notes**, shows **Record → Transcribe → Summarize** with role icons, and uses the real recording dialog, transcript and same-session recap/next steps. The actual recap comes from 0.200s of the existing demo video; no output was invented. Previous software image is retained for comparison. New preview checks pass, creator acceptance remains pending, and production remains unchanged.

Latest ModeNote correction: the user rejected the audio-reel/paper preview as insufficiently software-like and resembling a generic ChatGPT-like product. The same [preview route](http://127.0.0.1:5173/design/project-covers/modenote-ui-preview/) now defaults to actual session-library, recording-setup and transcript crops, using only copper texture and Buddy for identity. Analog v1 is preserved for comparison. This revision is reviewable but not accepted or integrated; FreeFlow acceptance is unchanged.

Follow-up preview: [ModeNote source thread](http://127.0.0.1:5173/design/project-covers/modenote-ui-preview/) now applies the accepted FreeFlow method through its own copper audio-tape scene, original transcript UI, Buddy and exact 1:04 quote. The user asked to continue this ModeNote trial after interruption. Local visual/browser checks passed; creator acceptance is pending. Production covers remain untouched.

Creator response to the FreeFlow UI/dossier preview: **direction accepted**; the user says it is beautiful and fits FreeFlow's identity, and asks to apply the approach to other products. Carry forward real UI, authentic logos, identity-specific color/material and intentional composition, not a shared folder template. Production integration and source sharpness remain separate outstanding work.

Latest execution: user requested **FreeFlow only** as a trial, with actual app UI central and imagegen allowed for detailed backgrounds. An isolated [FreeFlow preview](http://127.0.0.1:5173/design/project-covers/freeflow-ui-preview/) is now available: blue physical dossier plate, actual library and client-chat crops, unchanged logos, deterministic typography. Desktop/mobile loading, overflow and comparison controls passed; underlying source UI softness remains. Production v3 is untouched. Other projects have not been iterated in this step.

Latest creator review rejected FreeFlow, ModeNote, Veluma and Keshi version 3 as ordinary and insufficiently distinctive. Hermes is the exception and its current direction is retained. Technical integration checks do not establish design acceptance. Stop iterating production artwork until reference research has established a stronger direction. The creator clarified that references must be **actual YouTube product/feature launch thumbnails**, not website hero sections or video frames. The [nine-image reference board](http://127.0.0.1:5173/design/references/youtube-launch-thumbnails/) uses thumbnail URLs from YouTube search, with video titles/channels independently checked through oEmbed. No new production cover was made during this research step.

Scope is 2.0, 2.1–2.4 and 2.7. The user explicitly excluded Zucchini Review and Decrypt Password; their media was not integrated or replaced. Current featured membership remains ModeNote, Hermes, FreeFlow, Veluma and Keshi.

## Delivered

Version 3 gives each app a different visual structure and its own identity: FreeFlow's vivid blue dossier/LINE intake, ModeNote's Buddy/voice ribbon/source timestamp, Veluma's V/warm saved Canvas/tool marks, Keshi's original scrapbook timer, and Hermes Agent's gold emblem/Discord/source circuit. Monochrome drafts and the repeated document-card direction were superseded following user correction. See the [review board](http://127.0.0.1:5173/design/project-covers/).

Sources, fonts, actual logos, source frames, editable SVGs and dependency hashes live in `design/project-covers/`. PNG masters are 1600×1000; WebPs are quality 88, about 84–105 KB each. 240/120px thumbnails are exported separately. Real evidence media was retained; Keshi's detail video intentionally stays independent from its new cover. No synthetic operational data or private Discord capture was made.

Integration changes are limited to cover/hero metadata, cover media fit/labels, matching alt text, and removing an already-unused FreeFlow function parameter so targeted lint passes. The four illustrated heroes use 8:5 contain frames and keep labels clear of artwork. Hermes keeps its conceptual caption accessible and includes that label in the artwork.

## Verification

Final results are being written to `output/design-implementation/phase-2/production/all/`: `checks.json`, `pointer.json`, desktop/mobile/reduced screenshots and contact sheet. Build and targeted lint are run after integration. The check harness treats a deliberately opened Keshi lightbox as its actual video even under reduced motion; its resting hero uses the existing poster.

Fresh pre-production baseline: `output/design-implementation/phase-2/production/baseline/`. Final scoped diff and preservation audit will sit beside it. Earlier 2.0 baseline and run remain intact. No commit, push or deployment. Phase 3 body/diagram work has not started.
