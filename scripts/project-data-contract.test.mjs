// @ts-check
import assert from 'node:assert/strict';
import test from 'node:test';
import { featuredProjects, galleryMediaRevision, projects } from '../src/data/projects.ts';

const PROJECT_ORDER = [
  'modenote',
  'hermes-command-center',
  'freeflow',
  'veluma',
  'keshi-pomodoro',
  'zucchini-review',
  'decrypt-password',
];
const GALLERY_FEATURED = PROJECT_ORDER.slice(0, 5);

test('project ids and display order stay stable', () => {
  const ids = projects.map((project) => project.id);
  assert.deepEqual(ids, PROJECT_ORDER);
  assert.equal(new Set(ids).size, ids.length);
});

test('featured posters resolve to the same ordered project records', () => {
  assert.deepEqual(featuredProjects.map((project) => project.id), GALLERY_FEATURED);
  for (const project of featuredProjects) {
    assert.equal(projects.find((item) => item.id === project.id), project);
    assert.ok(project.coverImage?.startsWith('/assets/'));
  }
  assert.equal(
    galleryMediaRevision,
    JSON.stringify(featuredProjects.map(({ id, title, coverImage }) => [id, title, coverImage])),
  );
});

test('gallery copy stays aligned with media and every media source is a local asset', () => {
  for (const project of projects) {
    assert.ok(project.title && project.description && project.coverImage);
    const gallery = project.gallery || [];
    assert.equal(project.galleryLabels?.length || 0, gallery.length, `${project.id} labels`);
    assert.equal(project.galleryDescriptions?.length || 0, gallery.length, `${project.id} descriptions`);
    for (const media of [project.heroMedia, ...gallery]) {
      if (!media) continue;
      const sources = typeof media === 'string' ? [media] : [media.image, media.video].filter((source) => typeof source === 'string');
      assert.ok(sources.length > 0, `${project.id} empty media record`);
      for (const source of sources) assert.ok(source.startsWith('/assets/'), `${project.id} ${source}`);
    }
  }
});
