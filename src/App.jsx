import { useState } from 'react';
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

function App() {
  const [loadingComplete, setLoadingComplete] = useState(false);

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

      {/* Navigation */}

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main>
        <Hero />
        <Experience />
        <TechStack />
        <Projects />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
