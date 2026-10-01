# Opus coordinator task

You are the supervised coordinator for PortfolioX's first design loop. The owner
explicitly assigns **Opus 5.5 / medium** the visual acceptance decision and
authorizes local commits and merging reviewed pages incrementally into local
`develop`, plus serialized integration of the four already agreed Veluma v4
demos. This overrides the ordinary owner-review-before-local-merge rule for
these four pages and that specific media task only. No push or deployment is authorized. Direct later owner
feedback remains authoritative. Do not modify ModeNote's accepted pilot.

Implementation: **Claude Code sonnet-5.5 / medium**, one isolated Orca worktree
per page. Tests and code/business-logic/content-truth review: **Codex
gpt-6.1-sol / medium**. You own briefs, coordination, shared-file decisions,
render review, integration, and final evidence. Route implementation fixes back
to Sonnet; test fixes belong to Codex. Use real Orca orchestration, not native
subagents, and never substitute models silently when quota is exhausted.

## Restore and pin state

1. Read AGENTS.md, PRODUCT.md, DESIGN.md (A25–A33, §§3/4/7),
   `docs/design/2026-10-01-taste-ledger.md`, `docs/design/loop/PAGES.md`,
   `docs/design/PROJECT-DETAILS-CSS-OWNERSHIP.md`, and the actual owners and data
   records. Read the Wave 5 reachability decision if editing a parked component.
   This is a local source-only redesign; private `docs/projects/hermes-*` files
   are excluded from the seed and are not public content sources.
2. Use the Orca executable resolved by the orchestration skill throughout.
   Load version-matched `orchestration` plus coordinator-loop,
   placement-and-remote, and messaging-and-gates references. Preserve your outer
   Dispatch capability and completion argv verbatim. Create/bind a **child Run**
   for your page workers; it does not replace your outer lifecycle authority.
3. Verify the launch receipt proves your effective model/effort. If unproven,
   inspect the launch/session evidence; do not claim the requested model as fact.
4. Verify seeded rules A29–A33 are present, node_modules is ready, and Playwright
   Chromium exists. Snapshot `git rev-parse HEAD` as SEED and use a unique run id
   `YYYYMMDD-HHMMSS`. Write durable progress in ignored `tmp/design-loop/<run>/`:
   Run/Task/Dispatch/worktree ids, SEED, commit ids, brief decisions, gate results,
   quota/remaining blockers. Resume these same attempts after interruption;
   never launch duplicate editors because a wait was empty.
5. Also read/update C:/letmecook/PortfolioX/tmp/design-loop/current.json atomically
   via sibling temp file plus rename, preserving fields. Match outer bootstrap
   fields: schemaVersion, phase, bundle/base, supervisorHandle/coordinatorHandle,
   coordinatorWorktreeId/path, outerRunId, coordinatorTaskId/coordinatorDispatchId,
   childRunId, seed, pages (branch/commits/gates/accepted/integrated/developCommit),
   handoffDigest, mediaIntegration, quotaBlockers, nextSteps. Record EVERY
   creation/settlement/checkpoint/merge immediately. Do not persist capabilities
   or secrets. Reuse verified accepted work on re-entry; do not redesign it.
   The Codex outer supervisor handles authority recovery; copied IDs do not
   grant lifecycle authority. A completed layout may have pending media only.

## Baseline and briefs

Start an isolated dev server on port 5200 (or another verified free port):
`npm run dev -- --host 127.0.0.1 --port 5200 --strictPort`.
Verify the response title is PortfolioX's Software Engineer page and the expected
project heading, not merely HTTP 200. Capture ModeNote, old Veluma, FreeFlow,
Hermes, both Keshi render states, Decrypt and Zucchini at 1440×900 and 390×844
before edits. Use `docs/design/loop/shoot.cjs`; inspect PNGs, not only summaries.
Freeze accepted reference captures outside worker worktrees.

Before implementation, obtain a brief per page from its Sonnet worker through
the injected blocking `ask`: factual signature, section order, hero/grid rhythm,
media plan, owner paths, differences from ModeNote and old Veluma. Compare briefs with each other before accepting their composition; approve
independent pages individually and park a blocked brief. Do not make all pages
wait for an unrelated blocked brief. A31 requires
distinct composition, not just renamed headings. No invented numeric threshold
for G13, no new checker claimed to exist, and no new shared template.

## Independent implementation wave

