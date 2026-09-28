import { Icon } from '@iconify/react';
import CaseMediaFrame from './ProjectDetailsMedia';
import { CaseHeroMedia, StorySectionHead } from './ProjectDetailsPrimitives';
import { CaseActions, StackBlock } from './ProjectDetailsShared';
import type { ProjectMedia, ProjectRecord } from '../data/projectTypes';
import type { CaseLayoutProps } from '../features/project-details/types';

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

const KeshiState = ({ state }: { state: (typeof KESHI_STATES)[number] }) => (
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

const KeshiAtmosphere = ({ project, gallery }: { project: ProjectRecord; gallery: ProjectMedia[] }) => {
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

const KeshiFeedbackNode = ({ node, position }: { node: (typeof KESHI_FEEDBACK_NODES)[keyof typeof KESHI_FEEDBACK_NODES]; position: string }) => (
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

const KeshiDisciplineProof = ({ project, gallery }: { project: ProjectRecord; gallery: ProjectMedia[] }) => {
  const disciplineMedia = gallery[2];
  if (!disciplineMedia) return null;
  const disciplineImage = typeof disciplineMedia === 'string' ? disciplineMedia : disciplineMedia.image;

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
          image={disciplineImage}
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

const KeshiArchitecture = ({ techItems }: { techItems: string[] }) => (
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

const KeshiLayout = ({ project, techItems, gallery, hasLive, hasRepo }: CaseLayoutProps) => (
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

export default KeshiLayout;
export { KeshiStatePair, KeshiAtmosphere, KeshiRhythmDiagram, KeshiDisciplineProof, KeshiArchitecture };
