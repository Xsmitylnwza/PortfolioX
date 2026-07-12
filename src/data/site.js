export const PROFILE = {
  name: 'Chaimongkon Sokgampang',
  monogram: 'CS',
  title: 'Software Engineer',
  positioning: 'Software engineer · systems and full-stack · hybrid · open multi-hat teams.',
  email: 'chaimongkon.sokgampang@gmail.com',
  mailto: 'mailto:chaimongkon.sokgampang@gmail.com',
  github: {
    label: '@Xsmitylnwza',
    href: 'https://github.com/Xsmitylnwza',
  },
  resumePdf: {
    href: '/assets/Chaimongkon-Sokgampang_Resume.pdf',
    label: 'Download PDF',
  },
  cvPdf: {
    href: '/assets/Chaimongkon-Sokgampang_CV.pdf',
    label: 'CV PDF',
  },
};

export const ROOM_HINTS = {
  gallery: 'Selected systems',
  experience: 'Work in context',
  stack: 'Tools with intent',
  resume: 'Path and proof',
  contact: 'Reach the builder',
};

export const DOCUMENT_PATHS = new Set(['/stack', '/tech', '/resume', '/cv', '/contact']);

export function normalizeDocumentPath(path) {
  if (path === '/tech') return '/stack';
  if (path === '/cv') return '/resume';
  return path;
}

export const RESUME_PROOFS = [
  {
    id: '01',
    title: 'Configurable compliance systems',
    detail:
      'Reworked AML rule handling so configuration, services, and interfaces stay explicit instead of buried in code.',
    signal: 'SCB · rule engine',
  },
  {
    id: '02',
    title: 'Workflow used across teams',
    detail:
      'Turned a senior-led direction into a shared engineering workflow used by multiple team leads and developers.',
    signal: 'TTB · team scale',
  },
  {
    id: '03',
    title: 'Own the full delivery path',
    detail:
      'Clarify the request, shape architecture, ship the product, and refine against real use.',
    signal: 'Freelance · production',
  },
];

export const RESUME_ROLES = [
  {
    company: 'SCB - Siam Commercial Bank',
    role: 'Software Engineer (Contract)',
    period: 'Oct 2025 - Present',
    focus: 'Compliance systems, services, and operator interfaces',
  },
  {
    company: 'TTB - TMBThanachart Bank',
    role: 'Software Engineer (Intern)',
    period: 'May 2025 - Sep 2025',
    focus: 'Product workflow for engineering teams',
  },
  {
    company: 'Freelance',
    role: 'Full Stack Developer',
    period: 'Feb 2025 - Present',
    focus: 'End-to-end product ownership',
  },
  {
    company: 'Tomato Ideas Co., Ltd.',
    role: 'Full Stack Developer (Intern)',
    period: 'Jan 2025 - May 2025',
    focus: 'Prototypes and integration layer validation',
  },
];

export const RESUME_SKILLS = [
  'React',
  'Spring Boot',
  'Spring Batch',
  'SQL',
  'Node.js',
  'Elysia.js',
  'Docker',
  'MySQL',
];
