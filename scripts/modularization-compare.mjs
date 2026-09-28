#!/usr/bin/env node
// Strict current-tree comparison for modularization browser captures.
// Unlike the historical design comparator, missing routes and targets fail.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { maintainedSources } from './quality-graph.mjs';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));

/** @typedef {{id:string,tag?:string,values?:Record<string,string>,box?:Record<string,number>}} CaptureTarget */
/** @typedef {{key:string,route?:string,state?:string,targets?:CaptureTarget[],error?:string,interaction?:{applicable:boolean,pass?:boolean},pageErrors?:string[],[field:string]:unknown}} Capture */
/** @typedef {{state:string,pass:boolean,[field:string]:unknown}} NavigationResult */
/** @typedef {{schemaVersion?:number,sourceTreeHash?:string|null,routes:Array<{id:string,path:string}>,states:Array<{id:string}>,captures?:Capture[],navigation?:NavigationResult[],failures?:string[]}} CaptureReport */
const REQUIRED_TARGETS = ['root', 'title', 'top'];
const BOX_TOLERANCE = 0.5;

/** @param {unknown} left @param {unknown} right */
function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

/** @template T @param {T[] | undefined} items @param {(item:T)=>string|undefined} keyOf @param {string} label @param {string[]} differences @returns {Map<string,T>} */
function mapUnique(items, keyOf, label, differences) {
  const result = new Map();
  for (const item of items || []) {
    const key = keyOf(item);
    if (!key || result.has(key)) differences.push(`${label}: missing or duplicate key ${String(key)}`);
    else result.set(key, item);
  }
  return result;
}

/** @param {string} label @param {unknown} before @param {unknown} after @param {string[]} differences */
function compareValue(label, before, after, differences) {
  if (!same(before, after)) differences.push(`${label}: ${JSON.stringify(before)} -> ${JSON.stringify(after)}`);
}

/** @param {CaptureReport | null} report @param {string} side @param {string[]} differences @returns {Map<string,Capture>} */
function checkReport(report, side, differences) {
  if (report?.schemaVersion !== 1) differences.push(`${side}: unsupported schemaVersion`);
  if (!/^[a-f0-9]{64}$/.test(report?.sourceTreeHash || '')) {
    differences.push(`${side}: missing or invalid source tree hash`);
  }
  if (!Array.isArray(report?.routes) || !Array.isArray(report?.states)) {
    differences.push(`${side}: missing route/state manifest`);
    return new Map();
  }
  if (!report) return new Map();
  if (report.routes.length === 0 || report.states.length === 0) {
    differences.push(`${side}: empty route/state manifest`);
  }
  if (report.failures?.length) differences.push(`${side}: capture failures: ${report.failures.join(' | ')}`);
  const captures = mapUnique(report.captures, (capture) => capture.key, `${side} captures`, differences);
  for (const route of report.routes) {
    for (const state of report.states) {
      const key = `${route.id}/${state.id}`;
      const capture = captures.get(key);
      if (!capture) differences.push(`${side}: missing capture ${key}`);
      else {
        if (capture.route !== route.path || capture.state !== state.id) {
          differences.push(`${side}: capture identity mismatch ${key}`);
        }
        if (capture.error) differences.push(`${side}: ${key} error: ${capture.error}`);
        const targets = mapUnique(capture.targets, (target) => target.id, `${side} ${key} targets`, differences);
        for (const id of REQUIRED_TARGETS) {
          if (!targets.has(id)) differences.push(`${side}: ${key} missing required target ${id}`);
        }
        if (capture.interaction?.applicable && !capture.interaction.pass) {
          differences.push(`${side}: ${key} media interaction failed`);
        }
        if (capture.pageErrors?.length) differences.push(`${side}: ${key} page errors: ${capture.pageErrors.join(' | ')}`);
      }
    }
  }
  const expectedCount = report.routes.length * report.states.length;
  if (captures.size !== expectedCount) differences.push(`${side}: ${captures.size} captures for ${expectedCount} route-states`);
  const navigation = mapUnique(report.navigation, (entry) => entry.state, `${side} navigation`, differences);
  for (const state of report.states) {
    const outcome = navigation.get(state.id);
    if (!outcome) differences.push(`${side}: missing navigation ${state.id}`);
    else if (!outcome.pass) differences.push(`${side}: navigation failed ${state.id}`);
  }
  return captures;
}

