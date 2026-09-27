// @ts-check
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import ts from 'typescript';

import { functionBudgetFailure, ownerCap, sizeExceptionFailure } from './quality-growth.mjs';

test('removed giant owner cannot inherit its original line cap', () => {
  assert.equal(ownerCap('src/components/ProjectDetails.tsx'), 500);
  assert.equal(ownerCap('src/components/GalleryScene.tsx'), 875);
});

test('a new oversized function in an existing file fails', () => {
  const rejected = functionBudgetFailure('src/App.tsx', 'function extra() {}', 181);
  assert.ok(rejected);
  assert.match(rejected, /exceeds 180/);
  assert.equal(functionBudgetFailure('src/App.tsx', 'function extra() {}', 180), null);
});

test('only the exact existing legacy function and occurrence are allowed', () => {
  const path = 'src/App.tsx';
  const source = readFileSync(path, 'utf8');
  const tree = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const legacy = tree.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === 'App');
  assert.ok(legacy);
  const lines = tree.getLineAndCharacterOfPosition(legacy.getEnd()).line
    - tree.getLineAndCharacterOfPosition(legacy.getStart(tree)).line + 1;
  assert.equal(functionBudgetFailure(path, legacy.getText(tree), lines), null);
  const duplicate = functionBudgetFailure(path, legacy.getText(tree), lines, 2);
  const changed = functionBudgetFailure(path, legacy.getText(tree) + '\n// changed', lines);
  assert.ok(duplicate);
  assert.ok(changed);
  assert.match(duplicate, /exceeds 180/);
  assert.match(changed, /exceeds 180/);
});

test('authored case stories cannot claim a renderer size exception', () => {
  const result = sizeExceptionFailure({
    path: 'src/components/ProjectDetailsKeshi.tsx',
    owner: 'keshi',
    reason: 'too long',
    reviewTrigger: 'next edit',
  });
  assert.ok(result);
  assert.match(result, /limited to named renderer\/GL owners/);
});
