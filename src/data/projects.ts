import modenote from './projects/modenote';
import hermesCommandCenter from './projects/hermes-command-center';
import freeflow from './projects/freeflow';
import veluma from './projects/veluma';
import keshiPomodoro from './projects/keshi-pomodoro';
import zucchiniReview from './projects/zucchini-review';
import decryptPassword from './projects/decrypt-password';
import type { ProjectRecord } from './projectTypes';

// Media roles are independent: coverImage is poster art; heroMedia opens the case;
// gallery contains supporting evidence/demos. A cover edit must not replace either.
// Use a new asset filename (or versioned URL) when publishing revised cover art.
const projectRecords = [
  modenote,
  hermesCommandCenter,
  freeflow,
  veluma,
  keshiPomodoro,
  zucchiniReview,
  decryptPassword,
] as const satisfies readonly ProjectRecord[];
export type ProjectId = (typeof projectRecords)[number]['id'];
export const projects: readonly ProjectRecord[] = projectRecords;

// Deliberate cylinder membership/order; coursework remains in the project archive.
const featuredIds = [
  'modenote',
  'hermes-command-center',
  'freeflow',
  'veluma',
  'keshi-pomodoro',
] as const satisfies readonly ProjectId[];
export const featuredProjects = featuredIds.map((id) => {
  const project = projects.find((item) => item.id === id);
  if (!project) throw new Error(`Missing featured project: ${id}`);
  return project;
});

// Fast Refresh must rebuild the persistent WebGL scene when its posters change.
export const galleryMediaRevision = JSON.stringify(
  featuredProjects.map(({ id, title, coverImage }) => [id, title, coverImage]),
);
