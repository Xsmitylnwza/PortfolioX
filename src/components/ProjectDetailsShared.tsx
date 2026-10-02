import type { ReactNode } from 'react';
import { Icon } from '@iconify/react';
import CaseMediaFrame from './ProjectDetailsMedia';
import TechStackList from './TechStackList';
import type { ProjectRecord } from '../data/projectTypes';

interface CaseActionsProps {
  hasLive: boolean;
  hasRepo: boolean;
  project: ProjectRecord;
}

interface StackBlockProps {
  items: string[];
  reveal?: 'scroll' | 'mount';
  revealIndex?: number;
  title?: string;
}

const CaseActions = ({ hasLive, hasRepo, project }: CaseActionsProps) => {
  const isLiveUnderMaintenance = project.liveStatus === 'maintenance';
  if (!hasLive && !hasRepo && !isLiveUnderMaintenance) return null;
  const isGitLab = String(project.repo || '').includes('gitlab.com');

  return (
    <div className="case-actions">
      {isLiveUnderMaintenance ? (
        <div className="case-live-status" role="status">
          <span className="case-btn case-btn--disabled" aria-disabled="true">
            <Icon icon="lucide:wrench" aria-hidden="true" />
            Live unavailable
          </span>
          <span className="case-live-status__copy">
            {project.liveNotice || 'Under maintenance — not open for use yet.'}
          </span>
        </div>
      ) : hasLive && (
        <button
          type="button"
          className="case-btn case-btn--disabled"
          disabled
          aria-label="View live unavailable. Project access is private."
          title="Project access is private"
          data-cursor="default"
        >
          <Icon icon="lucide:lock-keyhole" aria-hidden="true" />
          View live <span aria-hidden="true">— Private</span>
        </button>
      )}
      {hasRepo && (
        <button
          type="button"
          className="case-btn case-btn--disabled"
          disabled
          aria-label={`${isGitLab ? 'GitLab' : 'GitHub'} unavailable. Repository access is private.`}
          title="Repository access is private"
          data-cursor="default"
        >
          <Icon icon="lucide:lock-keyhole" aria-hidden="true" />
          {isGitLab ? 'GitLab' : 'GitHub'} <span aria-hidden="true">— Private</span>
        </button>
      )}
    </div>
  );
};

interface CaseSplitHeroProps extends CaseActionsProps {
  alt: string;
  sizes?: string;
  title?: ReactNode;
  lede?: ReactNode;
  note?: ReactNode;
  mediaCaption?: string;
}

/** The one Project Details hero (DESIGN.md A29): copy and meta left, product image right. */
const CaseSplitHero = ({ hasLive, hasRepo, project, alt, sizes = '(max-width: 900px) 100vw, 560px', title, lede, note, mediaCaption }: CaseSplitHeroProps) => (
  <header className="case-split-hero case-reveal" data-reveal="mount" style={{ '--reveal-index': 1 }}>
    <div className="case-split-hero__copy" data-wave-follow>
      <p className="case-kicker">{project.category || 'Selected system'}</p>
      <h1 id="case-title">{title ?? project.title}</h1>
      <p className="case-role">{project.role || 'Software Engineer'}</p>
      <p className="case-lede">{lede ?? project.description}</p>
      {note}
      <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
    </div>
    <div className="case-split-hero__media">
      <CaseMediaFrame
        media={project.heroMedia}
        alt={alt}
        cover={project.heroMedia.kind === 'cover'}
        eager
        sizes={sizes}
        className="case-media__frame--hero"
        transitionTarget
      />
      {mediaCaption && <p className="case-split-hero__caption">{mediaCaption}</p>}
    </div>
  </header>
);

const StackBlock = ({ items, reveal = 'scroll', revealIndex = 0, title = 'Tech Stack' }: StackBlockProps) => {
  if (!items.length) return null;

  return (
    <TechStackList
      className="case-reveal"
      variant="case"
      title={title}
      items={items}
      reveal={reveal}
      revealIndex={revealIndex}
      waveFollow
    />
  );
};

export { CaseActions, CaseSplitHero, StackBlock };
