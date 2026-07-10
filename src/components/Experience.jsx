import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Experience.css';

gsap.registerPlugin(ScrollTrigger);

const experiences = [
    {
        id: '01',
        signal: 'CURRENT SYSTEM',
        company: 'SCB — Siam Commercial Bank',
        role: 'Software Engineer (Contract)',
        startDate: '2025-10-01',
        startLabel: '01 Oct 2025',
        endLabel: 'Present',
        logo: '/assets/optimized/scb-logo-128.png',
        before: 'Deployment-bound rules',
        after: 'Database-driven configuration',
        proofValue: 'RULES → DATA',
        proofLabel: 'Dynamic AMLX configuration',
        summary: 'Re-architecting compliance workflows so complex rule changes become visible, configurable, and easier to operate.',
        evidence: [
            'Re-architected the AMLX rule engine into a dynamic, database-driven configuration with a visual rule-management UI.',
            'Enhanced React, Spring Boot, Spring Batch, SAS, and SQL modules to improve reliability and reduce AML processing failures.',
        ],
        tech: ['React', 'Spring Boot', 'Spring Batch', 'SAS', 'SQL'],
    },
    {
        id: '02',
        signal: 'ADOPTED TOOL',
        company: 'TTB — TMBThanachart Bank',
        role: 'Software Engineer (Intern)',
        startDate: '2025-05-19',
        startLabel: '19 May 2025',
        endDate: '2025-09-01',
        endLabel: '01 Sep 2025',
        logo: '/assets/optimized/ttb-logo-128.png',
        before: 'Team-lead pain points',
        after: 'Shared productivity workflow',
        proofValue: '100+',
        proofLabel: 'Developers across 7 team leads',
        summary: 'Turned operational friction into an internal dashboard with measurable reach across engineering teams.',
        evidence: [
            'Translated a senior-led product vision into user flows and Spring Boot backend features, then validated feasibility with senior engineers.',
            'Delivered a tool adopted by 7 team leads supporting 100+ developers and showcased at the TTB Townhall.',
        ],
        tech: ['Spring Boot', 'User flows', 'Workflow design'],
    },
    {
        id: '03',
        signal: 'CLIENT DELIVERY',
        company: 'Freelance',
        role: 'Full Stack Developer',
        startDate: '2025-02-17',
        startLabel: '17 Feb 2025',
        endLabel: 'Present',
        logo: '/icon.png',
        before: 'Client requirements',
        after: 'Production-ready products',
        proofValue: 'END → END',
        proofLabel: 'Architecture through deployment',
        summary: 'Owned the whole delivery loop: understand the problem, choose the architecture, build, test, and ship.',
        evidence: [
            'Owned architecture, implementation, testing, and deployment for React, Spring Boot, and MySQL web applications.',
            'Worked directly with clients to clarify requirements, propose solutions, and iterate toward production readiness.',
        ],
        tech: ['React', 'Spring Boot', 'MySQL'],
    },
    {
        id: '04',
        signal: 'PRODUCT R&D',
        company: 'Tomato Ideas Co., Ltd.',
        role: 'Full Stack Developer (Intern)',
        startDate: '2025-01-05',
        startLabel: '05 Jan 2025',
        endDate: '2025-05-15',
        endLabel: '15 May 2025',
        logo: '/assets/optimized/tomato-logo-128.jpg',
        before: 'Uncertain product direction',
        after: 'Validated technical paths',
        proofValue: 'POC → PROD',
        proofLabel: 'Research translated into delivery',
        summary: 'Used prototypes to reduce uncertainty, then converted validated ideas into reliable integration architecture.',
        evidence: [
            'Researched and validated POC features that informed product direction and accelerated decision-making.',
            'Built a scalable Node.js and Elysia.js middleware API for more reliable third-party service integrations.',
        ],
        tech: ['Node.js', 'Elysia.js', 'API integrations'],
    },
];

