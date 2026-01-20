import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Experience.css';

gsap.registerPlugin(ScrollTrigger);

const Experience = () => {
    const sectionRef = useRef(null);
    const containerRef = useRef(null);
    const pathRef = useRef(null);
    // Store refs to the cards to calculate their positions
    const cardRefs = useRef([]);

    const experiences = [
        {
            id: 1,
            period: 'PRESENT',
            year: '2025',
            title: 'Senior Frontend Dev',
            company: 'TechStream Inc.',
            description: 'Leading the frontend architecture migration. Building the future of digital interactions.',
            tech: ['NEXT.JS', 'TYPESCRIPT', 'TAILWIND'],
            glowColor: 'var(--bg-black)',
        },
        {
            id: 2,
            period: 'MID-LEVEL',
            year: '2023',
            title: 'Creative Technologist',
            company: 'Creative Pulse',
            description: 'Bridging the gap between design and engineering. WebGL, GSAP, and chaos.',
            tech: ['WEBGL', 'GSAP', 'GLSL'],
            glowColor: 'var(--red-primary)',
        },
        {
            id: 3,
            period: 'JUNIOR',
            year: '2021',
            title: 'Frontend Developer',
            company: 'StartUp Flow',
            description: 'The beginning of the journey. React, state management, and sleepless nights.',
            tech: ['REACT', 'REDUX', 'SASS'],
            glowColor: '#3b82f6',
        },
    ];

    // Function to calculate the zigzag path string
    const updatePath = () => {
        if (!containerRef.current || !pathRef.current || cardRefs.current.length === 0) return;

        // Get relative positions inside the container
        const containerRect = containerRef.current.getBoundingClientRect();
        const points = cardRefs.current.map(card => {
            if (!card) return [0, 0];
            const rect = card.getBoundingClientRect();
            // Calculate center point relative to container - moved to TOP CENTER for the Pin
            const x = rect.left + rect.width / 2 - containerRect.left;
            const y = rect.top + 20 - containerRect.top; // +20 to hit the pin area roughly
            return { x, y };
        });

        // Construct Polyline String
        let pathStr = `M ${points[0].x} ${points[0].y}`;

        for (let i = 1; i < points.length; i++) {
            // Bezier curve for slack string look
            const p1 = points[i - 1];
            const p2 = points[i];
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2 + 50; // Droop down 50px
            pathStr += ` Q ${midX} ${midY + (Math.random() * 20)} ${p2.x} ${p2.y}`;
        }

        pathRef.current.setAttribute('d', pathStr);

        // Update ScrollTrigger for the new path length
        const length = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length });

        // Kill old trigger if exists to avoid doubles (simple handle here)
        ScrollTrigger.getAll().forEach(t => {
            if (t.vars.trigger === '.evidence-board') t.kill();
        });

        gsap.to(pathRef.current, {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: '.evidence-board',
                start: 'top center',
                end: 'bottom center',
                scrub: 1
            }
        });
    };

    useEffect(() => {
        const ctx = gsap.context(() => {

            // 1. Reveal Animations for Cards
            cardRefs.current.forEach((card, i) => {
                if (!card) return;
                gsap.fromTo(card,
                    { scale: 0.8, opacity: 0, rotation: i % 2 === 0 ? -10 : 10 },
                    {
                        scale: 1,
                        opacity: 1,
                        rotation: i % 2 === 0 ? -2 : 2, // Settle at the CSS rotation
                        duration: 0.8,
                        ease: 'back.out(1.7)',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 80%',
                        }
                    }
                );
            });

            // 2. Parallax Huge Years
            gsap.utils.toArray('.huge-year').forEach((year, i) => {
                gsap.to(year, {
                    y: 100,
                    scrollTrigger: {
                        trigger: year.parentElement,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1
                    }
                });
            });

            // 3. Update Path on Load & Resize
            updatePath();
            window.addEventListener('resize', updatePath);

        }, sectionRef);

        // Resize observer might be safer for images loading etc, but window resize is okay for now
        // A small delay to ensure layout is settled
        setTimeout(updatePath, 500);

        return () => {
            window.removeEventListener('resize', updatePath);
            ctx.revert();
        };
    }, []);

    return (
        <section
            id="experience"
            ref={sectionRef}
            style={{
                position: 'relative',
                overflow: 'hidden',
                padding: '8rem 0'
            }}
        >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative', zIndex: 10 }}>
                <h2 className="font-serif-italic" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 400, color: 'var(--text-primary)' }}>
                    The <span style={{ color: 'var(--red-primary)' }}>Journey</span>
                </h2>
                <p className="font-mono text-sm text-gray-500">// CASE FILE: CAREER HISTORY</p>
            </div>

            <div ref={containerRef} className="evidence-board">

                {/* Connection String (Canvas/SVG) */}
                <svg
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 0,
                        pointerEvents: 'none',
                        overflow: 'visible'
                    }}
                >
                    <path
                        ref={pathRef}
                        stroke="var(--red-primary)"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                    />
                </svg>

                {experiences.map((exp, i) => (
                    <div key={exp.id} className="evidence-item">
                        {/* Ref attached to the GROUP now, so the whole bundle animates together */}
                        <div
                            className="evidence-group"
                            ref={el => cardRefs.current[i] = el}
                            data-cursor="view"
                            data-cursor-text="OPEN CASE"
                        >
                            {/* Pin for String - Centered Top */}
                            <div className="string-pin" style={{
                                position: 'absolute',
                                top: '10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: '#881337', // Dark red pin
                                boxShadow: '0 2px 5px rgba(0,0,0,0.5), inset 0 2px 2px rgba(255,255,255,0.3)',
                                zIndex: 100 // Must be on top of paper
                            }}></div>

                            {/* Newspaper Clipping Layer */}
                            <div className="newspaper-clipping">
                                <div className="news-header font-display">DAILY TECH CHRONICLE</div>
                                <div className="news-content font-serif">
                                    <div className="news-col">
                                        LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT. NULLAM AUCTOR, NISI EGET ULTRICES TINCIDUNT, NUNC NIBH TINCIDUNT NUNC.
                                    </div>
                                    <div className="news-col">
                                        VIVAMUS ORNARE MAGNA QUIS TELLUS PRETIUM, AC TINCIDUNT IPSUM SOLLICITUDIN. CRAS VITAE IPSUM VELIT.
                                    </div>
                                </div>
                            </div>

                            {/* The Folder Card (Crumpled Note) */}
                            <div className="folder-card">
                                {/* Tape Visual */}
                                <div className="tape-corner"></div>

                                {/* Inner Content */}
                                <div style={{ position: 'relative', zIndex: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px dashed rgba(0,0,0,0.2)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                        <span className="font-mono" style={{ fontWeight: 700 }}>{exp.period}</span>
                                        <span className="font-mono" style={{ color: 'var(--red-primary)' }}>// {exp.id.toString().padStart(3, '0')}</span>
                                    </div>

                                    <h3 className="font-display" style={{ fontSize: '2.5rem', lineHeight: 1, marginBottom: '0.5rem' }}>
                                        {exp.title}
                                    </h3>
                                    <h4 className="font-serif-italic" style={{ fontSize: '1.25rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                                        @ {exp.company}
                                    </h4>

                                    <p className="font-sans" style={{ fontSize: '1rem', lineHeight: 1.5, fontWeight: 500, marginBottom: '2rem' }}>
                                        {exp.description}
                                    </p>

                                    {/* Tech Stamps */}
                                    <div className="tech-stamps" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', transform: 'rotate(-2deg)' }}>
                                        {exp.tech.map((tech) => (
                                            <span key={tech} className="tech-stamp-item" style={{
                                                border: '2px solid var(--red-primary)',
                                                color: 'var(--red-primary)',
                                                padding: '0.25rem 0.75rem',
                                                fontFamily: "'Permanent Marker', cursive", // or a rubber stamp font if available
                                                fontSize: '0.75rem',
                                                textTransform: 'uppercase',
                                                opacity: 0.8,
                                                maskImage: 'url(https://grainy-gradients.vercel.app/noise.svg)', // subtle texture if possible, else css border
                                                transform: `rotate(${Math.random() * 10 - 5}deg)`
                                            }}>
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Massive Year Background */}
                                <div className="huge-year font-display">
                                    {exp.year}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

            </div>
        </section>
    );
};

export default Experience;
