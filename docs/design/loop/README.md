# PortfolioX design-loop preparation

Resumed from Claude session `dcc6ee2e-e2fe-4953-8d42-4e020d93620c`, stopped
2026-10-01 at 22:40 Bangkok while preparing the owner's automation prompt.
ModeNote pilot is already committed on develop (`c941b98`). Rules A29–A33,
the taste ledger and loop tooling were still local; a new Git worktree would
otherwise omit them. This preparation makes those exact files available without
committing or modifying the owner's source checkout.

## Paste into Orca automation

- Provider: **Codex** (bootstrap and outer supervision only).
- Workspace: existing **C:/letmecook/PortfolioX**, fresh session.
- Prompt: all of [AUTOMATION-PROMPT.md](AUTOMATION-PROMPT.md).
- Updated overnight schedule: Portfolio 01:40 Bangkok, Veluma media 01:45.
- Both outer supervisors use Codex/fresh; Portfolio launches Opus and at most
  two frontend workers concurrently; Veluma dispatches one Sonnet recording worker.
- Durable Portfolio index: tmp/design-loop/current.json. Generation publishes
  tmp/veluma-media/handoff.json; Opus exclusively owns Portfolio integration.
- Reviewed pages integrate incrementally; pending media does not block them.
- The actual coordinator is launched as **Claude opus-5.5 / medium** through
  worker-start. Frontend = sonnet-5.5 / medium; review = gpt-6.1-sol / medium.

Orca 1.4.217's automation create/edit CLI exposes provider but no per-automation
model/effort flag. The explicit supervised Opus launch avoids changing global
Claude defaults (currently Sonnet / medium in the resumed session). It also
records requested/effective launch preferences. Model execution after quota
reset still needs real session evidence; this setup does not spend Claude quota.

## Freeze and verify

From the owner's repository, freeze once into a new directory:

```powershell
node docs/design/loop/prepare.mjs --freeze --bundle tmp/design-loop-seed/ready-v3
```

The bundle contains exactly eight allowlisted files with SHA-256 hashes and
the develop base commit. It excludes private Hermes docs, credentials, media
drafts and unrelated work. Do not edit a frozen bundle; make a new one and update
the automation prompt if its rules need to change.

In a new **clean worktree from develop**, with setup skipped:

```powershell
node C:/letmecook/PortfolioX/tmp/design-loop-seed/ready-v3/files/docs/design/loop/prepare.mjs --bundle C:/letmecook/PortfolioX/tmp/design-loop-seed/ready-v3 --target C:/absolute/worktree --install
node docs/design/loop/prepare.mjs --bundle C:/letmecook/PortfolioX/tmp/design-loop-seed/ready-v3 --target C:/absolute/worktree --check
```

The helper rejects the owner checkout and other repositories. It validates the
whole bundle before copying and refuses a dirty target. npm ci is explicit,
not parallel with the repo's npm install hook. Playwright's shared Chromium
installation is checked; install it with `npx playwright install chromium` if
missing. No secrets/env credentials are copied into worktrees.

## Evidence and acceptance

`node docs/design/loop/shoot.cjs --route veluma --port 5204 --out tmp/design-loop/veluma`
captures 1440×900 and 390×844, HTTP/console/page errors, page identity and section
outline. It exits nonzero on runtime/HTTP/overflow failures. PNGs are evidence
for Opus to inspect; the script does not decide taste or test all interactions.
Use a different out directory for Keshi `--query "?layout=next"`.

See [COORDINATOR-PROMPT.md](COORDINATOR-PROMPT.md) for briefs, parallel worktree
dispatch, correction rounds, final combined-tree verification, local develop
merge, dirty-work preservation and lifecycle cleanup. The owner explicitly
delegated visual acceptance to Opus for this loop; mechanical checks alone do
not confer that acceptance. Source/model/route claims must be supported by the
actual run. The preparation itself does not launch redesigns or schedule runs.
