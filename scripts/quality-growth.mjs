// @ts-check
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { maintainedSources } from './quality-graph.mjs';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const baseline = JSON.parse(readFileSync(resolve(ROOT, 'scripts/quality-size-baseline.json'), 'utf8'));
/** @type {{schemaVersion:number,functions:Array<{path:string,hash:string,lines:number,count:number}>}} */
const functionBaseline = JSON.parse(readFileSync(resolve(ROOT, 'scripts/quality-function-baseline.json'), 'utf8'));
const functionAllowances = new Map(functionBaseline.functions.map((entry) => [`${entry.path}:${entry.hash}`, entry]));
const observedLegacyFunctions = new Map();
const exceptions = JSON.parse(readFileSync(resolve(ROOT, 'scripts/quality-size-exceptions.json'), 'utf8'));
/** @type {Array<{path: string; owner: string; reason: string; reviewTrigger: string}>} */
const typedExceptions = exceptions;
const exceptionByPath = new Map(typedExceptions.map((entry) => [entry.path, entry]));
const cohesiveRuntimeOwners = new Set([
  'src/components/GalleryScene.tsx',
  'src/components/ScrollPerspectiveWave.tsx',
  'src/components/ProjectConstellation.tsx',
]);
const failures = [];
if (exceptionByPath.size !== typedExceptions.length) failures.push('duplicate size exception path');
const ADMISSIBLE = /\.(?:js|jsx|ts|tsx)$/;

/** @param {string} file */
export function ownerCap(file) {
  return baseline.overBudgetAtMigration?.[file] ?? baseline.maxNewModuleLines;
}

/** @param {string} file @param {string} functionText @param {number} lines @param {number} occurrence */
export function functionBudgetFailure(file, functionText, lines, occurrence = 1) {
  if (lines <= baseline.maxNewFunctionLines) return null;
  const hash = createHash('sha256').update(functionText.replace(/\r\n?/g, '\n')).digest('hex');
  const allowed = functionAllowances.get(`${file}:${hash}`);
  if (allowed && lines <= allowed.lines && occurrence <= allowed.count) return null;
  return `${file}: ${lines} line function exceeds ${baseline.maxNewFunctionLines}; split it or register a reviewed exception`;
}

/** @param {{path:string,owner:string,reason:string,reviewTrigger:string}} entry */
export function sizeExceptionFailure(entry) {
  if (!entry.owner || !entry.reason || !entry.reviewTrigger) return `${entry.path}: incomplete size exception`;
  if (!cohesiveRuntimeOwners.has(entry.path)) return `${entry.path}: size exceptions are limited to named renderer/GL owners`;
  return null;
}

/** @param {string} file */
function originalPath(file) {
  if (file in baseline.original) return file;
  const previous = file.replace(/\.tsx$/, '.jsx').replace(/\.ts$/, '.js');
  return previous in baseline.original ? previous : null;
}

for (const file of maintainedSources(ROOT).filter((path) => ADMISSIBLE.test(path))) {
  const source = readFileSync(resolve(ROOT, file), 'utf8');
  const lines = source.split(/\r?\n/).length - (source.endsWith('\n') ? 1 : 0);
  const exception = exceptionByPath.get(file);
  if (exception) {
    const invalid = sizeExceptionFailure(exception);
    if (invalid) failures.push(invalid);
  }
  // Only the four post-migration owners above 500 retain a named cap.
  // An extracted legacy filename cannot inherit its historical 3,278 lines.
  const cap = ownerCap(file);
  if (lines > cap && !exception) failures.push(`${file}: ${lines} lines exceed ${cap} line owner budget`);
  if (!exception) {
    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true,
      file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const occurrences = new Map();
    /** @param {import("typescript").Node} node */
    const inspect = (node) => {
      if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)
        || ts.isArrowFunction(node) || ts.isMethodDeclaration(node)) {
        const from = tree.getLineAndCharacterOfPosition(node.getStart(tree)).line;
        const to = tree.getLineAndCharacterOfPosition(node.getEnd()).line;
        const functionText = node.getText(tree);
        const hash = createHash('sha256').update(functionText.replace(/\r\n?/g, '\n')).digest('hex');
        const occurrence = (occurrences.get(hash) ?? 0) + 1;
        occurrences.set(hash, occurrence);
        if (to - from + 1 > baseline.maxNewFunctionLines) {
          const key = `${file}:${hash}`;
          observedLegacyFunctions.set(key, (observedLegacyFunctions.get(key) ?? 0) + 1);
        }
        const failure = functionBudgetFailure(file, functionText, to - from + 1, occurrence);
        if (failure) failures.push(`${file}:${from + 1}: ${failure}`);
      }
      ts.forEachChild(node, inspect);
    };
    inspect(tree);
  }
}
if (functionBaseline.schemaVersion !== 1 || functionAllowances.size !== functionBaseline.functions.length) {
  failures.push('invalid or duplicated legacy function baseline');
}
for (const [key, entry] of functionAllowances) {
  if ((observedLegacyFunctions.get(key) ?? 0) < entry.count) {
    failures.push(`${entry.path}: stale legacy function allowance; retire it from quality-function-baseline.json`);
  }
}
for (const [file, cap] of Object.entries(baseline.overBudgetAtMigration ?? {})) {
  const previous = originalPath(file);
  if (!maintainedSources(ROOT).includes(file) || !previous || cap <= baseline.maxNewModuleLines
    || cap > baseline.original[previous]) {
    failures.push(file + ': invalid or stale post-migration owner cap');
  }
}
for (const file of exceptionByPath.keys()) {
  if (!maintainedSources(ROOT).includes(file)) failures.push(`${file}: stale size exception`);
}
for (const failure of failures) console.error(`quality growth: ${failure}`);
console.log(`quality growth: ${failures.length} failure(s), ${exceptions.length} named exception(s)`);
if (failures.length) process.exitCode = 1;
