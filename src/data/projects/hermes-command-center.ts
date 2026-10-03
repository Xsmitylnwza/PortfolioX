import type { ProjectRecord } from '../projectTypes';

const project = {
    id: 'hermes-command-center' as const,
    title: 'Hermes Command Center',
    category: 'AI PERSONAL OPERATIONS • AUG 2026',
    year: 'AUG 2026',
    description: 'A private Discord-native command center that routes daily operations, projects, career, finance, routines, and external alerts into separate, evidence-aware contexts.',
    fullDescription: 'Hermes Command Center is a personal operations layer built inside Discord. Channels and Forum posts establish durable context, bounded skills read from the system that owns the truth, and scheduled jobs return to the room that owns the outcome. Explicit confirmation and read-back keep conversational activity separate from verified state.',
    tags: ['Hermes Agent', 'Python 3', 'Discord API', 'Docker', 'Linux VPS', 'Cron', 'Notion API', 'Google Calendar', 'REST APIs', 'RSS'],
    coverImage: '/assets/project-covers/hermes-command-center-cover-v4.webp',
    heroMedia: { image: '/assets/project-covers/hermes-command-center-cover-v4.webp', kind: 'cover' },
    link: null,
    repo: null,
    role: 'Product Designer & Full Stack / AI Systems Engineer',
    // Real-data demo clips, approved by the owner 2026-10-03 (DESIGN.md A14). Append one item per list to add a clip.
    gallery: [
      { image: '/assets/hermes-command-center/demo/01-plan.poster.jpg', video: '/assets/hermes-command-center/demo/01-plan.mp4' },
      { image: '/assets/hermes-command-center/demo/02-money.poster.jpg', video: '/assets/hermes-command-center/demo/02-money.mp4' },
      { image: '/assets/hermes-command-center/demo/03-memory.poster.jpg', video: '/assets/hermes-command-center/demo/03-memory.mp4' },
    ],
    galleryLabels: ['Plan', 'Money', 'Memory'],
    galleryDescriptions: [
      "At 21:30 Hermes drafts tomorrow's schedule in its own Discord thread. The owner asks for a change in plain Thai, Hermes revises it, and the exact revision is checked before the plan is locked.",
      'A bank slip is posted and Hermes reads it. A preview comes first and nothing is saved until the owner confirms with a reaction; then the transfer is logged to Money Manager with a transaction ID.',
      'Asked whether a purchase is affordable, Hermes checks its finance skill, past sessions and live finance data, then answers from what is owned, the balance and the commitments already scheduled.',
    ],
  } satisfies ProjectRecord;
export default project;
