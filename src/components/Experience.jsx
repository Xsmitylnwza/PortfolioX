import { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import './Experience.css';

const TOOL_META = {
    React: { icon: 'simple-icons:react', tone: 'react' },
    'Spring Boot': { icon: 'simple-icons:springboot', tone: 'spring' },
    SQL: { icon: 'mdi:database-search', tone: 'sql' },
    MySQL: { icon: 'simple-icons:mysql', tone: 'mysql' },
    'Node.js': { icon: 'simple-icons:nodedotjs', tone: 'node' },
    'Elysia.js': { icon: 'skill-icons:elysia-dark', tone: 'elysia' },
    'Product Flows': { icon: 'lucide:workflow', tone: 'flow' },
    'Workflow Design': { icon: 'lucide:git-branch', tone: 'workflow' },
    Delivery: { icon: 'lucide:rocket', tone: 'delivery' },
    'API Integration': { icon: 'lucide:plug-zap', tone: 'api' },
    Prototyping: { icon: 'lucide:flask-conical', tone: 'proto' },
};

const resolveTool = (label) => {
    const meta = TOOL_META[label] || { icon: 'lucide:code-2', tone: 'default' };
    return { label, ...meta };
};

const experiences = [
    {
        id: '01',
        company: 'SCB - Siam Commercial Bank',
        role: 'Software Engineer (Part-time)',
        period: 'Oct 2025 - May 2026',
        logo: '/assets/optimized/scb-logo-128.png',
        summary: 'Re-architected AMLX so compliance rules live in the database, not behind engineering deploys.',
        detail: 'Turned the rule engine into a dynamic, database-driven system so business teams can change rules without code releases. Optimized React frontend and Spring Boot backend modules to clear legacy bottlenecks, and partnered with senior engineers and system analysts on complex AML workflow modernization.',
        tools: ['React', 'Spring Boot', 'SQL'],
    },
    {
        id: '02',
        company: 'TTB - TMBThanachart Bank',
        role: 'Software Engineer (Intern)',
        period: 'May 2025 - Sep 2025',
        logo: '/assets/optimized/ttb-logo-128.png',
        summary: 'Built an internal productivity dashboard adopted by 7 team leads and 100+ developers.',
        detail: 'Recognized at the TTB Townhall for improving team operations and visibility. Validated technical feasibility with senior engineers using Spring Boot, then designed user flows and backend features that streamlined cross-team communication for engineering leads.',
        tools: ['Spring Boot', 'Product Flows', 'Workflow Design'],
    },
    {
        id: '03',
        company: 'Freelance',
        role: 'Full-Stack Developer (Part-time)',
        period: 'Feb 2025 - Dec 2025',
        logo: '/icon.png',
        summary: 'Owned end-to-end delivery of production web apps alongside studies.',
        detail: 'Shipped client products with React, Spring Boot, and MySQL — architecture, implementation, testing, and deployment. Managed the full SDLC from requirements to final delivery so clients received scalable, maintainable systems.',
        tools: ['React', 'Spring Boot', 'MySQL', 'Delivery'],
    },
    {
        id: '04',
        company: 'Tomato Ideas Co., Ltd.',
        role: 'Full Stack Developer (Intern)',
        period: 'Jan 2025 - May 2025',
        logo: '/assets/optimized/tomato-logo-128.jpg',
        summary: 'Built middleware APIs and POCs that shaped the product roadmap.',
        detail: 'Designed a scalable middleware API with Node.js and Elysia.js to standardize third-party integrations. Prototyped and validated key POC features, then helped fold the strongest ideas into production for faster feature rollouts.',
        tools: ['Node.js', 'Elysia.js', 'API Integration', 'Prototyping'],
    },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (current, target, amount) => current + (target - current) * amount;
const nearlyEqual = (a, b, epsilon = 0.02) => Math.abs(a - b) < epsilon;

// Smoothstep keeps the wave soft near the center instead of linear/hard.
const smoothstep = (edge0, edge1, x) => {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
};

const Experience = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return undefined;

        const records = Array.from(section.querySelectorAll('.experience-record'));
        const intro = section.querySelector('.experience-room__intro');
        const papers = records.map((record) => record.querySelector('.experience-paper'));
        const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        const overlay = section.closest('.room-overlay');

        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        let revealed = false;
        let revealTimer = 0;

        const markFirstFocused = () => {
            if (records[0]) records[0].classList.add('is-focused');
        };

        const revealContent = () => {
            if (revealed) return;
            revealed = true;
            section.classList.add('is-revealed');
            markFirstFocused();
            // Stagger: intro paints with CSS; first card rises next frame so transitions run.
            window.requestAnimationFrame(() => {
                if (records[0]) records[0].classList.add('is-visible');
            });
        };

        const isEnterPhase = () => {
            if (!overlay) return true;
            return overlay.classList.contains('is-entering') || overlay.classList.contains('is-active');
        };

        const armReveal = () => {
            if (reducedMotionQuery.matches) {
                records.forEach((record) => record.classList.add('is-visible'));
                section.classList.add('is-revealed');
                markFirstFocused();
                revealed = true;
                return;
            }
            if (!isEnterPhase()) return;
            // Small delay after enter phase so the overlay fade starts first, then content.
            window.clearTimeout(revealTimer);
            revealTimer = window.setTimeout(revealContent, 90);
        };

        const onRoomEnter = (event) => {
            const to = event?.detail?.to;
            if (to && to !== '/experience') return;
            armReveal();
        };

        // If the page is already past boot (client nav from gallery), reveal immediately when mounted active/entering.
        armReveal();

        const phaseObserver = overlay
            ? new MutationObserver(() => armReveal())
            : null;
        phaseObserver?.observe(overlay, { attributes: true, attributeFilter: ['class'] });
        document.addEventListener('portfolio:room-content-enter', onRoomEnter);

        const clearMotionStyles = () => {
            papers.forEach((paper) => {
                if (!paper) return;
                paper.style.removeProperty('--paper-shift');
                paper.style.removeProperty('--paper-x');
                paper.style.removeProperty('--paper-tilt');
                paper.style.removeProperty('--paper-roll');
                paper.style.removeProperty('--paper-focus');
                paper.style.removeProperty('--paper-soft');
            });
            records.forEach((record) => {
                record.classList.remove('is-focused');
                record.style.removeProperty('--record-wave');
            });
            if (intro) {
                intro.style.removeProperty('--intro-shift');
                intro.style.removeProperty('--intro-fade');
                intro.style.removeProperty('--intro-x');
            }
        };

        const applyReducedMotionFallback = () => {
            records.forEach((record) => record.classList.add('is-visible'));
            clearMotionStyles();
        };

        if (reducedMotionQuery.matches || !('IntersectionObserver' in window)) {
            applyReducedMotionFallback();
            return undefined;
        }

        let depthArmed = false;
        let rafId = 0;
        let running = true;
        let needsSample = true;
        let scrollY = window.scrollY || 0;
        let lastScrollY = scrollY;
        let scrollVelocity = 0;

        // Wave state: each card has its own phase so motion feels like a traveling wave,
        // not a single rigid page slide.
        const motion = records.map((_, index) => ({
            shift: 0,
            x: 0,
            tilt: 0,
            roll: 0,
            focus: index === 0 ? 1 : 0.4,
            targetShift: 0,
            targetX: 0,
            targetTilt: 0,
            targetRoll: 0,
            targetFocus: index === 0 ? 1 : 0.62,
            phase: index * 0.72,
        }));

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
        );

        const sampleTargets = () => {
            if (!depthArmed || !running) return;

            const viewportHeight = window.innerHeight || 1;
            const viewportCenter = viewportHeight * 0.5;
            scrollY = window.scrollY || 0;
            const delta = scrollY - lastScrollY;
            // Low-pass velocity so cards keep "swimming" briefly after the wheel stops.
            scrollVelocity = lerp(scrollVelocity, delta, 0.22);
            lastScrollY = scrollY;

            let nearestIndex = 0;
            let nearestDistance = Number.POSITIVE_INFINITY;

            // Global wave clock from scroll position + residual velocity.
            const waveClock = scrollY * 0.0048 + scrollVelocity * 0.045;

            records.forEach((record, index) => {
                const state = motion[index];
                if (!state) return;

                const rect = record.getBoundingClientRect();
                const center = rect.top + rect.height * 0.5;
                const distance = Math.abs(viewportCenter - center);

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = index;
                }

                if (rect.bottom < -220 || rect.top > viewportHeight + 220) {
                    state.targetShift = 0;
                    state.targetX = 0;
                    state.targetTilt = 0;
                    state.targetRoll = 0;
                    state.targetFocus = 0.5;
                    record.style.setProperty('--record-wave', '0');
                    return;
                }

                // Normalized offset in viewport: -1 top ... 0 center ... 1 bottom
                const offset = clamp((center - viewportCenter) / (viewportHeight * 0.55), -1.35, 1.35);
                const side = index % 2 === 0 ? 1 : -1;
                const proximity = 1 - smoothstep(0.05, 1.05, Math.abs(offset));

                // Traveling sine wave with per-card phase: this is the "เธเธฅเธทเนเธ" feel.
                const wave = Math.sin(waveClock + state.phase + offset * 1.35);
                const wave2 = Math.sin(waveClock * 0.55 + state.phase * 1.4 - offset * 0.8);

                // Vertical bob + forward/back depth-ish shift.
                const ampY = finePointer ? 26 : 16;
                const ampX = finePointer ? 20 : 10;
                const ampTilt = finePointer ? 2.2 : 1.2;
                const ampRoll = finePointer ? 1.5 : 0.8;

                state.targetShift = offset * -18 + wave * ampY * 0.45 + scrollVelocity * 0.18;
                state.targetX = side * (12 + proximity * 8) * (0.28 + Math.abs(offset) * 0.5) + wave2 * ampX * side * 0.35;
                state.targetTilt = offset * -side * ampTilt + wave * 0.55;
                state.targetRoll = wave * ampRoll * side + scrollVelocity * 0.02 * side;
                state.targetFocus = 0.55 + proximity * 0.45;

                record.style.setProperty('--record-wave', wave.toFixed(3));
            });

            records.forEach((record, index) => {
                const state = motion[index];
                const isFocused = index === nearestIndex;
                record.classList.toggle('is-focused', isFocused);
                if (!state) return;

                if (isFocused) {
                    // Focused card rides the crest: less lateral chaos, more presence.
                    state.targetFocus = Math.min(1, Math.max(state.targetFocus, 0.9) + 0.08);
                    state.targetX *= 0.55;
                    state.targetRoll *= 0.65;
                } else {
                    state.targetFocus = Math.min(0.88, state.targetFocus);
                    // Neighbors exaggerate the wave so the stack feels alive.
                    state.targetX *= 1.05;
                    state.targetShift *= 1.03;
                }
            });

            if (intro) {
                const introRect = intro.getBoundingClientRect();
                const progress = clamp(-introRect.top / Math.max(introRect.height * 0.9, 1), 0, 1);
                const introWave = Math.sin(waveClock * 0.8) * (1 - progress);
                intro.style.setProperty('--intro-shift', `${(-progress * 28 + introWave * 6).toFixed(2)}px`);
                intro.style.setProperty('--intro-x', `${(introWave * 8).toFixed(2)}px`);
                intro.style.setProperty('--intro-fade', (1 - progress * 0.55).toFixed(3));
            }

            needsSample = false;
        };

        const tick = () => {
            if (!running) {
                rafId = 0;
                return;
            }

            if (needsSample) sampleTargets();

            // Different lag rates create a liquid/wave cascade instead of rigid motion.
            const lagY = 0.065;
            const lagX = 0.048;
            const lagTilt = 0.055;
            const lagRoll = 0.04;
            const focusLag = 0.06;
            let stillMoving = false;

            // Decay residual velocity when the user stops scrolling.
            scrollVelocity *= 0.9;
            if (Math.abs(scrollVelocity) > 0.05) {
                needsSample = true;
                stillMoving = true;
            }

            records.forEach((record, index) => {
                const paper = papers[index];
                const state = motion[index];
                if (!paper || !state) return;

                state.shift = lerp(state.shift, state.targetShift, lagY);
                state.x = lerp(state.x, state.targetX, lagX);
                state.tilt = lerp(state.tilt, state.targetTilt, lagTilt);
                state.roll = lerp(state.roll, state.targetRoll, lagRoll);
                state.focus = lerp(state.focus, state.targetFocus, focusLag);

                if (
                    !nearlyEqual(state.shift, state.targetShift, 0.12)
                    || !nearlyEqual(state.x, state.targetX, 0.12)
                    || !nearlyEqual(state.tilt, state.targetTilt, 0.02)
                    || !nearlyEqual(state.roll, state.targetRoll, 0.02)
                    || !nearlyEqual(state.focus, state.targetFocus, 0.005)
                ) {
                    stillMoving = true;
                }

                const soft = 1 - state.focus;
                paper.style.setProperty('--paper-shift', `${state.shift.toFixed(2)}px`);
                paper.style.setProperty('--paper-x', `${state.x.toFixed(2)}px`);
                paper.style.setProperty('--paper-tilt', `${state.tilt.toFixed(3)}deg`);
                paper.style.setProperty('--paper-roll', `${state.roll.toFixed(3)}deg`);
                paper.style.setProperty('--paper-focus', state.focus.toFixed(3));
                paper.style.setProperty('--paper-soft', soft.toFixed(3));
            });

            if (stillMoving || needsSample) {
                rafId = window.requestAnimationFrame(tick);
            } else {
                rafId = 0;
            }
        };

        const requestMotion = () => {
            needsSample = true;
            if (!depthArmed || !running) return;
            if (!rafId) rafId = window.requestAnimationFrame(tick);
        };

        const armId = window.requestAnimationFrame(() => {
            records.slice(1).forEach((record) => observer.observe(record));
            depthArmed = true;
            requestMotion();
        });

        const onReducedMotionChange = (event) => {
            if (!event.matches) return;
            running = false;
            if (rafId) window.cancelAnimationFrame(rafId);
            rafId = 0;
            observer.disconnect();
            applyReducedMotionFallback();
        };

        window.addEventListener('scroll', requestMotion, { passive: true });
        window.addEventListener('resize', requestMotion);
        if (typeof reducedMotionQuery.addEventListener === 'function') {
            reducedMotionQuery.addEventListener('change', onReducedMotionChange);
        } else if (typeof reducedMotionQuery.addListener === 'function') {
            reducedMotionQuery.addListener(onReducedMotionChange);
        }

        return () => {
            running = false;
            window.clearTimeout(revealTimer);
            phaseObserver?.disconnect();
            document.removeEventListener('portfolio:room-content-enter', onRoomEnter);
            window.cancelAnimationFrame(armId);
            if (rafId) window.cancelAnimationFrame(rafId);
            observer.disconnect();
            window.removeEventListener('scroll', requestMotion);
            window.removeEventListener('resize', requestMotion);
            if (typeof reducedMotionQuery.removeEventListener === 'function') {
                reducedMotionQuery.removeEventListener('change', onReducedMotionChange);
            } else if (typeof reducedMotionQuery.removeListener === 'function') {
                reducedMotionQuery.removeListener(onReducedMotionChange);
            }
            clearMotionStyles();
        };
    }, []);

    return (
        <section ref={sectionRef} id="experience" className="experience-room" aria-labelledby="experience-room-title">
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
                    <li className="experience-record" key={experience.id} id={`exp-${experience.id}`}>
                        <article
                            className="experience-paper"
                            style={{ '--paper-yaw': `${index % 2 === 0 ? 2.5 : -2.5}deg` }}
                        >
                            <header className="experience-paper__head">
                                <div className="experience-paper__brand">
                                    <img
                                        className="experience-paper__logo"
                                        src={experience.logo}
                                        alt=""
                                        width="112"
                                        height="112"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <div className="experience-paper__identity">
                                        <h2 className="experience-paper__company">{experience.company}</h2>
                                        <p className="experience-paper__role">{experience.role}</p>
                                    </div>
                                </div>
                                <div className="experience-paper__meta">
                                    <time className="experience-paper__period">{experience.period}</time>
                                    <span className="experience-paper__index" aria-hidden="true">{experience.id}</span>
                                </div>
                            </header>

                            <div className="experience-paper__body">
                                <p className="experience-paper__lead">{experience.summary}</p>
                                <p className="experience-paper__detail">{experience.detail}</p>
                            </div>

                                                        <footer className="experience-paper__footer" aria-label="Tools and stack">
                                <p className="experience-paper__stack-label">Tech stack</p>
                                <ul className="experience-paper__tools">
                                    {(Array.isArray(experience.tools) ? experience.tools : String(experience.tools).split(' / ')).map((toolName) => {
                                        const tool = resolveTool(toolName);
                                        return (
                                            <li
                                                className={`experience-paper__tool is-${tool.tone}`}
                                                key={`${experience.id}-${tool.label}`}
                                            >
                                                <span className="experience-paper__tool-icon" aria-hidden="true">
                                                    <Icon icon={tool.icon} width="18" height="18" />
                                                </span>
                                                <span className="experience-paper__tool-name">{tool.label}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </footer>
                        </article>
                    </li>
                ))}
            </ol>
        </section>
    );
};

export default Experience;