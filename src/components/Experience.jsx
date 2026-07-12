import { useEffect, useRef } from 'react';
import './Experience.css';

const experiences = [
    {
        id: '01',
        company: 'SCB - Siam Commercial Bank',
        role: 'Software Engineer (Contract)',
        period: 'Oct 2025 - Present',
        logo: '/assets/optimized/scb-logo-128.png',
        summary: 'Turning compliance rules into software that people can actually see, change, and operate.',
        detail: 'I re-architected an AMLX rule engine into database-driven configuration, then built the interfaces and services that made complex rule changes easier to manage and safer to release.',
        tools: 'React / Spring Boot / Spring Batch / SAS / SQL',
    },
    {
        id: '02',
        company: 'TTB - TMBThanachart Bank',
        role: 'Software Engineer (Intern)',
        period: 'May 2025 - Sep 2025',
        logo: '/assets/optimized/ttb-logo-128.png',
        summary: 'A team-lead problem became a shared workflow used across engineering teams.',
        detail: 'I translated a senior-led product direction into user flows and backend features, validating the technical path with senior engineers before the tool reached seven team leads and more than one hundred developers.',
        tools: 'Spring Boot / Product Flows / Workflow Design',
    },
    {
        id: '03',
        company: 'Freelance',
        role: 'Full Stack Developer',
        period: 'Feb 2025 - Present',
        logo: '/icon.png',
        summary: 'I own the complete path from an unclear request to a production-ready product.',
        detail: 'That means clarifying the real problem, choosing the architecture, building the interface and services, testing the result, and staying close enough to the client to refine what ships.',
        tools: 'React / Spring Boot / MySQL / Delivery',
    },
    {
        id: '04',
        company: 'Tomato Ideas Co., Ltd.',
        role: 'Full Stack Developer (Intern)',
        period: 'Jan 2025 - May 2025',
        logo: '/assets/optimized/tomato-logo-128.jpg',
        summary: 'Prototypes reduced uncertainty before the product committed to a technical direction.',
        detail: 'I researched and validated new features, then converted the strongest ideas into a scalable Node.js and Elysia.js integration layer for third-party services.',
        tools: 'Node.js / Elysia.js / API Integration / Prototyping',
    },
];

const Experience = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return undefined;

        const records = Array.from(section.querySelectorAll('.experience-record'));
        // First screen must already be painted; avoid wait-for-observer hitch on room enter.
        records.slice(0, 1).forEach((record) => record.classList.add('is-visible'));

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reducedMotion || !('IntersectionObserver' in window)) {
            records.forEach((record) => record.classList.add('is-visible'));
            return undefined;
        }

        let frame = 0;
        let depthArmed = false;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -4% 0px' },
        );

        // Defer observer + depth work one frame so first paint of the room stays clean.
        const armId = window.requestAnimationFrame(() => {
            records.slice(1).forEach((record) => observer.observe(record));
            depthArmed = true;
        });

        const updateDepth = () => {
            frame = 0;
            if (!depthArmed) return;
            const viewportCenter = window.innerHeight / 2;
            records.forEach((record, index) => {
                const paper = record.querySelector('.experience-paper');
                if (!paper) return;
                const rect = record.getBoundingClientRect();
                // Skip offscreen papers to cut main-thread cost on enter.
                if (rect.bottom < -120 || rect.top > window.innerHeight + 120) return;
                const offset = Math.max(-1, Math.min(1, (viewportCenter - (rect.top + rect.height / 2)) / window.innerHeight));
                const direction = index % 2 === 0 ? 1 : -1;
                paper.style.setProperty('--paper-shift', `${offset * 18}px`);
                paper.style.setProperty('--paper-tilt', `${offset * direction * 1.4}deg`);
            });
        };
        const requestDepthUpdate = () => {
            if (frame) return;
            frame = window.requestAnimationFrame(updateDepth);
        };

        window.addEventListener('scroll', requestDepthUpdate, { passive: true });
        window.addEventListener('resize', requestDepthUpdate);

        return () => {
            window.cancelAnimationFrame(armId);
            observer.disconnect();
            window.removeEventListener('scroll', requestDepthUpdate);
            window.removeEventListener('resize', requestDepthUpdate);
            if (frame) window.cancelAnimationFrame(frame);
        };
    }, []);

    return (
        <section ref={sectionRef} className="experience-room" aria-labelledby="experience-room-title">

            <header className="experience-room__intro">
                <p>02 / EXPERIENCE</p>
                <h1 id="experience-room-title">
                    WORK,
                    <em>IN CONTEXT.</em>
                </h1>
                <span>Four roles. Four environments. One continuous practice of turning uncertainty into working systems.</span>
            </header>

            <ol className="experience-room__records" aria-label="Work experience, newest first">
                {experiences.map((experience, index) => (
                    <li className={experience-record} key={experience.id}>
                        <article
                            className="experience-paper"
                            style={{ '--paper-yaw': `${index % 2 === 0 ? 4 : -4}deg` }}
                        >
                            <header className="experience-paper__head">
                                <img src={experience.logo} alt="" width="72" height="72" loading="lazy" decoding="async" />
                                <div>
                                    <time>{experience.period}</time>
                                    <p>{experience.role}</p>
                                </div>
                                <span>{experience.id}</span>
                            </header>

                            <div className="experience-paper__body">
                                <h2>{experience.company}</h2>
                                <p className="experience-paper__lead">{experience.summary}</p>
                                <p>{experience.detail}</p>
                            </div>

                            <footer>{experience.tools}</footer>
                        </article>
                    </li>
                ))}
            </ol>
        </section>
    );
};

export default Experience;
