import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './Cursor.css';

const Cursor = () => {
    const cursorRef = useRef(null);
    const followerRef = useRef(null);
    const [cursorState, setCursorState] = useState('default'); // default, pointer, text, view, secret
    const [cursorText, setCursorText] = useState('');

    useEffect(() => {
        // Use gsap.quickTo for performance
        const moveCursor = gsap.quickTo(cursorRef.current, 'set', { duration: 0, x: 'x', y: 'y' });
        const moveFollower = gsap.quickTo(followerRef.current, 'set', { duration: 0.15, x: 'x', y: 'y' });

        const onMouseMove = (e) => {
            const { clientX, clientY } = e;

            // Main dot stays sharp
            gsap.set(cursorRef.current, { x: clientX, y: clientY });

            // Follower has physics
            gsap.to(followerRef.current, {
                x: clientX,
                y: clientY,
                duration: 0.6,
                ease: 'power3.out'
            });
        };

        const onMouseOver = (e) => {
            const target = e.target;

            // 1. Check for explicit data-cursor override
            const cursorType = target.getAttribute('data-cursor') || target.closest('[data-cursor]')?.getAttribute('data-cursor');
            const hoverText = target.getAttribute('data-cursor-text') || target.closest('[data-cursor-text]')?.getAttribute('data-cursor-text');

            if (cursorType) {
                setCursorState(cursorType);
                if (hoverText) setCursorText(hoverText);
                return;
            }

            // 2. Check for interactive elements
            if (target.matches('a, button, [role="button"], input[type="submit"], input[type="button"]') || target.closest('a, button, [role="button"], input[type="submit"], input[type="button"]')) {
                setCursorState('pointer');
                setCursorText('');
                return;
            }

            // 3. Check for text inputs
            if (target.matches('input[type="text"], textarea, p, span, h1, h2, h3, h4, h5, h6') || target.closest('input[type="text"], textarea')) {
                // Only treat as text cursor if it's actually text content, not a container
                // Simplify: just inputs/textareas for now, or maybe specific text classes?
                // Let's stick to true inputs for specific 'text' state, paragraphs usually just default or text-select
                if (target.matches('input, textarea')) {
                    setCursorState('text');
                    return;
                }
            }

            // Default
            setCursorState('default');
            setCursorText('');
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseover', onMouseOver);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseover', onMouseOver);
        };
    }, []);

    return (
        <div className={`cursor-wrapper state-${cursorState}`}>
            <div ref={cursorRef} className="custom-cursor"></div>
            <div ref={followerRef} className="cursor-follower">
                {cursorText && <span className="cursor-label">{cursorText}</span>}
            </div>
        </div>
    );
};

export default Cursor;
