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
import './ProjectDetailsStories.css';
import './ProjectDetailsFreeflow.css';
import './ProjectDetailsModeNote.css';
import './ProjectDetailsModeNoteStory.css';

const PROJECT_DECISIONS = {
  'modenote':
    'Live transcription is useful, but durable capture cannot depend on it. ModeNote separates best-effort PCM transcription from recoverable MediaRecorder chunks, then links supported outputs back to the stopped session and its evidence.',
  'freeflow':
    'A client message should not become five disconnected admin tasks. FreeFlow’s shipped path connects LINE OA to one organization-scoped conversation, then lets proposals, projects, invoices, appointments, files, and follow-up move around that shared context.',
  'veluma':
    'A Project Canvas should remember its working scene and wait for an intentional Start. Veluma keeps terminals, agents, backdrops, and arrangements together per Project—then lets you return, focus, or reset the scene without rebuilding it.',
  'keshi-pomodoro':
    'Focus and break are mental states, not theme toggles. The Discipline dashboard turns habits and deep-work minutes into a binary pattern mirror (done / not done) with multi-view matrices, evidence, and an agent-friendly API — so the product stays honest about whether you showed up.',
  'zucchini-review':
    'Search and genre shelves bring a film into view. On its title page, a signed-in person sets five independent ratings and one written review; the browser reads those rows back, calculates ordinary category means and their ordinary overall mean, and leaves every later edit or delete to that person.',
  'decrypt-password':
    'Each rule is evaluated live against the current password. Difficulty, countdown, and game-state transitions layer pressure progressively while keeping validation feedback immediate.',
};

/**
 * Shared visual language, different content choreography per case.
 * keshi   — focus rhythm grows into discipline evidence
 * feature — product story with stacked demo beats (Zucchini)
 * decrypt — escalating pressure chamber and outcome split
 */
const PROJECT_LAYOUTS = {
  'modenote': 'modenote',
  'freeflow': 'freeflow',
  'veluma': 'mux',
  'keshi-pomodoro': 'keshi',
  'zucchini-review': 'zuch',
  'decrypt-password': 'decrypt',
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

const CaseMediaLightbox = ({ open, source, alt, kindMeta, originRect, returnFocusRef, onClose }) => {
  const shellRef = useRef(null);
  const stageRef = useRef(null);
  const closeButtonRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.documentElement.style.overflow;
    const previousFocus = document.activeElement;
    const returnFocusTarget = returnFocusRef?.current || previousFocus;
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.classList.add('case-lightbox-open');

    const shell = shellRef.current;
    const stage = stageRef.current;
    const focusableSelector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'video[controls]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== 'Tab' || !shell) return;

      const focusable = [...shell.querySelectorAll(focusableSelector)]
        .filter((element) => element.getClientRects().length > 0);
      if (focusable.length === 0) {
        event.preventDefault();
        shell.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const focusOutside = !shell.contains(document.activeElement);

      if (event.shiftKey && (document.activeElement === first || focusOutside)) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && (document.activeElement === last || focusOutside)) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', onKeyDown);

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    });
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
      window.cancelAnimationFrame(focusFrame);
      document.documentElement.style.overflow = previousOverflow;
      document.documentElement.classList.remove('case-lightbox-open');
      window.clearTimeout(closeTimer);
      try {
        openAnim?.cancel?.();
      } catch {
        /* ignore */
      }
      if (returnFocusTarget instanceof HTMLElement && returnFocusTarget.isConnected) {
        returnFocusTarget.focus({ preventScroll: true });
      }
    };
  }, [open, onClose, originRect, returnFocusRef]);

  if (!open || !source || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={shellRef}
      className="case-lightbox"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      onClick={onClose}
    >
      <div className="case-lightbox__veil" />
      <button
        ref={closeButtonRef}
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
             tabIndex={0}
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
  const isGitLab = String(project.repo || '').includes('gitlab.com');

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
          <Icon icon={isGitLab ? 'simple-icons:gitlab' : 'lucide:github'} aria-hidden="true" />
          {isGitLab ? 'GitLab' : 'GitHub'}
        </a>
      )}
    </div>
  );
};

const CaseFacts = ({ project, techCount }) => (
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
  kindLabel,
  transitionTarget = false,
  waveSkip = false,
}) => {
  const frameRef = useRef(null);
  const source = resolveMediaSource({ media, image, video });
  const kindMeta = useMemo(
    () => (source && kindLabel
      ? { kind: 'image', mark: kindLabel }
      : getMediaKindMeta(source)),
    [kindLabel, source],
  );
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
          waveSkip={waveSkip}
        />
      </button>

      <CaseMediaLightbox
        open={Boolean(lightbox)}
        source={lightbox?.source}
        alt={lightbox?.alt}
        kindMeta={lightbox?.kindMeta}
        originRect={lightbox?.originRect}
        returnFocusRef={frameRef}
        onClose={closeLightbox}
      />
    </>
  );
};

const CaseHeroMedia = ({ project, sizes = '(max-width: 900px) 100vw, 920px', waveSkip = false }) => (
  <CaseMediaFrame
    image={project.image}
    video={project.video}
    alt={project.title}
    eager
    sizes={sizes}
    className="case-media__frame--hero"
    transitionTarget
    waveSkip={waveSkip}
  />
);

