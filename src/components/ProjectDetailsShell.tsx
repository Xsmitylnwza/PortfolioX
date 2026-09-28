import { createElement, useEffect, useRef } from 'react';
import { useDocumentRoomReveal } from '../hooks/useDocumentRoomReveal';
import { CaseTop } from './ProjectDetailsPrimitives';
import ScrollPerspectiveWave from './ScrollPerspectiveWave';
import { formatIndex } from './ProjectDetailsFormat';
import type { CaseShellProps } from '../features/project-details/types';

const PROJECT_DECISIONS: Record<string, string> = {
  'hermes-command-center':
    'Discord should own the conversation, not every record. Hermes routes intent and evidence; each connected system keeps authority over its own state.',
  'modenote':
    'Live transcription is useful, but durable capture cannot depend on it. ModeNote separates best-effort PCM transcription from recoverable MediaRecorder chunks, then links supported outputs back to the stopped session and its evidence.',
  'freeflow':
    'Freelance work breaks when talk, files, and money split. FreeFlow is the ops trail — client → quote → project → invoice — with LINE as intake only.',
  'veluma':
    'A Project Canvas should remember its working scene and wait for an intentional Start. Veluma keeps terminals, agents, backdrops, and arrangements together per Project—then lets you return, focus, or reset the scene without rebuilding it.',
  'keshi-pomodoro':
    'Focus and break are mental states, not theme toggles. The Discipline dashboard turns habits and deep-work minutes into a binary pattern mirror (done / not done) with multi-view matrices, evidence, and an agent-friendly API — so the product stays honest about whether you showed up.',
  'zucchini-review':
    'Search and genre shelves bring a film into view. On its title page, a signed-in person sets five independent ratings and one written review; the browser reads those rows back, calculates ordinary category means and their ordinary overall mean, and leaves every later edit or delete to that person.',
  'decrypt-password':
    'Each rule is evaluated live against the current password. Difficulty, countdown, and game-state transitions layer pressure progressively while keeping validation feedback immediate.',
};

const ProjectDetailsShell = ({ project, layout, LayoutBody, isKeshiNext = false, currentIndex, caseTotal }: CaseShellProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  useDocumentRoomReveal(sectionRef, {
    paths: [`/project/${project.id}`],
    mountDelayMs: 90,
  });
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [project.id]);

  const decision = PROJECT_DECISIONS[project.id];
  const hasLive = Boolean(project.link && project.link !== '#');
  const hasRepo = Boolean(project.repo);
  const gallery = Array.isArray(project.gallery) ? project.gallery : [];
  const caseNumber = formatIndex(currentIndex + 1);
  const total = formatIndex(caseTotal);
  const techItems = project.tags || [];
  return (
    <div className="document-room document-room--project">
      <ScrollPerspectiveWave
        as="section"
        id="project-details"
        ref={sectionRef}
        className={`case-section case-section--${layout}${isKeshiNext ? ' case-section--keshi-next' : ''}`}
        aria-labelledby="case-title"
        surfaceOpacity={0}
        intensity={
          layout === 'hermes'
            ? 1.12
            : layout === 'modenote'
            ? 1.15
            : layout === 'freeflow'
            ? 1.08
            : layout === 'mux' || layout === 'zuch'
            ? 1.15
            : layout === 'keshi'
              ? 1.15
              : layout === 'decrypt'
                ? 1.1
                : 0.9
        }
        syncStage
      >
        <div className="case-shell" data-wave-surface>
          <CaseTop caseNumber={caseNumber} caseTotal={total} />
          {createElement(LayoutBody, {
            project,
            decision,
            techItems,
            gallery,
            hasLive,
            hasRepo,
          })}
        </div>
      </ScrollPerspectiveWave>
    </div>
  );
};

export default ProjectDetailsShell;
