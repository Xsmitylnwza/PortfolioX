import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { projects } from '../data/projects';
import { useDocumentRoomReveal } from '../hooks/useDocumentRoomReveal';
import ProjectMedia from './ProjectMedia';
import ScrollPerspectiveWave from './ScrollPerspectiveWave';
import TechStackList from './TechStackList';
import './DocumentRoom.css';
import './ProjectDetails.css';

const PROJECT_DECISIONS = {
  'projectmux':
    'An agent workspace should remember its setup and wait for an intentional Start. ProjectMux makes multi-terminal, multi-agent environments first-class: configure Codex, Claude Code, servers, and shells once per project, keep workspaces side-by-side, and never auto-run on open.',
  'keshi-pomodoro':
    'Focus and break are mental states, not theme toggles. The Discipline dashboard turns habits and deep-work minutes into a binary pattern mirror (done / not done) with multi-view matrices, evidence, and an agent-friendly API — so the product stays honest about whether you showed up.',
  'zucchini-review':
    'Search, categories, authentication, profiles, comments, and the weighted review score share one product flow. Each screen exposes the next community action instead of becoming an isolated catalogue page.',
  'decrypt-password':
    'Each rule is evaluated live against the current password. Difficulty, countdown, and game-state transitions layer pressure progressively while keeping validation feedback immediate.',
};

/**
 * Shared visual language, different content choreography per case.
 * cinema  — media leads, atmosphere first (Keshi)
 * feature — product story with stacked demo beats (Zucchini)
 * dossier — interleaved evidence and mechanics (Decrypt)
 */
const PROJECT_LAYOUTS = {
  'projectmux': 'feature',
  'keshi-pomodoro': 'cinema',
  'zucchini-review': 'feature',
  'decrypt-password': 'dossier',
};

const formatIndex = (value) => String(value).padStart(2, '0');

const getMediaExtension = (source) => {
  const value = String(source || '').split('?')[0].split('#')[0].toLowerCase();
  const match = value.match(/\.([a-z0-9]+)$/);
  return match?.[1] || '';
};

const isGifSource = (source) => {
  const ext = getMediaExtension(source);
  return ext === 'gif' || ext === 'apng';
};

const isVideoSource = (source) => {
  const ext = getMediaExtension(source);
  return ext === 'mp4' || ext === 'webm' || ext === 'ogg' || ext === 'mov';
};

const resolveMediaSource = ({ media, image, video } = {}) => {
  let imageSrc = '';
  let videoSrc = '';

  if (media && typeof media === 'object') {
    imageSrc = String(media.image || '');
    videoSrc = String(media.video || '');
  } else if (typeof media === 'string') {
    imageSrc = media;
  } else {
    imageSrc = String(image || '');
    videoSrc = String(video || '');
  }

  // Prefer GIF/APNG for demos so expand uses a real image, not an mp4 path in <img>.
  if (isGifSource(imageSrc)) return imageSrc;
  if (videoSrc) return videoSrc;
  return imageSrc;
};

const getMediaKindMeta = (source) => {
  if (isGifSource(source)) {
    return { kind: 'gif', mark: 'Demo · GIF' };
  }
  if (getMediaExtension(source) === 'webp') {
    return { kind: 'webp', mark: 'Demo · Motion' };
  }
  if (isVideoSource(source)) {
    return { kind: 'video', mark: 'Demo · Film' };
  }
  return null;
};

const easeOutExpo = 'cubic-bezier(0.22, 1, 0.36, 1)';

