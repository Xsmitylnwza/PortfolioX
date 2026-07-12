import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PROFILE } from '../data/site';
import './Contact.css';

const channels = [
    {
        index: '02',
        label: 'GitHub',
        value: PROFILE.github.label,
        href: PROFILE.github.href,
        ariaLabel: `Open ${PROFILE.name} on GitHub in a new tab`,
        external: true,
    },
    {
        index: '03',
        label: 'Resume',
        value: 'Path and proof',
        href: '/resume',
        ariaLabel: 'Open resume dossier',
        external: false,
    },
    {
        index: '04',
        label: 'PDF',
        value: 'Attachable packet',
        href: PROFILE.resumePdf.href,
        ariaLabel: `Open ${PROFILE.name} resume PDF in a new tab`,
        external: true,
    },
];

const Contact = () => {
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
            { threshold: 0.18, rootMargin: '0px 0px -6% 0px' },
        );

        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    return (
        <section id="contact" ref={sectionRef} className="channel-section" aria-labelledby="channel-title">
            <div className="channel-transmission" aria-hidden="true">
                <span>05 / CHANNEL</span>
                <span>DIRECT CONTACT</span>
                <span>{PROFILE.name.toUpperCase()}</span>
            </div>

            <div className="channel-stage">
                <div className="channel-copy channel-reveal">
                    <div className="channel-chapter">
                        <span>05</span>
                        <p>CHANNEL</p>
                    </div>

                    <p className="channel-kicker">THE SIGNAL ENDS WITH A CONVERSATION.</p>
                    <h2 id="channel-title">
                        Have a system
                        <br />
                        <em>worth building?</em>
                    </h2>
                    <p className="channel-lede">
                        Send the problem, users, and constraints. I&apos;ll bring a full-stack
                        engineering perspective to what should happen next.
                    </p>

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
                </div>

                <aside className="channel-directory channel-reveal" aria-label="Contact channels">
                    <div className="channel-note" aria-hidden="true">
                        <p>send the brief -&gt;</p>
                        <dl>
                            <div>
                                <dt>TO</dt>
                                <dd>CHAIMONGKON</dd>
                            </div>
                            <div>
                                <dt>SUBJECT</dt>
                                <dd>NEXT BUILD</dd>
                            </div>
                            <div>
                                <dt>STATUS</dt>
                                <dd>CHANNEL OPEN</dd>
                            </div>
                        </dl>
                    </div>

                    <nav className="channel-links" aria-label="External contact links">
                        {channels.map((channel) => {
                            const className = undefined;
                            if (channel.external) {
                                return (
                                    <a
                                        key={channel.label}
                                        href={channel.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={channel.ariaLabel}
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
                                );
                            }

                            return (
                                <Link
                                    key={channel.label}
                                    to={channel.href}
                                    aria-label={channel.ariaLabel}
                                    data-cursor="view"
                                    data-cursor-text={channel.label.toUpperCase()}
                                    className={className}
                                >
                                    <span>{channel.index}</span>
                                    <span>
                                        <small>{channel.label}</small>
                                        <strong>{channel.value}</strong>
                                    </span>
                                    <b aria-hidden="true">↗</b>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>
            </div>

            <div className="channel-signoff channel-reveal">
                <span>FROM CHAOS</span>
                <i aria-hidden="true" />
                <span>TO SYSTEMS</span>
            </div>
        </section>
    );
};

export default Contact;
