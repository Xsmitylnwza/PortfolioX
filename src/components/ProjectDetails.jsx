import { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { Icon } from '@iconify/react';
import gsap from 'gsap';

const ProjectDetails = () => {
    const { id } = useParams();
    // Compare string IDs directly
    const project = projects.find(p => p.id === id);
    const containerRef = useRef(null);

    // Find next project logic
    const currentIndex = projects.findIndex(p => p.id === id);
    const nextProject = projects[(currentIndex + 1) % projects.length];

    useEffect(() => {
        // Scroll to top on load
        window.scrollTo(0, 0);

        if (!project) return;

        const ctx = gsap.context(() => {
            // Animate content in
            const tl = gsap.timeline();

            tl.fromTo('.project-header-text',
                { y: 100, opacity: 0, skewY: 10 },
                { y: 0, opacity: 1, skewY: 0, duration: 1, ease: 'power4.out', stagger: 0.1 }
            ).fromTo('.project-gallery-image',
                { scale: 0.9, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1, stagger: 0.2, ease: 'power2.out' },
                '-=0.5'
            );

        }, containerRef);

        return () => ctx.revert();
    }, [project]);

    if (!project) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <h1 className="font-display">PROJECT NOT FOUND</h1>
                <Link to="/" className="btn-primary" style={{ marginLeft: '1rem' }}>Return Home</Link>
            </div>
        );
    }

    return (
        <section ref={containerRef} style={{ minHeight: '100vh', paddingTop: '8rem', paddingBottom: '4rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', background: 'var(--bg-black)', position: 'relative' }}>

            {/* Back Button */}
            <Link to="/#projects" style={{
                position: 'fixed',
                top: '2rem',
                left: '2rem',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-primary)',
                mixBlendMode: 'difference'
            }}>
                <Icon icon="lucide:arrow-left" />
                <span className="font-mono text-sm">BACK</span>
            </Link>

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header */}
                <header style={{ marginBottom: '6rem' }}>
                    <div className="font-mono" style={{ color: 'var(--red-primary)', marginBottom: '1rem' }}>
                        <span className="project-header-text">{project.category}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem' }}>
                        <h1 className="font-serif-italic project-header-text" style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', lineHeight: 0.9, marginBottom: 0, color: 'var(--text-primary)' }}>
                            {project.title}
                        </h1>

                        <div style={{ display: 'flex', gap: '1rem', flexShrink: 0, marginBottom: '1rem' }}>
                            {project.repo && (
                                <a
                                    href={project.repo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary"
                                    style={{ textDecoration: 'none', background: 'transparent', border: '1px solid var(--text-primary)', color: 'var(--text-primary)' }}
                                >
                                    <span>GITHUB</span>
                                    <Icon icon="mdi:github" width="20" />
                                </a>
                            )}
                            {project.link && project.link !== '#' && (
                                <a
                                    href={project.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <span>VIEW LIVE</span>
                                    <Icon icon="ph:arrow-up-right-bold" />
                                </a>
                            )}
                        </div>
                    </div>

                </header>

                {/* Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)', gap: '4rem', alignItems: 'start' }}>

                    {/* Left: Text Content */}
                    <div style={{ position: 'sticky', top: '8rem' }} className="project-description">
                        <h3 className="font-display text-2xl mb-4">The Challenge</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem' }} className="font-sans">
                            {project.fullDescription || project.description}
                        </p>

                        <h3 className="font-display text-2xl mb-4">The Solution</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem' }} className="font-sans">
                            We approached this by breaking down the complex requirements into modular components.
                            Using a component-driven architecture allowed us to iterate quickly while maintaining visual consistency.
                            Performance was paramount, so we utilized aggressive code-splitting and asset optimization.
                        </p>

                        {/* Tech Stack */}
                        {project.tags && (
                            <div style={{ marginTop: '3rem' }}>
                                <h3 className="font-display text-2xl mb-4">Technologies</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {project.tags.map((tag, i) => (
                                        <span key={i} style={{
                                            padding: '0.5rem 1rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '4px',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.875rem',
                                            color: 'var(--text-primary)',
                                            display: 'inline-block'
                                        }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Images Gallery */}
                    <div className="flex flex-col gap-8">
                        {/* Main Cover */}
                        <div className="project-gallery-image" style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '4px' }}>
                            <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        {/* Additional Gallery Images */}
                        {project.gallery && project.gallery.map((img, i) => (
                            <div key={i} className="project-gallery-image" style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', borderRadius: '4px' }}>
                                <img src={img} alt={`${project.title} detail ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        ))}
                    </div>

                </div>

                {/* Footer / Next Project */}
                <div style={{ marginTop: '8rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4rem' }}>
                    <p className="font-mono text-sm text-gray-500 mb-4">NEXT CASE FILE</p>
                    <Link to={`/project/${nextProject.id}`} className="font-display text-4xl hover:text-red-500 transition-colors">
                        {nextProject.title}
                    </Link>
                </div>
            </div >

            {/* Responsiveness */}
            < style > {`
                @media (max-width: 768px) {
                    .project-description {
                        position: static !important;
                    }
                    div[style*="grid-template-columns"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style >
        </section >
    );
};

export default ProjectDetails;
