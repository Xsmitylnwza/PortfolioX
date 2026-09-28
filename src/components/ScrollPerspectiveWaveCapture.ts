const CAPTURE_MAX_DPR = 2;

// Animated rasters use the same mesh as still images, but refresh their texture
// while visible so GIF/APNG playback stays live inside the wave.
const isAnimatedRasterSource = (source: string | null | undefined) => {
    if (!source) return false;
    const value = String(source).split('?')[0].split('#')[0].toLowerCase();
    return value.endsWith('.gif') || value.endsWith('.apng');
};

const getAnimatedRasterMimeType = (source: string | null | undefined) => {
    const value = String(source || '').split('?')[0].split('#')[0].toLowerCase();
    return value.endsWith('.gif') ? 'image/gif' : 'image/png';
};

const getAnimationFrameDuration = (duration: number | null | undefined) => {
    const milliseconds = Number(duration) / 1000;
    return Number.isFinite(milliseconds) && milliseconds > 0
        ? Math.max(16, milliseconds)
        : 100;
};

const shouldSkipWaveMediaElement = (element: HTMLElement | null) => {
    if (!element || element.hasAttribute('data-wave-media-skip')) return true;
    if (element.getAttribute('data-wave-media') === 'live') return true;
    return false;
};

const getStandaloneWaveMedia = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLImageElement | HTMLVideoElement>([
    'img[data-wave-media]',
    'video[data-wave-media]',
    '[data-wave-follow] > img',
    '[data-wave-follow] > video',
    '[data-wave-follow] > picture > img',
].join(','))).filter((element) => !shouldSkipWaveMediaElement(element));

const getWaveCaptureElements = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>('[data-wave-capture]'))
    .filter((element) => element.getAttribute('data-wave-capture') !== 'skip'
        && !element.hasAttribute('data-wave-capture-skip'));

const copyComputedStyles = (source: HTMLElement, target: HTMLElement) => {
    const computed = window.getComputedStyle(source);
    let cssText = '';
    for (let index = 0; index < computed.length; index += 1) {
        const prop = computed.item(index);
        cssText += `${prop}:${computed.getPropertyValue(prop)};`;
    }
    target.style.cssText = cssText;
};

const prepareCaptureClone = (element: HTMLElement, width: number, height: number) => {
    const clone = element.cloneNode(true) as HTMLElement;
    const sourceNodes = [element, ...element.querySelectorAll('*')];
    const cloneNodes = [clone, ...clone.querySelectorAll('*')];

    sourceNodes.forEach((sourceNode, index) => {
        const cloneNode = cloneNodes[index];
        if (!(sourceNode instanceof Element) || !(cloneNode instanceof Element)) return;
        if (!(sourceNode instanceof HTMLElement) || !(cloneNode instanceof HTMLElement)) return;
        copyComputedStyles(sourceNode, cloneNode);
        cloneNode.removeAttribute('data-wave-follow');
        cloneNode.removeAttribute('data-wave-capture');
        cloneNode.removeAttribute('data-scroll-wave-media-ready');
        cloneNode.removeAttribute('data-scroll-wave-capture-ready');
        cloneNode.style.translate = 'none';
        cloneNode.style.scale = 'none';
        cloneNode.style.transform = 'none';
        cloneNode.style.opacity = '1';
        cloneNode.style.visibility = 'visible';
        cloneNode.style.filter = 'none';
        cloneNode.style.backdropFilter = 'none';
        cloneNode.style.willChange = 'auto';
        cloneNode.style.pointerEvents = 'none';
    });

    if (clone instanceof HTMLElement) {
        clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
        clone.style.boxSizing = 'border-box';
        clone.style.width = `${width}px`;
        clone.style.height = `${height}px`;
        clone.style.maxWidth = `${width}px`;
        clone.style.minHeight = `${height}px`;
        clone.style.margin = '0';
        clone.style.position = 'static';
        clone.style.left = 'auto';
        clone.style.top = 'auto';
        clone.style.right = 'auto';
        clone.style.bottom = 'auto';
        clone.style.overflow = 'hidden';
        clone.style.backgroundColor = 'transparent';
        clone.style.backgroundImage = 'none';
    }

    return clone;
};

