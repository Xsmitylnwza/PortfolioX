import { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Main content reveal
            gsap.from('.about-reveal', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
                y: 60,
                opacity: 0,
                stagger: 0.15,
                duration: 1,
                ease: 'power3.out',
            });

            // Collage images animation
            gsap.from('.about-collage-img', {
                scrollTrigger: {
                    trigger: '.about-collage',
                    start: 'top 80%',
                },
                scale: 0.8,
                opacity: 0,
                rotation: (i) => (i % 2 === 0 ? -10 : 10),
                stagger: 0.15,
                duration: 1.2,
                ease: 'elastic.out(1, 0.8)',
            });

            // Floating animation for images
            gsap.utils.toArray('.about-collage-img').forEach((img, i) => {
                gsap.to(img, {
                    y: i % 2 === 0 ? -12 : 12,
                    rotation: `+=${i % 2 === 0 ? 1.5 : -1.5}`,
                    duration: 5 + i * 0.5,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                    delay: i * 0.2,
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const stats = [
        { value: '4+', label: 'Years of Craft' },
        { value: '10+', label: 'Projects Shipped' },
        { value: '∞', label: 'Late Night Sessions' },
        { value: '♪', label: 'Songs on Repeat' },
    ];

    const qualities = [
        { icon: 'ph:heart-fill', text: 'Passionate about creating experiences that feel like coming home' },
        { icon: 'ph:moon-stars-fill', text: 'Night owl turning dreams into pixels and code' },
        { icon: 'ph:music-notes-fill', text: 'Music-inspired design that moves and resonates' },
    ];

    return (
        <section
            id="about"
            ref={sectionRef}
            style={{
                position: 'relative',
                padding: '8rem 1.5rem',
                overflow: 'hidden',
            }}
        >
            {/* Background Quote */}
            <div
                className="text-overlay-quote filled"
                style={{ top: '5%', right: '-15%', transform: 'rotate(5deg)', fontSize: 'clamp(4rem, 12vw, 10rem)' }}
            >
                DREAMER
            </div>

            {/* Section Content */}
            <div
                style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '4rem',
                    alignItems: 'center',
                }}
                className="about-grid"
            >
                {/* Collage Image Composition */}
                <div
                    className="about-collage"
                    style={{
                        position: 'relative',
                        height: '500px',
                        maxWidth: '500px',
                        margin: '0 auto',
                    }}
                >
                    {/* Main Image */}
                    <div
                        className="about-collage-img"
                        data-cursor="view"
                        data-cursor-text="FOCUS"
                        style={{
                            position: 'absolute',
                            top: '10%',
                            left: '10%',
                            width: '65%',
                            height: '70%',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            transform: 'rotate(-3deg)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            zIndex: 10,
                        }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600"
                            alt="Profile"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.9) contrast(1.1)' }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), transparent)',
                                pointerEvents: 'none',
                            }}
                        />
                    </div>

                    {/* Secondary Image */}
                    <div
                        className="about-collage-img"
                        data-cursor="view"
                        data-cursor-text="CREATE"
                        style={{
                            position: 'absolute',
                            top: '0%',
                            right: '5%',
                            width: '45%',
                            height: '40%',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            transform: 'rotate(5deg)',
                            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)',
                            zIndex: 15,
                        }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=500"
                            alt="Workspace"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    {/* Third Image */}
                    <div
                        className="about-collage-img"
                        data-cursor="view"
                        data-cursor-text="CODE"
                        style={{
                            position: 'absolute',
                            bottom: '5%',
                            right: '0%',
                            width: '50%',
                            height: '45%',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            transform: 'rotate(-4deg)',
                            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)',
                            zIndex: 12,
                        }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=500"
                            alt="Coding"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    {/* Decorative Text */}
                    <span
                        className="font-serif-italic text-fragment"
                        style={{
                            position: 'absolute',
                            bottom: '15%',
                            left: '-5%',
                            fontSize: '0.875rem',
                            color: 'var(--purple-light)',
                            transform: 'rotate(-8deg)',
                            opacity: 0.8,
                        }}
                    >
                        "just being here"
                    </span>

                    {/* Star decoration */}
                    <Icon
                        icon="ph:star-four-fill"
                        style={{
                            position: 'absolute',
                            top: '5%',
                            left: '5%',
                            fontSize: '1.5rem',
                            color: 'var(--purple-light)',
                            opacity: 0.6,
                        }}
                    />
                </div>

                {/* Text Content */}
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    {/* Section Header */}
                    <div className="about-reveal" style={{ marginBottom: '2rem' }}>
                        <span
                            className="font-creative"
                            style={{
                                display: 'inline-block',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em',
                                color: 'var(--purple-light)',
                                marginBottom: '1rem',
                            }}
                        >
                            About Me
                        </span>
                        <h2
                            className="font-display"
                            style={{
                                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                                lineHeight: 1,
                                marginBottom: '1.5rem',
                            }}
                        >
                            BEHIND THE <span className="text-purple">SCREEN</span>
                        </h2>
                    </div>

                    {/* Quote Block */}
                    <div
                        className="about-reveal text-block-glass"
                        style={{ marginBottom: '2rem' }}
                    >
                        <p
                            className="font-serif-italic"
                            style={{
                                fontSize: '1.125rem',
                                color: 'var(--text-secondary)',
                                lineHeight: 1.8,
                            }}
                        >
                            "I believe code is poetry and design is emotion. Every project I touch
                            becomes a piece of my heart — carefully crafted, deeply intentional,
                            and made to make you <span className="text-purple">feel something.</span>"
                        </p>
                    </div>

                    {/* Description */}
                    <p
                        className="about-reveal"
                        style={{
                            color: 'var(--text-muted)',
                            marginBottom: '2rem',
                            lineHeight: 1.8,
                        }}
                    >
                        Full-stack developer with over 5 years of experience architecting robust digital systems.
                        I specialize in Backend Development, DevOps pipelines, and Scalable Cloud Infrastructures,
                        while maintaining the ability to craft seamless Fullstack experiences.
                    </p>

                    {/* Qualities */}
                    <div className="about-reveal" style={{ marginBottom: '2.5rem' }}>
                        {qualities.map((quality, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '1rem',
                                    marginBottom: '1rem',
                                }}
                            >
                                <Icon
                                    icon={quality.icon}
                                    style={{
                                        fontSize: '1.25rem',
                                        color: 'var(--purple-light)',
                                        flexShrink: 0,
                                        marginTop: '0.125rem',
                                    }}
                                />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                                    {quality.text}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <a href="#contact" className="about-reveal btn-primary">
                        <span>Let's Create Together</span>
                    </a>
                </div>
            </div>

            {/* Stats Row */}
            <div
                style={{
                    maxWidth: '1000px',
                    margin: '5rem auto 0',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1.5rem',
                }}
                className="stats-grid"
            >
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="about-reveal accent-card"
                        style={{
                            padding: '2rem',
                            textAlign: 'center',
                            transition: 'all 0.4s ease',
                        }}
                    >
                        <div
                            className="font-display"
                            style={{
                                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                                color: 'var(--purple-light)',
                                marginBottom: '0.5rem',
                            }}
                        >
                            {stat.value}
                        </div>
                        <div
                            className="font-creative"
                            style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                            }}
                        >
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Decorative Line */}
            <div
                className="decorative-line"
                style={{
                    maxWidth: '200px',
                    margin: '4rem auto 0',
                }}
            />

            <style>{`
                @media (min-width: 1024px) {
                    .about-grid {
                        grid-template-columns: 1fr 1fr !important;
                    }
                    .about-collage {
                        height: 600px !important;
                        max-width: 600px !important;
                    }
                }
                @media (min-width: 768px) {
                    .stats-grid {
                        grid-template-columns: repeat(4, 1fr) !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default About;
