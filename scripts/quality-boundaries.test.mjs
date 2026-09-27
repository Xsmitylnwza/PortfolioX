// @ts-check
import assert from 'node:assert/strict';
import test from 'node:test';

import { edgeViolations, unclassifiedDetail } from './quality-boundaries.mjs';

test('case entry and authored layout cannot import the real app shell', () => {
  assert.match(
    edgeViolations('src/features/project-details/cases/keshi/KeshiCase.tsx', 'src/App.tsx').join('\n'),
    /imports app shell/,
  );
  assert.match(
    edgeViolations('src/components/ProjectDetailsKeshi.tsx', 'src/AppPageRoutes.tsx').join('\n'),
    /imports app shell/,
  );
});

test('case ownership includes layouts and their private helpers', () => {
  assert.match(
    edgeViolations('src/components/ProjectDetailsKeshi.tsx', 'src/components/ProjectDetailsDecrypt.tsx').join('\n'),
    /imports another case owner/,
  );
  assert.deepEqual(
    edgeViolations('src/components/ProjectDetailsKeshiNext.tsx', 'src/components/ProjectDetailsKeshi.tsx'),
    [],
  );
  assert.deepEqual(
    edgeViolations('src/components/ProjectDetailsModeNote.tsx', 'src/components/ProjectDetailsModeNoteData.ts'),
    [],
  );
});

test('shared source cannot reach a case owner', () => {
  assert.match(
    edgeViolations('src/components/ProjectDetailsShell.tsx', 'src/components/ProjectDetailsKeshi.tsx').join('\n'),
    /shared code imports case owner/,
  );
  assert.match(
    edgeViolations('src/data/projects.ts', 'src/features/project-details/cases/keshi/KeshiCase.tsx').join('\n'),
    /shared code imports case owner/,
  );
  assert.match(
    edgeViolations('src/components/ProjectDetailsShell.tsx', 'src/App.tsx').join('\n'),
    /lower layer imports app shell/,
  );
});

test('new project-detail modules require an explicit owner', () => {
  assert.equal(unclassifiedDetail('src/components/ProjectDetailsNewStory.tsx'), true);
  assert.equal(unclassifiedDetail('src/components/ProjectDetailsShell.tsx'), false);
  assert.equal(unclassifiedDetail('src/components/ProjectDetailsKeshi.tsx'), false);
});
