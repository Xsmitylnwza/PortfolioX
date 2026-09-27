import { getAnimatedRasterMimeType, getAnimationFrameDuration } from './ScrollPerspectiveWaveCapture';

interface AnimatedRasterState {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D | null;
    controller: AbortController;
    decoder: ImageDecoder | null;
    disposed: boolean;
    ready: boolean;
    decoding: boolean;
    frameDirty: boolean;
    frameIndex: number;
    frameCount: number;
    frameDuration: number;
    nextFrameAt: number;
}
export interface AnimatedRasterResource {
    ready: boolean;
    dynamic: boolean;
    mesh: { visible: boolean };
    element: HTMLElement;
    animation?: AnimatedRasterState | null;
    animationInitialising: boolean;
}
interface AnimatedRasterCallbacks<T extends AnimatedRasterResource> {
    setMediaTexture: (resource: T, source: HTMLCanvasElement, width: number, height: number, dynamic: boolean) => void;
    setMediaHostTransparent: (resource: T, transparent: boolean) => void;
    isDisposed: () => boolean;
}

export function createAnimatedRasterAdapter<T extends AnimatedRasterResource>({ setMediaTexture, setMediaHostTransparent, isDisposed }: AnimatedRasterCallbacks<T>) {
    const drawAnimationFrame = (animation: AnimatedRasterState, frame: VideoFrame) => {
        const context = animation.context;
        if (!context) return;
        context.clearRect(0, 0, animation.canvas.width, animation.canvas.height);
        context.drawImage(
            frame,
            0,
            0,
            animation.canvas.width,
            animation.canvas.height,
        );
    };

    const restoreLiveAnimatedRasterFallback = (resource: T) => {
        resource.ready = false;
        resource.dynamic = false;
        resource.mesh.visible = false;
        resource.element.removeAttribute('data-scroll-wave-media-ready');
        resource.element.removeAttribute('data-scroll-wave-animation-decoder');
        resource.element.setAttribute('data-scroll-wave-animation-fallback', 'dom');
        setMediaHostTransparent(resource, false);
    };

    const initialiseAnimatedRaster = async (resource: T, source: string) => {
        if (resource.animation || resource.animationInitialising) return;
        resource.animationInitialising = true;
        if (typeof window.ImageDecoder !== 'function') {
            resource.animationInitialising = false;
            restoreLiveAnimatedRasterFallback(resource);
            return;
        }

        const type = getAnimatedRasterMimeType(source);
        let supported = false;
        try {
            supported = await window.ImageDecoder.isTypeSupported(type);
        } catch {
            resource.animationInitialising = false;
            if (!isDisposed()) restoreLiveAnimatedRasterFallback(resource);
            return;
        }
        if (isDisposed()) {
            resource.animationInitialising = false;
            return;
        }
        if (!supported) {
            resource.animationInitialising = false;
            restoreLiveAnimatedRasterFallback(resource);
            return;
        }

        const animation: AnimatedRasterState = {
            canvas: document.createElement('canvas'),
            context: null,
            controller: new AbortController(),
            decoder: null,
            disposed: false,
            ready: false,
            decoding: false,
            frameDirty: false,
            frameIndex: 0,
            frameCount: 0,
            frameDuration: 100,
            nextFrameAt: 0,
        };
        resource.animation = animation;
        resource.animationInitialising = false;

        try {
            const response = await fetch(source, {
                credentials: 'same-origin',
                signal: animation.controller.signal,
            });
            if (!response.ok) throw new Error(`Animated raster request failed: ${response.status}`);

            const data = new Uint8Array(await response.arrayBuffer());
            if (isDisposed() || animation.disposed || resource.animation !== animation) return;

            const decoder = new window.ImageDecoder({
                data,
                type,
                preferAnimation: true,
            });
            animation.decoder = decoder;
            await decoder.tracks.ready;

            const track = decoder.tracks.selectedTrack;
            animation.frameCount = Math.max(1, track?.frameCount || 1);
            const { image: firstFrame } = await decoder.decode({ frameIndex: 0 });
            if (isDisposed() || animation.disposed || resource.animation !== animation) {
                firstFrame.close();
                return;
            }

            animation.canvas.width = firstFrame.displayWidth || firstFrame.codedWidth;
            animation.canvas.height = firstFrame.displayHeight || firstFrame.codedHeight;
            animation.context = animation.canvas.getContext('2d', { alpha: true });
            if (!animation.context || !animation.canvas.width || !animation.canvas.height) {
                firstFrame.close();
                throw new Error('Animated raster canvas unavailable.');
            }

            drawAnimationFrame(animation, firstFrame);
            animation.frameDuration = getAnimationFrameDuration(firstFrame.duration);
            firstFrame.close();
            animation.ready = true;
            resource.element.removeAttribute('data-scroll-wave-animation-fallback');
            resource.element.setAttribute('data-scroll-wave-animation-decoder', 'image-decoder');
            setMediaTexture(
                resource,
                animation.canvas,
                animation.canvas.width,
                animation.canvas.height,
                animation.frameCount > 1,
            );
        } catch {
            if (resource.animation === animation) resource.animation = null;
            animation.disposed = true;
            animation.decoder?.close();
            if (!isDisposed()) restoreLiveAnimatedRasterFallback(resource);
        }
    };

    const advanceAnimatedRaster = (resource: T, time: number) => {
        const animation = resource.animation;
        if (!animation?.ready || !animation.decoder || animation.decoding || animation.frameCount <= 1) return;

        if (!animation.nextFrameAt) {
            animation.nextFrameAt = time + animation.frameDuration;
            return;
        }
        if (time < animation.nextFrameAt) return;

        animation.decoding = true;
        const nextFrameIndex = (animation.frameIndex + 1) % animation.frameCount;
        animation.decoder.decode({ frameIndex: nextFrameIndex })
            .then(({ image: frame }) => {
                if (isDisposed() || animation.disposed || resource.animation !== animation) {
                    frame.close();
                    return;
                }

                drawAnimationFrame(animation, frame);
                animation.frameIndex = nextFrameIndex;
                animation.frameDuration = getAnimationFrameDuration(frame.duration);
                animation.nextFrameAt = performance.now() + animation.frameDuration;
                animation.frameDirty = true;
                frame.close();
            })
            .catch(() => {
                if (!animation.disposed) {
                    animation.nextFrameAt = performance.now() + animation.frameDuration;
                }
            })
            .finally(() => {
                if (!animation.disposed) animation.decoding = false;
            });
    };
    return { initialiseAnimatedRaster, advanceAnimatedRaster };
}
