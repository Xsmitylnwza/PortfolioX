// @ts-check
import assert from 'node:assert/strict';
import { statSync } from 'node:fs';
import test from 'node:test';
import { featuredProjects, galleryMediaRevision, projects } from '../src/data/projects.ts';
import { MODENOTE_DEMO_NOTE, MODENOTE_INTERFACE_PROOF, MODENOTE_KIND_LABEL } from '../src/components/ProjectDetailsModeNoteData.ts';

const PROJECT_ORDER = [
  'modenote',
  'hermes-command-center',
  'freeflow',
  'veluma',
  'vibe-studio',
  'keshi-pomodoro',
  'zucchini-review',
  'decrypt-password',
];
const GALLERY_FEATURED = PROJECT_ORDER.slice(0, 6);

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

test('ModeNote positional proofs keep the v2 clips and fictional-demo disclosure', () => {
  const project = projects.find((item) => item.id === 'modenote');
  assert.ok(project, 'ModeNote project record');
  const gallery = project.gallery || [];
  const footage = ['01-live-transcript', '02-live-assist', '03-session-summary', '04-ask-evidence'];
  assert.equal(gallery.length, footage.length, 'one recording proof and three interface proofs');
  assert.deepEqual(MODENOTE_INTERFACE_PROOF.map((entry) => entry.galleryIndex), [1, 2, 3]);
  for (const [index, name] of footage.entries()) {
    const media = gallery[index];
    assert.ok(media && typeof media === 'object', `ModeNote proof ${index} media`);
    assert.equal(media.image, `/assets/modenote/demo-v2/${name}.poster.png`, `ModeNote proof ${index} poster`);
    assert.equal(media.video, `/assets/modenote/demo-v2/${name}.mp4`, `ModeNote proof ${index} video`);
    for (const source of [media.image, media.video]) {
      const file = new URL(`../public${source}`, import.meta.url);
      assert.ok(statSync(file).isFile(), `ModeNote proof ${index} asset file: ${source}`);
    }
    assert.ok(project.galleryLabels?.[index]?.trim(), `ModeNote proof ${index} label`);
    assert.ok(project.galleryDescriptions?.[index]?.trim(), `ModeNote proof ${index} description`);
  }
  assert.match(MODENOTE_KIND_LABEL, /fictional demo/i);
  assert.match(MODENOTE_DEMO_NOTE, /fictional data/i);
  assert.match(MODENOTE_DEMO_NOTE, /edited timing/i);
});
