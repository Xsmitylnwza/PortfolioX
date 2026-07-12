import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { projects } from '../data/projects';
import ProjectMedia from './ProjectMedia';
import './PersonaReloadView.css';

const experience = [
    {
        period: '2025-26',
        title: 'Software Engineer (Part-time)',
        org: 'SCB Siam Commercial Bank',
        detail: 'AMLX DB-driven rules · React + Spring Boot modernization.',
        logo: '/scb-logo.png',
    },
    {
        period: '2025',
        title: 'Software Engineer Intern',
        org: 'TTB',
        detail: 'Dashboard for 7 leads / 100+ devs · Townhall recognition.',
        logo: '/ttb-logo.png',
    },
    {
        period: '2025',
        title: 'Fullstack Developer',
        org: 'TOMATO ideas',
        detail: 'POC features, middleware APIs, fast prototype loops.',
        logo: '/tomato-logo.jpg',
    },
];

const tech = ['React', 'Spring Boot', 'Node.js', 'Docker', 'AWS', 'Go', 'MySQL', 'Jenkins'];

const navItems = [
    { id: 'status', label: 'Status' },
    { id: 'archive', label: 'Archive' },
    { id: 'links', label: 'Links' },
];

const PersonaReloadView = () => {
    const [activeProject, setActiveProject] = useState(projects[0]);
    const [activeNav, setActiveNav] = useState('status');

    const featuredProjects = useMemo(() => projects.slice(0, 5), []);

    return (
        <div className="p3-page">
            <div className="p3-water" />
            <div className="p3-bubbles" aria-hidden="true">
                {Array.from({ length: 14 }).map((_, index) => (
                    <span key={index} style={{ '--i': index }} />
                ))}
            </div>
            <div className="p3-scan" />

            <header className="p3-topbar">
                <a className="p3-mark" href="/">
                    <img src="/profile-logo.jpg" alt="Dev Gabriel" />
                    <span>DEV.GABRIEL</span>
                </a>
                <nav className="p3-nav" aria-label="Persona route navigation">
                    {navItems.map((item) => (
                        <a
                            key={item.id}
                            href={`#${item.id}`}
                            className={activeNav === item.id ? 'active' : ''}
                            onMouseEnter={() => setActiveNav(item.id)}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>
                <div className="p3-clock">
                    <span>MOON</span>
                    <strong>FULL</strong>
                </div>
            </header>

            <main className="p3-main">
                <section id="status" className="p3-hero">
                    <div className="p3-portrait-panel">
                        <div className="p3-moon-ring" />
                        <div className="p3-portrait-mask">
                            <img src="/profile-logo.jpg" alt="Gabriel profile" />
                        </div>
                        <div className="p3-orbit-label">SEA OF SKILLS</div>
                    </div>

                    <div className="p3-command">
                        <div className="p3-eyebrow">PORTFOLIO / RELOAD MODE</div>
                        <h1>
                            Gabriel
                            <span>Fullstack Engineer</span>
                        </h1>
                        <p>
                            Backend, DevOps, and frontend systems presented as a tactical archive:
                            readable, sharp, blue, and alive.
                        </p>

                        <div className="p3-actions">
                            <a href="#archive" className="p3-btn primary">
                                <Icon icon="lucide:folder-kanban" />
                                Projects
                            </a>
                            <a href="#links" className="p3-btn">
                                <Icon icon="lucide:send" />
                                Contact
                            </a>
                        </div>
                    </div>

                    <aside className="p3-status-card">
                        <div className="p3-status-head">
                            <span>Current Status</span>
                            <strong>READY</strong>
                        </div>
                        <div className="p3-meter">
                            <span style={{ width: '88%' }} />
                        </div>
                        <div className="p3-stat-grid">
                            <div><b>03</b><span>Roles</span></div>
                            <div><b>08</b><span>Stack</span></div>
                            <div><b>05</b><span>Cases</span></div>
                        </div>
                    </aside>
                </section>

                <section className="p3-split">
                    <div className="p3-panel">
                        <div className="p3-section-title">
                            <span>01</span>
                            <h2>Experience Link</h2>
                        </div>
                        <div className="p3-timeline">
                            {experience.map((item) => (
                                <article key={item.org} className="p3-timeline-item">
                                    <img src={item.logo} alt={item.org} />
                                    <div>
                                        <span>{item.period}</span>
                                        <h3>{item.org}</h3>
                                        <strong>{item.title}</strong>
                                        <p>{item.detail}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="p3-panel p3-tech-panel">
                        <div className="p3-section-title">
                            <span>02</span>
                            <h2>Skill Deck</h2>
                        </div>
                        <div className="p3-tech-grid">
                            {tech.map((item, index) => (
                                <span key={item} style={{ '--delay': `${index * 0.04}s` }}>
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="archive" className="p3-archive">
                    <div className="p3-section-title wide">
                        <span>03</span>
                        <h2>Project Archive</h2>
                    </div>

                    <div className="p3-archive-layout">
                        <div className="p3-project-list">
                            {featuredProjects.map((project, index) => (
                                <button
                                    key={project.id}
                                    className={activeProject.id === project.id ? 'active' : ''}
                                    onMouseEnter={() => setActiveProject(project)}
                                    onFocus={() => setActiveProject(project)}
                                >
                                    <span>{String(index + 1).padStart(2, '0')}</span>
                                    <strong>{project.title}</strong>
                                    <small>{project.role}</small>
                                </button>
                            ))}
                        </div>

                        <article className="p3-project-preview">
                            <div className="p3-preview-media">
                                <ProjectMedia
                                    image={activeProject.image}
                                    video={activeProject.video}
                                    alt={activeProject.title}
                                />
                            </div>
                            <div className="p3-preview-copy">
                                <span>{activeProject.category}</span>
                                <h3>{activeProject.title}</h3>
                                <p>{activeProject.description}</p>
                                <div className="p3-tags">
                                    {activeProject.tags.map((tag) => (
                                        <em key={tag}>{tag}</em>
                                    ))}
                                </div>
                            </div>
                        </article>
                    </div>
                </section>

                <section id="links" className="p3-links">
                    <div className="p3-link-copy">
                        <span>04 / Contact Terminal</span>
                        <h2>Ready for next mission.</h2>
                    </div>
                    <div className="p3-link-actions">
                        <a href="mailto:hello@gabriel.dev"><Icon icon="lucide:mail" /> Email</a>
                        <a href="https://github.com/Xsmitylnwza" target="_blank" rel="noreferrer"><Icon icon="lucide:github" /> GitHub</a>
                        <a href="/"><Icon icon="lucide:rotate-ccw" /> Original</a>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default PersonaReloadView;
