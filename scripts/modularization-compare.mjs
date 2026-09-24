#!/usr/bin/env node
// Strict current-tree comparison for modularization browser captures.
// Unlike the historical design comparator, missing routes and targets fail.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED_TARGETS = ['root', 'title', 'top'];
const BOX_TOLERANCE = 0.5;

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function mapUnique(items, keyOf, label, differences) {
  const result = new Map();
  for (const item of items || []) {
    const key = keyOf(item);
    if (!key || result.has(key)) differences.push(`${label}: missing or duplicate key ${String(key)}`);
    else result.set(key, item);
  }
  return result;
}

function compareValue(label, before, after, differences) {
  if (!same(before, after)) differences.push(`${label}: ${JSON.stringify(before)} -> ${JSON.stringify(after)}`);
}

function checkReport(report, side, differences) {
  if (report?.schemaVersion !== 1) differences.push(`${side}: unsupported schemaVersion`);
  if (!Array.isArray(report?.routes) || !Array.isArray(report?.states)) {
    differences.push(`${side}: missing route/state manifest`);
    return new Map();
  }
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
    if (!navigation.has(state.id)) differences.push(`${side}: missing navigation ${state.id}`);
    else if (!navigation.get(state.id).pass) differences.push(`${side}: navigation failed ${state.id}`);
  }
  return captures;
}

export function compareReports(before, after) {
  const differences = [];
  const beforeCaptures = checkReport(before, 'before', differences);
  const afterCaptures = checkReport(after, 'after', differences);
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
        if (!Number.isFinite(first) || !Number.isFinite(second)
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
  const report = compareReports(before, after);
  const outputPath = option('--out');
  if (outputPath) writeFileSync(resolve(outputPath), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`${report.pass ? 'PASS' : 'FAIL'}: ${report.captures} captures, ${report.comparedTargets} targets, ${report.differences.length} differences`);
  for (const difference of report.differences.slice(0, 30)) console.log(`  ${difference}`);
  if (report.differences.length > 30) console.log(`  ... ${report.differences.length - 30} more`);
  if (!report.pass) process.exitCode = 1;
}
