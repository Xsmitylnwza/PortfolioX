import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollManager = () => {
    const location = useLocation();
    const lenisRef = useRef(null);
    const scrollResetRef = useRef(null);
    const isScrollingRef = useRef(false);

    useEffect(() => {
        let scrollTimer;
        const markScrolling = () => {
            if (!isScrollingRef.current) {
                isScrollingRef.current = true;
                document.body.classList.add('is-scrolling');
            }
            window.clearTimeout(scrollTimer);
            scrollTimer = window.setTimeout(() => {
                isScrollingRef.current = false;
                document.body.classList.remove('is-scrolling');
            }, 140);
        };

        const prefersNativeScroll = window.matchMedia(
            '(prefers-reduced-motion: reduce), (pointer: coarse)',
        ).matches;

        if (prefersNativeScroll) {
            window.addEventListener('scroll', markScrolling, { passive: true });
            return () => {
                window.removeEventListener('scroll', markScrolling);
                window.clearTimeout(scrollTimer);
                document.body.classList.remove('is-scrolling');
            };
        }

        const lenis = new Lenis({
            autoRaf: false,
            anchors: true,
            lerp: 0.1,
            smoothWheel: true,
            wheelMultiplier: 0.9,
        });
        lenisRef.current = lenis;

        const handleLenisScroll = () => {
            markScrolling();
            ScrollTrigger.update();
        };
        const handleScrollLock = (event) => {
            if (event.detail?.locked) {
                lenis.stop();
            } else {
                lenis.start();
            }
        };
        const tick = (time) => lenis.raf(time * 1000);

        lenis.on('scroll', handleLenisScroll);
        window.addEventListener('portfolio:scroll-lock', handleScrollLock);
        gsap.ticker.add(tick);

        return () => {
            gsap.ticker.remove(tick);
            lenis.off('scroll', handleLenisScroll);
            window.removeEventListener('portfolio:scroll-lock', handleScrollLock);
            lenis.destroy();
            lenisRef.current = null;
            window.clearTimeout(scrollTimer);
            isScrollingRef.current = false;
            document.body.classList.remove('is-scrolling');
        };
    }, []);

    useEffect(() => {
        if (!location.hash) {
            if (scrollResetRef.current) cancelAnimationFrame(scrollResetRef.current);
            scrollResetRef.current = requestAnimationFrame(() => {
                if (lenisRef.current) {
                    lenisRef.current.scrollTo(0, { immediate: true });
                } else {
                    window.scrollTo(0, 0);
                }
                ScrollTrigger.refresh();
            });
        }

        return () => {
            if (scrollResetRef.current) cancelAnimationFrame(scrollResetRef.current);
        };
    }, [location.pathname, location.hash]);

    return null;
};

export default ScrollManager;
