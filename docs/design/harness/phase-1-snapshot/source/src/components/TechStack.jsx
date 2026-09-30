import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentRoomReveal } from '../hooks/useDocumentRoomReveal';
import ScrollPerspectiveWave from './ScrollPerspectiveWave';
import TechStackList, { TechStackIconDefs } from './TechStackList';
import './TechStack.css';

const marks = [
  { label: 'React', icon: 'simple-icons:react' },
  { label: 'Spring', icon: 'simple-icons:springboot' },
  { label: 'Node.js', icon: 'simple-icons:nodedotjs' },
  { label: 'Next.js', icon: 'simple-icons:nextdotjs' },
  { label: 'Go', icon: 'simple-icons:go' },
  { label: 'SQL', icon: 'simple-icons:mysql' },
  { label: 'Docker', icon: 'simple-icons:docker' },
  { label: 'AWS', icon: 'simple-icons:amazonwebservices' },
];

const domains = [
  'Interface systems',
  'Service architecture',
  'Data & state',
  'Delivery platforms',
];

const practice = [
  'Requirements clarity',
  'Boundary design',
  'Implementation',
  'Release operations',
];

const layers = [
  {
    number: '01',
    title: 'Interface',
    tools: [
      { label: 'React', icon: 'simple-icons:react' },
      { label: 'Next.js', icon: 'simple-icons:nextdotjs' },
      { label: 'Vue.js', icon: 'simple-icons:vuedotjs' },
      { label: 'React Query', icon: 'simple-icons:reactquery' },
      { label: 'MUI', icon: 'simple-icons:mui' },
      { label: 'Vite', icon: 'simple-icons:vite' },
    ],
    body: 'Interfaces are treated as product surfaces, not decoration. The work is to translate requirements into maintainable structures for dashboards, booking journeys, and interactive systems that remain legible as product scope expands.',
  },
  {
    number: '02',
    title: 'Services',
    tools: [
      { label: 'Java', icon: 'cib:java' },
      { label: 'Spring Boot', icon: 'simple-icons:springboot' },
      { label: 'Node.js', icon: 'simple-icons:nodedotjs' },
      { label: 'Elysia.js', icon: 'skill-icons:elysia-light' },
      { label: 'Go', icon: 'simple-icons:go' },
      { label: 'WebSocket', icon: 'mdi:lan-connect' },
    ],
    body: 'Services hold the operational truth of a system. Workflows are shaped into focused APIs and batch paths where side effects, contracts, and failure modes stay explicit — from banking rule engines to middleware and realtime channels.',
  },
  {
    number: '03',
    title: 'Data',
    tools: [
      { label: 'SQL', icon: 'simple-icons:mysql' },
      { label: 'PostgreSQL', icon: 'simple-icons:postgresql' },
      { label: 'MongoDB', icon: 'simple-icons:mongodb' },
      { label: 'Supabase', icon: 'simple-icons:supabase' },
      { label: 'AWS S3', icon: 'simple-icons:amazons3' },
    ],
    body: 'State is kept deliberate. Relational models, operational stores, and file systems are chosen for durability and clarity, so configuration, history, and client synchronization remain trustworthy under change.',
  },
  {
    number: '04',
    title: 'Delivery',
    tools: [
      { label: 'Docker', icon: 'simple-icons:docker' },
      { label: 'Jenkins', icon: 'simple-icons:jenkins' },
      { label: 'GitLab CI', icon: 'simple-icons:gitlab' },
      { label: 'Nginx', icon: 'simple-icons:nginx' },
      { label: 'AWS EC2', icon: 'simple-icons:amazonec2' },
    ],
    body: 'Delivery is part of the system design. Builds, containers, and release paths are made repeatable so the same architecture can move through environments without reinventing process for every change.',
  },
];

const principles = [
  {
    title: 'System before catalogue',
    body: 'Technologies are selected for the path they support — requirement, architecture, implementation, and release — not for density of labels.',
  },
  {
    title: 'Clarity under change',
    body: 'Banking systems and product work share the same demand: interfaces and services that remain readable when rules, ownership, and timelines shift.',
  },
  {
    title: 'End-to-end ownership',
    body: 'Prefer multi-hat delivery. Define the contract, implement the service, wire the interface, and leave an operable path for the next release.',
  },
];

