import { Icon } from '@iconify/react';
import CaseMediaFrame from './ProjectDetailsMedia';
import { CaseActions, StackBlock } from './ProjectDetailsShared';
import { formatIndex } from './ProjectDetailsFormat';

const MUX_SHIFTS = [
  {
    icon: 'lucide:panels-top-left',
    from: 'Rebuild a terminal scene',
    to: 'Return to a Project Canvas',
  },
  {
    icon: 'lucide:play',
    from: 'Wake tools one by one',
    to: 'Choose one explicit Start',
  },
  {
    icon: 'lucide:layout-panel-top',
    from: 'Leave panes scattered',
    to: 'Reset the scene with Auto Tile',
  },
];

const MUX_PIPELINE = [
  {
    stage: '01 · Return',
    title: 'Project Canvas',
    icon: 'lucide:folder-cog',
    items: ['Terminals', 'Backdrop', 'Pane material', 'Arrangement'],
  },
  {
    stage: '02 · Trigger',
    title: 'Reveal the Dock',
    icon: 'lucide:circle-play',
    items: ['Project switch', 'Ready terminals', 'Explicit Start'],
    focus: true,
  },
  {
    stage: '03 · Work',
    title: 'Terminal scene',
    icon: 'lucide:layout-grid',
    items: ['Agents', 'Dev servers', 'Shells', 'Focused pane'],
    grid: true,
  },
  {
    stage: '04 · Reset',
    title: 'Keep it legible',
    icon: 'lucide:wand-sparkles',
    items: ['Auto Tile', 'Canvas controls', 'Saved on return'],
  },
];

const MUX_CANVAS_SIGNALS = [
  {
    label: 'Project-scoped',
    maker: 'One scene per project',
    icon: 'lucide:folder-kanban',
  },
  {
    label: 'Explicit launch',
    maker: 'Nothing runs on open',
    icon: 'lucide:circle-play',
  },
  {
    label: 'Saved arrangement',
    maker: 'Return without rebuilding',
    icon: 'lucide:layout-template',
  },
  {
    label: 'Canvas controls',
    maker: 'Backdrop, material, Auto Tile',
    icon: 'lucide:sliders-horizontal',
  },
];

const ProjectMuxGlassDefs = () => (
  <svg className="case-mux-glass-defs" aria-hidden="true" focusable="false">
    <defs>
      <filter
        id="mux-liquid-glass-refract"
        x="-15%"
        y="-15%"
        width="130%"
        height="130%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.012 0.018"
          numOctaves="1"
          seed="7"
          stitchTiles="stitch"
          result="mux-glass-noise"
        />
        <feGaussianBlur in="mux-glass-noise" stdDeviation="1.4" result="mux-glass-soft-noise" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="mux-glass-soft-noise"
          scale="7"
          xChannelSelector="R"
          yChannelSelector="B"
        />
      </filter>
    </defs>
  </svg>
);

