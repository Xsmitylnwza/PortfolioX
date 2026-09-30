import { createElement, forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import type Lenis from 'lenis';
import type { ScrollWaveProps, WaveResource, MediaResource, CaptureResource } from './ScrollPerspectiveWaveTypes';
import './ScrollPerspectiveWave.css';
import { isAnimatedRasterSource, getStandaloneWaveMedia, getWaveCaptureElements, rasterizeDomElement } from './ScrollPerspectiveWaveCapture';
import { surfaceVertex, surfaceFragment, mediaFragment } from './ScrollPerspectiveWaveShaders';
import { createAnimatedRasterAdapter } from './ScrollPerspectiveWaveAnimatedRaster';

const FOV = 50;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const CAPTURE_RECAPTURE_MS = 180;

const ScrollPerspectiveWave = forwardRef<HTMLElement, ScrollWaveProps>(({
    as: Root = 'div',
    children,
    className = '',
    surfaceColor = '#e8e0d1',
    surfaceOpacity = 1,
    intensity = 1.4,
    syncStage = false,
    ...rootProps
}, forwardedRef) => {
    const rootRef = useRef<HTMLElement | null>(null);
    const [rendererGeneration, setRendererGeneration] = useState(0);
    const setRootRef = useCallback((node: HTMLElement | null) => {
        rootRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
    }, [forwardedRef]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return undefined;

        const host = root.closest('[data-wave-host]') || document.body;
        const phaseHost = root.closest('[data-route-phase]');
        const supportedViewportQuery = window.matchMedia('(min-width: 700px)');
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (!supportedViewportQuery.matches || reducedMotionQuery.matches) return undefined;

        let disposed = false;
        let contextLost = false;
        let cleanup = () => {};

        const init = async () => {
            const { Camera, Color, Mesh, Plane, Program, Renderer, Texture, Transform } = await import('ogl');
            if (disposed || !rootRef.current) return;

            const surfaceElements = Array.from(root.querySelectorAll<HTMLElement>('[data-wave-surface]'));
            const captureElements = getWaveCaptureElements(root);
            const captureSet = new Set(captureElements);
            const followers = Array.from(root.querySelectorAll<HTMLElement>('[data-wave-follow]'))
                .filter((element) => !captureSet.has(element) && !element.hasAttribute('data-wave-capture'));
            const mediaElements = getStandaloneWaveMedia(root);
            if (!surfaceElements.length) return;

            const renderer = new Renderer({
                alpha: true,
                antialias: true,
                dpr: Math.min(window.devicePixelRatio || 1, 1.25),
                powerPreference: 'high-performance',
            });
            const gl = renderer.gl;
            gl.clearColor(0, 0, 0, 0);
            gl.canvas.className = 'scroll-perspective-wave__canvas';
            gl.canvas.setAttribute('aria-hidden', 'true');
            host.appendChild(gl.canvas);
            const scene = new Transform();
            const camera = new Camera(gl, { fov: FOV, near: 0.1, far: 6000 });
            const geometry = new Plane(gl, {
                width: 1,
                height: 1,
                widthSegments: 24,
                heightSegments: 48,
            });
            const program = new Program(gl, {
                vertex: surfaceVertex,
                fragment: surfaceFragment,
                transparent: true,
                cullFace: false,
                depthTest: false,
                depthWrite: false,
                uniforms: {
                    uTime: { value: 0 },
                    uScrollVelocity: { value: 0 },
                    uIntensity: { value: Math.max(0, intensity) },
                    uSurfaceColor: { value: new Color(surfaceColor) },
                    uSurfaceOpacity: { value: clamp(surfaceOpacity, 0, 1) },
                },
            });
            const surfaces = surfaceElements.map((element) => {
                const mesh = new Mesh(gl, { geometry, program, frustumCulled: false });
                mesh.setParent(scene);
                return {
                    element,
                    mesh,
                    background: element.style.getPropertyValue('background-color'),
                    backgroundPriority: element.style.getPropertyPriority('background-color'),
                };
            });
            const createTextureProgram = () => new Program(gl, {
                vertex: surfaceVertex,
                fragment: mediaFragment,
                transparent: true,
                cullFace: false,
                depthTest: false,
                depthWrite: false,
                uniforms: {
                    tMap: { value: null },
                    uTime: { value: 0 },
                    uScrollVelocity: { value: 0 },
                    uIntensity: { value: Math.max(0, intensity) },
                    uImageAspect: { value: 1 },
                    uPlaneAspect: { value: 1 },
                    uFitMode: { value: 0 },
                    uRadius: { value: 0 },
                    uPlaneSize: { value: [1, 1] },
                },
            });
            const transparentTexture = (mediaElements.length || captureElements.length)
                ? new Texture(gl, {
                    image: new Uint8Array([0, 0, 0, 0]),
                    width: 1,
                    height: 1,
                    generateMipmaps: false,
                    flipY: false,
                })
                : null;

            const mediaResources: MediaResource[] = mediaElements.map((element) => {
                const mediaProgram = createTextureProgram();
                mediaProgram.uniforms.tMap.value = transparentTexture;
                const mesh = new Mesh(gl, {
                    geometry,
                    program: mediaProgram,
                    frustumCulled: false,
                });
                mesh.visible = false;
                mesh.setParent(scene);
                const mediaHost = element.closest<HTMLElement>('[data-wave-follow]') || element;

                return {
                    kind: 'media',
                    element,
                    host: mediaHost,
                    hostBackground: mediaHost.style.getPropertyValue('background-color'),
                    hostBackgroundPriority: mediaHost.style.getPropertyPriority('background-color'),
                    mesh,
                    program: mediaProgram,
                    texture: null,
                    loader: null,
                    listeners: [],
                    ready: false,
                    dynamic: false,
                    animation: null,
                    animationInitialising: false,
                };
            });

            const captureResources: CaptureResource[] = captureElements.map((element) => {
                const captureProgram = createTextureProgram();
                captureProgram.uniforms.tMap.value = transparentTexture;
                // Captures map 1:1 to their box; fill avoids cover/contain crop.
                captureProgram.uniforms.uFitMode.value = 2;
                const mesh = new Mesh(gl, {
                    geometry,
                    program: captureProgram,
                    frustumCulled: false,
                });
                mesh.visible = false;
                mesh.setParent(scene);

                return {
                    kind: 'capture',
                    element,
                    host: element,
                    hostBackground: element.style.getPropertyValue('background-color'),
                    hostBackgroundPriority: element.style.getPropertyPriority('background-color'),
                    mesh,
                    program: captureProgram,
                    texture: null,
                    loader: null,
                    listeners: [],
                    ready: false,
                    dynamic: false,
                    capturing: false,
                    captureTimer: 0,
                    lastCaptureKey: '',
                    animationInitialising: false,
                };
            });

            const textureResources = [...mediaResources, ...captureResources];

            const setMediaHostTransparent = (resource: WaveResource, transparent: boolean) => {
                if (resource.kind === 'capture') return;
                if (transparent) {
                    resource.host.style.setProperty('background-color', 'transparent', 'important');
                } else if (resource.hostBackground) {
                    resource.host.style.setProperty(
                        'background-color',
                        resource.hostBackground,
                        resource.hostBackgroundPriority,
                    );
                } else {
                    resource.host.style.removeProperty('background-color');
                }
            };

            const listenToMedia = (resource: WaveResource, target: HTMLElement, type: string, callback: EventListener) => {
                target.addEventListener(type, callback);
                resource.listeners.push(() => target.removeEventListener(type, callback));
            };

            const markTextureReady = (resource: WaveResource) => {
                resource.ready = true;
                if (resource.kind === 'capture') {
                    resource.element.setAttribute('data-scroll-wave-capture-ready', '');
                } else {
                    resource.element.setAttribute('data-scroll-wave-media-ready', '');
                }
                if (root.classList.contains('is-scroll-wave-active')) {
                    setMediaHostTransparent(resource, true);
                }
            };

            const setMediaTexture = (resource: WaveResource, source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, width: number, height: number, dynamic = false) => {
                if (disposed || !width || !height) return;
                if (resource.texture?.image === source) return;

                try {
                    const nextTexture = new Texture(gl, {
                        image: source,
                        generateMipmaps: false,
                        flipY: true,
                    });
                    if (resource.texture) gl.deleteTexture(resource.texture.texture);
                    resource.texture = nextTexture;
                    resource.dynamic = dynamic;
                    resource.program.uniforms.tMap.value = nextTexture;
                    resource.program.uniforms.uImageAspect.value = width / height;
                    markTextureReady(resource);
                } catch (error) {
                    // Tainted canvas / bad image must not kill the shared wave loop.
                    console.warn('Scroll wave texture upload failed.', error);
                    if (resource.kind === 'capture') {
                        resource.ready = false;
                        resource.element.removeAttribute('data-scroll-wave-capture-ready');
                    }
                }
            };

            const { initialiseAnimatedRaster, advanceAnimatedRaster } = createAnimatedRasterAdapter({
                setMediaTexture, setMediaHostTransparent, isDisposed: () => disposed,
            });
            const loadMediaImage = (resource: WaveResource, source: string, dynamic = false) => {
                if (!source) return;

                const image = new Image();
                resource.loader = image;
                image.decoding = 'async';
                image.crossOrigin = 'anonymous';
                image.onload = () => {
                    if (!resource.dynamic) {
                        setMediaTexture(resource, image, image.naturalWidth, image.naturalHeight, dynamic);
                    }
                };
                image.onerror = () => {
                    image.onload = null;
                    image.onerror = null;
                };
                image.src = source;
            };

            mediaResources.forEach((resource) => {
                const { element } = resource;
                if (element instanceof HTMLVideoElement) {
                    const activateVideo = () => {
                        if (element.readyState < 2 || !element.videoWidth || !element.videoHeight) return;
                        setMediaTexture(resource, element, element.videoWidth, element.videoHeight, true);
                    };

                    listenToMedia(resource, element, 'loadeddata', activateVideo);
                    listenToMedia(resource, element, 'canplay', activateVideo);
                    listenToMedia(resource, element, 'playing', activateVideo);
                    loadMediaImage(resource, element.poster);
                    activateVideo();
                    return;
                }

                const activateImage = () => {
                    if (!element.complete || !element.naturalWidth || !element.naturalHeight) return;

                    const source = element.currentSrc || element.src;
                    const animated = isAnimatedRasterSource(source);
                    let sourceUrl = null;
                    try {
                        sourceUrl = new URL(source, window.location.href);
                    } catch {
                        // The proxy loader below can still resolve browser-supported URLs.
                    }

                    if (sourceUrl?.origin === window.location.origin || element.crossOrigin) {
                        setMediaTexture(
                            resource,
                            element,
                            element.naturalWidth,
                            element.naturalHeight,
                            animated,
                        );
                    } else {
                        loadMediaImage(resource, source, animated);
                    }

                    if (animated) initialiseAnimatedRaster(resource, source);
                };

                listenToMedia(resource, element, 'load', activateImage);
                activateImage();
            });

            const captureElementTexture = async (resource: CaptureResource, force = false) => {
                if (disposed || resource.capturing) return;
                const rect = resource.element.getBoundingClientRect();
                const width = Math.max(1, Math.ceil(rect.width));
                const height = Math.max(1, Math.ceil(rect.height));
                if (width < 2 || height < 2) return;

                const captureKey = `${width}x${height}:${resource.element.textContent || ''}`;
                if (!force && resource.lastCaptureKey === captureKey && resource.ready) return;

                resource.capturing = true;
                const result = await rasterizeDomElement(resource.element);
                resource.capturing = false;
                if (disposed || !result) return;

                resource.lastCaptureKey = captureKey;
                setMediaTexture(resource, result.canvas, result.width, result.height, false);
            };

            const scheduleCapture = (resource: CaptureResource, force = false) => {
                if (resource.captureTimer) window.clearTimeout(resource.captureTimer);
                resource.captureTimer = window.setTimeout(() => {
                    resource.captureTimer = 0;
                    captureElementTexture(resource, force);
                }, CAPTURE_RECAPTURE_MS);
            };

            captureResources.forEach((resource) => {
                captureElementTexture(resource, true);
            });

            let viewportWidth = 1;
            let viewportHeight = 1;
            let cameraDistance = 1;
            let rafId = 0;
            let hasRendered = false;
            let isVisible = false;
            let scrollVelocity = 0;
            let targetVelocity = 0;
            let lastScrollY = window.scrollY || 0;
            let lenis: Lenis | null = null;
            const waveBus = { active: false, velocity: 0 };
            if (syncStage) window.__scrollPerspectiveWave = waveBus;

            const isEligible = () => supportedViewportQuery.matches
                && !reducedMotionQuery.matches;
            const isRouteVisible = () => {
                const routePhase = phaseHost?.getAttribute('data-route-phase');
                if (routePhase === 'preparing' || routePhase === 'hidden') return false;
                return !root.closest('[hidden], [aria-hidden="true"]');
            };
            const canRender = () => !disposed && !contextLost && !document.hidden && isEligible() && isRouteVisible();

            const restoreFollowerStyles = () => {
                followers.forEach((element) => {
                    element.style.removeProperty('--scroll-wave-x');
                    element.style.removeProperty('--scroll-wave-y');
                    element.style.removeProperty('--scroll-wave-scale');
                });
            };

            const setSurfaceVisible = (visible: boolean) => {
                const show = visible && hasRendered;
                root.classList.toggle('is-scroll-wave-active', show);
                gl.canvas.classList.toggle('is-visible', show);

                const routePhase = phaseHost?.getAttribute('data-route-phase');
                const phaseOpacity = phaseHost
                    ? Number.parseFloat(getComputedStyle(phaseHost).opacity) || 0
                    : 1;
                const rootOpacity = Number.parseFloat(getComputedStyle(root).opacity) || 0;
                // Route-enter opacity is useful while preparing/entering/exiting, but
                // it can report a stale fractional value for a frame after the route
                // is already active. Applying that value to the shared canvas makes
                // opaque media planes reveal the dark DOM frame underneath.
                const canvasOpacity = routePhase === 'active'
                    ? 1
                    : phaseOpacity * rootOpacity;
                gl.canvas.style.opacity = show ? String(clamp(canvasOpacity, 0, 1)) : '0';

                waveBus.active = show;
                if (!show) waveBus.velocity = 0;

                if (show !== isVisible) {
                    surfaces.forEach(({ element, background, backgroundPriority }) => {
                        if (show && surfaceOpacity > 0) {
                            element.style.setProperty('background-color', 'transparent', 'important');
                        } else if (background) {
                            element.style.setProperty('background-color', background, backgroundPriority);
                        } else {
                            element.style.removeProperty('background-color');
                        }
                    });
                    textureResources.forEach((resource) => {
                        setMediaHostTransparent(resource, show && resource.ready);
                    });
                    if (!show) restoreFollowerStyles();
                    isVisible = show;
                }
            };

            const resize = () => {
                viewportWidth = Math.max(1, window.innerWidth);
                viewportHeight = Math.max(1, window.innerHeight);
                renderer.setSize(viewportWidth, viewportHeight);
                camera.perspective({ aspect: viewportWidth / viewportHeight });

                // One world unit equals one CSS pixel at z = 0.
                cameraDistance = viewportHeight / (2 * Math.tan((FOV * Math.PI) / 360));
                camera.position.set(0, 0, cameraDistance);
                camera.lookAt([0, 0, 0]);
                captureResources.forEach((resource) => scheduleCapture(resource));
            };

            const onLenisScroll = (event: { velocity?: number }) => {
                const source = Number.isFinite(event?.velocity) ? event.velocity : lenis?.velocity;
                if (typeof source !== 'number' || !Number.isFinite(source)) return;
                targetVelocity = Math.abs(clamp(source * 0.25, -5, 5));
            };

            const connectLenis = () => {
                const next = window.__lenis || null;
                if (next === lenis) return;
                lenis?.off?.('scroll', onLenisScroll);
                lenis = next;
                lenis?.on?.('scroll', onLenisScroll);
            };

            const onNativeScroll = () => {
                if (lenis) return;
                const scrollY = window.scrollY || 0;
                const delta = scrollY - lastScrollY;
                lastScrollY = scrollY;
                targetVelocity = Math.abs(clamp(delta * 0.25, -5, 5));
            };

            const syncSurfaces = () => {
                surfaces.forEach(({ element, mesh }) => {
                    const rect = element.getBoundingClientRect();
                    mesh.visible = rect.width > 0
                        && rect.height > 0
                        && rect.bottom > -120
                        && rect.top < viewportHeight + 120;
                    if (!mesh.visible) return;

                    mesh.position.set(
                        rect.left + rect.width * 0.5 - viewportWidth * 0.5,
                        viewportHeight * 0.5 - rect.top - rect.height * 0.5,
                        0,
                    );
                    mesh.scale.set(rect.width, rect.height, 1);
                });
            };

            const syncTextureSurfaces = (time: number) => {
                textureResources.forEach((resource) => {
                    const {
                        element,
                        host: mediaHost,
                        mesh,
                        program: mediaProgram,
                        kind,
                    } = resource;
                    const rect = element.getBoundingClientRect();
                    mesh.visible = resource.ready
                        && rect.width > 0
                        && rect.height > 0
                        && rect.bottom > -120
                        && rect.top < viewportHeight + 120;
                    if (!mesh.visible) return;

                    const mediaStyle = getComputedStyle(element);
                    const hostStyle = getComputedStyle(mediaHost);
                    const objectFit = mediaStyle.objectFit;
                    const radius = Number.parseFloat(hostStyle.borderTopLeftRadius) || 0;

                    mesh.position.set(
                        rect.left + rect.width * 0.5 - viewportWidth * 0.5,
                        viewportHeight * 0.5 - rect.top - rect.height * 0.5,
                        0,
                    );
                    mesh.scale.set(rect.width, rect.height, 1);
                    mediaProgram.uniforms.uPlaneAspect.value = rect.width / Math.max(rect.height, 1);
                    mediaProgram.uniforms.uFitMode.value = kind === 'capture'
                        ? 2
                        : objectFit === 'contain'
                            ? 1
                            : objectFit === 'fill'
                                ? 2
                                : 0;
                    mediaProgram.uniforms.uRadius.value = kind === 'capture' ? 0 : radius;
                    mediaProgram.uniforms.uPlaneSize.value = [rect.width, rect.height];

                    if (resource.animation?.ready && resource.texture) {
                        advanceAnimatedRaster(resource, time);
                        if (resource.animation.frameDirty) {
                            resource.texture.needsUpdate = true;
                            resource.animation.frameDirty = false;
                        }
                    } else if (resource.dynamic && resource.texture) {
                        resource.texture.needsUpdate = true;
                    }
                });
            };

            const syncFollowers = (time: number) => {
                followers.forEach((element) => {
                    const rect = element.getBoundingClientRect();
                    if (rect.bottom < -120 || rect.top > viewportHeight + 120) return;

                    const previousX = Number.parseFloat(element.style.getPropertyValue('--scroll-wave-x')) || 0;
                    const previousY = Number.parseFloat(element.style.getPropertyValue('--scroll-wave-y')) || 0;
                    const centerX = rect.left + rect.width * 0.5 - previousX;
                    const centerY = rect.top + rect.height * 0.5 - previousY;
                    const worldY = viewportHeight * 0.5 - centerY;
                    const waveBase = Math.sin(worldY * 0.0055 + time * 0.0008) * scrollVelocity;
                    const waveZ = waveBase * 15 * 0.5 * Math.max(0, intensity);
                    const perspectiveScale = clamp(cameraDistance / (cameraDistance - waveZ), 0.92, 1.08);
                    const x = (centerX - viewportWidth * 0.5) * (perspectiveScale - 1);
                    const y = (centerY - viewportHeight * 0.5) * (perspectiveScale - 1);

                    element.style.setProperty('--scroll-wave-x', `${x.toFixed(2)}px`);
                    element.style.setProperty('--scroll-wave-y', `${y.toFixed(2)}px`);
                    element.style.setProperty('--scroll-wave-scale', perspectiveScale.toFixed(4));
                });
            };

            const render = (time: number) => {
                rafId = 0;
                if (!canRender()) {
                    setSurfaceVisible(false);
                    return;
                }

                connectLenis();
                if (!lenis) {
                    const scrollY = window.scrollY || 0;
                    const delta = scrollY - lastScrollY;
                    lastScrollY = scrollY;
                    if (Math.abs(delta) > 0.01) {
                        targetVelocity = Math.abs(clamp(delta * 0.25, -5, 5));
                    }
                }

                scrollVelocity += (targetVelocity - scrollVelocity) * 0.09;
                targetVelocity *= 0.965;
                waveBus.velocity = scrollVelocity * Math.max(0, intensity);

                program.uniforms.uTime.value = time * 0.001;
                program.uniforms.uScrollVelocity.value = scrollVelocity;
                textureResources.forEach(({ program: mediaProgram }) => {
                    mediaProgram.uniforms.uTime.value = time * 0.001;
                    mediaProgram.uniforms.uScrollVelocity.value = scrollVelocity;
                });
                syncSurfaces();
                syncFollowers(time);
                syncTextureSurfaces(time);
                renderer.render({ scene, camera });

                hasRendered = true;
                setSurfaceVisible(true);
                rafId = window.requestAnimationFrame(render);
            };

            const syncLoop = () => {
                if (canRender()) {
                    if (!rafId) rafId = window.requestAnimationFrame(render);
                } else {
                    if (rafId) window.cancelAnimationFrame(rafId);
                    rafId = 0;
                    setSurfaceVisible(false);
                }
            };

            const syncRouteState = () => {
                // Apply the final route opacity immediately on phase changes instead
                // of waiting for the next animation frame (which can be throttled).
                setSurfaceVisible(canRender());
                syncLoop();
            };

            const onContextLost = (event: Event) => {
                event.preventDefault();
                contextLost = true;
                syncLoop();
                hasRendered = false;
                setSurfaceVisible(false);
            };
            const onContextRestored = () => {
                setRendererGeneration((generation) => generation + 1);
            };
            const phaseObserver = phaseHost ? new MutationObserver(syncRouteState) : null;
            const resizeObserver = new ResizeObserver(resize);
            const captureResizeObserver = new ResizeObserver((entries) => {
                entries.forEach((entry) => {
                    const resource = captureResources.find((item) => item.element === entry.target);
                    if (resource) scheduleCapture(resource);
                });
            });

            if (phaseObserver && phaseHost) phaseObserver.observe(phaseHost, {
                attributes: true,
                attributeFilter: ['class', 'data-route-phase', 'aria-hidden'],
            });
            resizeObserver.observe(document.documentElement);
            captureResources.forEach((resource) => {
                captureResizeObserver.observe(resource.element);
            });
            window.addEventListener('scroll', onNativeScroll, { passive: true });
            window.addEventListener('resize', resize);
            document.addEventListener('visibilitychange', syncLoop);
            gl.canvas.addEventListener('webglcontextlost', onContextLost);
            gl.canvas.addEventListener('webglcontextrestored', onContextRestored);
            supportedViewportQuery.addEventListener?.('change', syncLoop);
            reducedMotionQuery.addEventListener?.('change', syncLoop);

            resize();
            connectLenis();
            syncLoop();

            cleanup = () => {
                if (rafId) window.cancelAnimationFrame(rafId);
                lenis?.off?.('scroll', onLenisScroll);
                phaseObserver?.disconnect();
                resizeObserver.disconnect();
                captureResizeObserver.disconnect();
                window.removeEventListener('scroll', onNativeScroll);
                window.removeEventListener('resize', resize);
                document.removeEventListener('visibilitychange', syncLoop);
                gl.canvas.removeEventListener('webglcontextlost', onContextLost);
                gl.canvas.removeEventListener('webglcontextrestored', onContextRestored);
                supportedViewportQuery.removeEventListener?.('change', syncLoop);
                reducedMotionQuery.removeEventListener?.('change', syncLoop);
                setSurfaceVisible(false);
                root.classList.remove('is-scroll-wave-active');
                if (window.__scrollPerspectiveWave === waveBus) delete window.__scrollPerspectiveWave;
                textureResources.forEach((resource) => {
                    if (resource.captureTimer) window.clearTimeout(resource.captureTimer);
                    resource.listeners.forEach((removeListener) => removeListener());
                    if (resource.loader) {
                        resource.loader.onload = null;
                        resource.loader.onerror = null;
                    }
                    if (resource.animation) {
                        resource.animation.disposed = true;
                        resource.animation.controller.abort();
                        resource.animation.decoder?.close();
                    }
                    resource.element.removeAttribute('data-scroll-wave-media-ready');
                    resource.element.removeAttribute('data-scroll-wave-capture-ready');
                    resource.element.removeAttribute('data-scroll-wave-animation-decoder');
                    resource.element.removeAttribute('data-scroll-wave-animation-fallback');
                    setMediaHostTransparent(resource, false);
                    resource.mesh.setParent(null);
                    if (resource.texture) gl.deleteTexture(resource.texture.texture);
                    resource.program.remove();
                });
                if (transparentTexture) gl.deleteTexture(transparentTexture.texture);
                program.remove();
                geometry.remove();
                gl.canvas.remove();
                gl.getExtension('WEBGL_lose_context')?.loseContext();
            };
        };

        init().catch((error) => {
            root.classList.remove('is-scroll-wave-active');
            console.warn('Scroll perspective wave unavailable.', error);
        });

        return () => {
            disposed = true;
            cleanup();
        };
    }, [intensity, surfaceColor, surfaceOpacity, syncStage, rendererGeneration]);

    return createElement(Root as 'div', {
        ...rootProps,
        ref: setRootRef,
        className: `scroll-perspective-wave ${className}`.trim(),
        'data-scroll-perspective-wave': '',
    }, children);
});

ScrollPerspectiveWave.displayName = 'ScrollPerspectiveWave';

export default ScrollPerspectiveWave;