Plan all four page Tasks. Launch at most TWO frontend workers concurrently: first
FreeFlow and Hermes, then Keshi and Veluma as slots settle. The separate Sonnet
media recorder also consumes shared Claude quota. Check usage at wave boundaries,
reserve Opus for decisions/render review, and delegate tests/code review to Codex.
Do not assume the 01:30 reset provides unlimited capacity. Task specs contain target,
change, constraints, allowed owner paths, and observable acceptance; embed the
page's row/rules from PAGES.md and your chosen SEED. Use:

```text
orca orchestration worker-start --spec "<self-contained page task>" --worktree new-child --name loop-<run>-<page> --repo path:C:/letmecook/PortfolioX --base-branch <SEED> --agent claude --model sonnet-5.5 --effort medium --setup run --run <child-run-id> --json
```

Read `launch.requested` versus `launch.effective` and record actual identities.
The repo currently runs `npm install` with `start-immediately`; every worker must
wait for positive setup completion before checks/dev startup. Do not run another
installer concurrently with the setup hook. Use strict distinct ports from
PAGES.md; on collision find another free port and record it.

Workers edit only page owners and that page's data copy. They must preserve
media identity/count/order unless their page rule explicitly permits ordering,
direct-child discovery, `data-wave-follow`, `data-media-kind`, transition and
cursor attributes. Reuse semantic tokens and established components; new files
need coordinator approval plus ownership/route registration. Do not widen debt,
disable gates, round unrelated spacing, or restore optical Liquid Glass.

Hermes remains cover-only with public, existing claims and a conceptual signature;
no Discord captures, identifiers or real account data. Keshi's default and next
states both work; locked caption material stays matte. Veluma changes arrangement
while preserving style and the existing media list until the separate media
integration task. Handle variable gallery lengths; pair each source record with
its label/description BEFORE arranging, keyed by stable video/image path. Render
the associated captions after reordering, never by an independently reordered
index. Shared contract changes require scoped coordinator approval; no broad
media-schema migration. Only the approved v4 media task below may replace clips.

Workers run fast design checks while iterating, final `check:design -- --base
<SEED>`, `check:quality` and relevant existing project tests. They produce
before/after evidence and a precise changed-path report, commit only their
explicit allowed paths, then send exactly one successful or failed `worker_done`
using the live preamble's argv/capability and idle. Evidence stays in ignored tmp.

## Review wave and bounded corrections

After each accepted Sonnet settlement, reuse or release it before acknowledging
the Delivery. Start a Codex Task in that **exact page worktree**:

```text
orca orchestration worker-start --spec "<read-only review plus explicitly scoped tests>" --worktree id:<full-page-worktree-id> --agent codex --model gpt-6.1-sol --effort medium --run <child-run-id> --json
```

Codex traces actual render/media consumers, event handlers, data contracts,
fallbacks, content truth, accessibility and interactions. It reports concrete
findings with file/line and reproduction evidence. Add tests only for meaningful
changed behavior; no screenshot-appearance unit tests. Review alone never grants
the coordinator permission to fix implementation: dispatch fixes to Sonnet.
Codex test edits require assigned script paths; isolate shared test edits into
one review task/worktree at a time, then integrate deliberately. Run relevant
tests; do not rely on a worker's success prose.

You inspect both viewport captures, console/page/HTTP failures and route identity.
Exercise media/lightbox close/keyboard, available controls, wave/scroll behavior,
mobile layout and reduced motion. Retain Playwright evidence, not claims from
curl alone. Check small caption readability, media dominance, mono/Syne hierarchy,
paper focal tile, distinct signature/order, and Veluma style preservation.
Record each criterion as pass/fail with a PNG/interaction reference. `shoot.cjs`
is a render collector, not a complete interaction test or automated taste judge.

Route findings to the proper owner and iterate at most three correction rounds
per page. A page with unresolved blockers, unproven render evidence or quota
failure is not accepted or merged. Preserve completed work and lifecycle state;
quota/timeout is not proof of agent death. Use 30–60 second waits and report
progress at least once per minute. Process every message in every replayed
Delivery before ack. Follow the recovery reference for exited/unknown attempts.

## Integrate, verify, merge