const Experience = () => {
    const sectionRef = useRef(null);
    const storyRef = useRef(null);

    useLayoutEffect(() => {
        const section = sectionRef.current;
        const story = storyRef.current;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!section || !story || reducedMotion) return undefined;

        const ctx = gsap.context(() => {
            const intro = section.querySelector('.evidence-chapter__intro-inner');
            const cards = gsap.utils.toArray('.evidence-scene__content');
            const markers = gsap.utils.toArray('.evidence-scene__marker');
            const cableFill = section.querySelector('.evidence-cable__fill');
            const outro = section.querySelector('.evidence-chapter__outro');

            gsap.set(intro, { opacity: 0, y: 56 });
            gsap.set(cards, { opacity: 0, y: 72, scale: 0.965 });
            gsap.set(markers, { opacity: 0.2, scale: 0.65 });
            gsap.set(cableFill, { scaleY: 0, transformOrigin: 'top center' });
            gsap.set(outro, { opacity: 0, y: 48 });

            const timeline = gsap.timeline({
                defaults: { ease: 'power2.out' },
                scrollTrigger: {
                    trigger: section,
                    start: 'top 82%',
                    end: 'bottom 76%',
                    scrub: 0.55,
                    invalidateOnRefresh: true,
                },
            });

            timeline
                .to(intro, { opacity: 1, y: 0, duration: 0.65 }, 0)
                .to(cableFill, { scaleY: 1, duration: experiences.length + 0.9, ease: 'none' }, 0.35);

            cards.forEach((card, index) => {
                const revealAt = 0.8 + index;

                timeline
                    .to(markers[index], { opacity: 1, scale: 1, duration: 0.32 }, revealAt)
                    .to(card, { opacity: 1, y: 0, scale: 1, duration: 0.58 }, revealAt + 0.06);
            });

            timeline.to(outro, { opacity: 1, y: 0, duration: 0.55 }, experiences.length + 0.45);
        }, section);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="experience"
            ref={sectionRef}
            className="evidence-chapter"
            aria-labelledby="evidence-title"
        >
            <header className="evidence-chapter__intro">
                <div className="evidence-chapter__intro-inner">
                    <div className="evidence-chapter__index" aria-hidden="true">
                        <span>CHAPTER</span>
                        <strong>02</strong>
                        <span>OF 04</span>
                    </div>

                    <div className="evidence-chapter__heading">
                        <p className="evidence-chapter__eyebrow">
                            <span aria-hidden="true" /> Evidence / work history
                        </p>
                        <h2 id="evidence-title">
                            THE WORK
                            <span>HOLDS.</span>
                        </h2>
                    </div>

                    <div className="evidence-chapter__brief">
                        <p>
                            A rewind through four environments where ideas met real constraints:
                            regulated banking, team operations, client delivery, and product R&amp;D.
                        </p>
                        <div className="evidence-chapter__thesis" aria-label="From chaos to systems">
                            <span>CHAOS</span>
                            <i aria-hidden="true"><b /></i>
                            <span>SYSTEMS</span>
                        </div>
                        <span className="evidence-chapter__instruction">SCROLL TO REWIND / 04 FILES</span>
                    </div>
                </div>
            </header>

            <div ref={storyRef} className="evidence-story">
                <div className="evidence-cable" aria-hidden="true">
                    <span className="evidence-cable__track" />
                    <span className="evidence-cable__fill" />
                </div>

                <ol className="evidence-sequence" aria-label="Work experience, newest first">
                    {experiences.map((experience) => (
                        <li className="evidence-scene" key={experience.id}>
                            <span className="evidence-scene__marker" aria-hidden="true">
                                <i />
                                {experience.id}
                            </span>

                            <div className="evidence-scene__content">
                                <article className="evidence-card" aria-labelledby={`experience-${experience.id}`}>
                                    <div className="evidence-card__tape" aria-hidden="true" />

                                    <header className="evidence-card__header">
                                        <div className="evidence-card__case-meta">
                                            <span>CASE / E-{experience.id}</span>
                                            <span>{experience.signal}</span>
                                        </div>

                                        <div className="evidence-card__identity">
                                            <img
                                                src={experience.logo}
                                                alt=""
                                                width="64"
                                                height="64"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            <div>
                                                <h3 id={`experience-${experience.id}`}>{experience.company}</h3>
                                                <p>{experience.role}</p>
                                            </div>
                                        </div>

                                        <p className="evidence-card__period">
                                            <time dateTime={experience.startDate}>{experience.startLabel}</time>
                                            <span aria-hidden="true">—</span>
                                            {experience.endDate ? (
                                                <time dateTime={experience.endDate}>{experience.endLabel}</time>
                                            ) : (
                                                <span>{experience.endLabel}</span>
                                            )}
                                        </p>
                                    </header>

                                    <div className="evidence-card__transformation" aria-label="System transformation">
                                        <span>{experience.before}</span>
                                        <i aria-hidden="true">→</i>
                                        <strong>{experience.after}</strong>
                                    </div>

                                    <div className="evidence-card__body">
                                        <div className="evidence-card__proof">
                                            <span>PROOF POINT</span>
                                            <strong>{experience.proofValue}</strong>
                                            <p>{experience.proofLabel}</p>
                                        </div>

                                        <div className="evidence-card__copy">
                                            <p className="evidence-card__summary">{experience.summary}</p>
                                            <ul>
                                                {experience.evidence.map((item) => <li key={item}>{item}</li>)}
                                            </ul>
                                        </div>
                                    </div>

                                    <footer className="evidence-card__footer">
                                        <span>STACK / METHODS</span>
                                        <ul aria-label={`Technologies and methods used at ${experience.company}`}>
                                            {experience.tech.map((item) => <li key={item}>{item}</li>)}
                                        </ul>
                                    </footer>
                                </article>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>

            <footer className="evidence-chapter__outro">
                <span className="evidence-chapter__outro-index">02 / COMPLETE</span>
                <p>Signals became decisions.<br />Decisions became <em>systems.</em></p>
                <span className="evidence-chapter__next">NEXT — THE ENGINE BEHIND THE WORK</span>
            </footer>
        </section>
    );
};

export default Experience;
