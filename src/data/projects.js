export const projects = [
  {
    id: 'projectmux',
    title: 'ProjectMux',
    category: 'DESKTOP • 2026',
    year: '2026',
    description: 'Many workspaces. Many terminals. Different agents. One Start — a Windows desktop app for managing AI agent workspaces.',
    fullDescription: 'ProjectMux is a local-first Windows desktop app for people who run many projects with many terminals and different AI agents. Create a workspace per project, configure shells, Codex, Claude Code, servers, tunnels, env, secrets, ports, readiness, and layout once, then press Start Workspace to bring the whole multi-agent environment online. It keeps multiple workspaces side-by-side, runs a resizable terminal grid, surfaces Done/Failed attention until you focus the finished pane, and never auto-runs on open — setup is intentional, start is explicit. Built with Electron, React, TypeScript, xterm.js, and node-pty, with Zod-validated local config and secret-safe IPC.',
    tags: ['Electron', 'React 19', 'TypeScript', 'xterm.js', 'node-pty', 'Zod', 'pnpm'],
    image: '/assets/projectmux/workspace-grid.jpg',
    link: 'https://github.com/Xsmitylnwza/projectmux',
    repo: 'https://github.com/Xsmitylnwza/projectmux',
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
      { image: '/assets/projectmux/welcome.jpg' },
      { image: '/assets/projectmux/session-editor.jpg' },
      { image: '/assets/projectmux/command-palette.jpg' },
      { image: '/assets/projectmux/sidebar-attention.jpg' },
    ],
    galleryLabels: ['Welcome', 'Session editor', 'Command palette', 'Attention'],
    role: 'Full Stack Developer'
  },
  {
    id: 'keshi-pomodoro',
    title: 'Keshi Pomodoro',
    category: 'PRODUCTIVITY • 2026',
    year: '2026',
    description: 'A lo-fi focus timer with a real Discipline dashboard — rhythm over empty productivity theater.',
    fullDescription: 'Keshi Pomodoro sits between sterile stopwatches and aesthetic shells that forget tracking. It pairs an intentional focus/break timer (scrapbook lo-fi UI, theme studio, radio widget) with a Discipline surface that answers whether you actually showed up: binary habit matrices (Grid / Lanes / Weeks / Rank), focus reality (Hours / Days / Rank), 7D–30D range, evidence logs, and per-user habit management. The stack is React 19 + TypeScript + Vite on a Node API with SQLite discipline storage, plus Hermes-ready idempotent writes so humans and agents share the same truth. Live at pomodoro.xsmity.cloud.',
    tags: ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS', 'Node API', 'SQLite', 'Framer Motion'],
    // MP4 can be deformed by the shared WebGL wave; WebP is the clean poster.
    image: '/assets/keshi-pomodoro/main_page.webp',
    video: '/assets/keshi-pomodoro/main_page.mp4',
    link: 'https://pomodoro.xsmity.cloud/',
    repo: 'https://github.com/Xsmitylnwza/keshi-pomodoro',
    code: `// Binary habit score — done or not done (legacy 1–10 maps to done when > 0)
function normalizeHabitScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return 1;
}

function dayCompletion(scores, activeHabits) {
  if (!activeHabits.length) return 0;
  const done = activeHabits.filter((key) => normalizeHabitScore(scores[key]) === 1).length;
  return done / activeHabits.length;
}`,
    gallery: [
      {
        image: '/assets/keshi-pomodoro/theme_demo.webp',
        video: '/assets/keshi-pomodoro/theme_demo.mp4',
      },
      {
        image: '/assets/keshi-pomodoro/menu_general.webp',
        video: '/assets/keshi-pomodoro/menu_general.mp4',
      },
      {
        image: '/assets/keshi-pomodoro/discipline_dashboard.webp',
        video: '/assets/keshi-pomodoro/discipline_dashboard.mp4',
      },
    ],
    galleryLabels: ['Theme studio', 'Settings', 'Discipline'],
    role: 'Full Stack Developer'
  },
  {
    id: 'zucchini-review',
    title: 'Zucchini Review',
    category: 'ENTERTAINMENT • OCT 2024',
    year: '2024',
    description: 'A film review aggregation platform inspired by Rotten Tomatoes.',
    fullDescription: 'Zucchini Review is a comprehensive movie review platform where users can browse categories, search for films, and read or write reviews. Features include a weighted scoring system (Zucchinitor), user authentication with profile management, and a dynamic comment section for community engagement.',
    tags: ['React', 'Node.js', 'MongoDB', 'Authentication'],
    image: '/assets/previews/zucchini-homepage.jpg',
    video: '/assets/previews/zucchini-homepage.mp4',
    link: 'https://www.youtube.com/watch?v=TIypQWv4l-k',
    repo: 'https://github.com/Xsmitylnwza/PROJECT2-SEC-2-WeLoveReact',
    code: `// Review Calculation Logic
const calculateScore = (reviews) => {
  if (!reviews.length) return 0;
  const total = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  return (total / reviews.length).toFixed(1);
};`,
    gallery: [
      { image: '/assets/previews/zucchini-review.jpg', video: '/assets/previews/zucchini-review.mp4' },
      { image: '/assets/previews/zucchini-commented.jpg', video: '/assets/previews/zucchini-commented.mp4' },
      { image: '/assets/previews/zucchini-register.jpg', video: '/assets/previews/zucchini-register.mp4' }
    ],
    role: 'Frontend Developer'
  },
  {
    id: 'decrypt-password',
    title: 'Decrypt The Secret Password',
    category: 'GAME • FEB 2024',
    year: '2024',
    description: 'A web-based puzzle game challenging players to decrypt passwords under time pressure.',
    fullDescription: 'Inspired by "The Password Game", this project challenges users to create a password that satisfies increasingly complex and creative rules within a time limit. Features include difficulty levels (Hard to Hardest), dynamic rule validation, a countdown timer, and game-state animations.',
    tags: ['React', 'JavaScript', 'CSS Animation'],
    image: '/assets/previews/decrypt-gameplay.jpg',
    video: '/assets/previews/decrypt-gameplay.mp4',
    link: 'https://xsmitylnwza.github.io/PROJECT1-SEC-2-WeLoveReact/',
    repo: 'https://github.com/Xsmitylnwza/PROJECT1-SEC-2-WeLoveReact',
    code: `// Rule Validation Logic
const validateRule = (password, rule) => {
  if (rule.type === 'regex') {
    return rule.regex.test(password);
  }
  if (rule.type === 'function') {
    return rule.validate(password);
  }
  return false;
};`,
    gallery: [
      { image: '/assets/previews/decrypt-manual.jpg', video: '/assets/previews/decrypt-manual.mp4' },
      { image: '/assets/previews/decrypt-select-mode.jpg', video: '/assets/previews/decrypt-select-mode.mp4' }
    ],
    role: 'Frontend Developer'
  }
];
