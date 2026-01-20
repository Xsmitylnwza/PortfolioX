import { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import { Link } from 'react-router-dom';
import { projects } from '../data/projects';

const Projects = () => {
    const sectionRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.to('.marquee-text', {
                xPercent: -50,
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.5
                }
            });

            const cards = gsap.utils.toArray('.project-card');
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: wrapperRef.current,
                    start: 'top top',
                    end: `+=${projects.length * 100}%`,
                    pin: true,
                    scrub: 1,
                    snap: 1 / (projects.length - 1),
                }
            });

            cards.forEach((card, i) => {
                if (i > 0) {
                    tl.fromTo(card,
                        { yPercent: 100, rotate: -5, opacity: 0 },
                        { yPercent: 0, rotate: i % 2 === 0 ? 2 : -2, opacity: 1, ease: 'power2.out' }
                    );
                } else {
                    tl.fromTo(card,
                        { opacity: 0, scale: 0.9 },
                        { opacity: 1, scale: 1, duration: 0.5 },
                        0
                    );
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="projects"
            ref={sectionRef}
            style={{ position: 'relative', overflow: 'hidden' }}
        >
            {/* Background Marquee */}
            <div
                style={{
                    position: 'absolute',
                    top: '20%',
                    left: 0,
                    width: '200%',
                    zIndex: 0,
                    opacity: 0.05,
                    pointerEvents: 'none',
                    display: 'flex',
                }}
            >
                <h1 className="marquee-text font-display" style={{ fontSize: '20vw', fontWeight: 900, whiteSpace: 'nowrap' }}>
                    PROJECTS WORKS SELECTED PROJECTS WORKS
                </h1>
            </div>

            {/* Pinned Wrapper for Cards */}
            <div
                ref={wrapperRef}
                style={{
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    perspective: '1000px',
                }}
            >
                {projects.map((project, i) => (
                    <article
                        key={project.id}
                        className="project-card"
                        style={{
                            position: 'absolute',
                            width: 'clamp(300px, 80vw, 800px)',
                            aspectRatio: '16/9',
                            background: '#111',
                            transformOrigin: 'center bottom',
                            zIndex: i + 1, // Stack order
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        }}
                    >
                        {/* 1. Background Image (Artist Side) */}
                        <div
                            className="project-card-bg"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage: `url(${project.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                opacity: 0.6,
                                transition: 'all 0.5s ease',
                            }}
                        />

                        {/* 2. Code Overlay (Developer Side) - Hidden by default, shown on hover */}
                        <div
                            className="project-code-overlay"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(5, 5, 5, 0.9)',
                                backdropFilter: 'blur(5px)',
                                padding: '2rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                            }}
                        >
                            <pre className="font-mono" style={{
                                color: 'var(--purple-accent)',
                                fontSize: '0.9rem',
                                width: '100%',
                                overflow: 'hidden',
                                textShadow: '0 0 5px rgba(168, 85, 247, 0.5)'
                            }}>
                                <code>{project.code}</code>
                            </pre>
                            {/* Overlay Decoration */}
                            <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', fontFamily: 'monospace', color: '#666', fontSize: '0.75rem' }}>
                                // VIEW SOURCE
                            </div>
                        </div>

                        {/* Hover Styles Injection */}
                        <style>{`
                            .project-card:hover .project-card-bg { opacity: 0.1; filter: blur(10px); }
                            .project-card:hover .project-code-overlay { opacity: 1; }
                        `}</style>

                        {/* Gradient Overlay */}
                        <div className="project-card-gradient" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', pointerEvents: 'none' }} />

                        {/* Content */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                padding: 'clamp(1.5rem, 5vw, 3rem)',
                                width: '100%',
                                pointerEvents: 'none', // Allow hover through to card
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-end',
                                    gap: '1.5rem',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <span
                                        className="font-mono"
                                        style={{
                                            color: 'var(--red-primary)',
                                            fontSize: '0.875rem',
                                            marginBottom: '0.5rem',
                                            display: 'block',
                                        }}
                                    >
                                        {project.category}
                                    </span>
                                    <h3
                                        className="font-serif-italic"
                                        style={{
                                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                                            fontWeight: 400,
                                            marginBottom: '1rem',
                                            lineHeight: 1,
                                            color: 'white'
                                        }}
                                    >
                                        {project.title}
                                    </h3>
                                    <p
                                        style={{
                                            color: 'var(--text-muted)',
                                            maxWidth: '500px',
                                            marginBottom: '1.5rem',
                                            lineHeight: 1.6,
                                            fontSize: '1rem',
                                        }}
                                    >
                                        {project.description}
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {project.tags.map((tag, idx) => (
                                            <span key={idx} className="tag" style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem' }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Link Button - Pointer events auto to allowing clicking */}
                                <Link
                                    to={`/project/${project.id}`}
                                    style={{
                                        width: '4rem',
                                        height: '4rem',
                                        borderRadius: '50%',
                                        background: 'var(--bg-black)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        transition: 'all 0.3s ease',
                                        pointerEvents: 'auto'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--red-primary)';
                                        e.currentTarget.style.borderColor = 'var(--red-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'var(--bg-black)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                                    }}
                                >
                                    <Icon icon="lucide:arrow-up-right" style={{ fontSize: '1.5rem' }} />
                                </Link>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* Scroll Indication */}
            <div style={{ position: 'absolute', bottom: '2rem', width: '100%', textAlign: 'center', zIndex: 0, opacity: 0.5 }}>
                <p className="font-mono text-xs">KEEP SCROLLING</p>
            </div>
        </section>
    );
};

export default Projects;
