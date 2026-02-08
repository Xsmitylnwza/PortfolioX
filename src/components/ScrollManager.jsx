import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const ScrollManager = () => {
    const location = useLocation();
    const lenisRef = useRef(null);

    useEffect(() => {
        // Initialize Lenis
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        lenisRef.current = lenis;

        // Sync Lenis with ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        // Add Lenis to GSAP Ticker
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        const ctx = gsap.context(() => {
            // 1. Dynamic Noise Opacity based on scroll speed
            ScrollTrigger.create({
                trigger: 'body',
                start: 0,
                end: 'max',
                onUpdate: (self) => {
                    const speed = Math.abs(self.getVelocity());
                    const targetOpacity = gsap.utils.mapRange(0, 4000, 0.03, 0.15, speed);

                    gsap.to('.noise-overlay', {
                        opacity: targetOpacity,
                        duration: 0.2,
                        overwrite: true
                    });
                }
            });

            // 2. Parallax Background Gradients
            gsap.to('.gradient-red', {
                yPercent: 30,
                ease: 'none',
                scrollTrigger: {
                    trigger: 'body',
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1
                }
            });

            gsap.to('.gradient-purple', {
                yPercent: -50,
                ease: 'none',
                scrollTrigger: {
                    trigger: 'body',
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1.5
                }
            });

        });

        return () => {
            ctx.revert();
            // Clean up Lenis
            gsap.ticker.remove((time) => {
                lenis.raf(time * 1000);
            });
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    // Reset scroll on route change
    useEffect(() => {
        if (lenisRef.current && !location.hash) {
            lenisRef.current.scrollTo(0, { immediate: true });
        }
    }, [location.pathname, location.hash]);

    return null;
};

export default ScrollManager;
