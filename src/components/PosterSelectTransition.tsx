import { useEffect, useRef } from 'react';
import './PosterSelectTransition.css';

export interface PosterFlight {
  key: string;
  projectId: string;
  title: string;
  startedAt: number;
  to: string;
}
interface PosterTransitionProps {
  transition: PosterFlight | null;
  onNavigateReady: (flight: PosterFlight) => void | Promise<void>;
  onReveal?: (flight: PosterFlight) => void;
  onComplete: (flight: PosterFlight) => void;
}
interface AnimationLike { finished: Promise<unknown>; cancel: () => void }

// Timings/easing mirror the K95 works -> project curtain transition.
const OUT_MS = 1240;
const CURTAIN_OUT_MS = 1120;
const CURTAIN_OUT_DELAY_MS = 120;
const HOLD_MS = 40;
const ENTER_MS = 1040;
const ROUTE_READY_TIMEOUT_MS = 1600;
const EASE_OUT_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const FAILSAFE_MS = OUT_MS + ROUTE_READY_TIMEOUT_MS + HOLD_MS + ENTER_MS + 1200;

const nextFrame = () => new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));

const delay = (duration: number) => new Promise<void>((resolve) => {
  window.setTimeout(resolve, duration);
});

function animateElement(element: HTMLElement, keyframes: { transform: string }[], options: KeyframeAnimationOptions): AnimationLike {
  if (element?.animate) return element.animate(keyframes, options);

  const duration = Number(options.duration || 0) + Number(options.delay || 0);
  const finalFrame = keyframes[keyframes.length - 1] || {};
  const timer = window.setTimeout(() => {
    element.style.transform = finalFrame.transform;
  }, duration);

  return {
    finished: delay(duration),
    cancel: () => window.clearTimeout(timer),
  };
}

function waitForAnimation(animation: AnimationLike) {
  return animation.finished.catch(() => undefined);
}

function isMediaReady(media: HTMLImageElement | HTMLVideoElement | null) {
  if (!media) return true;
  if (media instanceof HTMLImageElement) return media.complete && media.naturalWidth > 0;
  if (media instanceof HTMLVideoElement) return media.readyState >= 2;
  return true;
}

function waitForMedia(media: HTMLImageElement | HTMLVideoElement | null, timeoutMs: number, isCancelled: () => boolean) {
  if (!media || isMediaReady(media) || isCancelled()) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const readyEvent = media instanceof HTMLVideoElement ? 'loadeddata' : 'load';
    let timer = 0;

    const cleanup = () => {
      window.clearTimeout(timer);
      media.removeEventListener(readyEvent, complete);
      media.removeEventListener('error', complete);
    };

    const complete = () => {
      cleanup();
      resolve();
    };

    media.addEventListener(readyEvent, complete, { once: true });
    media.addEventListener('error', complete, { once: true });
    timer = window.setTimeout(complete, timeoutMs);
  });
}

async function waitForDestination(isCancelled: () => boolean) {
  const startedAt = performance.now();
  let target: HTMLElement | null = null;

  while (!isCancelled() && performance.now() - startedAt < ROUTE_READY_TIMEOUT_MS) {
    target = document.querySelector<HTMLElement>('[data-poster-transition-target]');
    if (target) break;
    await nextFrame();
  }

  if (isCancelled()) return;

  if (target) {
    const media = target.querySelector<HTMLImageElement | HTMLVideoElement>('img, video');
    const elapsed = performance.now() - startedAt;
    const remaining = Math.max(120, ROUTE_READY_TIMEOUT_MS - elapsed);
    await waitForMedia(media, remaining, isCancelled);

    if (!isCancelled() && media instanceof HTMLImageElement && media.decode) {
      await Promise.race([
        media.decode().catch(() => undefined),
        delay(Math.min(320, remaining)),
      ]);
    }
  }

  if (!isCancelled()) {
    await nextFrame();
    await nextFrame();
  }
}

/**
 * Gallery poster handoff inspired by K95:
 * the complete Gallery room eases upward while a solid stage-colour curtain
 * covers the route swap, then continues upward to reveal Project Details.
 */
