import CaseMediaFrame from './ProjectDetailsMedia';
import type { ReactNode } from 'react';
import type { ProjectMedia, ProjectRecord } from '../data/projectTypes';

interface CaseFactsProps { project: ProjectRecord; techCount: number }
interface CaseBlockProps {
  title: string;
  children: ReactNode;
  reveal?: 'scroll' | 'mount';
  revealIndex?: number;
  className?: string;
}
interface CaseGalleryProps {
  project: ProjectRecord;
  gallery: ProjectMedia[];
  columns?: number;
  labels?: string[];
  descriptions?: string[];
  presentation?: string;
}
interface StorySectionHeadProps {
  eyebrow: string;
  title: string;
  body?: string;
  id?: string;
  className?: string;
}

const CaseFacts = ({ project, techCount }: CaseFactsProps) => (
  <dl className="case-facts">
    <div>
      <dt>Created</dt>
      <dd>{project.year || '—'}</dd>
    </div>
    <div>
      <dt>Role</dt>
      <dd>{project.role || 'Software Engineer'}</dd>
    </div>
    <div>
      <dt>Type</dt>
      <dd>{project.category?.split('•')[0]?.trim() || 'System'}</dd>
    </div>
    <div>
      <dt>Stack size</dt>
      <dd>{techCount ? `${techCount} tools` : '—'}</dd>
    </div>
  </dl>
);

const CaseBlock = ({
  title,
  children,
  reveal = 'scroll',
  revealIndex = 0,
  className = '',
}: CaseBlockProps) => (
  <section
    className={['case-block', 'case-reveal', className].filter(Boolean).join(' ')}
    data-reveal={reveal}
    style={{ '--reveal-index': revealIndex }}
  >
    <h2 className="case-block__title" data-wave-follow>
      {title}
    </h2>
    <div className="case-block__body" data-wave-follow>
      {children}
    </div>
  </section>
);

const CaseHeroMedia = ({ project, sizes = '(max-width: 900px) 100vw, 920px', waveSkip = false }: { project: ProjectRecord; sizes?: string; waveSkip?: boolean }) => (
  <CaseMediaFrame
    media={project.heroMedia}
    cover={project.heroMedia.kind === 'cover'}
    alt={project.title}
    eager
    sizes={sizes}
    className="case-media__frame--hero"
    transitionTarget
    waveSkip={waveSkip}
  />
);

const CaseGallery = ({ project, gallery, columns = 2, labels = [], descriptions = [], presentation = 'grid' }: CaseGalleryProps) => {
  if (!gallery.length) return null;

  if (presentation === 'stacked') {
    return (
      <div className="case-demo-stack">
        {gallery.map((media, index) => {
          const label = labels[index] || `Feature ${index + 1}`;
          const description = descriptions[index];

          return (
            <article className="case-demo-card" key={`${project.id}-media-${index}`}>
              <header className="case-demo-card__copy" data-wave-follow>
                <span className="case-demo-card__index">Feature {String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{label}</h3>
                  {description && <p>{description}</p>}
                </div>
              </header>
              <CaseMediaFrame
                media={media}
                alt={`${project.title} — ${label}`}
                sizes="(max-width: 900px) 100vw, 920px"
                className="case-media__frame--feature-demo"
                label={label}
              />
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={[
        'case-media__grid',
        columns === 3 ? 'case-media__grid--three' : '',
        columns === 1 ? 'case-media__grid--one' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {gallery.map((media, index) => (
        <CaseMediaFrame
          key={`${project.id}-media-${index}`}
          media={media}
          alt={`${project.title} detail ${index + 1}`}
          sizes={
            columns === 1
              ? '(max-width: 900px) 100vw, 920px'
              : '(max-width: 900px) 100vw, 460px'
          }
          label={labels[index]}
        />
      ))}
    </div>
  );
};

const CaseCode = ({ code, reveal = 'scroll', revealIndex = 0 }: { code?: string; reveal?: 'scroll' | 'mount'; revealIndex?: number }) => {
  if (!code) return null;

  return (
    <section
      className="case-code case-reveal"
      data-reveal={reveal}
      style={{ '--reveal-index': revealIndex }}
    >
      <h2 className="case-block__title" data-wave-follow>
        Signal
      </h2>
      <pre className="case-code__pre" data-wave-follow>
        <code>{code}</code>
      </pre>
    </section>
  );
};

const StorySectionHead = ({ eyebrow, title, body, id, className = '' }: StorySectionHeadProps) => (
  <header
    className={['case-story-head', className].filter(Boolean).join(' ')}
    data-wave-follow
  >
    <p>{eyebrow}</p>
    <h2 id={id}>{title}</h2>
    {body ? <span>{body}</span> : null}
  </header>
);

export { CaseFacts, CaseBlock, CaseHeroMedia, CaseGallery, CaseCode, StorySectionHead };
