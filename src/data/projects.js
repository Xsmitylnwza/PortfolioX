export const projects = [
  {
    id: 'modenote',
    title: 'ModeNote',
    category: 'AI VOICE WORKSPACE • JUN 2026',
    year: 'JUN 2026',
    description: 'A context-aware voice workspace that turns Thai-English conversations into searchable, source-linked working memory.',
    fullDescription: 'ModeNote is a record-first conversation workspace. It keeps recoverable audio capture independent from best-effort live transcription, then turns stopped sessions into recaps, next steps, evidence cards, source-linked chat, local search, exports, and feature-gated read-only MCP access.',
    tags: ['Next.js 16', 'React 19', 'TypeScript', 'Bun', 'Elysia', 'PostgreSQL', 'MinIO', 'Deepgram', 'Docker'],
    image: '/assets/modenote/cover.svg?rev=voice-memory-v1',
    link: 'https://modenote.xsmity.cloud/',
    code: `// Live transcription is best-effort; durable audio capture remains independent.
const recorder = new MediaRecorderCtor(stream, { mimeType: "audio/webm" });
recorder.ondataavailable = (event) => {
  this.trackChunk(event.data, captureContext);
};
recorder.start(4000);

this.pcmStreamer = await this.createPcmStreamer(stream, {
  onChunk: (chunk) => this.sendRealtimePcm(chunk, captureContext),
  onLevel: (audioLevel) => this.updateSnapshot({ audioLevel }),
});`,
    gallery: [
      {
        image: '/assets/modenote/capture-context.jpg',
        video: '/assets/modenote/capture-context.mp4',
      },
      {
        image: '/assets/modenote/next-question-loop.jpg',
        video: '/assets/modenote/next-question-loop.mp4',
      },
      {
        image: '/assets/modenote/evidence-workspace.jpg',
        video: '/assets/modenote/evidence-workspace.mp4',
      },
      {
        image: '/assets/modenote/session-library.jpg',
        video: '/assets/modenote/session-library.mp4',
      },
    ],
    galleryLabels: ['Context before capture', 'The next-question loop', 'Recap, transcript search, and export', 'Searchable session memory'],
    galleryDescriptions: [
      'The real setup flow shows language, conversation mode, and AI assist changing before the microphone opens.',
      'A simulated landing preview illustrates how a Thai-English transcript and one suggested next question can share the same loop.',
      'The real workspace moves from recap to transcript search and export while the source session stays attached.',
      'Search session titles, filter, sort, and reopen recorded sessions as a working memory library instead of a folder of audio files.',
    ],
    role: 'Full Stack Developer',
  },
  {
    id: 'freeflow',
    title: 'FreeFlow',
    category: 'CRM PLATFORM • AUG 2025',
    year: 'AUG 2025',
    description: 'A LINE OA message becomes shared client context, then proposal / project / invoice follow-up without losing the thread.',
    fullDescription: 'FreeFlow is a CRM workspace for freelancers and small teams. Its implemented channel path connects LINE OA to a realtime inbox, then keeps messages, attachments, quotations, projects, invoices, appointments, templates, and dashboard follow-up inside one organization-scoped system. Additional messaging channels remain roadmap rather than a live product claim.',
    tags: ['React 19', 'TypeScript', 'Material UI', 'TanStack Query', 'Socket.IO', 'Go Fiber', 'PostgreSQL', 'MinIO', 'Docker'],
    image: '/assets/freeflow/freeflow-cover.png',
    link: 'https://bscit.sit.kmutt.ac.th/capstone25/cp25pl2/',
    repo: 'https://gitlab.com/freeflow-capstone/freeflow-service',
    code: `// Identity lifecycle routes implemented by the FreeFlow auth service.
auth.Post("/register", authHandler.Register)
auth.Get("/verify", authHandler.VerifyEmail)
auth.Post("/login", authHandler.Login)
auth.Post("/refresh", authHandler.RefreshToken)
auth.Post("/forgot-password", authHandler.ForgotPassword)
auth.Post("/reset-password", authHandler.ResetPassword)`,
    gallery: [
      {
        image: '/assets/freeflow/product-overview-poster.png',
        video: '/assets/freeflow/product-overview.mp4',
      },
      {
        image: '/assets/freeflow/unified-inbox-poster.png',
        video: '/assets/freeflow/unified-inbox.mp4',
      },
      {
        image: '/assets/freeflow/business-dashboard-poster.png',
        video: '/assets/freeflow/business-dashboard.mp4',
      },
    ],
    galleryLabels: ['Freelance workspace', 'Client intake (LINE)', 'Business board'],
    galleryDescriptions: [
      'One sidebar runs the freelance day: dashboard, meetings, and reusable document templates.',
      'When a client reaches in through LINE, quotes and files stay on the same client/job record.',
      'Unpaid invoices, meetings, and active jobs return to one ops board.',
    ],
    role: 'Backend Engineer',
  },
  {
    id: 'veluma',
    title: 'Veluma',
    category: 'DESKTOP • JUL 2026',
    year: 'JUL 2026',
    description: 'A calm Canvas for every project: terminals, agents, backdrop, and arrangement return exactly where you left them.',
    fullDescription: 'Veluma is a local-first Windows desktop app for solo developers who move between projects and terminal-heavy work. Each Project owns a persistent Canvas: agents, servers, shells, pane material, backdrop, and arrangement are restored as one working scene. Reveal the Dock to start a stack deliberately, focus the task at hand, or use Auto Tile to reset a busy Canvas. Nothing auto-runs when you open a Project. Built with Electron, React, TypeScript, xterm.js, node-pty, Zod-validated local config, and secret-safe IPC.',
    tags: ['Electron', 'React 19', 'TypeScript', 'xterm.js', 'node-pty', 'Zod', 'pnpm'],
    image: '/assets/veluma/veluma-canvas-cover-v5.png',
    heroImage: '/assets/veluma/veluma-canvas-cover-v5.png',
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
  },
  {
    id: 'keshi-pomodoro',
    title: 'Keshi Pomodoro',
    category: 'PRODUCTIVITY • JAN 2026',
    year: 'JAN 2026',
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
    galleryDescriptions: [
      'Tune separate Focus and Relax colors, imagery, and atmosphere without changing the timer loop.',
      'Set focus and break durations, sound, and the small controls that shape each session.',
      'Read binary habits, focus reality, and day-level evidence across 7D or 30D.',
    ],
    role: 'Full Stack Developer'
  },
  {
    id: 'zucchini-review',
    title: 'Zucchini Review',
    category: 'ENTERTAINMENT • FEB 2024',
    year: 'FEB 2024',
    description: 'A Vue film-discovery and review platform where one title carries five community rating axes and the written reviews behind them.',
    fullDescription: 'Zucchini Review is a five-person Vue 3 coursework project. The browser reads catalogue and film data from TMDB, stores users, ratings, reviews, genres, and liked-review relationships in Supabase tables, and uses Pinia plus localStorage for its browser-side identity state. Signed-in users can submit five 0–100 ratings with one written review, then revisit their Reviewed list to edit or delete it.',
    tags: ['Vue 3', 'Supabase', 'Pinia', 'Tailwind CSS', 'TMDB API'],
    image: '/assets/previews/zucchini-homepage-live.png',
    link: 'https://zuchini-review.vercel.app/',
    repo: 'https://github.com/Xsmitylnwza/Zuchini-Review',
    code: `const categoryMeans = categories.map((category) =>
  reviews.reduce((sum, review) => sum + review.ratings[category], 0)
  / reviews.length
);

const zucchinitor = categoryMeans.reduce((sum, value) => sum + value, 0)
  / categoryMeans.length;`,
    gallery: [
      { image: '/assets/previews/zucchini-review-result-repo.png' },
      { image: '/assets/previews/zucchini-reviewed-repo.png' },
      { image: '/assets/previews/zucchini-login-live.png' }
    ],
    galleryLabels: ['Five-axis review result', 'Reviewed list', 'Sign-in boundary'],
    galleryKinds: ['Repository demo still', 'Repository demo still', 'Live still'],
    galleryDescriptions: [
      'Category means, the ordinary five-category mean, review text, likes, sorting, and pagination remain visible on the film page.',
      'A signed-in user returns to their own submitted reviews with explicit Edit and Delete controls.',
      'The deployed sign-in screen hands browser-side identity into Pinia and localStorage; it is not Supabase Auth.',
    ],
    flow: [
      {
        step: '01',
        title: 'Discover',
        body: 'Search TMDB-backed titles or browse the genre shelves rendered on the homepage.',
        cue: 'search · shelves · TMDB',
      },
      {
        step: '02',
        title: 'Open a film',
        body: 'Read TMDB details alongside the stored ratings and reviews associated with one movieId.',
        cue: 'one title context',
      },
      {
        step: '03',
        title: 'Rate & review',
        body: 'Set five independent 0–100 values and submit one written review after signing in.',
        cue: 'human submit',
      },
      {
        step: '04',
        title: 'Read the result',
        body: 'The browser calculates each category mean and then the ordinary mean of those five values.',
        cue: 'ordinary mean',
      },
      {
        step: '05',
        title: 'Revisit Reviewed',
        body: 'The same signed-in user can reopen the editor or explicitly delete a submitted review.',
        cue: 'edit · delete',
      },
    ],
    why: [
      {
        title: 'Film context first',
        body: 'TMDB discovery leads into one title view before the product asks for an opinion.',
      },
      {
        title: 'Five signals, one read',
        body: 'Zucchinitor exposes all five category means and derives one ordinary overall mean.',
      },
      {
        title: 'Human-owned review',
        body: 'Writing, liking, editing, and deleting remain explicit user actions.',
      },
    ],
    role: 'Frontend Developer'
  },
  {
    id: 'decrypt-password',
    title: 'Decrypt The Secret Password',
    category: 'GAME • JAN 2024',
    year: 'JAN 2024',
    description: 'Keep one password valid while live rules, a countdown, and Hardest-mode mutations fight back.',
    fullDescription: 'A Vue and Vite browser game inspired by "The Password Game". Hard, Veryhard, and Hardest set 10, 11, and 12 rules with 10:00, 7:30, and 5:00 budgets. The first input starts the timer, every edit revalidates the unlocked rules, and Hardest adds a virus every 4 seconds, fire every 2 seconds, and a final crown rule. Both completion and timeout burn-replace the password before the result appears.',
    tags: ['Vue 3', 'JavaScript', 'Vite', 'Tailwind CSS', 'DaisyUI'],
    image: '/assets/previews/decrypt-gameplay.jpg',
    link: 'https://decrypt-the-secrect-password.vercel.app/',
    repo: 'https://github.com/Xsmitylnwza/PROJECT1-SEC-2-WeLoveReact',
    code: `// The input event starts the run and rechecks the selected level
@input="() => {
  startGame()
  checkAnswer['checkAnswer' + selectedLevel.level]()
}"`,
    gallery: [
      { image: '/assets/previews/decrypt-manual.jpg' },
      { image: '/assets/previews/decrypt-select-mode.jpg' }
    ],
    galleryLabels: ['How to survive', 'Choose your pressure'],
    galleryDescriptions: [
      'The captured opening step introduces the three level identities before play begins.',
      'Hard, Veryhard, and Hardest trade 10, 11, and 12 rules for 10:00, 7:30, and 5:00.',
    ],
    role: 'Frontend Developer'
  }
];
