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
    const cardRefs = useRef([]);

    const experiences = [
        {
            id: 1,
            period: 'PRESENT',
            year: 'Oct 2025',
            title: 'Software Engineer (Contract)',
            company: 'SCB Siam Commercial Bank',
            description: 'Re-architected AMLX rule engine into a database-driven system. Enhanced modules in React and Spring Boot.',
            tech: ['React', 'Spring Boot', 'SQL'],
            logo: '/scb-logo.png',
            glowColor: 'var(--bg-black)',
        },
        {
            id: 2,
            period: 'INTERNSHIP',
            year: 'May-Sep 2025',
            title: 'Software Engineer (Intern)',
            company: 'TTB (TMBThanachart Bank)',
            description: 'Built an internal productivity dashboard adopted by 7 team leads and used by 100+ developers.',
            tech: ['React', 'Data Viz', 'Tools'],
            logo: '/ttb-logo.png',
            glowColor: 'var(--red-primary)',
        },
        {
            id: 3,
            period: 'FREELANCE',
            year: 'Feb 2025',
            title: 'Fullstack Developer',
            company: 'Freelance',
            description: 'Delivering end-to-end web applications using React, Spring Boot, and PostgreSQL for global clients.',
            tech: ['React', 'Spring Boot', 'PostgreSQL'],
            logo: '/icon.png', // Fallback to icon for freelance
            glowColor: '#a855f7',
        },
        {
            id: 4,
            period: 'INTERNSHIP',
            year: 'Jan-May 2025',
            title: 'Fullstack Developer (Intern)',
            company: 'TOMATO ideas',
            description: 'Developed POC features and middleware APIs using Node.js and Elysia.js.',
            tech: ['Node.js', 'Elysia.js', 'Bun'],
            logo: '/tomato-logo.jpg',
            glowColor: '#3b82f6',
        },
    ];

    const updatePath = () => {
        if (!containerRef.current || !pathRef.current || cardRefs.current.length === 0) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const points = cardRefs.current.map(card => {
            if (!card) return [0, 0];
            const rect = card.getBoundingClientRect();
            const x = rect.left + rect.width / 2 - containerRect.left;
            const y = rect.top + 20 - containerRect.top;
            return { x, y };
        });

        let pathStr = `M ${points[0].x} ${points[0].y}`;

        for (let i = 1; i < points.length; i++) {
            const p1 = points[i - 1];
            const p2 = points[i];
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2 + 50;
            pathStr += ` Q ${midX} ${midY + (Math.random() * 20)} ${p2.x} ${p2.y}`;
        }

        pathRef.current.setAttribute('d', pathStr);

        const length = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length });

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
            cardRefs.current.forEach((card, i) => {
                if (!card) return;
                gsap.fromTo(card,
                    { scale: 0.8, opacity: 0, rotation: i % 2 === 0 ? -10 : 10 },
                    {
                        scale: 1,
                        opacity: 1,
                        rotation: i % 2 === 0 ? -2 : 2,
                        duration: 0.8,
                        ease: 'back.out(1.7)',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 80%',
                        }
                    }
                );
            });

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

            updatePath();
            window.addEventListener('resize', updatePath);

        }, sectionRef);

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
            <div style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative', zIndex: 10 }}>
                <h2 className="font-serif-italic" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 400, color: 'var(--text-primary)' }}>
                    The <span style={{ color: 'var(--red-primary)' }}>Journey</span>
                </h2>
                <p className="font-mono text-sm text-gray-500">// CASE FILE: CAREER HISTORY</p>
            </div>

            <div ref={containerRef} className="evidence-board">

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
                        <div
                            className="evidence-group"
                            ref={el => cardRefs.current[i] = el}
                            data-cursor="view"
                            data-cursor-text="OPEN CASE"
                        >
                            <div className="string-pin" style={{
                                position: 'absolute',
                                top: '10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: '#881337',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.5), inset 0 2px 2px rgba(255,255,255,0.3)',
                                zIndex: 100
                            }}></div>

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

                            <div className="folder-card">
                                <div className="tape-corner"></div>

                                <div style={{ position: 'relative', zIndex: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px dashed rgba(0,0,0,0.2)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                        <span className="font-mono" style={{ fontWeight: 700 }}>{exp.period}</span>
                                        <span className="font-mono" style={{ color: 'var(--red-primary)' }}>// {exp.id.toString().padStart(3, '0')}</span>
                                    </div>

                                    <h3 className="font-display" style={{ fontSize: '2.5rem', lineHeight: 1, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        {exp.logo && <img src={exp.logo} alt={exp.company} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />}
                                        {exp.company}
                                    </h3>

                                    <h4 className="font-serif-italic" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                                        {exp.title}
                                    </h4>

                                    <p className="font-sans" style={{ fontSize: '1rem', lineHeight: 1.5, fontWeight: 500, marginBottom: '2rem' }}>
                                        {exp.description}
                                    </p>

                                    <div className="tech-stamps" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', transform: 'rotate(-2deg)' }}>
                                        {exp.tech.map((tech) => (
                                            <span key={tech} className="tech-stamp-item" style={{
                                                border: '2px solid var(--red-primary)',
                                                color: 'var(--red-primary)',
                                                padding: '0.25rem 0.75rem',
                                                fontFamily: "'Permanent Marker', cursive",
                                                fontSize: '0.75rem',
                                                textTransform: 'uppercase',
                                                opacity: 0.8,
                                                maskImage: 'url(https://grainy-gradients.vercel.app/noise.svg)',
                                                transform: `rotate(${Math.random() * 10 - 5}deg)`
                                            }}>
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

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
