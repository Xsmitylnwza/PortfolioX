import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { PROFILE } from '../data/site';
import { useDocumentRoomReveal } from '../hooks/useDocumentRoomReveal';
import ScrollPerspectiveWave from './ScrollPerspectiveWave';
import './TechStack.css';
import './Contact.css';

const channels = [
  'Email',
  'GitHub',
  'Resume PDF',
  'CV PDF',
];

const logistics = [
  'Open for full-stack roles',
  'Hybrid preferred',
  'Based in Thailand',
  'Prefer email first',
];

const materials = [
  {
    label: 'Email',
    value: PROFILE.email,
    href: PROFILE.mailto,
    icon: 'simple-icons:gmail',
    external: false,
    mail: true,
  },
  {
    label: 'GitHub',
    value: PROFILE.github.label,
    href: PROFILE.github.href,
    icon: 'simple-icons:github',
    external: true,
    mail: false,
  },
  {
    label: 'Resume',
    value: PROFILE.resumePdf.label,
    href: PROFILE.resumePdf.href,
    icon: 'simple-icons:adobeacrobatreader',
    external: true,
    mail: false,
  },
  {
    label: 'CV',
    value: PROFILE.cvPdf.label,
    href: PROFILE.cvPdf.href,
    icon: 'simple-icons:googledocs',
    external: true,
    mail: false,
  },
];

const Contact = () => {
  const sectionRef = useRef(null);

  useDocumentRoomReveal(sectionRef, {
    paths: ['/contact', '/resume', '/cv'],
    mountDelayMs: 90,
  });

  return (
    <ScrollPerspectiveWave
      as="section"
      id="contact"
      ref={sectionRef}
      className="engine-section engine-section--contact"
      aria-labelledby="engine-title"
      surfaceOpacity={0}
      intensity={1.05}
      syncStage
    >
      <svg className="engine-svg-defs" aria-hidden="true" focusable="false">
        <defs>
          <filter id="contact-icon-plate" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="noise" />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0.91
                      0 0 0 0 0.88
                      0 0 0 0 0.82
                      0 0 0 0.08 0"
              result="grain"
            />
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.4" result="soft" />
            <feOffset in="soft" dx="0" dy="1" result="shadow" />
            <feFlood floodColor="#050505" floodOpacity="0.28" result="shadowColor" />
            <feComposite in="shadowColor" in2="shadow" operator="in" result="drop" />
            <feMerge>
              <feMergeNode in="drop" />
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="grain" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div className="engine-shell" data-wave-surface>
        <header className="engine-hero engine-reveal" data-reveal="mount" style={{ '--reveal-index': 0 }}>
          <div className="engine-hero__title" data-wave-follow>
            <h1 id="engine-title">Contact</h1>
          </div>
          <div className="engine-hero__meta" data-wave-follow>
            <p>Room — 04</p>
            <p>Status — Open for roles</p>
          </div>
        </header>

        <div className="engine-info engine-reveal" data-reveal="mount" style={{ '--reveal-index': 1 }}>
          <div className="engine-info__col" data-wave-follow>
            <h2 className="engine-label">Channels</h2>
            <ul className="engine-list">
              {channels.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="engine-info__col" data-wave-follow>
            <h2 className="engine-label">Logistics</h2>
            <ul className="engine-list">
              {logistics.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="engine-info__copy" data-wave-follow>
            <p>
              <span className="engine-inline-label">(INFO)</span>
              Reach {PROFILE.name} for full-stack opportunities and collaborations.
              This room is for contact only — not a second experience or stack page.
            </p>
            <p>
              Prefer email first. Resume and CV are available as direct materials.
              For work context, continue to Experience. For systems practice, open Stack.
            </p>
          </div>
        </div>

        <section className="engine-index engine-reveal" data-reveal="scroll" style={{ '--reveal-index': 0 }}>
          <h2 className="engine-index__title" data-wave-follow>Materials</h2>
          <ul className="engine-index__list" aria-label="Contact materials" data-wave-follow>
            {materials.map((item) => {
              const content = (
                <>
                  <span className="engine-index__icon" aria-hidden="true">
                    <Icon icon={item.icon} />
                  </span>
                  <span className="engine-index__copy">
                    <strong>{item.label}</strong>
                    <small>{item.value}</small>
                  </span>
                </>
              );

              if (item.mail) {
                return (
                  <li key={item.label}>
                    <a
                      id="footer-email-btn"
                      className="engine-index__link"
                      href={item.href}
                      data-cursor="default"
                    >
                      {content}
                    </a>
                  </li>
                );
              }

              return (
                <li key={item.label}>
                  <a
                    className="engine-index__link"
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noreferrer' : undefined}
                    data-cursor="default"
                  >
                    {content}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="engine-block engine-reveal" data-reveal="scroll" style={{ '--reveal-index': 1 }}>
          <h2 className="engine-block__title" data-wave-follow>Position</h2>
          <div className="engine-block__body" data-wave-follow>
            <p>
              {PROFILE.title}. Available for hybrid full-stack roles.
            </p>
            <p>
              Write directly with the role context. Proof and systems detail stay in
              Experience and Stack so this page remains a clean outreach surface.
            </p>
          </div>
        </section>

        <footer className="engine-closing engine-reveal" data-reveal="scroll" style={{ '--reveal-index': 2 }}>
          <p className="engine-closing__note" data-wave-follow>
            Email is the primary channel. Resume is ready to download. Work context
            and stack practice live in the other rooms.
          </p>
          <div className="engine-closing__links" data-wave-follow>
            <a href={PROFILE.mailto} data-cursor="view" data-cursor-text="EMAIL">
              Write email
            </a>
            <a
              href={PROFILE.resumePdf.href}
              target="_blank"
              rel="noreferrer"
              data-cursor="view"
              data-cursor-text="RESUME"
            >
              Download resume
            </a>
            <Link to="/experience" data-cursor="view" data-cursor-text="EXPERIENCE">
              Experience
            </Link>
            <Link to="/stack" data-cursor="view" data-cursor-text="STACK">
              Stack
            </Link>
          </div>
        </footer>
      </div>
    </ScrollPerspectiveWave>
  );
};

export default Contact;
