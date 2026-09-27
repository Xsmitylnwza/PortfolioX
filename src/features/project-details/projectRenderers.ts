import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import type { CaseEntryProps } from './types';

let missingPromise;
const promises = new Map();
const loaders: Record<string, () => Promise<{ default: ComponentType<CaseEntryProps> }>> = {
  'hermes-command-center': () => import('./cases/hermes/HermesCase'),
  modenote: () => import('./cases/modenote/ModeNoteCase'),
  freeflow: () => import('./cases/freeflow/FreeFlowCase'),
  veluma: () => import('./cases/veluma/VelumaCase'),
  'keshi-pomodoro': () => import('./cases/keshi/KeshiCase'),
  'keshi-pomodoro:next': () => import('./cases/keshi/KeshiNextCase'),
  'zucchini-review': () => import('./cases/zucchini/ZucchiniCase'),
  'decrypt-password': () => import('./cases/decrypt/DecryptCase'),
  fallback: () => import('./FallbackCase'),
};

function loadCase(key: string) {
  const resolved = key in loaders ? key : 'fallback';
  if (!promises.has(resolved)) promises.set(resolved, loaders[resolved]());
  return promises.get(resolved);
}

const caseComponents = Object.fromEntries(
  Object.keys(loaders).map((key) => [key, lazy(() => loadCase(key))]),
) as Record<string, LazyExoticComponent<ComponentType<CaseEntryProps>>>;

const loadMissing = () => {
  missingPromise ??= import('./MissingProject');
  return missingPromise;
};

export const MissingProject = lazy(loadMissing);

export function getProjectCase(id: string, nextPreview = false) {
  const key = nextPreview && id === 'keshi-pomodoro' ? `${id}:next` : id;
  return caseComponents[key] || caseComponents.fallback;
}

export function preloadProjectCase(id: string, nextPreview = false) {
  const key = nextPreview && id === 'keshi-pomodoro' ? `${id}:next` : id;
  return loadCase(key);
}
