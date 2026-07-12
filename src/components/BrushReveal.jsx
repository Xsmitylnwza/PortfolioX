import { useEffect, useRef } from 'react';

const sources = [
    '/assets/previews/keshi-pomodoro-demo.jpg',
    '/assets/previews/zucchini-homepage.jpg',
    '/assets/previews/decrypt-gameplay.jpg',
];

const drawCover = (ctx, image, x, y, width, height) => {
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const sw = width / scale;
    const sh = height / scale;
    const sx = (image.naturalWidth - sw) / 2;
    const sy = (image.naturalHeight - sh) / 2;
    ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
};

const BrushReveal = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const stage = canvas?.parentElement;
        if (!canvas || !stage) return undefined;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const mask = document.createElement('canvas');
        const source = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maskCtx = mask.getContext('2d');
        const sourceCtx = source.getContext('2d');
        let images = [];
        let previous = null;
        let pending = null;
        let raf = 0;

        const render = () => {
            raf = 0;
            if (!pending || !images.length) return;
            const point = pending;
            pending = null;
            const width = Math.max(80, Math.min(canvas.width * 0.13, 190));
            maskCtx.strokeStyle = '#fff';
            maskCtx.fillStyle = '#fff';
            maskCtx.lineCap = 'round';
            maskCtx.lineJoin = 'round';
            maskCtx.lineWidth = width * (0.72 + point.speed * 0.28);
            maskCtx.beginPath();
            if (previous) maskCtx.moveTo(previous.x, previous.y);
            else maskCtx.moveTo(point.x - 1, point.y);
            maskCtx.lineTo(point.x, point.y);
            maskCtx.stroke();

            for (let i = 0; i < 3; i += 1) {
                const angle = (i - 1) * 0.72;
                const radius = width * (0.34 + i * 0.09);
                maskCtx.beginPath();
                maskCtx.arc(point.x + Math.cos(angle) * width * 0.38, point.y + Math.sin(angle) * width * 0.25, radius, 0, Math.PI * 2);
                maskCtx.fill();
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(source, 0, 0);
            ctx.globalCompositeOperation = 'destination-in';
            ctx.drawImage(mask, 0, 0);
            ctx.globalCompositeOperation = 'source-over';
            previous = point;
        };

        const composeSource = () => {
            sourceCtx.fillStyle = '#a72e29';
            sourceCtx.fillRect(0, 0, source.width, source.height);
            const gap = Math.max(12, source.width * 0.012);
            drawCover(sourceCtx, images[0], gap, source.height * 0.08, source.width * 0.48, source.height * 0.82);
            drawCover(sourceCtx, images[1], source.width * 0.5, -gap, source.width * 0.33, source.height * 0.63);
            drawCover(sourceCtx, images[2], source.width * 0.69, source.height * 0.52, source.width * 0.3, source.height * 0.42);
            sourceCtx.globalCompositeOperation = 'source-atop';
            sourceCtx.fillStyle = 'rgba(120, 18, 20, 0.2)';
            sourceCtx.fillRect(0, 0, source.width, source.height);
            sourceCtx.globalCompositeOperation = 'source-over';
        };

        const resize = () => {
            const rect = stage.getBoundingClientRect();
            const ratio = Math.min(window.devicePixelRatio || 1, 1.35);
            canvas.width = mask.width = source.width = Math.round(rect.width * ratio);
            canvas.height = mask.height = source.height = Math.round(rect.height * ratio);
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            previous = null;
            if (images.length) composeSource();
            if (reducedMotion && images.length) {
                maskCtx.fillStyle = '#fff';
                maskCtx.fillRect(0, 0, mask.width, mask.height);
                pending = { x: 0, y: 0, speed: 0 };
                render();
            }
        };

        const onPointerMove = (event) => {
            if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
            const rect = stage.getBoundingClientRect();
            const ratio = canvas.width / rect.width;
            const x = (event.clientX - rect.left) * ratio;
            const y = (event.clientY - rect.top) * ratio;
            const distance = previous ? Math.hypot(x - previous.x, y - previous.y) : 0;
            pending = { x, y, speed: Math.min(distance / 110, 1) };
            if (!raf) raf = requestAnimationFrame(render);
        };

        Promise.all(sources.map((src) => new Promise((resolve) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => resolve(null);
            image.src = src;
        }))).then((loaded) => {
            images = loaded.filter(Boolean);
            if (images.length === sources.length) {
                resize();
                stage.addEventListener('pointermove', onPointerMove, { passive: true });
            }
        });

        resize();
        window.addEventListener('resize', resize, { passive: true });
        return () => {
            window.removeEventListener('resize', resize);
            stage.removeEventListener('pointermove', onPointerMove);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    return <canvas ref={canvasRef} className="hero-brush-canvas" aria-hidden="true" />;
};

export default BrushReveal;
