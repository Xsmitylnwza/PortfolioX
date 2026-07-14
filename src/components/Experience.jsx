import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useDocumentRoomReveal } from '../hooks/useDocumentRoomReveal';
import ScrollPerspectiveWave from './ScrollPerspectiveWave';
import TechStackList, { TechStackIconDefs } from './TechStackList';
import './Experience.css';

const experiences = [
  {
    id: '01',
    company: 'SCB - Siam Commercial Bank',
    shortCompany: 'SCB',
    role: 'Software Engineer (Part-time)',
    period: 'Oct 2025 – May 2026',
    metric: 'Rules without deploys',
    logo: '/assets/optimized/scb-logo-128.png',
    summary: 'Re-architected AMLX so compliance rules live in the database, not behind engineering deploys.',
    detail: 'Turned the rule engine into a dynamic, database-driven system so business teams can change rules without code releases. Optimized React frontend and Spring Boot backend modules to clear legacy bottlenecks, and partnered with senior engineers and system analysts on complex AML workflow modernization.',
    tools: ['React', 'Spring Boot', 'SQL'],
    layout: 'hero',
  },
  {
    id: '02',
    company: 'TTB - TMBThanachart Bank',
    shortCompany: 'TTB',
    role: 'Software Engineer (Intern)',
    period: 'May 2025 – Sep 2025',
    metric: '7 leads · 100+ engineers',
    logo: '/assets/optimized/ttb-logo-128.png',
    summary: 'Built an internal productivity dashboard adopted by 7 team leads and 100+ developers.',
    detail: 'Recognized at the TTB Townhall for improving team operations and visibility. Validated technical feasibility with senior engineers using Spring Boot, then designed user flows and backend features that streamlined cross-team communication for engineering leads.',
    tools: ['Spring Boot', 'Product Flows', 'Workflow Design'],
    layout: 'offset',
  },
  {
    id: '03',
    company: 'Freelance',
    shortCompany: 'Freelance',
    role: 'Full-Stack Developer (Part-time)',
    period: 'Feb 2025 – Dec 2025',
    metric: 'End-to-end delivery',
    // Quiet mark for independent work — not a company logo
    markIcon: 'lucide:briefcase-business',
    summary: 'Owned end-to-end delivery of production web apps alongside studies.',
    detail: 'Shipped client products with React, Spring Boot, and MySQL — architecture, implementation, testing, and deployment. Managed the full SDLC from requirements to final delivery so clients received scalable, maintainable systems.',
    tools: ['React', 'Spring Boot', 'MySQL', 'Delivery'],
    layout: 'split',
  },
  {
    id: '04',
    company: 'Tomato Ideas Co., Ltd.',
    shortCompany: 'Tomato Ideas',
    role: 'Full Stack Developer (Intern)',
    period: 'Jan 2025 – May 2025',
    metric: 'API + roadmap POCs',
    logo: '/assets/optimized/tomato-logo-128.jpg',
    summary: 'Built middleware APIs and POCs that shaped the product roadmap.',
    detail: 'Designed a scalable middleware API with Node.js and Elysia.js to standardize third-party integrations. Prototyped and validated key POC features, then helped fold the strongest ideas into production for faster feature rollouts.',
    tools: ['Node.js', 'Elysia.js', 'API Integration', 'Prototyping'],
    layout: 'cascade',
  },
];

const currentRole = experiences[0];
const earlierRoles = experiences.slice(1);

const parseRole = (role = '') => {
  const match = role.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (!match) return { title: role, type: null };
  return { title: match[1].trim(), type: match[2].trim() };
};