const CaseMediaLightbox = ({ open, source, alt, kindMeta, originRect, onClose }) => {
  const shellRef = useRef(null);
  const stageRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.classList.add('case-lightbox-open');

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);

    const shell = shellRef.current;
    const stage = stageRef.current;
    let openAnim = null;
    let closeTimer = 0;

    // FLIP open: from thumbnail rect -> centered stage.
    if (shell && stage && originRect?.width > 0 && originRect?.height > 0) {
      const dest = stage.getBoundingClientRect();
      const scaleX = originRect.width / Math.max(dest.width, 1);
      const scaleY = originRect.height / Math.max(dest.height, 1);
      const scale = Math.min(scaleX, scaleY);
      const originCx = originRect.left + originRect.width / 2;
      const originCy = originRect.top + originRect.height / 2;
      const destCx = dest.left + dest.width / 2;
      const destCy = dest.top + dest.height / 2;
      const dx = originCx - destCx;
      const dy = originCy - destCy;

      shell.classList.add('is-open');
      try {
        openAnim = stage.animate(
          [
            {
              transform: `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`,
              borderRadius: '0.95rem',
            },
            {
              transform: 'translate3d(0, 0, 0) scale(1)',
              borderRadius: '1.1rem',
            },
          ],
          {
            duration: 920,
            easing: easeOutExpo,
            fill: 'both',
          },
        );
      } catch {
        // Fall back to CSS class transition only.
      }
    } else if (shell) {
      shell.classList.add('is-open');
    }

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.documentElement.style.overflow = previousOverflow;
      document.documentElement.classList.remove('case-lightbox-open');
      window.clearTimeout(closeTimer);
      try {
        openAnim?.cancel?.();
      } catch {
        /* ignore */
      }
    };
  }, [open, onClose, originRect]);

  if (!open || !source || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={shellRef}
      className="case-lightbox"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div className="case-lightbox__veil" />
      <button
        type="button"
        className="case-lightbox__close"
        onClick={onClose}
        data-cursor="default"
        aria-label="Close fullscreen demo"
      >
        <Icon icon="lucide:x" aria-hidden="true" />
      </button>
      <div
        ref={stageRef}
        className="case-lightbox__stage"
        onClick={(event) => event.stopPropagation()}
      >
        <p id={titleId} className="case-lightbox__title">
          {alt || 'Project demo'}
        </p>
        {kindMeta && (
          <span className="case-lightbox__kind" aria-hidden="true">
            <span className="case-lightbox__kind-dot" />
            {kindMeta.mark}
          </span>
        )}
        {isVideoSource(source) ? (
          <video
            className="case-lightbox__media"
            src={source}
            autoPlay
            muted
            loop
            playsInline
            controls
            aria-label={alt || 'Project demo'}
          />
        ) : (
          <img
            className="case-lightbox__media"
            src={source}
            alt={alt || 'Project demo'}
            draggable={false}
          />
        )}
      </div>
    </div>,
    document.body,
  );
};

const CaseTop = ({ caseNumber, caseTotal }) => (
  <header className="case-top case-reveal" data-reveal="mount" data-wave-follow style={{ '--reveal-index': 0 }}>
    <div className="case-top__meta">
      <span>{caseNumber}</span>
      <span>Selected system</span>
      <span>
        {caseNumber} / {caseTotal}
      </span>
    </div>
    <Link to="/" className="case-top__back" data-cursor="default">
      <Icon icon="lucide:arrow-left" aria-hidden="true" />
      Back to gallery
    </Link>
  </header>
);

const CaseActions = ({ hasLive, hasRepo, project }) => {
  if (!hasLive && !hasRepo) return null;

  return (
    <div className="case-actions">
      {hasLive && (
        <a
          className="case-btn case-btn--primary"
          href={project.link}
          target="_blank"
          rel="noreferrer"
          data-cursor="default"
        >
          <Icon icon="lucide:arrow-up-right" aria-hidden="true" />
          View live
        </a>
      )}
      {hasRepo && (
        <a
          className="case-btn"
          href={project.repo}
          target="_blank"
          rel="noreferrer"
          data-cursor="default"
        >
          <Icon icon="lucide:github" aria-hidden="true" />
          GitHub
        </a>
      )}
    </div>
  );
};

