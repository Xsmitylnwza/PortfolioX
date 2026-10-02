import { Icon } from '@iconify/react';
import CaseMediaFrame from './ProjectDetailsMedia';
import { CaseSplitHero, StackBlock } from './ProjectDetailsShared';
import { formatIndex } from './ProjectDetailsFormat';
import type { ProjectMedia, ProjectRecord } from '../data/projectTypes';
import type { CaseLayoutProps } from '../features/project-details/types';

interface FreeflowClip {
  key: string;
  media: ProjectMedia;
  label: string;
  description?: string;
}

const KIND_LABEL = 'Recorded flow';

const FREEFLOW_TRAIL = [
  { label: 'Request', cue: 'Client asks', chip: 'LINE OA intake', icon: 'lucide:inbox' },
  { label: 'Quote', cue: 'Scope + price', chip: 'Quotations', icon: 'lucide:file-text' },
  { label: 'Project', cue: 'Work runs', chip: 'Projects · schedule', icon: 'lucide:briefcase-business', focus: true },
  { label: 'Invoice', cue: 'Get paid', chip: 'Invoices', icon: 'lucide:receipt' },
  { label: 'Follow-up', cue: 'Close the loop', chip: 'Dashboard board', icon: 'lucide:bell-ring' },
];

const FREEFLOW_OWNED = [
  {
    title: 'Org-scoped API',
    body: 'REST and realtime stay in one organization; clients, jobs, files do not leak.',
    icon: 'lucide:building-2',
    focus: true,
  },
  {
    title: 'Ops records, not chat',
    body: 'Quotations, projects, invoices, appointments, templates, files: backend objects.',
    icon: 'lucide:database',
  },
  {
    title: 'LINE as intake',
    body: 'OA messages open or update a client record; the workspace runs the job.',
    icon: 'simple-icons:line',
  },
];

const FREEFLOW_ROUTES = [
  { method: 'POST', path: '/register', meaning: 'Create the account' },
  { method: 'GET', path: '/verify', meaning: 'Verify the email' },
  { method: 'POST', path: '/login', meaning: 'Sign in' },
  { method: 'POST', path: '/refresh', meaning: 'Renew the session' },
  { method: 'POST', path: '/forgot-password', meaning: 'Request a reset' },
  { method: 'POST', path: '/reset-password', meaning: 'Set a new password' },
];

const FREEFLOW_PATH = [
  { label: 'Surfaces', title: 'Workspace + LINE OA', body: 'Operators run jobs in the workspace; clients reach in through LINE.', icon: 'lucide:monitor-up' },
  { label: 'Write path', title: 'Go Fiber API', body: 'Scope to the org, persist ops records, publish what the workspace shows.', icon: 'lucide:server-cog', focus: true },
  { label: 'Stores', title: 'PostgreSQL + MinIO', body: 'Jobs and money stay relational; files and docs stay object storage.', icon: 'lucide:hard-drive' },
];

// Captions are paired with each record by its stable media path at the source
// index before anything is arranged, so no later layout step reads by index.
const pairClips = (project: ProjectRecord, gallery: ProjectMedia[]): FreeflowClip[] =>
  gallery.map((media, index) => ({
    key: typeof media === 'string' ? media : media.video || media.image || String(index),
    media,
    label: project.galleryLabels?.[index] || `Flow ${formatIndex(index + 1)}`,
    description: project.galleryDescriptions?.[index],
  }));

