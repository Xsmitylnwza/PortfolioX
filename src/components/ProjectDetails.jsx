import { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { Icon } from '@iconify/react';
import gsap from 'gsap';

const ProjectDetails = () => {
    const { id } = useParams();
    const project = projects.find(p => p.id === parseInt(id));
    const containerRef = useRef(null);

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
            <Link to="/" style={{
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
                    <h1 className="font-serif-italic project-header-text" style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', lineHeight: 0.9, marginBottom: '2rem', color: 'var(--text-primary)' }}>
                        {project.title}
                    </h1>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                        <div>
                            <h4 className="font-mono text-sm text-gray-500 mb-2">ROLE</h4>
                            <p className="font-display text-lg project-header-text">{project.role || 'Developer'}</p>
                        </div>
                        <div>
                            <h4 className="font-mono text-sm text-gray-500 mb-2">YEAR</h4>
                            <p className="font-display text-lg project-header-text">{project.year || '2023'}</p>
                        </div>
                        <div>
                            <h4 className="font-mono text-sm text-gray-500 mb-2">STACK</h4>
                            <div className="flex flex-wrap gap-2 project-header-text">
                                {project.tags.map(tag => (
                                    <span key={tag} className="tag text-sm" style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '0.1rem 0.5rem', borderRadius: '50px' }}>{tag}</span>
                                ))}
                            </div>
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

                        {/* Code Snippet */}
                        {project.code && (
                            <div style={{ marginTop: '3rem', background: '#0a0a0a', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                                    <span className="font-mono text-xs text-gray-500">source_code.tsx</span>
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f56' }} />
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e' }} />
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#27c93f' }} />
                                    </div>
                                </div>
                                <pre className="font-mono w-full overflow-x-auto" style={{ fontSize: '0.8rem', color: '#a855f7' }}>
                                    <code>{project.code}</code>
                                </pre>
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
                    <Link to={`/project/${project.id === projects.length ? 1 : project.id + 1}`} className="font-display text-4xl hover:text-red-500 transition-colors">
                        {projects.find(p => p.id === (project.id === projects.length ? 1 : project.id + 1))?.title}
                    </Link>
                </div>
            </div>

            {/* Responsiveness */}
            <style>{`
                @media (max-width: 768px) {
                    .project-description {
                        position: static !important;
                    }
                    div[style*="grid-template-columns"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default ProjectDetails;
