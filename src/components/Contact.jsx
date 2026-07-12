import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { PROFILE, RESUME_PROOFS, RESUME_ROLES, RESUME_SKILLS } from '../data/site';
import { useDocumentRoomReveal } from '../hooks/useDocumentRoomReveal';
import './Contact.css';

const channels = [
  {
    index: '02',
    label: 'GitHub',
    value: PROFILE.github.label,
    href: PROFILE.github.href,
    external: true,
  },
  {
    index: '03',
    label: 'Experience',
    value: 'Full work stories',
    href: '/experience',
    external: false,
  },
];

const Contact = () => {
  const sectionRef = useRef(null);

  useDocumentRoomReveal(sectionRef, {
    paths: ['/contact', '/resume', '/cv'],
    mountDelayMs: 90,
  });

  return (
    <section id="contact" ref={sectionRef} className="channel-section" aria-labelledby="channel-title">
      <div className="channel-shell">
        <div className="channel-transmission channel-reveal" data-reveal="mount" style={{"--reveal-index": 0}} aria-hidden="true">
          <span>04 / CONTACT</span>
          <span>RESUME + CHANNEL</span>
          <span>{PROFILE.name.toUpperCase()}</span>
        </div>

        <header className="channel-hero">
          <div className="channel-reveal" data-reveal="mount" style={{"--reveal-index": 1}}>
            <div className="channel-chapter">
              <span>04</span>
              <p>CONTACT</p>
            </div>
            <p className="channel-kicker">PATH, PROOF, REACH</p>
            <h1 id="channel-title">
              Hire packet
              <br />
              <em>and open channel.</em>
            </h1>
            <p className="channel-lede">{PROFILE.positioning}</p>
          </div>

          <aside className="channel-packet channel-reveal" data-reveal="mount" style={{"--reveal-index": 2}} aria-label="Hire packet">
            <p className="channel-packet__label">RECRUITER STRIP</p>
            <strong>{PROFILE.name}</strong>
            <span>{PROFILE.title}</span>
            <div className="channel-packet__actions">
              <a
                className="channel-btn channel-btn--primary"
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
                className="channel-btn"
                href={PROFILE.mailto}
                data-cursor="view"
                data-cursor-text="SAY HELLO"
              >
                <Icon icon="lucide:mail" aria-hidden="true" />
                Email
              </a>
            </div>
          </aside>
        </header>

        <div className="channel-section-label channel-reveal" data-reveal="scroll" style={{"--reveal-index": 0}}>
          <span>PROOF</span>
          <i aria-hidden="true" />
          <span>3 SIGNALS</span>
        </div>
        <section className="channel-proofs" aria-label="Impact proofs">
          {RESUME_PROOFS.map((proof, index) => (
            <article
              key={proof.id}
              className="channel-proof channel-reveal"
              data-reveal="scroll"
              style={{ '--proof-index': index, '--reveal-index': index }}
            >
              <span className="channel-proof__id">{proof.id}</span>
              <div>
                <p className="channel-proof__signal">{proof.signal}</p>
                <h2>{proof.title}</h2>
                <p>{proof.detail}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="channel-roles channel-reveal" data-reveal="scroll" style={{"--reveal-index": 1}} aria-label="Role rails">
          <div className="channel-section-label">
            <span>ROLES</span>
            <i aria-hidden="true" />
            <span>COMPACT</span>
          </div>
          <ol>
            {RESUME_ROLES.map((role) => (
              <li key={role.company + "-" + role.period}>
                <div>
                  <strong>{role.role}</strong>
                  <span>{role.company}</span>
                </div>
                <time>{role.period}</time>
              </li>
            ))}
          </ol>
        </section>

        <section className="channel-skills channel-reveal" data-reveal="scroll" style={{"--reveal-index": 2}} aria-label="Skills strip">
          <div className="channel-section-label">
            <span>STACK STRIP</span>
            <i aria-hidden="true" />
            <span>SHORTLIST</span>
          </div>
          <ul>
            {RESUME_SKILLS.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </section>

        <div className="channel-section-label channel-reveal" data-reveal="scroll" style={{"--reveal-index": 3}}>
          <span>CHANNEL</span>
          <i aria-hidden="true" />
          <span>OPEN</span>
        </div>
        <div className="channel-reach channel-reveal" data-reveal="scroll" style={{"--reveal-index": 4}}>
          <a
            id="footer-email-btn"
            className="channel-email"
            href={PROFILE.mailto}
            data-cursor="view"
            data-cursor-text="SAY HELLO"
          >
            <span>
              <small>01 / EMAIL</small>
              {PROFILE.email}
            </span>
            <b aria-hidden="true">-&gt;</b>
          </a>

          <nav className="channel-links" aria-label="Contact links">
            {channels.map((channel) => (
              channel.external ? (
                <a
                  key={channel.label}
                  href={channel.href}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="view"
                  data-cursor-text={channel.label.toUpperCase()}
                >
                  <span>{channel.index}</span>
                  <span>
                    <small>{channel.label}</small>
                    <strong>{channel.value}</strong>
                  </span>
                  <b aria-hidden="true">↗</b>
                </a>
              ) : (
                <Link
                  key={channel.label}
                  to={channel.href}
                  data-cursor="view"
                  data-cursor-text={channel.label.toUpperCase()}
                >
                  <span>{channel.index}</span>
                  <span>
                    <small>{channel.label}</small>
                    <strong>{channel.value}</strong>
                  </span>
                  <b aria-hidden="true">↗</b>
                </Link>
              )
            ))}
          </nav>
        </div>

        <footer className="channel-foot channel-reveal" data-reveal="scroll" style={{"--reveal-index": 5}}>
          <span>FROM CHAOS -&gt; SYSTEMS</span>
          <Link to="/experience" data-cursor="view" data-cursor-text="OPEN EXPERIENCE">
            Full experience stories -&gt;
          </Link>
        </footer>
      </div>
    </section>
  );
};

export default Contact;
