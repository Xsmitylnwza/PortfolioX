export const PROFILE = {
  name: 'Chaimongkon Sokgampang',
  monogram: 'CS',
  title: 'Software Engineer',
  positioning: 'Full-stack · systems · hybrid · multi-hat teams.',
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

export function normalizeDocumentPath(path) {
  if (path === '/tech') return '/stack';
  if (path === '/resume' || path === '/cv') return '/contact';
  return path;
}

export const RESUME_PROOFS = [
  {
    id: '01',
    title: 'Configurable compliance systems',
    detail: 'AML rules moved into explicit config, services, and operator UIs.',
    signal: 'SCB',
  },
  {
    id: '02',
    title: 'Workflow across engineering teams',
    detail: 'Senior-led product direction became a shared workflow at scale.',
    signal: 'TTB',
  },
  {
    id: '03',
    title: 'Full delivery ownership',
    detail: 'Clarify, architect, ship, and refine production products.',
    signal: 'Freelance',
  },
];

export const RESUME_ROLES = [
  {
    company: 'SCB',
    role: 'Software Engineer',
    period: 'Oct 2025 - Present',
  },
  {
    company: 'TTB',
    role: 'Software Engineer Intern',
    period: 'May - Sep 2025',
  },
  {
    company: 'Freelance',
    role: 'Full Stack Developer',
    period: 'Feb 2025 - Present',
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
  'Spring Batch',
  'SQL',
  'Node.js',
  'Elysia.js',
  'Docker',
  'MySQL',
];
