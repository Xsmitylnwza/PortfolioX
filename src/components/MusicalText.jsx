import React, { useState, useRef } from 'react';

// Songs list removed as we pass it in now, or kept as fallback? 
// User wants fixed, so we expect 'song' prop.
const MusicalText = ({ children, className, style, song = "LOVE" }) => {
    const [position, setPosition] = useState({ x: -100, y: -100 });
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleMouseEnter = (e) => {
        setIsHovered(true);
        handleMouseMove(e); // Init position immediately
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setPosition({ x: -100, y: -100 });
    };

    return (
        <span
            ref={containerRef}
            className={className}
            style={{ ...style, position: 'relative', display: 'inline-block', cursor: 'none' }}
            // We still tell the global cursor to enter 'music' mode (just the ring)
            data-cursor="music"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Layer 1: Original Text (Visible by default) */}
            <span style={{ opacity: 1 }}>{children}</span>

            {/* Layer 2: Portal Text (Hidden by default, revealed by clip-path) */}
            <span
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    // If song is longer than text, it needs space.
                    // But if we let it flow, it changes layout? No, it's absolute.
                    // We need it to be at least 100% width of parent to cover parent text.
                    minWidth: '100%',
                    width: 'auto',
                    height: '100%',
                    color: 'var(--red-primary)', // Song color
                    backgroundColor: 'var(--bg-black)', // Hides layer 1
                    clipPath: isHovered ? `circle(40px at ${position.x}px ${position.y}px)` : 'circle(0px at 50% 50%)',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                    // Center the song text inside the available space? 
                    // Or keep left align? 'HOME' is left aligned. 'SKELETONS' should probably start at same place.
                    textAlign: 'left'
                }}
            >
                {/* 
                   We need to center the song text or align it? 
                   If text lengths differ ("HOME" vs "SKELETONS"), direct overlay assumes they take same space.
                   BUT "SKELETONS" is longer. If "SKELETONS" is clamped to "HOME" width, it clips/wraps.
                   
                   FIX: Absolute overlay usually matches parent size.
                   If song is longer, we might need a container that allows overflow or centering.
                   HOWEVER, user said "replace in circle". 
                   If "SKELETONS" renders, it's wider.
                   We should probably Center the Song text within the available space of the Original text?
                   Or just let it be aligned left (standard text flow).
                   
                   Let's try standard left alignment first. 
                   If "SKELETONS" is wider than "HOME", it might get cut off by the `width: 100%`.
                   We might need `width: auto` and `white-space: nowrap`.
                   But then the background-color won't cover just the text area?
                   Actually, if we want to obscure "HOME", backgroud-color needs to cover HOME.
                */}
                {song}
            </span>
        </span>
    );
};

export default MusicalText;
