import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import './MusicPlayer.css';

const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.3); // Default 30%
    const [isHoveringVolume, setIsHoveringVolume] = useState(false);
    const audioRef = useRef(null);
    // Placeholder audio - cool lofi beat or similar royalty free
    // Using a common placeholder URL for demo purposes. 
    // Ideally user provides their own file in public folder.
    const audioSrc = "/assets/keshi%20-%20WANTCHU%20Official%20Visualizer.mp3";

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            }
            setIsPlaying(!isPlaying);
        }
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
    };

    const toggleMute = () => {
        if (volume > 0) {
            // Store previous volume if needed, but for now just mute
            setVolume(0);
        } else {
            setVolume(0.3);
        }
    };

    // Auto-pause if user leaves tab? Optional.

    return (
        <div
            className={`music-player-container ${isPlaying ? 'playing' : 'paused'}`}
            data-cursor="pointer"
            style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100 }}
        >
            <audio ref={audioRef} src={audioSrc} loop />

            {/* Album Art / Vinyl Spin */}
            <div className="album-art-wrapper" onClick={togglePlay}>
                <img
                    src="/assets/song_thumbnail.jpg"
                    alt="Album Art"
                    className="album-art"
                />
            </div>

            {/* Info */}
            <div className="track-info">
                <div className="track-name-wrapper">
                    {/* Simplified Marquee logic mostly CSS */}
                    <span className="track-name" style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}>
                        KESHI • WANTCHU • OFFICIAL VISUALIZER •
                    </span>
                </div>
                <span className="artist-name">keshi</span>
            </div>

            {/* Controls */}
            <div className="controls">
                <button className="control-btn play-pause-btn" onClick={togglePlay}>
                    <Icon icon={isPlaying ? "ph:pause-fill" : "ph:play-fill"} />
                </button>

                {/* Volume Control */}
                <div
                    className="volume-container"
                    onMouseEnter={() => setIsHoveringVolume(true)}
                    onMouseLeave={() => setIsHoveringVolume(false)}
                >
                    <button className="control-btn volume-btn" onClick={toggleMute}>
                        <Icon icon={volume === 0 ? "ph:speaker-x-fill" : volume < 0.5 ? "ph:speaker-simple-low-fill" : "ph:speaker-high-fill"} />
                    </button>

                    <div className={`volume-slider-wrapper ${isHoveringVolume ? 'visible' : ''}`}>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="volume-slider"
                            style={{ backgroundSize: `${volume * 100}% 100%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Mini Visualizer */}
            <div className="visualizer">
                <div className="bar" style={{ animationDelay: '0.1s' }}></div>
                <div className="bar" style={{ animationDelay: '0.3s' }}></div>
                <div className="bar" style={{ animationDelay: '0.5s' }}></div>
                <div className="bar" style={{ animationDelay: '0.2s' }}></div>
            </div>
        </div>
    );
};

export default MusicPlayer;
