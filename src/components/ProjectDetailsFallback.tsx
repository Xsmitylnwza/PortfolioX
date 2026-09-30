import CaseMediaFrame from './ProjectDetailsMedia';
import { isGifSource, isVideoSource } from './ProjectDetailsMediaSource';
import { CaseActions, StackBlock } from './ProjectDetailsShared';
import { formatIndex } from './ProjectDetailsFormat';
import { CaseFacts, CaseBlock, CaseHeroMedia, CaseGallery, CaseCode } from './ProjectDetailsPrimitives';
import type { CaseLayoutProps } from '../features/project-details/types';
import type { ProjectFlowStep, ProjectWhyItem } from '../data/projectTypes';

/* ---------- Layout compositions ---------- */

const CinemaLayout = ({ project, decision, techItems, gallery, hasLive, hasRepo }: CaseLayoutProps) => (
  <>
    <div className="case-layout-hero case-layout-hero--cinema case-reveal" data-reveal="mount" style={{ '--reveal-index': 1 }}>
      <div className="case-layout-hero__copy" data-wave-follow>
        <p className="case-kicker">{project.category || 'Selected system'}</p>
        <h1 id="case-title">{project.title}</h1>
        <p className="case-role">{project.role || 'Software Engineer'}</p>
        <p className="case-lede">{project.description}</p>
        <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
      </div>
    </div>

    <section className="case-media case-media--lead case-reveal" data-reveal="mount" style={{ '--reveal-index': 2 }} aria-label="Project media">
      <CaseHeroMedia project={project} />
    </section>

    <div className="case-split case-split--atmosphere case-reveal" data-reveal="scroll" style={{ '--reveal-index': 0 }}>
      <CaseBlock title="Overview" reveal="scroll" revealIndex={0} className="case-block--flush">
        <p>{project.fullDescription || project.description}</p>
      </CaseBlock>
      {decision && (
        <CaseBlock title="Atmosphere" reveal="scroll" revealIndex={1} className="case-block--flush">
          <p>{decision}</p>
        </CaseBlock>
      )}
    </div>

    <StackBlock items={techItems} reveal="scroll" revealIndex={1} title="Sound & surface" />

    {gallery.length > 0 && (
      <section className="case-media case-reveal" data-reveal="scroll" style={{ '--reveal-index': 2 }} aria-label="Focus states">
        <CaseGallery project={project} gallery={gallery} columns={gallery.length >= 3 ? 3 : 2} labels={project.galleryLabels || ['Focus', 'Break', 'Discipline', 'Theme', 'Settings', 'Matrices']} />
      </section>
    )}
  </>
);

