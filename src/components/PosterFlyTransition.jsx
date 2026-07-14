import { useEffect, useRef } from 'react';
import './PosterFlyTransition.css';

// Slow viscous flight: heavy hops -> sticky snap -> dissolve.
// Intentionally thick/slow so the crumpled poster reads in air.
const HOP_MS = 2680;
const SNAP_MS = 760;
const FADE_MS = 560;
const TOTAL_MS = HOP_MS + SNAP_MS + FADE_MS;
// Fail-safe buffer for App.jsx hard unmount (covers settle lag).
const FAILSAFE_MS = TOTAL_MS + 1400;

// Sticky paper settle (no snappy overshoot)
const easeViscous = 'cubic-bezier(0.18, 0.72, 0.16, 1)';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function readRect(rect) {
  if (!rect) return null;
  const left = Number(rect.left) || 0;
  const top = Number(rect.top) || 0;
  const width = Math.max(Number(rect.width) || 0, 1);
  const height = Math.max(Number(rect.height) || 0, 1);
  return { left, top, width, height };
}

function preferHeroTarget() {
  if (typeof document === 'undefined') return null;
  const selectors = [
    '#project-details .case-media__frame--hero',
    '#project-details .case-feature__media .case-media__frame',
    '#project-details .case-media__frame',
  ];
  for (const selector of selectors) {
    const node = document.querySelector(selector);
    if (!node) continue;
    const rect = node.getBoundingClientRect();
    if (rect.width < 48 || rect.height < 48) continue;
    if (rect.bottom < 40 || rect.top > window.innerHeight - 40) continue;
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }
  return null;
}

function fallbackTarget(from) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = clamp(Math.min(vw * 0.7, 880), 260, vw - 40);
  const height = width * (9 / 16);
  return {
    left: (vw - width) / 2,
    top: clamp(vh * 0.2, 88, vh * 0.3),
    width,
    height,
  };
}

// Viscous ease: very slow pull, long hang, late heavy settle.
function viscous(t) {
  const c = clamp(t, 0, 1);
  // thicker air: more late weight, less early travel
  const s = c * c * (3 - 2 * c);
  const heavy = 1 - (1 - c) ** 3.1;
  const drag = c * c * c;
  return s * 0.28 + heavy * 0.42 + drag * 0.3;
}

function hopCenter(from, to, t, seed) {
  // Four heavy paper arcs: slow rise, soft hang, drop into next crest.
  // Progress through space is itself viscous so hops feel stuck in thick air.
  const travel = viscous(t);
  const baseX = from.x + (to.x - from.x) * travel;
  const baseY = from.y + (to.y - from.y) * travel;
  // lobe envelope peaks four times, damped as we approach destination
  const damp = 1 - travel * 0.48;
  const lobe =
    Math.sin(travel * Math.PI * 4 + seed) *
    (42 + seed * 12) *
    Math.sin(travel * Math.PI) *
    damp;
  // longer float loft mid-flight
  const lift =
    -Math.sin(travel * Math.PI) *
    (96 + seed * 20) *
    (0.82 + 0.18 * Math.sin(travel * Math.PI * 2));
  // side drift like paper catching air
  const drift =
    Math.sin(travel * Math.PI * 2.05 + seed * 1.4) *
    (30 + seed * 10) *
    (1 - travel * 0.62);
  // slower flutter on Y for paper thickness
  const flutter = Math.sin(travel * Math.PI * 5.2 + seed * 2.1) * 7 * damp;
  return {
    x: baseX + lobe + drift,
    y: baseY + lift + lobe * 0.34 + flutter,
  };
}

