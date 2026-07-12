import { useEffect, useRef, useState } from 'react';
import './MusicPlayer.css';

const MusicPlayer = () => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
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
            audio.volume = 0.3;
            await audio.play();
        } catch {
            setPlaybackError(true);
        }
    };

    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden) audioRef.current?.pause();
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, []);

    return (
        <aside className={`sound-control ${isPlaying ? 'is-playing' : ''}`} aria-label="Portfolio soundtrack">
            <audio
                ref={audioRef}
                src="/assets/keshi%20-%20WANTCHU%20Official%20Visualizer.mp3"
                preload="none"
                loop
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />
            <button
                type="button"
                onClick={togglePlay}
                aria-pressed={isPlaying}
                aria-label={isPlaying ? 'Turn soundtrack off' : 'Turn soundtrack on'}
                title={playbackError ? 'Audio could not start. Try again.' : undefined}
            >
                <i aria-hidden="true" />
                <span>SOUND</span>
                <strong>{playbackError ? 'RETRY' : isPlaying ? 'ON' : 'OFF'}</strong>
            </button>
        </aside>
    );
};

export default MusicPlayer;
