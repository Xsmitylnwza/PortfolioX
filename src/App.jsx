import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
const StackPage = lazy(() => import('./components/StackPage'));
const ResumePage = lazy(() => import('./components/ResumePage'));
const ContactPage = lazy(() => import('./components/ContactPage'));

const STAGE_PATHS = new Set(['/', '/experience']);
const DOCUMENT_PATHS = new Set(['/stack', '/tech', '/resume', '/cv', '/contact']);
const ROOM_EXIT_MS = 500;
const ROOM_ENTER_MS = 820;

function isStagePath(path) {
  return STAGE_PATHS.has(path);
}

function isDocumentPath(path) {
  return DOCUMENT_PATHS.has(path);
}

function isHomePath(path) {
  return path === '/';
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPersonaRoute = location.pathname === '/persona';
  const isHomeRoute = isHomePath(location.pathname);

  // roomContent = currently visible room
  // pendingRoom = destination pre-mounted during exit so React commit is hidden
  const [roomContent, setRoomContent] = useState(() => location.pathname);
  const [pendingRoom, setPendingRoom] = useState(null);
  const [isRoomExiting, setIsRoomExiting] = useState(false);
  // Room content enter starts after the shared poster-loader, not before it.
  const [isRoomEntering, setIsRoomEntering] = useState(false);
  const [scrollReady, setScrollReady] = useState(false);
  const transitionTimerRef = useRef(0);
  const enterTimerRef = useRef(0);
  const premountTimerRef = useRef(0);
  const swapRafRef = useRef(0);
  // Session-level intro: poster flash + red wipe runs once on first entry to any route.
  const bootLoaderDoneRef = useRef(false);

  // Custom cursor is desktop/fine-pointer only — avoid mounting pointer shell on touch devices.
  const finePointer = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);

  // Loader is shared across ALL entry paths (/, /experience, /project/*, /persona, document rooms).
  const [isLoading, setIsLoading] = useState(true);
  const [isHeroReady, setIsHeroReady] = useState(false);

  const destinationRoom = pendingRoom || roomContent;
  const showGalleryChrome = (roomContent === '/' || (isRoomExiting && roomContent === '/')) && isHeroReady && !isLoading;
  // Pre-mount Experience once the loader has prepared the stage (still under the wipe).
  const experienceMounted =
    isHeroReady && (
      roomContent === '/experience' ||
      pendingRoom === '/experience' ||
      (isRoomExiting && roomContent === '/experience')
    );

  // Shared phase model for Experience.
  // During boot loader, destination content stays "preparing" under the black/red wipe.
  const experiencePhase = (() => {
    if (!experienceMounted) return 'hidden';
    if (roomContent === '/experience' && isRoomExiting) return 'exiting';
    if (roomContent !== '/experience' && pendingRoom === '/experience') return 'preparing';
    if (isLoading) return 'preparing';
    if (roomContent === '/experience' && isRoomEntering) return 'entering';
    if (roomContent === '/experience') return 'active';
    return 'hidden';
  })();

  // Non-stage routes use the same enter/exit shell language, gated by the shared loader.
  const pageShellPhase = (() => {
    if (isStagePath(roomContent) || isStagePath(destinationRoom)) return 'hidden';
    if (isLoading) return 'preparing';
    if (isRoomExiting) return 'exiting';
    if (isRoomEntering) return 'entering';
    return 'active';
  })();

  const galleryShowContent = roomContent === '/' && !isRoomExiting && !isLoading;
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

  const beginEnter = useCallback((from, to, { navigateTo = false } = {}) => {
    setIsRoomExiting(false);
    setIsRoomEntering(true);
    setPendingRoom(null);
    setRoomContent(to);

    document.documentElement.classList.remove('room-content-exiting');
    document.documentElement.classList.remove('room-is-exiting');
    document.documentElement.classList.add('room-content-entering');

    document.dispatchEvent(new CustomEvent('portfolio:room-content-enter', {
      detail: { from, to, durationMs: ROOM_ENTER_MS, reason: navigateTo ? 'navigate' : 'mount' },
    }));

    if (navigateTo) navigate(to);

    window.clearTimeout(enterTimerRef.current);
    enterTimerRef.current = window.setTimeout(finishEnter, ROOM_ENTER_MS);
  }, [finishEnter, navigate]);

  // Loader: mid-sequence — mount stage/WebGL under the wipe so grid can reveal with the red expand.
  const prepareHero = useCallback(() => {
    setIsHeroReady(true);
  }, []);

  // Loader: end sequence — unlock destination room enter for the current path.
  const finishLoading = useCallback(() => {
    if (bootLoaderDoneRef.current) {
      setIsLoading(false);
      return;
    }
    bootLoaderDoneRef.current = true;

    const path = location.pathname;

    // Drop the loader first while destination stays in preparing (opacity 0).
    // Double-rAF guarantees that frame commits before the enter fade starts —
    // same seamlessness idea as gallery chrome after the red wipe.
    setIsLoading(false);

    if (isHomePath(path)) return;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setIsRoomEntering(true);
        document.documentElement.classList.add('room-content-entering');
        document.dispatchEvent(new CustomEvent('portfolio:room-content-enter', {
          detail: { from: null, to: path, durationMs: ROOM_ENTER_MS, reason: 'boot' },
        }));
        window.clearTimeout(enterTimerRef.current);
        enterTimerRef.current = window.setTimeout(finishEnter, ROOM_ENTER_MS);
      });
    });
  }, [finishEnter, location.pathname]);

  const runRoomSwap = useCallback((from, to) => {
    // Double-rAF: wait until the exit paint has committed before mounting the next room visibly.
    swapRafRef.current = window.requestAnimationFrame(() => {
      swapRafRef.current = window.requestAnimationFrame(() => {
        beginEnter(from, to, { navigateTo: true });
      });
    });
  }, [beginEnter]);

  const navigateToRoom = useCallback((to) => {
    if (isLoading) return;
    if (to === location.pathname || to === roomContent || to === pendingRoom) {
      if (!isRoomExiting) window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (isRoomExiting || isRoomEntering) return;

    const fromStage = isStagePath(roomContent);
    const toStage = isStagePath(to);

    // Stage -> stage keeps the shared gallery stage and content exit/enter choreography.
    if (fromStage && toStage) {
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

      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = window.setTimeout(() => {
        runRoomSwap(roomContent, to);
      }, ROOM_EXIT_MS);
      return;
    }

    // Any other path (project/persona/document rooms): hard cut + mount enter on destination.
    clearTransitionTimers();
    beginEnter(roomContent, to, { navigateTo: true });
  }, [
    beginEnter,
    clearTransitionTimers,
    isLoading,
    isRoomEntering,
    isRoomExiting,
    location.pathname,
    pendingRoom,
    roomContent,
    runRoomSwap,
  ]);

  // Browser back/forward and non-nav route changes.
  useEffect(() => {
    if (isLoading) return undefined;
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

    clearTransitionTimers();
    beginEnter(roomContent, location.pathname, { navigateTo: false });
    return undefined;
  }, [beginEnter, clearTransitionTimers, isLoading, isRoomEntering, isRoomExiting, location.pathname, roomContent, runRoomSwap]);

  useEffect(() => () => clearTransitionTimers(), [clearTransitionTimers]);

  // Layout classes must update before paint to avoid a one-frame body overflow hitch.
  useLayoutEffect(() => {
    const homeLock = (roomContent === '/' || (isRoomExiting && roomContent === '/')) && !isLoading;
    const stageActive = isStagePath(roomContent) || isStagePath(destinationRoom);
    const documentRoomActive = isDocumentPath(roomContent) || isDocumentPath(destinationRoom);
    document.documentElement.classList.toggle('home-room-active', homeLock);
    document.documentElement.classList.toggle('stage-room-active', stageActive && !isPersonaRoute);
    document.documentElement.classList.toggle('document-room-active', documentRoomActive && !isPersonaRoute);
    document.documentElement.classList.toggle('room-is-exiting', isRoomExiting);
    document.documentElement.classList.toggle('room-is-entering', isRoomEntering);
    document.documentElement.classList.toggle('boot-loader-active', isLoading);
    return () => {
      document.documentElement.classList.remove('home-room-active');
      document.documentElement.classList.remove('stage-room-active');
      document.documentElement.classList.remove('document-room-active');
      document.documentElement.classList.remove('room-is-exiting');
      document.documentElement.classList.remove('room-is-entering');
      document.documentElement.classList.remove('boot-loader-active');
    };
  }, [destinationRoom, isLoading, isPersonaRoute, isRoomEntering, isRoomExiting, roomContent]);

  useEffect(() => {
    if (isLoading || roomContent === '/' || isRoomExiting) return undefined;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    return undefined;
  }, [isLoading, roomContent, isRoomExiting]);

  // Lenis only after boot loader finishes and we are not on locked home gallery.
  useEffect(() => {
    const wantsPageScroll = !isLoading && !isPersonaRoute && roomContent !== '/' && !isRoomExiting;

    window.clearTimeout(premountTimerRef.current);
    if (wantsPageScroll) {
      premountTimerRef.current = window.setTimeout(() => setScrollReady(true), 80);
      return () => window.clearTimeout(premountTimerRef.current);
    }

    setScrollReady(false);
    return undefined;
  }, [isLoading, isPersonaRoute, isRoomExiting, roomContent]);

  // Warm Experience chunk during loader so Suspense rarely blanks after the wipe.
  useEffect(() => {
    if (!(roomContent === '/experience' || pendingRoom === '/experience' || location.pathname === '/experience')) {
      return undefined;
    }
    let cancelled = false;
    import('./components/Experience').catch(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [location.pathname, pendingRoom, roomContent]);

  // Warm document room chunks once stage prep starts.
  useEffect(() => {
    if (!isHeroReady) return undefined;
    let cancelled = false;
    Promise.all([
      import('./components/StackPage'),
      import('./components/ResumePage'),
      import('./components/ContactPage'),
    ]).catch(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [isHeroReady]);

  // Preload experience logo assets once the stage is allowed to mount under the wipe.
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

  const showStageRoom = isStagePath(roomContent) || isStagePath(destinationRoom);
  const showPageRoutes = !isStagePath(roomContent) && !isStagePath(destinationRoom);
  const documentRoomActive = isDocumentPath(roomContent) || isDocumentPath(destinationRoom);
  // Keep WebGL grid alive under glass document rooms (upper content only; stage never unmounts).
  const stageLoopActive = showStageRoom || documentRoomActive;
  const showPrimaryNav = !isPersonaRoute && isHeroReady && (
    showStageRoom || documentRoomActive || showPageRoutes
  );
  const navPath = isRoomExiting ? roomContent : location.pathname;

  return (
    <div
      className={isPersonaRoute ? 'app-shell persona-shell' : 'app-shell'}
      aria-busy={isLoading || isRoomExiting}
    >
      {!isPersonaRoute && (
        <div className="gallery-stage" aria-hidden="true">
          <div className="gallery-stage__glow" />
        </div>
      )}

      {/* Shared boot intro for every entry path — posters on black, then red wipe into stage. */}
      {isLoading && (
        <Loader onRevealReady={prepareHero} onLoadingComplete={finishLoading} />
      )}
      {(roomContent === '/' || isHomeRoute || isLoading) && <div className="noise-overlay" aria-hidden="true" />}

      {/* Keep Lenis warm after first non-home stage visit; never boot it on the reveal frame. */}
      {!isPersonaRoute && scrollReady && <ScrollManager />}
      {!isPersonaRoute && finePointer && !isLoading && <Cursor />}
      {showPrimaryNav && (
        <Navigation
          currentPath={navPath}
          onRoomNavigate={navigateToRoom}
          routeReady={!isLoading && (roomContent !== '/' || !isLoading)}
        />
      )}

      <main className="site-main">
        {/* Persistent WebGL host: stays mounted across non-persona routes once boot is ready.
            active=false on document/project rooms pauses RAF but keeps the GL context + red stage identity. */}
        {isHeroReady && !isPersonaRoute && (
          <div
            className={`gallery-stage-layer${stageInteractive ? ' is-interactive' : ' is-stage-only'}`}
            aria-hidden={!stageInteractive}
          >
            <GalleryScene
              mode={galleryShowContent ? 'gallery' : 'stage'}
              showContent={galleryShowContent}
              contentExitMs={ROOM_EXIT_MS}
              active={stageLoopActive}
            />
          </div>
        )}

        {showStageRoom && (
          <div
            className={[
              'gallery-room',
              roomContent === '/' ? 'is-gallery' : '',
              roomContent === '/experience' || pendingRoom === '/experience' ? 'is-experience' : '',
              isRoomExiting ? 'is-exiting' : '',
              isRoomEntering ? 'is-entering' : '',
              isLoading ? 'is-booting' : '',
            ].filter(Boolean).join(' ')}
          >
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
                  'route-enter-layer',
                  experiencePhase === 'preparing' ? 'is-preparing' : '',
                  experiencePhase === 'entering' ? 'is-entering' : '',
                  experiencePhase === 'exiting' ? 'is-exiting' : '',
                  experiencePhase === 'active' ? 'is-active' : '',
                ].filter(Boolean).join(' ')}
                aria-hidden={experiencePhase === 'preparing' || experiencePhase === 'hidden'}
                data-route-phase={experiencePhase}
              >
                <Suspense fallback={null}>
                  <Experience />
                </Suspense>
              </div>
            )}
          </div>
        )}

        {/* Stage rooms render via gallery-room; non-stage routes share the mount/enter shell. */}
        <div
          className={[
            'route-shell',
            'route-enter-layer',
            showPageRoutes ? '' : 'is-hidden-stage',
            showPageRoutes && pageShellPhase === 'preparing' ? 'is-preparing' : '',
            showPageRoutes && pageShellPhase === 'entering' ? 'is-entering' : '',
            showPageRoutes && pageShellPhase === 'exiting' ? 'is-exiting' : '',
            showPageRoutes && pageShellPhase === 'active' ? 'is-active' : '',
            isPersonaRoute ? 'route-shell--persona' : 'route-shell--page',
          ].filter(Boolean).join(' ')}
          data-route-phase={showPageRoutes ? pageShellPhase : 'stage'}
          aria-hidden={!showPageRoutes || pageShellPhase === 'preparing'}
          hidden={!showPageRoutes}
        >
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
            <Route
              path="/stack"
              element={
                <Suspense fallback={<div className="loading-fallback" />}>
                  <StackPage />
                </Suspense>
              }
            />
            <Route path="/tech" element={<Navigate to="/stack" replace />} />
            <Route
              path="/resume"
              element={
                <Suspense fallback={<div className="loading-fallback" />}>
                  <ResumePage />
                </Suspense>
              }
            />
            <Route path="/cv" element={<Navigate to="/resume" replace />} />
            <Route
              path="/contact"
              element={
                <Suspense fallback={<div className="loading-fallback" />}>
                  <ContactPage />
                </Suspense>
              }
            />
          </Routes>
        </div>
      </main>

      {!isPersonaRoute && !isLoading && !isStagePath(roomContent) && !isStagePath(destinationRoom) && <Footer />}
    </div>
  );
}

export default App;