const TechStack = () => {
  const sectionRef = useRef(null);

  useDocumentRoomReveal(sectionRef, {
    paths: ['/stack', '/tech'],
    mountDelayMs: 140,
  });

  return (
    <ScrollPerspectiveWave
      as="section"
      id="capabilities"
      ref={sectionRef}
      className="engine-section"
      aria-labelledby="engine-title"
      surfaceOpacity={0}
      intensity={1.05}
      syncStage
    >
      <TechStackIconDefs />

      <div className="engine-shell" data-wave-surface>
        {/* Quiet hero: title left, meta right — no giant center panel */}
        <header className="engine-hero engine-reveal" data-reveal="mount" style={{ '--reveal-index': 0 }}>
          <div className="engine-hero__title" data-wave-follow>
            <h1 id="engine-title">Stack</h1>
          </div>
          <div className="engine-hero__meta" data-wave-follow>
            <p>Discipline — Systems</p>
            <p>Period — 2025–26</p>
          </div>
        </header>

        {/* Info grid remains the primary content entry */}
        <div className="engine-info engine-reveal" data-reveal="mount" style={{ '--reveal-index': 1 }}>
          <div className="engine-info__col" data-wave-follow>
            <h2 className="engine-label">Domains</h2>
            <ul className="engine-list">
              {domains.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="engine-info__col" data-wave-follow>
            <h2 className="engine-label">Practice</h2>
            <ul className="engine-list">
              {practice.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="engine-info__copy" data-wave-follow>
            <p>
              <span className="engine-inline-label">(INFO)</span>
              This page documents the technical system behind the work — interface,
              services, data, and delivery — as one continuous practice rather than a
              loose inventory of tools.
            </p>
            <p>
              The emphasis is architectural intent: clear boundaries, explicit state,
              and release paths that remain operable under real product and banking constraints.
            </p>
          </div>
        </div>

        {/* Supporting index of core tools — quiet, inline, secondary */}
        <TechStackList
          className="engine-reveal"
          variant="index"
          title="Core tools"
          items={marks}
          reveal="scroll"
          revealIndex={0}
          waveFollow
          showDefs={false}
          phaseClassName="engine-phase"
        />

        <section className="engine-block engine-reveal" data-reveal="scroll" style={{ '--reveal-index': 1 }}>
          <h2 className="engine-block__title" data-wave-follow>Position</h2>
          <div className="engine-block__body" data-wave-follow>
            <p>
              Full-stack work is approached as systems design. Each layer exists to
              reduce ambiguity for the next: interfaces communicate product intent,
              services encode reliable behavior, data preserves truth, and delivery
              makes that system repeatable.
            </p>
            <p>
              Current practice spans banking rule engines, internal engineering tools,
              and client product delivery. The stack is chosen to support multi-hat
              ownership without sacrificing structure.
            </p>
          </div>
        </section>

        <section className="engine-block engine-reveal" data-reveal="scroll" style={{ '--reveal-index': 2 }}>
          <h2 className="engine-block__title" data-wave-follow>Layers</h2>
          <div className="engine-layers">
            {layers.map((layer, layerIndex) => (
              <article
                key={layer.number}
                className="engine-layer engine-phase"
                data-wave-follow
                style={{ '--phase-index': layerIndex }}
              >
                <div className="engine-layer__index" aria-hidden="true">
                  {layer.number}
                </div>
                <div className="engine-layer__content">
                  <h3>{layer.title}</h3>
                  <TechStackList
                    variant="layer"
                    items={layer.tools}
                    ariaLabel={`${layer.title} technologies`}
                    showDefs={false}
                    phaseClassName="engine-phase engine-phase--chip"
                  />
                  <p className="engine-layer__body">{layer.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="engine-block engine-reveal" data-reveal="scroll" style={{ '--reveal-index': 3 }}>
          <h2 className="engine-block__title" data-wave-follow>Method</h2>
          <div className="engine-method">
            {principles.map((item, index) => (
              <article
                key={item.title}
                className="engine-method__item engine-phase"
                data-wave-follow
                style={{ '--phase-index': index }}
              >
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="engine-closing engine-reveal" data-reveal="scroll" style={{ '--reveal-index': 4 }}>
          <p className="engine-closing__note" data-wave-follow>
            For applied context, continue to Experience. For materials and contact,
            open the hire packet.
          </p>
          <div className="engine-closing__links" data-wave-follow>
            <Link to="/experience" data-cursor="view" data-cursor-text="EXPERIENCE">
              Experience
            </Link>
            <Link to="/contact" data-cursor="view" data-cursor-text="CONTACT">
              Contact / Resume
            </Link>
          </div>
        </footer>
      </div>
    </ScrollPerspectiveWave>
  );
};

export default TechStack;
