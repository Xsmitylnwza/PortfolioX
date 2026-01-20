import { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Projects = () => {
    const sectionRef = useRef(null);
    const wrapperRef = useRef(null);

    const projects = [
        {
            id: 1,
            category: 'E-COMMERCE • 2023',
            title: 'Neon District',
            description: 'A high-performance streetwear store built with Next.js and Shopify headless architecture.',
            image: 'https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/be7bd51c-6dd7-4e04-a620-8108ef138948/1768838992467-a303f153/200__Couples_Posing_Prompts_for_Photographers.jpg',
            tags: ['Next.js', 'Tailwind'],
            link: '#',
        },
        {
            id: 2,
            category: 'WEB APP • 2022',
            title: 'Audio Scape',
            description: 'Collaborative music visualization tool using WebAudio API and Canvas.',
            image: 'https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/be7bd51c-6dd7-4e04-a620-8108ef138948/1768838927255-8dfc650a/f25d6e80f442ce4dc10c171831b1fc76.jpg',
            tags: ['React', 'WebGL'],
            link: '#',
        },
        {
            id: 3,
            category: 'DASHBOARD • 2022',
            title: 'Analytics Hub',
            description: 'Real-time data visualization platform with interactive charts and custom reporting.',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
            tags: ['Vue.js', 'D3.js'],
            link: '#',
        },
    ];

    useEffect(() => {
        const ctx = gsap.context(() => {

            // 1. Horizontal Marquee Text (Background)
            // Moves left as we scroll down
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

            // 2. Pinning & Stacking Cards
            const cards = gsap.utils.toArray('.project-card');

            // Initial setup: Cards positioned absolute, maybe off screen or stacked
            // We want them to slide up one by one.
            // Let's create a timeline that pins the section and animates cards

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: wrapperRef.current,
                    start: 'top top',
                    end: `+=${projects.length * 100}%`, // Scroll distance proportional to # of cards
                    pin: true,
                    scrub: 1,
                    snap: 1 / (projects.length - 1), // Optional snapping
                }
            });

            // Animate cards 2 and 3 in (Card 1 is already there)
            cards.forEach((card, i) => {
                if (i > 0) {
                    tl.fromTo(card,
                        { yPercent: 100, rotate: -5, opacity: 0 },
                        { yPercent: 0, rotate: i % 2 === 0 ? 2 : -2, opacity: 1, ease: 'power2.out' } // slightly chaotic rotation
                    );
                } else {
                    // First card just sits there or fades in slightly
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
            style={{
                position: 'relative',
                overflow: 'hidden',
                // Min-height is handled by the pinned content usually, but give it some breathing room if needed before pin
            }}
        >
            {/* Background Marquee */}
            <div
                style={{
                    position: 'absolute',
                    top: '20%',
                    left: 0,
                    width: '200%', // Wide for scrolling
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
                        {/* Background Image */}
                        <div
                            className="project-card-bg"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage: `url(${project.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                opacity: 0.6,
                                transition: 'transform 0.5s ease',
                            }}
                        />

                        {/* Gradient Overlay */}
                        <div className="project-card-gradient" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }} />

                        {/* Content */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                padding: 'clamp(1.5rem, 5vw, 3rem)',
                                width: '100%',
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
                                        className="font-display"
                                        style={{
                                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                                            fontWeight: 700,
                                            marginBottom: '1rem',
                                            lineHeight: 1,
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

                                {/* Link Button */}
                                <a
                                    href={project.link}
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
                                </a>
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
