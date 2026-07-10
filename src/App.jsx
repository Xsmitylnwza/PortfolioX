import { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Experience from './components/Experience';
import TechStack from './components/TechStack';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ScrollManager from './components/ScrollManager';
import Cursor from './components/Cursor';
import Scribbles from './components/Scribbles';
import MusicPlayer from './components/MusicPlayer';
import Loader from './components/Loader';
import StoryProgress from './components/StoryProgress';

const HomePage = () => (
  <>
    <Hero />
    <Projects />
    <Experience />
    <TechStack />
    <Contact />
  </>
);

// Lazy load ProjectDetails to reduce initial bundle size
const ProjectDetails = lazy(() => import('./components/ProjectDetails'));
const PersonaReloadView = lazy(() => import('./components/PersonaReloadView'));

function App() {
  const [loadingComplete, setLoadingComplete] = useState(
    () => window.sessionStorage.getItem('portfolio-intro-seen') === 'true'
  );
  const location = useLocation();
  const isPersonaRoute = location.pathname === '/persona';
  const isHomeRoute = location.pathname === '/';

  // Scroll to top or hash on route change
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  return (
    <div className={isPersonaRoute ? 'app-shell persona-shell' : 'app-shell'}>
      {isHomeRoute && !loadingComplete && (
        <Loader onLoadingComplete={() => {
          window.sessionStorage.setItem('portfolio-intro-seen', 'true');
          setLoadingComplete(true);
        }} />
      )}

      {isHomeRoute && (
        <div className="scribbles-bg-wrapper" aria-hidden="true">
          <Scribbles />
        </div>
      )}

      {isHomeRoute && <div className="noise-overlay" aria-hidden="true" />}

      {/* Global Scroll Effects */}
      {!isPersonaRoute && <ScrollManager />}
      {!isPersonaRoute && <Cursor />}
      {isHomeRoute && <MusicPlayer />}
      {isHomeRoute && <StoryProgress />}

      {/* Navigation - Only show on Home Page for now? Or always?
          If on details page, nav links might break. Let's hide Nav on Details or make it smart.
          Actually, ProjectDetails has its own "Back" button.
          Let's conditionally render Navigation only on Home.
       */}
      {isHomeRoute && <Navigation />}

      {/* Main Content */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/persona"
            element={
              <Suspense fallback={<div className="loading-fallback" style={{ minHeight: '100vh', background: '#020817' }}></div>}>
                <PersonaReloadView />
              </Suspense>
            }
          />
          <Route
            path="/project/:id"
            element={
              <Suspense fallback={<div className="loading-fallback" style={{ height: '100vh', background: '#000' }}></div>}>
                <ProjectDetails />
              </Suspense>
            }
          />
        </Routes>
      </main>

      {/* Footer - Maybe only on Home? Or both? Details page has next project link.
          Let's keep Footer everywhere for consistency.
      */}
      {!isPersonaRoute && <Footer />}
    </div>
  );
}

export default App;
