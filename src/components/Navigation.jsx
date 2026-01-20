import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';

// Scramble Text Component for Nav
const NavScramble = ({ text, isHovered, isActive }) => {
  const elementRef = useRef(null);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

  useEffect(() => {
    // Trigger scramble on hover start or when becoming active
    if (!isHovered && !isActive) {
      if (elementRef.current) elementRef.current.innerText = text;
      return;
    }

    let iterations = 0;
    const interval = setInterval(() => {
      if (!elementRef.current) return;

      elementRef.current.innerText = text
        .split("")
        .map((letter, index) => {
          if (index < iterations) {
            return text[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");

      if (iterations >= text.length) {
        clearInterval(interval);
      }
      iterations += 1 / 2; // Faster for nav
    }, 30);

    return () => clearInterval(interval);
  }, [text, isHovered, isActive]);

  return <span ref={elementRef} style={{ color: isActive ? 'var(--red-primary)' : 'inherit' }}>{text}</span>;
};

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Section Observer for Active State
  useEffect(() => {
    const sections = ['home', 'experience', 'projects', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' } // Trigger when element hits center of viewport
    );

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { href: '#home', label: 'Home', id: 'home' },
    { href: '#experience', label: 'Experience', id: 'experience' },
    { href: '#projects', label: 'Projects', id: 'projects' },
    { href: '#contact', label: 'Contact', id: 'contact' },
  ];

  return (
    <>
      <nav
        id="main-nav"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.3s ease',
        }}
      >
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(5, 5, 5, 0.7)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--glass-border)',
            opacity: isScrolled ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          }}
        />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '1rem' }} data-cursor-text="HOME">
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              overflow: 'hidden',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <img
              src="/profile-logo.jpg"
              alt="Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'grayscale(1)',
                transition: 'filter 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = 'grayscale(0)')}
              onMouseLeave={(e) => (e.currentTarget.style.filter = 'grayscale(1)')}
            />
          </div>
          <span
            className="font-display"
            style={{
              fontWeight: 700,
              fontSize: '1.25rem',
              letterSpacing: '-0.02em',
              display: 'none',
            }}
            id="nav-logo-text"
          >
            DEV<span style={{ color: 'var(--red-primary)' }}>.</span>GABRIEL
          </span>
        </div>

        {/* Desktop Nav Links */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'none',
            alignItems: 'center',
            gap: '2rem',
          }}
          className="md-flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              data-cursor-text="NAVIGATE"
              style={{
                fontSize: '0.75rem',
                fontWeight: 400,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: activeSection === link.id ? 'var(--red-primary)' : 'var(--text-muted)',
                transition: 'color 0.3s ease',
                textDecoration: 'none', // Explicitly remove default
                position: 'relative',
                display: 'inline-block',
                minWidth: '80px', // Prevent jitter during scramble
                textAlign: 'center'
              }}
              onMouseEnter={() => setHoveredLink(link.id)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <NavScramble
                text={link.label}
                isHovered={hoveredLink === link.id}
                isActive={activeSection === link.id}
              />
              {/* Active Dot */}
              {activeSection === link.id && (
                <span style={{
                  position: 'absolute',
                  bottom: '-5px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--red-primary)',
                  boxShadow: '0 0 10px var(--red-primary)'
                }} />
              )}
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a
            href="#contact"
            id="nav-cta"
            data-cursor-text="SAY HELLO"
            className="btn-primary md-show"
            style={{
              display: 'none',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
            }}
          >
            <span>Let's Talk</span>
            <Icon
              icon="lucide:arrow-up-right"
              style={{ fontSize: '1rem', transition: 'transform 0.3s ease' }}
              className="nav-cta-icon"
            />
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
            className="md-hidden"
          >
            <Icon icon="lucide:menu" style={{ fontSize: '1.25rem' }} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 5, 5, 0.98)',
          backdropFilter: 'blur(20px)',
          zIndex: 110,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isMobileMenuOpen ? 1 : 0,
          transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
          pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '0.75rem',
            cursor: 'pointer',
            color: 'var(--text-primary)',
          }}
        >
          <Icon icon="lucide:x" style={{ fontSize: '1.5rem' }} />
        </button>

        {/* Nav Links */}
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-display"
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              transition: 'color 0.3s ease',
              color: activeSection === link.id ? 'var(--red-primary)' : 'var(--text-primary)'
            }}
          >
            {link.label}
          </a>
        ))}

        {/* CTA */}
        <a
          href="#contact"
          onClick={() => setIsMobileMenuOpen(false)}
          className="btn-primary"
          style={{ marginTop: '1.5rem' }}
        >
          <span>Let's Talk</span>
        </a>
      </div>

      <style>{`
                @media (min-width: 640px) {
                    #nav-logo-text {
                        display: block !important;
                    }
                }
                #nav-cta:hover .nav-cta-icon {
                    transform: rotate(45deg);
                }
            `}</style>
    </>
  );
};

export default Navigation;
