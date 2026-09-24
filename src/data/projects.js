import modenote from './projects/modenote.js';
import hermesCommandCenter from './projects/hermes-command-center.js';
import freeflow from './projects/freeflow.js';
import veluma from './projects/veluma.js';
import keshiPomodoro from './projects/keshi-pomodoro.js';
import zucchiniReview from './projects/zucchini-review.js';
import decryptPassword from './projects/decrypt-password.js';

// Media roles are independent: coverImage is poster art; heroMedia opens the case;
// gallery contains supporting evidence/demos. A cover edit must not replace either.
// Use a new asset filename (or versioned URL) when publishing revised cover art.
export const projects = [
  modenote,
  hermesCommandCenter,
  freeflow,
  veluma,
  keshiPomodoro,
  zucchiniReview,
  decryptPassword,
];

// Deliberate cylinder membership/order; coursework remains in the project archive.
export const featuredProjects = [
  'modenote',
  'hermes-command-center',
  'freeflow',
  'veluma',
  'keshi-pomodoro',
].map(id => projects.find(project => project.id === id));

// Fast Refresh must rebuild the persistent WebGL scene when its posters change.
export const galleryMediaRevision = JSON.stringify(
  featuredProjects.map(({ id, title, coverImage }) => [id, title, coverImage]),
);
