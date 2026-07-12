import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import GalleryScene from './components/GalleryScene';
import Footer from './components/Footer';
import ScrollManager from './components/ScrollManager';
import Cursor from './components/Cursor';
import Loader from './components/Loader';
import './components/Hero.css';

// Lazy Experience keeps the home shell free of Experience module parse/eval until needed.
const Experience = lazy(() => import('./components/Experience'));
// Lazy load ProjectDetails to reduce initial bundle size
const ProjectDetails = lazy(() => import('./components/ProjectDetails'));
const PersonaReloadView = lazy(() => import('./components/PersonaReloadView'));

const STAGE_PATHS = new Set(['/', '/experience']);
const ROOM_EXIT_MS = 500;
const ROOM_ENTER_MS = 420;

function isStagePath(path) {
  return STAGE_PATHS.has(path);
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPersonaRoute = location.pathname === '/persona';
  const isHomeRoute = location.pathname === '/';

  // roomContent = currently visible room
  // pendingRoom = destination pre-mounted during exit so React commit is hidden
  const [roomContent, setRoomContent] = useState(() => location.pathname);
  const [pendingRoom, setPendingRoom] = useState(null);
  const [isRoomExiting, setIsRoomExiting] = useState(false);
  const [isRoomEntering, setIsRoomEntering] = useState(false);
  const [scrollReady, setScrollReady] = useState(() => location.pathname !== '/');
  const transitionTimerRef = useRef(0);
  const enterTimerRef = useRef(0);
  const premountTimerRef = useRef(0);
  const swapRafRef = useRef(0);

  // Custom cursor is desktop/fine-pointer only — avoid mounting pointer shell on touch devices.
  const finePointer = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);

  const [isLoading, setIsLoading] = useState(() => location.pathname === '/');
  const [isHeroReady, setIsHeroReady] = useState(() => location.pathname !== '/');
  const prepareHero = useCallback(() => setIsHeroReady(true), []);
  const finishLoading = useCallback(() => setIsLoading(false), []);

  const destinationRoom = pendingRoom || roomContent;
  const showGalleryChrome = (roomContent === '/' || (isRoomExiting && roomContent === '/')) && isHeroReady;
  // Pre-mount Experience during gallery->experience exit so first paint isn't on the swap frame.
  const experienceMounted =
    roomContent === '/experience' ||
    pendingRoom === '/experience' ||
    (isRoomExiting && roomContent === '/experience');
  const experiencePhase =
    roomContent === '/experience' && isRoomExiting
      ? 'exiting'
      : roomContent !== '/experience' && pendingRoom === '/experience'
        ? 'preparing'
        : roomContent === '/experience' && isRoomEntering
          ? 'entering'
          : roomContent === '/experience'
            ? 'active'
            : 'hidden';

  const galleryShowContent = roomContent === '/' && !isRoomExiting;
  const stageInteractive = galleryShowContent;

  const clearTransitionTimers = useCallback(() => {
    window.clearTimeout(transitionTimerRef.current);
    window.clearTimeout(enterTimerRef.current);
    window.clearTimeout(premountTimerRef.current);
    if (swapRafRef.current) {
      window.cancelAnimationFrame(swapRafRef.current);
      swapRafRef.current = 0;
    }
  }, []);

  const finishEnter = useCallback(() => {
    setIsRoomEntering(false);
    document.documentElement.classList.remove('room-content-entering');
  }, []);

  const runRoomSwap = useCallback((from, to) => {
    // Double-rAF: wait until the exit paint has committed before mounting the next room visibly.
    swapRafRef.current = window.requestAnimationFrame(() => {
      swapRafRef.current = window.requestAnimationFrame(() => {
        navigate(to);
        setRoomContent(to);
        setPendingRoom(null);
        setIsRoomExiting(false);
        setIsRoomEntering(true);

        document.documentElement.classList.remove('room-content-exiting');
        document.documentElement.classList.remove('room-is-exiting');
        document.documentElement.classList.add('room-content-entering');
        document.dispatchEvent(new CustomEvent('portfolio:room-content-enter', {
          detail: { from, to, durationMs: ROOM_ENTER_MS },
        }));

        window.clearTimeout(enterTimerRef.current);
        enterTimerRef.current = window.setTimeout(finishEnter, ROOM_ENTER_MS);
      });
    });
  }, [finishEnter, navigate]);

  const navigateToRoom = useCallback((to) => {
    if (to === location.pathname || to === roomContent || to === pendingRoom) {
      if (!isRoomExiting) window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (isRoomExiting || isRoomEntering) return;

    const fromStage = isStagePath(roomContent);
    const toStage = isStagePath(to);

    if (!fromStage || !toStage) {
      setRoomContent(to);
      setPendingRoom(null);
      navigate(to);
      return;
    }

    // Stage -> stage: fade current content, pre-mount destination mid-exit, then reveal.
    clearTransitionTimers();
    setIsRoomExiting(true);
    setIsRoomEntering(false);
    setPendingRoom(to);
    document.documentElement.classList.add('room-content-exiting');
    document.documentElement.classList.add('room-is-exiting');
    document.documentElement.classList.remove('room-content-entering');
    document.dispatchEvent(new CustomEvent('portfolio:room-content-exit', {
      detail: { from: roomContent, to, durationMs: ROOM_EXIT_MS },
    }));

    // Destination content is pre-mounted via pendingRoom. Keep Lenis off during the
    // WebGL card exit so the main thread is free for the unmount animation.
    window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = window.setTimeout(() => {
      runRoomSwap(roomContent, to);
    }, ROOM_EXIT_MS);
  }, [
    clearTransitionTimers,
    isRoomEntering,
    isRoomExiting,
    location.pathname,
    navigate,
    pendingRoom,
    roomContent,
    runRoomSwap,
  ]);

  // Browser back/forward and non-nav route changes.
  useEffect(() => {
    if (isRoomExiting || isRoomEntering) return undefined;
    if (location.pathname === roomContent) return undefined;

    if (isStagePath(roomContent) && isStagePath(location.pathname)) {
      clearTransitionTimers();
      setIsRoomExiting(true);
      setPendingRoom(location.pathname);
      document.documentElement.classList.add('room-content-exiting');
      document.documentElement.classList.add('room-is-exiting');
      document.dispatchEvent(new CustomEvent('portfolio:room-content-exit', {
        detail: { from: roomContent, to: location.pathname, durationMs: ROOM_EXIT_MS },
      }));
      transitionTimerRef.current = window.setTimeout(() => {
        runRoomSwap(roomContent, location.pathname);
      }, ROOM_EXIT_MS);
      return undefined;
    }

    setRoomContent(location.pathname);
    setPendingRoom(null);
    return undefined;
  }, [clearTransitionTimers, isRoomEntering, isRoomExiting, location.pathname, roomContent, runRoomSwap]);

  useEffect(() => () => clearTransitionTimers(), [clearTransitionTimers]);

  // Layout classes must update before paint to avoid a one-frame body overflow hitch.
  useLayoutEffect(() => {
    const homeLock = roomContent === '/' || (isRoomExiting && roomContent === '/');
    const stageActive = isStagePath(roomContent) || isStagePath(destinationRoom);
    document.documentElement.classList.toggle('home-room-active', homeLock);
    document.documentElement.classList.toggle('stage-room-active', stageActive && !isPersonaRoute);
    document.documentElement.classList.toggle('room-is-exiting', isRoomExiting);
    document.documentElement.classList.toggle('room-is-entering', isRoomEntering);
    return () => {
      document.documentElement.classList.remove('home-room-active');
      document.documentElement.classList.remove('stage-room-active');
      document.documentElement.classList.remove('room-is-exiting');
      document.documentElement.classList.remove('room-is-entering');
    };
  }, [destinationRoom, isPersonaRoute, isRoomEntering, isRoomExiting, roomContent]);

  useLayoutEffect(() => {
    if (!isStagePath(roomContent) || roomContent === '/') return undefined;
    document.documentElement.classList.add('portfolio-ready');
    return undefined;
  }, [roomContent]);

  useEffect(() => {
    if (roomContent === '/' || isRoomExiting) return undefined;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    return undefined;
  }, [roomContent, isRoomExiting]);

  // Lenis should arm for non-home rooms only; returning home must clear the true-only latch.
  useEffect(() => {
    const wantsPageScroll = !isPersonaRoute && roomContent !== '/' && !isRoomExiting;

    window.clearTimeout(premountTimerRef.current);
    if (wantsPageScroll) {
      premountTimerRef.current = window.setTimeout(() => setScrollReady(true), 80);
      return () => window.clearTimeout(premountTimerRef.current);
    }

    setScrollReady(false);
    return undefined;
  }, [isPersonaRoute, isRoomExiting, roomContent]);

  // Warm Experience chunk once we know it will mount, so Suspense rarely blanks the overlay.
  useEffect(() => {
    if (!experienceMounted) return undefined;
    let cancelled = false;
    import('./components/Experience').catch(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [experienceMounted]);

  // Preload experience logo assets once so first reveal doesn't hitch on image decode.
  useEffect(() => {
    if (!isHeroReady) return undefined;
    const sources = [
      '/assets/optimized/scb-logo-128.png',
      '/assets/optimized/ttb-logo-128.png',
      '/icon.png',
      '/assets/optimized/tomato-logo-128.jpg',
    ];
    const images = sources.map((src) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = src;
      return image;
    });
    return () => {
      images.forEach((image) => {
        image.src = '';
      });
    };
  }, [isHeroReady]);

  return (
    <div
      className={isPersonaRoute ? 'app-shell persona-shell' : 'app-shell'}
      aria-busy={(isHomeRoute && isLoading) || isRoomExiting}
    >
      {!isPersonaRoute && (
        <div className="gallery-stage" aria-hidden="true">
          <div className="gallery-stage__glow" />
        </div>
      )}

      {isHomeRoute && isLoading && (
        <Loader onRevealReady={prepareHero} onLoadingComplete={finishLoading} />
      )}
      {(roomContent === '/' || isHomeRoute) && <div className="noise-overlay" aria-hidden="true" />}

      {/* Keep Lenis warm after first non-home stage visit; never boot it on the reveal frame. */}
      {!isPersonaRoute && scrollReady && <ScrollManager />}
      {!isPersonaRoute && finePointer && <Cursor />}
      {(isStagePath(roomContent) || isStagePath(destinationRoom)) && isHeroReady && (
        <Navigation
          currentPath={isRoomExiting ? roomContent : location.pathname}
          onRoomNavigate={navigateToRoom}
          routeReady={roomContent !== '/' || !isLoading}
        />
      )}

      <main className="site-main">
        {(isStagePath(roomContent) || isStagePath(destinationRoom)) && (
          <div
            className={[
              'gallery-room',
              roomContent === '/' ? 'is-gallery' : '',
              roomContent === '/experience' || pendingRoom === '/experience' ? 'is-experience' : '',
              isRoomExiting ? 'is-exiting' : '',
              isRoomEntering ? 'is-entering' : '',
            ].filter(Boolean).join(' ')}
          >
            {isHeroReady && (
              <div
                className={`gallery-stage-layer${stageInteractive ? ' is-interactive' : ' is-stage-only'}`}
                aria-hidden={!stageInteractive}
              >
                <GalleryScene
                  mode={galleryShowContent ? 'gallery' : 'stage'}
                  showContent={galleryShowContent}
                  contentExitMs={ROOM_EXIT_MS}
                />
              </div>
            )}

            {showGalleryChrome && (
              <section
                id="home"
                className={`orbit-hero${isRoomExiting ? ' is-exiting' : ''}`}
                aria-labelledby="orbit-title"
              >
                <header className="orbit-hero__identity">
                  <strong id="orbit-title">CHAIMONGKON SOKGAMPANG</strong>
                  <span>SOFTWARE ENGINEER</span>
                </header>
                <footer className="orbit-hero__footer">
                  <span>SELECTED SYSTEMS / 24</span>
                  <span>SCROLL TO ACCELERATE</span>
                  <span>DRAG TO ORBIT</span>
                </footer>
              </section>
            )}

            {experienceMounted && (
              <div
                className={[
                  'room-overlay',
                  experiencePhase === 'preparing' ? 'is-preparing' : '',
                  experiencePhase === 'entering' ? 'is-entering' : '',
                  experiencePhase === 'exiting' ? 'is-exiting' : '',
                  experiencePhase === 'active' ? 'is-active' : '',
                ].filter(Boolean).join(' ')}
                aria-hidden={experiencePhase === 'preparing' || experiencePhase === 'hidden'}
              >
                <Suspense fallback={null}>
                  <Experience />
                </Suspense>
              </div>
            )}
          </div>
        )}

        <Routes>
          <Route path="/" element={null} />
          <Route path="/experience" element={null} />
          <Route
            path="/persona"
            element={
              <Suspense fallback={<div className="loading-fallback loading-fallback--persona" />}>
                <PersonaReloadView />
              </Suspense>
            }
          />
          <Route
            path="/project/:id"
            element={
              <Suspense fallback={<div className="loading-fallback" />}>
                <ProjectDetails />
              </Suspense>
            }
          />
        </Routes>
      </main>

      {!isPersonaRoute && !isStagePath(roomContent) && !isStagePath(destinationRoom) && <Footer />}
    </div>
  );
}

export default App;
