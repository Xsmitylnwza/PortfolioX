import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { projects } from '../data/projects';
import VHSTape from './VHSTape';
import MusicalText from './MusicalText';
import TVModal from './TVModal';
import './Projects.css';

const Projects = () => {
    const sectionRef = useRef(null);
    const tapeRefs = useRef([]);

    // Hover State
    const [hoveredProject, setHoveredProject] = useState(null);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

    // Track mouse globally for the section
    useEffect(() => {
        const handleMouseMove = (e) => {
            setCursorPos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <section id="projects" ref={sectionRef} className="vhs-layout">
            <TVModal
                project={hoveredProject}
                visible={!!hoveredProject}
                x={cursorPos.x}
                y={cursorPos.y}
            />

            <div style={{ textAlign: 'center', marginBottom: '6rem', position: 'relative', zIndex: 10 }}>
                <h2 className="font-serif-italic" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 400, color: 'var(--text-primary)' }}>
                    Selected <span style={{ color: 'var(--red-primary)' }}><MusicalText song="Projects">Projects</MusicalText></span>
                </h2>

            </div>

            <div className="tape-grid">
                {projects.map((project, index) => (
                    <Link
                        to={`/project/${project.id}`}
                        key={project.id}
                        className="tape-link-wrapper"
                        style={{ display: 'block', textDecoration: 'none' }}
                        onClick={() => window.scrollTo(0, 0)}
                        onMouseEnter={() => setHoveredProject(project)}
                        onMouseLeave={() => setHoveredProject(null)}
                    >
                        <div style={{ width: '280px', height: '180px', margin: '20px auto' }}>
                            <VHSTape
                                ref={el => tapeRefs.current[index] = el}
                                project={project}
                                isActive={false}
                            />
                        </div>
                    </Link>
                ))}
            </div>

            <style>{`
                .vhs-layout {
                    min-height: 100vh;
                    background: #0a0a0a;
                    color: white;
                    padding: 8rem 2rem;
                    position: relative;
                    overflow-x: hidden;
                    font-family: 'Inter', sans-serif;
                }
                /* Background Grid Texture */
                .vhs-layout::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background-image: 
                        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                    background-size: 40px 40px;
                    opacity: 0.5;
                    pointer-events: none;
                }
                
                .tape-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 4rem;
                    max-width: 1400px;
                    margin: 0 auto;
                    justify-items: center;
                    perspective: 1000px;
                    padding-bottom: 4rem;
                }

                .tape-link-wrapper {
                    transition: transform 0.3s ease;
                    cursor: pointer;
                }
                .tape-link-wrapper:hover {
                    transform: scale(1.05) translateY(-10px);
                    z-index: 10;
                }
            `}</style>
        </section>
    );
};

export default Projects;
