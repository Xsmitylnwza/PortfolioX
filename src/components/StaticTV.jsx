import React from 'react';
import './TVModal.css'; // Reuse existing styles

const StaticTV = ({ project }) => {
    return (
        <div
            className="tv-modal-container static-tv"
            style={{
                position: 'relative',
                transform: 'none',
                opacity: 1,
                pointerEvents: 'auto',
                width: '100%',
                maxWidth: '320px',
                height: '240px',
                margin: '0 auto 2rem auto', // Add spacing below TV
                zIndex: 1
            }}
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
                {project && project.image && (
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

export default StaticTV;