const ProjectMuxAgentRail = () => (
  <div className="case-mux-agents" data-wave-follow>
    <div className="case-mux-agents__copy">
      <span>Canvas contract</span>
      <strong>The scene is the project context.</strong>
    </div>
    <ul aria-label="Veluma Canvas signals">
      {MUX_CANVAS_SIGNALS.map((signal) => (
        <li key={signal.label}>
          <span className="case-mux-agents__mark" aria-hidden="true">
            <Icon icon={signal.icon} />
          </span>
          <span className="case-mux-agents__name">
            <strong>{signal.label}</strong>
            <small>{signal.maker}</small>
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const ProjectMuxShiftDiagram = () => (
  <section
    className="case-mux-shifts case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 0 }}
    aria-labelledby="mux-shifts-title"
  >
    <header className="case-mux-section-head" data-wave-follow>
      <p className="case-mux-section-head__eyebrow">The shift</p>
      <h2 id="mux-shifts-title">A terminal workspace that returns as one scene.</h2>
    </header>
    <div className="case-mux-shifts__grid">
      {MUX_SHIFTS.map((item, index) => (
        <article className="case-mux-shift" data-wave-follow key={item.to}>
          <span className="case-mux-shift__index">{formatIndex(index + 1)}</span>
          <Icon className="case-mux-shift__icon" icon={item.icon} aria-hidden="true" />
          <div className="case-mux-shift__copy">
            <span>{item.from}</span>
            <Icon icon="lucide:arrow-right" aria-hidden="true" />
            <strong>{item.to}</strong>
          </div>
        </article>
      ))}
    </div>
  </section>
);

const ProjectMuxPipeline = () => (
  <section
    className="case-mux-system case-reveal"
    data-reveal="scroll"
    style={{ '--reveal-index': 1 }}
    aria-labelledby="mux-system-title"
  >
    <header className="case-mux-section-head" data-wave-follow>
      <p className="case-mux-section-head__eyebrow">The working loop</p>
      <h2 id="mux-system-title">Return → reveal → start → shape the Canvas.</h2>
    </header>
    <ProjectMuxAgentRail />
    <ol className="case-mux-pipeline">
      {MUX_PIPELINE.map((node) => (
        <li
          className={[
            'case-mux-pipeline__node',
            node.focus ? 'case-mux-pipeline__node--focus' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          data-wave-follow
          key={node.stage}
        >
          <span className="case-mux-pipeline__stage">{node.stage}</span>
          <span className="case-mux-pipeline__icon" aria-hidden="true">
            <Icon icon={node.icon} />
          </span>
          <h3>{node.title}</h3>
          <ul className={node.grid ? 'case-mux-pipeline__items case-mux-pipeline__items--grid' : 'case-mux-pipeline__items'}>
            {node.items.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </li>
      ))}
    </ol>
    <div className="case-mux-system__loop" data-wave-follow>
      <Icon icon="lucide:refresh-cw" aria-hidden="true" />
      <span>Leave a Project</span>
      <span className="case-mux-system__loop-line" aria-hidden="true" />
      <strong>Return to the same Canvas</strong>
    </div>
  </section>
);

const ProjectMuxEvidence = ({ project, gallery }) => {
  const items = gallery.slice(1).map((media, index) => ({
    media,
    label: project.galleryLabels?.[index + 1] || `Feature ${index + 1}`,
    description: project.galleryDescriptions?.[index + 1],
  }));

  if (items.length === 0) return null;

  return (
    <section
      className="case-mux-evidence case-reveal"
      data-reveal="scroll"
      style={{ '--reveal-index': 2 }}
      aria-labelledby="mux-evidence-title"
    >
      <header className="case-mux-section-head" data-wave-follow>
        <p className="case-mux-section-head__eyebrow">Interface proof</p>
        <h2 id="mux-evidence-title">Four recorded moments, one calm workspace.</h2>
      </header>
      <div className="case-mux-evidence__grid">
        {items.map((item, index) => (
          <article
            className={[
              'case-mux-evidence__card',
              index === 0 ? 'case-mux-evidence__card--lead' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            key={item.label}
          >
            <CaseMediaFrame
              media={item.media}
              alt={`${project.title} — ${item.label}`}
              sizes={index === 0
                ? '(max-width: 900px) 100vw, 700px'
                : '(max-width: 900px) 100vw, 400px'}
              className="case-media__frame--mux-evidence"
              label={item.label}
            />
            <div className="case-mux-evidence__copy" data-wave-follow>
              <span>Feature {formatIndex(index + 1)}</span>
              <h3>{item.label}</h3>
              {item.description && <p>{item.description}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const MuxLayout = ({ project, techItems, gallery, hasLive, hasRepo }) => {
  const demoMedia = gallery[0];
  const demoLabel = project.galleryLabels?.[0] || 'Live session';
  const demoDescription = project.galleryDescriptions?.[0];

  return (
    <>
      <ProjectMuxGlassDefs />

      <div className="case-mux-hero case-reveal" data-reveal="mount" style={{ '--reveal-index': 1 }}>
        <div className="case-mux-hero__copy" data-wave-follow>
          <p className="case-kicker">{project.category || 'Selected system'}</p>
          <h1 id="case-title">{project.title}</h1>
          <p className="case-role">{project.role || 'Software Engineer'}</p>
          <p className="case-lede">{project.description}</p>
          <CaseActions hasLive={hasLive} hasRepo={hasRepo} project={project} />
        </div>
        <div className="case-mux-hero__media">
          <CaseMediaFrame
            media={project.heroMedia}
            alt={`${project.title} V logo and a warm saved Canvas, with Codex, Claude Code, server and shell symbols before Start`}
            cover
            eager
            sizes="(max-width: 900px) 100vw, 560px"
            className="case-media__frame--hero"
            transitionTarget
          />
        </div>
      </div>

      <ProjectMuxShiftDiagram />

      {demoMedia && (
        <section
          className="case-mux-proof case-reveal"
          data-reveal="scroll"
          style={{ '--reveal-index': 0 }}
          aria-labelledby="mux-proof-title"
        >
          <header className="case-mux-proof__copy" data-wave-follow>
            <p className="case-mux-section-head__eyebrow">Proof 01 · Return to context</p>
            <h2 id="mux-proof-title">{demoLabel}</h2>
            {demoDescription && <p>{demoDescription}</p>}
            <ul aria-label="Demo signals">
              <li>Project-scoped scene</li>
              <li>Dock reveals on demand</li>
              <li>Canvas stays intact</li>
            </ul>
          </header>
          <CaseMediaFrame
            media={demoMedia}
            alt={`${project.title} — ${demoLabel}`}
            sizes="(max-width: 900px) 100vw, 760px"
            className="case-media__frame--mux-proof"
            label={demoLabel}
          />
        </section>
      )}

      <ProjectMuxPipeline />
      <ProjectMuxEvidence project={project} gallery={gallery} />
      <StackBlock items={techItems} reveal="scroll" revealIndex={1} title="Built with" />
    </>
  );
};

export default MuxLayout;
