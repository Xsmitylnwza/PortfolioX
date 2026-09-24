import { Fragment, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { projects } from '../data/projects';
import { useDocumentRoomReveal } from '../hooks/useDocumentRoomReveal';
import CaseMediaFrame from './ProjectDetailsMedia';
import { isGifSource, isVideoSource } from './ProjectDetailsMediaSource';
import ScrollPerspectiveWave from './ScrollPerspectiveWave';
import { CaseActions, StackBlock } from './ProjectDetailsShared';
import { formatIndex } from './ProjectDetailsFormat';
import HermesProjectDetails from './ProjectDetailsHermes';
import MuxLayout from './ProjectDetailsMux.jsx';
import CaseMatteSurface from './CaseMatteSurface';
import './DocumentRoom.css';
import './ProjectDetails.css';
import './ProjectDetailsMux.css';
import './ProjectDetailsZuch.css';
// Preserve the cascade: shared base → project bases → shared responsive rules
// → project refinements. The split changes files, not DOM or visual behavior.
import './ProjectDetailsStories.css';
import './ProjectDetailsKeshiStory.css';
import './ProjectDetailsDecryptStory.css';
import './ProjectDetailsStorySharedOverrides.css';
import './ProjectDetailsKeshiStoryOverrides.css';
import './ProjectDetailsDecryptStoryOverrides.css';
import './ProjectDetailsZuchStory.css';
import './ProjectDetailsFreeflow.css';
import './ProjectDetailsModeNote.css';
import './ProjectDetailsModeNoteStory.css';
import './ProjectDetailsHermes.css';
import './KeshiLiquidGlass.css';
import './CaseMatteSurface.css';
import './ProjectDetailsKeshiNext.css';
import './ProjectCoverMedia.css';

const PROJECT_DECISIONS = {
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

/**
 * Shared visual language, different content choreography per case.
 * keshi   — focus rhythm grows into discipline evidence
 * feature — product story with stacked demo beats (Zucchini)
 * decrypt — escalating pressure chamber and outcome split
 */
const PROJECT_LAYOUTS = {
  'hermes-command-center': 'hermes',
  'modenote': 'modenote',
  'freeflow': 'freeflow',
  'veluma': 'mux',
  'keshi-pomodoro': 'keshi',
  'zucchini-review': 'zuch',
  'decrypt-password': 'decrypt',
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

const CaseHeroMedia = ({ project, sizes = '(max-width: 900px) 100vw, 920px', waveSkip = false }) => (
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
    <div className="case-keshi-state__caption case-keshi-glass-slot" data-wave-follow>
      <CaseMatteSurface className="case-keshi-state__glass" contentClassName="keshi-liquid-glass__content">
        <span>{state.cue}</span>
        <strong>{state.time}</strong>
        <p>{state.body}</p>
      </CaseMatteSurface>
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
            <div className="case-keshi-atmosphere__caption case-keshi-glass-slot" data-wave-follow>
              <CaseMatteSurface className="case-keshi-atmosphere__glass" contentClassName="keshi-liquid-glass__content">
                <Icon icon="lucide:palette" aria-hidden="true" />
                <div>
                  <span>Theme studio</span>
                  <p>{project.galleryDescriptions?.[0]}</p>
                </div>
              </CaseMatteSurface>
            </div>
          </article>
        ) : null}
        {settingsMedia ? (
          <article className="case-keshi-atmosphere__feature case-keshi-atmosphere__feature--settings">
            <div className="case-keshi-atmosphere__caption case-keshi-glass-slot" data-wave-follow>
              <CaseMatteSurface className="case-keshi-atmosphere__glass" contentClassName="keshi-liquid-glass__content">
                <Icon icon="lucide:sliders-horizontal" aria-hidden="true" />
                <div>
                  <span>Session controls</span>
                  <p>{project.galleryDescriptions?.[1]}</p>
                </div>
              </CaseMatteSurface>
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
        <aside className="case-keshi-proof__caption case-keshi-glass-slot" data-wave-follow>
          <CaseMatteSurface className="case-keshi-proof__glass" contentClassName="keshi-liquid-glass__content">
            <span>Captured from the Keshi application</span>
            <ul>
              <li>habit checks</li>
              <li>focus sessions</li>
              <li>tasks + activity</li>
            </ul>
          </CaseMatteSurface>
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

/* ---------------------------------------------------------------------------
 * Keshi — "next" preview (?layout=next). The page is a Pomodoro session:
 * dense Focus beats alternate with spacious Relax beats (DESIGN.md A21), and
 * a session clock counts each beat down as the reader scrolls — the project's
 * own gimmick (A22). Every sentence below is lifted from verified sources:
 * projects.js, PROJECT_DECISIONS or the current Keshi copy. Nothing invented.
 * ------------------------------------------------------------------------ */

const KESHI_NEXT_CHOICES = [
  {
    chose: 'A rhythm.',
    not: 'Two cosmetic themes',
    body: 'Focus and break are mental states, not theme toggles. The room changes when the work does.',
  },
  {
    chose: 'Done, or not done.',
    not: 'A 1–10 vibes score',
    body: 'Habits score binary — legacy 1–10 entries count as done above zero — so the mirror stays honest about whether you showed up.',
  },
  {
    chose: 'The person decides.',
    not: 'A coach or guilt machine',
    body: 'Hermes reads the shared evidence and returns a quiet cue. It never silently takes over the timer.',
  },
];

const KESHI_SESSION_SECONDS = { focus: 25 * 60, relax: 5 * 60 };

const formatSessionClock = (seconds) => {
  const safe = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
};

const KeshiBeatMark = ({ mode, index }) => (
  <p className={`keshi-beat__mark keshi-beat__mark--${mode}`} aria-hidden="true" data-wave-follow>
    <i />
    <span>{mode === 'focus' ? 'Focus' : 'Relax'} {index}</span>
    <span>{mode === 'focus' ? '25:00' : '05:00'}</span>
  </p>
);

/**
 * Fixed session clock. Portalled to <body>: the case section is transformed
 * by the page wave, and a fixed element inside a transformed ancestor would
 * pin to that ancestor instead of the viewport. Written through refs rather
 * than state so scrolling never re-renders the page.
 */
const KeshiSessionClock = () => {
  const rootRef = useRef(null);
  const modeRef = useRef(null);
  const timeRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const beats = [...document.querySelectorAll('[data-keshi-beat]')];
    if (!root || beats.length === 0) return undefined;

    let frame = 0;
    const paint = () => {
      frame = 0;
      const line = window.innerHeight * 0.55;
      let active = beats[0];
      for (const beat of beats) {
        if (beat.getBoundingClientRect().top <= line) active = beat;
      }
      const rect = active.getBoundingClientRect();
      // Later beats start counting when their top crosses the line. The first
      // beat is already past the line at page top, so it counts from scroll 0
      // instead — otherwise the session would open at 18:45, not 25:00.
      const raw = active === beats[0]
        ? window.scrollY / Math.max(1, rect.top + window.scrollY + rect.height - line)
        : (line - rect.top) / Math.max(1, rect.height);
      const progress = Math.min(1, Math.max(0, raw));
      const mode = active.dataset.keshiBeat;

      root.dataset.mode = mode;
      if (mode === 'end') {
        modeRef.current.textContent = 'Session complete';
        timeRef.current.textContent = '00:00';
        barRef.current.style.transform = 'scaleX(1)';
      } else {
        modeRef.current.textContent = `${mode === 'focus' ? 'Focus' : 'Relax'} ${active.dataset.keshiBeatIndex}`;
        timeRef.current.textContent = formatSessionClock(KESHI_SESSION_SECONDS[mode] * (1 - progress));
        barRef.current.style.transform = `scaleX(${progress.toFixed(3)})`;
      }
      root.dataset.ready = 'true';
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    queue();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    return () => {
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return createPortal(
    <div ref={rootRef} className="keshi-session" data-mode="focus" aria-hidden="true">
      <span className="keshi-session__dot" />
      <span ref={modeRef} className="keshi-session__mode">Focus 01</span>
      <span ref={timeRef} className="keshi-session__time">25:00</span>
      <span className="keshi-session__bar"><i ref={barRef} /></span>
    </div>,
    document.body,
  );
};

const KeshiLayoutNext = ({ project, techItems, gallery, hasLive, hasRepo }) => {
  const [firstWord, ...restWords] = project.title.split(' ');

  return (
    <>
      {/* FOCUS 01 — the object, at full volume */}
      <header
        className="keshi-beat keshi-beat--focus keshi-next-hero case-reveal"
        data-reveal="mount"
        data-keshi-beat="focus"
        data-keshi-beat-index="01"
        style={{ '--reveal-index': 1 }}
      >
        <div className="keshi-next-hero__meta" data-wave-follow>
          <span>{project.category || 'Selected system'}</span>
          <span>Role — {project.role || 'Software Engineer'}</span>
        </div>
        <h1 id="case-title" className="keshi-next-hero__title" data-wave-follow>
          <span>{firstWord}</span>
          <span>{restWords.join(' ')}</span>
        </h1>
        <div className="keshi-next-hero__brief" data-wave-follow>
          <p className="keshi-next-hero__thesis">Focus that leaves evidence.</p>
          <div className="keshi-next-hero__lede">
            <p>
              A lo-fi Focus / Relax timer that grows into a quiet Discipline pattern mirror —
              not a coach or guilt machine.
            </p>
            <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
          </div>
        </div>
        <div className="keshi-next-hero__stage">
          <CaseHeroMedia project={project} sizes="(max-width: 900px) 100vw, 1200px" />
        </div>
      </header>

      {/* RELAX 01 — one breath: why it exists */}
      <section
        className="keshi-beat keshi-beat--relax keshi-next-breath case-reveal"
        data-reveal="scroll"
        data-keshi-beat="relax"
        data-keshi-beat-index="01"
        style={{ '--reveal-index': 0 }}
        aria-labelledby="keshi-next-breath-title"
      >
        <KeshiBeatMark mode="relax" index="01" />
        <h2 id="keshi-next-breath-title" data-wave-follow>
          Rhythm over empty productivity theater.
        </h2>
        <p data-wave-follow>
          Keshi sits between sterile stopwatches and aesthetic shells that forget tracking.
        </p>
      </section>

      {/* FOCUS 02 — the product, dense */}
      <div className="keshi-beat keshi-beat--focus" data-keshi-beat="focus" data-keshi-beat-index="02">
        <KeshiBeatMark mode="focus" index="02" />
        <KeshiStatePair />
        <KeshiAtmosphere project={project} gallery={gallery} />
      </div>

      {/* RELAX 02 — the decisions, stated as refusals */}
      <section
        className="keshi-beat keshi-beat--relax keshi-next-choices case-reveal"
        data-reveal="scroll"
        data-keshi-beat="relax"
        data-keshi-beat-index="02"
        style={{ '--reveal-index': 0 }}
        aria-labelledby="keshi-next-choices-title"
      >
        <KeshiBeatMark mode="relax" index="02" />
        <h2 id="keshi-next-choices-title" className="keshi-next-choices__title" data-wave-follow>
          Three things it refuses to be.
        </h2>
        <ol className="keshi-next-choices__list">
          {KESHI_NEXT_CHOICES.map((choice) => (
            <li key={choice.chose} data-wave-follow>
              <p className="keshi-next-choices__not">
                <span>Not</span> <s>{choice.not}</s>
              </p>
              <h3>{choice.chose}</h3>
              <p className="keshi-next-choices__body">{choice.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FOCUS 03 — the system and its evidence: the climb */}
      <div className="keshi-beat keshi-beat--focus" data-keshi-beat="focus" data-keshi-beat-index="03">
        <KeshiBeatMark mode="focus" index="03" />
        <KeshiRhythmDiagram />
        <KeshiDisciplineProof project={project} gallery={gallery} />
        <KeshiArchitecture techItems={techItems} />
      </div>

      {/* RELAX 03 — the wall label, as in a gallery */}
      <section
        className="keshi-beat keshi-beat--relax keshi-next-placard case-reveal"
        data-reveal="scroll"
        data-keshi-beat="relax"
        data-keshi-beat-index="03"
        style={{ '--reveal-index': 0 }}
        aria-labelledby="keshi-next-placard-title"
      >
        <KeshiBeatMark mode="relax" index="03" />
        <div className="keshi-next-placard__card" data-wave-follow>
          <h2 id="keshi-next-placard-title">
            {project.title}
            <span>{project.year}</span>
          </h2>
          <dl>
            <div>
              <dt>Role</dt>
              <dd>{project.role || 'Software Engineer'}</dd>
            </div>
            <div>
              <dt>Medium</dt>
              <dd>{techItems.join(' · ')}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="keshi-next-end" data-keshi-beat="end" aria-label="End of case study">
        <p className="keshi-next-end__line" data-wave-follow>Session complete.</p>
        <Link to="/" className="keshi-next-end__link" data-cursor="default">
          Back to the gallery
        </Link>
      </section>

      <KeshiSessionClock />
    </>
  );
};

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
            media={project.heroMedia}
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
  { label: 'Client', cue: 'request lands in ops' },
  { label: 'Work', cue: 'quote · project · schedule' },
  { label: 'Money', cue: 'invoice · follow-up' },
];

const FREEFLOW_PROBLEMS = [
  {
    title: 'Talk lives in chat',
    body: 'Client requests scatter across LINE and DMs, so the job context never becomes a durable record.',
    icon: 'lucide:messages-square',
  },
  {
    title: 'Work lives in files',
    body: 'Quotes, briefs, and schedules sit in docs and folders disconnected from the client who asked.',
    icon: 'lucide:folder-open',
  },
  {
    title: 'Money lives elsewhere',
    body: 'Invoices and unpaid follow-up lag behind the work, so freelancers chase cash without a clear board.',
    icon: 'lucide:wallet',
  },
];

const FREEFLOW_JOURNEY = [
  { label: 'Request', cue: 'client asks' },
  { label: 'Quote', cue: 'scope + price' },
  { label: 'Project', cue: 'work runs' },
  { label: 'Invoice', cue: 'get paid' },
  { label: 'Follow-up', cue: 'close the loop' },
];

const FREEFLOW_OWNED = [
  {
    title: 'Identity lifecycle (Go Fiber + JWT)',
    body: 'Register, verify, login, refresh, and password reset so every workspace action has a trusted user.',
    icon: 'lucide:shield-check',
  },
  {
    title: 'Org-scoped freelance workspace API',
    body: 'REST and realtime traffic stay inside one organization — clients, jobs, and files do not leak across teams.',
    icon: 'lucide:building-2',
  },
  {
    title: 'Ops records, not a chat product',
    body: 'Quotations, projects, invoices, appointments, templates, and files are first-class backend objects.',
    icon: 'lucide:briefcase-business',
  },
  {
    title: 'LINE as intake, not the product',
    body: 'Official Account messages can open or update a client record; the workspace is where freelancers run the job.',
    icon: 'simple-icons:line',
  },
];

const FREEFLOW_SYSTEM = [
  {
    label: 'Surfaces',
    title: 'Freelance workspace + intake',
    body: 'Operators run jobs in React. Clients can reach in through LINE OA.',
    icon: 'lucide:monitor-up',
  },
  {
    label: 'Write path',
    title: 'Go Fiber API',
    body: 'Org scope, persist ops records, publish what the workspace shows.',
    icon: 'lucide:server-cog',
    focus: true,
  },
  {
    label: 'Stores',
    title: 'PostgreSQL + MinIO',
    body: 'Jobs and money stay relational. Files and docs stay object storage.',
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
      alt={`${project.title} blue project dossier with its F logo, LINE client intake, quotations, invoices, document templates and schedule`}
      cover
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

const FreeflowProblem = () => (
  <section
    className="case-freeflow-problem case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 0 }}
    aria-labelledby="freeflow-problem-title"
  >
    <StorySectionHead
      eyebrow="The real problem"
      title="Freelance work breaks when the trail splits."
      body="Talk, files, and money live in different places — so follow-up fails even when the work is good."
      id="freeflow-problem-title"
    />
    <ul className="case-freeflow-problem__list" aria-label="Freelance ops pain">
      {FREEFLOW_PROBLEMS.map((item) => (
        <li data-wave-follow key={item.title}>
          <article className="case-freeflow-glass case-freeflow-problem__card">
            <span className="case-freeflow-problem__icon" aria-hidden="true">
              <Icon icon={item.icon} />
            </span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </article>
        </li>
      ))}
    </ul>
  </section>
);

const FreeflowJourney = () => (
  <section
    className="case-freeflow-journey case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 1 }}
    aria-labelledby="freeflow-journey-title"
  >
    <StorySectionHead
      eyebrow="How FreeFlow fixes it"
      title="One ops trail from request to paid work."
      body="FreeFlow is the back-office lane. LINE can open the door — the workspace keeps client, job, and money on one path."
      id="freeflow-journey-title"
    />
    <ol className="case-freeflow-journey__strip" aria-label="FreeFlow ops journey">
      {FREEFLOW_JOURNEY.map((step, index) => (
        <li data-wave-follow key={step.label}>
          <article className="case-freeflow-glass case-freeflow-journey__node">
            <span>{formatIndex(index + 1)}</span>
            <strong>{step.label}</strong>
            <small>{step.cue}</small>
          </article>
          {index < FREEFLOW_JOURNEY.length - 1 && (
            <span className="case-freeflow-journey__arrow" aria-hidden="true">
              <Icon icon="lucide:arrow-right" />
            </span>
          )}
        </li>
      ))}
    </ol>
    <p className="case-freeflow-journey__note" data-wave-follow>
      <Icon icon="simple-icons:line" aria-hidden="true" />
      <span>LINE OA is optional intake into the client record — not a chat product at the center of FreeFlow.</span>
    </p>
  </section>
);

const FreeflowOwned = () => (
  <section
    className="case-freeflow-owned case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 0 }}
    aria-labelledby="freeflow-owned-title"
  >
    <StorySectionHead
      eyebrow="Backend ownership"
      title="What I owned on the backend."
      body="Team capstone. I own the Go write boundary and identity path — not every UI pixel."
      id="freeflow-owned-title"
    />
    <ul className="case-freeflow-owned__list" aria-label="Backend ownership">
      {FREEFLOW_OWNED.map((item) => (
        <li data-wave-follow key={item.title}>
          <article className="case-freeflow-glass case-freeflow-owned__card">
            <span className="case-freeflow-owned__icon" aria-hidden="true">
              <Icon icon={item.icon} />
            </span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </article>
        </li>
      ))}
    </ul>
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
      eyebrow="One system vertical"
      title="One ops write path."
      body="Workspace + LINE intake hit Go Fiber, then Postgres + MinIO."
      id="freeflow-system-title"
    />
    <ol className="case-freeflow-system-rail__list" aria-label="FreeFlow system map">
      {FREEFLOW_SYSTEM.map((node, index) => (
        <li data-wave-follow key={node.title}>
          <article
            className={
              node.focus
                ? 'case-freeflow-glass case-freeflow-system-rail__node is-focus'
                : 'case-freeflow-glass case-freeflow-system-rail__node'
            }
          >
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
    <p className="case-freeflow-glass case-freeflow-boundary-line" data-wave-follow>
      <Icon icon="lucide:circle-check-big" aria-hidden="true" />
      <span>This is a freelance ops workspace. LINE OA is a shipped intake path; other channels stay roadmap — not a multi-chat product claim.</span>
    </p>
    <StackBlock items={techItems} reveal="scroll" revealIndex={2} title="Stack on that path" />
  </section>
);

const FreeflowLayout = ({ project, techItems, gallery, hasLive, hasRepo }) => {
  const workspace = gallery[0];
  const inbox = gallery[1];
  const dashboard = gallery[2];
  const heroMedia = project.heroMedia;

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
            <span>Freelance ops platform · backend path</span>
          </div>
          <p className="case-kicker">{project.category || 'Selected system'}</p>
          <h1 id="case-title">{project.title}</h1>
          <p className="case-freeflow-hero__thesis">
            Back-office that keeps client, job, and money on one trail.
          </p>
          <p className="case-role">{project.role || 'Software Engineer'}</p>
          <p className="case-lede">{project.description}</p>
          <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
        </div>
        <div className="case-freeflow-hero__media">
          <FreeflowHeroMedia project={project} media={heroMedia} />
          <div className="case-freeflow-hero__caption-motion" data-wave-follow>
            {/* Liquid Glass was piloted here (harness Round 15/16) and lost a
                live blind comparison against this original flat-blur
                treatment — DESIGN-DISCOVERY Round 16. Reverted; do not
                reapply without new evidence the glass wins for this
                consumer specifically. */}
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

      <FreeflowProblem />
      <FreeflowJourney />

      <FreeflowVideoBeat
        project={project}
        media={workspace}
        label={project.galleryLabels?.[0] || 'Freelance workspace'}
        description="Instead of hopping chat, docs, and calendar, freelancers run the day from one ops shell."
        eyebrow="Proof 01 · Fixes scattered tools"
        title="One workspace holds the work trail."
        points={['Dashboard home', 'Calendar', 'Templates without leaving the shell']}
        revealIndex={0}
      />

      <FreeflowVideoBeat
        project={project}
        media={dashboard}
        label={project.galleryLabels?.[2] || 'Business board'}
        description="Money and follow-up stop living in a separate headspace — unpaid work and meetings return to one board."
        eyebrow="Proof 02 · Fixes lost money trail"
        title="See what still needs chasing."
        points={['Unpaid invoices', 'Active jobs', 'Upcoming meetings']}
        reverse
        revealIndex={1}
      />

      <FreeflowVideoBeat
        project={project}
        media={inbox}
        label={project.galleryLabels?.[1] || 'Client intake'}
        description="A client can still reach you through LINE — but the request lands on the client/job record, not a disposable chat scroll."
        eyebrow="Proof 03 · Fixes broken intake"
        title="Requests enter ops, not a chat silo."
        points={['LINE as intake only', 'Quotes + files on the client', 'Workspace stays the center']}
        revealIndex={0}
      />

      <FreeflowOwned />
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
      className="case-modenote-capture"
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
        <p>Transcript, recap, evidence, search, and export stay attached to one source.</p>
      </article>
    </div>
  </section>
);

const MODENOTE_DEMO_STEPS = [
  {
    galleryIndex: 0,
    phase: 'capture',
    stage: '01 · Frame the room',
    eyebrow: 'Before capture',
    title: 'Set the language, mode, and assist level.',
    body: 'These choices shape the session before the microphone opens, so context does not have to be reconstructed afterward.',
    facts: ['Thai + English', 'Mode-aware analysis', 'Assist stays adjustable'],
    kindLabel: 'Recorded flow',
    icon: 'lucide:sliders-horizontal',
    signal: 'Context becomes part of capture—not cleanup after the call.',
    layout: 'wide',
  },
  {
    galleryIndex: 1,
    phase: 'capture',
    stage: '02 · Stay in the conversation',
    eyebrow: 'During the conversation',
    title: 'Surface one grounded question—not a wall of prompts.',
    body: 'The customer-discovery preview shows the intended human-in-the-loop: ModeNote suggests, and the interviewer decides.',
    facts: ['Zero or one suggestion', 'Recent transcript grounding', 'Simulated product preview'],
    kindLabel: 'Simulated preview',
    icon: 'lucide:message-circle-question-mark',
    signal: 'Guidance remains optional, visible, and source-aware.',
    layout: 'reverse',
  },
  {
    galleryIndex: 2,
    phase: 'memory',
    stage: '03 · Stop with evidence',
    eyebrow: 'After recording',
    title: 'Review the recap, then return to the transcript.',
    body: 'The recorded flow moves from recap to transcript search and export without leaving the stopped-session workspace.',
    facts: ['Bilingual transcript', 'Local text search', 'Markdown + JSON handoff'],
    kindLabel: 'Recorded flow',
    icon: 'lucide:quote',
    signal: 'Every useful handoff still begins with the captured session.',
    layout: 'climax',
  },
  {
    galleryIndex: 3,
    phase: 'memory',
    stage: '04 · Return without replaying',
    eyebrow: 'Later, when the conversation matters again',
    title: 'Find the session without remembering a filename.',
    body: 'Search, filter, and sort the library, then reopen the same workspace when the conversation becomes relevant again.',
    facts: ['Search by title', 'Filter + sort', 'Reopen the full workspace'],
    kindLabel: 'Recorded flow',
    icon: 'lucide:library-big',
    signal: 'A conversation becomes working memory only when it is easy to return to.',
    layout: 'epilogue',
  },
];

const MODENOTE_DEMO_CHAPTERS = {
  capture: {
    eyebrow: 'Before + during capture · Two product moments',
    title: 'Set the context. Then stay in the conversation.',
    body: 'First choose how the room should be understood. During capture, ModeNote can surface at most one grounded question without taking over.',
  },
  memory: {
    eyebrow: 'The stopped session · Two return paths',
    title: 'The recording stops. The work keeps moving.',
    body: 'Review and export inside the stopped session, then use the library to return when that conversation matters again.',
  },
};

const ModeNoteDemoJourney = ({ project, gallery, phase }) => {
  const chapter = MODENOTE_DEMO_CHAPTERS[phase];
  const steps = MODENOTE_DEMO_STEPS.filter((step) => step.phase === phase);
  if (!chapter || !steps.length) return null;

  return (
    <section
      className={`modenote-story__chapter modenote-story__chapter--${phase}`}
      aria-labelledby={`modenote-${phase}-demos-title`}
    >
      <StorySectionHead
        eyebrow={chapter.eyebrow}
        title={chapter.title}
        body={chapter.body}
        id={`modenote-${phase}-demos-title`}
      />
      <ol className="modenote-story__demos">
        {steps.map((step) => {
          const media = gallery[step.galleryIndex];
          if (!media) return null;
          const label = project.galleryLabels?.[step.galleryIndex] || step.title;

          return (
            <li className={`modenote-story__demo is-${step.layout}`} key={step.stage}>
              <div className="modenote-story__demo-media">
                <CaseMediaFrame
                  media={media}
                  alt={`${project.title} — ${label}`}
                  sizes="(max-width: 840px) 100vw, 680px"
                  label={label}
                  kindLabel={step.kindLabel}
                />
              </div>
              <article className="modenote-story__demo-copy modenote-story__glass" data-wave-follow>
                <span>{step.stage}</span>
                <small>{step.eyebrow}</small>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <ul aria-label={`${step.title} key signals`}>
                  {step.facts.map((fact) => (
                    <li key={fact}><Icon icon="lucide:check" aria-hidden="true" />{fact}</li>
                  ))}
                </ul>
                <div className="modenote-story__demo-signal">
                  <Icon icon={step.icon} aria-hidden="true" />
                  <strong>{step.signal}</strong>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

const ModeNoteSystemSummary = () => (
  <section className="modenote-story__chapter" aria-labelledby="modenote-system-title">
    <StorySectionHead eyebrow="Under the session" title="A simple journey, backed by clear boundaries." body="Capture, routing, durable storage, analysis, and reuse stay separate so each stage has one responsibility." id="modenote-system-title" />
    <ol className="modenote-story__system modenote-story__system--rail" aria-label="ModeNote system lifecycle">
      {MODENOTE_SYSTEM_NODES.map((node, index) => (
        <li data-wave-follow key={node.stage}>
          <Icon icon={node.icon} aria-hidden="true" />
          <span>{node.stage}</span>
          <strong>{node.title}</strong>
          <ul aria-label={`${node.title} implementation signals`}>
            {node.items.map((item) => <li key={item}>{item}</li>)}
          </ul>
          {index < MODENOTE_SYSTEM_NODES.length - 1 && (
            <Icon className="modenote-story__system-arrow" icon="lucide:arrow-right" aria-hidden="true" />
          )}
        </li>
      ))}
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

const ModeNoteLayout = ({ project, decision, techItems, gallery, hasLive, hasRepo }) => (
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
          media={project.heroMedia}
          alt={`${project.title} Buddy and a copper voice ribbon connecting a quoted conversation at 1:04 to its real source workspace`}
          cover
          eager
          sizes="(max-width: 900px) 100vw, 760px"
          className="case-media__frame--hero"
          label="Voice in · clarity out"
          kindLabel="Project poster"
          transitionTarget
        />
        <div className="modenote-story__hero-journey" data-wave-follow aria-label="ModeNote session journey">
          {['Context', 'Conversation', 'Evidence', 'Memory'].map((step, index) => (
            <Fragment key={step}>
              <span>{step}</span>
              {index < 3 && <Icon icon="lucide:arrow-right" aria-hidden="true" />}
            </Fragment>
          ))}
        </div>
      </div>
    </header>

    <ModeNoteProblem />
    <ModeNoteDemoJourney project={project} gallery={gallery} phase="capture" />
    <ModeNoteCaptureArchitecture decision={decision} />
    <ModeNoteDemoJourney project={project} gallery={gallery} phase="memory" />
    <ModeNoteSystemSummary />
    <ModeNoteStackSummary items={techItems} />
  </>
);

const LAYOUT_RENDERERS = {
  hermes: HermesProjectDetails,
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
  const [searchParams] = useSearchParams();
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
  // Preview only: /project/keshi-pomodoro?layout=next renders the redesign
  // beside the shipped page. The plain URL is unchanged.
  const isKeshiNext = layout === 'keshi' && searchParams.get('layout') === 'next';
  const LayoutBody = isKeshiNext ? KeshiLayoutNext : (LAYOUT_RENDERERS[layout] || CinemaLayout);
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
