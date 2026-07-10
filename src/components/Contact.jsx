import { useEffect, useRef } from 'react';
import './Contact.css';

const channels = [
    {
        index: '02',
        label: 'GitHub',
        value: '@Xsmitylnwza',
        href: 'https://github.com/Xsmitylnwza',
        ariaLabel: 'Open Chaimongkon Sokgampang on GitHub in a new tab',
    },
    {
        index: '03',
        label: 'Resume',
        value: 'Experience + toolkit',
        href: '/assets/Chaimongkon-Sokgampang_Resume.pdf',
        ariaLabel: 'Open Chaimongkon Sokgampang resume PDF in a new tab',
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
                <span>04 / CHANNEL</span>
                <span>DIRECT CONTACT</span>
                <span>CHAIMONGKON SOKGAMPANG</span>
            </div>

            <div className="channel-stage">
                <div className="channel-copy channel-reveal">
                    <div className="channel-chapter">
                        <span>04</span>
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
                        href="mailto:chaimongkon.sokgampang@gmail.com"
                        data-cursor="view"
                        data-cursor-text="SAY HELLO"
                    >
                        <span>
                            <small>01 / EMAIL</small>
                            chaimongkon.sokgampang@gmail.com
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
                        {channels.map((channel) => (
                            <a
                                key={channel.label}
                                href={channel.href}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={channel.ariaLabel}
                            >
                                <span>{channel.index}</span>
                                <span>
                                    <small>{channel.label}</small>
                                    <strong>{channel.value}</strong>
                                </span>
                                <b aria-hidden="true">↗</b>
                            </a>
                        ))}
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
