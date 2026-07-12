import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { ROOM_HINTS } from '../data/site';
import './Navigation.css';

const navLinks = [
    {
        href: '/',
        label: 'GALLERY',
        roomCode: '01',
        icon: 'lucide:orbit',
        hint: ROOM_HINTS.gallery,
    },
    {
        href: '/experience',
        label: 'EXPERIENCE',
        roomCode: '02',
        icon: 'lucide:briefcase-business',
        hint: ROOM_HINTS.experience,
    },
    {
        href: '/stack',
        label: 'STACK',
        roomCode: '03',
        icon: 'lucide:layers-2',
        hint: ROOM_HINTS.stack,
    },
    {
        href: '/contact',
        label: 'CONTACT',
        roomCode: '04',
        icon: 'lucide:send',
        hint: ROOM_HINTS.contact,
    },
];

const isCurrentPath = (href, currentPath) => {
    if (href === currentPath) return true;
    if (href === '/stack' && currentPath === '/tech') return true;
    if (href === '/contact' && (currentPath === '/resume' || currentPath === '/cv')) return true;
    return false;
};

const Navigation = ({ currentPath, onRoomNavigate, routeReady = false }) => {
    const [open, setOpen] = useState(false);
    const [activeLabel, setActiveLabel] = useState(null);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const close = (event) => {
            if (event.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', close);
        return () => window.removeEventListener('keydown', close);
    }, [open]);

    useEffect(() => {
        setActiveLabel(null);
    }, [currentPath]);

    const handleLinkClick = (event, link) => {
        setOpen(false);
        setActiveLabel(null);
        if (link.disabled) {
            event.preventDefault();
            return;
        }
        if (!link.roomCode) return;

        event.preventDefault();
        if (isCurrentPath(link.href, currentPath)) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        onRoomNavigate(link.href, link.label, link.roomCode);
    };

    return (
        <nav
            ref={menuRef}
            className={[
                'corner-menu',
                open ? 'is-open' : '',
                routeReady ? 'is-route-ready' : '',
                activeLabel ? 'has-active' : '',
            ].filter(Boolean).join(' ')}
            aria-label="Primary navigation"
            onMouseLeave={() => setActiveLabel(null)}
        >
            <button
                type="button"
                className="corner-menu__trigger"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
            >
                MENU
                <span className="corner-menu__trigger-mark" aria-hidden="true">
                    <Icon icon="lucide:command" width="14" height="14" />
                </span>
            </button>

            <div className="corner-menu__panel">
                {navLinks.map((link) => {
                    const isCurrent = !link.disabled && isCurrentPath(link.href, currentPath);
                    const isActive = activeLabel === link.label;

                    return (
                        <a
                            key={link.label}
                            href={link.href}
                            className={[
                                'corner-menu__link',
                                link.disabled ? 'is-disabled' : '',
                                isCurrent ? 'is-current' : '',
                                isActive ? 'is-active' : '',
                            ].filter(Boolean).join(' ')}
                            aria-disabled={link.disabled || undefined}
                            aria-current={isCurrent ? 'page' : undefined}
                            onClick={(event) => handleLinkClick(event, link)}
                            onMouseEnter={() => setActiveLabel(link.label)}
                            onFocus={() => setActiveLabel(link.label)}
                            onMouseLeave={() => setActiveLabel((value) => (value === link.label ? null : value))}
                            onBlur={() => setActiveLabel((value) => (value === link.label ? null : value))}
                        >
                            <span className="corner-menu__row">
                                <span className="corner-menu__glyph" aria-hidden="true">
                                    <Icon icon={link.icon} className="corner-menu__glyph-icon" />
                                </span>

                                <span className="corner-menu__label">{link.label}</span>

                                <span className="corner-menu__arrow" aria-hidden="true">
                                    <Icon icon={link.disabled ? 'lucide:lock' : 'lucide:arrow-up-right'} />
                                </span>
                            </span>

                            <span className="corner-menu__meta">
                                <span className="corner-menu__code">{link.roomCode || '··'}</span>
                                <span className="corner-menu__hint">{link.hint}</span>
                            </span>
                        </a>
                    );
                })}
            </div>
        </nav>
    );
};

export default Navigation;