As each independent page passes code and your visual review, integrate its
reviewed commits sequentially into the isolated coordinator branch and verify
the combined tree before merging that accepted checkpoint into local develop.
Do not wait for all four pages: park blocked pages and continue independent work.
Satisfy real shared-file dependencies before acceptance. For EVERY incremental
merge, run the gates and combined-tree checks below. Resolve
conflicts through the file owner; do not rewrite a page to clear Git conflicts.
Rerun `npm run check:quality`, `npm run test:design`,
`npm run test:project-data`, `npm run check:design -- --base <SEED>`, and
`git diff --check`. Capture and inspect all changed routes plus ModeNote,
Decrypt, Zucchini and invalid-project fallback on the **combined final tree**.
The invalid-project fallback has no `#project-details`; capture/check it with
direct Playwright navigation instead of shoot.cjs's valid-case wait.
Check other public routes from actual route declarations for console/HTTP errors
if shared owners changed. Use a strict-port production preview as well as dev
when CSS/import ownership changes; green dev output is insufficient for that.
Unchanged-route comparison should use stable DOM/computed-style and still media
as well as captures; video/WebGL frames make raw screenshot byte equality unreliable.

Verify no out-of-scope source/media changed. If a shared semantic token or route
registration was necessary, make a coordinator-owned scoped commit and rerun
the affected consumers. Do not commit tmp evidence, private docs, unrelated
untracked public media, or any asset not already approved.

Merge the accepted integration into **local `develop`** using its registered
checkout; no push/deploy. Verify develop has not advanced since your starting
point; integrate any new commits and rerun the gate on that combined result.
Preserve all dirty/untracked owner work. The preparation seed files may still
be local in the owner checkout: ONLY if every such file is byte-identical to
the frozen bundle, back up those exact seed files into ignored tmp before
clearing/moving them to allow the merge, then verify the merged files have the
same hashes. Restore those copies if merge fails. Never stash/clean/reset the
entire checkout. If any seed file changed or other dirty work conflicts, retain
the reviewed branch and report the concrete conflict; do not guess or discard.

Write final progress/report with page branches/commits, changed owners/routes,
quality results, actual launch evidence, your visual decisions and capture paths,
remaining uncertainties, and develop HEAD/merge result. Release/reuse settled
children so your child Run has no reclaimable terminals. Complete your outer
Task with the exact outer preamble's `worker_done` command, outcome, and report
path. Never say all pages merged unless the Git evidence proves it.


## Serialized Veluma media integration

Generation owns ONLY recorder/fixture changes and the approved four MP4/JPG
pairs. Its atomic handoff is
C:/letmecook/PortfolioX/tmp/veluma-media/handoff.json; exact original approved
integration instructions are T2-INTEGRATION-SPEC.md beside it. You are the ONLY
Portfolio source/integration owner. Check the handoff at wave boundaries and
before finishing; never consume the generation coordinator's inbox.

After the Veluma layout author SETTLES, verify status=ready, handoffDigest,
every asset hash, ordered hero/start/arrange/canvas stems, exact T2 labels and
descriptions, ffprobe/frame/contrast evidence and source spec. Create ONE scoped
media integration Task in an isolated worktree based on the latest accepted
integration. Sonnet may edit only src/data/projects/veluma.ts and those exact
eight public/assets/veluma/v4/<stem>.mp4/.jpg files. Copy approved untracked
assets from owner checkout by exact path/hash; never import unrelated drafts.
Renderer changes need a demonstrated playback issue and an explicit scoped
task. Preserve cover/hero and old GIFs. Never dispatch old pending T2 concurrently.
Its original no-commit instruction applied to that old standalone worker; this
reviewed integration follows the authorized local loop commit/merge contract.

Require Codex content/data/media-contract review, test:project-data, design and
combined quality gates, plus Opus desktop/mobile playback/caption/render review.
Ensure caption/media identity survives rearrangement, and empty/single/multiple
galleries work. After local merge, atomically write integration.json beside the
handoff with handoffDigest, asset hashes, reviewed evidence and develop commit;
update current.json too. Notify generation via authorized Orca messaging only
if its exact live handle is proven; the durable receipt suffices otherwise.

Pending media must not block independent pages. Once layouts finish, wait at
most TEN minutes in bounded intervals for a still-progressing recorder, then
checkpoint unfinished media for a later media-only continuation and report the
completed pages. If media fails gates, keep the accepted layout/original media,
preserve outputs and report the blocker. Do not claim integration from a ready
handoff alone or claim all pages merged without Git proof.
