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
            glowColor: 'var(--bg-black)',
        },
        {
            id: 2,
            period: 'MID-LEVEL',
            year: '2023',
            title: 'Creative Technologist',
            company: 'Creative Pulse',
            description: 'Bridging the gap between design and engineering. WebGL, GSAP, and chaos.',
            glowColor: 'var(--red-primary)',
        },
        {
            id: 3,
            period: 'JUNIOR',
            year: '2021',
            title: 'Frontend Developer',
            company: 'StartUp Flow',
            description: 'The beginning of the journey. React, state management, and sleepless nights.',
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
            // Calculate center point relative to container
            const x = rect.left + rect.width / 2 - containerRect.left;
            const y = rect.top + rect.height / 2 - containerRect.top;
            return { x, y };
        });

        // Construct Polyline String
        // Start from top center of container? Or first card? Let's do first card.
        let pathStr = `M ${points[0].x} ${points[0].y}`;

        for (let i = 1; i < points.length; i++) {
            // Bezier curve or straight line? Zig Zag suggests straight, but "String" implies organic.
            // Let's do a "Slack String" curve (Quadratic Bezier) roughly dropping down then up? 
            // Or just jagged straight lines for the "Detective Board" feel.
            pathStr += ` L ${points[i].x} ${points[i].y}`;
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
                padding: '4rem 0'
            }}
        >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative', zIndex: 10 }}>
                <h2 className="font-display" style={{ fontSize: '3rem', fontWeight: 900, textTransform: 'uppercase' }}>
                    The <span style={{ color: 'var(--red-primary)', fontStyle: 'italic' }}>Evidence</span>
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
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    // filter="drop-shadow(0 0 5px var(--red-primary))" 
                    // Drop shadow on SVG path can be expensive, maybe avoid for perf
                    />
                    {/* Pins/Circles at joints could be added here if we calculated coords in state */}
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
                            {/* Newspaper Clipping Layer */}
                            <div className="newspaper-clipping">
                                <div className="news-header">DAILY TECH CHRONICLE</div>
                                <div className="news-content">
                                    <div className="news-col">
                                        LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT. NULLAM AUCTOR, NISI EGET ULTRICES TINCIDUNT, NUNC NIBH TINCIDUNT NUNC.
                                        <br /><br />
                                        SED EUISMOD, NISI VEL CONSECTETUR INTERDUM, NISL NUNC TINCIDUNT NUNC.
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
                                    <h4 style={{ fontSize: '1.25rem', fontFamily: 'serif', fontStyle: 'italic', marginBottom: '1.5rem', opacity: 0.8 }}>
                                        @ {exp.company}
                                    </h4>

                                    <p style={{ fontSize: '1rem', lineHeight: 1.5, fontWeight: 500 }}>
                                        {exp.description}
                                    </p>
                                </div>

                                {/* Massive Year Background */}
                                <div className="huge-year">
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
