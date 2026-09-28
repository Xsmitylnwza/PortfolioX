import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './Cursor.css';

const STATE_LABELS = {
    explore: 'EXPLORE',
    drag: 'DRAG',
    view: 'VIEW',
};

const PROJECT_LINK_SELECTOR = [
    '.project-story__cta',
    '.projects-archive__row',
    '.project-constellation__index a',
].join(', ');

const INTERACTIVE_SELECTOR = [
    'a',
    'button',
    '[role="button"]',
    'input[type="submit"]',
    'input[type="button"]',
].join(', ');

const Cursor = () => {
    const wrapperRef = useRef(null);
    const dotRef = useRef(null);
    const followerRef = useRef(null);
    const stateRef = useRef('default');
    const textRef = useRef('');
    const isReadyRef = useRef(false);
    const [cursorState, setCursorState] = useState('default');
    const [cursorText, setCursorText] = useState('');
    const [isReady, setIsReady] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    useEffect(() => {
        const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
        if (!finePointer.matches) return undefined;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (reducedMotion.matches) return undefined;

        const wrapper = wrapperRef.current;
        const dot = dotRef.current;
        const follower = followerRef.current;
        if (!wrapper || !dot || !follower) return undefined;

        const target = { x: 0, y: 0 };
        const current = { x: 0, y: 0 };
        let hasPosition = false;
        let lastHoverTarget = null;
        let rafId = 0;

        // Keep readiness in React state so re-renders never strip `is-ready`
        // from className after pointer/hover state changes.
        isReadyRef.current = false;
        setIsReady(false);
        setIsPressed(false);
        document.documentElement.classList.remove('custom-cursor-ready');

        const setDotX = gsap.quickSetter(dot, 'x', 'px');
        const setDotY = gsap.quickSetter(dot, 'y', 'px');
        const setFollowerX = gsap.quickSetter(follower, 'x', 'px');
        const setFollowerY = gsap.quickSetter(follower, 'y', 'px');

        const showCursor = () => {
            if (isReadyRef.current) {
                document.documentElement.classList.add('custom-cursor-ready');
                return;
            }
            isReadyRef.current = true;
            document.documentElement.classList.add('custom-cursor-ready');
            setIsReady(true);
        };

        const updateCursorState = (nextState, nextText = '') => {
            if (stateRef.current === nextState && textRef.current === nextText) return;
            stateRef.current = nextState;
            textRef.current = nextText;
            setCursorState(nextState);
            setCursorText(nextText);
        };

        const resolveCursorState = (eventTarget) => {
            if (!(eventTarget instanceof Element)) {
                updateCursorState('default');
                return;
            }

            const explicitTarget = eventTarget.closest('[data-cursor]');
            if (explicitTarget) {
                const nextState = (explicitTarget.dataset.cursor || 'default').toLowerCase();
                // Empty data-cursor-text must stay empty (no VIEW/FULL fallback).
                const hasExplicitText = explicitTarget.hasAttribute('data-cursor-text');
                const nextText = hasExplicitText
                    ? (explicitTarget.getAttribute('data-cursor-text') || '')
                    : (STATE_LABELS[nextState] || '');
                updateCursorState(nextState, nextText);
                return;
            }

            if (eventTarget.closest('.project-constellation__canvas')) {
                updateCursorState('drag', STATE_LABELS.drag);
                return;
            }

            if (eventTarget.closest(PROJECT_LINK_SELECTOR)) {
                updateCursorState('explore', STATE_LABELS.explore);
                return;
            }

            if (eventTarget.closest('img, video')) {
                updateCursorState('view', STATE_LABELS.view);
                return;
            }

            if (eventTarget.closest('input, textarea, [contenteditable="true"]')) {
                updateCursorState('text');
                return;
            }

            if (eventTarget.closest(INTERACTIVE_SELECTOR)) {
                updateCursorState('pointer');
                return;
            }

            updateCursorState('default');
        };

        const onPointerMove = (event) => {
            if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;

            target.x = event.clientX;
            target.y = event.clientY;
            setDotX(target.x);
            setDotY(target.y);

            if (!rafId) {
                rafId = window.requestAnimationFrame(() => {
                    rafId = 0;
                    const hoverTarget = document.elementFromPoint(target.x, target.y);
                    if (hoverTarget !== lastHoverTarget) {
                        lastHoverTarget = hoverTarget;
                        resolveCursorState(hoverTarget);
                    }
                });
            }

            if (!hasPosition) {
                current.x = target.x;
                current.y = target.y;
                setFollowerX(current.x);
                setFollowerY(current.y);
                hasPosition = true;
            }

            // Re-assert readiness every move so a React re-render, HMR, or class wipe
            // can never leave the system cursor hidden while the custom cursor is invisible.
            showCursor();
        };

        const onPointerDown = (event) => {
            if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
            setIsPressed(true);
        };
        const onPointerUp = () => setIsPressed(false);
        const onWindowBlur = () => {
            lastHoverTarget = null;
            updateCursorState('default');
            setIsPressed(false);
        };

        const renderFollower = () => {
            if (!hasPosition) return;
            // Slightly heavier lag so mode morph + follow feel slower / smoother.
            const alpha = 1 - Math.pow(0.84, Math.min(gsap.ticker.deltaRatio(), 2));
            current.x += (target.x - current.x) * alpha;
            current.y += (target.y - current.y) * alpha;
            setFollowerX(current.x);
            setFollowerY(current.y);
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerdown', onPointerDown, { passive: true });
        window.addEventListener('pointerup', onPointerUp, { passive: true });
        window.addEventListener('blur', onWindowBlur);
        gsap.ticker.add(renderFollower);

        return () => {
            if (rafId) window.cancelAnimationFrame(rafId);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('blur', onWindowBlur);
            gsap.ticker.remove(renderFollower);
            isReadyRef.current = false;
            document.documentElement.classList.remove('custom-cursor-ready');
        };
    }, []);

    return (
        <div
            ref={wrapperRef}
            className={[
                'cursor-wrapper',
                `state-${cursorState}`,
                isReady ? 'is-ready' : '',
                isPressed ? 'is-pressed' : '',
            ].filter(Boolean).join(' ')}
            aria-hidden="true"
        >
            <div ref={dotRef} className="cursor-pos-wrapper custom-cursor-mover">
                <span className="custom-cursor" />
            </div>
            <div ref={followerRef} className="cursor-pos-wrapper cursor-follower-mover">
                <span className="cursor-follower">
                    <span className="cursor-label">{cursorText}</span>
                </span>
            </div>
        </div>
    );
};

export default Cursor;