/** @param {CaptureReport} before @param {CaptureReport} after @param {string | null} [currentTreeHash] */
export function compareReports(before, after, currentTreeHash = null) {
  /** @type {string[]} */
  const differences = [];
  const beforeCaptures = checkReport(before, 'before', differences);
  const afterCaptures = checkReport(after, 'after', differences);
  if (currentTreeHash && after.sourceTreeHash !== currentTreeHash) {
    differences.push('after: stale source tree hash');
  }
  compareValue('routes', before.routes, after.routes, differences);
  compareValue('states', before.states, after.states, differences);
  const keys = new Set([...beforeCaptures.keys(), ...afterCaptures.keys()]);
  let comparedTargets = 0;

  for (const key of [...keys].sort()) {
    const left = beforeCaptures.get(key);
    const right = afterCaptures.get(key);
    if (!left || !right) continue;
    for (const field of [
      'route', 'state', 'title', 'textHash', 'headings', 'frames', 'waveFollowers',
      'waveDirectMedia', 'posterTargets', 'waveCanvases', 'environment',
      'interaction', 'consoleErrors', 'pageErrors',
    ]) {
      compareValue(`${key}/${field}`, left[field], right[field], differences);
    }
    const leftTargets = mapUnique(left.targets, (target) => target.id, `before ${key} targets`, differences);
    const rightTargets = mapUnique(right.targets, (target) => target.id, `after ${key} targets`, differences);
    compareValue(`${key}/target IDs`, [...leftTargets.keys()].sort(), [...rightTargets.keys()].sort(), differences);
    for (const [id, target] of leftTargets) {
      const next = rightTargets.get(id);
      if (!next) continue;
      comparedTargets += 1;
      compareValue(`${key}/${id}/tag`, target.tag, next.tag, differences);
      compareValue(`${key}/${id}/styles`, target.values, next.values, differences);
      for (const dimension of ['width', 'height']) {
        const first = target.box?.[dimension];
        const second = next.box?.[dimension];
        if (first === undefined || second === undefined || !Number.isFinite(first) || !Number.isFinite(second)
          || Math.abs(first - second) > BOX_TOLERANCE) {
          differences.push(`${key}/${id}/${dimension}: ${first} -> ${second}`);
        }
      }
    }
  }
  compareValue('navigation', before.navigation, after.navigation, differences);
  return {
    pass: differences.length === 0,
    captures: keys.size,
    comparedTargets,
    differences,
  };
}

function currentSourceTreeHash() {
  const hash = (/** @type {string | Buffer} */ value) => createHash('sha256').update(value).digest('hex');
  const files = maintainedSources(ROOT);
  return hash(files.map((path) => `${path}:${hash(readFileSync(resolve(ROOT, path)))}`).join('\n'));
}

/** @param {string} name */
function option(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const beforePath = option('--before');
  const afterPath = option('--after');
  if (!beforePath || !afterPath) {
    console.error('usage: node scripts/modularization-compare.mjs --before <capture.json> --after <capture.json> [--out <report.json>]');
    process.exit(2);
  }
  const before = JSON.parse(readFileSync(resolve(beforePath), 'utf8'));
  const after = JSON.parse(readFileSync(resolve(afterPath), 'utf8'));
  const report = compareReports(before, after, currentSourceTreeHash());
  const outputPath = option('--out');
  if (outputPath) writeFileSync(resolve(outputPath), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`${report.pass ? 'PASS' : 'FAIL'}: ${report.captures} captures, ${report.comparedTargets} targets, ${report.differences.length} differences`);
  for (const difference of report.differences.slice(0, 30)) console.log(`  ${difference}`);
  if (report.differences.length > 30) console.log(`  ... ${report.differences.length - 30} more`);
  if (!report.pass) process.exitCode = 1;
}