const CaseFlow = ({ steps }: { steps?: ProjectFlowStep[] }) => {
  if (!Array.isArray(steps) || steps.length === 0) return null;

  return (
    <div className="case-process" aria-label="Work process">
      <div className="case-process__rail" aria-hidden="true" />
      <ol className="case-flow case-flow--process">
        {steps.map((step, index) => (
          <li className="case-flow__step" key={`${step.step || index}-${step.title}`}>
            <div className="case-flow__mark" aria-hidden="true">
              <span className="case-flow__dot" />
              {index < steps.length - 1 && <span className="case-flow__connector" />}
            </div>
            <span className="case-flow__index">{step.step || formatIndex(index + 1)}</span>
            <div className="case-flow__copy">
              <strong>{step.title}</strong>
              {step.cue ? <span className="case-flow__cue">{step.cue}</span> : null}
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

const CaseWhy = ({ items }: { items?: ProjectWhyItem[] }) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="case-why" aria-label="Why this product">
      {items.map((item) => (
        <article className="case-why__card" data-wave-follow key={item.title}>
          <div className="case-zuch-glass-follow">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
};

const FeatureLayout = ({ project, decision, techItems, gallery, hasLive, hasRepo }: CaseLayoutProps) => {
  const demoIndex = gallery.findIndex((item) => {
    const source = typeof item === 'string' ? item : item?.image || item?.video || '';
    return isGifSource(source) || isVideoSource(source);
  });
  const demoMedia = demoIndex >= 0 ? gallery[demoIndex] : null;
  const stillGallery = gallery.filter((_, index) => index !== demoIndex);
  const galleryLabels = project.galleryLabels || ['Browse', 'Review', 'Community'];
  const galleryDescriptions = project.galleryDescriptions || [];
  const demoLabel = galleryLabels[demoIndex] || 'Live session';
  const demoDescription = galleryDescriptions[demoIndex];
  const stillLabels = galleryLabels.filter((_, index) => index !== demoIndex);
  const stillDescriptions = galleryDescriptions.filter((_, index) => index !== demoIndex);

  return (
    <>
      <div className="case-feature case-reveal" data-reveal="mount" style={{ '--reveal-index': 1 }}>
        <div className="case-feature__copy" data-wave-follow>
          <p className="case-kicker">{project.category || 'Selected system'}</p>
          <h1 id="case-title">{project.title}</h1>
          <p className="case-role">{project.role || 'Software Engineer'}</p>
          <p className="case-lede">{project.description}</p>
          <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
          <StackBlock items={techItems} reveal="mount" revealIndex={2} title="Product stack" />
        </div>
        <div className="case-feature__media" data-wave-follow>
          <CaseHeroMedia project={project} sizes="(max-width: 900px) 100vw, 560px" />
        </div>
      </div>

      {demoMedia && (
        <section className="case-media case-media--demo case-reveal" data-reveal="scroll" style={{ '--reveal-index': 0 }} aria-label="Live session">
          {demoDescription && (
            <header className="case-demo-intro" data-wave-follow>
              <p className="case-demo-intro__eyebrow">Recorded in the real desktop app</p>
              <h2>{demoLabel}</h2>
              <p>{demoDescription}</p>
            </header>
          )}
          <CaseMediaFrame
            media={demoMedia}
            alt={`${project.title} usage demo`}
            sizes="(max-width: 900px) 100vw, 920px"
            className="case-media__frame--hero case-media__frame--demo-lead"
            label={demoLabel}
          />
        </section>
      )}

      <CaseBlock title="Why it exists" reveal="scroll" revealIndex={0}>
        <p>{project.fullDescription || project.description}</p>
        {decision && <p className="case-block__follow">{decision}</p>}
        <CaseWhy items={project.why} />
      </CaseBlock>

      {Array.isArray(project.flow) && project.flow.length > 0 && (
        <CaseBlock title="Work process" reveal="scroll" revealIndex={1}>
          <p className="case-process__lede">
            Configure once. Start once. Many agents stay visible — and finished work pulls attention.
          </p>
          <CaseFlow steps={project.flow} />
        </CaseBlock>
      )}

      {stillGallery.length > 0 && (
        <section className="case-media case-media--beats case-reveal" data-reveal="scroll" style={{ '--reveal-index': 2 }} aria-label="Feature beats">
          <CaseGallery
            project={project}
            gallery={stillGallery}
            columns={project.demoPresentation === 'stacked' ? 1 : stillGallery.length >= 3 ? 3 : 2}
            labels={stillLabels}
            descriptions={stillDescriptions}
            presentation={project.demoPresentation}
          />
        </section>
      )}
    </>
  );
};

const DossierLayout = ({ project, decision, techItems, gallery, hasLive, hasRepo }: CaseLayoutProps) => (
  <>
    <div className="case-dossier-top case-reveal" data-reveal="mount" style={{ '--reveal-index': 1 }}>
      <div className="case-dossier-top__copy" data-wave-follow>
        <p className="case-kicker">{project.category || 'Selected system'}</p>
        <h1 id="case-title">{project.title}</h1>
        <p className="case-role">{project.role || 'Software Engineer'}</p>
        <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
      </div>
      <aside className="case-dossier-top__facts" data-wave-follow>
        <CaseFacts project={project} techCount={techItems.length} />
      </aside>
    </div>

    <section className="case-media case-reveal" data-reveal="mount" style={{ '--reveal-index': 2 }} aria-label="Primary evidence">
      <CaseHeroMedia project={project} />
    </section>

    <div className="case-dossier-row case-reveal" data-reveal="scroll" style={{ '--reveal-index': 0 }}>
      <CaseBlock title="Challenge" reveal="scroll" revealIndex={0} className="case-block--flush">
        <p>{project.description}</p>
      </CaseBlock>
      <StackBlock items={techItems} reveal="scroll" revealIndex={1} title="Rules engine" />
    </div>

    <div className="case-dossier-row case-dossier-row--invert case-reveal" data-reveal="scroll" style={{ '--reveal-index': 1 }}>
      {gallery[0] && (
        <CaseMediaFrame
          media={gallery[0]}
          alt={`${project.title} evidence 1`}
          sizes="(max-width: 900px) 100vw, 520px"
          className="case-media__frame--evidence"
          label="Evidence A"
        />
      )}
      <CaseBlock title="Mechanics" reveal="scroll" revealIndex={1} className="case-block--flush">
        <p>{project.fullDescription || project.description}</p>
        {decision && <p className="case-block__follow">{decision}</p>}
      </CaseBlock>
    </div>

    {gallery.length > 1 && (
      <section className="case-media case-reveal" data-reveal="scroll" style={{ '--reveal-index': 2 }} aria-label="Additional evidence">
        <CaseGallery
          project={project}
          gallery={gallery.slice(1)}
          columns={gallery.length - 1 === 1 ? 1 : 2}
          labels={['Evidence B', 'Evidence C']}
        />
      </section>
    )}

    <CaseCode code={project.code} reveal="scroll" revealIndex={2} />
  </>
);


export { CinemaLayout, FeatureLayout, DossierLayout };