function applyCardPose(card, pose) {
  const {
    x,
    y,
    w,
    h,
    rotate = 0,
    scale = 1,
    skewX = 0,
    skewY = 0,
    opacity = 1,
  } = pose;
  card.style.width = `${w}px`;
  card.style.height = `${h}px`;
  card.style.opacity = String(opacity);
  card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) skew(${skewX}deg, ${skewY}deg) scale(${scale})`;
}

/**
 * Gallery poster handoff:
 * slow crumpled-paper hops -> sticky snap -> dissolve into Project Details.
 */
const PosterFlyTransition = ({ flight, onNavigateReady, onSettled, onComplete }) => {
  const cardRef = useRef(null);
  const shellRef = useRef(null);
  const onNavigateReadyRef = useRef(onNavigateReady);
  const onSettledRef = useRef(onSettled);
  const onCompleteRef = useRef(onComplete);
  const activeKeyRef = useRef(null);

  useEffect(() => {
    onNavigateReadyRef.current = onNavigateReady;
    onSettledRef.current = onSettled;
    onCompleteRef.current = onComplete;
  }, [onNavigateReady, onSettled, onComplete]);

  useEffect(() => {
    if (!flight) {
      activeKeyRef.current = null;
      document.documentElement.classList.remove('poster-flight-active', 'poster-flight-settling');
      return undefined;
    }

    const key = flight.key || `${flight.projectId}:${flight.startedAt || 0}`;
    const from = readRect(flight.fromRect);
    const card = cardRef.current;
    const shell = shellRef.current;
    if (!from || !card || !shell) {
      onCompleteRef.current?.(flight);
      return undefined;
    }

    if (activeKeyRef.current === key) return undefined;
    activeKeyRef.current = key;

    let cancelled = false;
    let anim = null;
    let navTimer = 0;
    let settleTimer = 0;
    let completeTimer = 0;
    let safetyTimer = 0;
    let finished = false;

    const clearTimers = () => {
      window.clearTimeout(navTimer);
      window.clearTimeout(settleTimer);
      window.clearTimeout(completeTimer);
      window.clearTimeout(safetyTimer);
    };

    const hardHide = () => {
      if (!card) return;
      card.style.transition = 'none';
      card.style.opacity = '0';
      card.style.visibility = 'hidden';
      card.style.pointerEvents = 'none';
      card.getAnimations?.().forEach((a) => {
        try { a.cancel(); } catch { /* ignore */ }
      });
      if (shell) {
        shell.classList.remove('is-visible', 'is-settling');
        shell.style.opacity = '0';
        shell.style.visibility = 'hidden';
      }
    };

    const finish = () => {
      if (cancelled || finished) return;
      finished = true;
      clearTimers();
      try {
        anim?.cancel?.();
      } catch {
        /* ignore */
      }
      hardHide();
      document.documentElement.classList.remove('poster-flight-active', 'poster-flight-settling');
      activeKeyRef.current = null;
      onCompleteRef.current?.(flight);
    };

    // base size closed over later for settle — declared before settle uses it
    const baseW = from.width;
    const baseH = from.height;

    const settle = () => {
      if (cancelled || finished) return;
      document.documentElement.classList.add('poster-flight-settling');
      document.documentElement.classList.remove('poster-flight-active');
      shell.classList.add('is-settling');
      onSettledRef.current?.(flight);

      const live = preferHeroTarget() || fallbackTarget(from);
      try {
        if (anim) {
          const styles = getComputedStyle(card);
          card.style.transform = styles.transform === 'none'
            ? card.style.transform
            : styles.transform;
          card.style.opacity = styles.opacity || '1';
          anim.cancel();
          anim = null;
        }
      } catch {
        /* ignore */
      }

      const scaleX = live.width / Math.max(baseW, 1);
      const scaleY = live.height / Math.max(baseH, 1);
      const scale = Math.max(scaleX, scaleY);
      const liveCx = live.left + live.width / 2;
      const liveCy = live.top + live.height / 2;
      const x = liveCx - baseW / 2;
      const y = liveCy - baseH / 2;
      card.style.width = `${baseW}px`;
      card.style.height = `${baseH}px`;
      card.style.transition = `transform ${FADE_MS}ms ${easeViscous}, opacity ${FADE_MS}ms ease, box-shadow ${FADE_MS}ms ease, filter ${FADE_MS}ms ease`;
      card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(0deg) skew(0deg, 0deg) scale(${scale})`;
      card.style.filter = 'contrast(1) saturate(1) brightness(1)';
      void card.offsetWidth;
      card.style.opacity = '0';
      card.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
    };

    document.documentElement.classList.add('poster-flight-active');
    document.documentElement.classList.remove('poster-flight-settling');
    shell.classList.add('is-visible');
    shell.style.opacity = '';
    shell.style.visibility = '';
    card.style.visibility = 'visible';
    card.style.pointerEvents = 'none';
    card.style.transition = 'none';
    card.style.filter = '';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startCenter = {
      x: from.left + from.width / 2,
      y: from.top + from.height / 2,
    };

    const endRect = preferHeroTarget() || fallbackTarget(from);
    const endCenter = {
      x: endRect.left + endRect.width / 2,
      y: endRect.top + endRect.height / 2,
    };

    const endScaleX = endRect.width / baseW;
    const endScaleY = endRect.height / baseH;
    const seed = (typeof flight.seed === 'number' ? flight.seed : Math.random()) * Math.PI * 2;

    applyCardPose(card, {
      x: from.left,
      y: from.top,
      w: baseW,
      h: baseH,
      rotate: 0,
      scale: 1,
      opacity: 1,
    });

    const poseAt = (t) => {
      const snapStart = HOP_MS / TOTAL_MS;
      const fadeStart = (HOP_MS + SNAP_MS) / TOTAL_MS;

      if (t < snapStart) {
        // Heavy hop phase: viscous progress + paper flutter.
        const hopT = viscous(t / snapStart);
        const center = hopCenter(startCenter, endCenter, hopT, seed);
        // soft breathing scale, not snappy pulses
        const breath = 1 + Math.sin(hopT * Math.PI * 4) * 0.048 * (1 - hopT * 0.28);
        const grow = 1 + hopT * 0.2;
        const scale = grow * breath;
        // paper twist: slower, thicker tilt + crumple warp
        const rotate =
          Math.sin(hopT * Math.PI * 4 + seed) * 14 * (1 - hopT * 0.22) +
          Math.sin(hopT * Math.PI * 1.7 + seed) * 4.2;
        const skewX =
          Math.sin(hopT * Math.PI * 2.6 + seed * 0.7) * 3.6 * (1 - hopT * 0.32);
        const skewY =
          Math.cos(hopT * Math.PI * 2.1 + seed) * 2.4 * (1 - hopT * 0.38);
        return {
          x: center.x - baseW / 2,
          y: center.y - baseH / 2,
          w: baseW,
          h: baseH,
          rotate,
          scale,
          skewX,
          skewY,
          opacity: 1,
        };
      }

      const afterHop = clamp((t - snapStart) / (1 - snapStart), 0, 1);
      const snapPortion = SNAP_MS / (SNAP_MS + FADE_MS);
      const s = viscous(clamp(afterHop / Math.max(snapPortion, 0.001), 0, 1));
      const hopEnd = hopCenter(startCenter, endCenter, 1, seed);
      const center = {
        x: hopEnd.x + (endCenter.x - hopEnd.x) * s,
        y: hopEnd.y + (endCenter.y - hopEnd.y) * s - Math.sin(s * Math.PI) * 18,
      };
      const targetScale = Math.max(endScaleX, endScaleY);
      const scale = 1.2 + (targetScale - 1.2) * s;
      const rotate = (1 - s) * 3.2;
      const skewX = (1 - s) * 1.2;
      const skewY = (1 - s) * 0.8;
      let opacity = 1;
      if (t >= fadeStart) {
        const fadeT = viscous((t - fadeStart) / Math.max(1 - fadeStart, 0.001));
        opacity = 1 - fadeT;
      }
      return {
        x: center.x - baseW / 2,
        y: center.y - baseH / 2,
        w: baseW,
        h: baseH,
        rotate,
        scale,
        skewX,
        skewY,
        opacity,
      };
    };

    if (reduced) {
      applyCardPose(card, {
        x: endRect.left,
        y: endRect.top,
        w: endRect.width,
        h: endRect.height,
        opacity: 1,
      });
      navTimer = window.setTimeout(() => onNavigateReadyRef.current?.(flight), 40);
      settleTimer = window.setTimeout(settle, 220);
      completeTimer = window.setTimeout(finish, 220 + FADE_MS + 40);
      safetyTimer = window.setTimeout(finish, 1200);
      return () => {
        cancelled = true;
        clearTimers();
        hardHide();
        document.documentElement.classList.remove('poster-flight-active', 'poster-flight-settling');
        activeKeyRef.current = null;
      };
    }

    // Dense samples for thick, continuous motion (more keys = less stepwise feel).
    const sampleCount = 56;
    const keys = [];
    for (let i = 0; i <= sampleCount; i += 1) {
      const t = i / sampleCount;
      const pose = poseAt(t);
      keys.push({
        transform: `translate3d(${pose.x}px, ${pose.y}px, 0) rotate(${pose.rotate}deg) skew(${pose.skewX}deg, ${pose.skewY}deg) scale(${pose.scale})`,
        opacity: String(Math.max(0, pose.opacity)),
        offset: t,
      });
    }

    card.style.width = `${baseW}px`;
    card.style.height = `${baseH}px`;
    card.style.transformOrigin = 'center center';

    try {
      anim = card.animate(keys, {
        duration: TOTAL_MS,
        fill: 'forwards',
        easing: 'linear',
      });
    } catch {
      settle();
      completeTimer = window.setTimeout(finish, FADE_MS + 40);
      return () => {
        cancelled = true;
        clearTimers();
        hardHide();
        document.documentElement.classList.remove('poster-flight-active', 'poster-flight-settling');
        activeKeyRef.current = null;
      };
    }

    // Room swap under the flyer mid-hop (still covered by long flight).
    navTimer = window.setTimeout(() => {
      if (!cancelled) onNavigateReadyRef.current?.(flight);
    }, 280);

    settleTimer = window.setTimeout(settle, HOP_MS + SNAP_MS - 80);
    completeTimer = window.setTimeout(finish, TOTAL_MS + 80);
    safetyTimer = window.setTimeout(finish, FAILSAFE_MS);

    return () => {
      cancelled = true;
      clearTimers();
      try {
        anim?.cancel?.();
      } catch {
        /* ignore */
      }
      if (!finished) {
        activeKeyRef.current = null;
        hardHide();
        document.documentElement.classList.remove('poster-flight-active', 'poster-flight-settling');
      }
    };
  }, [flight]);

  if (!flight) return null;

  const from = readRect(flight.fromRect) || { left: 0, top: 0, width: 160, height: 100 };

  return (
    <div ref={shellRef} className="poster-fly is-visible" aria-hidden="true">
      <div className="poster-fly__veil" />
      <div
        ref={cardRef}
        className="poster-fly__card poster-fly__card--paper"
        style={{
          width: from.width,
          height: from.height,
          transform: `translate3d(${from.left}px, ${from.top}px, 0)`,
          opacity: 1,
        }}
      >
        <img
          className="poster-fly__image"
          src={flight.image}
          alt=""
          draggable={false}
          decoding="async"
          fetchPriority="high"
        />
        {/* Crumpled paper stack: fiber grain + creases + fold sheen + wear */}
        <span className="poster-fly__wrinkle" />
        <span className="poster-fly__creases" />
        <span className="poster-fly__fiber" />
        <span className="poster-fly__wear" />
        <span className="poster-fly__glare" />
        <span className="poster-fly__rim" />
      </div>
      {/* SVG filter for mild paper displacement / wrinkle */}
      <svg className="poster-fly__svg-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <filter id="poster-paper-crumple" x="-12%" y="-12%" width="124%" height="124%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.028 0.042" numOctaves="4" seed="11" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="11" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </div>
  );
};

export default PosterFlyTransition;
export { HOP_MS, SNAP_MS, FADE_MS, TOTAL_MS, FAILSAFE_MS };