const parseCssSize = (value: string, fallback = 0) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const wrapCanvasText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const normalized = String(text || '').replace(/\s+/g, ' ').trim();
    if (!normalized) return [];
    if (maxWidth <= 1) return [normalized];

    const words = normalized.split(' ');
    const lines: string[] = [];
    let current = words[0] || '';

    for (let index = 1; index < words.length; index += 1) {
        const word = words[index];
        const next = `${current} ${word}`;
        if (ctx.measureText(next).width <= maxWidth) {
            current = next;
        } else {
            lines.push(current);
            current = word;
        }
    }
    if (current) lines.push(current);
    return lines;
};

const rasterizeTextFallback = (element: HTMLElement, width: number, height: number, dpr: number) => {
    const style = window.getComputedStyle(element);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.textBaseline = 'top';
    ctx.fillStyle = style.color || '#f5f0e6';
    ctx.font = style.font || `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    if ('letterSpacing' in ctx) {
        ctx.letterSpacing = style.letterSpacing || '0px';
    }

    let text = element.textContent || '';
    const transform = style.textTransform;
    if (transform === 'uppercase') text = text.toUpperCase();
    else if (transform === 'lowercase') text = text.toLowerCase();
    else if (transform === 'capitalize') {
        text = text.replace(/\b\w/g, (char) => char.toUpperCase());
    }

    const paddingLeft = parseCssSize(style.paddingLeft);
    const paddingRight = parseCssSize(style.paddingRight);
    const paddingTop = parseCssSize(style.paddingTop);
    const contentWidth = Math.max(1, width - paddingLeft - paddingRight);
    const fontSize = parseCssSize(style.fontSize, 16);
    const lineHeightValue = style.lineHeight;
    const lineHeight = lineHeightValue === 'normal'
        ? fontSize * 1.35
        : parseCssSize(lineHeightValue, fontSize * 1.35);
    const lines = wrapCanvasText(ctx, text, contentWidth);
    let y = paddingTop;
    lines.forEach((line) => {
        ctx.fillText(line, paddingLeft, y);
        y += lineHeight;
    });

    return canvas;
};

const isSimpleTextCapture = (element: HTMLElement | null) => {
    if (!element) return false;
    // Prefer untaintable canvas text for leaf-like text boxes.
    if (element.children.length > 0) return false;
    const text = (element.textContent || '').trim();
    return text.length > 0;
};

const rasterizeDomElement = async (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const width = Math.max(1, Math.ceil(rect.width));
    const height = Math.max(1, Math.ceil(rect.height));
    if (width < 2 || height < 2) return null;

    const dpr = Math.min(window.devicePixelRatio || 1, CAPTURE_MAX_DPR);
    try {
        await document.fonts?.ready;
    } catch {
        // Font readiness is best-effort; continue with currently available faces.
    }

    // Text boxes: canvas 2d never taints WebGL; use it first for method-2 demos.
    if (isSimpleTextCapture(element)) {
        const fallback = rasterizeTextFallback(element, width, height, dpr);
        if (fallback) return { canvas: fallback, width, height, dpr };
    }

    try {
        const clone = prepareCaptureClone(element, width, height);
        const serialized = new XMLSerializer().serializeToString(clone);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`
            + `<foreignObject width="100%" height="100%">${serialized}</foreignObject>`
            + '</svg>';
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const canvas = await new Promise<HTMLCanvasElement | null>((resolve) => {
            const image = new Image();
            image.decoding = 'async';
            image.onload = () => {
                try {
                    const nextCanvas = document.createElement('canvas');
                    nextCanvas.width = Math.max(1, Math.round(width * dpr));
                    nextCanvas.height = Math.max(1, Math.round(height * dpr));
                    const ctx = nextCanvas.getContext('2d');
                    if (!ctx) {
                        resolve(null);
                        return;
                    }
                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(image, 0, 0, width, height);
                    // foreignObject captures can taint the canvas (fonts/styles).
                    // Probe before handing the canvas to WebGL.
                    try {
                        ctx.getImageData(0, 0, 1, 1);
                        resolve(nextCanvas);
                    } catch {
                        resolve(null);
                    }
                } catch {
                    resolve(null);
                } finally {
                    URL.revokeObjectURL(url);
                }
            };
            image.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(null);
            };
            image.src = url;
        });

        if (canvas) return { canvas, width, height, dpr };
    } catch {
        // Fall through to canvas text rasterization.
    }

    const fallback = rasterizeTextFallback(element, width, height, dpr);
    if (!fallback) return null;
    return { canvas: fallback, width, height, dpr };
};

export { isAnimatedRasterSource, getAnimatedRasterMimeType, getAnimationFrameDuration,
    getStandaloneWaveMedia, getWaveCaptureElements, rasterizeDomElement };
