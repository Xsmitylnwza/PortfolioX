import React, { useEffect, useRef } from 'react';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';

/**
 * Scribbles Background Component
 * Renders diverse hand-drawn style doodles (arrows, crowns, swirls, stars)
 * to create a chaotic "notebook" aesthetic.
 */
const Scribbles = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let scribbles = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initScribbles();
        };

        const initScribbles = () => {
            scribbles = [];
            // Increased density x3 (was 120, now 40)
            const count = Math.max(30, Math.floor(window.innerWidth / 40));

            const shapes = ['scribble', 'crown', 'zigzag', 'arrow', 'spiral', 'star', 'cross', 'heart'];

            for (let i = 0; i < count; i++) {
                scribbles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 60 + 30, // Slightly smaller range to accommodate more items
                    type: shapes[Math.floor(Math.random() * shapes.length)],
                    opacity: Math.random() * 0.15 + 0.05,
                    driftX: (Math.random() - 0.5) * 0.4,
                    driftY: (Math.random() - 0.5) * 0.4,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.005,
                    color: Math.random() > 0.85 ? '#ef4444' : '#ffffff'
                });
            }
        };

        // --- Drawing Helpers ---

        // Helper to add jitter to points
        const j = (val) => val + (Math.random() - 0.5) * 1.5;

        const drawScribbleBall = (x, y, size, color, alpha) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1.2;
            ctx.moveTo(x + j(0), y + j(0));
            // Chaotic spiral
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.random() * (size / 2);
                ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
            }
            ctx.stroke();
        };

        const drawHeart = (x, y, size, color, alpha) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1.5;
            // Rough cubic bezier heart
            // Top notch
            ctx.moveTo(j(x), j(y - size / 4));
            // Left curve
            ctx.bezierCurveTo(
                j(x - size / 2), j(y - size / 2),
                j(x - size), j(y),
                j(x), j(y + size / 2) // Bottom pt
            );
            // Right curve
            ctx.bezierCurveTo(
                j(x + size), j(y),
                j(x + size / 2), j(y - size / 2),
                j(x), j(y - size / 4) // Back to top
            );
            ctx.stroke();
        }

        const drawCrown = (x, y, size, color, alpha) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1.5;
            const w = size * 0.8;
            const h = size * 0.6;
            // Base
            ctx.moveTo(j(x - w / 2), j(y + h / 2));
            ctx.lineTo(j(x + w / 2), j(y + h / 2));
            // Points (Left, Mid-Left, Mid, Mid-Right, Right)
            ctx.lineTo(j(x + w / 2), j(y - h / 2));
            ctx.lineTo(j(x + w / 6), j(y + h / 6));
            ctx.lineTo(j(x), j(y - h / 2 - 10)); // Peak
            ctx.lineTo(j(x - w / 6), j(y + h / 6));
            ctx.lineTo(j(x - w / 2), j(y - h / 2));
            ctx.closePath();
            ctx.stroke();
        };

        const drawZigzag = (x, y, size, color, alpha) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1.5;
            ctx.moveTo(j(x - size / 2), j(y));
            const steps = 6;
            const stepW = size / steps;
            for (let i = 1; i <= steps; i++) {
                const yOff = (i % 2 === 0) ? -size / 4 : size / 4;
                ctx.lineTo(j(x - size / 2 + i * stepW), j(y + yOff));
            }
            ctx.stroke();
        };

        const drawArrow = (x, y, size, color, alpha) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1.5;
            // Shaft
            ctx.moveTo(j(x - size / 2), j(y));
            ctx.lineTo(j(x + size / 2), j(y));
            // Head
            ctx.lineTo(j(x + size / 6), j(y - size / 4));
            ctx.moveTo(j(x + size / 2), j(y));
            ctx.lineTo(j(x + size / 6), j(y + size / 4));
            ctx.stroke();
        };

        const drawSpiral = (x, y, size, color, alpha) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1.2;
            let radius = 0;
            let angle = 0;
            ctx.moveTo(x, y);
            while (radius < size / 2) {
                radius += 0.5;
                angle += 0.3;
                ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
            }
            ctx.stroke();
        };

        const drawStar = (x, y, size, color, alpha) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1.5;
            // Simple 5 lines star scribble
            // Start top
            const r = size / 2;
            ctx.moveTo(j(x), j(y - r));
            ctx.lineTo(j(x + r * 0.6), j(y + r)); // Bot Right
            ctx.lineTo(j(x - r), j(y - r * 0.3)); // Top Left
            ctx.lineTo(j(x + r), j(y - r * 0.3)); // Top Right
            ctx.lineTo(j(x - r * 0.6), j(y + r)); // Bot Left
            ctx.closePath();
            ctx.stroke();
        };

        const drawCross = (x, y, size, color, alpha) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 2;
            ctx.moveTo(j(x - size / 3), j(y - size / 3));
            ctx.lineTo(j(x + size / 3), j(y + size / 3));
            ctx.moveTo(j(x + size / 3), j(y - size / 3));
            ctx.lineTo(j(x - size / 3), j(y + size / 3));
            ctx.stroke();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            scribbles.forEach(s => {
                s.x += s.driftX;
                s.y += s.driftY;
                s.rotation += s.rotationSpeed;

                // Wrap
                if (s.x > canvas.width + 100) s.x = -100;
                if (s.x < -100) s.x = canvas.width + 100;
                if (s.y > canvas.height + 100) s.y = -100;
                if (s.y < -100) s.y = canvas.height + 100;

                ctx.save();
                ctx.translate(s.x, s.y);
                ctx.rotate(s.rotation);

                // Draw based on type
                if (s.type === 'scribble') drawScribbleBall(0, 0, s.size, s.color, s.opacity);
                else if (s.type === 'crown') drawCrown(0, 0, s.size, s.color, s.opacity);
                else if (s.type === 'zigzag') drawZigzag(0, 0, s.size, s.color, s.opacity);
                else if (s.type === 'arrow') drawArrow(0, 0, s.size, s.color, s.opacity);
                else if (s.type === 'spiral') drawSpiral(0, 0, s.size, s.color, s.opacity);
                else if (s.type === 'star') drawStar(0, 0, s.size, s.color, s.opacity);
                else if (s.type === 'cross') drawCross(0, 0, s.size, s.color, s.opacity);
                else if (s.type === 'heart') drawHeart(0, 0, s.size, s.color, s.opacity); // NEW

                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0, // Behind everything
            }}
            className="scribbles-bg"
        />
    );
};

export default Scribbles;