const CaseFacts = ({ project, techCount }) => (
  <dl className="case-facts">
    <div>
      <dt>Year</dt>
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
}) => (
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

const CaseMediaFrame = ({
  image,
  video,
  media,
  alt,
  eager = false,
  sizes,
  className = '',
  label,
  transitionTarget = false,
}) => {
  const frameRef = useRef(null);
  const source = resolveMediaSource({ media, image, video });
  const kindMeta = getMediaKindMeta(source);
  const [lightbox, setLightbox] = useState(null);
  const canExpand = Boolean(source);

  const openLightbox = useCallback(() => {
    if (!canExpand) return;
    const rect = frameRef.current?.getBoundingClientRect?.();
    setLightbox({
      source,
      alt,
      kindMeta,
      originRect: rect
        ? {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          }
        : null,
    });
  }, [alt, canExpand, kindMeta, source]);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
  }, []);

  return (
    <>
      <button
        ref={frameRef}
        type="button"
        className={[
          'case-media__frame',
          kindMeta ? `case-media__frame--${kindMeta.kind}` : '',
          kindMeta ? 'case-media__frame--demo' : '',
          canExpand ? 'case-media__frame--expandable' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-cursor={canExpand ? 'view' : 'default'}
        data-cursor-text={canExpand ? '' : undefined}
        data-wave-follow
        data-media-kind={kindMeta?.kind || undefined}
        data-poster-transition-target={transitionTarget ? '' : undefined}
        onClick={openLightbox}
        aria-label={canExpand ? `Open fullscreen demo: ${alt || 'media'}` : undefined}
      >
        {label && <span className="case-media__label">{label}</span>}
        {kindMeta && (
          <span className="case-media__kind" aria-hidden="true">
            <span className="case-media__kind-dot" />
            {kindMeta.mark}
          </span>
        )}
        <ProjectMedia
          image={image}
          video={video}
          media={media}
          alt={alt}
          eager={eager}
          sizes={sizes}
        />
      </button>

      <CaseMediaLightbox
        open={Boolean(lightbox)}
        source={lightbox?.source}
        alt={lightbox?.alt}
        kindMeta={lightbox?.kindMeta}
        originRect={lightbox?.originRect}
        onClose={closeLightbox}
      />
    </>
  );
};

const CaseHeroMedia = ({ project, sizes = '(max-width: 900px) 100vw, 920px' }) => (
  <CaseMediaFrame
    image={project.image}
    video={project.video}
    alt={project.title}
    eager
    sizes={sizes}
    className="case-media__frame--hero"
    transitionTarget
  />
);

const CaseGallery = ({ project, gallery, columns = 2, labels = [] }) => {
  if (!gallery.length) return null;

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

const CaseCode = ({ code, reveal = 'scroll', revealIndex = 0 }) => {
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

const CaseFoot = ({ nextProject }) => (
  <footer className="case-foot case-reveal" data-reveal="scroll" style={{ '--reveal-index': 2 }}>
    <div className="case-foot__note" data-wave-follow>
      <span>Next system</span>
      {nextProject ? (
        <Link to={`/project/${nextProject.id}`} data-cursor="view" data-cursor-text="NEXT">
          {nextProject.title}
          <Icon icon="lucide:arrow-up-right" aria-hidden="true" />
        </Link>
      ) : (
        <span>Back to gallery</span>
      )}
    </div>
    <div className="case-foot__links" data-wave-follow>
      <Link to="/" data-cursor="default">
        Gallery
      </Link>
      <Link to="/experience" data-cursor="default">
        Experience
      </Link>
      <Link to="/contact" data-cursor="default">
        Contact
      </Link>
    </div>
  </footer>
);

const StackBlock = ({ items, reveal = 'scroll', revealIndex = 0, title = 'Tech Stack' }) => {
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

/* ---------- Layout compositions ---------- */

const CinemaLayout = ({ project, decision, techItems, gallery, hasLive, hasRepo }) => (
  <>
    <div className="case-layout-hero case-layout-hero--cinema case-reveal" data-reveal="mount" style={{ '--reveal-index': 1 }}>
      <div className="case-layout-hero__copy" data-wave-follow>
        <p className="case-kicker">{project.category || 'Selected system'}</p>
        <h1 id="case-title">{project.title}</h1>
        <p className="case-role">{project.role || 'Software Engineer'}</p>
        <p className="case-lede">{project.description}</p>
        <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
      </div>
    </div>

    <section className="case-media case-media--lead case-reveal" data-reveal="mount" style={{ '--reveal-index': 2 }} aria-label="Project media">
      <CaseHeroMedia project={project} />
    </section>

    <div className="case-split case-split--atmosphere case-reveal" data-reveal="scroll" style={{ '--reveal-index': 0 }}>
      <CaseBlock title="Overview" reveal="scroll" revealIndex={0} className="case-block--flush">
        <p>{project.fullDescription || project.description}</p>
      </CaseBlock>
      {decision && (
        <CaseBlock title="Atmosphere" reveal="scroll" revealIndex={1} className="case-block--flush">
          <p>{decision}</p>
        </CaseBlock>
      )}
    </div>

    <StackBlock items={techItems} reveal="scroll" revealIndex={1} title="Sound & surface" />

    {gallery.length > 0 && (
      <section className="case-media case-reveal" data-reveal="scroll" style={{ '--reveal-index': 2 }} aria-label="Focus states">
        <CaseGallery project={project} gallery={gallery} columns={gallery.length >= 3 ? 3 : 2} labels={project.galleryLabels || ['Focus', 'Break', 'Discipline', 'Theme', 'Settings', 'Matrices']} />
      </section>
    )}
  </>
);

const FeatureLayout = ({ project, decision, techItems, gallery, hasLive, hasRepo }) => (
  <>
    <div className="case-feature case-reveal" data-reveal="mount" style={{ '--reveal-index': 1 }}>
      <div className="case-feature__copy" data-wave-follow>
        <p className="case-kicker">{project.category || 'Selected system'}</p>
        <h1 id="case-title">{project.title}</h1>
        <p className="case-role">{project.role || 'Software Engineer'}</p>
        <p className="case-lede">{project.description}</p>
        <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
        <StackBlock items={techItems} reveal="mount" revealIndex={2} title="Product stack" />
      </div>
      <div className="case-feature__media" data-wave-follow>
        <CaseHeroMedia project={project} sizes="(max-width: 900px) 100vw, 560px" />
      </div>
    </div>

    <CaseBlock title="Product flow" reveal="scroll" revealIndex={0}>
      <p>{project.fullDescription || project.description}</p>
      {decision && <p className="case-block__follow">{decision}</p>}
    </CaseBlock>

    {gallery.length > 0 && (
      <section className="case-media case-media--beats case-reveal" data-reveal="scroll" style={{ '--reveal-index': 1 }} aria-label="Feature beats">
        <CaseGallery
          project={project}
          gallery={gallery}
          columns={gallery.length >= 3 ? 3 : 2}
          labels={['Browse', 'Review', 'Community'].slice(0, gallery.length)}
        />
      </section>
    )}
  </>
);

const DossierLayout = ({ project, decision, techItems, gallery, hasLive, hasRepo }) => (
  <>
    <div className="case-dossier-top case-reveal" data-reveal="mount" style={{ '--reveal-index': 1 }}>
      <div className="case-dossier-top__copy" data-wave-follow>
        <p className="case-kicker">{project.category || 'Selected system'}</p>
        <h1 id="case-title">{project.title}</h1>
        <p className="case-role">{project.role || 'Software Engineer'}</p>
        <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
      </div>
      <aside className="case-dossier-top__facts" data-wave-follow>
        <CaseFacts project={project} techCount={techItems.length} />
      </aside>
    </div>

    <section className="case-media case-reveal" data-reveal="mount" style={{ '--reveal-index': 2 }} aria-label="Primary evidence">
      <CaseHeroMedia project={project} />
    </section>

    <div className="case-dossier-row case-reveal" data-reveal="scroll" style={{ '--reveal-index': 0 }}>
      <CaseBlock title="Challenge" reveal="scroll" revealIndex={0} className="case-block--flush">
        <p>{project.description}</p>
      </CaseBlock>
      <StackBlock items={techItems} reveal="scroll" revealIndex={1} title="Rules engine" />
    </div>

    <div className="case-dossier-row case-dossier-row--invert case-reveal" data-reveal="scroll" style={{ '--reveal-index': 1 }}>
      {gallery[0] && (
        <CaseMediaFrame
          media={gallery[0]}
          alt={`${project.title} evidence 1`}
          sizes="(max-width: 900px) 100vw, 520px"
          className="case-media__frame--evidence"
          label="Evidence A"
        />
      )}
      <CaseBlock title="Mechanics" reveal="scroll" revealIndex={1} className="case-block--flush">
        <p>{project.fullDescription || project.description}</p>
        {decision && <p className="case-block__follow">{decision}</p>}
      </CaseBlock>
    </div>

    {gallery.length > 1 && (
      <section className="case-media case-reveal" data-reveal="scroll" style={{ '--reveal-index': 2 }} aria-label="Additional evidence">
        <CaseGallery
          project={project}
          gallery={gallery.slice(1)}
          columns={gallery.length - 1 === 1 ? 1 : 2}
          labels={['Evidence B', 'Evidence C']}
        />
      </section>
    )}

    <CaseCode code={project.code} reveal="scroll" revealIndex={2} />
  </>
);

const LAYOUT_RENDERERS = {
  cinema: CinemaLayout,
  feature: FeatureLayout,
  dossier: DossierLayout,
};

const ProjectDetails = () => {
  const { id } = useParams();
  const sectionRef = useRef(null);
  const project = useMemo(() => projects.find((item) => item.id === id), [id]);
  const currentIndex = useMemo(
    () => projects.findIndex((item) => item.id === id),
    [id],
  );
  const nextProject = currentIndex >= 0
    ? projects[(currentIndex + 1) % projects.length]
    : null;

  useDocumentRoomReveal(sectionRef, {
    paths: project ? [`/project/${project.id}`] : ['/project'],
    mountDelayMs: 90,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [id]);

  if (!project) {
    return (
      <div className="document-room document-room--project">
        <section className="case-section case-section--empty" aria-labelledby="case-missing-title">
          <div className="case-shell">
            <p className="case-kicker">Selected system</p>
            <h1 id="case-missing-title">Project not found</h1>
            <p className="case-lede">This system is not in the gallery.</p>
            <div className="case-actions">
              <Link to="/" className="case-btn case-btn--primary" data-cursor="default">
                Back to gallery
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const decision = PROJECT_DECISIONS[project.id];
  const hasLive = Boolean(project.link && project.link !== '#');
  const hasRepo = Boolean(project.repo);
  const gallery = Array.isArray(project.gallery) ? project.gallery : [];
  const caseNumber = formatIndex(currentIndex + 1);
  const caseTotal = formatIndex(projects.length);
  const techItems = project.tags || [];
  const layout = PROJECT_LAYOUTS[project.id] || 'default';
  const LayoutBody = LAYOUT_RENDERERS[layout] || CinemaLayout;

  return (
    <div className="document-room document-room--project">
      <ScrollPerspectiveWave
        as="section"
        id="project-details"
        ref={sectionRef}
        className={`case-section case-section--${layout}`}
        aria-labelledby="case-title"
        surfaceOpacity={0}
        intensity={0.9}
        syncStage
      >
        <div className="case-shell" data-wave-surface>
          <CaseTop caseNumber={caseNumber} caseTotal={caseTotal} />
          <LayoutBody
            project={project}
            decision={decision}
            techItems={techItems}
            gallery={gallery}
            hasLive={hasLive}
            hasRepo={hasRepo}
          />
          <CaseFoot nextProject={nextProject} />
        </div>
      </ScrollPerspectiveWave>
    </div>
  );
};

export default ProjectDetails;