const RoleMark = ({ experience, className = '', size = 112 }) => {
  if (experience.markIcon) {
    return (
      <span className={`${className} experience-mark experience-mark--icon`} aria-hidden="true">
        <Icon icon={experience.markIcon} width={Math.round(size * 0.46)} height={Math.round(size * 0.46)} />
      </span>
    );
  }

  if (!experience.logo) return null;

  return (
    <img
      className={className}
      src={experience.logo}
      alt=""
      width={size}
      height={size}
      loading={experience.id === '01' ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
};

const RoleIdentity = ({ experience, className = '' }) => {
  const { title, type } = parseRole(experience.role);

  return (
    <p className={`experience-role ${className}`.trim()}>
      <span className="experience-role__title">{title}</span>
      {type ? <span className="experience-role__type">{type}</span> : null}
    </p>
  );
};

const Experience = () => {
  const sectionRef = useRef(null);
  const pathRef = useRef(null);

  // First fold mounts after room enter; everything below lazy-reveals on scroll.
  useDocumentRoomReveal(sectionRef, {
    paths: ['/experience'],
    mountDelayMs: 140,
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.12,
  });

  useEffect(() => {
    const section = sectionRef.current;
    const path = pathRef.current;
    if (!section || !path) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const updatePath = () => {
      frame = 0;
      const nodes = Array.from(section.querySelectorAll('[data-timeline-node]'));
      if (!nodes.length) return;

      const sectionRect = section.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const sectionTop = sectionRect.top + scrollY;
      const sectionHeight = section.offsetHeight || 1;
      const viewportAnchor = window.innerHeight * 0.42;

      // Progress through the life path as the viewport walks the room.
      const raw = (scrollY + viewportAnchor - sectionTop) / sectionHeight;
      const progress = Math.max(0, Math.min(1, raw));
      path.style.setProperty('--timeline-progress', progress.toFixed(4));

      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        const nodeCenter = rect.top + rect.height * 0.35;
        const reached = reducedMotion.matches || nodeCenter <= viewportAnchor + 24;
        node.classList.toggle('is-on-path', reached);
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updatePath);
    };

    updatePath();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const onReduced = () => updatePath();
    reducedMotion.addEventListener?.('change', onReduced);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      reducedMotion.removeEventListener?.('change', onReduced);
    };
  }, []);

  return (
    <ScrollPerspectiveWave
      ref={sectionRef}
      as="section"
      id="experience"
      className="experience-room"
      aria-labelledby="experience-room-title"
      surfaceOpacity={0}
      syncStage
    >
      <TechStackIconDefs />

      <div className="experience-shell" data-wave-surface>
        <div className="experience-path" ref={pathRef} aria-hidden="true">
          <span className="experience-path__rail" />
          <span className="experience-path__progress" />
          <span className="experience-path__glow" />
        </div>

        {/* Topic header — same grammar as Stack / Contact */}
        <header
          className="experience-hero experience-reveal"
          data-reveal="mount"
          style={{ '--reveal-index': 0 }}
        >
          <div className="experience-hero__title" data-wave-follow>
            <h1 id="experience-room-title">Experience</h1>
          </div>
          <div className="experience-hero__meta" data-wave-follow>
            <p>Room — 02</p>
            <p>Span — 2025–26</p>
            <p>Mode — Applied roles</p>
          </div>
        </header>

        {/* First content: current role story */}
        <article
          className="experience-current experience-reveal"
          data-reveal="mount"
          data-timeline-node
          style={{ '--reveal-index': 1 }}
          id={`exp-${currentRole.id}`}
          aria-labelledby="experience-current-title"
        >
          <span className="experience-node experience-node--current" aria-hidden="true" />
          <div className="experience-current__story" data-wave-follow>
            <span className="experience-current__status">Current</span>

            <div className="experience-current__brand">
              <div className="experience-current__logo-wrap">
                <RoleMark
                  experience={currentRole}
                  className="experience-current__logo"
                  size={112}
                />
                <span className="experience-current__index" aria-hidden="true">{currentRole.id}</span>
              </div>
              <div className="experience-current__brand-copy">
                <h2 id="experience-current-title" className="experience-current__company">
                  {currentRole.company}
                </h2>
                <div className="experience-current__identity">
                  <RoleIdentity experience={currentRole} className="experience-current__role" />
                  <p className="experience-current__period experience-period">{currentRole.period}</p>
                </div>
              </div>
            </div>

            <p className="experience-current__lead">{currentRole.summary}</p>
            <p className="experience-current__metric">{currentRole.metric}</p>
            <p className="experience-current__detail">{currentRole.detail}</p>
            <div className="experience-current__tools">
              <TechStackList
                variant="layer"
                title="Used in role"
                items={currentRole.tools}
                ariaLabel={`${currentRole.shortCompany} tools`}
                showDefs={false}
              />
            </div>
          </div>
        </article>

        <nav
          className="experience-orbit experience-reveal"
          data-reveal="scroll"
          style={{ '--reveal-index': 0 }}
          aria-label="Earlier roles"
        >
          <p className="experience-orbit__label" data-wave-follow>Earlier</p>
          <ol className="experience-orbit__list" data-wave-follow>
            {earlierRoles.map((experience) => (
              <li key={`orbit-${experience.id}`}>
                <a href={`#exp-${experience.id}`} data-cursor="default">
                  <RoleMark experience={experience} className="experience-orbit__mark" size={40} />
                  <span>{experience.shortCompany}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <ol className="experience-records" aria-label="Earlier work experience">
          {earlierRoles.map((experience, index) => (
            <li
              className={`experience-record experience-reveal experience-record--${experience.layout}`}
              key={experience.id}
              id={`exp-${experience.id}`}
              data-reveal="scroll"
              data-timeline-node
              style={{ '--reveal-index': index }}
            >
              <span className="experience-node" aria-hidden="true" />
              <article className="experience-entry">
                <header className="experience-entry__head" data-wave-follow>
                  <div className="experience-entry__brand">
                    <div className="experience-entry__logo-wrap">
                      <RoleMark
                        experience={experience}
                        className="experience-entry__logo"
                        size={88}
                      />
                      <span className="experience-entry__index" aria-hidden="true">{experience.id}</span>
                    </div>
                    <div className="experience-entry__brand-copy">
                      <h2 className="experience-entry__company">{experience.company}</h2>
                      <div className="experience-entry__identity">
                        <RoleIdentity experience={experience} className="experience-entry__role" />
                        <p className="experience-entry__period experience-period">{experience.period}</p>
                      </div>
                    </div>
                  </div>
                </header>

                <div className="experience-entry__body" data-wave-follow>
                  <p className="experience-entry__lead">{experience.summary}</p>
                  <p className="experience-entry__metric">{experience.metric}</p>
                  <p className="experience-entry__detail">{experience.detail}</p>
                </div>

                <div className="experience-entry__tools" data-wave-follow>
                  <TechStackList
                    variant="layer"
                    title="Used in role"
                    items={experience.tools}
                    ariaLabel={`${experience.shortCompany} tools`}
                    showDefs={false}
                  />
                </div>
              </article>
            </li>
          ))}
        </ol>

        <footer
          className="experience-closing experience-reveal"
          data-reveal="scroll"
          style={{ '--reveal-index': 0 }}
        >
          <p className="experience-closing__note" data-wave-follow>
            For systems practice, open Stack. For materials and outreach, open Contact.
          </p>
          <div className="experience-closing__links" data-wave-follow>
            <Link to="/stack" data-cursor="view" data-cursor-text="STACK">
              Stack
            </Link>
            <Link to="/contact" data-cursor="view" data-cursor-text="CONTACT">
              Contact / Resume
            </Link>
            <Link to="/" data-cursor="view" data-cursor-text="GALLERY">
              Gallery
            </Link>
          </div>
        </footer>
      </div>
    </ScrollPerspectiveWave>
  );
};

export default Experience;
