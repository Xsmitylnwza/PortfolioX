import { Icon } from '@iconify/react';
import CaseMediaFrame from './ProjectDetailsMedia';
import { CaseActions, StackBlock } from './ProjectDetailsShared';
import { formatIndex } from './ProjectDetailsFormat';
import type { CaseLayoutProps } from '../features/project-details/types';

/*
THESIS: Hermes is one routed personal system: a request enters a context, is routed, and returns as verified state.
SIGNATURE: Route and return — four forward steps, one paper read-back band, three ways a route starts.
ORDER: swapped-split hero → signature → contexts grid → failure/rule pair → built with.
MEDIA: cover only. Product screenshots are not approved for public use (DESIGN.md A14).
*/

const ROUTE_STEPS = [
  {
    stage: 'Context',
    icon: 'lucide:messages-square',
    title: 'Room or Forum post',
    body: 'Durable context is set where the conversation lives.',
    chips: ['Channels', 'Forum posts'],
  },
  {
    stage: 'Route',
    icon: 'lucide:route',
    title: 'Resolve room + entity',
    body: 'Hermes decides what context and skill may load.',
    chips: ['Room', 'Entity'],
  },
  {
    stage: 'Skill',
    icon: 'lucide:workflow',
    title: 'Load bounded skill',
    body: 'Bounded skills read from the system that owns the truth.',
    chips: ['Bounded', 'Approved'],
  },
  {
    stage: 'Source',
    icon: 'lucide:database',
    title: 'Authoritative source',
    body: 'The system that owns the record answers.',
    chips: ['Notion', 'Google Calendar', 'RSS'],
  },
];

const RETURN_STEPS = [
  { icon: 'lucide:shield-check', label: 'Evidence boundary', value: 'Separate fact · unknown · choice' },
  { icon: 'lucide:scan-search', label: 'Read back', value: 'Read the result back' },
  { icon: 'lucide:corner-down-left', label: 'Owning room', value: 'Represent where the outcome belongs' },
];

const TRIGGERS = [
  { id: 'talk', icon: 'lucide:message-circle', label: 'Talk', body: 'Conversation starts the route.', line: 'Broken line' },
  { id: 'scheduled', icon: 'lucide:clock-3', label: 'Scheduled', body: 'A schedule starts the route.', line: 'Dotted line' },
  { id: 'confirm', icon: 'lucide:mouse-pointer-click', label: 'Confirm', body: 'Explicit intent permits a write.', line: 'Solid line + gate' },
];

const CONTEXTS = [
  { icon: 'lucide:sunrise', label: 'Daily operations', rule: 'Facts, gaps and proposals stay distinct.', chips: ['Pomodoro', 'Calendar'], modes: 'Talk · Scheduled · Confirm', focus: true },
  { icon: 'lucide:heart-pulse', label: 'Wellbeing', rule: 'Missing evidence stays missing.', chips: ['Linked records'], modes: 'Talk · Scheduled' },
  { icon: 'lucide:book-open-text', label: 'Reading', rule: 'A voluntary report precedes durable change.', chips: ['Notion'], modes: 'Talk · Confirm' },
  { icon: 'lucide:folder-kanban', label: 'Projects', rule: 'Exact project identity resolves before a write.', chips: ['Notion'], modes: 'Talk · Confirm' },
  { icon: 'lucide:briefcase-business', label: 'Career', rule: 'Applied needs submission evidence and read-back.', chips: ['Application tracker'], modes: 'Talk · Confirm' },
  { icon: 'lucide:wallet-cards', label: 'Money', rule: 'A reaction stages; confirmation commits.', chips: ['Finance database'], modes: 'Talk · Scheduled · Confirm' },
  { icon: 'lucide:siren', label: 'Incidents', rule: 'Diagnosis starts from observable impact.', chips: ['Runtime', 'Logs'], modes: 'Talk · Scheduled' },
  { icon: 'lucide:radio-tower', label: 'External alerts', rule: 'Read-only, source-linked, deduplicated.', chips: ['Public RSS'], modes: 'Scheduled' },
];

