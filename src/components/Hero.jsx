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

    return (
        <section className="hero-container" ref={heroRef}>
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
                        <div className="poetic-box">
                            "I only show you the best of me."
                        </div>
                    </div>

                    <div className="version-tag">
                        <div className="version-box">
                            always.v1.0
                        </div>
                    </div>
                </div>

                {/* Intro / Role Text */}
                <div className="intro-section">
                    <p className="intro-text">
                        <span className="intro-highlight">Frontend Developer</span> & UI Designer based in the digital void.
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
                    <span className="marquee-item">• React • TypeScript • Next.js • Tailwind • Node.js • Design •</span>
                    <span className="marquee-item">• React • TypeScript • Next.js • Tailwind • Node.js • Design •</span>
                    <span className="marquee-item">• React • TypeScript • Next.js • Tailwind • Node.js • Design •</span>
                    <span className="marquee-item">• React • TypeScript • Next.js • Tailwind • Node.js • Design •</span>
                </div>
            </div>
        </section>
    );
};

export default Hero;
