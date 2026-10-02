import type { ProjectRecord } from '../projectTypes';

const project = {
    id: 'keshi-pomodoro' as const,
    title: 'Keshi Pomodoro',
    category: 'PRODUCTIVITY • JAN 2026',
    year: 'JAN 2026',
    description: 'A lo-fi focus timer with a real Discipline dashboard — rhythm over empty productivity theater.',
    fullDescription: 'Keshi Pomodoro sits between sterile stopwatches and aesthetic shells that forget tracking. It pairs an intentional focus/break timer (scrapbook lo-fi UI, theme studio, radio widget) with a Discipline surface that answers whether you actually showed up: binary habit matrices (Grid / Lanes / Weeks / Rank), focus reality (Hours / Days / Rank), 7D–30D range, evidence logs, and per-user habit management. The stack is React 19 + TypeScript + Vite on a Node API with SQLite discipline storage, plus Hermes-ready idempotent writes so humans and agents share the same truth. Live at pomodoro.xsmity.cloud.',
    tags: ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS', 'Node API', 'SQLite', 'Framer Motion'],
    // MP4 can be deformed by the shared WebGL wave; WebP is the clean poster.
    coverImage: '/assets/project-covers/keshi-pomodoro-cover-v4.webp',
    heroMedia: {
      image: '/assets/keshi-pomodoro/main_page.webp',
      video: '/assets/keshi-pomodoro/main_page.mp4',
    },
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
  } satisfies ProjectRecord;
export default project;
