import assert from 'node:assert/strict';
import test from 'node:test';
import { compareReports } from './modularization-compare.mjs';

function fixture() {
  return {
    schemaVersion: 1,
    routes: [{ id: 'veluma', path: '/project/veluma' }],
    states: [{ id: 'desktop-motion', width: 1440, height: 900 }],
    failures: [],
    navigation: [{ state: 'desktop-motion', reachedProject: true, returnedHome: true, pass: true }],
    captures: [{
      key: 'veluma/desktop-motion',
      route: '/project/veluma',
      state: 'desktop-motion',
      title: 'Veluma',
      textHash: 'same-text',
      headings: [{ tag: 'h1', id: 'case-title', text: 'Veluma' }],
      frames: [],
      waveFollowers: 1,
      waveDirectMedia: 0,
      posterTargets: 0,
      waveCanvases: 1,
      environment: { width: 1440, height: 900, dpr: 1, reducedMotion: false, fonts: 'loaded' },
      interaction: { applicable: false, reason: 'no expandable frame' },
      consoleErrors: [],
      pageErrors: [],
      targets: ['root', 'title', 'top'].map((id) => ({
        id,
        tag: 'div',
        values: { color: 'rgb(255, 255, 255)' },
        box: { width: 100, height: 20 },
      })),
    }],
  };
}

test('identical complete captures pass', () => {
  const before = fixture();
  assert.equal(compareReports(before, structuredClone(before)).pass, true);
});

test('missing route capture fails even when both sides omit it', () => {
  const before = fixture();
  before.captures = [];
  assert.match(compareReports(before, structuredClone(before)).differences.join('\n'), /missing capture/);
});

test('missing target fails', () => {
  const before = fixture();
  const after = structuredClone(before);
  after.captures[0].targets.pop();
  assert.match(compareReports(before, after).differences.join('\n'), /missing required target top/);
});

test('changed computed value fails', () => {
  const before = fixture();
  const after = structuredClone(before);
  after.captures[0].targets[0].values.color = 'rgb(0, 0, 0)';
  assert.match(compareReports(before, after).differences.join('\n'), /root\/styles/);
});

test('a different media frame or broken navigation fails', () => {
  const before = fixture();
  const after = structuredClone(before);
  after.captures[0].frames.push({ tag: 'button' });
  after.navigation[0].pass = false;
  const result = compareReports(before, after);
  assert.equal(result.pass, false);
  assert.match(result.differences.join('\n'), /frames/);
  assert.match(result.differences.join('\n'), /navigation failed/);
});
