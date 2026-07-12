import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Loader.css';

const loaderProjects = [
    ['STUDY', '/analytics-hub.jpg'],
    ['BUILD', '/assets/ดาวน์โหลด (13).jpg'],
    ['FOCUS', '/assets/keshi-pomodoro/focus_mode.png'],
    ['REGISTER', '/assets/previews/zucchini-register.jpg'],
    ['GAME MODE', '/assets/previews/decrypt-select-mode.jpg'],
    ['NOTES', '/assets/♡.jpg'],
].map(([title, image], index) => ({ id: String(index + 1).padStart(2, '0'), title, image }));

const loaderSequence = [...loaderProjects, ...loaderProjects.slice(0, 3)];
const galleryPreloadSources = [
    '/assets/previews/keshi-pomodoro-demo.jpg',
    '/assets/previews/zucchini-homepage.jpg',
    '/assets/previews/decrypt-gameplay.jpg',
    '/assets/keshi-pomodoro/focus_mode.png',
    '/assets/previews/zucchini-review.jpg',
    '/assets/previews/decrypt-manual.jpg',
    '/assets/previews/zucchini-register.jpg',
    '/assets/previews/decrypt-select-mode.jpg',
];

const Loader = ({ onRevealReady, onLoadingComplete }) => {
    const containerRef = useRef(null);
    const counterRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return undefined;

        document.documentElement.classList.remove('portfolio-ready');
        document.documentElement.classList.add('loader-active');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let completed = false;
        let revealReady = false;
        let portfolioRevealStarted = false;
        const startPortfolioRevealOnce = () => {
            if (portfolioRevealStarted) return;
            portfolioRevealStarted = true;
            document.documentElement.classList.add('portfolio-ready');
            document.dispatchEvent(new CustomEvent('portfolio:reveal-start'));
        };
        const prepareRevealOnce = () => {
            if (revealReady) return;
            revealReady = true;
            onRevealReady?.();
        };
        const completeOnce = () => {
            if (completed) return;
            completed = true;
            prepareRevealOnce();
            startPortfolioRevealOnce();
            onLoadingComplete?.();
        };

        const preloadSources = [...new Set([
            ...loaderProjects.map(({ image }) => image),
            ...galleryPreloadSources,
        ])];
        const preload = preloadSources.map((image) => new Promise((resolve) => {
            const asset = new Image();
            const settle = async () => {
                try {
                    await asset.decode?.();
                } catch {
                    // Decoding can reject for already-decoded or unsupported assets.
                }
                resolve();
            };
            asset.onload = settle;
            asset.onerror = settle;
            asset.src = image;
        }));

        if (reducedMotion) {
            if (counterRef.current) counterRef.current.textContent = '100';
            Promise.all(preload).then(() => window.setTimeout(completeOnce, 180));
            return () => document.documentElement.classList.remove('loader-active');
        }

        const safetyTimer = window.setTimeout(completeOnce, 7200);
        const ctx = gsap.context(() => {
            const frames = gsap.utils.toArray('.loader-frame');
            const referenceFrame = frames[frames.length - 1];
            const frameBounds = referenceFrame.getBoundingClientRect();
            const count = { value: 0 };
            gsap.set(frames, { autoAlpha: 0, scale: 0.035, force3D: true });
            gsap.set('.loader-counter', { autoAlpha: 0 });
            gsap.set('.loader-wipe', {
                autoAlpha: 0,
                width: 0,
                height: 0,
                xPercent: -50,
                yPercent: -50,
                force3D: true,
            });

            const timeline = gsap.timeline({ defaults: { overwrite: 'auto' } });
            timeline
                .to('.loader-counter', { autoAlpha: 1, duration: 0.3, ease: 'none' })
                .to(count, {
                    value: 100,
                    duration: 2.55,
                    ease: 'sine.inOut',
                    snap: { value: 1 },
                    onUpdate: () => {
                        if (counterRef.current) counterRef.current.textContent = String(Math.round(count.value));
                    },
                }, 0);

            frames.forEach((frame, index) => {
                const at = 0.14 + index * 0.227;
                timeline
                    .set(frame, { autoAlpha: 1 }, at)
                    .to(frame, { scale: 1, duration: 0.453, ease: 'power2.out', force3D: true }, at);
            });

            timeline
                .to('.loader-wipe', {
                    autoAlpha: 1,
                    width: frameBounds.width,
                    height: frameBounds.height,
                    duration: 0.72,
                    ease: 'power3.inOut',
                }, 2.58)
                .to('.loader-counter', { autoAlpha: 0, duration: 0.28, ease: 'sine.out' }, 3.08)
                .to('.loader-wipe', {
                    width: window.innerWidth + 2,
                    height: window.innerHeight + 2,
                    duration: 0.94,
                    ease: 'power3.inOut',
                }, 3.8)
                .call(prepareRevealOnce, null, 3.34)
                .set('.loader-stage', { autoAlpha: 0 }, 4.77)
                .set(container, { backgroundColor: 'transparent' }, 4.77)
                .call(startPortfolioRevealOnce, null, 4.84)
                .to('.loader-wipe', {
                    autoAlpha: 0,
                    duration: 0.86,
                    ease: 'sine.inOut',
                    force3D: true,
                }, 4.9)
                .call(() => Promise.all(preload).then(completeOnce));
        }, container);

        return () => {
            window.clearTimeout(safetyTimer);
            ctx.revert();
            document.documentElement.classList.remove('loader-active');
        };
    }, [onRevealReady, onLoadingComplete]);

    return (
        <div ref={containerRef} className="loader-container" role="status" aria-live="polite" aria-label="Loading selected work">
            <span ref={counterRef} className="loader-counter" aria-hidden="true">0</span>

            <div className="loader-stage" aria-hidden="true">
                {loaderSequence.map((project, index) => (
                    <figure key={`${project.id}-${index}`} className={`loader-frame loader-frame--${(index % 3) + 1}`}>
                        <img src={project.image} alt="" decoding="async" fetchPriority={index < 2 ? 'high' : 'auto'} />
                    </figure>
                ))}
            </div>
            <span className="loader-wipe" aria-hidden="true" />
        </div>
    );
};

export default Loader;
