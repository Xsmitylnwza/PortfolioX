import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Experience from './components/Experience';
import TechStack from './components/TechStack';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ScrollManager from './components/ScrollManager';
import Cursor from './components/Cursor';
import Squares from './components/Squares';

function App() {
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
        className="squares-bg-wrapper"
      >
        <Squares
          speed={0.5}
          squareSize={50}
          direction="diagonal"
          borderColor="rgba(255, 255, 255, 0.15)"
          hoverFillColor="#ef4444"
        />
      </div>

      {/* Noise Overlay - Higher z-index to texture the squares too */}
      <div className="noise-overlay" style={{ zIndex: 1 }} />

      {/* Gradient Ambience */}
      <div className="gradient-red" style={{ zIndex: 1 }} />
      <div className="gradient-purple" style={{ zIndex: 1 }} />

      {/* Global Scroll Effects */}
      <ScrollManager />
      <Cursor />

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