const FreeflowHead = ({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) => (
  <header className="case-freeflow-head" data-wave-follow>
    <p className="case-freeflow-head__eyebrow">{eyebrow}</p>
    <h2 id={id}>{title}</h2>
  </header>
);

const FreeflowClipFigure = ({
  project,
  clip,
  sizes,
  Heading = 'h3',
}: {
  project: ProjectRecord;
  clip: FreeflowClip;
  sizes: string;
  Heading?: 'h2' | 'h3';
}) => (
  <article className="case-freeflow-clip">
    <CaseMediaFrame
      media={clip.media}
      alt={`${project.title} — ${clip.label}`}
      sizes={sizes}
      className="case-media__frame--freeflow-clip"
      label={clip.label}
      kindLabel={KIND_LABEL}
    />
    <div className="case-freeflow-clip__copy" data-wave-follow>
      <Heading>{clip.label}</Heading>
      {clip.description && <p>{clip.description}</p>}
    </div>
  </article>
);

const FreeflowLead = ({ project, clip }: { project: ProjectRecord; clip?: FreeflowClip }) => {
  if (!clip) return null;

  return (
    <section
      className="case-freeflow-lead case-reveal"
      data-reveal="scroll"
      style={{ '--reveal-index': 0 }}
      aria-label={`${clip.label} recording`}
    >
      <FreeflowClipFigure project={project} clip={clip} sizes="(max-width: 900px) 100vw, 1100px" Heading="h2" />
    </section>
  );
};

const FreeflowTrail = ({ project, clips }: { project: ProjectRecord; clips: FreeflowClip[] }) => (
  <section
    className="case-freeflow-trail case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 1 }}
    aria-labelledby="freeflow-trail-title"
  >
    <FreeflowHead eyebrow="Signature · One trail" title="One ops trail from request to paid work." id="freeflow-trail-title" />
    <ol className="case-freeflow-trail__row" aria-label="FreeFlow ops trail">
      {FREEFLOW_TRAIL.map((station, index) => (
        <li
          className={station.focus ? 'case-freeflow-station case-freeflow-station--focus' : 'case-freeflow-station'}
          data-surface={station.focus ? 'paper' : 'base'}
          data-surface-sheen=""
          data-wave-follow
          key={station.label}
        >
          <span className="case-freeflow-station__index" data-surface-positioned="">{formatIndex(index + 1)}</span>
          <span className="case-freeflow-station__icon" data-surface="dark" aria-hidden="true">
            <Icon icon={station.icon} />
          </span>
          <h3>{station.label}</h3>
          <p>{station.cue}</p>
          <span className="case-freeflow-chip" data-surface="dark">{station.chip}</span>
        </li>
      ))}
    </ol>
    {clips.length > 0 && (
      <div className={`case-freeflow-trail__clips case-freeflow-trail__clips--${clips.length === 1 ? 'single' : 'row'}`}>
        {clips.map((clip) => (
          <FreeflowClipFigure
            project={project}
            clip={clip}
            sizes={clips.length === 1 ? '(max-width: 900px) 100vw, 1100px' : '(max-width: 900px) 100vw, 540px'}
            key={clip.key}
          />
        ))}
      </div>
    )}
  </section>
);

const FreeflowOwnership = () => (
  <section
    className="case-freeflow-owned case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 2 }}
    aria-labelledby="freeflow-owned-title"
  >
    <FreeflowHead eyebrow="Backend ownership" title="What I owned on the backend." id="freeflow-owned-title" />
    <p className="case-freeflow-owned__note" data-wave-follow>
      Team capstone. I own the Go write boundary and identity path — not every UI pixel.
    </p>
    <ul className="case-freeflow-owned__row" aria-label="Backend ownership">
      {FREEFLOW_OWNED.map((item) => (
        <li
          className={item.focus ? 'case-freeflow-owned__card case-freeflow-owned__card--focus' : 'case-freeflow-owned__card'}
          data-surface={item.focus ? 'paper' : 'base'}
          data-surface-anchor=""
          data-surface-sheen=""
          data-wave-follow
          key={item.title}
        >
          <span className="case-freeflow-owned__icon" data-surface="dark" aria-hidden="true">
            <Icon icon={item.icon} />
          </span>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </li>
      ))}
    </ul>
    <div className="case-freeflow-ledger" data-surface="base" data-surface-anchor="" data-surface-sheen="" data-wave-follow>
      <div className="case-freeflow-ledger__copy">
        <span>Identity lifecycle · Go Fiber + JWT</span>
        <strong>Every workspace action has a trusted user.</strong>
      </div>
      <ul aria-label="Auth service routes">
        {FREEFLOW_ROUTES.map((route) => (
          <li key={route.path}>
            <span className="case-freeflow-ledger__method" data-surface="dark">{route.method}</span>
            <code>{route.path}</code>
            <span className="case-freeflow-ledger__meaning">{route.meaning}</span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

const FreeflowWritePath = () => (
  <section
    className="case-freeflow-path case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 3 }}
    aria-labelledby="freeflow-path-title"
  >
    <FreeflowHead eyebrow="Write path" title="One ops write path." id="freeflow-path-title" />
    <ol className="case-freeflow-path__band" data-surface="base" data-surface-anchor="" data-surface-sheen="" aria-label="FreeFlow system map" data-wave-follow>
      {FREEFLOW_PATH.map((segment) => (
        <li
          className={segment.focus ? 'case-freeflow-segment case-freeflow-segment--focus' : 'case-freeflow-segment'}
          data-surface={segment.focus ? 'paper' : undefined}
          data-surface-anchor={segment.focus ? '' : undefined}
          data-surface-sheen={segment.focus ? '' : undefined}
          key={segment.title}
        >
          <span className="case-freeflow-segment__label">{segment.label}</span>
          <span className="case-freeflow-segment__icon" data-surface="dark" aria-hidden="true">
            <Icon icon={segment.icon} />
          </span>
          <h3>{segment.title}</h3>
          <p>{segment.body}</p>
        </li>
      ))}
    </ol>
    <p className="case-freeflow-path__boundary" data-wave-follow>
      <Icon icon="lucide:circle-check-big" aria-hidden="true" />
      <span>LINE OA is the only implemented intake channel; other channels stay roadmap — not a multi-chat product.</span>
    </p>
  </section>
);

const FreeflowLayout = ({ project, techItems, gallery, hasLive, hasRepo }: CaseLayoutProps) => {
  const [lead, ...rest] = pairClips(project, gallery);

  return (
    <>
      <CaseSplitHero hasLive={hasLive} hasRepo={hasRepo} project={project} alt={`${project.title} blue project dossier with its F logo, LINE client intake, quotations, invoices, document templates and schedule`} />

      <FreeflowLead project={project} clip={lead} />
      <FreeflowTrail project={project} clips={rest} />
      <FreeflowOwnership />
      <FreeflowWritePath />
      <StackBlock items={techItems} reveal="scroll" revealIndex={4} title="Built with" />
    </>
  );
};

export default FreeflowLayout;
