export const PROFILE = {
  name: 'Chaimongkon Sokgampang',
  monogram: 'CS',
  title: 'Full-Stack Engineer',
  positioning: 'Banking & fintech systems · full-stack · hybrid · multi-hat teams.',
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
  contact: 'Resume + reach out',
};

export const DOCUMENT_PATHS = new Set(['/stack', '/tech', '/contact', '/resume', '/cv']);

export function isDocumentPath(path) {
  return DOCUMENT_PATHS.has(path) || (typeof path === 'string' && path.startsWith('/project/'));
}

export function normalizeDocumentPath(path) {
  if (path === '/tech') return '/stack';
  if (path === '/resume' || path === '/cv') return '/contact';
  return path;
}

export const RESUME_PROOFS = [
  {
    id: '01',
    title: 'Database-driven AML rules',
    detail: 'AMLX rule engine re-architected so business teams change rules without deploys.',
    signal: 'SCB',
  },
  {
    id: '02',
    title: 'Dashboard at engineering scale',
    detail: 'Internal productivity tool for 7 team leads and 100+ developers; Townhall recognition.',
    signal: 'TTB',
  },
  {
    id: '03',
    title: 'Full delivery ownership',
    detail: 'End-to-end client products with React, Spring Boot, and MySQL — SDLC owned start to finish.',
    signal: 'Freelance',
  },
];

export const RESUME_ROLES = [
  {
    company: 'SCB',
    role: 'Software Engineer (Part-time)',
    period: 'Oct 2025 - May 2026',
  },
  {
    company: 'TTB',
    role: 'Software Engineer Intern',
    period: 'May - Sep 2025',
  },
  {
    company: 'Freelance',
    role: 'Full-Stack Developer (Part-time)',
    period: 'Feb - Dec 2025',
  },
  {
    company: 'Tomato Ideas',
    role: 'Full Stack Intern',
    period: 'Jan - May 2025',
  },
];

export const RESUME_SKILLS = [
  'React',
  'Spring Boot',
  'Node.js',
  'Elysia.js',
  'Next.js',
  'Go',
  'MySQL',
  'PostgreSQL',
  'Docker',
  'AWS',
];
