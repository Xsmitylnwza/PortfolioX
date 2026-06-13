import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollManager = () => {
    const location = useLocation();
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

        window.addEventListener('scroll', markScrolling, { passive: true });
        window.addEventListener('wheel', markScrolling, { passive: true });

        const ctx = gsap.context(() => {
            // Keep global texture layers static; scroll-linked paint on fixed
            // blend/blur layers is a major source of wheel jank.
        });

        return () => {
            window.removeEventListener('scroll', markScrolling);
            window.removeEventListener('wheel', markScrolling);
            window.clearTimeout(scrollTimer);
            isScrollingRef.current = false;
            document.body.classList.remove('is-scrolling');
            ctx.revert();
        };
    }, []);

    // Reset scroll on route change
    useEffect(() => {
        if (!location.hash) {
            if (scrollResetRef.current) cancelAnimationFrame(scrollResetRef.current);
            scrollResetRef.current = requestAnimationFrame(() => {
                window.scrollTo(0, 0);
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
