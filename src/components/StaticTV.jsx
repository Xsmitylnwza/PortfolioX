import { useEffect, useRef } from 'react';
import ProjectMedia from './ProjectMedia';
import './TVModal.css';

let crtObserver;

const getCrtObserver = () => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        return null;
    }

    if (!crtObserver) {
        crtObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                entry.target.dataset.crtActive = String(entry.isIntersecting);
            });
        }, {
            rootMargin: '180px 0px',
            threshold: 0.01
        });
    }

    return crtObserver;
};

const StaticTV = ({ project, index }) => {
    const containerRef = useRef(null);
    const channelId = `PJ-${String(index + 1).padStart(2, '0')}`;

    useEffect(() => {
        const node = containerRef.current;
        if (!node) return undefined;

        const observer = getCrtObserver();
        if (!observer) {
            node.dataset.crtActive = 'true';
            return undefined;
        }

        observer.observe(node);
        return () => observer.unobserve(node);
    }, []);

    return (
        <div
            ref={containerRef}
            className="tv-modal-container static-tv"
            data-crt-active="false"
        >
            <div className="tv-screen">
                <div className="tv-channel-text" aria-hidden="true">{channelId}</div>

                <div className="tv-effects" aria-hidden="true">
                    <div className="tv-scanlines" />
                    <div className="tv-tracking" />
                    <div className="tv-static" />
                    <div className="tv-overlay-glow" />
                </div>

                {project?.image && (
                    <ProjectMedia
                        image={project.image}
                        video={project.video}
                        alt={`${project.title} project preview`}
                        className="tv-image"
                        sizes="320px"
                    />
                )}
            </div>

            <span className="tv-power-led" aria-hidden="true" />
        </div>
    );
};

export default StaticTV;
