import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { PROFILE, RESUME_PROOFS, RESUME_ROLES, RESUME_SKILLS } from '../data/site';
import ScrollPerspectiveWave from './ScrollPerspectiveWave';
import './Resume.css';

const Resume = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    if (!('IntersectionObserver' in window)) {
      section.classList.add('is-visible');
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.classList.add('is-visible');
        observer.disconnect();
      },
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <ScrollPerspectiveWave
      as="section"
      id="resume"
      ref={sectionRef}
      className="dossier-section"
      aria-labelledby="dossier-title"
      surfaceOpacity={0}
      intensity={1.05}
      syncStage
    >
      <div className="dossier-shell" data-wave-surface>
        <div className="dossier-transmission dossier-reveal" data-wave-follow aria-hidden="true">
          <span>04 / DOSSIER</span>
          <span>PATH + PROOF</span>
          <span>{PROFILE.name.toUpperCase()}</span>
        </div>

        <header className="dossier-header">
          <div className="dossier-chapter dossier-reveal" data-wave-follow>
            <span>04</span>
            <p>RESUME</p>
          </div>

          <div className="dossier-title-block dossier-reveal" data-wave-follow>
            <p className="dossier-kicker">SIGNAL PACKET / HIRE READY</p>
            <h1 id="dossier-title">
              Path and
              <br />
              <em>proof.</em>
            </h1>
            <p className="dossier-positioning">{PROFILE.positioning}</p>
          </div>

          <aside className="dossier-packet dossier-reveal" data-wave-follow aria-label="Hire packet">
            <p className="dossier-packet__label">RECRUITER STRIP</p>
            <strong>{PROFILE.name}</strong>
            <span>{PROFILE.title}</span>
            <div className="dossier-packet__actions">
              <a
                className="dossier-btn dossier-btn--primary"
                href={PROFILE.resumePdf.href}
                target="_blank"
                rel="noreferrer"
                data-cursor="view"
                data-cursor-text="RELEASE PACKET"
              >
                <Icon icon="lucide:file-down" aria-hidden="true" />
                {PROFILE.resumePdf.label}
              </a>
              <a
                className="dossier-btn"
                href={PROFILE.mailto}
                data-cursor="view"
                data-cursor-text="OPEN CHANNEL"
              >
                <Icon icon="lucide:mail" aria-hidden="true" />
                Email
              </a>
            </div>
          </aside>
        </header>

        <section className="dossier-proofs" aria-label="Impact proofs">
          {RESUME_PROOFS.map((proof, index) => (
            <article
              key={proof.id}
              className="dossier-proof dossier-reveal"
              data-wave-follow
              style={{ '--proof-index': index }}
            >
              <span className="dossier-proof__id">{proof.id}</span>
              <div>
                <p className="dossier-proof__signal">{proof.signal}</p>
                <h2>{proof.title}</h2>
                <p>{proof.detail}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="dossier-roles dossier-reveal" data-wave-follow aria-label="Role rails">
          <div className="dossier-section-label">
            <span>ROLE RAILS</span>
            <i aria-hidden="true" />
            <span>COMPACT</span>
          </div>
          <ol>
            {RESUME_ROLES.map((role) => (
              <li key={`${role.company}-${role.period}`}>
                <div>
                  <strong>{role.role}</strong>
                  <span>{role.company}</span>
                  <p>{role.focus}</p>
                </div>
                <time>{role.period}</time>
              </li>
            ))}
          </ol>
        </section>

        <section className="dossier-skills dossier-reveal" data-wave-follow aria-label="Skills strip">
          <div className="dossier-section-label">
            <span>SKILLS STRIP</span>
            <i aria-hidden="true" />
            <span>SHARED TOOL IDS</span>
          </div>
          <ul>
            {RESUME_SKILLS.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </section>

        <footer className="dossier-footer dossier-reveal">
          <div data-wave-follow>
            <p>Need the full essay?</p>
            <Link to="/experience" data-cursor="view" data-cursor-text="OPEN EXPERIENCE">
              Read Experience
              <Icon icon="lucide:arrow-up-right" aria-hidden="true" />
            </Link>
          </div>
          <div className="dossier-footer__sticky" data-wave-follow aria-label="Sticky actions">
            <a
              href={PROFILE.resumePdf.href}
              target="_blank"
              rel="noreferrer"
              data-cursor="view"
              data-cursor-text="OPEN DOSSIER"
            >
              {PROFILE.resumePdf.label}
            </a>
            <a href={PROFILE.mailto} data-cursor="view" data-cursor-text="SAY HELLO">
              {PROFILE.email}
            </a>
          </div>
        </footer>
      </div>
    </ScrollPerspectiveWave>
  );
};

export default Resume;
