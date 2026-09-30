import React, { forwardRef } from 'react';
import './VHSTape.css';

const VHSTape = forwardRef(({ project, onClick, isActive, className, style }, ref) => {
    return (
        <div
            ref={ref}
            className={`vhs-wrapper ${isActive ? 'active' : ''} ${className || ''}`}
            onClick={onClick}
            style={style}
        >
            <div className="vhs-body">
                {/* Front Face */}
                <div className="vhs-face vhs-front">
                    <div className="vhs-sticker">
                        <div className="sticker-title">{project.title}</div>
                        <div className="sticker-meta">
                            <span>VHS-HQ</span>
                            <span>{project.category}</span>
                        </div>
                    </div>

                    <div className="vhs-window">
                        <div className="reel-left">
                            <div className="tape-spool"></div>
                        </div>
                        <div className="reel-right">
                            <div className="tape-spool"></div>
                        </div>
                    </div>

                    <div className="vhs-decoration-line"></div>
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '15px',
                        color: '#444',
                        fontWeight: 'bold',
                        fontSize: '10px',
                        fontFamily: 'Arial'
                    }}>
                        STEREO
                    </div>
                </div>

                {/* Spine */}
                <div className="vhs-face vhs-spine">
                    <div className="spine-label">
                        <span className="spine-title">{project.title}</span>
                        <div style={{ width: '10px', height: '10px', background: 'var(--red-primary)', borderRadius: '50%' }}></div>
                    </div>
                </div>

                {/* Other Faces */}
                <div className="vhs-face vhs-top"></div>
                <div className="vhs-face vhs-left"></div>
                <div className="vhs-face vhs-right"></div>
            </div>
        </div>
    );
});

export default VHSTape;
