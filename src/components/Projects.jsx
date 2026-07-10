import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { projects } from '../data/projects';
import VHSTape from './VHSTape';
import MusicalText from './MusicalText';
import StaticTV from './StaticTV';
import './Projects.css';

const getCategory = (project) => project.category.split(/\s/)[0].toUpperCase();

const Projects = () => {
    const sectionRef = useRef(null);
    const pointerFrameRef = useRef(0);
    const pendingPointerRef = useRef(null);
    const cardBoundsRef = useRef(new WeakMap());
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [viewMode, setViewMode] = useState('grid');

    const filters = useMemo(
        () => ['ALL', ...new Set(projects.map(getCategory))],
        []
    );

    const visibleProjects = useMemo(
        () => activeFilter === 'ALL'
            ? projects
            : projects.filter((project) => getCategory(project) === activeFilter),
        [activeFilter]
    );

    const years = projects.map((project) => Number(project.year)).filter(Boolean);
    const yearRange = years.length ? `${Math.min(...years)}—${Math.max(...years)}` : 'ARCHIVE';

    useEffect(() => () => {
        if (pointerFrameRef.current) cancelAnimationFrame(pointerFrameRef.current);
    }, []);

    const handlePointerEnter = (event) => {
        if (event.pointerType !== 'mouse') return;

        const bounds = event.currentTarget.getBoundingClientRect();
        cardBoundsRef.current.set(event.currentTarget, {
            left: bounds.left,
            top: bounds.top,
            scrollX: window.scrollX,
            scrollY: window.scrollY
        });
    };

    const handlePointerMove = (event) => {
        if (event.pointerType !== 'mouse') return;

        pendingPointerRef.current = {
            card: event.currentTarget,
            clientX: event.clientX,
            clientY: event.clientY
        };

        if (pointerFrameRef.current) return;

        pointerFrameRef.current = requestAnimationFrame(() => {
            pointerFrameRef.current = 0;
            const pointer = pendingPointerRef.current;
            if (!pointer) return;

            let bounds = cardBoundsRef.current.get(pointer.card);
            if (!bounds) {
                const rect = pointer.card.getBoundingClientRect();
                bounds = {
                    left: rect.left,
                    top: rect.top,
                    scrollX: window.scrollX,
                    scrollY: window.scrollY
                };
                cardBoundsRef.current.set(pointer.card, bounds);
            }

            const left = bounds.left - (window.scrollX - bounds.scrollX);
            const top = bounds.top - (window.scrollY - bounds.scrollY);
            pointer.card.style.setProperty('--spotlight-x', `${pointer.clientX - left}px`);
            pointer.card.style.setProperty('--spotlight-y', `${pointer.clientY - top}px`);
        });
    };

    const handlePointerLeave = (event) => {
        cardBoundsRef.current.delete(event.currentTarget);
        if (pendingPointerRef.current?.card === event.currentTarget) {
            pendingPointerRef.current = null;
        }
    };

    return (
        <section id="projects" ref={sectionRef} className="projects-section">
            <div className="projects-signal" aria-hidden="true">
                <span>SELECTED WORK</span>
                <span className="projects-signal-line" />
                <span>{String(projects.length).padStart(2, '0')} CASE FILES</span>
                <span>{yearRange}</span>
            </div>

            <header className="projects-header">
                <div className="projects-heading-wrap">
                    <p className="projects-eyebrow">
                        <span className="projects-live-dot" /> Portfolio transmission / Channel 02
                    </p>
                    <h2 className="projects-title">
                        <span className="projects-title-small">The</span>
                        <MusicalText song="Projects">Projects</MusicalText>
                    </h2>
                </div>

                <div className="projects-intro">
                    <p>
                        Systems, experiments, and products built from first commit to final deploy.
                        Pick a tape to open its case file.
                    </p>
                    <span className="projects-handnote">press play on my work ↘</span>
                </div>
            </header>

            <div className="projects-toolbar" role="group" aria-label="Project archive controls">
                <div className="projects-filters" role="group" aria-label="Filter projects by category">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            type="button"
                            className={`project-filter ${activeFilter === filter ? 'is-active' : ''}`}
                            aria-pressed={activeFilter === filter}
                            aria-controls="project-catalog"
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                <div className="projects-view-switch" role="group" aria-label="Change project layout">
                    <button
                        type="button"
                        className={viewMode === 'grid' ? 'is-active' : ''}
                        aria-label="Grid view"
                        aria-pressed={viewMode === 'grid'}
                        aria-controls="project-catalog"
                        onClick={() => setViewMode('grid')}
                    >
                        <Icon icon="lucide:grid-2x2" />
                        <span>GRID</span>
                    </button>
                    <button
                        type="button"
                        className={viewMode === 'list' ? 'is-active' : ''}
                        aria-label="List view"
                        aria-pressed={viewMode === 'list'}
                        aria-controls="project-catalog"
                        onClick={() => setViewMode('list')}
                    >
                        <Icon icon="lucide:rows-3" />
                        <span>LIST</span>
                    </button>
                </div>
            </div>

            <p className="projects-results-status" role="status">
                {visibleProjects.length} {visibleProjects.length === 1 ? 'project' : 'projects'} shown in {viewMode} view.
            </p>

            <div id="project-catalog" className={`projects-catalog projects-catalog--${viewMode}`}>
                {visibleProjects.map((project, index) => {
                    const projectNumber = String(projects.indexOf(project) + 1).padStart(2, '0');
                    const isFeatured = index === 0 && viewMode === 'grid';

                    return (
                        <Link
                            to={`/project/${project.id}`}
                            key={project.id}
                            className={`project-case ${isFeatured ? 'is-featured' : ''}`}
                            aria-label={`View ${project.title} case study`}
                            onPointerEnter={handlePointerEnter}
                            onPointerMove={handlePointerMove}
                            onPointerLeave={handlePointerLeave}
                            onClick={() => window.scrollTo(0, 0)}
                        >
                            <span className="project-case-spotlight" aria-hidden="true" />

                            <div className="project-case-index" aria-hidden="true">
                                <span>PJ</span>
                                <strong>{projectNumber}</strong>
                            </div>

                            <div className="project-case-visual">
                                <StaticTV project={project} index={projects.indexOf(project)} />
                                <div className="project-vhs-slot" aria-hidden="true">
                                    <VHSTape
                                        project={project}
                                        isActive={false}
                                    />
                                </div>
                            </div>

                            <div className="project-case-copy">
                                <div className="project-case-meta">
                                    <span>{getCategory(project)}</span>
                                    <span>{project.year}</span>
                                    {project.role && <span>{project.role}</span>}
                                </div>

                                <h3>{project.title}</h3>
                                <p>{project.description}</p>

                                <div className="project-case-tags" aria-label="Technologies">
                                    {project.tags?.slice(0, 4).map((tag) => (
                                        <span key={tag}>{tag}</span>
                                    ))}
                                </div>

                                <span className="project-case-cta">
                                    Open case file
                                    <span className="project-case-arrow">
                                        <Icon icon="lucide:arrow-up-right" />
                                    </span>
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="projects-endnote" aria-hidden="true">
                <span>END OF TAPE</span>
                <span className="projects-endnote-line" />
                <span>MORE SOON</span>
            </div>
        </section>
    );
};

export default Projects;
