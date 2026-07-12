import { lazy, Suspense, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '../data/projects';
import './Projects.css';

gsap.registerPlugin(ScrollTrigger);

const ProjectConstellation = lazy(() => import('./ProjectConstellation'));

const FEATURED_IDS = ['keshi-pomodoro', 'zucchini-review', 'decrypt-password'];

const PROJECT_SIGNALS = {
    'keshi-pomodoro': {
        line: 'Focus, treated as atmosphere.',
        detail: 'Timer states / sound / motion'
    },
    'zucchini-review': {
        line: 'Community, shaped into product.',
        detail: 'Search / identity / weighted reviews'
    },
    'decrypt-password': {
        line: 'Rules, turned into pressure and play.',
        detail: 'Validation / time / game state'
    }
};

const getCategory = (project) => project.category.split(/\s/)[0].toUpperCase();

const Projects = () => {
    const sectionRef = useRef(null);
    const [viewMode, setViewMode] = useState('flow');
    const [activeFilter, setActiveFilter] = useState('ALL');

    const featuredProjects = useMemo(
        () => FEATURED_IDS
            .map((id) => projects.find((project) => project.id === id))
            .filter(Boolean),
        []
    );

    const archiveProjects = useMemo(
        () => projects.filter((project) => !FEATURED_IDS.includes(project.id)),
        []
    );

    const filters = useMemo(
        () => ['ALL', ...new Set(projects.map(getCategory))],
        []
    );

    const filteredProjects = useMemo(
        () => activeFilter === 'ALL'
            ? projects
            : projects.filter((project) => getCategory(project) === activeFilter),
        [activeFilter]
    );

    useLayoutEffect(() => {
        const section = sectionRef.current;
        if (!section) return undefined;

        let refreshFrame = 0;
        const refresh = () => {
            window.cancelAnimationFrame(refreshFrame);
            refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
        };
        const resizeObserver = new ResizeObserver(refresh);
        resizeObserver.observe(section);

        let context;
        let matchMedia;
        if (viewMode === 'flow') {
            context = gsap.context(() => {
                matchMedia = gsap.matchMedia();

                matchMedia.add('(min-width: 821px) and (prefers-reduced-motion: no-preference)', () => {
                    const wall = section.querySelector('.work-wall');
                    const keshi = section.querySelector('[data-work-card="keshi-pomodoro"]');
                    const zucchini = section.querySelector('[data-work-card="zucchini-review"]');
                    const decrypt = section.querySelector('[data-work-card="decrypt-password"]');
                    const intro = section.querySelector('.work-wall__intro');
                    const progress = section.querySelector('.work-wall__progress-fill');
                    const notes = gsap.utils.toArray('.work-wall__note');
                    const ending = section.querySelector('.work-wall__ending');

                    if (!wall || !keshi || !zucchini || !decrypt) return undefined;

                    gsap.set(keshi, { xPercent: 0, yPercent: 0, scale: 1, zIndex: 5 });
                    gsap.set(zucchini, { xPercent: 0, yPercent: 0, scale: 0.66, zIndex: 4 });
                    gsap.set(decrypt, { xPercent: 0, yPercent: 0, scale: 0.42, zIndex: 3 });
                    gsap.set(notes, { autoAlpha: 0, y: 14 });
                    gsap.set(ending, { autoAlpha: 0, y: 12 });
                    gsap.set(progress, { scaleX: 0, transformOrigin: 'left center' });

                    const timeline = gsap.timeline({
                        defaults: { ease: 'none' },
                        scrollTrigger: {
                            trigger: wall,
                            start: 'top top',
                            end: 'bottom bottom',
                            scrub: 0.6,
                            invalidateOnRefresh: true
                        }
                    });

                    timeline
                        .to(progress, { scaleX: 1, duration: 1 }, 0)
                        .to(intro, { autoAlpha: 0, y: -18, duration: 0.12 }, 0.08)
                        .to(notes[0], { autoAlpha: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.13)
                        .to(notes[0], { autoAlpha: 0, y: -12, duration: 0.07 }, 0.24)
                        .to(keshi, {
                            xPercent: 123,
                            yPercent: 60,
                            scale: 0.58,
                            zIndex: 4,
                            duration: 0.13,
                            ease: 'power2.inOut'
                        }, 0.28)
                        .to(decrypt, {
                            xPercent: -82,
                            yPercent: -85,
                            scale: 0.52,
                            zIndex: 5,
                            duration: 0.15,
                            ease: 'power2.inOut'
                        }, 0.3)
                        .to(zucchini, {
                            xPercent: -118,
                            yPercent: 5,
                            scale: 0.95,
                            zIndex: 6,
                            duration: 0.17,
                            ease: 'power2.inOut'
                        }, 0.42)
                        .to(notes[1], { autoAlpha: 1, y: 0, duration: 0.09, ease: 'power2.out' }, 0.49)
                        .to(notes[1], { autoAlpha: 0, y: -12, duration: 0.07 }, 0.59)
                        .to(zucchini, {
                            xPercent: 10,
                            yPercent: 45,
                            scale: 0.58,
                            zIndex: 3,
                            duration: 0.14,
                            ease: 'power2.inOut'
                        }, 0.62)
                        .to(keshi, {
                            xPercent: 0,
                            yPercent: -20,
                            scale: 0.52,
                            zIndex: 4,
                            duration: 0.14,
                            ease: 'power2.inOut'
                        }, 0.64)
                        .to(decrypt, {
                            xPercent: -82,
                            yPercent: -48,
                            scale: 0.95,
                            zIndex: 6,
                            duration: 0.16,
                            ease: 'power2.inOut'
                        }, 0.75)
                        .to(notes[2], { autoAlpha: 1, y: 0, duration: 0.09, ease: 'power2.out' }, 0.81)
                        .to(notes[2], { autoAlpha: 0, y: -10, duration: 0.08 }, 0.9)
                        .to(ending, { autoAlpha: 1, y: 0, duration: 0.08, ease: 'power2.out' }, 0.92);

                });

                matchMedia.add('(max-width: 820px) and (prefers-reduced-motion: no-preference)', () => {
                    gsap.utils.toArray('.work-card').forEach((card) => {
                        gsap.fromTo(card, { opacity: 0.48, y: 48 }, {
                            opacity: 1,
                            y: 0,
                            duration: 0.7,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: card,
                                start: 'top 86%',
                                toggleActions: 'play none none reverse'
                            }
                        });
                    });

                });
            }, section);
        }

        refresh();

        return () => {
            window.cancelAnimationFrame(refreshFrame);
            resizeObserver.disconnect();
            matchMedia?.revert();
            context?.revert();
        };
    }, [viewMode, filteredProjects.length]);

    return (
        <section id="projects" ref={sectionRef} className="projects-section" aria-labelledby="projects-heading">
            <p className="projects-mode-status" role="status">
                {viewMode === 'flow'
                    ? 'Flow view: selected projects rearrange as the page scrolls.'
                    : `Orbit view: ${filteredProjects.length} projects shown.`}
            </p>

            {viewMode === 'flow' ? (
                <>
                    <div className="work-wall">
                        <div className="work-wall__stage">
                            <div className="work-wall__grid" aria-hidden="true" />

                            <header className="work-wall__bar">
                                <div className="work-wall__brand">
                                    <span>01</span>
                                    <strong>WORKS</strong>
                                </div>
                                <button type="button" onClick={() => setViewMode('index')} data-cursor="pointer" data-cursor-text="OPEN">
                                    ORBIT VIEW <span aria-hidden="true">+</span>
                                </button>
                            </header>

                            <div className="work-wall__intro">
                                <p>SELECTED / 03</p>
                                <h2 id="projects-heading">Interfaces above.<br />Systems underneath.</h2>
                            </div>

                            <div className="work-wall__notes" aria-hidden="true">
                                {featuredProjects.map((project, index) => (
                                    <div className="work-wall__note" key={project.id}>
                                        <span>{String(index + 1).padStart(2, '0')} / {project.year}</span>
                                        <strong>{PROJECT_SIGNALS[project.id].line}</strong>
                                        <small>{PROJECT_SIGNALS[project.id].detail}</small>
                                    </div>
                                ))}
                            </div>

                            <div className="work-wall__canvas">
                                {featuredProjects.map((project, index) => (
                                    <Link
                                        key={project.id}
                                        to={`/project/${project.id}`}
                                        className={`work-card work-card--${index + 1}`}
                                        data-work-card={project.id}
                                        data-cursor="view"
                                        data-cursor-text="EXPLORE"
                                        aria-label={`Explore ${project.title}`}
                                    >
                                        <span className="work-card__frame">
                                            <img
                                                src={project.image}
                                                alt={`${project.title} interface`}
                                                loading={index === 0 ? 'eager' : 'lazy'}
                                                decoding="async"
                                                fetchPriority={index === 0 ? 'high' : 'low'}
                                            />
                                            <span className="work-card__hover" aria-hidden="true">OPEN PROJECT</span>
                                        </span>
                                        <span className="work-card__caption">
                                            <span><i>{String(index + 1).padStart(2, '0')}</i> {project.title}</span>
                                            <small>{getCategory(project)} / {project.year}</small>
                                        </span>
                                    </Link>
                                ))}
                            </div>

                            <div className="work-wall__ending" aria-hidden="true">
                                <span>THREE PRODUCTS</span>
                                <strong>ONE ENGINEERING PRACTICE.</strong>
                            </div>

                            <div className="work-wall__progress" aria-hidden="true">
                                <span className="work-wall__progress-fill" />
                            </div>
                        </div>
                    </div>

                    <section className="projects-archive" aria-labelledby="projects-archive-heading">
                        <header>
                            <p>ARCHIVE / NEXT</p>
                            <h3 id="projects-archive-heading">More builds.<br /><em>Less theatre.</em></h3>
                        </header>

                        <div className="projects-archive__list">
                            {archiveProjects.map((project, index) => (
                                <Link
                                    to={`/project/${project.id}`}
                                    className="projects-archive__row"
                                    key={project.id}
                                    data-cursor="view"
                                    data-cursor-text="VIEW"
                                    aria-label={`View ${project.title}`}
                                >
                                    <span>{String(index + featuredProjects.length + 1).padStart(2, '0')}</span>
                                    <strong>{project.title}</strong>
                                    <small>{project.role} / {project.year}</small>
                                    <i aria-hidden="true">OPEN</i>
                                </Link>
                            ))}
                        </div>
                    </section>
                </>
            ) : (
                <div id="projects-index" className="projects-index">
                    <header className="projects-index__toolbar">
                        <button type="button" className="projects-index__back" onClick={() => setViewMode('flow')}>
                            BACK TO FLOW
                        </button>
                        <div className="projects-index__filters" role="group" aria-label="Filter projects by category">
                            {filters.map((filter) => (
                                <button
                                    type="button"
                                    key={filter}
                                    className={activeFilter === filter ? 'is-active' : ''}
                                    aria-pressed={activeFilter === filter}
                                    onClick={() => setActiveFilter(filter)}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </header>

                    <Suspense fallback={<div className="projects-index__loading" role="status">BUILDING ORBIT...</div>}>
                        <ProjectConstellation projects={filteredProjects} />
                    </Suspense>
                </div>
            )}
        </section>
    );
};

export default Projects;
