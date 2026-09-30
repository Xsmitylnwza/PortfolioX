import { Fragment } from 'react';
import { Icon } from '@iconify/react';
import CaseMediaFrame from './ProjectDetailsMedia';
import { StorySectionHead } from './ProjectDetailsPrimitives';
import { CaseActions } from './ProjectDetailsShared';
import { formatIndex } from './ProjectDetailsFormat';
import { MODENOTE_STACK_LAYERS, MODENOTE_SYSTEM_NODES, MODENOTE_MCP_PIPELINE, MODENOTE_MCP_GUARDRAILS, MODENOTE_DEMO_STEPS, MODENOTE_DEMO_CHAPTERS } from './ProjectDetailsModeNoteData';
import { ModeNoteContextProof, ModeNoteRequirementStory, ModeNoteCaptureArchitecture, ModeNoteEvidenceProof, ModeNoteMemoryProof } from './ProjectDetailsModeNoteProofs';
import type { ProjectMedia, ProjectRecord } from '../data/projectTypes';
import type { CaseLayoutProps } from '../features/project-details/types';

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

const ModeNoteDemoJourney = ({ project, gallery, phase }: { project: ProjectRecord; gallery: ProjectMedia[]; phase: keyof typeof MODENOTE_DEMO_CHAPTERS }) => {
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

const ModeNoteStackSummary = ({ items }: { items: string[] }) => (
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

const ModeNoteLayout = ({ project, decision, techItems, gallery, hasLive, hasRepo }: CaseLayoutProps) => (
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

export default ModeNoteLayout;
