import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import './TVModal.css';

const TVModal = ({ project, x, y, visible }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            // Smooth follow using gsap quickSetter for performance
            gsap.set(containerRef.current, {
                x: x + 20, // Offset to not cover cursor
                y: y + 20
            });
        }
    }, [x, y]);

    if (!project && !visible) return null;

    return (
        <div
            ref={containerRef}
            className={`tv-modal-container ${visible ? 'visible' : ''}`}
            // Fallback style if ref isn't immediate (though useEffect covers it)
            style={{ left: 0, top: 0 }}
        >
            <div className="tv-screen">
                {/* Channel / Input Overlay */}
                <div className="tv-channel-text">AV-1</div>

                {/* Glitch Effects */}
                <div className="tv-effects">
                    <div className="tv-scanlines"></div>
                    <div className="tv-tracking"></div>
                    <div className="tv-static"></div>
                    <div className="tv-overlay-glow"></div>
                </div>

                {/* Content */}
                {project && (
                    <img
                        src={project.image}
                        alt={project.title}
                        className="tv-image"
                    />
                )}
            </div>

            {/* Simple decoration: Power LED */}
            <div style={{
                position: 'absolute',
                bottom: '5px',
                right: '20px',
                width: '6px',
                height: '6px',
                background: 'red',
                borderRadius: '50%',
                boxShadow: '0 0 5px red'
            }}></div>
        </div>
    );
};

export default TVModal;
