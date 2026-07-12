import { useEffect } from 'react';

/**
 * Document-room reveal:
 * - Mount/enter: fade intro blocks after room enter (not instant paint)
 * - Scroll: lazy-reveal remaining blocks via IntersectionObserver
 */
export function useDocumentRoomReveal(sectionRef, {
  itemSelector = '[data-reveal]',
  mountDelayMs = 100,
  paths = [],
  rootMargin = '0px 0px -10% 0px',
  threshold = 0.1,
} = {}) {
  const pathsKey = paths.join('|');

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const items = Array.from(section.querySelectorAll(itemSelector));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const markAllVisible = () => {
      section.classList.add('is-revealed', 'is-visible');
      items.forEach((item) => item.classList.add('is-visible'));
    };

    if (reducedMotion || !('IntersectionObserver' in window)) {
      markAllVisible();
      return undefined;
    }

    let mountArmed = false;
    let mountTimer = 0;

    const revealMountBlocks = () => {
      if (mountArmed) return;
      mountArmed = true;
      section.classList.add('is-revealed', 'is-visible');

      // Double-rAF so CSS transitions start after enter paint commits.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          items.forEach((item) => {
            if (item.getAttribute('data-reveal') === 'mount') {
              item.classList.add('is-visible');
            }
          });
        });
      });
    };

    const armMount = () => {
      window.clearTimeout(mountTimer);
      mountTimer = window.setTimeout(revealMountBlocks, mountDelayMs);
    };

    const pathMatches = (to) => {
      if (!to || paths.length === 0) return true;
      return paths.some((path) => to === path || to.startsWith(`${path}/`));
    };

    const onRoomEnter = (event) => {
      const to = event?.detail?.to;
      if (!pathMatches(to)) return;
      armMount();
    };

    armMount();
    document.addEventListener('portfolio:room-content-enter', onRoomEnter);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold, rootMargin },
    );

    items.forEach((item) => {
      if (item.getAttribute('data-reveal') === 'mount') return;
      observer.observe(item);
    });

    // Safety: if a mount block missed the enter window, lazy-observe it.
    const mountFallback = window.setTimeout(() => {
      items.forEach((item) => {
        if (item.getAttribute('data-reveal') !== 'mount') return;
        if (item.classList.contains('is-visible')) return;
        observer.observe(item);
      });
    }, mountDelayMs + 900);

    return () => {
      window.clearTimeout(mountTimer);
      window.clearTimeout(mountFallback);
      document.removeEventListener('portfolio:room-content-enter', onRoomEnter);
      observer.disconnect();
    };
  }, [sectionRef, itemSelector, mountDelayMs, rootMargin, threshold, pathsKey]);
}

export default useDocumentRoomReveal;
