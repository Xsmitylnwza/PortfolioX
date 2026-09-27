import type { ProjectRecord } from '../projectTypes';

const project = {
    id: 'veluma' as const,
    title: 'Veluma',
    category: 'DESKTOP • JUL 2026',
    year: 'JUL 2026',
    description: 'A calm Canvas for every project: terminals, agents, backdrop, and arrangement return exactly where you left them.',
    fullDescription: 'Veluma is a local-first Windows desktop app for solo developers who move between projects and terminal-heavy work. Each Project owns a persistent Canvas: agents, servers, shells, pane material, backdrop, and arrangement are restored as one working scene. Reveal the Dock to start a stack deliberately, focus the task at hand, or use Auto Tile to reset a busy Canvas. Nothing auto-runs when you open a Project. Built with Electron, React, TypeScript, xterm.js, node-pty, Zod-validated local config, and secret-safe IPC.',
    tags: ['Electron', 'React 19', 'TypeScript', 'xterm.js', 'node-pty', 'Zod', 'pnpm'],
    coverImage: '/assets/project-covers/veluma-cover-v3.webp',
    heroMedia: { image: '/assets/project-covers/veluma-cover-v3.webp', kind: 'cover' },
    link: 'https://veluma.xsmity.cloud/',
    code: `// Workspace start is explicit — nothing auto-runs on open/import/restore.
async function startWorkspace(workspace) {
  const ready = await resolveDependencies(workspace.sessions);
  for (const session of ready) {
    await launchSession(session, {
      env: hydrateSecrets(session.envRefs),
      onReady: waitForReadiness(session.readiness),
      restart: session.restartPolicy,
    });
  }
  markWorkspaceRunning(workspace.id);
}`,
    gallery: [
      { image: '/assets/veluma/project-return.gif' },
      { image: '/assets/veluma/start-stack.gif' },
      { image: '/assets/veluma/reset-canvas.gif' },
      { image: '/assets/veluma/canvas-material.gif' },
    ],
    galleryLabels: ['Return to a Project', 'Start the stack', 'Reset the scene', 'Shape the Canvas'],
    galleryDescriptions: [
      'Switch Projects from the revealed Dock and return to the Canvas that belongs to that work.',
      'Start every ready terminal from one explicit Dock command.',
      'Use Auto Tile to bring a scattered terminal scene back into balance.',
      'Change a Project backdrop and pane material without losing its working context.',
    ],
    demoPresentation: 'stacked',
    flow: [
      {
        step: '01',
        title: 'One workspace',
        body: 'Pin a project root and keep every agent terminal in one saved home.',
        cue: 'project home',
      },
      {
        step: '02',
        title: 'Configure once',
        body: 'Wire Codex, Claude Code, servers, env, secrets, readiness, and layout once.',
        cue: 'agents · env · layout',
      },
      {
        step: '03',
        title: 'One Start',
        body: 'Nothing auto-runs. One intentional Start wakes the whole multi-agent grid.',
        cue: 'explicit launch',
      },
      {
        step: '04',
        title: 'Work across panes',
        body: 'Codex, Claude, server, and shell run side-by-side with vivid pane identity.',
        cue: 'multi-agent grid',
      },
      {
        step: '05',
        title: 'Catch attention',
        body: 'Done / Failed stays sticky until you focus the finished pane — then switch workspaces without redoing setup.',
        cue: 'done / failed',
      },
    ],
    why: [
      {
        title: 'Stop rebuilding terminals',
        body: 'Every project keeps its own multi-agent layout instead of daily re-opening windows.',
      },
      {
        title: 'Mix agents safely',
        body: 'Codex, Claude Code, servers, and shells share one lifecycle — no special snowflake runtime.',
      },
      {
        title: 'Start is explicit',
        body: 'Import, restore, and open never auto-run. You choose when the environment comes alive.',
      },
    ],
    role: 'Full Stack Developer'
  } satisfies ProjectRecord;
export default project;
