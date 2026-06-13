import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './Cursor.css';

const Cursor = () => {
    const cursorRef = useRef(null);
    const followerRef = useRef(null);
    const stateRef = useRef('default');
    const textRef = useRef('');
    const [cursorState, setCursorState] = useState('default'); // default, pointer, text, view, secret
    const [cursorText, setCursorText] = useState('');

    useEffect(() => {
        if (window.matchMedia('(hover: none), (pointer: coarse)').matches) {
            return;
        }

        const cursor = cursorRef.current;
        const follower = followerRef.current;
        if (!cursor || !follower) return;

        const setCursorX = gsap.quickSetter(cursor, 'x', 'px');
        const setCursorY = gsap.quickSetter(cursor, 'y', 'px');
        const moveFollowerX = gsap.quickTo(follower, 'x', { duration: 0.28, ease: 'power3.out' });
        const moveFollowerY = gsap.quickTo(follower, 'y', { duration: 0.28, ease: 'power3.out' });

        const updateCursorState = (nextState, nextText = '') => {
            if (stateRef.current === nextState && textRef.current === nextText) return;
            stateRef.current = nextState;
            textRef.current = nextText;
            setCursorState(nextState);
            setCursorText(nextText);
        };

        const onMouseMove = (e) => {
            const { clientX, clientY } = e;

            // Main dot stays sharp
            setCursorX(clientX);
            setCursorY(clientY);

            // Follower has physics
            moveFollowerX(clientX);
            moveFollowerY(clientY);
        };

        const onMouseOver = (e) => {
            const target = e.target;
            if (!(target instanceof Element)) return;

            // 1. Check for explicit data-cursor override
            const cursorType = target.getAttribute('data-cursor') || target.closest('[data-cursor]')?.getAttribute('data-cursor');
            const hoverText = target.getAttribute('data-cursor-text') || target.closest('[data-cursor-text]')?.getAttribute('data-cursor-text');

            if (cursorType) {
                updateCursorState(cursorType, hoverText || '');
                return;
            }

            // 2. Check for interactive elements
            if (target.matches('a, button, [role="button"], input[type="submit"], input[type="button"]') || target.closest('a, button, [role="button"], input[type="submit"], input[type="button"]')) {
                updateCursorState('pointer');
                return;
            }

            // 3. Check for text inputs
            if (target.matches('input[type="text"], textarea, p, span, h1, h2, h3, h4, h5, h6') || target.closest('input[type="text"], textarea')) {
                // Only treat as text cursor if it's actually text content, not a container
                // Simplify: just inputs/textareas for now, or maybe specific text classes?
                // Let's stick to true inputs for specific 'text' state, paragraphs usually just default or text-select
                if (target.matches('input, textarea')) {
                    updateCursorState('text');
                    return;
                }
            }

            // Default
            updateCursorState('default');
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseover', onMouseOver);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseover', onMouseOver);
            gsap.killTweensOf([cursor, follower]);
        };
    }, []);

    return (
        <div className={`cursor-wrapper state-${cursorState}`}>
            <div ref={cursorRef} className="cursor-pos-wrapper custom-cursor-mover">
                <div className="custom-cursor"></div>
            </div>
            <div ref={followerRef} className="cursor-pos-wrapper cursor-follower-mover">
                <div className="cursor-follower">
                    {cursorText && <span className="cursor-label">{cursorText}</span>}
                </div>
            </div>
        </div>
    );
};

export default Cursor;
