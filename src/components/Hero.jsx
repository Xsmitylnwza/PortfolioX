import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Hero.css';

gsap.registerPlugin(ScrollTrigger);

const chaosLetters = [
    { letter: 'C', tilt: '-8deg', lift: '-0.08em', shift: '-0.03em' },
    { letter: 'H', tilt: '5deg', lift: '0.08em', shift: '0.01em' },
    { letter: 'A', tilt: '-3deg', lift: '-0.02em', shift: '-0.01em' },
    { letter: 'O', tilt: '8deg', lift: '0.06em', shift: '0.02em' },
    { letter: 'S', tilt: '-6deg', lift: '-0.06em', shift: '0.03em' },
];

const Hero = () => {
    const heroRef = useRef(null);
    const collageRef = useRef(null);
    const pointerSettersRef = useRef(null);
    const pointerRef = useRef({ x: 0, y: 0, frame: null });

    useEffect(() => {
        const hero = heroRef.current;
        const pointer = pointerRef.current;
        if (!hero) return undefined;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const ctx = gsap.context(() => {
            if (reduceMotion) {
                gsap.set('[data-hero-reveal]', { opacity: 1, y: 0 });
                gsap.set('.signal-readout, .signal-transition', { opacity: 1, y: 0 });
                return;
            }

            gsap.timeline({ defaults: { ease: 'power3.out' } })
                .fromTo('.signal-index', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45 })
                .fromTo('.hero-line', { opacity: 0, yPercent: 75 }, { opacity: 1, yPercent: 0, duration: 0.78, stagger: 0.09 }, '-=0.18')
                .fromTo('.signal-collage', { opacity: 0, scale: 0.92, rotate: 3 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.9 }, '-=0.72')
                .fromTo('[data-hero-reveal]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.62, stagger: 0.08 }, '-=0.52');

            const mm = gsap.matchMedia();

            mm.add('(min-width: 821px)', () => {
                pointerSettersRef.current = {
                    x: gsap.quickTo(collageRef.current, 'x', { duration: 0.55, ease: 'power3.out' }),
                    y: gsap.quickTo(collageRef.current, 'y', { duration: 0.55, ease: 'power3.out' }),
                };

                const story = gsap.timeline({
                    scrollTrigger: {
                        trigger: hero,
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: 0.65,
                        invalidateOnRefresh: true,
                    },
                });

                story
                    .to('.chaos-letter', { x: 0, y: 0, rotation: 0, stagger: 0.025, ease: 'power2.inOut' }, 0)
                    .to('.signal-portrait', { xPercent: -8, yPercent: -3, rotation: -1.5, ease: 'none' }, 0)
                    .to('.signal-artifact', { xPercent: 13, yPercent: 8, rotation: 1.5, ease: 'none' }, 0)
                    .to('.signal-wire-progress', { scaleX: 1, ease: 'none' }, 0)
                    .to('.signal-readout', { opacity: 1, y: 0, duration: 0.35 }, 0.34)
                    .to('.signal-chaos-note', { opacity: 0.16, xPercent: -12, duration: 0.3 }, 0.42)
                    .to('.signal-transition', { opacity: 1, y: 0, duration: 0.32 }, 0.62)
                    .to('.hero-scroll-cue', { opacity: 0, y: 14, duration: 0.2 }, 0.72);

                return () => {
                    pointerSettersRef.current = null;
                };
            });

            mm.add('(max-width: 820px)', () => {
                const story = gsap.timeline({
                    scrollTrigger: {
                        trigger: hero,
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: 0.45,
                    },
                });

                story
                    .to('.chaos-letter', { x: 0, y: 0, rotation: 0, stagger: 0.02, ease: 'power2.inOut' }, 0)
                    .to('.signal-wire-progress', { scaleX: 1, ease: 'none' }, 0)
                    .to('.signal-readout', { opacity: 1, y: 0, duration: 0.35 }, 0.34)
                    .to('.signal-transition', { opacity: 1, y: 0, duration: 0.3 }, 0.64);
            });

            return () => mm.revert();
        }, hero);

        return () => {
            if (pointer.frame) cancelAnimationFrame(pointer.frame);
            pointerSettersRef.current = null;
            ctx.revert();
        };
    }, []);

    const handlePointerMove = (event) => {
        if (!pointerSettersRef.current) return;

        const rect = heroRef.current.getBoundingClientRect();
        pointerRef.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
        pointerRef.current.y = ((event.clientY - rect.top) / window.innerHeight - 0.5) * 14;
        if (pointerRef.current.frame) return;

        pointerRef.current.frame = requestAnimationFrame(() => {
            pointerSettersRef.current?.x(pointerRef.current.x);
            pointerSettersRef.current?.y(pointerRef.current.y);
            pointerRef.current.frame = null;
        });
    };

    const resetPointer = () => {
        pointerSettersRef.current?.x(0);
        pointerSettersRef.current?.y(0);
    };

    return (
        <section
            id="home"
            ref={heroRef}
            className="story-hero"
            aria-labelledby="hero-title"
            onPointerMove={handlePointerMove}
            onPointerLeave={resetPointer}
        >
            <div className="hero-stage">
                <div className="signal-grid" aria-hidden="true" />
                <div className="signal-wire" aria-hidden="true">
                    <span className="signal-wire-progress" />
                </div>

                <header className="signal-topline signal-index">
                    <span><strong>00</strong> / SIGNAL</span>
                    <span>CHAIMONGKON SOKGAMPANG</span>
                    <span className="signal-availability"><i /> BANGKOK · OPEN TO BUILD</span>
                </header>

                <div className="hero-layout">
                    <div className="hero-copy-block">
                        <p className="signal-kicker signal-index">FULL-STACK · BACKEND · DEVOPS</p>
                        <h1 id="hero-title" className="hero-title" aria-label="I turn chaos into systems">
                            <span className="hero-line hero-line-small">I TURN</span>
                            <span className="hero-line chaos-word" aria-hidden="true">
                                {chaosLetters.map(({ letter, tilt, lift, shift }, index) => (
                                    <span
                                        key={`${letter}-${index}`}
                                        className="chaos-letter"
                                        style={{ '--tilt': tilt, '--lift': lift, '--shift': shift }}
                                    >
                                        {letter}
                                    </span>
                                ))}
                            </span>
                            <span className="hero-line systems-word">
                                <span className="systems-prefix">INTO</span>{' '}
                                <span className="systems-core">SYSTEMS<span className="systems-dot">.</span></span>
                            </span>
                        </h1>

                        <p className="hero-thesis" data-hero-reveal>
                            Software engineer building dependable banking and fintech products—from first constraint to production pipeline.
                        </p>

                        <div className="hero-actions" data-hero-reveal>
                            <a className="hero-primary-action" href="#projects">
                                Enter selected work <span aria-hidden="true">↘</span>
                            </a>
                            <a className="hero-text-action" href="/assets/Chaimongkon-Sokgampang_Resume.pdf" target="_blank" rel="noreferrer">
                                Read résumé <span aria-hidden="true">↗</span>
                            </a>
                        </div>

                        <ul className="hero-disciplines" data-hero-reveal aria-label="Core disciplines">
                            <li><span>01</span> Product systems</li>
                            <li><span>02</span> Reliable APIs</li>
                            <li><span>03</span> Delivery pipelines</li>
                        </ul>
                    </div>

                    <div ref={collageRef} className="signal-collage" aria-label="Portrait and engineering work artifacts">
                        <p className="signal-chaos-note" aria-hidden="true">messy inputs / clear outcomes</p>

                        <figure className="signal-frame signal-portrait" data-cursor="view" data-cursor-text="HELLO">
                            <span className="paper-tape" aria-hidden="true" />
                            <img src="/assets/story/portrait.jpg" alt="Chaimongkon Sokgampang" fetchPriority="high" />
                            <figcaption>
                                <span>DEV.GABRIEL</span>
                                <span>PORTRAIT / 001</span>
                            </figcaption>
                        </figure>

                        <figure className="signal-frame signal-artifact" aria-hidden="true">
                            <img src="/assets/story/workstation.jpg" alt="" decoding="async" />
                            <figcaption>FIELD NOTE / BUILDING BETWEEN MEETINGS</figcaption>
                        </figure>

                        <div className="signal-code-card" aria-hidden="true">
                            <span>PRODUCTION_NOTE.md</span>
                            <code>
                                constraint → model<br />
                                model → interface<br />
                                interface → shipped
                            </code>
                        </div>

                        <div className="signal-readout" aria-hidden="true">
                            <span>SIGNAL LOCKED</span>
                            <strong>ENGINEER / STORYTELLER</strong>
                            <i>Chaos mapped. System ready.</i>
                        </div>

                        <svg className="signal-scribble" viewBox="0 0 220 120" aria-hidden="true">
                            <path d="M8 91c42-54 87 35 126-18 18-24 35-29 74-24" />
                            <path d="m191 35 17 14-21 10" />
                        </svg>
                    </div>
                </div>

                <div className="signal-transition" aria-hidden="true">
                    <span>Signal acquired</span>
                    <strong>NEXT / SELECTED WORK</strong>
                    <span>01</span>
                </div>

                <div className="hero-scroll-cue" data-hero-reveal aria-hidden="true">
                    <span>SCROLL TO RESOLVE</span>
                    <i />
                </div>
            </div>
        </section>
    );
};

export default Hero;
