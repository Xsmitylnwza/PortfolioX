import { useRef, useEffect } from 'react';

const Squares = ({
    direction = 'right',
    speed = 1,
    borderColor = '#999',
    squareSize = 40,
    hoverFillColor = '#222'
}) => {
    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const numSquaresX = useRef(0);
    const numSquaresY = useRef(0);
    const gridOffset = useRef({ x: 0, y: 0 });
    const hoveredSquareRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            numSquaresX.current = Math.ceil(canvas.width / squareSize) + 1;
            numSquaresY.current = Math.ceil(canvas.height / squareSize) + 1;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const drawGrid = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
            const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

            ctx.lineWidth = 0.5;
            ctx.strokeStyle = borderColor;
            ctx.fillStyle = hoverFillColor;

            // 1. Draw Hovered Square (if any)
            if (hoveredSquareRef.current) {
                // Calculate absolute position for hovered square
                const hoveredX = (hoveredSquareRef.current.x * squareSize) + (gridOffset.current.x % squareSize);
                const hoveredY = (hoveredSquareRef.current.y * squareSize) + (gridOffset.current.y % squareSize);
                // We need to match the looping startX lookup logic or just strictly project coordinates?
                // The original logic was relative to the startX, let's keep it robust.
                // Actually, simply iterating the grid like before is O(N^2).
                // Let's deduce the screen position directly from indices.
                // gridX * squareSize + offset... wait, the offset logic in original was complex.
                // Simplification: We only need to draw ONE rect.
                // But let's stick to the loop for safety if we can't easily inverse the math?
                // No, we MUST optimize the loop. The Loop IS the performance killer.

                // Let's use the optimized batch drawing for the grid first.
            }

            // OPTIMIZED: Draw Grid Lines (O(Width + Height)) instead of O(Width * Height)
            ctx.beginPath();

            // Vertical Lines
            for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
                // Determine visual X position
                const drawX = x - (gridOffset.current.x % squareSize);
                ctx.moveTo(drawX, 0);
                ctx.lineTo(drawX, canvas.height);
            }

            // Horizontal Lines
            for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
                const drawY = y - (gridOffset.current.y % squareSize);
                ctx.moveTo(0, drawY);
                ctx.lineTo(canvas.width, drawY);
            }

            ctx.stroke();

            // Draw Hovered Square (Overlay) - Now checking only the hovered instance
            if (hoveredSquareRef.current) {
                // Reconstruct visual position from the grid index stored in handleMouseMove
                // The handleMouseMove logic did: hoveredIndex = floor((mouseX + offset%size) / size)
                // So visualPos = hoveredIndex * size - offset%size
                const offsetX = gridOffset.current.x % squareSize;
                const offsetY = gridOffset.current.y % squareSize;

                const squareX = hoveredSquareRef.current.x * squareSize - offsetX;
                const squareY = hoveredSquareRef.current.y * squareSize - offsetY;

                ctx.fillStyle = hoverFillColor;
                ctx.fillRect(squareX, squareY, squareSize, squareSize);
            }

            // Gradient Overlay
            // Optimization: Create gradient once? 
            // Actually, just drawing it is fast enough as long as we aren't drawing 1000 rects under it.
            const gradient = ctx.createRadialGradient(
                canvas.width / 2,
                canvas.height / 2,
                0,
                canvas.width / 2,
                canvas.height / 2,
                Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2)) / 2
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        const updateAnimation = () => {
            const effectiveSpeed = Math.max(speed, 0.1);
            switch (direction) {
                case 'right':
                    gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
                    break;
                case 'left':
                    gridOffset.current.x = (gridOffset.current.x + effectiveSpeed + squareSize) % squareSize;
                    break;
                case 'up':
                    gridOffset.current.y = (gridOffset.current.y + effectiveSpeed + squareSize) % squareSize;
                    break;
                case 'down':
                    gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
                    break;
                case 'diagonal':
                    gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
                    gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
                    break;
                default:
                    break;
            }
            drawGrid();
            requestRef.current = requestAnimationFrame(updateAnimation);
        };

        const handleMouseMove = (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            const hoveredSquareX = Math.floor((mouseX + (gridOffset.current.x % squareSize)) / squareSize);
            const hoveredSquareY = Math.floor((mouseY + (gridOffset.current.y % squareSize)) / squareSize);

            hoveredSquareRef.current = { x: hoveredSquareX, y: hoveredSquareY };
        };

        const handleMouseLeave = () => {
            hoveredSquareRef.current = null;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', (e) => {
            if (!e.relatedTarget && !e.toElement) handleMouseLeave();
        });
        requestRef.current = requestAnimationFrame(updateAnimation);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [direction, speed, borderColor, hoverFillColor, squareSize]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full border-none block"
            style={{ display: 'block', width: '100%', height: '100%' }}
        />
    );
};

export default Squares;
