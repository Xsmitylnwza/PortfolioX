import { Icon } from '@iconify/react';
import CaseMediaFrame from './ProjectDetailsMedia';
import { CaseSplitHero, StackBlock } from './ProjectDetailsShared';
import VibeLiveSwitch from './ProjectDetailsVibeLive';
import { formatIndex } from './ProjectDetailsFormat';
import { VIBE_KIND_LABEL, VIBE_DEMO_NOTE, VIBE_STEPS, VIBE_EVIDENCE, VIBE_EVIDENCE_SOURCE, VIBE_SYSTEM } from './ProjectDetailsVibeData';
import type { CaseLayoutProps } from '../features/project-details/types';
import type { ProjectMedia, ProjectRecord } from '../data/projectTypes';

const VibeHead = ({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) => (
  <header className="case-vibe-head" data-wave-follow>
    <p className="case-vibe-head__eyebrow">{eyebrow}</p>
    <h2 id={id}>{title}</h2>
  </header>
);

const VibeSwitchProof = ({ project, media }: { project: ProjectRecord; media?: ProjectMedia }) => {
  if (!media) return null;
  const label = project.galleryLabels?.[0] || 'Switch apps, status follows';
  return (
    <section className="case-vibe-proof case-reveal" data-reveal="scroll" style={{ '--reveal-index': 0 }} aria-labelledby="vibe-proof-title">
      <CaseMediaFrame
        media={media}
        alt={`${project.title} — ${label} (fictional demo)`}
        sizes="(max-width: 900px) 100vw, 760px"
        className="case-media__frame--vibe-proof"
        label={label}
        kindLabel={VIBE_KIND_LABEL}
      />
      <header className="case-vibe-proof__copy" data-wave-follow>
        <p className="case-vibe-head__eyebrow">Proof 01 · Switch</p>
        <h2 id="vibe-proof-title">The same switch, in a Discord window.</h2>
        <p>{project.galleryDescriptions?.[0]}</p>
        <p className="case-vibe-note">{VIBE_DEMO_NOTE}</p>
      </header>
    </section>
  );
};

const VibeSteps = () => (
  <section className="case-vibe-steps case-reveal" data-reveal="scroll" style={{ '--reveal-index': 1 }} aria-labelledby="vibe-steps-title">
    <VibeHead eyebrow="The rule" title="Pair once. The foreground decides." id="vibe-steps-title" />
    <ol className="case-vibe-steps__row" aria-label="How a status is chosen">
      {VIBE_STEPS.map((item, index) => (
        <li
          className={item.step === 'Choose' ? 'case-vibe-step case-vibe-step--focus' : 'case-vibe-step'}
          data-surface={item.step === 'Choose' ? 'paper' : 'base'}
          data-surface-sheen=""
          data-wave-follow
          key={item.step}
        >
          <span className="case-vibe-step__index" data-surface-positioned="">{formatIndex(index + 1)} · {item.step}</span>
          <Icon data-surface-positioned="" className="case-vibe-step__icon" icon={item.icon} aria-hidden="true" />
          <div className="case-vibe-step__copy">
            <span>{item.from}</span>
            <Icon icon="lucide:arrow-right" aria-hidden="true" />
            <strong>{item.to}</strong>
          </div>
        </li>
      ))}
    </ol>
  </section>
);

const VibeStudioProof = ({ project, gallery }: { project: ProjectRecord; gallery: ProjectMedia[] }) => {
  const items = [1, 2].flatMap((index) => (gallery[index] ? [{ index, media: gallery[index], label: project.galleryLabels?.[index] || `Step ${index}`, body: project.galleryDescriptions?.[index] }] : []));
  if (!items.length) return null;
  return (
    <section className="case-vibe-studio case-reveal" data-reveal="scroll" style={{ '--reveal-index': 2 }} aria-labelledby="vibe-studio-title">
      <VibeHead eyebrow="Studio · Prototype" title="Scenes and pairs, edited in one place." id="vibe-studio-title" />
      <p className="case-vibe-note" data-wave-follow>{VIBE_DEMO_NOTE}</p>
      <div className="case-vibe-studio__grid">
        {items.map((item) => (
          <article className="case-vibe-studio__card" key={item.index}>
            <CaseMediaFrame
              media={item.media}
              alt={`${project.title} — ${item.label} (fictional demo)`}
              sizes="(max-width: 900px) 100vw, 560px"
              className="case-media__frame--vibe-studio"
              label={item.label}
              kindLabel={VIBE_KIND_LABEL}
            />
            <div className="case-vibe-studio__copy" data-wave-follow>
              <span>Step {formatIndex(item.index + 1)}</span>
              <h3>{item.label}</h3>
              <p>{item.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const VibeEvidence = () => (
  <section className="case-vibe-evidence case-reveal" data-reveal="scroll" style={{ '--reveal-index': 3 }} aria-labelledby="vibe-evidence-title">
    <VibeHead eyebrow="Evidence · Measured" title="Quieter at idle, faster to follow." id="vibe-evidence-title" />
    <ul className="case-vibe-evidence__row" aria-label="Measured results, before and after the detector rewrite">
      {VIBE_EVIDENCE.map((item) => (
        <li className="case-vibe-metric" data-surface="base" data-surface-sheen="" data-wave-follow key={item.metric}>
          <span className="case-vibe-metric__label">{item.metric}</span>
          <p className="case-vibe-metric__value">
            <s>{item.from}</s>
            <Icon icon="lucide:arrow-right" aria-hidden="true" />
            <strong>{item.to}</strong>
          </p>
          <span className="case-vibe-metric__unit">{item.unit}</span>
          <span className="case-vibe-metric__note">{item.note}</span>
        </li>
      ))}
    </ul>
    <p className="case-vibe-note" data-wave-follow>{VIBE_EVIDENCE_SOURCE}</p>
    <p className="case-vibe-evidence__process" data-wave-follow>
      Built with multi-agent review and implementation under the owner's direction; the suite runs 200 passing tests (npm test).
    </p>
  </section>
);

const VibeSystem = () => (
  <section className="case-vibe-system case-reveal" data-reveal="scroll" style={{ '--reveal-index': 4 }} aria-labelledby="vibe-system-title">
    <VibeHead eyebrow="System" title="Local from detector to Discord." id="vibe-system-title" />
    <ol className="case-vibe-nodes" aria-label="Vibe Studio architecture">
      {VIBE_SYSTEM.map((node) => (
        <li className="case-vibe-node" data-surface="base" data-surface-sheen="" data-wave-follow key={node.stage}>
          <span className="case-vibe-node__stage">{node.stage}</span>
          <span className="case-vibe-node__icon" data-surface="dark" aria-hidden="true"><Icon icon={node.icon} /></span>
          <h3>{node.title}</h3>
          <ul className="case-vibe-chips" aria-label={`${node.title} implementation details`}>
            {node.items.map((item) => <li data-surface="dark" key={item}>{item}</li>)}
          </ul>
        </li>
      ))}
    </ol>
  </section>
);

const VibeLayout = ({ project, techItems, gallery, hasLive, hasRepo }: CaseLayoutProps) => (
  <>
    <CaseSplitHero hasLive={hasLive} hasRepo={hasRepo} project={project} alt={`${project.title} poster: a tilted Discord profile card reading Playing Design, set from the Figma window behind it`} />

    <VibeLiveSwitch />
    <VibeSwitchProof project={project} media={gallery[0]} />
    <VibeSteps />
    <VibeStudioProof project={project} gallery={gallery} />
    <VibeEvidence />
    <VibeSystem />
    <StackBlock items={techItems} reveal="scroll" revealIndex={1} title="Built with" />
  </>
);

export default VibeLayout;
