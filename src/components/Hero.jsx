import React, { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Hero.css';

const Hero = () => {
    const heroRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Initial Load Animations
            tl.fromTo('.bg-deco-img',
                { opacity: 0, scale: 0.8, rotation: 0 },
                { opacity: 0.2, scale: 1, rotation: (i) => i === 0 ? 12 : -12, duration: 1.5, stagger: 0.2, ease: 'power3.out' }
            )
                .fromTo('.main-torn-wrapper',
                    { opacity: 0, y: 100, rotation: 10 },
                    { opacity: 1, y: 0, rotation: -3, duration: 1.2, ease: 'back.out(1.2)' },
                    '-=1'
                )
                .fromTo('.secondary-fragment-wrapper',
                    { opacity: 0, x: 50, rotation: 10 },
                    { opacity: 1, x: 0, rotation: 5, duration: 1, ease: 'power3.out' },
                    '-=0.8'
                )
                .fromTo('.ransom-letter',
                    { opacity: 0, scale: 0, rotation: () => Math.random() * 30 - 15 },
                    { opacity: 1, scale: 1, rotation: 0, duration: 0.5, stagger: 0.05, ease: 'back.out(2)' },
                    '-=0.5'
                )
                .fromTo('.intro-section',
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
                    '-=0.5'
                );

            // --- Scroll Parallax Effects ---

            // Background Deco Parallax
            gsap.to('.bg-deco-1', {
                y: 150,
                rotation: 25,
                scrollTrigger: {
                    trigger: '.hero-container',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1
                }
            });

            gsap.to('.bg-deco-2', {
                y: -100,
                rotation: -25,
                scrollTrigger: {
                    trigger: '.hero-container',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1.5
                }
            });

            // "The Tear" Exit Animation
            gsap.to('.main-torn-wrapper', {
                y: -300, // Move up faster than scroll
                x: -50,
                rotation: -15, // Rotate away
                scrollTrigger: {
                    trigger: '.hero-container',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1
                }
            });

            // Sync text movement with image but without rotation
            gsap.to('.ransom-container', {
                y: -300,
                x: -50,
                rotation: 0, // Stay upright
                scrollTrigger: {
                    trigger: '.hero-container',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1
                }
            });

            // Secondary Fragment Separate Exit
            gsap.to('.secondary-fragment-wrapper', {
                y: -150,
                x: 100, // Move right
                rotation: 45, // Spin out
                scrollTrigger: {
                    trigger: '.hero-container',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1.2
                }
            });

            // Marquee Acceleration on Scroll
            ScrollTrigger.create({
                trigger: '.hero-container',
                start: 'top top',
                end: 'bottom top',
                onUpdate: (self) => {
                    const velocity = self.getVelocity();
                    // Optional: could adjust marquee speed here if we had a ref to it
                }
            });

        }, heroRef);

        return () => ctx.revert();
    }, []);

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 20; // -10 to 10
        const yPos = (clientY / window.innerHeight - 0.5) * 20;

        // Parallax specific elements

        // Target inner wrapper to avoid conflict with ScrollTrigger on container
        gsap.to('.ransom-wrapper', {
            x: xPos * 2,
            y: yPos * 2,
            duration: 0.5,
            ease: 'power2.out'
        });

        gsap.to('.handwritten-layer', {
            x: xPos * 1.5,
            y: yPos * 1.5,
            duration: 0.5,
            ease: 'power2.out'
        });

        // Target image inside to avoid conflict with container scroll
        gsap.to('.bg-deco-img img', {
            x: xPos * -1,
            y: yPos * -1,
            duration: 1
        });
    };

    return (
        <section id="home" className="hero-container" ref={heroRef} onMouseMove={handleMouseMove}>
            {/* Main Hero Content */}
            <div className="hero-main">

                {/* Decorative Background Elements */}
                <div className="bg-deco-img bg-deco-1">
                    <img src="https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/be7bd51c-6dd7-4e04-a620-8108ef138948/1768838242918-60798e6e/Justin_and_Hailey_Bieber___.jpg"
                        alt="Deco" />
                </div>

                <div className="bg-deco-img bg-deco-2">
                    <img src="https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/be7bd51c-6dd7-4e04-a620-8108ef138948/1768838242918-60798e6e/Justin_and_Hailey_Bieber___.jpg"
                        alt="Deco" />
                </div>

                {/* Center Collage */}
                <div className="collage-center">

                    {/* Handwritten Notes Layer (New) */}
                    <div className="handwritten-layer" style={{ position: 'absolute', inset: -50, pointerEvents: 'none', zIndex: 25 }}>
                        <svg viewBox="0 0 500 500" style={{ width: '100%', height: '100%', opacity: 0.8 }}>
                            {/* "for you" scribbled near bottom right */}
                            <path d="M 350 400 Q 360 390 370 400 T 390 410" stroke="white" strokeWidth="2" fill="none" opacity="0.6" />
                            <text x="360" y="430" fontFamily="'Permanent Marker', cursive" fill="white" fontSize="14" transform="rotate(-5, 360, 430)">for you</text>

                            {/* Heart scribble top left */}
                            <path d="M 100 100 C 90 90, 80 100, 100 120 C 120 100, 110 90, 100 100" stroke="var(--red-primary)" strokeWidth="2" fill="none" transform="rotate(-15, 100, 110)" />

                            {/* Arrows pointing to center */}
                            <path d="M 120 350 Q 150 320 180 300" stroke="white" strokeWidth="1" strokeDasharray="5,5" fill="none" opacity="0.4" />
                        </svg>
                    </div>

                    {/* Main Image - Torn Paper Look */}
                    {/* CS STYLES applied here via fromTo, removed inanimate classes */}
                    <div className="main-torn-wrapper" data-cursor="view" data-cursor-text="PORTRAIT">
                        <div className="torn-paper-box">
                            <img src="https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/be7bd51c-6dd7-4e04-a620-8108ef138948/1768838242918-60798e6e/Justin_and_Hailey_Bieber___.jpg"
                                alt="Artist Portrait" />

                            {/* Tape Strip */}
                            <div className="tape-strip"></div>
                        </div>
                    </div>

                    {/* Secondary Image Fragment */}
                    <div className="secondary-fragment-wrapper" data-cursor="view" data-cursor-text="DETAIL">
                        <div className="fragment-box">
                            <img src="https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/uploads/be7bd51c-6dd7-4e04-a620-8108ef138948/1768838242918-60798e6e/Justin_and_Hailey_Bieber___.jpg"
                                alt="Detail" />
                        </div>
                    </div>

                    {/* Sticker Elements */}
                    {/* Keeping CSS animations for stars as they are loop/pulse and don't conflict with main scroll transform much, 
                        or we could GSAP them. Let's keep CSS for now for simple pulse. */}
                    <div className="star-1 animate-pulse-glow">
                        <Icon icon="ph:star-four-fill" />
                    </div>
                    <div className="star-2">
                        <Icon icon="ph:star-four-fill" />
                    </div>

                    {/* Typography Overlay: Ransom Note Style */}
                    <div className="ransom-container" data-cursor="secret" data-cursor-text="CHAOS">
                        <div className="ransom-wrapper">
                            <span className="ransom-letter" style={{ backgroundColor: '#f2efe9' }}>C</span>
                            <span className="ransom-letter" style={{ backgroundColor: '#000', color: 'white' }}>R</span>
                            <span className="ransom-letter" style={{ backgroundColor: 'var(--red-primary)', color: 'white' }}>E</span>
                            <span className="ransom-letter" style={{ backgroundColor: '#f2efe9' }}>A</span>
                            <span className="ransom-letter" style={{ backgroundColor: 'var(--red-dark)', color: 'white' }}>T</span>
                            <span className="ransom-letter" style={{ backgroundColor: '#f2efe9' }}>E</span>
                        </div>
                    </div>



                    {/* Poetic Text Fragments */}
                    <div className="poetic-text">
                        <div className="poetic-box font-serif-italic">
                            "I only show you the best of me."
                        </div>
                    </div>

                    <div className="version-tag">
                        <div className="version-box font-mono">
                            always.v1.0
                        </div>
                    </div>
                </div>

                {/* Intro / Role Text */}
                <div className="intro-section">
                    <p className="intro-text font-serif">
                        <span className="intro-highlight font-sans">Backend Developer</span>, DevOps & Fullstack Engineer based in the digital void.
                    </p>
                    <div className="hero-actions">
                        <a href="#projects" className="btn-projects">
                            <span>Projects</span>
                            <div className="slide-bg"></div>
                        </a>
                        <a href="#about" className="btn-about">
                            <span>About</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Scrolling Marquee Tape */}
            <div className="marquee-tape">
                <div className="marquee-content">
                    <span className="marquee-item">• drunk • beside you • like i need u • 2 soon • right here • less of you • Peaches • Stay • Ghost • Love Yourself • Sorry • Baby •</span>
                    <span className="marquee-item">• drunk • beside you • like i need u • 2 soon • right here • less of you • Peaches • Stay • Ghost • Love Yourself • Sorry • Baby •</span>
                    <span className="marquee-item">• drunk • beside you • like i need u • 2 soon • right here • less of you • Peaches • Stay • Ghost • Love Yourself • Sorry • Baby •</span>
                    <span className="marquee-item">• drunk • beside you • like i need u • 2 soon • right here • less of you • Peaches • Stay • Ghost • Love Yourself • Sorry • Baby •</span>
                </div>
            </div>
        </section>
    );
};

export default Hero;
