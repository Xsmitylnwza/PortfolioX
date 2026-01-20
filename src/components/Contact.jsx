import { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
    const sectionRef = useRef(null);

    const socialLinks = [
        { icon: 'lucide:github', href: '#', id: 'social-github' },
        { icon: 'lucide:linkedin', href: '#', id: 'social-linkedin' },
        { icon: 'lucide:twitter', href: '#', id: 'social-twitter' },
    ];

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.contact-reveal', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
                y: 60,
                opacity: 0,
                stagger: 0.12,
                duration: 1,
                ease: 'power3.out',
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="contact"
            ref={sectionRef}
            style={{
                padding: '8rem 1.5rem',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background Collage Element */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '50%',
                    height: '100%',
                    opacity: 0.2,
                    pointerEvents: 'none',
                    maskImage: 'linear-gradient(to left, black, transparent)',
                    WebkitMaskImage: 'linear-gradient(to left, black, transparent)',
                }}
            >
                <img
                    src="https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/be7bd51c-6dd7-4e04-a620-8108ef138948/1768838991959-5852539d/___________1_.jpg"
                    alt="Background"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'grayscale(1)',
                        mixBlendMode: 'overlay',
                    }}
                />
            </div>

            {/* Content */}
            <div
                style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    position: 'relative',
                    zIndex: 10,
                    textAlign: 'center',
                }}
            >
                {/* Badge */}
                <div
                    className="contact-reveal"
                    style={{
                        display: 'inline-block',
                        marginBottom: '2rem',
                        transform: 'rotate(-5deg)',
                    }}
                >
                    <span
                        style={{
                            background: 'var(--purple-accent)',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            fontSize: '0.75rem',
                            fontFamily: 'monospace',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                        }}
                    >
                        Open for opportunities
                    </span>
                </div>

                {/* Main Headline */}
                <h2
                    className="contact-reveal font-display"
                    style={{
                        fontSize: 'clamp(3rem, 10vw, 6rem)',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        lineHeight: 1,
                        marginBottom: '2.5rem',
                    }}
                >
                    Let's create
                    <br />
                    <span style={{ color: 'var(--red-primary)' }}>Something</span> Real
                </h2>

                {/* Description */}
                <p
                    className="contact-reveal"
                    style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-muted)',
                        maxWidth: '500px',
                        margin: '0 auto 3rem',
                        lineHeight: 1.7,
                    }}
                >
                    Currently looking for new challenges in frontend development and UI design.
                </p>

                {/* Email CTA */}
                <a
                    href="mailto:hello@gabriel.dev"
                    id="footer-email-btn"
                    className="contact-reveal btn-primary"
                    style={{
                        fontSize: '1.25rem',
                        padding: '1.25rem 2.5rem',
                        marginBottom: '4rem',
                        display: 'inline-flex',
                    }}
                >
                    <span>hello@gabriel.dev</span>
                    <Icon icon="lucide:mail" style={{ fontSize: '1.25rem' }} />
                </a>

                {/* Social Links */}
                <div
                    className="contact-reveal"
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '2rem',
                        marginTop: '3rem',
                    }}
                >
                    {socialLinks.map((social) => (
                        <a
                            key={social.id}
                            id={social.id}
                            href={social.href}
                            className="social-link"
                            style={{
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <Icon icon={social.icon} style={{ fontSize: '2rem' }} />
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Contact;
