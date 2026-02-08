import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import './VCRPlayer.css';

const VCRPlayer = ({ currentProject, isPlaying, onEject }) => {
    const [time, setTime] = useState("00:00:00");

    useEffect(() => {
        if (!isPlaying) return;

        let seconds = 0;
        const interval = setInterval(() => {
            seconds++;
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;
            setTime(
                `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlaying, currentProject]);

    return (
        <div className={`vcr-wrapper ${isPlaying ? 'playing' : ''}`}>
            <div className="vcr-internal-glow"></div>

            {/* Top Mechanical Window */}
            <div className="tape-window">
                <div className="mech-reel"></div>
                {/* This is the invisible target slot for the tape Flip animation */}
                <div className="vcr-slot"></div>
                <div className="mech-reel"></div>
            </div>

            {/* Monitor Screen */}
            <div className="vcr-screen-container">
                <div className="crt-overlay"></div>
                <div className="scanlines"></div>
                <div className="tracking-line"></div>

                {currentProject ? (
                    <img
                        src={currentProject.image}
                        alt="Project Preview"
                        className={`monitor-content ${isPlaying ? 'visible' : ''}`}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full w-full bg-black">
                        <span className="font-mono text-gray-800 text-xs tracking-widest animate-pulse">NO SIGNAL</span>
                    </div>
                )}

                {isPlaying && (
                    <div className="absolute top-4 left-6 text-white font-mono text-xl opacity-80 z-30" style={{ textShadow: '2px 2px 0px black' }}>
                        PLAY ►
                    </div>
                )}
            </div>

            {/* Control Panel */}
            <div className="vcr-controls-panel">
                <div className="hidden sm:block warning-sticker">
                    CAUTION: MOVING PARTS
                </div>

                <div className="led-panel">
                    <div className="spectrum-analyzer">
                        <div className="spec-bar"></div>
                        <div className="spec-bar"></div>
                        <div className="spec-bar"></div>
                        <div className="spec-bar"></div>
                        <div className="spec-bar"></div>
                    </div>
                    <div className="led-time">
                        {isPlaying ? time : "--:--:--"}
                    </div>
                </div>

                <div className="button-group">
                    <button className="vcr-btn stop" onClick={onEject}>Stop</button>
                    <button className={`vcr-btn play ${isPlaying ? 'active' : ''}`}>Play</button>
                    <button className="vcr-btn eject" onClick={onEject}>
                        ⏏
                    </button>
                </div>
            </div>

            {/* Project Info Overlay (Bottom) */}
            {isPlaying && currentProject && (
                <div className="mt-6 p-4 border-l-2 border-red-600 bg-white/5 backdrop-blur-sm relative z-10 rounded-sm">
                    <h3 className="text-xl font-bold font-display uppercase tracking-widest mb-1 text-white">
                        {currentProject.title}
                    </h3>
                    <p className="text-gray-400 font-mono text-xs max-w-xl leading-relaxed">
                        {currentProject.description}
                    </p>
                </div>
            )}
        </div>
    );
};

export default VCRPlayer;
