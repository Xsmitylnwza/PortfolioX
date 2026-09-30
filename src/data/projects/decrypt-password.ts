import type { ProjectRecord } from '../projectTypes';

const project = {
    id: 'decrypt-password' as const,
    title: 'Decrypt The Secret Password',
    category: 'GAME • JAN 2024',
    year: 'JAN 2024',
    description: 'Keep one password valid while live rules, a countdown, and Hardest-mode mutations fight back.',
    fullDescription: 'A Vue and Vite browser game inspired by "The Password Game". Hard, Veryhard, and Hardest set 10, 11, and 12 rules with 10:00, 7:30, and 5:00 budgets. The first input starts the timer, every edit revalidates the unlocked rules, and Hardest adds a virus every 4 seconds, fire every 2 seconds, and a final crown rule. Both completion and timeout burn-replace the password before the result appears.',
    tags: ['Vue 3', 'JavaScript', 'Vite', 'Tailwind CSS', 'DaisyUI'],
    coverImage: '/assets/previews/decrypt-gameplay.jpg',
    heroMedia: { image: '/assets/previews/decrypt-gameplay.jpg' },
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
  } satisfies ProjectRecord;
export default project;
