import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import './Navigation.css';

const navLinks = [
    { href: '#home', label: 'Home', id: 'home' },
    { href: '#projects', label: 'Work', id: 'projects' },
    { href: '#experience', label: 'Evidence', id: 'experience' },
    { href: '#capabilities', label: 'Engine', id: 'capabilities' },
    { href: '#contact', label: 'Contact', id: 'contact' },
];

const NavScramble = ({ text, active }) => {
    const elementRef = useRef(null);
    const intervalRef = useRef(null);

    const start = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
        let iteration = 0;
        window.clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(() => {
            if (!elementRef.current) return;
            elementRef.current.textContent = text
                .split('')
                .map((letter, index) => index < iteration ? text[index] : chars[Math.floor(Math.random() * chars.length)])
                .join('');
            iteration += 0.55;
            if (iteration >= text.length) {
                window.clearInterval(intervalRef.current);
                elementRef.current.textContent = text;
            }
        }, 28);
    };

    useEffect(() => () => window.clearInterval(intervalRef.current), []);

    return <span ref={elementRef} className={active ? 'is-active' : ''} onMouseEnter={start}>{text}</span>;
};

const Navigation = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const menuButtonRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        let frame = null;
        const handleScroll = () => {
            if (frame) return;
            frame = requestAnimationFrame(() => {
                setIsScrolled(window.scrollY > 40);
                frame = null;
            });
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.find((entry) => entry.isIntersecting);
                if (visible) setActiveSection(visible.target.id);
            },
            { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
        );
        navLinks.forEach(({ id }) => {
            const node = document.getElementById(id);
            if (node) observer.observe(node);
        });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isMobileMenuOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const menuTrigger = menuButtonRef.current;
        const menu = menuRef.current;
        const focusable = menu?.querySelectorAll('a, button');
        focusable?.[0]?.focus();

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsMobileMenuOpen(false);
                return;
            }
            if (event.key !== 'Tab' || !focusable?.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
            menuTrigger?.focus();
        };
    }, [isMobileMenuOpen]);

    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <>
            <nav id="main-nav" className={isScrolled ? 'main-nav is-scrolled' : 'main-nav'} aria-label="Primary navigation">
                <a className="nav-brand" href="#home" aria-label="Chaimongkon portfolio home">
                    <img src="/assets/optimized/profile-logo-128.jpg" alt="" decoding="async" />
                    <span>DEV<span>.</span>GABRIEL</span>
                </a>

                <div className="nav-desktop-links">
                    {navLinks.map((link) => (
                        <a key={link.id} href={link.href} aria-current={activeSection === link.id ? 'location' : undefined}>
                            <NavScramble text={link.label} active={activeSection === link.id} />
                        </a>
                    ))}
                    <a className="nav-resume" href="/assets/Chaimongkon-Sokgampang_Resume.pdf" target="_blank" rel="noreferrer">
                        Resume <Icon icon="lucide:arrow-up-right" />
                    </a>
                </div>

                <button
                    ref={menuButtonRef}
                    type="button"
                    className="nav-menu-button"
                    aria-label="Open navigation menu"
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="mobile-menu"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <span />
                    <span />
                </button>
            </nav>

            {isMobileMenuOpen && (
                <div ref={menuRef} id="mobile-menu" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu">
                    <div className="mobile-menu-head">
                        <span className="font-mono">CHAPTER SELECT</span>
                        <button type="button" onClick={closeMenu} aria-label="Close navigation menu">
                            <Icon icon="lucide:x" />
                        </button>
                    </div>
                    <div className="mobile-menu-links">
                        {navLinks.map((link, index) => (
                            <a key={link.id} href={link.href} onClick={closeMenu}>
                                <span>{String(index).padStart(2, '0')}</span>
                                {link.label}
                            </a>
                        ))}
                    </div>
                    <div className="mobile-menu-actions">
                        <a href="/assets/Chaimongkon-Sokgampang_Resume.pdf" target="_blank" rel="noreferrer">Resume ↗</a>
                        <a href="mailto:chaimongkon.sokgampang@gmail.com">Email ↗</a>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navigation;