const PosterSelectTransition = ({ transition, onNavigateReady, onReveal, onComplete }: PosterTransitionProps) => {
  const shellRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef({ onNavigateReady, onReveal, onComplete });

  useEffect(() => {
    callbacksRef.current = { onNavigateReady, onReveal, onComplete };
  }, [onNavigateReady, onReveal, onComplete]);

  useEffect(() => {
    if (!transition) return undefined;

    const shell = shellRef.current;
    const curtain = curtainRef.current;
    if (!shell || !curtain) {
      callbacksRef.current.onComplete?.(transition);
      return undefined;
    }

    let cancelled = false;
    let finished = false;
    const animations = new Set<AnimationLike>();
    const outgoingTargets = Array.from(document.querySelectorAll<HTMLElement>(
      '.gallery-stage-layer, .gallery-room.is-gallery',
    ));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const desktop = window.matchMedia('(min-width: 1025px)').matches;

    const track = (animation: AnimationLike) => {
      animations.add(animation);
      return animation;
    };

    const cancelAnimations = () => {
      animations.forEach((animation) => {
        try {
          animation.cancel();
        } catch {
          // Ignore animations already replaced or completed.
        }
      });
      animations.clear();
    };

    const resetPageMotion = () => {
      outgoingTargets.forEach((target) => {
        target.style.removeProperty('transform');
        target.style.removeProperty('will-change');
      });
    };

    const clearClasses = () => {
      document.documentElement.classList.remove(
        'poster-transition-active',
        'poster-transition-covering',
        'poster-transition-revealing',
      );
    };

    const finish = () => {
      if (cancelled || finished) return;
      finished = true;
      cancelAnimations();
      resetPageMotion();
      clearClasses();
      callbacksRef.current.onComplete?.(transition);
    };

    const run = async () => {
      document.documentElement.classList.add(
        'poster-transition-active',
        'poster-transition-covering',
      );
      shell.classList.add('is-active');

      if (reduceMotion) {
        const cover = track(animateElement(curtain, [
          { transform: 'translate3d(0, 100%, 0)' },
          { transform: 'translate3d(0, 0, 0)' },
        ], {
          duration: 260,
          easing: 'linear',
          fill: 'forwards',
        }));
        await waitForAnimation(cover);
      } else {
        const cover = track(animateElement(curtain, [
          { transform: 'translate3d(0, 100%, 0)' },
          { transform: 'translate3d(0, 0, 0)' },
        ], {
          duration: CURTAIN_OUT_MS,
          delay: CURTAIN_OUT_DELAY_MS,
          easing: EASE_OUT_EXPO,
          fill: 'forwards',
        }));

        const pageAnimations = desktop
          ? outgoingTargets.map((target) => {
            target.style.willChange = 'transform';
            return track(animateElement(target, [
              { transform: 'translate3d(0, 0, 0)' },
              { transform: 'translate3d(0, -92px, 0)' },
            ], {
              duration: OUT_MS,
              easing: EASE_OUT_EXPO,
              fill: 'forwards',
            }));
          })
          : [];

        await Promise.all([
          waitForAnimation(cover),
          ...pageAnimations.map(waitForAnimation),
        ]);
      }

      if (cancelled) return;

      // The route changes only while the curtain fully covers the viewport.
      curtain.style.transform = 'translate3d(0, 0, 0)';
      cancelAnimations();
      await Promise.resolve(callbacksRef.current.onNavigateReady?.(transition));
      await waitForDestination(() => cancelled);
      if (cancelled) return;

      resetPageMotion();
      await delay(reduceMotion ? 20 : HOLD_MS);
      if (cancelled) return;

      document.documentElement.classList.remove('poster-transition-covering');
      document.documentElement.classList.add('poster-transition-revealing');
      callbacksRef.current.onReveal?.(transition);

      const reveal = track(animateElement(curtain, [
        { transform: 'translate3d(0, 0, 0)' },
        { transform: 'translate3d(0, -100%, 0)' },
      ], {
        duration: reduceMotion ? 260 : ENTER_MS,
        easing: reduceMotion ? 'linear' : EASE_OUT_EXPO,
        fill: 'forwards',
      }));

      await waitForAnimation(reveal);
      finish();
    };

    run().catch(finish);

    return () => {
      cancelled = true;
      cancelAnimations();
      resetPageMotion();
      clearClasses();
    };
  }, [transition]);

  if (!transition) return null;

  return (
    <div ref={shellRef} className="poster-select-transition" aria-hidden="true">
      <div ref={curtainRef} className="poster-select-transition__curtain" />
    </div>
  );
};

export default PosterSelectTransition;
export { FAILSAFE_MS };
