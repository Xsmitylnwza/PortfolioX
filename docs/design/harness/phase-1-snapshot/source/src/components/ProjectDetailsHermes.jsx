import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import TechStackList from './TechStackList';

/*
THESIS: Hermes is one routed personal system, not a dashboard of disconnected cards.
HOST WORLD: PortfolioX red room, editorial white type, restrained monochrome glass.
STORY: Choose a context and trigger; follow one labelled route from Discord to the owning source and back.
FIRST VIEWPORT: Restrained project identity beside the conceptual system cover; the command map follows.
FORM: An asymmetric command switchboard makes routing, authority, and observable return legible.
*/

const EVENT_MODES = [
  {
    id: 'talk',
    label: 'Talk',
    icon: 'lucide:message-circle',
    pathLabel: 'Broken line · conversation starts the route',
    entryVerb: 'ask in context',
    sourceVerb: 'read current evidence',
    returnVerb: 'return evidence',
  },
  {
    id: 'scheduled',
    label: 'Scheduled',
    icon: 'lucide:clock-3',
    pathLabel: 'Dotted line · Bangkok schedule starts the route',
    entryVerb: 'start on schedule',
    sourceVerb: 'poll and reconcile',
    returnVerb: 'check delivery',
  },
  {
    id: 'confirm',
    label: 'Confirm',
    icon: 'lucide:mouse-pointer-click',
    pathLabel: 'Solid line + gate · explicit intent permits a write',
    entryVerb: 'open write gate',
    sourceVerb: 'explicitly update',
    returnVerb: 'read back',
  },
];

const DOMAIN_ROUTES = {
  daily: {
    label: 'Daily Ops',
    shortLabel: 'Daily',
    icon: 'lucide:sunrise',
    skillIcon: 'lucide:list-checks',
    sourceIcon: 'lucide:calendar-range',
    modes: ['talk', 'scheduled', 'confirm'],
    room: 'Daily Ops',
    source: 'Pomodoro + Calendar',
    boundary: 'Facts, gaps, and proposed changes stay distinct.',
    proof: 'Daily checkpoints and midnight coordination follow Bangkok time and return to Daily Ops.',
    traces: {
      talk: ['Daily room', 'Daily skill', 'Today’s evidence', 'Concise plan'],
      scheduled: ['Bangkok cron', 'Daily workflow', 'Plan + calendar', 'Daily delivery'],
      confirm: ['Explicit replan', 'Approved helper', 'Owning system', 'Read-back'],
    },
  },
  wellbeing: {
    label: 'Wellbeing',
    shortLabel: 'Health',
    icon: 'lucide:heart-pulse',
    skillIcon: 'lucide:activity',
    sourceIcon: 'lucide:database',
    modes: ['talk', 'scheduled'],
    room: 'Health',
    source: 'Rhythm + linked records',
    boundary: 'Missing evidence stays missing; guidance never becomes diagnosis.',
    proof: 'Health and routine summaries preserve missing evidence and never turn guidance into diagnosis.',
    traces: {
      talk: ['Health room', 'Evidence reader', 'Verified snapshot', 'Bounded guidance'],
      scheduled: ['Routine schedule', 'Health reader', 'Current evidence', 'Owning room'],
    },
  },
  reading: {
    label: 'Reading',
    shortLabel: 'Reading',
    icon: 'lucide:book-open-text',
    skillIcon: 'lucide:book-marked',
    sourceIcon: 'lucide:notebook-tabs',
    modes: ['talk', 'confirm'],
    room: 'Reading Forum',
    source: 'Notion + Rhythm',
    boundary: 'A voluntary report is required before durable knowledge changes.',
    proof: 'Each book keeps its own Forum context; updates wait for a voluntary report and approved flow.',
    traces: {
      talk: ['Book post', 'Reading skill', 'Bound record', 'Resume context'],
      confirm: ['Voluntary report', 'Approved update', 'Reading record', 'Read-back'],
    },
  },
  projects: {
    label: 'Projects',
    shortLabel: 'Projects',
    icon: 'lucide:folder-kanban',
    skillIcon: 'lucide:workflow',
    sourceIcon: 'lucide:notebook-tabs',
    modes: ['talk', 'confirm'],
    room: 'Project Forum',
    source: 'Notion project + tasks',
    boundary: 'The exact project and task identity must resolve before a write.',
    proof: 'One Forum post resolves to one exact project and its task rows before any answer or update.',
    traces: {
      talk: ['Project post', 'Identity resolver', 'Bound project', 'Status + blocker'],
      confirm: ['Exact task', 'Unique identity', 'Notion update', 'Read-back'],
    },
  },
  career: {
    label: 'Career',
    shortLabel: 'Career',
    icon: 'lucide:briefcase-business',
    skillIcon: 'lucide:badge-check',
    sourceIcon: 'lucide:rows-3',
    modes: ['talk', 'confirm'],
    room: 'Career Forum',
    source: 'Application tracker',
    boundary: 'Applied requires direct submission evidence and post-write read-back.',
    proof: 'Applied status requires direct submission evidence, explicit authority, and post-write read-back.',
    traces: {
      talk: ['Role post', 'Record resolver', 'Evidence gap', 'Next decision'],
      confirm: ['Submission proof', 'Evidence gate', 'Tracker update', 'Verified state'],
    },
  },
  money: {
    label: 'Money',
    shortLabel: 'Money',
    icon: 'lucide:wallet-cards',
    skillIcon: 'lucide:scan-search',
    sourceIcon: 'lucide:database-zap',
    modes: ['talk', 'scheduled', 'confirm'],
    room: 'Money Admin',
    source: 'Finance database',
    boundary: 'A reaction stages the choice; confirmation controls the commit.',
    proof: 'Notification noise is filtered before review; no real transaction becomes an explicit empty state.',
    traces: {
      talk: ['Money room', 'Finance skill', 'Current records', 'Review state'],
      scheduled: ['Nightly job', 'Noise filter', 'Review set', 'Deliver / empty'],
      confirm: ['Staged choice', 'Commit boundary', 'Finance record', 'Database check'],
    },
  },
  incidents: {
    label: 'Incidents',
    shortLabel: 'Incidents',
    icon: 'lucide:siren',
    skillIcon: 'lucide:stethoscope',
    sourceIcon: 'lucide:scroll-text',
    modes: ['talk', 'scheduled'],
    room: 'System Ops',
    source: 'Runtime + logs',
    boundary: 'Diagnosis starts from observable impact, correlation, and logs.',
    proof: 'Operational faults are scoped by impact, correlation, and observable evidence before diagnosis.',
    traces: {
      talk: ['Incident thread', 'Ops reader', 'Runtime evidence', 'Scoped diagnosis'],
      scheduled: ['Watcher event', 'Evidence check', 'Incident context', 'Owning room'],
    },
  },
  alerts: {
    label: 'External Alerts',
    shortLabel: 'Alerts',
    icon: 'lucide:radio-tower',
    skillIcon: 'lucide:radar',
    sourceIcon: 'lucide:rss',
    modes: ['scheduled'],
    room: 'System Alerts',
    source: 'Public RSS + watcher state',
    boundary: 'Monitoring stays read-only, source-linked, and deduplicated.',
    proof: 'Public-source monitoring stays read-only, deduplicated, and linked back to source evidence.',
    traces: {
      scheduled: ['15-minute poll', 'Validate + dedupe', 'Classify post', 'Actionable alert'],
    },
  },
};