const CaseGallery = ({ project, gallery, columns = 2, labels = [], descriptions = [], presentation = 'grid' }) => {
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

const CaseFlow = ({ steps }) => {
  if (!Array.isArray(steps) || steps.length === 0) return null;

  return (
    <div className="case-process" aria-label="Work process">
      <div className="case-process__rail" aria-hidden="true" />
      <ol className="case-flow case-flow--process">
        {steps.map((step, index) => (
          <li className="case-flow__step" key={`${step.step || index}-${step.title}`}>
            <div className="case-flow__mark" aria-hidden="true">
              <span className="case-flow__dot" />
              {index < steps.length - 1 && <span className="case-flow__connector" />}
            </div>
            <span className="case-flow__index">{step.step || formatIndex(index + 1)}</span>
            <div className="case-flow__copy">
              <strong>{step.title}</strong>
              {step.cue ? <span className="case-flow__cue">{step.cue}</span> : null}
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

const CaseWhy = ({ items }) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="case-why" aria-label="Why this product">
      {items.map((item) => (
        <article className="case-why__card" data-wave-follow key={item.title}>
          <div className="case-zuch-glass-follow">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
};

const MUX_SHIFTS = [
  {
    icon: 'lucide:panels-top-left',
    from: 'Rebuild a terminal scene',
    to: 'Return to a Project Canvas',
  },
  {
    icon: 'lucide:play',
    from: 'Wake tools one by one',
    to: 'Choose one explicit Start',
  },
  {
    icon: 'lucide:layout-panel-top',
    from: 'Leave panes scattered',
    to: 'Reset the scene with Auto Tile',
  },
];

const MUX_PIPELINE = [
  {
    stage: '01 · Return',
    title: 'Project Canvas',
    icon: 'lucide:folder-cog',
    items: ['Terminals', 'Backdrop', 'Pane material', 'Arrangement'],
  },
  {
    stage: '02 · Trigger',
    title: 'Reveal the Dock',
    icon: 'lucide:circle-play',
    items: ['Project switch', 'Ready terminals', 'Explicit Start'],
    focus: true,
  },
  {
    stage: '03 · Work',
    title: 'Terminal scene',
    icon: 'lucide:layout-grid',
    items: ['Agents', 'Dev servers', 'Shells', 'Focused pane'],
    grid: true,
  },
  {
    stage: '04 · Reset',
    title: 'Keep it legible',
    icon: 'lucide:wand-sparkles',
    items: ['Auto Tile', 'Canvas controls', 'Saved on return'],
  },
];

const MUX_CANVAS_SIGNALS = [
  {
    label: 'Project-scoped',
    maker: 'One scene per project',
    icon: 'lucide:folder-kanban',
  },
  {
    label: 'Explicit launch',
    maker: 'Nothing runs on open',
    icon: 'lucide:circle-play',
  },
  {
    label: 'Saved arrangement',
    maker: 'Return without rebuilding',
    icon: 'lucide:layout-template',
  },
  {
    label: 'Canvas controls',
    maker: 'Backdrop, material, Auto Tile',
    icon: 'lucide:sliders-horizontal',
  },
];

const ProjectMuxGlassDefs = () => (
  <svg className="case-mux-glass-defs" aria-hidden="true" focusable="false">
    <defs>
      <filter
        id="mux-liquid-glass-refract"
        x="-15%"
        y="-15%"
        width="130%"
        height="130%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.012 0.018"
          numOctaves="1"
          seed="7"
          stitchTiles="stitch"
          result="mux-glass-noise"
        />
        <feGaussianBlur in="mux-glass-noise" stdDeviation="1.4" result="mux-glass-soft-noise" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="mux-glass-soft-noise"
          scale="7"
          xChannelSelector="R"
          yChannelSelector="B"
        />
      </filter>
    </defs>
  </svg>
);

const ProjectMuxAgentRail = () => (
  <div className="case-mux-agents" data-wave-follow>
    <div className="case-mux-agents__copy">
      <span>Canvas contract</span>
      <strong>The scene is the project context.</strong>
    </div>
    <ul aria-label="Veluma Canvas signals">
      {MUX_CANVAS_SIGNALS.map((signal) => (
        <li key={signal.label}>
          <span className="case-mux-agents__mark" aria-hidden="true">
            <Icon icon={signal.icon} />
          </span>
          <span className="case-mux-agents__name">
            <strong>{signal.label}</strong>
            <small>{signal.maker}</small>
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const ProjectMuxShiftDiagram = () => (
  <section
    className="case-mux-shifts case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 0 }}
    aria-labelledby="mux-shifts-title"
  >
    <header className="case-mux-section-head" data-wave-follow>
      <p className="case-mux-section-head__eyebrow">The shift</p>
      <h2 id="mux-shifts-title">A terminal workspace that returns as one scene.</h2>
    </header>
    <div className="case-mux-shifts__grid">
      {MUX_SHIFTS.map((item, index) => (
        <article className="case-mux-shift" data-wave-follow key={item.to}>
          <span className="case-mux-shift__index">{formatIndex(index + 1)}</span>
          <Icon className="case-mux-shift__icon" icon={item.icon} aria-hidden="true" />
          <div className="case-mux-shift__copy">
            <span>{item.from}</span>
            <Icon icon="lucide:arrow-right" aria-hidden="true" />
            <strong>{item.to}</strong>
          </div>
        </article>
      ))}
    </div>
  </section>
);

const ProjectMuxPipeline = () => (
  <section
    className="case-mux-system case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 1 }}
    aria-labelledby="mux-system-title"
  >
    <header className="case-mux-section-head" data-wave-follow>
      <p className="case-mux-section-head__eyebrow">The working loop</p>
      <h2 id="mux-system-title">Return → reveal → start → shape the Canvas.</h2>
    </header>
    <ProjectMuxAgentRail />
    <ol className="case-mux-pipeline">
      {MUX_PIPELINE.map((node) => (
        <li
          className={[
            'case-mux-pipeline__node',
            node.focus ? 'case-mux-pipeline__node--focus' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          data-wave-follow
          key={node.stage}
        >
          <span className="case-mux-pipeline__stage">{node.stage}</span>
          <span className="case-mux-pipeline__icon" aria-hidden="true">
            <Icon icon={node.icon} />
          </span>
          <h3>{node.title}</h3>
          <ul className={node.grid ? 'case-mux-pipeline__items case-mux-pipeline__items--grid' : 'case-mux-pipeline__items'}>
            {node.items.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </li>
      ))}
    </ol>
    <div className="case-mux-system__loop" data-wave-follow>
      <Icon icon="lucide:refresh-cw" aria-hidden="true" />
      <span>Leave a Project</span>
      <span className="case-mux-system__loop-line" aria-hidden="true" />
      <strong>Return to the same Canvas</strong>
    </div>
  </section>
);

const ProjectMuxEvidence = ({ project, gallery }) => {
  const items = gallery.slice(1).map((media, index) => ({
    media,
    label: project.galleryLabels?.[index + 1] || `Feature ${index + 1}`,
    description: project.galleryDescriptions?.[index + 1],
  }));

  if (items.length === 0) return null;

  return (
    <section
      className="case-mux-evidence case-reveal"
      data-reveal="scroll"
      style={{ '--reveal-index': 2 }}
      aria-labelledby="mux-evidence-title"
    >
      <header className="case-mux-section-head" data-wave-follow>
        <p className="case-mux-section-head__eyebrow">Interface proof</p>
        <h2 id="mux-evidence-title">Four recorded moments, one calm workspace.</h2>
      </header>
      <div className="case-mux-evidence__grid">
        {items.map((item, index) => (
          <article
            className={[
              'case-mux-evidence__card',
              index === 0 ? 'case-mux-evidence__card--lead' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            key={item.label}
          >
            <CaseMediaFrame
              media={item.media}
              alt={`${project.title} — ${item.label}`}
              sizes={index === 0
                ? '(max-width: 900px) 100vw, 700px'
                : '(max-width: 900px) 100vw, 400px'}
              className="case-media__frame--mux-evidence"
              label={item.label}
            />
            <div className="case-mux-evidence__copy" data-wave-follow>
              <span>Feature {formatIndex(index + 1)}</span>
              <h3>{item.label}</h3>
              {item.description && <p>{item.description}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const MuxLayout = ({ project, techItems, gallery, hasLive, hasRepo }) => {
  const demoMedia = gallery[0];
  const demoLabel = project.galleryLabels?.[0] || 'Live session';
  const demoDescription = project.galleryDescriptions?.[0];

  return (
    <>
      <ProjectMuxGlassDefs />

      <div className="case-mux-hero case-reveal" data-reveal="mount" style={{ '--reveal-index': 1 }}>
        <div className="case-mux-hero__copy" data-wave-follow>
          <p className="case-kicker">{project.category || 'Selected system'}</p>
          <h1 id="case-title">{project.title}</h1>
          <p className="case-role">{project.role || 'Software Engineer'}</p>
          <p className="case-lede">{project.description}</p>
          <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
        </div>
        <div className="case-mux-hero__media">
          <CaseMediaFrame
            image={project.heroImage || project.image}
            alt={`${project.title} Project Canvas`}
            eager
            sizes="(max-width: 900px) 100vw, 560px"
            className="case-media__frame--hero"
          />
        </div>
      </div>

      <ProjectMuxShiftDiagram />

      {demoMedia && (
        <section
          className="case-mux-proof case-reveal"
          data-reveal="scroll"
          style={{ '--reveal-index': 0 }}
          aria-labelledby="mux-proof-title"
        >
          <header className="case-mux-proof__copy" data-wave-follow>
            <p className="case-mux-section-head__eyebrow">Proof 01 · Return to context</p>
            <h2 id="mux-proof-title">{demoLabel}</h2>
            {demoDescription && <p>{demoDescription}</p>}
            <ul aria-label="Demo signals">
              <li>Project-scoped scene</li>
              <li>Dock reveals on demand</li>
              <li>Canvas stays intact</li>
            </ul>
          </header>
          <CaseMediaFrame
            media={demoMedia}
            alt={`${project.title} — ${demoLabel}`}
            sizes="(max-width: 900px) 100vw, 760px"
            className="case-media__frame--mux-proof"
            label={demoLabel}
          />
        </section>
      )}

      <ProjectMuxPipeline />
      <ProjectMuxEvidence project={project} gallery={gallery} />
      <StackBlock items={techItems} reveal="scroll" revealIndex={1} title="Built with" />
    </>
  );
};

const FeatureLayout = ({ project, decision, techItems, gallery, hasLive, hasRepo }) => {
  const demoIndex = gallery.findIndex((item) => {
    const source = typeof item === 'string' ? item : item?.image || item?.video || '';
    return isGifSource(source) || isVideoSource(source);
  });
  const demoMedia = demoIndex >= 0 ? gallery[demoIndex] : null;
  const stillGallery = gallery.filter((_, index) => index !== demoIndex);
  const galleryLabels = project.galleryLabels || ['Browse', 'Review', 'Community'];
  const galleryDescriptions = project.galleryDescriptions || [];
  const demoLabel = galleryLabels[demoIndex] || 'Live session';
  const demoDescription = galleryDescriptions[demoIndex];
  const stillLabels = galleryLabels.filter((_, index) => index !== demoIndex);
  const stillDescriptions = galleryDescriptions.filter((_, index) => index !== demoIndex);

  return (
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

      {demoMedia && (
        <section className="case-media case-media--demo case-reveal" data-reveal="scroll" style={{ '--reveal-index': 0 }} aria-label="Live session">
          {demoDescription && (
            <header className="case-demo-intro" data-wave-follow>
              <p className="case-demo-intro__eyebrow">Recorded in the real desktop app</p>
              <h2>{demoLabel}</h2>
              <p>{demoDescription}</p>
            </header>
          )}
          <CaseMediaFrame
            media={demoMedia}
            alt={`${project.title} usage demo`}
            sizes="(max-width: 900px) 100vw, 920px"
            className="case-media__frame--hero case-media__frame--demo-lead"
            label={demoLabel}
          />
        </section>
      )}

      <CaseBlock title="Why it exists" reveal="scroll" revealIndex={0}>
        <p>{project.fullDescription || project.description}</p>
        {decision && <p className="case-block__follow">{decision}</p>}
        <CaseWhy items={project.why} />
      </CaseBlock>

      {Array.isArray(project.flow) && project.flow.length > 0 && (
        <CaseBlock title="Work process" reveal="scroll" revealIndex={1}>
          <p className="case-process__lede">
            Configure once. Start once. Many agents stay visible — and finished work pulls attention.
          </p>
          <CaseFlow steps={project.flow} />
        </CaseBlock>
      )}

      {stillGallery.length > 0 && (
        <section className="case-media case-media--beats case-reveal" data-reveal="scroll" style={{ '--reveal-index': 2 }} aria-label="Feature beats">
          <CaseGallery
            project={project}
            gallery={stillGallery}
            columns={project.demoPresentation === 'stacked' ? 1 : stillGallery.length >= 3 ? 3 : 2}
            labels={stillLabels}
            descriptions={stillDescriptions}
            presentation={project.demoPresentation}
          />
        </section>
      )}
    </>
  );
};

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


const StorySectionHead = ({ eyebrow, title, body, id, className = '' }) => (
  <header
    className={['case-story-head', className].filter(Boolean).join(' ')}
    data-wave-follow
  >
    <p>{eyebrow}</p>
    <h2 id={id}>{title}</h2>
    {body ? <span>{body}</span> : null}
  </header>
);

const KESHI_STATES = [
  {
    mode: 'Focus',
    cue: 'Deep red',
    time: '25:00',
    body: 'Name one task, then protect a default 25-minute sprint.',
    image: '/assets/keshi-pomodoro/focus_mode.png',
    tone: 'focus',
  },
  {
    mode: 'Relax',
    cue: 'Recovery green',
    time: '05:00',
    body: 'Completion changes the room and opens a default 5-minute break.',
    image: '/assets/keshi-pomodoro/relax_mode.png',
    tone: 'relax',
  },
];

// Hermes is represented by the caduceus — the messenger's winged staff —
// instead of a generic bot glyph so the agent is recognizable at a glance.
const HERMES_AGENT_ICON = 'hugeicons:caduceus';

const KESHI_FEEDBACK_NODES = {
  session: {
    step: '01',
    eyebrow: 'Act',
    title: 'Session N',
    body: 'Focus / Relax captures the task, timing, pauses, and completion.',
    icon: 'lucide:timer-reset',
    tags: ['task', 'minutes', 'events'],
    tone: 'focus',
  },
  truth: {
    step: '02',
    eyebrow: 'Record',
    title: 'Shared truth',
    body: 'The Node API keeps per-user sessions, habits, scores, and evidence.',
    icon: 'lucide:database',
    tags: ['REST', 'SQLite', 'JSON'],
    tone: 'evidence',
  },
  mirror: {
    step: '04',
    eyebrow: 'Reflect',
    title: 'Pattern mirror',
    body: 'Consistency, recovery load, and soft habits become a quiet signal.',
    icon: 'lucide:chart-no-axes-combined',
    tags: ['7D / 30D', 'load', 'habits'],
    tone: 'discipline',
  },
  next: {
    step: '05',
    eyebrow: 'Adapt',
    title: 'Session N+1',
    body: 'You choose the next task, duration, or recovery rhythm with context.',
    icon: 'lucide:refresh-cw',
    tags: ['human decides', 'task', 'settings'],
    tone: 'relax',
  },
};

const KeshiState = ({ state }) => (
  <article className={`case-keshi-state case-keshi-state--${state.tone}`}>
    <CaseMediaFrame
      image={state.image}
      alt={`Keshi Pomodoro ${state.mode} mode`}
      sizes="(max-width: 900px) 100vw, 540px"
      className="case-media__frame--keshi-state"
      label={`${state.mode} mode`}
    />
    <div className="case-keshi-state__caption" data-wave-follow>
      <span>{state.cue}</span>
      <strong>{state.time}</strong>
      <p>{state.body}</p>
    </div>
  </article>
);

const KeshiStatePair = () => (
  <section
    className="case-keshi-states case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 0 }}
    aria-labelledby="keshi-states-title"
  >
    <StorySectionHead
      eyebrow="Two mental states"
      title="The room changes when the work does."
      body="Focus and Relax are a rhythm, not two cosmetic themes."
      id="keshi-states-title"
    />
    <div className="case-keshi-states__stage">
      <KeshiState state={KESHI_STATES[0]} />
      <div className="case-keshi-states__switch" data-wave-follow aria-label="Completing focus switches to relax">
        <span>complete</span>
        <Icon icon="lucide:arrow-right" aria-hidden="true" />
        <small>mode switches</small>
      </div>
      <KeshiState state={KESHI_STATES[1]} />
    </div>
  </section>
);

const KeshiAtmosphere = ({ project, gallery }) => {
  const themeMedia = gallery[0];
  const settingsMedia = gallery[1];

  if (!themeMedia && !settingsMedia) return null;

  return (
    <section
      className="case-keshi-atmosphere case-reveal"
      data-reveal="scroll"
      style={{ '--reveal-index': 1 }}
      aria-labelledby="keshi-atmosphere-title"
    >
      <StorySectionHead
        eyebrow="Shape the room"
        title="Atmosphere supports the interval."
        body="Tune the surface around Focus and Relax without breaking the timer loop."
        id="keshi-atmosphere-title"
      />
      <div className="case-keshi-atmosphere__grid">
        {themeMedia ? (
          <article className="case-keshi-atmosphere__feature case-keshi-atmosphere__feature--theme">
            <CaseMediaFrame
              media={themeMedia}
              alt={`${project.title} theme studio`}
              sizes="(max-width: 900px) 100vw, 720px"
              className="case-media__frame--keshi-atmosphere"
              label={project.galleryLabels?.[0] || 'Theme studio'}
            />
            <div className="case-keshi-atmosphere__caption" data-wave-follow>
              <Icon icon="lucide:palette" aria-hidden="true" />
              <div>
                <span>Theme studio</span>
                <p>{project.galleryDescriptions?.[0]}</p>
              </div>
            </div>
          </article>
        ) : null}
        {settingsMedia ? (
          <article className="case-keshi-atmosphere__feature case-keshi-atmosphere__feature--settings">
            <div className="case-keshi-atmosphere__caption" data-wave-follow>
              <Icon icon="lucide:sliders-horizontal" aria-hidden="true" />
              <div>
                <span>Session controls</span>
                <p>{project.galleryDescriptions?.[1]}</p>
              </div>
            </div>
            <CaseMediaFrame
              media={settingsMedia}
              alt={`${project.title} settings`}
              sizes="(max-width: 900px) 100vw, 430px"
              className="case-media__frame--keshi-atmosphere"
              label={project.galleryLabels?.[1] || 'Settings'}
            />
          </article>
        ) : null}
      </div>
    </section>
  );
};

const KeshiFeedbackNode = ({ node, position }) => (
  <div
    className={`case-keshi-rhythm__slot case-keshi-rhythm__slot--${position}`}
    data-wave-follow
  >
    <article className={`case-keshi-rhythm__node case-keshi-rhythm__node--${node.tone}`}>
      <header>
        <span>{node.step} / {node.eyebrow}</span>
        <span className="case-keshi-rhythm__icon" aria-hidden="true">
          <Icon icon={node.icon} />
        </span>
      </header>
      <h3>{node.title}</h3>
      <p>{node.body}</p>
      <ul aria-label={`${node.title} signals`}>
        {node.tags.map((tag) => <li key={tag}>{tag}</li>)}
      </ul>
    </article>
  </div>
);

const KeshiRhythmDiagram = () => (
  <section
    className="case-keshi-rhythm case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 0 }}
    aria-labelledby="keshi-rhythm-title"
  >
    <StorySectionHead
      eyebrow="Hermes behavior loop"
      title="What happened becomes the next honest session."
      body="Keshi tracks the session. Hermes reads the shared evidence, interprets the pattern, and returns a quiet cue; you decide what changes next."
      id="keshi-rhythm-title"
    />

    <div
      className="case-keshi-rhythm__loop"
      aria-label="Feedback loop from a Keshi focus session to shared evidence, through Hermes interpretation, into a pattern mirror and a human-chosen next session"
    >
      <div className="case-keshi-rhythm__connections" data-wave-follow aria-hidden="true">
        <svg viewBox="0 0 1200 760" preserveAspectRatio="none">
          <defs>
            <marker id="keshi-flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>
          <g className="case-keshi-rhythm__flow-base">
            <path d="M 185 225 L 185 535" />
            <path d="M 345 610 C 430 610 430 460 485 420" />
            <path d="M 715 335 C 790 285 795 145 855 145" />
            <path d="M 1015 225 L 1015 535" />
            <path d="M 855 640 C 725 720 455 720 335 645 C 175 545 70 430 95 315 C 105 270 135 240 185 225" />
          </g>
          <g className="case-keshi-rhythm__flow-signal">
            <path className="is-capture" pathLength="100" d="M 185 225 L 185 535" />
            <path className="is-pull" pathLength="100" d="M 345 610 C 430 610 430 460 485 420" />
            <path className="is-return" pathLength="100" d="M 715 335 C 790 285 795 145 855 145" />
            <path className="is-shape" pathLength="100" d="M 1015 225 L 1015 535" />
            <path className="is-loop" pathLength="100" d="M 855 640 C 725 720 455 720 335 645 C 175 545 70 430 95 315 C 105 270 135 240 185 225" />
          </g>
        </svg>
        <span className="case-keshi-rhythm__flow-label case-keshi-rhythm__flow-label--capture">capture</span>
        <span className="case-keshi-rhythm__flow-label case-keshi-rhythm__flow-label--pull">pull latest review</span>
        <span className="case-keshi-rhythm__flow-label case-keshi-rhythm__flow-label--return">return quiet signal</span>
        <span className="case-keshi-rhythm__flow-label case-keshi-rhythm__flow-label--shape">shape next session</span>
        <span className="case-keshi-rhythm__flow-label case-keshi-rhythm__flow-label--loop">behavior changes through the next choice</span>
      </div>

      <KeshiFeedbackNode node={KESHI_FEEDBACK_NODES.session} position="session" />
      <KeshiFeedbackNode node={KESHI_FEEDBACK_NODES.truth} position="truth" />

      <div className="case-keshi-rhythm__slot case-keshi-rhythm__slot--hermes" data-wave-follow>
        <article className="case-keshi-rhythm__hermes">
          <header className="case-keshi-rhythm__hermes-head">
            <span className="case-keshi-rhythm__hermes-icon" aria-hidden="true">
              <Icon icon={HERMES_AGENT_ICON} />
            </span>
            <div>
              <span>03 / Hermes Agent</span>
              <strong>Scoped feedback bridge</strong>
            </div>
            <span className="case-keshi-rhythm__hermes-status"><i /> live loop</span>
          </header>
          <h3>
            <span>Pull → interpret</span>
            <span>Return → adapt</span>
          </h3>
          <p>
            Reads the latest day through the agent gateway, safely fills missing evidence,
            then turns the pattern into context for the next session.
          </p>
          <ol className="case-keshi-rhythm__hermes-steps">
            <li>
              <span>GET</span>
              <div><strong>Latest daily review</strong><small>sessions · habits · logs</small></div>
            </li>
            <li>
              <span>READ</span>
              <div><strong>Pattern + load</strong><small>consistency · recovery · gaps</small></div>
            </li>
            <li>
              <span>SEND</span>
              <div><strong>Next-session cue</strong><small>human confirms the change</small></div>
            </li>
          </ol>
          <footer>
            <span>agent key</span>
            <span>per-user</span>
            <span>idempotent writes</span>
          </footer>
        </article>
      </div>

      <KeshiFeedbackNode node={KESHI_FEEDBACK_NODES.mirror} position="mirror" />
      <KeshiFeedbackNode node={KESHI_FEEDBACK_NODES.next} position="next" />
    </div>

    <div className="case-keshi-rhythm__control-note" data-wave-follow>
      <span><Icon icon="lucide:user-round-check" aria-hidden="true" /> Human in the loop</span>
      <strong>Hermes informs the next choice; it never silently takes over the timer.</strong>
    </div>
  </section>
);

const KeshiDisciplineProof = ({ project, gallery }) => {
  const disciplineMedia = gallery[2];
  if (!disciplineMedia) return null;

  return (
    <section
      className="case-keshi-proof case-reveal"
      data-reveal="scroll"
      style={{ '--reveal-index': 1 }}
      aria-labelledby="keshi-proof-title"
    >
      <StorySectionHead
        eyebrow="Pattern mirror, not coach"
        title="Done or not done — never a vibes score."
        body="A selected day opens the evidence behind the mark."
        id="keshi-proof-title"
      />
      <div className="case-keshi-proof__media">
        <CaseMediaFrame
          image={disciplineMedia.image || disciplineMedia}
          alt={`${project.title} Discipline dashboard`}
          sizes="(max-width: 900px) 100vw, 1050px"
          className="case-media__frame--keshi-proof"
          label="Actual application capture"
          kindLabel="Product · Still"
        />
        <aside className="case-keshi-proof__caption" data-wave-follow>
          <span>Captured from the Keshi application</span>
          <ul>
            <li>habit checks</li>
            <li>focus sessions</li>
            <li>tasks + activity</li>
          </ul>
        </aside>
      </div>
      <dl className="case-keshi-pattern__facts case-keshi-pattern__facts--wide">
        <div data-wave-follow>
          <dt>Habit value</dt>
          <dd><strong>0 / 1</strong><span>not done / done</span></dd>
        </div>
        <div data-wave-follow>
          <dt>Day total</dt>
          <dd><strong>done ÷ active</strong><span>habits completed</span></dd>
        </div>
        <div data-wave-follow>
          <dt>Reading range</dt>
          <dd><strong>7D / 30D</strong><span>same underlying truth</span></dd>
        </div>
      </dl>
    </section>
  );
};

const KeshiArchitecture = ({ techItems }) => (
  <section
    className="case-keshi-architecture case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 2 }}
    aria-labelledby="keshi-architecture-title"
  >
    <StorySectionHead
      eyebrow="One shared truth"
      title="Two actors. One source of truth."
      body="The browser records sessions; Hermes reads or updates through the scoped gateway. Per-user storage and idempotency keep every pass honest."
      id="keshi-architecture-title"
    />
    <div className="case-keshi-architecture__rail">
      <div className="case-keshi-architecture__inputs">
        <article className="case-keshi-architecture__node case-keshi-architecture__node--browser" data-wave-follow>
          <Icon icon="lucide:monitor-dot" aria-hidden="true" />
          <span>Human path</span>
          <h3>React timer</h3>
          <p>Focus · tasks · history</p>
        </article>
        <article className="case-keshi-architecture__node case-keshi-architecture__node--hermes" data-wave-follow>
          <Icon icon={HERMES_AGENT_ICON} aria-hidden="true" />
          <span>Hermes Agent</span>
          <h3>Scoped read + write</h3>
          <p>review · reconcile · signal</p>
        </article>
      </div>
      <div className="case-keshi-architecture__link" data-wave-follow aria-hidden="true">
        <span>same contract</span>
        <Icon icon="lucide:arrow-right" />
      </div>
      <article className="case-keshi-architecture__node case-keshi-architecture__node--api" data-wave-follow>
        <Icon icon="lucide:route" aria-hidden="true" />
        <span>Node API</span>
        <h3>One write path</h3>
        <p>Per-user · idempotent</p>
      </article>
      <div className="case-keshi-architecture__link" data-wave-follow aria-hidden="true">
        <span>persist</span>
        <Icon icon="lucide:arrow-right" />
      </div>
      <div className="case-keshi-architecture__stores">
        <article className="case-keshi-architecture__node" data-wave-follow>
          <Icon icon="lucide:database" aria-hidden="true" />
          <span>SQLite</span>
          <h3>Discipline</h3>
          <p>habits · scores · logs</p>
        </article>
        <article className="case-keshi-architecture__node" data-wave-follow>
          <Icon icon="lucide:braces" aria-hidden="true" />
          <span>JSON stores</span>
          <h3>Timer state</h3>
          <p>tasks · sessions · history</p>
        </article>
      </div>
    </div>
    <StackBlock items={techItems} reveal="scroll" revealIndex={2} title="Built as one system" />
  </section>
);

const KeshiLayout = ({ project, techItems, gallery, hasLive, hasRepo }) => (
  <>
    <header
      className="case-keshi-hero case-reveal"
      data-reveal="mount"
      style={{ '--reveal-index': 1 }}
    >
      <div className="case-keshi-hero__copy" data-wave-follow>
        <p className="case-kicker">{project.category || 'Selected system'}</p>
        <h1 id="case-title">{project.title}</h1>
        <p className="case-keshi-hero__thesis">Focus that leaves evidence.</p>
        <p className="case-lede">
          A lo-fi Focus / Relax timer that grows into a quiet Discipline pattern mirror — not a coach or guilt machine.
        </p>
        <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
      </div>
      <div className="case-keshi-hero__visual">
        <CaseHeroMedia project={project} sizes="(max-width: 900px) 100vw, 700px" />
        <div className="case-keshi-hero__caption" data-wave-follow>
          <span><i className="is-focus" />Focus</span>
          <Icon icon="lucide:arrow-right" aria-hidden="true" />
          <span><i className="is-relax" />Relax</span>
          <Icon icon="lucide:arrow-right" aria-hidden="true" />
          <strong>Evidence</strong>
        </div>
      </div>
    </header>

    <KeshiStatePair />
    <KeshiAtmosphere project={project} gallery={gallery} />
    <KeshiRhythmDiagram />
    <KeshiDisciplineProof project={project} gallery={gallery} />
    <KeshiArchitecture techItems={techItems} />
  </>
);

const DECRYPT_MODES = [
  {
    level: 'Hard',
    character: 'SPY',
    rules: 10,
    time: '10:00',
    tone: 'spy',
  },
  {
    level: 'Veryhard',
    character: 'FBI',
    rules: 11,
    time: '07:30',
    tone: 'fbi',
  },
  {
    level: 'Hardest',
    character: 'HACKER',
    rules: 12,
    time: '05:00',
    tone: 'hacker',
  },
];

const DECRYPT_RULE_STACK = [
  { id: '01', label: 'Three consecutive digits', state: 'passed' },
  { id: '02', label: 'At least five characters', state: 'passed' },
  { id: '03', label: 'One of ! @ # $ %', state: 'active' },
  { id: '04', label: 'Digit sum equals 35', state: 'waiting' },
];

const DecryptHero = ({ project, hasLive, hasRepo }) => (
  <header
    className="case-decrypt-hero case-reveal"
    data-reveal="mount"
    style={{ '--reveal-index': 1 }}
  >
    <div className="case-decrypt-hero__copy" data-wave-follow>
      <p className="case-kicker">{project.category || 'Selected system'}</p>
      <h1 id="case-title">{project.title}</h1>
      <p className="case-decrypt-hero__thesis">One password. Every edit under pressure.</p>
      <p className="case-lede">
        A Vue browser game where the first typed character starts the clock, every edit rechecks the live rules,
        and the hardest run mutates the string you are trying to protect.
      </p>
      <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
    </div>
    <div className="case-decrypt-hero__visual">
      <CaseHeroMedia project={project} sizes="(max-width: 900px) 100vw, 760px" />
      <div className="case-decrypt-hero__caption" data-wave-follow>
        <span>Actual Hardest run</span>
        <strong>11 rules correct · crown still live</strong>
      </div>
    </div>
    <dl className="case-decrypt-signals">
      <div data-wave-follow>
        <dt>Levels</dt>
        <dd><strong>3</strong><span>Hard · Veryhard · Hardest</span></dd>
      </div>
      <div data-wave-follow>
        <dt>Rule budget</dt>
        <dd><strong>10 / 11 / 12</strong><span>unlock in sequence</span></dd>
      </div>
      <div data-wave-follow>
        <dt>Time budget</dt>
        <dd><strong>10:00 → 05:00</strong><span>starts on first input</span></dd>
      </div>
    </dl>
  </header>
);

const DecryptModeRail = ({ project, media }) => (
  <section
    className="case-decrypt-modes case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 0 }}
    aria-labelledby="decrypt-modes-title"
  >
    <StorySectionHead
      eyebrow="Choose the pressure"
      title="Each level trades more rules for less time."
      body="The role artwork changes with the selected level, but the timer still waits for the first input."
      id="decrypt-modes-title"
    />
    <div className="case-decrypt-modes__stage">
      {media ? (
        <CaseMediaFrame
          media={media}
          alt={`${project.title} mode selection`}
          sizes="(max-width: 900px) 100vw, 650px"
          className="case-media__frame--decrypt-modes"
          label="Actual level selection"
          kindLabel="Product · Still"
        />
      ) : null}
      <ol className="case-decrypt-levels">
        {DECRYPT_MODES.map((mode, index) => (
          <li
            className={`case-decrypt-level case-decrypt-level--${mode.tone}`}
            data-wave-follow
            style={{ '--mode-index': index }}
            key={mode.level}
          >
            <span className="case-decrypt-level__index">0{index + 1}</span>
            <div className="case-decrypt-level__identity">
              <span>{mode.level}</span>
              <strong>{mode.character}</strong>
            </div>
            <dl>
              <div><dt>Rules</dt><dd>{mode.rules}</dd></div>
              <div><dt>Time</dt><dd>{mode.time}</dd></div>
            </dl>
            <span className="case-decrypt-level__pressure" aria-hidden="true" />
          </li>
        ))}
      </ol>
    </div>
  </section>
);

const DecryptPressureChamber = () => (
  <section
    className="case-decrypt-engine case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 1 }}
    aria-labelledby="decrypt-engine-title"
  >
    <StorySectionHead
      eyebrow="Live validation loop"
      title="The same string is checked again on every edit."
      body="The first input arms the clock; every later edit can pass a new rule or invalidate an earlier one."
      id="decrypt-engine-title"
    />
    <div className="case-decrypt-engine__board">
      <article className="case-decrypt-engine__mode" data-wave-follow>
        <span>Selected pressure</span>
        <div>
          <Icon icon="lucide:terminal" aria-hidden="true" />
          <strong>HACKER</strong>
        </div>
        <small>12 live rules</small>
      </article>
      <div className="case-decrypt-engine__route case-decrypt-engine__route--mode" data-wave-follow aria-hidden="true">
        <span>selects</span>
        <Icon icon="lucide:arrow-right" />
      </div>
      <article
        className="case-decrypt-engine__password"
        data-wave-follow
        aria-label="Illustrative password validation diagram, not an application capture"
      >
        <span>Illustrative state · not a real capture</span>
        <div aria-label="Example password with a virus mutation during live validation">
          <strong>44437!Jul¥</strong>
          <span className="case-decrypt-engine__mutation-icon" aria-hidden="true">
            <Icon icon="lucide:bug" />
          </span>
          <b>_</b>
        </div>
        <small>@input re-runs the selected checker</small>
      </article>
      <article className="case-decrypt-engine__timer" data-wave-follow>
        <Icon icon="lucide:timer" aria-hidden="true" />
        <span>First input starts</span>
        <strong>05:00</strong>
        <small>toward 00:00</small>
      </article>
      <div className="case-decrypt-engine__route case-decrypt-engine__route--timer" data-wave-follow aria-hidden="true">
        <span>counts down</span>
        <Icon icon="lucide:arrow-right" />
      </div>
      <ol className="case-decrypt-rules" aria-label="Live rule progression">
        {DECRYPT_RULE_STACK.map((rule) => (
          <li className={`is-${rule.state}`} data-wave-follow key={rule.id}>
            <span>{rule.id}</span>
            <strong>{rule.label}</strong>
            <small>
              {rule.state === 'passed' ? 'correct' : rule.state === 'active' ? 'live now' : 'waiting'}
            </small>
            <Icon
              icon={rule.state === 'passed' ? 'lucide:check' : rule.state === 'active' ? 'lucide:radio' : 'lucide:lock-keyhole'}
              aria-hidden="true"
            />
          </li>
        ))}
      </ol>
    </div>
    <div className="case-decrypt-mutations">
      <div className="case-decrypt-mutations__head" data-wave-follow>
        <span>Hardest mutation branch</span>
        <h3>Rules 8 and 11 alter the password itself.</h3>
      </div>
      <ol>
        <li data-wave-follow>
          <span className="case-decrypt-mutations__symbol" aria-hidden="true"><Icon icon="lucide:bug" /></span>
          <div><strong>Clear the virus</strong><small>rule 8 · another character every 4 seconds</small></div>
          <Icon icon="lucide:arrow-right" aria-hidden="true" />
        </li>
        <li data-wave-follow>
          <span className="case-decrypt-mutations__symbol" aria-hidden="true"><Icon icon="lucide:flame" /></span>
          <div><strong>Put out the fire</strong><small>rule 11 · another character every 2 seconds</small></div>
          <Icon icon="lucide:arrow-right" aria-hidden="true" />
        </li>
        <li data-wave-follow>
          <span className="case-decrypt-mutations__symbol" aria-hidden="true"><Icon icon="lucide:crown" /></span>
          <div><strong>Add the crown</strong><small>rule 12 · exact crown character</small></div>
        </li>
      </ol>
    </div>
    <div className="case-decrypt-resolution">
      <StorySectionHead
        eyebrow="One burn, two verdicts"
        title="Success and timeout share the same fiery transition."
        body="Both paths replace the password character by character before the result overlay resolves the run."
        id="decrypt-resolution-title"
      />
      <div className="case-decrypt-resolution__flow" aria-labelledby="decrypt-resolution-title">
        <article className="case-decrypt-resolution__trigger" data-wave-follow>
          <span>Either trigger</span>
          <h3>All rules correct <i>or</i> clock at zero</h3>
          <p>Both conditions call the same burn function.</p>
        </article>
        <div className="case-decrypt-resolution__burn" data-wave-follow>
          <Icon icon="lucide:flame" aria-hidden="true" />
          <span>firePassword</span>
          <strong>one character every 50 ms</strong>
        </div>
        <div className="case-decrypt-outcomes" aria-label="Game outcomes">
          <article className="case-decrypt-outcome case-decrypt-outcome--win" data-wave-follow>
            <Icon icon="lucide:crown" aria-hidden="true" />
            <span>Completed rule count matches</span>
            <h3>Victory overlay</h3>
            <p>Win art, victory audio, then restart.</p>
          </article>
          <article className="case-decrypt-outcome case-decrypt-outcome--lose" data-wave-follow>
            <Icon icon="lucide:circle-x" aria-hidden="true" />
            <span>Completed rule count falls short</span>
            <h3>Game-over overlay</h3>
            <p>Loss art, lose audio, then restart.</p>
          </article>
        </div>
      </div>
    </div>
  </section>
);

const DecryptResolutionProof = ({ project, media }) => {
  if (!media) return null;

  return (
    <section
      className="case-decrypt-manual case-reveal"
      data-reveal="scroll"
      style={{ '--reveal-index': 2 }}
      aria-labelledby="decrypt-manual-title"
    >
      <StorySectionHead
        eyebrow="Real product proof"
        title="The manual names the stakes before the timer starts."
        body="This captured opening step introduces the three level identities inside the actual game."
        id="decrypt-manual-title"
      />
      <div className="case-decrypt-manual__stage">
        <CaseMediaFrame
          media={media}
          alt={`${project.title} in-game manual opening step`}
          sizes="(max-width: 900px) 100vw, 760px"
          className="case-media__frame--decrypt-manual"
          label="Actual in-game manual · opening step"
          kindLabel="Product · Still"
        />
        <ol className="case-decrypt-manual__beats">
          <li data-wave-follow><span>01</span><strong>Choose one level identity</strong></li>
          <li data-wave-follow><span>02</span><strong>First input starts the timer</strong></li>
          <li data-wave-follow><span>03</span><strong>Burn, then show the verdict</strong></li>
        </ol>
      </div>
    </section>
  );
};

const DECRYPT_RUNTIME = [
  ['01', 'lucide:mouse-pointer-click', 'Browser input', 'Level buttons and one text field send every player choice into the client.'],
  ['02', 'lucide:component', 'Vue App.vue', 'Refs, input handlers, and watchEffect hold the timer, visible rules, sound, and result state.'],
  ['03', 'lucide:braces', 'Imported data.json', 'Three local objects provide the rules, character, visual tokens, and time budget.'],
  ['04', 'lucide:timer-reset', 'Browser APIs', 'setInterval drives the clock and mutations; Date and Audio supply the month rule and sound cues.'],
  ['05', 'lucide:monitor-check', 'Reactive verdict', 'Rule cards, the burn transition, and the win or game-over overlay close the run.'],
  ['06', 'lucide:rotate-ccw', 'Retry boundary', 'sessionStorage restores the selected level; input, timer, and rule progress start over.'],
];

const DecryptArchitecture = ({ techItems }) => (
  <section
    className="case-decrypt-architecture case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 2 }}
    aria-labelledby="decrypt-architecture-title"
  >
    <StorySectionHead
      eyebrow="Runtime truth"
      title="Everything happens inside one browser tab."
      body="There is no API or account system: Vue state, imported rule data, and browser APIs run the entire game."
      id="decrypt-architecture-title"
    />
    <ol className="case-decrypt-architecture__rail">
      {DECRYPT_RUNTIME.map(([step, icon, title, body]) => (
        <li data-wave-follow key={step}>
          <article>
            <header><span>{step}</span><Icon icon={icon} aria-hidden="true" /></header>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        </li>
      ))}
    </ol>
    <p className="case-decrypt-architecture__boundary" data-wave-follow>
      <Icon icon="lucide:shield-check" aria-hidden="true" />
      No backend, no durable game history, and no saved in-progress password.
    </p>
    <StackBlock items={techItems} reveal="scroll" revealIndex={2} title="Browser-built stack" />
  </section>
);

const DecryptLayout = ({ project, techItems, gallery, hasLive, hasRepo }) => {
  const manualMedia = gallery[0];
  const modeMedia = gallery[1];

  return (
    <>
      <DecryptHero project={project} hasLive={hasLive} hasRepo={hasRepo} />
      <DecryptModeRail project={project} media={modeMedia} />
      <DecryptPressureChamber />
      <DecryptResolutionProof project={project} media={manualMedia} />
      <DecryptArchitecture techItems={techItems} />
    </>
  );
};


const ZUCH_WORKFLOW = [
  {
    icon: 'lucide:search',
    label: 'Browse',
    title: 'Find a title through search or a genre shelf',
    body: 'The browser reads popular titles and film metadata from TMDB, then groups the catalogue into browsable shelves.',
    cue: 'TMDB read',
  },
  {
    icon: 'lucide:film',
    label: 'Open',
    title: 'Move from a poster into one film context',
    body: 'The title view combines movie details, cast and trailer data with the ratings and written reviews already stored for that film.',
    cue: 'one movieId',
  },
  {
    icon: 'lucide:sliders-horizontal',
    label: 'Review',
    title: 'A signed-in person sets five scores and writes once',
    body: 'Five independent 0–100 sliders and one written review are the only inputs; the human chooses when to submit.',
    cue: 'human write',
  },
];

const ZUCH_REVIEW_AXES = [
  {
    label: 'Entertainment',
    icon: 'lucide:popcorn',
  },
  {
    label: 'Movie Chapter',
    icon: 'lucide:book-open',
  },
  {
    label: 'Performance',
    icon: 'lucide:drama',
  },
  {
    label: 'Production',
    icon: 'lucide:clapperboard',
  },
  {
    label: 'Worthiness',
    icon: 'lucide:ticket-check',
  },
];

const ZUCH_ARCHITECTURE_NODES = [
  {
    id: 'client',
    eyebrow: 'Browser client',
    title: 'Vue Router + Pinia',
    body: 'Routes, fetch utilities, review state, and the current user all live in the Vue application.',
    tags: ['Vue 3', 'Pinia', 'localStorage'],
    icon: 'lucide:panel-top',
  },
  {
    id: 'tmdb',
    eyebrow: 'External read',
    title: 'TMDB',
    body: 'The browser requests discovery, search, movie details, credits, videos, posters, and backdrops.',
    tags: ['catalogue', 'details', 'media'],
    icon: 'lucide:database',
  },
  {
    id: 'review',
    eyebrow: 'Client processing',
    title: 'ReviewManagement',
    body: 'In-memory code averages each category, derives the ordinary five-category mean, sorts reviews, and pages the list.',
    tags: ['mean', 'sort', 'page'],
    icon: 'lucide:calculator',
  },
  {
    id: 'supabase',
    eyebrow: 'Direct data access',
    title: 'Supabase tables',
    body: 'The browser reads and writes users, genres, ratings, reviews, and liked-review relationships directly.',
    tags: ['users', 'ratings', 'reviews'],
    icon: 'lucide:table-properties',
  },
];

const getZuchPoster = (media) => (typeof media === 'string' ? media : media?.image);

const ProjectZuchArchitecture = () => (
  <section
    className="case-zucchini-architecture case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 1 }}
    aria-labelledby="zucchini-architecture-title"
  >
    <StorySectionHead
      eyebrow="Implementation truth"
      title="The browser is the integration boundary."
      body="There is no custom application server in this path: Vue calls TMDB and Supabase directly, then calculates the review presentation in memory."
      id="zucchini-architecture-title"
      className="case-zucchini-head"
    />

    <div className="case-zucchini-architecture__map">
      <div className="case-zucchini-architecture__connections" data-wave-follow aria-hidden="true">
        <svg viewBox="0 0 1000 520" preserveAspectRatio="none">
          <path d="M500 165 C500 225 190 200 190 285" />
          <path d="M500 165 L500 285" />
          <path d="M500 165 C500 225 810 200 810 285" />
        </svg>
      </div>
      {ZUCH_ARCHITECTURE_NODES.map((node) => (
        <article
          className={`case-zucchini-architecture__slot case-zucchini-architecture__slot--${node.id}`}
          data-wave-follow
          key={node.id}
        >
          <div className="case-zucchini-glass case-zucchini-architecture__node">
            <header>
              <span aria-hidden="true"><Icon icon={node.icon} /></span>
              <small>{node.eyebrow}</small>
            </header>
            <h3>{node.title}</h3>
            <p>{node.body}</p>
            <ul aria-label={`${node.title} signals`}>
              {node.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          </div>
        </article>
      ))}
    </div>

    <aside className="case-zucchini-architecture__boundary" data-wave-follow>
      <div className="case-zucchini-glass">
        <Icon icon="lucide:shield-alert" aria-hidden="true" />
        <div>
          <span>Identity boundary</span>
          <strong>Pinia restores a browser-local user object; this project does not use Supabase Auth, server sessions, or a custom backend.</strong>
        </div>
      </div>
    </aside>
  </section>
);

const ProjectZuchWorkflow = () => (
  <section
    className="case-zucchini-workflow case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 0 }}
    aria-labelledby="zucchini-workflow-title"
  >
    <StorySectionHead
      eyebrow="Browse → open → review"
      title="A poster becomes a film context before it becomes an opinion."
      body="Discovery remains public. Writing is an explicit, signed-in action on one selected movie."
      id="zucchini-workflow-title"
      className="case-zucchini-head"
    />
    <ol className="case-zucchini-workflow__rail">
      {ZUCH_WORKFLOW.map((item, index) => (
        <li data-wave-follow key={item.label}>
          <article className="case-zucchini-glass case-zucchini-workflow__card">
            <header>
              <span>{formatIndex(index + 1)}</span>
              <Icon icon={item.icon} aria-hidden="true" />
            </header>
            <small>{item.label}</small>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            <footer>{item.cue}</footer>
          </article>
        </li>
      ))}
    </ol>
  </section>
);

const ProjectZuchReviewLoop = () => (
  <section
    className="case-zucchini-loop case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 1 }}
    aria-labelledby="zucchini-loop-title"
  >
    <StorySectionHead
      eyebrow="Human-controlled review loop"
      title="Five ratings and one written review become a visible result."
      body="The interface records the person’s input, the browser calculates ordinary means, and the same person decides whether to edit or delete later."
      id="zucchini-loop-title"
      className="case-zucchini-head"
    />

    <div
      className="case-zucchini-loop__map"
      aria-label="Review loop from human rating input through stored rows and client-side averaging to a visible result and later edit or delete"
    >
      <div className="case-zucchini-loop__connections" data-wave-follow aria-hidden="true">
        <svg viewBox="0 0 1200 760" preserveAspectRatio="none">
          <path d="M280 175 L280 530" />
          <path d="M365 610 C445 610 440 445 485 405" />
          <path d="M715 350 C790 310 790 175 850 175" />
          <path d="M930 245 L930 530" />
          <path d="M850 625 C720 710 455 710 330 640 C160 545 85 395 150 270" />
        </svg>
      </div>

      <article className="case-zucchini-loop__slot case-zucchini-loop__slot--input" data-wave-follow>
        <div className="case-zucchini-glass case-zucchini-loop__node">
          <header><span>01</span><small>Human input</small></header>
          <h3>Rate the film</h3>
          <ul className="case-zucchini-loop__axes" aria-label="Five Zucchinitor rating categories">
            {ZUCH_REVIEW_AXES.map((axis) => (
              <li key={axis.label}>
                <Icon icon={axis.icon} aria-hidden="true" />
                <span>{axis.label}</span>
                <small>0–100</small>
              </li>
            ))}
          </ul>
          <p>One text field carries the written review. It is not a separate comment thread.</p>
        </div>
      </article>

      <article className="case-zucchini-loop__slot case-zucchini-loop__slot--rows" data-wave-follow>
        <div className="case-zucchini-glass case-zucchini-loop__node">
          <header><span>02</span><small>Captured rows</small></header>
          <h3>Rating + review</h3>
          <p>Supabase stores a rating row first, then a review row carrying movieId, userId, ratingId, text, and likeCount.</p>
          <ul className="case-zucchini-loop__tags">
            <li>ratings</li><li>reviews</li><li>movieId</li>
          </ul>
        </div>
      </article>

      <article className="case-zucchini-loop__slot case-zucchini-loop__slot--mean" data-wave-follow>
        <div className="case-zucchini-glass case-zucchini-loop__node case-zucchini-loop__node--core">
          <header>
            <span aria-hidden="true"><Icon icon="lucide:calculator" /></span>
            <small>03 · Browser calculation</small>
          </header>
          <h3>Zucchinitor</h3>
          <div className="case-zucchini-loop__formula" aria-label="Ordinary mean of the five category averages">
            <span>mean of every review per category</span>
            <Icon icon="lucide:arrow-down" aria-hidden="true" />
            <strong>ordinary mean of 5 category averages</strong>
          </div>
          <p>No weighting, critic tier, or recommendation model is added.</p>
        </div>
      </article>

      <article className="case-zucchini-loop__slot case-zucchini-loop__slot--result" data-wave-follow>
        <div className="case-zucchini-glass case-zucchini-loop__node">
          <header><span>04</span><small>Visible result</small></header>
          <h3>Score + reviews</h3>
          <p>The movie view renders the five category means, the overall mean, review text, likes, sorting, and three-at-a-time pagination.</p>
          <ul className="case-zucchini-loop__tags">
            <li>most liked</li><li>high / low</li><li>3 per page</li>
          </ul>
        </div>
      </article>

      <article className="case-zucchini-loop__slot case-zucchini-loop__slot--revisit" data-wave-follow>
        <div className="case-zucchini-glass case-zucchini-loop__node">
          <header><span>05</span><small>Next choice</small></header>
          <h3>Revisit Reviewed</h3>
          <p>The signed-in person can reopen the review editor or explicitly delete a review from their own Reviewed list.</p>
          <ul className="case-zucchini-loop__tags">
            <li>edit</li><li>delete</li><li>human decides</li>
          </ul>
        </div>
      </article>
    </div>

    <aside className="case-zucchini-loop__control" data-wave-follow>
      <div className="case-zucchini-glass">
        <Icon icon="lucide:user-round-check" aria-hidden="true" />
        <span>Every create, edit, like, and delete starts with a person. The product does not act autonomously.</span>
      </div>
    </aside>
  </section>
);

const ProjectZuchEvidence = ({ project, gallery }) => {
  const items = gallery.map((media, index) => ({
    image: getZuchPoster(media),
    label: project.galleryLabels?.[index] || `Feature ${index + 1}`,
    description: project.galleryDescriptions?.[index],
    origin: project.galleryKinds?.[index] || 'Repository demo still',
  }));

  if (!items.some((item) => item.image)) return null;

  return (
    <section
      className="case-zucchini-proof case-reveal"
      data-reveal="scroll"
      style={{ '--reveal-index': 2 }}
      aria-labelledby="zucchini-proof-title"
    >
      <StorySectionHead
        eyebrow="Real interface proof"
        title="The aggregate stays beside the reviews that produced it."
        body="The current deployment is shown in the hero. These labelled repository demo stills document the review result and the signed-in return path."
        id="zucchini-proof-title"
        className="case-zucchini-head"
      />
      <div className="case-zucchini-proof__grid">
        {items.filter((item) => item.image).map((item, index) => (
          <article
            className={`case-zucchini-proof__item ${index === 0 ? 'case-zucchini-proof__item--lead' : ''}`}
            key={item.label}
          >
            <CaseMediaFrame
              image={item.image}
              alt={`${project.title} ${item.label} application screen`}
              sizes={index === 0 ? '(max-width: 900px) 100vw, 760px' : '(max-width: 900px) 100vw, 420px'}
              className="case-media__frame--zucchini-proof"
              label={item.label}
              kindLabel={item.origin}
            />
            <div className="case-zucchini-proof__copy" data-wave-follow>
              <div className="case-zucchini-glass">
                <span>{item.origin}</span>
                <h3>{item.label}</h3>
                {item.description && <p>{item.description}</p>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const ZuchLayout = ({ project, decision, techItems, gallery, hasLive, hasRepo }) => {
  return (
    <>
      <div className="case-zucchini-hero case-reveal" data-reveal="mount" style={{ '--reveal-index': 1 }}>
        <div className="case-zucchini-hero__copy" data-wave-follow>
          <p className="case-kicker">{project.category || 'Selected system'}</p>
          <h1 id="case-title">{project.title}</h1>
          <p className="case-role">Team project · {project.role || 'Frontend Developer'}</p>
          <p className="case-lede">{project.description}</p>
          {decision && <p className="case-zucchini-hero__thesis">{decision}</p>}
          <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
        </div>
        <div className="case-zucchini-hero__visual">
          <CaseMediaFrame
            image={project.image}
            alt={`${project.title} current deployed homepage showing search, a recommended film, five rating categories, and a genre shelf`}
            eager
            sizes="(max-width: 900px) 100vw, 760px"
            className="case-media__frame--zucchini-hero"
            label="Current deployed homepage"
            kindLabel="Live still"
            transitionTarget
          />
          <aside className="case-zucchini-hero__caption" data-wave-follow>
            <div className="case-zucchini-glass">
              <span>Live still · Anonymous view</span>
              <strong>Search, a recommended title, five visible rating axes, and genre shelves share the first screen.</strong>
              <p>The current live proof is limited to this public discovery surface; repository demo stills below document the signed-in review path.</p>
            </div>
          </aside>
        </div>
      </div>

      <ProjectZuchWorkflow />
      <ProjectZuchReviewLoop />
      <ProjectZuchEvidence project={project} gallery={gallery} />
      <ProjectZuchArchitecture />
      <StackBlock items={techItems} reveal="scroll" revealIndex={2} title="Built in the browser" />
    </>
  );
};

const FREEFLOW_PATH = [
  { label: 'Message', cue: 'LINE OA intake' },
  { label: 'Thread', cue: 'shared client context' },
  { label: 'Work', cue: 'proposal · project · invoice' },
];

const FREEFLOW_TRAIL = [
  {
    stage: '01',
    title: 'A LINE message arrives',
    body: 'Text or a file enters through the connected Official Account.',
    icon: 'simple-icons:line',
  },
  {
    stage: '02',
    title: 'Context stays one record',
    body: 'Identity, conversation, attachments, and unread state resolve together.',
    icon: 'lucide:messages-square',
  },
  {
    stage: '03',
    title: 'The next action is visible',
    body: 'Reply, quote, project, invoice, or appointment starts beside the same thread.',
    icon: 'lucide:arrow-up-right',
  },
];

const FREEFLOW_BOUNDARY = [
  {
    status: 'Live',
    title: 'LINE OA',
    body: 'Webhook intake, realtime inbox mirror, media + files.',
    icon: 'simple-icons:line',
    live: true,
  },
  {
    status: 'Roadmap',
    title: 'Other channels',
    body: 'Provider-shaped model only. Not claimed as shipped product.',
    icon: 'lucide:waypoints',
    live: false,
  },
];

const FREEFLOW_SYSTEM = [
  {
    label: 'Clients',
    title: 'React workspace + LINE OA',
    body: 'JWT/REST/Socket.IO for freelancers. Webhook for customers.',
    icon: 'lucide:monitor-up',
  },
  {
    label: 'Boundary',
    title: 'Go Fiber API',
    body: 'Scope the org, persist CRM truth, publish the visible result.',
    icon: 'lucide:server-cog',
    focus: true,
  },
  {
    label: 'Stores',
    title: 'PostgreSQL + MinIO',
    body: 'Records stay relational. Files and documents stay object storage.',
    icon: 'simple-icons:postgresql',
  },
];

const FreeflowHeroMedia = ({ project, media }) => {
  const poster = media && typeof media === 'object' ? media.image : media;

  if (!poster) {
    return <CaseHeroMedia project={project} sizes="(max-width: 900px) 100vw, 680px" />;
  }

  return (
    <CaseMediaFrame
      image={poster}
      alt={`${project.title} workspace dashboard`}
      eager
      sizes="(max-width: 900px) 100vw, 680px"
      className="case-media__frame--freeflow-hero"
      transitionTarget
    />
  );
};

const FreeflowVideoBeat = ({
  project,
  media,
  label,
  description,
  eyebrow,
  title,
  points = [],
  reverse = false,
  revealIndex = 0,
}) => {
  if (!media) return null;

  return (
    <section
      className={[
        'case-freeflow-beat',
        'case-reveal',
        reverse ? 'case-freeflow-beat--reverse' : '',
      ].filter(Boolean).join(' ')}
      data-reveal="scroll"
      style={{ '--reveal-index': revealIndex }}
      aria-labelledby={`freeflow-beat-${revealIndex}-${label}`}
    >
      <div className="case-freeflow-beat__copy" data-wave-follow>
        <StorySectionHead
          eyebrow={eyebrow}
          title={title}
          body={description}
          id={`freeflow-beat-${revealIndex}-${label}`}
        />
        {points.length > 0 && (
          <ul className="case-freeflow-beat__points" aria-label={`${label} signals`}>
            {points.map((point) => (
              <li key={point}>
                <Icon icon="lucide:check" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="case-freeflow-beat__media">
        <CaseMediaFrame
          media={media}
          alt={`${project.title} — ${label}`}
          sizes="(max-width: 900px) 100vw, 760px"
          className="case-media__frame--freeflow-evidence"
          label={label}
          kindLabel="Recorded flow"
        />
      </div>
    </section>
  );
};

const FreeflowTrail = ({ decision }) => (
  <section
    className="case-freeflow-trail case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 0 }}
    aria-labelledby="freeflow-trail-title"
  >
    <StorySectionHead
      eyebrow="One operating trail"
      title="Message in. Context held. Work continues."
      body="Three beats only. Everything else is support detail."
      id="freeflow-trail-title"
    />
    <ol className="case-freeflow-trail__steps" aria-label="FreeFlow operating trail">
      {FREEFLOW_TRAIL.map((step, index) => (
        <li data-wave-follow key={step.stage}>
          <article className="case-freeflow-glass case-freeflow-trail__card">
            <header>
              <span>{step.stage}</span>
              <span className="case-freeflow-trail__icon" aria-hidden="true">
                <Icon icon={step.icon} />
              </span>
            </header>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
          {index < FREEFLOW_TRAIL.length - 1 && (
            <span className="case-freeflow-trail__connector" aria-hidden="true">
              <Icon icon="lucide:arrow-right" />
            </span>
          )}
        </li>
      ))}
    </ol>
    {decision && (
      <p className="case-freeflow-glass case-freeflow-trail__note" data-wave-follow>
        <Icon icon="lucide:circle-check-big" aria-hidden="true" />
        <span>{decision}</span>
      </p>
    )}
  </section>
);

const FreeflowBoundary = () => (
  <section
    className="case-freeflow-boundary case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 1 }}
    aria-labelledby="freeflow-boundary-title"
  >
    <StorySectionHead
      eyebrow="Honest scope"
      title="LINE is live. Other channels stay labelled."
      body="The page only claims the path you can see in the demos."
      id="freeflow-boundary-title"
    />
    <div className="case-freeflow-boundary__row">
      {FREEFLOW_BOUNDARY.map((item) => (
        <article
          className={[
            'case-freeflow-glass',
            'case-freeflow-boundary__card',
            item.live ? 'is-live' : 'is-roadmap',
          ].join(' ')}
          data-wave-follow
          key={item.title}
        >
          <span className="case-freeflow-boundary__icon" aria-hidden="true">
            <Icon icon={item.icon} />
          </span>
          <div>
            <small>{item.status}</small>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        </article>
      ))}
    </div>
  </section>
);

const FreeflowSystem = ({ techItems }) => (
  <section
    className="case-freeflow-system-rail case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 2 }}
    aria-labelledby="freeflow-system-title"
  >
    <StorySectionHead
      eyebrow="Backend boundary"
      title="Two clients. One write path."
      body="The story stays short: who writes, who scopes, what stores."
      id="freeflow-system-title"
    />
    <ol className="case-freeflow-system-rail__list" aria-label="FreeFlow system map">
      {FREEFLOW_SYSTEM.map((node, index) => (
        <li data-wave-follow key={node.title}>
          <article className={node.focus ? 'case-freeflow-glass case-freeflow-system-rail__node is-focus' : 'case-freeflow-glass case-freeflow-system-rail__node'}>
            <span>{formatIndex(index + 1)}</span>
            <span className="case-freeflow-system-rail__icon" aria-hidden="true">
              <Icon icon={node.icon} />
            </span>
            <small>{node.label}</small>
            <h3>{node.title}</h3>
            <p>{node.body}</p>
          </article>
          {index < FREEFLOW_SYSTEM.length - 1 && (
            <span className="case-freeflow-system-rail__arrow" aria-hidden="true">
              <Icon icon="lucide:arrow-right" />
            </span>
          )}
        </li>
      ))}
    </ol>
    <StackBlock items={techItems} reveal="scroll" revealIndex={2} title="Built across the boundary" />
  </section>
);

const FreeflowLayout = ({ project, decision, techItems, gallery, hasLive, hasRepo }) => {
  const workspace = gallery[0];
  const inbox = gallery[1];
  const dashboard = gallery[2];

  return (
    <>
      <div className="case-freeflow-hero case-reveal" data-reveal="mount" style={{ '--reveal-index': 1 }}>
        <div className="case-freeflow-hero__copy" data-wave-follow>
          <div className="case-freeflow-brand">
            <img
              src="/assets/freeflow/logo.png"
              alt=""
              width="64"
              height="64"
              aria-hidden="true"
              data-wave-media
            />
            <span>Backend-led CRM workspace</span>
          </div>
          <p className="case-kicker">{project.category || 'Selected system'}</p>
          <h1 id="case-title">{project.title}</h1>
          <p className="case-freeflow-hero__thesis">One client message becomes an operating trail.</p>
          <p className="case-role">{project.role || 'Software Engineer'}</p>
          <p className="case-lede">{project.description}</p>
          <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
        </div>
        <div className="case-freeflow-hero__media">
          <FreeflowHeroMedia project={project} media={workspace} />
          <div className="case-freeflow-hero__caption-motion" data-wave-follow>
            <aside className="case-freeflow-glass case-freeflow-hero__caption">
              <div className="case-freeflow-path" aria-label="FreeFlow product path">
                {FREEFLOW_PATH.map((step, index) => (
                  <span key={step.label}>
                    <strong>{step.label}</strong>
                    <small>{step.cue}</small>
                    {index < FREEFLOW_PATH.length - 1 && (
                      <Icon icon="lucide:arrow-right" aria-hidden="true" />
                    )}
                  </span>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>

      <FreeflowVideoBeat
        project={project}
        media={workspace}
        label={project.galleryLabels?.[0] || 'Workspace loop'}
        description={project.galleryDescriptions?.[0]}
        eyebrow="Demo 01 · Workspace"
        title="See the day from one sidebar."
        points={['Dashboard', 'Calendar', 'Templates']}
        revealIndex={0}
      />

      <FreeflowTrail decision={decision} />

      <FreeflowVideoBeat
        project={project}
        media={inbox}
        label={project.galleryLabels?.[1] || 'LINE OA inbox'}
        description={project.galleryDescriptions?.[1]}
        eyebrow="Demo 02 · Inbox"
        title="Client context stays beside the chat."
        points={['LINE identity', 'Quotations', 'Files']}
        reverse
        revealIndex={1}
      />

      <FreeflowVideoBeat
        project={project}
        media={dashboard}
        label={project.galleryLabels?.[2] || 'Business pulse'}
        description={project.galleryDescriptions?.[2]}
        eyebrow="Demo 03 · Dashboard"
        title="Attention returns to one operating picture."
        points={['Revenue vs pipeline', 'Unpaid invoices', 'Upcoming meetings']}
        revealIndex={0}
      />

      <FreeflowBoundary />
      <FreeflowSystem techItems={techItems} />
    </>
  );
};

const MODENOTE_CAPTURE_CONTEXT = [
  {
    label: 'Mode',
    title: 'Tell the system what kind of room this is.',
    body: 'A general note, discovery call, interview, or structured conversation needs a different analytical lens.',
    icon: 'lucide:sliders-horizontal',
  },
  {
    label: 'Assist',
    title: 'Choose how visible the AI should be.',
    body: 'Keep capture quiet or ask for balanced live guidance without changing the durable recording path.',
    icon: 'lucide:sparkles',
  },
  {
    label: 'Language',
    title: 'Preserve the way people actually speak.',
    body: 'Thai-English code switching stays in one timestamped timeline instead of being translated into a different conversation.',
    icon: 'lucide:languages',
  },
];

const MODENOTE_REQUIREMENT_FLOW = [
  {
    label: 'Speak',
    title: 'Customer speaks',
    body: 'Pain, intent, and constraints enter the room in the customer’s own words.',
    icon: 'lucide:messages-square',
  },
  {
    label: 'Preserve',
    title: 'Transcript keeps the thread',
    body: 'Thai, English, and the timestamp stay together while the conversation moves on.',
    icon: 'lucide:captions',
  },
  {
    label: 'Ground',
    title: 'Live Assist offers one question',
    body: 'Each rolling analysis can return zero or one evidence-grounded question—not a stream of prompts.',
    icon: 'lucide:sparkles',
  },
  {
    label: 'Decide',
    title: 'The human chooses',
    body: 'The interviewer decides whether the suggestion belongs in the conversation.',
    icon: 'lucide:circle-help',
  },
  {
    label: 'Prove',
    title: 'Support stays attached',
    body: 'Derived requirements retain supporting evidence, strength, and a recommended next step.',
    icon: 'lucide:quote',
  },
];

const MODENOTE_CAPTURE_PATHS = [
  {
    label: 'Realtime path',
    title: 'PCM frames',
    body: 'Provider-ready audio frames stream over the live channel for interim and final transcript segments.',
    cue: 'best-effort · low latency',
    icon: 'lucide:audio-lines',
    tone: 'live',
  },
  {
    label: 'Durable path',
    title: '4-second WebM chunks',
    body: 'MediaRecorder chunks enter a local recovery queue, upload idempotently, and remain usable when realtime drops.',
    cue: 'recoverable · independent',
    icon: 'lucide:shield-check',
    tone: 'durable',
  },
];

const MODENOTE_WORKSPACE_STEPS = [
  {
    stage: '01',
    title: 'Review the recap',
    body: 'Open the stopped session and read its generated overview before returning to the source conversation.',
    icon: 'lucide:notebook-text',
  },
  {
    stage: '02',
    title: 'Search the transcript',
    body: 'Use local text search to find a phrase inside the current session and move back into its transcript.',
    icon: 'lucide:search',
  },
  {
    stage: '03',
    title: 'Export Markdown',
    body: 'Carry the session into a human-readable note without leaving the review workspace.',
    icon: 'simple-icons:markdown',
  },
  {
    stage: '04',
    title: 'Export JSON',
    body: 'Create a structured handoff when another tool needs the session data.',
    icon: 'lucide:braces',
  },
];

const MODENOTE_STACK_LAYERS = [
  {
    layer: 'Product interface',
    title: 'Next.js 16 + React 19',
    body: 'Composes the authenticated capture flow, session library, and post-session review workspace.',
    icons: ['simple-icons:nextdotjs', 'simple-icons:react'],
  },
  {
    layer: 'Shared contracts',
    title: 'TypeScript',
    body: 'Carries shared contracts and domain boundaries across the web, API, worker, and packages.',
    icons: ['simple-icons:typescript'],
  },
  {
    layer: 'API runtime',
    title: 'Bun + Elysia',
    body: 'Serves product APIs, uploads, the realtime WebSocket gateway, and feature-gated MCP routes.',
    icons: ['simple-icons:bun', 'skill-icons:elysia-light'],
  },
  {
    layer: 'Durable state',
    title: 'PostgreSQL',
    body: 'Stores sessions, manifests, final transcript segments, versioned artifacts, and worker job state.',
    icons: ['simple-icons:postgresql'],
  },
  {
    layer: 'Audio objects',
    title: 'MinIO',
    body: 'Keeps private audio chunks and composed recordings behind an S3-compatible storage boundary.',
    icons: ['simple-icons:minio'],
  },
  {
    layer: 'Live speech',
    title: 'Deepgram',
    body: 'Receives 16 kHz PCM for best-effort realtime transcription while durable recording stays independent.',
    icons: ['simple-icons:deepgram'],
  },
  {
    layer: 'Runtime packaging',
    title: 'Docker',
    body: 'Docker Compose packages the web, API, worker, and supporting services for the VPS runtime.',
    icons: ['simple-icons:docker'],
  },
];

const MODENOTE_MEMORY_EXITS = [
  {
    label: 'Find',
    title: 'Search session titles',
    body: 'Search by title, filter and sort the library, then reopen the full session workspace.',
    icon: 'lucide:search',
  },
  {
    label: 'Ask',
    title: 'Source-linked chat',
    body: 'Ask follow-up questions while source chips stay visible.',
    icon: 'lucide:message-circle-question-mark',
  },
  {
    label: 'Carry',
    title: 'Markdown + JSON',
    body: 'Export a human-readable note or a structured machine handoff.',
    icon: 'lucide:file-output',
  },
  {
    label: 'Delegate',
    title: 'Feature-gated MCP',
    body: 'When enabled, grant read-only access to all or selected stopped sessions with expiry, scope, and audit events.',
    icon: 'lucide:bot',
  },
];

const MODENOTE_SYSTEM_NODES = [
  {
    stage: '01 · Capture',
    title: 'Browser session',
    body: 'One microphone feeds recoverable MediaRecorder chunks and a separate realtime PCM stream.',
    icon: 'lucide:mic-2',
    items: ['4s WebM chunks', 'PCM frames'],
  },
  {
    stage: '02 · Route',
    title: 'API + realtime gateway',
    body: 'The product API accepts capture writes while the WebSocket gateway handles best-effort live transcription.',
    icon: 'lucide:waypoints',
    items: ['Elysia API', 'WebSocket STT'],
  },
  {
    stage: '03 · Persist',
    title: 'Session truth',
    body: 'PostgreSQL records sessions, manifests, transcript segments, and artifacts; MinIO stores durable audio.',
    icon: 'lucide:database',
    items: ['PostgreSQL', 'MinIO'],
  },
  {
    stage: '04 · Analyze',
    title: 'Background worker',
    body: 'PostgreSQL-backed jobs turn versioned transcript data into recaps, evidence, and Live Assist artifacts.',
    icon: 'lucide:cpu',
    items: ['versioned artifacts', 'source refs'],
  },
  {
    stage: '05 · Reuse',
    title: 'Workspace + gated MCP',
    body: 'People review and export in ModeNote. A feature flag can expose bounded read-only context to an agent.',
    icon: 'lucide:network',
    items: ['human workspace', 'read-only MCP'],
  },
];

const MODENOTE_MCP_PIPELINE = [
  {
    stage: '01 · Authorize',
    title: 'Create a consent-backed grant.',
    body: 'Choose selected stopped sessions or the full stopped-session library, set expiry, and retain the ability to revoke.',
    icon: 'lucide:key-round',
    items: ['Stopped sessions', 'Expiry', 'Revocable token'],
    next: 'authorizes',
    tone: 'grant',
  },
  {
    stage: '02 · Retrieve',
    title: 'ModeNote serves bounded context.',
    body: 'When MCP_ENABLED is on, the read-only surface enforces the grant and returns source-linked context instead of an unscoped transcript dump.',
    icon: 'lucide:server-cog',
    items: [
      'search_context',
      'search_evidence',
      'get_supported_requirements',
      'get_transcript_segments',
    ],
    next: 'grounds',
    tone: 'server',
  },
  {
    stage: '03 · Hand off',
    title: 'The agent works outside ModeNote.',
    body: 'ModeNote supplies read-only context and source references. Any document or code change happens in the agent’s own workspace.',
    icon: 'lucide:bot',
    prompt: 'Read-only context in · no ModeNote writes out',
    tone: 'agent',
  },
];

const MODENOTE_MCP_GUARDRAILS = [
  { icon: 'lucide:badge-check', label: 'Consent + token' },
  { icon: 'lucide:list-filter', label: 'Stopped only' },
  { icon: 'lucide:user-round-check', label: 'Owner scoped' },
  { icon: 'lucide:scan-text', label: 'Bounded transcript' },
  { icon: 'lucide:scroll-text', label: 'Audit events' },
  { icon: 'lucide:shield-off', label: 'Revoke + expiry' },
];

const ModeNoteContextProof = ({ project, media }) => {
  if (!media) return null;
  const label = project.galleryLabels?.[0] || 'Context before capture';

  return (
    <section
      className="case-modenote-context case-reveal"
      data-reveal="scroll"
      style={{ '--reveal-index': 0 }}
      aria-labelledby="modenote-context-title"
    >
      <StorySectionHead
        eyebrow="Before the waveform"
        title="Choose what the room should notice."
        body="Context is part of capture—not a form to reconstruct after the call."
        id="modenote-context-title"
      />
      <div className="case-modenote-context__stage">
        <figure className="case-modenote-context__media">
          <CaseMediaFrame
            media={media}
            alt={`${project.title} — ${label}`}
            sizes="(max-width: 900px) 100vw, 720px"
            className="case-media__frame--modenote-context"
            label={label}
            kindLabel="Recorded flow"
          />
          {project.galleryDescriptions?.[0] && (
            <figcaption className="case-modenote-context__caption" data-wave-follow>
              {project.galleryDescriptions[0]}
            </figcaption>
          )}
        </figure>
        <ol className="case-modenote-context__list" data-wave-follow aria-label="Capture context choices">
          {MODENOTE_CAPTURE_CONTEXT.map((item, index) => (
            <li key={item.label}>
              <span className="case-modenote-context__index">{formatIndex(index + 1)}</span>
              <span className="case-modenote-context__icon" aria-hidden="true">
                <Icon icon={item.icon} />
              </span>
              <div>
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

const ModeNoteRequirementStory = ({ project, media }) => {
  if (!media) return null;
  const label = project.galleryLabels?.[1] || 'The next-question loop';

  return (
    <section
      className="case-modenote-requirements case-reveal"
      data-reveal="scroll"
      style={{ '--reveal-index': 0 }}
      aria-labelledby="modenote-requirements-title"
    >
      <StorySectionHead
        eyebrow="Live Assist · Customer-discovery example"
        title="One grounded question while context is still alive."
        body="This mode shows the loop clearly: capture the conversation, offer at most one new evidence-grounded question per analysis cycle, then leave the decision to the interviewer."
        id="modenote-requirements-title"
      />

      <div className="case-modenote-requirements__proof">
        <CaseMediaFrame
          media={media}
          alt={`${project.title} — ${label} simulated landing preview`}
          sizes="(max-width: 900px) 100vw, 820px"
          className="case-media__frame--modenote-live-assist"
          label={`${label} · simulated preview`}
          kindLabel="Preview"
        />
        <div className="case-modenote-requirements__aside-motion" data-wave-follow>
          <aside>
            <span>Human-in-the-loop</span>
            <strong>ModeNote suggests. The interviewer decides.</strong>
            <p>The preview illustrates the product loop; it is not presented as a live production session.</p>
            <ul aria-label="Live Assist boundaries">
              <li>zero or one new question</li>
              <li>grounded in recent transcript</li>
              <li>history stays visible</li>
            </ul>
          </aside>
        </div>
      </div>

      <div className="case-modenote-requirements__map">
        <ol
          className="case-modenote-requirements__flow"
          data-wave-follow
          aria-label="ModeNote customer-discovery Live Assist workflow"
        >
          {MODENOTE_REQUIREMENT_FLOW.map((step, index) => (
            <li key={step.label}>
              <span className="case-modenote-requirements__step">
                {formatIndex(index + 1)} · {step.label}
              </span>
              <span className="case-modenote-requirements__icon" aria-hidden="true">
                <Icon icon={step.icon} />
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              {index < MODENOTE_REQUIREMENT_FLOW.length - 1 && (
                <span className="case-modenote-requirements__connector" aria-hidden="true">
                  <Icon icon="lucide:arrow-right" />
                </span>
              )}
            </li>
          ))}
        </ol>

        <div className="case-modenote-requirements__foundation-motion" data-wave-follow>
          <aside className="case-modenote-requirements__foundation">
            <span>Mode-aware boundary</span>
            <strong>The mode changes the analytical lens—not who controls the conversation.</strong>
            <p>
              Customer discovery is one example. General notes, lectures, interviews, brainstorms,
              and casual sessions can keep the same captured truth without inventing the same outputs.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
};

const ModeNoteCaptureArchitecture = ({ decision }) => (
    <section
      className="case-modenote-capture case-reveal"
      data-reveal="scroll"
      style={{ '--reveal-index': 1 }}
      aria-labelledby="modenote-capture-title"
    >
      <StorySectionHead
        eyebrow="Two capture paths · One session"
        title="Realtime can degrade. Durable capture keeps its own path."
        body="ModeNote treats best-effort live intelligence and recoverable audio as separate responsibilities."
        id="modenote-capture-title"
      />

      <div className="case-modenote-architecture" data-wave-follow aria-label="ModeNote dual capture architecture">
        <article className="case-modenote-architecture__source">
          <span aria-hidden="true"><Icon icon="lucide:mic-2" /></span>
          <small>Input</small>
          <h3>Microphone</h3>
          <p>One permission, two independent consumers.</p>
        </article>

        <div className="case-modenote-architecture__split" aria-hidden="true">
          <span />
          <Icon icon="lucide:git-fork" />
          <span />
        </div>

        <div className="case-modenote-architecture__paths">
          {MODENOTE_CAPTURE_PATHS.map((path) => (
            <article className={`is-${path.tone}`} key={path.label}>
              <div>
                <span aria-hidden="true"><Icon icon={path.icon} /></span>
                <small>{path.label}</small>
              </div>
              <h3>{path.title}</h3>
              <p>{path.body}</p>
              <strong>{path.cue}</strong>
            </article>
          ))}
        </div>

        <div className="case-modenote-architecture__merge" aria-hidden="true">
          <span />
          <Icon icon="lucide:git-merge" />
          <span />
        </div>

        <article className="case-modenote-architecture__result">
          <small>Shared truth</small>
          <h3>Timestamped session</h3>
          <p>Replayable audio, ordered final transcript segments, and versioned input for analysis.</p>
          <span>capture → transcript → evidence</span>
        </article>
      </div>

      {decision && (
        <div className="case-modenote-decision-motion" data-wave-follow>
          <p className="case-modenote-decision">{decision}</p>
        </div>
      )}
    </section>
);

const ModeNoteEvidenceProof = ({ project, media }) => {
  if (!media) return null;
  const label = project.galleryLabels?.[2] || 'Recap, transcript search, and export';

  return (
    <section
      className="case-modenote-evidence case-reveal"
      data-reveal="scroll"
      style={{ '--reveal-index': 0 }}
      aria-labelledby="modenote-evidence-title"
    >
      <StorySectionHead
        eyebrow="After recording"
        title="Review the recap. Search the transcript. Carry it out."
        body="The real workspace moves from a stopped session’s recap to local transcript search, then offers Markdown or JSON export from the same session."
        id="modenote-evidence-title"
      />
      <div className="case-modenote-evidence__stage">
        <ol className="case-modenote-evidence__steps" aria-label="Recap, transcript search, and export workflow">
          {MODENOTE_WORKSPACE_STEPS.map((step) => (
            <li data-wave-follow key={step.stage}>
              <div className="case-modenote-evidence__marker">
                <span>{step.stage}</span>
                <span aria-hidden="true"><Icon icon={step.icon} /></span>
              </div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="case-modenote-evidence__media">
          <CaseMediaFrame
            media={media}
            alt={`${project.title} — ${label}`}
            sizes="(max-width: 900px) 100vw, 760px"
            className="case-media__frame--modenote-evidence"
            label={label}
            kindLabel="Recorded flow"
          />
          <div className="case-modenote-evidence__legend" data-wave-follow>
            <span><i className="is-warm" /> recap</span>
            <span><i className="is-mint" /> transcript search</span>
            <span><i /> Markdown + JSON export</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const ModeNoteMemoryProof = ({ project, media }) => {
  if (!media) return null;
  const label = project.galleryLabels?.[3] || 'Searchable session memory';

  return (
    <section
      className="case-modenote-memory case-reveal"
      data-reveal="scroll"
      style={{ '--reveal-index': 1 }}
      aria-labelledby="modenote-memory-title"
    >
      <StorySectionHead
        eyebrow="The session keeps moving"
        title="Find it, ask it, carry it, or delegate it."
        body="The conversation becomes reusable working memory without widening access by accident."
        id="modenote-memory-title"
      />
      <div className="case-modenote-memory__stage">
        <div className="case-modenote-memory__media">
          <CaseMediaFrame
            media={media}
            alt={`${project.title} — ${label}`}
            sizes="(max-width: 900px) 100vw, 880px"
            className="case-media__frame--modenote-library"
            label={label}
            kindLabel="Recorded flow"
          />
        </div>
        <div className="case-modenote-memory__copy-motion" data-wave-follow>
          <div className="case-modenote-memory__copy">
            <span>Session library · one surface</span>
            <p>{project.galleryDescriptions?.[3]}</p>
            <div aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      </div>

      <ol className="case-modenote-memory__exits" data-wave-follow aria-label="Ways to reuse a ModeNote session">
        {MODENOTE_MEMORY_EXITS.map((item, index) => (
          <li key={item.label}>
            <span className="case-modenote-memory__exit-index">{formatIndex(index + 1)}</span>
            <span className="case-modenote-memory__exit-icon" aria-hidden="true">
              <Icon icon={item.icon} />
            </span>
            <div>
              <small>{item.label}</small>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

const ModeNoteMcpBridge = () => (
  <section
    className="case-modenote-mcp case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 2 }}
    aria-labelledby="modenote-mcp-title"
  >
    <StorySectionHead
      eyebrow="System boundary · Feature-gated MCP"
      title="One session truth, bounded at every reader."
      body="Capture, storage, analysis, the human workspace, and optional agent access meet at explicit boundaries instead of sharing one opaque AI pipeline."
      id="modenote-mcp-title"
    />

    <ol className="case-modenote-system" data-wave-follow aria-label="ModeNote runtime architecture">
      {MODENOTE_SYSTEM_NODES.map((node, index) => (
        <li key={node.stage}>
          <span className="case-modenote-system__stage">{node.stage}</span>
          <span className="case-modenote-system__icon" aria-hidden="true">
            <Icon icon={node.icon} />
          </span>
          <h3>{node.title}</h3>
          <p>{node.body}</p>
          <ul aria-label={`${node.title} implementation details`}>
            {node.items.map((item) => <li key={item}>{item}</li>)}
          </ul>
          {index < MODENOTE_SYSTEM_NODES.length - 1 && (
            <span className="case-modenote-system__connector" aria-hidden="true">
              <Icon icon="lucide:arrow-right" />
            </span>
          )}
        </li>
      ))}
    </ol>

    <div className="case-modenote-mcp__map">
      <div className="case-modenote-mcp__intro-motion" data-wave-follow>
        <header className="case-modenote-mcp__intro">
          <div>
            <span>Implemented behind MCP_ENABLED</span>
            <strong>Read-only by contract. Disabled by default.</strong>
          </div>
          <p>When enabled, bearer grants restrict access to stopped, non-deleted sessions owned by the granting user.</p>
        </header>
      </div>

      <ol className="case-modenote-mcp__pipeline" data-wave-follow aria-label="ModeNote MCP agent workflow">
        {MODENOTE_MCP_PIPELINE.map((node, index) => (
          <li className={`is-${node.tone}`} key={node.stage}>
            <span className="case-modenote-mcp__stage">{node.stage}</span>
            <span className="case-modenote-mcp__icon" aria-hidden="true">
              <Icon icon={node.icon} />
            </span>
            <h3>{node.title}</h3>
            <p>{node.body}</p>
            {node.items && (
              <ul aria-label={`${node.title} capabilities`}>
                {node.items.map((item) => <li key={item}><code>{item}</code></li>)}
              </ul>
            )}
            {node.prompt && <blockquote>{node.prompt}</blockquote>}
            {index < MODENOTE_MCP_PIPELINE.length - 1 && (
              <span className="case-modenote-mcp__connector">
                <small>{node.next}</small>
                <Icon icon="lucide:arrow-right" aria-hidden="true" />
              </span>
            )}
          </li>
        ))}
      </ol>

      <div className="case-modenote-mcp__handoff" data-wave-follow>
        <span aria-hidden="true" />
        <div>
          <Icon icon="lucide:shield-check" aria-hidden="true" />
          <small>Responsibility boundary</small>
          <strong>ModeNote reads and returns context; the agent acts elsewhere.</strong>
        </div>
        <span aria-hidden="true" />
      </div>

      <div className="case-modenote-mcp__guardrails-motion" data-wave-follow>
        <ul className="case-modenote-mcp__guardrails" aria-label="ModeNote MCP access safeguards">
          {MODENOTE_MCP_GUARDRAILS.map((item) => (
            <li key={item.label}>
              <Icon icon={item.icon} aria-hidden="true" />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

const ModeNoteStack = () => (
  <section
    className="case-modenote-stack case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 2 }}
    aria-labelledby="modenote-stack-title"
  >
    <StorySectionHead
      eyebrow="Technology stack · Explicit responsibilities"
      title="Each layer has one job."
      body="The stack mirrors the product boundaries: interface, contracts, API, durable state, audio, live speech, and deployment remain legible instead of collapsing into one AI label."
      id="modenote-stack-title"
    />

    <ul className="case-modenote-stack__cards" data-wave-follow aria-label="ModeNote technology responsibilities">
      {MODENOTE_STACK_LAYERS.map((item, index) => (
        <li key={item.title}>
          <header>
            <span>{formatIndex(index + 1)} · {item.layer}</span>
            <span className="case-modenote-stack__icons" aria-hidden="true">
              {item.icons.map((icon) => (
                <span key={icon}><Icon icon={icon} /></span>
              ))}
            </span>
          </header>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </li>
      ))}
    </ul>
  </section>
);

const MODENOTE_STORY_STEPS = [
  {
    label: '01 · Speak',
    title: 'Talk naturally.',
    body: 'Record a meeting, interview, lecture, or idea without stopping when Thai and English mix.',
    icon: 'lucide:mic-2',
  },
  {
    label: '02 · Preserve',
    title: 'Keep the source safe.',
    body: 'Recoverable audio chunks stay independent from the best-effort live transcript.',
    icon: 'lucide:shield-check',
  },
  {
    label: '03 · Understand',
    title: 'Return to the point.',
    body: 'The stopped session becomes a recap, searchable transcript, evidence, and next steps.',
    icon: 'lucide:sparkles',
  },
  {
    label: '04 · Continue',
    title: 'Take it into the work.',
    body: 'Search, ask, or export the same source-linked session instead of replaying an audio file.',
    icon: 'lucide:arrow-up-right',
  },
];

const ModeNoteProblem = () => (
  <section className="modenote-story__chapter" aria-labelledby="modenote-problem-title">
    <StorySectionHead
      eyebrow="The gap"
      title="Voice notes save the sound—not the work inside it."
      body="The real cost arrives afterward: replaying a long recording, reconstructing decisions, and finding the quote that supports them."
      id="modenote-problem-title"
    />
    <div className="modenote-story__shift" data-wave-follow>
      <article className="modenote-story__shift-before modenote-story__glass">
        <span>Before</span>
        <strong>A recording you have to decode again.</strong>
        <p>Replay, scrub, translate, and rebuild the useful parts by hand.</p>
      </article>
      <span className="modenote-story__shift-arrow" aria-hidden="true"><Icon icon="lucide:arrow-right" /></span>
      <article className="modenote-story__shift-after modenote-story__glass">
        <span>After ModeNote</span>
        <strong>A session that already knows where the work is.</strong>
        <p>Transcript, recap, evidence, search, chat, and export share one source.</p>
      </article>
    </div>
  </section>
);

const ModeNoteStoryLoop = () => (
  <section className="modenote-story__chapter" aria-labelledby="modenote-loop-title">
    <StorySectionHead eyebrow="The product loop" title="Speak once. Leave with something usable." body="For the person recording, ModeNote is one clear path from conversation to next action—even while live transcription and recoverable audio remain independent underneath." id="modenote-loop-title" />
    <ol className="modenote-story__loop" aria-label="ModeNote product journey">
      {MODENOTE_STORY_STEPS.map((step) => (
        <li data-wave-follow key={step.label}>
          <Icon icon={step.icon} aria-hidden="true" />
          <span>{step.label}</span>
          <strong>{step.title}</strong>
          <p>{step.body}</p>
        </li>
      ))}
    </ol>
    <p className="modenote-story__decision modenote-story__glass" data-wave-follow><Icon icon="lucide:shield-check" aria-hidden="true" /> Realtime can degrade; the recoverable recording keeps its own path.</p>
  </section>
);

const ModeNoteProof = ({ project, gallery }) => (
  <section className="modenote-story__chapter" aria-labelledby="modenote-proof-title">
    <StorySectionHead eyebrow="The proof" title="The strongest view is the session itself." body="This real product capture shows the bilingual transcript and its timestamps—the source layer every recap, search result, and export must return to." id="modenote-proof-title" />
    <div className="modenote-story__proof">
      {gallery[2] && <CaseMediaFrame image={gallery[2].image} alt={`${project.title} — real stopped-session transcript workspace`} sizes="(max-width: 900px) 100vw, 920px" label="Real stopped-session workspace" kindLabel="Product capture" />}
      <div className="modenote-story__proof-facts" data-wave-follow>
        <article className="modenote-story__glass"><Icon icon="lucide:languages" /><strong>Mixed language, one timeline</strong><p>Thai, English, and timestamps stay in the order people actually spoke.</p></article>
        <article className="modenote-story__glass"><Icon icon="lucide:quote" /><strong>Evidence stays findable</strong><p>Derived outputs can point back to supporting transcript segments.</p></article>
        <article className="modenote-story__glass"><Icon icon="lucide:file-output" /><strong>The session can leave</strong><p>Markdown and JSON exports create explicit human or machine handoffs.</p></article>
      </div>
    </div>
  </section>
);

const ModeNoteSystemSummary = () => (
  <section className="modenote-story__chapter" aria-labelledby="modenote-system-title">
    <StorySectionHead eyebrow="Under the session" title="Three boundaries keep the story honest." body="Capture, durable processing, and optional agent access do not collapse into one opaque AI box." id="modenote-system-title" />
    <ol className="modenote-story__system" aria-label="ModeNote system boundaries">
      <li data-wave-follow><Icon icon="lucide:monitor-up" /><span>Client</span><strong>Next.js capture workspace</strong><p>Records locally recoverable chunks and streams best-effort PCM.</p></li>
      <li data-wave-follow><Icon icon="lucide:server-cog" /><span>Runtime</span><strong>Elysia API + worker</strong><p>Owns uploads, realtime routes, composition, and versioned analysis jobs.</p></li>
      <li data-wave-follow><Icon icon="lucide:database" /><span>Durable truth</span><strong>PostgreSQL + MinIO</strong><p>Stores session state and private audio behind explicit boundaries.</p></li>
    </ol>
    <aside className="modenote-story__mcp modenote-story__glass" data-wave-follow>
      <Icon icon="lucide:bot" aria-hidden="true" />
      <div><span>Optional MCP handoff</span><strong>Read-only context in. No ModeNote writes out.</strong><p>Feature-gated grants expose bounded, owner-scoped stopped-session context with expiry, revocation, and audit events.</p></div>
    </aside>
  </section>
);

const ModeNoteStackSummary = ({ items }) => (
  <section className="modenote-story__stack" aria-labelledby="modenote-stack-summary-title">
    <div data-wave-follow>
      <span>Built as a real system</span>
      <h2 id="modenote-stack-summary-title">Web, realtime, worker, and durable stores.</h2>
    </div>
    <ul data-wave-follow aria-label="ModeNote technology stack">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  </section>
);

const ModeNoteLayout = ({ project, techItems, gallery, hasLive, hasRepo }) => (
  <>
    <header className="modenote-story__hero case-reveal" data-reveal="mount" style={{ '--reveal-index': 1 }}>
      <div className="modenote-story__hero-copy" data-wave-follow>
        <div className="case-modenote-brand">
          <img
            src="/assets/modenote/logo-buddy.svg"
            alt=""
            width="56"
            height="56"
            aria-hidden="true"
            data-wave-media
          />
          <span>Record · understand · continue</span>
        </div>
        <p className="case-kicker">{project.category || 'Selected system'}</p>
        <h1 id="case-title">{project.title}</h1>
        <p className="modenote-story__thesis">Record the conversation. Leave with what matters.</p>
        <p className="case-role">{project.role || 'Software Engineer'}</p>
        <p className="case-lede">{project.description}</p>
        <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
      </div>
      <div className="modenote-story__hero-media">
        <CaseMediaFrame
          image={project.image}
          alt={`${project.title} poster showing the Note Buddy mascot and the real bilingual session workspace`}
          eager
          sizes="(max-width: 900px) 100vw, 760px"
          className="case-media__frame--hero"
          label="Voice in · clarity out"
          kindLabel="Project poster"
          transitionTarget
        />
      </div>
    </header>

    <ModeNoteProblem />
    <ModeNoteStoryLoop />
    <ModeNoteProof project={project} gallery={gallery} />
    <ModeNoteSystemSummary />
    <ModeNoteStackSummary items={techItems} />
  </>
);

const LAYOUT_RENDERERS = {
  modenote: ModeNoteLayout,
  freeflow: FreeflowLayout,
  mux: MuxLayout,
  zuch: ZuchLayout,
  keshi: KeshiLayout,
  decrypt: DecryptLayout,
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
        intensity={
          layout === 'modenote'
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
          <CaseTop caseNumber={caseNumber} caseTotal={caseTotal} />
          <LayoutBody
            project={project}
            decision={decision}
            techItems={techItems}
            gallery={gallery}
            hasLive={hasLive}
            hasRepo={hasRepo}
          />
        </div>
      </ScrollPerspectiveWave>
    </div>
  );
};

export default ProjectDetails;
