import { Icon } from '@iconify/react';
import CaseMediaFrame from './ProjectDetailsMedia';
import { StorySectionHead } from './ProjectDetailsPrimitives';
import { formatIndex } from './ProjectDetailsFormat';
import { MODENOTE_CAPTURE_CONTEXT, MODENOTE_REQUIREMENT_FLOW, MODENOTE_CAPTURE_PATHS, MODENOTE_WORKSPACE_STEPS, MODENOTE_MEMORY_EXITS } from './ProjectDetailsModeNoteData';
import type { ProjectMedia, ProjectRecord } from '../data/projectTypes';

interface MediaProofProps { project: ProjectRecord; media?: ProjectMedia }

const ModeNoteContextProof = ({ project, media }: MediaProofProps) => {
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

const ModeNoteRequirementStory = ({ project, media }: MediaProofProps) => {
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

const ModeNoteCaptureArchitecture = ({ decision }: { decision: string | undefined }) => (
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

const ModeNoteEvidenceProof = ({ project, media }: MediaProofProps) => {
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

const ModeNoteMemoryProof = ({ project, media }: MediaProofProps) => {
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

export { ModeNoteContextProof, ModeNoteRequirementStory, ModeNoteCaptureArchitecture, ModeNoteEvidenceProof, ModeNoteMemoryProof };
