// Normalize every poster through canvas so Image / ImageBitmap / SVG
    // all share the same upright orientation in WebGL (no mixed flipY paths).
    const rasterizePosterTexture = (sourceImage, maxTextureWidth = 1024) => {
        const srcWidth = Math.max(1, sourceImage.naturalWidth || sourceImage.width || 1);
        const srcHeight = Math.max(1, sourceImage.naturalHeight || sourceImage.height || 1);
        const scale = srcWidth > maxTextureWidth ? maxTextureWidth / srcWidth : 1;
        const width = Math.max(1, Math.round(srcWidth * scale));
        const height = Math.max(1, Math.round(srcHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return null;
        ctx.clearRect(0, 0, width, height);
        // Canvas top-left origin + texture flipY keeps posters upright.
        ctx.drawImage(sourceImage, 0, 0, width, height);
        return { canvas, aspect: width / Math.max(height, 1) };
    };

export { rasterizePosterTexture };
