import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

        return () => {
            window.removeEventListener('scroll', markScrolling);
            window.clearTimeout(scrollTimer);
            isScrollingRef.current = false;
            document.body.classList.remove('is-scrolling');
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
