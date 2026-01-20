import { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TechStack = () => {
    const sectionRef = useRef(null);

    const technologies = [
        { name: 'React', icon: 'logos:react' },
        { name: 'TypeScript', icon: 'logos:typescript-icon' },
        { name: 'Tailwind', icon: 'logos:tailwindcss-icon' },
        { name: 'Node.js', icon: 'logos:nodejs-icon' },
        { name: 'Figma', icon: 'logos:figma' },
        { name: 'Motion', icon: 'logos:framer' },
        { name: 'Next.js', icon: 'logos:nextjs-icon' },
        { name: 'WebGL', icon: 'tabler:box-model' },
        // Added a couple more to feel fuller if needed, or stick to list
    ];

    useEffect(() => {
        const ctx = gsap.context(() => {
            // 1. Initial Reveal
            gsap.fromTo('.tech-item',
                { y: 40, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 90%',
                        toggleActions: 'play none none none',
                    },
                    y: 0,
                    opacity: 1,
                    stagger: 0.08,
                    duration: 0.6,
                    ease: 'power3.out',
                    onComplete: startFloating
                }
            );

            // 2. Floating "Chaos" (starts after reveal)
            function startFloating() {
                const items = gsap.utils.toArray('.tech-item');
                items.forEach((item) => {
                    // Random float parameters
                    const dur = gsap.utils.random(2, 4);
                    const yOffset = gsap.utils.random(-10, 10);
                    const xOffset = gsap.utils.random(-10, 10);
                    const rotation = gsap.utils.random(-5, 5);

                    gsap.to(item, {
                        x: xOffset,
                        y: yOffset,
                        rotation: rotation,
                        duration: dur,
                        repeat: -1,
                        yoyo: true,
                        ease: 'sine.inOut',
                        delay: gsap.utils.random(0, 1) // random start time
                    });
                });
            }

            // 3. Scatter on Scroll
            // We use a proxy to detect scroll velocity and apply it to rotation/scale
            ScrollTrigger.create({
                trigger: sectionRef.current,
                start: 'top bottom',
                end: 'bottom top',
                onUpdate: (self) => {
                    const velocity = self.getVelocity();
                    // Just a subtle shake/scale based on speed
                    const normalizedVelocity = Math.min(Math.abs(velocity) / 2000, 1);

                    if (normalizedVelocity > 0.1) {
                        gsap.to('.tech-item', {
                            scale: 1 + normalizedVelocity * 0.1, // Pulse up
                            duration: 0.2,
                            overwrite: 'auto'
                        });
                    } else {
                        gsap.to('.tech-item', {
                            scale: 1,
                            duration: 0.5,
                            overwrite: 'auto'
                        });
                    }
                }
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            style={{
                padding: '8rem 1.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                background: 'rgba(255, 255, 255, 0.02)',
                overflow: 'hidden'
            }}
        >
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Section Label */}
                <p
                    className="font-mono"
                    style={{
                        textAlign: 'center',
                        color: 'var(--red-primary)',
                        marginBottom: '4rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        fontSize: '0.875rem',
                    }}
                >
                    // My Arsenal
                </p>

                {/* Tech Grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '2rem',
                    }}
                    className="tech-grid"
                >
                    {technologies.map((tech, index) => (
                        <div key={index} className="tech-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'grab' }}>
                            <div className="tech-icon" style={{
                                width: '5rem', height: '5rem',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.1)',
                                transition: 'background 0.3s'
                            }}>
                                <Icon icon={tech.icon} style={{ fontSize: '2.5rem' }} />
                            </div>
                            <span className="tech-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tech.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @media (min-width: 640px) {
                    .tech-grid {
                        grid-template-columns: repeat(3, 1fr) !important;
                    }
                }
                @media (min-width: 768px) {
                    .tech-grid {
                        grid-template-columns: repeat(4, 1fr) !important;
                    }
                }
                @media (min-width: 1024px) {
                    .tech-grid {
                        grid-template-columns: repeat(4, 1fr) !important;
                        gap: 4rem !important;
                    }
                }
                .tech-item:hover .tech-icon {
                    background: var(--red-glow);
                    border-color: var(--red-primary);
                }
            `}</style>
        </section>
    );
};

export default TechStack;
