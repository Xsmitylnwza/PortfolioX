import { useEffect, useRef, useState } from 'react';
import './MusicPlayer.css';

const MusicPlayer = () => {
    const audioRef = useRef(null);
    const previousVolumeRef = useRef(0.3);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.3);
    const [playbackError, setPlaybackError] = useState(false);

    const togglePlay = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (!audio.paused) {
            audio.pause();
            return;
        }

        try {
            setPlaybackError(false);
            await audio.play();
        } catch {
            setPlaybackError(true);
        }
    };

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    useEffect(() => {
        const pauseWhenHidden = () => {
            if (document.hidden) audioRef.current?.pause();
        };
        document.addEventListener('visibilitychange', pauseWhenHidden);
        return () => document.removeEventListener('visibilitychange', pauseWhenHidden);
    }, []);

    const handleVolumeChange = (event) => {
        const nextVolume = Number(event.target.value);
        if (nextVolume > 0) previousVolumeRef.current = nextVolume;
        setVolume(nextVolume);
    };

    const toggleMute = () => {
        if (volume > 0) {
            previousVolumeRef.current = volume;
            setVolume(0);
        } else {
            setVolume(previousVolumeRef.current || 0.3);
        }
    };

    const playerLabel = isPlaying ? 'Pause WANTCHU by Keshi' : 'Play WANTCHU by Keshi';

    return (
        <aside className={`music-player-container ${isPlaying ? 'is-playing' : 'is-paused'}`} aria-label="Portfolio soundtrack">
            <audio
                ref={audioRef}
                src="/assets/keshi%20-%20WANTCHU%20Official%20Visualizer.mp3"
                preload="none"
                loop
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            <button type="button" className="record-button" onClick={togglePlay} aria-label={playerLabel}>
                <img src="/assets/song_thumbnail.jpg" alt="" className="record-art" decoding="async" />
                <span aria-hidden="true" className="record-center" />
            </button>

            <div className="music-player-meta" aria-live="polite">
                <span className="music-catalog">SIDE A · 01</span>
                <strong>WANTCHU</strong>
                <span>{playbackError ? 'Tap again to start audio' : 'KESHI · PRIVATE LISTENING'}</span>
            </div>

            <div className="music-controls">
                <button type="button" className="music-play-button" onClick={togglePlay} aria-label={playerLabel}>
                    <span aria-hidden="true">{isPlaying ? 'Ⅱ' : '▶'}</span>
                </button>

                <div className="music-volume">
                    <button type="button" onClick={toggleMute} aria-label={volume === 0 ? 'Unmute soundtrack' : 'Mute soundtrack'}>
                        <span aria-hidden="true">{volume === 0 ? '×' : '◖'}</span>
                    </button>
                    <label>
                        <span className="sr-only">Soundtrack volume</span>
                        <input type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolumeChange} />
                    </label>
                </div>
            </div>

            <div className="music-meter" aria-hidden="true">
                {[0, 1, 2, 3].map((bar) => <i key={bar} className="player-bar" style={{ '--bar': bar }} />)}
            </div>
        </aside>
    );
};

export default MusicPlayer;