const HermesSectionHead = ({ label, title, copy, id }) => (
  <header className="case-story-head hermes-section-head" data-wave-follow>
    <p>{label}</p>
    <h2 id={id}>{title}</h2>
    {copy && <span>{copy}</span>}
  </header>
);

const HermesCommandMap = () => {
  const [selection, setSelection] = useState({ domainId: 'daily', mode: 'talk' });
  const { domainId, mode } = selection;
  const domain = DOMAIN_ROUTES[domainId];
  const modeMeta = EVENT_MODES.find((item) => item.id === mode);
  const availableModes = useMemo(() => new Set(domain.modes), [domain]);
  const trace = domain.traces[mode];

  const routeJunctions = [
    {
      id: 'router',
      label: 'Context router',
      value: trace[0],
      icon: 'lucide:route',
      edge: 'resolve room + entity',
    },
    {
      id: 'skill',
      label: 'Bound skill',
      value: trace[1],
      icon: domain.skillIcon,
      edge: 'load bounded skill',
    },
  ];

  const returnJunctions = [
    {
      id: 'boundary',
      label: 'Evidence boundary',
      value: domain.boundary,
      icon: 'lucide:shield-check',
      edge: modeMeta.returnVerb,
    },
    {
      id: 'result',
      label: 'Observable result',
      value: trace[3],
      icon: 'lucide:scan-search',
      edge: 'separate fact · unknown · choice',
    },
    {
      id: 'room',
      label: 'Owning room',
      value: domain.room,
      icon: domain.icon,
      edge: 'represent in owning room',
    },
  ];

  const selectDomain = (nextId) => {
    const next = DOMAIN_ROUTES[nextId];
    setSelection((current) => ({
      domainId: nextId,
      mode: next.modes.includes(current.mode) ? current.mode : next.modes[0],
    }));
  };

  const selectMode = (nextMode) => {
    setSelection((current) => (
      DOMAIN_ROUTES[current.domainId].modes.includes(nextMode)
        ? { ...current, mode: nextMode }
        : current
    ));
  };

  const statusSummary = `${domain.label}, ${modeMeta.label}. ${modeMeta.entryVerb} in ${domain.room}; Hermes resolves ${trace[0]}, loads ${trace[1]}, ${modeMeta.sourceVerb} in ${domain.source}, then ${modeMeta.returnVerb} and represents ${trace[3]} in ${domain.room}.`;

  return (
    <section className="hermes-map" aria-labelledby="hermes-map-title">
      <HermesSectionHead
        id="hermes-map-title"
        label="Routing switchboard"
        title="How one request moves through Hermes."
        copy="Select a context and trigger. Every connector names the operation; the double-bordered terminal marks the system that owns the record."
      />

      <figure
        className={`hermes-switchboard is-mode-${mode}`}
        aria-describedby="hermes-map-caption"
        data-domain={domainId}
        data-mode={mode}
        data-wave-follow
      >
        <figcaption className="hermes-visually-hidden">
          The selected context enters through Discord, resolves its route and bounded skill, reaches the authoritative source, crosses an evidence boundary, and returns to the owning Discord room.
        </figcaption>

        <div className="hermes-switchboard__topbar">
          <div className="hermes-mode-dock" aria-label="Choose how this flow starts">
            {EVENT_MODES.map((item) => {
              const supported = availableModes.has(item.id);
              return (
                <button
                  type="button"
                  key={item.id}
                  disabled={!supported}
                  aria-pressed={mode === item.id}
                  aria-controls="hermes-route-list hermes-map-caption hermes-map-status"
                  data-mode={item.id}
                  title={supported ? `${item.label} mode` : `${item.label} is not supported for ${domain.label}`}
                  onClick={() => supported && selectMode(item.id)}
                >
                  <span className="hermes-mode-dock__line" aria-hidden="true" />
                  <Icon icon={item.icon} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          <p className="hermes-switchboard__legend">
            <span className="hermes-switchboard__legend-line" aria-hidden="true" />
            {modeMeta.pathLabel}
          </p>
        </div>

        <div className="hermes-switchboard__stage">
          <nav className="hermes-patchbay" aria-label="Choose an operational context">
            <span className="hermes-patchbay__title">Context patchbay</span>
            <div className="hermes-patchbay__ports">
              {Object.entries(DOMAIN_ROUTES).map(([id, item]) => (
                <button
                  type="button"
                  className="hermes-patchbay__port"
                  key={id}
                  aria-pressed={domainId === id}
                  aria-controls="hermes-route-list hermes-map-caption hermes-map-status"
                  aria-label={item.label}
                  data-domain={id}
                  onClick={() => selectDomain(id)}
                >
                  <span className="hermes-patchbay__socket">
                    <Icon icon={item.icon} aria-hidden="true" />
                  </span>
                  <span>{item.shortLabel}</span>
                </button>
              ))}
            </div>
          </nav>

          <div className="hermes-switchboard__field">
            <svg
              className="hermes-switchboard__geometry"
              viewBox="0 0 920 520"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <marker id="hermes-forward-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path className="hermes-switchboard__arrow" d="M0 0 L8 4 L0 8 Z" />
                </marker>
                <marker id="hermes-return-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path className="hermes-switchboard__arrow" d="M0 0 L8 4 L0 8 Z" />
                </marker>
              </defs>
              <path className="hermes-switchboard__forward-base" d="M0 198 H688" />
              <path className="hermes-switchboard__forward-active" d="M0 198 H688" markerEnd="url(#hermes-forward-arrow)" />
              <path className="hermes-switchboard__signal" d="M0 198 H688" />
              <path className="hermes-switchboard__return-line hermes-switchboard__return-line--outer" d="M862 250 V366.6 H147.2 V288" markerEnd="url(#hermes-return-arrow)" />
              <path className="hermes-switchboard__return-line hermes-switchboard__return-line--inner" d="M850 250 V376 H158 V288" />
              <rect className="hermes-switchboard__gate" x="602" y="192" width="12" height="12" rx="1" />
            </svg>

            <article className="hermes-core hermes-liquid-glass">
              <span className="hermes-switchboard__inbound-edge">{modeMeta.entryVerb}</span>
              <span className="hermes-core__discord"><Icon icon="simple-icons:discord" aria-hidden="true" /></span>
              <small>Discord · Hermes Gateway</small>
              <strong>Command surface</strong>
              <p>Conversation enters here. The route decides what context and skill are allowed to load.</p>
            </article>

            <ol id="hermes-route-list" className="hermes-route" aria-label={`${domain.label} ${modeMeta.label} forward route`}>
              {routeJunctions.map((step, index) => (
                <li className={`hermes-route__junction hermes-route__junction--${step.id}`} key={step.id}>
                  <span className="hermes-route__edge">{index === 0 ? 'receive event' : step.edge}</span>
                  <span className="hermes-route__mark"><Icon icon={step.icon} aria-hidden="true" /></span>
                  <span className="hermes-route__copy"><small>{step.label}</small><strong>{step.value}</strong></span>
                </li>
              ))}
            </ol>

            <article className="hermes-source hermes-liquid-glass">
              <span className="hermes-source__icon"><Icon icon={domain.sourceIcon} aria-hidden="true" /></span>
              <small>Authoritative source</small>
              <strong>{domain.source}</strong>
              <p>{trace[2]}</p>
              <span className="hermes-source__operation">{modeMeta.sourceVerb}</span>
            </article>

            <ol className="hermes-return" aria-label="Evidence return route">
              {returnJunctions.map((step) => (
                <li className={`hermes-return__junction hermes-return__junction--${step.id}`} key={step.id}>
                  <span className="hermes-return__edge">{step.edge}</span>
                  <span className="hermes-return__mark"><Icon icon={step.icon} aria-hidden="true" /></span>
                  <span className="hermes-return__copy"><small>{step.label}</small><strong>{step.value}</strong></span>
                </li>
              ))}
            </ol>

            <aside id="hermes-map-caption" className="hermes-map__caption hermes-liquid-glass">
              <span className="hermes-map__caption-meta">
                <Icon icon={domain.icon} aria-hidden="true" />
                {domain.label}
                <span aria-hidden="true">·</span>
                {modeMeta.label}
              </span>
              <strong>{domain.proof}</strong>
              <span className="hermes-map__caption-boundary"><Icon icon="lucide:shield-check" aria-hidden="true" /> Important writes require explicit intent and read-back.</span>
            </aside>
          </div>
        </div>
        <p id="hermes-map-status" className="hermes-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {statusSummary}
        </p>
      </figure>
    </section>
  );
};

const HermesProjectDetails = ({ project, techItems }) => (
  <>
    <header className="hermes-hero case-reveal" data-reveal="mount" style={{ '--reveal-index': 1 }}>
      <div className="hermes-hero__copy" data-wave-follow>
        <p className="case-kicker">{project.category}</p>
        <h1 id="case-title">Hermes<br />Command Center</h1>
        <p className="hermes-hero__thesis">One Discord server. Separate operational contexts. Verified actions stay tied to their source.</p>
        <p className="case-role">{project.role}</p>
        <p className="case-lede">{project.description}</p>
        <p className="hermes-private"><Icon icon="lucide:lock-keyhole" aria-hidden="true" /> Private system · no public live workspace or repository</p>
      </div>
      <figure className={`hermes-hero__poster${project.heroMedia.kind === 'cover' ? ' hermes-hero__poster--cover' : ''}`} data-wave-follow data-poster-transition-target="">
        <img
          data-wave-media
          src={project.heroMedia.image}
          alt="Gold Hermes Agent emblem connected to Discord conversations, Notion project records and Google Calendar in a conceptual command center"
        />
        <figcaption>Conceptual cover · no private operational data</figcaption>
      </figure>
    </header>

    <HermesCommandMap />

    <section className="hermes-incident" aria-labelledby="hermes-incident-title">
      <HermesSectionHead
        id="hermes-incident-title"
        label="Failure → rule"
        title="Scheduler health is not delivery proof."
        copy="A cron job once reported OK while the intended poller had not run from the correct path. That failure changed the acceptance boundary."
      />
      <div className="hermes-incident__story">
        <div className="hermes-incident__motion hermes-incident__motion--failure" data-wave-follow>
          <article className="hermes-incident__node hermes-liquid-glass">
            <Icon icon="lucide:circle-alert" aria-hidden="true" />
            <span><small>Observed failure</small><strong>Process state looked healthy.</strong></span>
            <p>The result people expected had not reached its owning room.</p>
          </article>
        </div>
        <div className="hermes-incident__bridge" data-wave-follow aria-hidden="true">
          <Icon icon="lucide:arrow-down-right" />
        </div>
        <div className="hermes-incident__motion hermes-incident__motion--rule" data-wave-follow>
          <article className="hermes-incident__node hermes-liquid-glass">
            <Icon icon="lucide:shield-check" aria-hidden="true" />
            <span><small>Durable rule</small><strong>Verify the observable outcome.</strong></span>
            <p>Persistent state, downstream delivery, deduplication, and read-back now define done.</p>
          </article>
        </div>
      </div>
    </section>

    <section className="hermes-stack" aria-labelledby="hermes-stack-title">
      <HermesSectionHead
        id="hermes-stack-title"
        label="System stack"
        title="Tools along the command path"
        copy="The work is the information architecture, policies, schedules, integrations, and verification rules assembled around Hermes."
      />
      <TechStackList items={techItems} title="Built across the command path" variant="layer" waveFollow />
    </section>
  </>
);

export default HermesProjectDetails;
