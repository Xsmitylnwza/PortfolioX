import { Icon } from '@iconify/react';
import { CaseSplitHero, StackBlock } from './ProjectDetailsShared';
import CaseMediaFrame from './ProjectDetailsMedia';
import { formatIndex } from './ProjectDetailsFormat';
import type { CaseLayoutProps } from '../features/project-details/types';
import type { ProjectRecord } from '../data/projectTypes';

/*
THESIS: Hermes is one routed personal system: a request enters a context, is routed, and returns as verified state.
SIGNATURE: Route and return — one drawn path of five stages, a return line looping back to the start, and the three ways a route starts drawn as broken, dotted and solid lines.
ORDER: swapped-split hero → demo runs → signature → contexts bento → failure/rule pair → built with.
MEDIA: cover, plus the owner-approved real-data demo clips in project.gallery (DESIGN.md A14, approved 2026-10-03). No other product screenshots are approved for public use.
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

type ContextMode = 'talk' | 'scheduled' | 'confirm';
const MODE_LABEL: Record<ContextMode, string> = { talk: 'Talk', scheduled: 'Scheduled', confirm: 'Confirm' };

// `tile` names the bento placement in ProjectDetailsHermes.css; order follows trigger breadth.
const CONTEXTS: { tile: string; icon: string; label: string; rule: string; chips: string[]; modes: ContextMode[]; focus?: boolean }[] = [
  { tile: 'daily', icon: 'lucide:sunrise', label: 'Daily operations', rule: 'Facts, gaps and proposals stay distinct.', chips: ['Pomodoro', 'Calendar'], modes: ['talk', 'scheduled', 'confirm'], focus: true },
  { tile: 'money', icon: 'lucide:wallet-cards', label: 'Money', rule: 'A reaction stages; confirmation commits.', chips: ['Finance database'], modes: ['talk', 'scheduled', 'confirm'] },
  { tile: 'wellbeing', icon: 'lucide:heart-pulse', label: 'Wellbeing', rule: 'Missing evidence stays missing.', chips: ['Linked records'], modes: ['talk', 'scheduled'] },
  { tile: 'incidents', icon: 'lucide:siren', label: 'Incidents', rule: 'Diagnosis starts from observable impact.', chips: ['Runtime', 'Logs'], modes: ['talk', 'scheduled'] },
  { tile: 'career', icon: 'lucide:briefcase-business', label: 'Career', rule: 'Applied needs submission evidence and read-back.', chips: ['Application tracker'], modes: ['talk', 'confirm'] },
  { tile: 'projects', icon: 'lucide:folder-kanban', label: 'Projects', rule: 'Exact project identity resolves before a write.', chips: ['Notion'], modes: ['talk', 'confirm'] },
  { tile: 'reading', icon: 'lucide:book-open-text', label: 'Reading', rule: 'A voluntary report precedes durable change.', chips: ['Notion'], modes: ['talk', 'confirm'] },
  { tile: 'alerts', icon: 'lucide:radio-tower', label: 'External alerts', rule: 'Read-only, source-linked, deduplicated.', chips: ['Public RSS'], modes: ['scheduled'] },
];

const HermesSectionHead = ({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) => (
  <header className="hermes-head" data-wave-follow>
    <p className="hermes-head__eyebrow">{eyebrow}</p>
    <h2 id={id}>{title}</h2>
  </header>
);

const HermesDemo = ({ project, gallery }: { project: ProjectRecord; gallery: CaseLayoutProps['gallery'] }) => {
  if (!gallery.length) return null;

  return (
    <section className="hermes-demo case-reveal" data-reveal="scroll" style={{ '--reveal-index': 0 }} aria-labelledby="hermes-demo-title">
      <HermesSectionHead eyebrow="Demo · Real runs" title="Three runs, straight from the Discord server." id="hermes-demo-title" />
      <p className="hermes-demo__note" data-wave-follow>Silent screen recordings with burned-in captions. Third-party details on the bank slip are blurred.</p>
      <ol className="hermes-demo__list" aria-label="Hermes demo runs">
        {gallery.map((media, index) => {
          const label = project.galleryLabels?.[index] || `Run ${formatIndex(index + 1)}`;
          return (
            <li className="hermes-demo__item" key={label}>
              <CaseMediaFrame
                media={media}
                alt={`${project.title} — ${label} demo`}
                sizes="(max-width: 900px) 100vw, 860px"
                className="case-media__frame--hermes-demo"
              />
              <div className="hermes-demo__copy" data-wave-follow>
                <span className="hermes-demo__num" aria-hidden="true">{formatIndex(index + 1)}</span>
                <span className="hermes-demo__label">{label}</span>
                <p>{project.galleryDescriptions?.[index]}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

const HermesSignature = () => (
  <section className="hermes-signature case-reveal" data-reveal="scroll" style={{ '--reveal-index': 1 }} aria-labelledby="hermes-signature-title">
    <HermesSectionHead eyebrow="Signature · Route and return" title="One request, one route — and a way back." id="hermes-signature-title" />

    <ol className="hermes-route" aria-label="Route of one request, from context to return">
      {ROUTE_STEPS.map((step, index) => (
        <li className={`hermes-stage hermes-stage--${index % 2 ? 'below' : 'above'}`} style={{ '--stage': index }} data-wave-follow key={step.stage}>
          <div className="hermes-stage__text">
            <span className="hermes-stage__label">{formatIndex(index + 1)} · {step.stage}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            <ul className="hermes-chips" aria-label={`${step.stage} details`}>
              {step.chips.map((chip) => <li key={chip}>{chip}</li>)}
            </ul>
          </div>
          <div className="hermes-stage__rail" aria-hidden="true">
            <span className="hermes-stage__node" data-surface="dark"><Icon icon={step.icon} /></span>
          </div>
          {index === 0 && <span className="hermes-stage__drop" aria-hidden="true"><Icon icon="lucide:arrow-right" /></span>}
        </li>
      ))}

      <li className="hermes-stage hermes-stage--above hermes-stage--return" style={{ '--stage': 4 }} data-wave-follow>
        <div className="hermes-stage__text">
          <span className="hermes-stage__label">{formatIndex(5)} · Return</span>
        </div>
        <div className="hermes-stage__rail" aria-hidden="true">
          <span className="hermes-stage__node" data-surface="paper"><Icon icon="lucide:corner-down-left" /></span>
        </div>
      </li>

      <li className="hermes-return" data-wave-follow>
        <div className="hermes-return__card" data-surface="paper" data-surface-sheen="" data-surface-anchor="">
          <div className="hermes-return__copy">
            <strong>Verified state returns to the room that owns it.</strong>
            <p>Explicit confirmation and read-back keep conversation separate from verified state.</p>
          </div>
          <ol aria-label="Return route">
            {RETURN_STEPS.map((step) => (
              <li key={step.label}>
                <Icon icon={step.icon} aria-hidden="true" />
                <span><small>{step.label}</small><strong>{step.value}</strong></span>
              </li>
            ))}
          </ol>
        </div>
      </li>

      <li className="hermes-starts" data-wave-follow>
        <ul aria-label="Ways a route starts">
          {TRIGGERS.map((trigger) => (
            <li className={`hermes-trigger hermes-trigger--${trigger.id}`} key={trigger.id}>
              <span className="hermes-trigger__head"><Icon icon={trigger.icon} aria-hidden="true" /><strong>{trigger.label}</strong></span>
              <span className="hermes-trigger__line" aria-hidden="true" />
              <span className="hermes-trigger__copy"><span>{trigger.body}</span><small>{trigger.line}</small></span>
            </li>
          ))}
        </ul>
      </li>
    </ol>
  </section>
);

const HermesContexts = ({ description }: { description: string }) => (
  <section className="hermes-contexts case-reveal" data-reveal="scroll" style={{ '--reveal-index': 2 }} aria-labelledby="hermes-contexts-title">
    <HermesSectionHead eyebrow="Contexts" title="Separate contexts, each with its own boundary." id="hermes-contexts-title" />
    <p className="hermes-contexts__intro" data-wave-follow>{description}</p>
    <ul className="hermes-contexts__bento" aria-label="Operational contexts">
      {CONTEXTS.map((context) => (
        <li
          className={`hermes-context hermes-context--${context.tile}`}
          data-surface={context.focus ? 'paper' : 'base'}
          data-surface-sheen="" data-surface-anchor=""
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
          <ul className="hermes-modes" aria-label={`${context.label} triggers`}>
            {context.modes.map((mode) => (
              <li className={`hermes-mode hermes-mode--${mode}`} key={mode}>
                <span className="hermes-mode__line" aria-hidden="true" />{MODE_LABEL[mode]}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  </section>
);

const HermesRule = () => (
  <section className="hermes-rule case-reveal" data-reveal="scroll" style={{ '--reveal-index': 3 }} aria-labelledby="hermes-rule-title">
    <HermesSectionHead eyebrow="Failure → rule" title="Scheduler health is not delivery proof." id="hermes-rule-title" />
    <div className="hermes-rule__pair">
      <article className="hermes-rule__tile" data-surface="base" data-surface-sheen="" data-surface-anchor="" data-wave-follow>
        <span className="hermes-rule__icon" data-surface="dark" aria-hidden="true"><Icon icon="lucide:circle-alert" /></span>
        <small>Observed failure</small>
        <h3>Process state looked healthy.</h3>
        <p>A cron job reported OK while the poller had not run from the correct path.</p>
      </article>
      <span className="hermes-rule__bridge" data-surface="dark" aria-hidden="true"><Icon icon="lucide:arrow-right" /></span>
      <article className="hermes-rule__tile" data-surface="paper" data-surface-sheen="" data-surface-anchor="" data-wave-follow>
        <span className="hermes-rule__icon" data-surface="dark" aria-hidden="true"><Icon icon="lucide:shield-check" /></span>
        <small>Durable rule</small>
        <h3>Verify the observable outcome.</h3>
        <p>Persistent state, downstream delivery, deduplication and read-back define done.</p>
      </article>
    </div>
  </section>
);

const HermesProjectDetails = ({ project, techItems, gallery, hasLive, hasRepo }: CaseLayoutProps) => (
  <>
    <CaseSplitHero
      hasLive={hasLive}
      hasRepo={hasRepo}
      project={project}
      alt="Gold Hermes Agent emblem connected to Discord conversations, Notion project records and Google Calendar in a conceptual command center"
      title={<>Hermes<br />Command Center</>}
      lede="One Discord server. Separate operational contexts. Verified actions stay tied to their source."
      mediaCaption="Conceptual cover · no private operational data"
      note={<p data-surface="dark" className="hermes-hero__private"><Icon icon="lucide:lock-keyhole" aria-hidden="true" /> Private system · no public live workspace or repository</p>}
    />

    <HermesDemo project={project} gallery={gallery} />
    <HermesSignature />
    <HermesContexts description={project.description} />
    <HermesRule />
    <StackBlock items={techItems} reveal="scroll" revealIndex={4} title="Built with" />
  </>
);

export default HermesProjectDetails;
