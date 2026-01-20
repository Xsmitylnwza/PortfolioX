import { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TechStack = () => {
    const sectionRef = useRef(null);

    const technologies = [
        { name: 'Spring Boot', icon: 'logos:spring-icon' },
        { name: 'Docker', icon: 'logos:docker-icon' },
        { name: 'AWS', icon: 'logos:aws' },
        { name: 'Go', icon: 'logos:go' },
        { name: 'Next.js', icon: 'logos:nextjs-icon' },
        { name: 'React', icon: 'logos:react' },
        { name: 'MySQL', icon: 'logos:mysql' },
        { name: 'Jenkins', icon: 'logos:jenkins' },
    ];

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.palette-card',
                { y: 30, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 80%',
                    },
                    y: 0,
                    opacity: 1,
                    stagger: 0.1,
                    duration: 1.2,
                    ease: 'power2.out'
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            style={{
                padding: '10rem 1.5rem',
                position: 'relative',
                background: 'linear-gradient(to bottom, rgba(5, 5, 5, 0), rgba(5, 5, 5, 0.3))'
            }}
        >
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <p className="font-serif-italic" style={{
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    marginBottom: '1rem',
                    fontSize: '1.25rem'
                }}>
                    The tools of my expression
                </p>
                <h2 className="font-display" style={{
                    textAlign: 'center',
                    color: 'white',
                    marginBottom: '5rem',
                    fontSize: '3rem',
                    letterSpacing: '-0.02em'
                }}>
                    THE <span style={{ color: 'var(--red-primary)' }}>PALETTE</span>
                </h2>

                <div className="palette-grid">
                    {technologies.map((tech, index) => (
                        <div key={index} className="palette-card">
                            <div className="icon-wrapper">
                                <Icon icon={tech.icon} className="tech-icon" />
                            </div>
                            <span className="tech-name font-sans">{tech.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .palette-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.5rem;
                }
                @media (min-width: 640px) { .palette-grid { grid-template-columns: repeat(4, 1fr); gap: 2rem; } }

                .palette-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 1rem;
                    padding: 2.5rem 1.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                    cursor: pointer;
                    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                    backdrop-filter: blur(4px);
                }

                .palette-card:hover {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(255, 255, 255, 0.1);
                    transform: translateY(-5px);
                    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
                }

                .icon-wrapper {
                    font-size: 2.5rem;
                    color: var(--text-secondary);
                    transition: all 0.5s ease;
                    filter: grayscale(100%) opacity(0.7);
                }

                .palette-card:hover .icon-wrapper {
                    filter: grayscale(0%) opacity(1);
                    transform: scale(1.1);
                    animation: heartbeat 1.5s ease-in-out infinite;
                }

                @keyframes heartbeat {
                    0% { transform: scale(1.1); }
                    14% { transform: scale(1.2); }
                    28% { transform: scale(1.1); }
                    42% { transform: scale(1.2); }
                    70% { transform: scale(1.1); }
                }

                .tech-name {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    font-weight: 500;
                    letter-spacing: 0.05em;
                    transition: color 0.3s ease;
                }

                .palette-card:hover .tech-name {
                    color: white;
                }
            `}</style>
        </section>
    );
};

export default TechStack;
