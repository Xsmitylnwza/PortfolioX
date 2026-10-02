import { Fragment } from 'react';
import { Icon } from '@iconify/react';
import CaseMediaFrame from './ProjectDetailsMedia';
import { StorySectionHead } from './ProjectDetailsPrimitives';
import { CaseSplitHero, StackBlock } from './ProjectDetailsShared';
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
    <div className="case-keshi-state__caption" data-surface="base" data-surface-sheen="" data-wave-follow>
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
        <Icon icon="lucide:arrow-right" data-surface="dark" aria-hidden="true" />
        <small>mode switches</small>
      </div>
      <KeshiState state={KESHI_STATES[1]} />
    </div>
  </section>
);

const KeshiStateDiptych = () => {
  const [focus, relax] = KESHI_STATES;

  return (
    <section
      className="case-keshi-diptych case-reveal"
      data-reveal="scroll"
      style={{ '--reveal-index': 0 }}
      aria-labelledby="keshi-diptych-title"
    >
      <StorySectionHead
        eyebrow="Two mental states"
        title="The room changes when the work does."
        body="Focus and Relax are a rhythm, not two cosmetic themes."
        id="keshi-diptych-title"
      />
      <div className="case-keshi-diptych__stage">
        {[focus, relax].map((state, index) => (
          <Fragment key={state.mode}>
            {index === 1 ? (
              <div className="case-keshi-diptych__seam" data-surface="dark" data-wave-follow aria-label="Completing focus switches to relax">
                <Icon icon="lucide:arrow-right" aria-hidden="true" />
                <span>complete</span>
              </div>
            ) : null}
            <CaseMediaFrame
              image={state.image}
              alt={`Keshi Pomodoro ${state.mode} mode`}
              sizes="(max-width: 900px) 100vw, 540px"
              className="case-media__frame--keshi-diptych"
              label={`${state.mode} mode`}
            />
          </Fragment>
        ))}
      </div>
      <ul className="case-keshi-diptych__tiles" aria-label="Default Focus and Relax clock">
        <li className="case-keshi-diptych__tile" data-surface="base" data-surface-sheen="" data-wave-follow>
          <span className="case-keshi-diptych__mark" data-surface="dark" aria-hidden="true"><Icon icon="lucide:timer" /></span>
          <span className="case-keshi-diptych__label">{focus.mode} · {focus.cue}</span>
          <strong>{focus.time}</strong>
          <p>{focus.body}</p>
        </li>
        <li className="case-keshi-diptych__tile case-keshi-diptych__tile--clock" data-surface="paper" data-surface-sheen="" data-wave-follow>
          <span className="case-keshi-diptych__mark" data-surface="dark" aria-hidden="true"><Icon icon="lucide:arrow-left-right" /></span>
          <span className="case-keshi-diptych__label">Default clock</span>
          <strong>{focus.time} → {relax.time}</strong>
          <p>Complete a sprint and the room switches to the break.</p>
        </li>
        <li className="case-keshi-diptych__tile" data-surface="base" data-surface-sheen="" data-wave-follow>
          <span className="case-keshi-diptych__mark" data-surface="dark" aria-hidden="true"><Icon icon="lucide:coffee" /></span>
          <span className="case-keshi-diptych__label">{relax.mode} · {relax.cue}</span>
          <strong>{relax.time}</strong>
          <p>{relax.body}</p>
        </li>
      </ul>
    </section>
  );
};

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
            <div className="case-keshi-atmosphere__caption" data-surface="base" data-surface-sheen="" data-wave-follow>
              <Icon data-surface-positioned="" icon="lucide:palette" data-surface="dark" aria-hidden="true" />
              <div>
                <span>Theme studio</span>
                <p>{project.galleryDescriptions?.[0]}</p>
              </div>
            </div>
          </article>
        ) : null}
        {settingsMedia ? (
          <article className="case-keshi-atmosphere__feature case-keshi-atmosphere__feature--settings">
            <div className="case-keshi-atmosphere__caption" data-surface="base" data-surface-sheen="" data-wave-follow>
              <Icon data-surface-positioned="" icon="lucide:sliders-horizontal" data-surface="dark" aria-hidden="true" />
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

const KESHI_LOOP_ORDER = [
  KESHI_FEEDBACK_NODES.session,
  KESHI_FEEDBACK_NODES.truth,
  KESHI_FEEDBACK_NODES.mirror,
  KESHI_FEEDBACK_NODES.next,
];

const KeshiFeedbackNode = ({ node }: { node: (typeof KESHI_FEEDBACK_NODES)[keyof typeof KESHI_FEEDBACK_NODES] }) => (
  <li
    className="case-keshi-loop__node"
    data-surface={node.tone === 'discipline' ? 'paper' : 'base'}
    data-surface-sheen=""
    data-wave-follow
  >
    <header>
      <span>{node.step} / {node.eyebrow}</span>
      <span className="case-keshi-loop__icon" data-surface="dark" aria-hidden="true">
        <Icon icon={node.icon} />
      </span>
    </header>
    <h3>{node.title}</h3>
    <p>{node.body}</p>
    <ul aria-label={`${node.title} signals`}>
      {node.tags.map((tag) => <li key={tag} data-surface="dark">{tag}</li>)}
    </ul>
  </li>
);

const KeshiRhythmDiagram = () => (
  <section
    className="case-keshi-loop case-reveal"
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

    <ol
      className="case-keshi-loop__row"
      aria-label="Feedback loop: act in a session, record shared evidence, reflect in the pattern mirror, adapt the next session"
    >
      {KESHI_LOOP_ORDER.map((node) => <KeshiFeedbackNode key={node.step} node={node} />)}
    </ol>

    <div className="case-keshi-loop__bridge" data-surface="base" data-surface-sheen="" data-wave-follow>
      <div className="case-keshi-loop__bridge-head">
        <span className="case-keshi-loop__icon" data-surface="dark" aria-hidden="true">
          <Icon icon={HERMES_AGENT_ICON} />
        </span>
        <div>
          <span>03 / Hermes Agent</span>
          <strong>Scoped feedback bridge</strong>
        </div>
      </div>
      <ol className="case-keshi-loop__steps">
        <li data-surface="dark">
          <span>GET</span>
          <div><strong>Latest daily review</strong><small>sessions · habits · logs</small></div>
        </li>
        <li data-surface="dark">
          <span>READ</span>
          <div><strong>Pattern + load</strong><small>consistency · recovery · gaps</small></div>
        </li>
        <li data-surface="dark">
          <span>SEND</span>
          <div><strong>Next-session cue</strong><small>human confirms the change</small></div>
        </li>
      </ol>
    </div>

    <p className="case-keshi-loop__note" data-wave-follow>
      <span><Icon icon="lucide:user-round-check" aria-hidden="true" /> Human in the loop</span>
      <strong>Hermes informs the next choice; it never silently takes over the timer.</strong>
    </p>
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
        <aside className="case-keshi-proof__caption" data-surface="dark" data-surface-sheen="" data-wave-follow>
          <span>Captured from the Keshi application</span>
          <ul>
            <li data-surface="dark">habit checks</li>
            <li data-surface="dark">focus sessions</li>
            <li data-surface="dark">tasks + activity</li>
          </ul>
        </aside>
      </div>
      <dl className="case-keshi-pattern__facts case-keshi-pattern__facts--wide">
        <div data-surface="base" data-surface-sheen="" data-wave-follow>
          <dt>Habit value</dt>
          <dd><strong>0 / 1</strong><span>not done / done</span></dd>
        </div>
        <div data-surface="base" data-surface-sheen="" data-wave-follow>
          <dt>Day total</dt>
          <dd><strong>done ÷ active</strong><span>habits completed</span></dd>
        </div>
        <div data-surface="base" data-surface-sheen="" data-wave-follow>
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
        <article className="case-keshi-architecture__node case-keshi-architecture__node--browser" data-surface="base" data-surface-sheen="" data-wave-follow>
          <Icon data-surface-positioned="" icon="lucide:monitor-dot" aria-hidden="true" />
          <span>Human path</span>
          <h3>React timer</h3>
          <p>Focus · tasks · history</p>
        </article>
        <article className="case-keshi-architecture__node case-keshi-architecture__node--hermes" data-surface="dark" data-surface-sheen="" data-wave-follow>
          <Icon data-surface-positioned="" icon={HERMES_AGENT_ICON} aria-hidden="true" />
          <span>Hermes Agent</span>
          <h3>Scoped read + write</h3>
          <p>review · reconcile · signal</p>
        </article>
      </div>
      <div className="case-keshi-architecture__link" data-wave-follow aria-hidden="true">
        <span>same contract</span>
        <Icon icon="lucide:arrow-right" />
      </div>
      <article className="case-keshi-architecture__node case-keshi-architecture__node--api" data-surface="base" data-surface-sheen="" data-wave-follow>
        <Icon data-surface-positioned="" icon="lucide:route" aria-hidden="true" />
        <span>Node API</span>
        <h3>One write path</h3>
        <p>Per-user · idempotent</p>
      </article>
      <div className="case-keshi-architecture__link" data-wave-follow aria-hidden="true">
        <span>persist</span>
        <Icon icon="lucide:arrow-right" />
      </div>
      <div className="case-keshi-architecture__stores">
        <article className="case-keshi-architecture__node" data-surface="base" data-surface-sheen="" data-wave-follow>
          <Icon data-surface-positioned="" icon="lucide:database" aria-hidden="true" />
          <span>SQLite</span>
          <h3>Discipline</h3>
          <p>habits · scores · logs</p>
        </article>
        <article className="case-keshi-architecture__node" data-surface="base" data-surface-sheen="" data-wave-follow>
          <Icon data-surface-positioned="" icon="lucide:braces" aria-hidden="true" />
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
    <CaseSplitHero
      hasLive={hasLive}
      hasRepo={hasRepo}
      project={project}
      alt={project.title}
      lede="A lo-fi Focus / Relax timer that grows into a quiet Discipline pattern mirror — not a coach or guilt machine."
    />

    <KeshiStateDiptych />
    <KeshiDisciplineProof project={project} gallery={gallery} />
    <KeshiAtmosphere project={project} gallery={gallery} />
    <KeshiRhythmDiagram />
    <KeshiArchitecture techItems={techItems} />
  </>
);

export default KeshiLayout;
export { KeshiStatePair, KeshiAtmosphere, KeshiRhythmDiagram, KeshiDisciplineProof, KeshiArchitecture };