const HermesSectionHead = ({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) => (
  <header className="hermes-head" data-wave-follow>
    <p className="hermes-head__eyebrow">{eyebrow}</p>
    <h2 id={id}>{title}</h2>
  </header>
);

const HermesSignature = () => (
  <section className="hermes-signature case-reveal" data-reveal="scroll" style={{ '--reveal-index': 0 }} aria-labelledby="hermes-signature-title">
    <HermesSectionHead eyebrow="Signature · Route and return" title="One request, one route — and a way back." id="hermes-signature-title" />

    <ol className="hermes-signature__row" aria-label="Forward route of one request">
      {ROUTE_STEPS.map((step, index) => (
        <li className="hermes-step" data-surface="base" data-surface-sheen="" data-wave-follow key={step.stage}>
          <span className="hermes-step__stage">{formatIndex(index + 1)} · {step.stage}</span>
          <span className="hermes-step__icon" data-surface="dark" aria-hidden="true">
            <Icon icon={step.icon} />
          </span>
          <h3>{step.title}</h3>
          <p>{step.body}</p>
          <ul className="hermes-chips" aria-label={`${step.stage} details`}>
            {step.chips.map((chip) => <li data-surface="dark" key={chip}>{chip}</li>)}
          </ul>
        </li>
      ))}
    </ol>

    <div className="hermes-return" data-surface="paper" data-surface-sheen="" data-wave-follow>
      <div className="hermes-return__copy">
        <span>{formatIndex(5)} · Return</span>
        <strong>Verified state returns to the room that owns it.</strong>
        <p>Explicit confirmation and read-back keep conversation separate from verified state.</p>
      </div>
      <ol aria-label="Return route">
        {RETURN_STEPS.map((step) => (
          <li data-surface="dark" key={step.label}>
            <Icon icon={step.icon} aria-hidden="true" />
            <span><small>{step.label}</small><strong>{step.value}</strong></span>
          </li>
        ))}
      </ol>
    </div>

    <ul className="hermes-triggers" aria-label="Ways a route starts">
      {TRIGGERS.map((trigger) => (
        <li className={`hermes-trigger hermes-trigger--${trigger.id}`} data-surface="base" data-wave-follow key={trigger.id}>
          <span className="hermes-trigger__line" aria-hidden="true" />
          <Icon icon={trigger.icon} aria-hidden="true" />
          <span className="hermes-trigger__copy">
            <strong>{trigger.label}</strong>
            <span>{trigger.body}</span>
          </span>
          <small>{trigger.line}</small>
        </li>
      ))}
    </ul>
  </section>
);

const HermesContexts = ({ description }: { description: string }) => (
  <section className="hermes-contexts case-reveal" data-reveal="scroll" style={{ '--reveal-index': 1 }} aria-labelledby="hermes-contexts-title">
    <HermesSectionHead eyebrow="Contexts" title="Separate contexts, each with its own boundary." id="hermes-contexts-title" />
    <p className="hermes-contexts__intro" data-wave-follow>{description}</p>
    <ul className="hermes-contexts__grid" aria-label="Operational contexts">
      {CONTEXTS.map((context) => (
        <li
          className="hermes-context"
          data-surface={context.focus ? 'paper' : 'base'}
          data-surface-sheen=""
          data-wave-follow
          key={context.label}
        >
          <span className="hermes-context__icon" data-surface="dark" aria-hidden="true">
            <Icon icon={context.icon} />
          </span>
          <h3>{context.label}</h3>
          <p>{context.rule}</p>
          <ul className="hermes-chips" aria-label={`${context.label} sources`}>
            {context.chips.map((chip) => <li data-surface="dark" key={chip}>{chip}</li>)}
          </ul>
          <small>{context.modes}</small>
        </li>
      ))}
    </ul>
  </section>
);

const HermesRule = () => (
  <section className="hermes-rule case-reveal" data-reveal="scroll" style={{ '--reveal-index': 2 }} aria-labelledby="hermes-rule-title">
    <HermesSectionHead eyebrow="Failure → rule" title="Scheduler health is not delivery proof." id="hermes-rule-title" />
    <div className="hermes-rule__pair">
      <article className="hermes-rule__tile" data-surface="base" data-surface-sheen="" data-wave-follow>
        <span className="hermes-rule__icon" data-surface="dark" aria-hidden="true"><Icon icon="lucide:circle-alert" /></span>
        <small>Observed failure</small>
        <h3>Process state looked healthy.</h3>
        <p>A cron job reported OK while the poller had not run from the correct path.</p>
      </article>
      <span className="hermes-rule__bridge" data-surface="dark" aria-hidden="true"><Icon icon="lucide:arrow-right" /></span>
      <article className="hermes-rule__tile" data-surface="paper" data-surface-sheen="" data-wave-follow>
        <span className="hermes-rule__icon" data-surface="dark" aria-hidden="true"><Icon icon="lucide:shield-check" /></span>
        <small>Durable rule</small>
        <h3>Verify the observable outcome.</h3>
        <p>Persistent state, downstream delivery, deduplication and read-back define done.</p>
      </article>
    </div>
  </section>
);

const HermesProjectDetails = ({ project, techItems, hasLive, hasRepo }: CaseLayoutProps) => (
  <>
    <header className="hermes-hero case-reveal" data-reveal="mount" style={{ '--reveal-index': 1 }}>
      <div className="hermes-hero__media">
        <CaseMediaFrame
          media={project.heroMedia}
          alt="Gold Hermes Agent emblem connected to Discord conversations, Notion project records and Google Calendar in a conceptual command center"
          cover
          eager
          sizes="(max-width: 900px) 100vw, 760px"
          className="case-media__frame--hero"
          label="Conceptual cover"
          kindLabel="Conceptual illustration"
          transitionTarget
        />
      </div>
      <div className="hermes-hero__copy" data-wave-follow>
        <p className="case-kicker">{project.category}</p>
        <h1 id="case-title">Hermes<br />Command Center</h1>
        <p className="case-lede">One Discord server. Separate operational contexts. Verified actions stay tied to their source.</p>
        <p className="case-role">{project.role}</p>
        <p data-surface="dark" className="hermes-hero__private"><Icon icon="lucide:lock-keyhole" aria-hidden="true" /> Private system · no public live workspace or repository</p>
        <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
      </div>
    </header>

    <HermesSignature />
    <HermesContexts description={project.description} />
    <HermesRule />
    <StackBlock items={techItems} reveal="scroll" revealIndex={3} title="Built with" />
  </>
);

export default HermesProjectDetails;
