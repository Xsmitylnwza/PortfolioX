import { Icon } from '@iconify/react';
import CaseMediaFrame from './ProjectDetailsMedia';
import { CaseHeroMedia, StorySectionHead } from './ProjectDetailsPrimitives';
import { CaseActions, StackBlock } from './ProjectDetailsShared';
import { formatIndex } from './ProjectDetailsFormat';
import type { ProjectMedia, ProjectRecord } from '../data/projectTypes';
import type { CaseLayoutProps } from '../features/project-details/types';

interface FreeflowVideoBeatProps {
  project: ProjectRecord;
  media?: ProjectMedia;
  label: string;
  description: string;
  eyebrow: string;
  title: string;
  points?: string[];
  reverse?: boolean;
  revealIndex?: number;
}

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

const FreeflowHeroMedia = ({ project, media }: { project: ProjectRecord; media?: ProjectMedia }) => {
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
}: FreeflowVideoBeatProps) => {
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

const FreeflowSystem = ({ techItems }: { techItems: string[] }) => (
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

const FreeflowLayout = ({ project, techItems, gallery, hasLive, hasRepo }: CaseLayoutProps) => {
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


export default FreeflowLayout;
