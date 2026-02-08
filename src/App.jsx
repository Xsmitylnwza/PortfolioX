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

// Lazy load ProjectDetails to reduce initial bundle size
const ProjectDetails = lazy(() => import('./components/ProjectDetails'));

function App() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const location = useLocation();

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

  const HomePage = () => (
    <>
      <Hero />
      <Experience />
      <Projects />
      <TechStack />
      <Contact />
    </>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-black)',
        color: 'var(--text-primary)',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {!loadingComplete && (
        <Loader onLoadingComplete={() => setLoadingComplete(true)} />
      )}

      {/* Background Squares Animation */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          opacity: 1,
          pointerEvents: 'none',
        }}
        className="scribbles-bg-wrapper"
      >
        <Scribbles />
      </div>

      {/* Noise Overlay - Higher z-index to texture the squares too */}
      <div className="noise-overlay" style={{ zIndex: 1 }} />

      {/* Gradient Ambience */}
      <div className="gradient-red" style={{ zIndex: 1 }} />
      <div className="gradient-purple" style={{ zIndex: 1 }} />

      {/* Global Scroll Effects */}
      <ScrollManager />
      <Cursor />
      <MusicPlayer />

      {/* Navigation - Only show on Home Page for now? Or always?
          If on details page, nav links might break. Let's hide Nav on Details or make it smart.
          Actually, ProjectDetails has its own "Back" button.
          Let's conditionally render Navigation only on Home.
       */}
      {location.pathname === '/' && <Navigation />}

      {/* Main Content */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
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
      <Footer />
    </div>
  );
}

export default App;
