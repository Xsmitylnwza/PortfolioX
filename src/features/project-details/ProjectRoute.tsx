import { Component, Suspense, createElement } from 'react';
import type { ReactNode } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { projects } from '../../data/projects';
import { getProjectCase, MissingProject } from './projectRenderers';

interface BoundaryProps { children: ReactNode }
interface BoundaryState { failed: boolean }

class CaseErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  constructor(props: BoundaryProps) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="document-room document-room--project">
          <section className="case-section case-section--empty" aria-labelledby="case-load-error">
            <div className="case-shell">
              <h1 id="case-load-error">Project could not load</h1>
              <p className="case-lede">Try loading this page again.</p>
              <button className="case-btn case-btn--primary" type="button" onClick={() => window.location.reload()}>
                Reload project
              </button>
            </div>
          </section>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ProjectRoute() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const project = projects.find((item) => item.id === id);
  const nextPreview = id === 'keshi-pomodoro' && searchParams.get('layout') === 'next';
  const content = project
    ? createElement(getProjectCase(project.id, nextPreview), {
        project,
        currentIndex: projects.indexOf(project),
        caseTotal: projects.length,
      })
    : createElement(MissingProject);
  return (
    <CaseErrorBoundary key={`${id ?? 'missing'}:${nextPreview}`}>
      <Suspense fallback={<div className="loading-fallback" role="status" aria-live="polite">Loading project…</div>}>
        {content}
      </Suspense>
    </CaseErrorBoundary>
  );
}
