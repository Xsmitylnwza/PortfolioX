import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Loader.css';

const Loader = ({ onLoadingComplete }) => {
    const counterRef = useRef(null);
    const progressFillRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // 1. Counter Animation
            const tl = gsap.timeline({
                onComplete: () => {
                    // 2. Exit Animation: "The Void Vacuum"
                    // Suck the screen up with severe distortion
                    gsap.to(containerRef.current, {
                        yPercent: -150,
                        skewY: 20, // Tearing effect
                        scaleY: 1.5, // Stretch while moving
                        opacity: 0,
                        duration: 0.7,
                        ease: 'power4.inOut',
                        delay: 0.1,
                        onComplete: onLoadingComplete
                    });

                    // Explode the counter text
                    gsap.to('.loader-counter', {
                        scale: 10,
                        opacity: 0,
                        duration: 0.8,
                        ease: 'power2.in',
                        filter: 'blur(20px)'
                    });
                }
            });

            // Animate progress object 0 -> 100
            const progressObj = { value: 0 };

            tl.to(progressObj, {
                value: 100,
                duration: 1,
                ease: 'expo.inOut',
                onUpdate: () => {
                    const value = Math.round(progressObj.value);
                    if (counterRef.current) counterRef.current.textContent = value;
                    if (progressFillRef.current) progressFillRef.current.style.width = `${value}%`;
                }
            });

            // Random Glitch/Text Flicker effects
            // (We handle visual flicker in CSS or could add random text changes here)

        }, containerRef);

        return () => ctx.revert();
    }, [onLoadingComplete]);

    return (
        <div ref={containerRef} className="loader-container">
            {/* Noise Background */}
            <div className="loader-noise"></div>

            {/* Content Wrapper */}
            <div className="loader-content">

                {/* Big Counter */}
                <div className="loader-counter-wrapper">
                    <span ref={counterRef} className="loader-counter">
                        0
                    </span>
                    <span className="loader-percent">%</span>
                </div>

                {/* Loading Status Text */}
                <div className="loader-status">
                    <span className="status-item">LOADING ASSETS...</span>
                    <span className="status-item mono">V.1.0</span>
                </div>

                {/* Progress Tape/Bar */}
                <div className="loader-progress-bar">
                    <div
                        ref={progressFillRef}
                        className="loader-progress-fill"
                        style={{ width: '0%' }}
                    ></div>
                </div>
            </div>

            {/* Decorative Corners */}
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>
        </div>
    );
};

export default Loader;
