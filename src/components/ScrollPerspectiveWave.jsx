import { createElement, forwardRef, useCallback, useEffect, useRef } from 'react';
import './ScrollPerspectiveWave.css';

const FOV = 50;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Animated rasters must stay in the DOM. WebGL textures freeze the first frame
// (and CSS then hides the live <img>), which kills GIF/APNG playback.
const isAnimatedRasterSource = (source) => {
    if (!source) return false;
    const value = String(source).split('?')[0].split('#')[0].toLowerCase();
    return value.endsWith('.gif') || value.endsWith('.apng');
};

const shouldSkipWaveMediaElement = (element) => {
    if (!element || element.hasAttribute('data-wave-media-skip')) return true;
    if (element.getAttribute('data-wave-media') === 'live') return true;
    if (element instanceof HTMLImageElement) {
        const source = element.currentSrc || element.getAttribute('src') || '';
        return isAnimatedRasterSource(source);
    }
    return false;
};

const surfaceVertex = /* glsl */ `
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uScrollVelocity;
uniform float uIntensity;
varying vec2 vUv;
varying float vWave;
varying float vSlope;

void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    float waveBase = sin(worldPosition.y * 0.0055 + uTime * 0.8) * uScrollVelocity;
    vec3 newPosition = position;
    newPosition.z += waveBase * 15.0 * 0.5 * uIntensity;

    vUv = uv;
    vWave = waveBase * uIntensity;
    vSlope = cos(worldPosition.y * 0.0055 + uTime * 0.8) * uScrollVelocity * uIntensity;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}`;

const surfaceFragment = /* glsl */ `
precision highp float;
uniform vec3 uSurfaceColor;
uniform float uSurfaceOpacity;
varying vec2 vUv;
varying float vWave;
varying float vSlope;

float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
    float grain = (hash(floor(vUv * 900.0)) - 0.5) * 0.012;
    float light = 1.0 + vSlope * 0.025 + vWave * 0.004;
    vec3 color = clamp(uSurfaceColor * light + grain, vec3(0.0), vec3(1.0));
    gl_FragColor = vec4(color, uSurfaceOpacity);
}`;

const mediaFragment = /* glsl */ `
precision highp float;
uniform sampler2D tMap;
uniform float uImageAspect;
uniform float uPlaneAspect;
uniform float uFitMode;
uniform float uRadius;
uniform vec2 uPlaneSize;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    float fitAlpha = 1.0;

    if (uFitMode < 0.5) {
        if (uImageAspect > uPlaneAspect) {
            uv.x = (uv.x - 0.5) * uPlaneAspect / uImageAspect + 0.5;
        } else {
            uv.y = (uv.y - 0.5) * uImageAspect / uPlaneAspect + 0.5;
        }
    } else if (uFitMode < 1.5) {
        if (uImageAspect > uPlaneAspect) {
            float visibleHeight = uPlaneAspect / uImageAspect;
            uv.y = (uv.y - 0.5) / visibleHeight + 0.5;
            fitAlpha = step(0.0, uv.y) * step(uv.y, 1.0);
        } else {
            float visibleWidth = uImageAspect / uPlaneAspect;
            uv.x = (uv.x - 0.5) / visibleWidth + 0.5;
            fitAlpha = step(0.0, uv.x) * step(uv.x, 1.0);
        }
    }

    vec4 media = texture2D(tMap, clamp(uv, 0.0, 1.0));
    float radius = min(uRadius, min(uPlaneSize.x, uPlaneSize.y) * 0.5);
    vec2 halfSize = uPlaneSize * 0.5;
    vec2 point = abs((vUv - 0.5) * uPlaneSize);
    vec2 corner = point - (halfSize - vec2(radius));
    float distanceToEdge = length(max(corner, 0.0))
        + min(max(corner.x, corner.y), 0.0)
        - radius;
    float roundedAlpha = 1.0 - smoothstep(-0.75, 0.75, distanceToEdge);

    gl_FragColor = vec4(media.rgb, media.a * fitAlpha * roundedAlpha);
}`;

const getStandaloneWaveMedia = (root) => Array.from(root.querySelectorAll([
    'img[data-wave-media]',
    'video[data-wave-media]',
    '[data-wave-follow] > img',
    '[data-wave-follow] > video',
    '[data-wave-follow] > picture > img',
].join(','))).filter((element) => !shouldSkipWaveMediaElement(element));

/**
 * Reusable scroll-perspective module.
 *
 * Interface:
 * - mark layout anchors with `data-wave-surface`;
 * - mark visible DOM groups with `data-wave-follow`;
 * - place the wrapper below a `[data-wave-host]` ancestor when its canvas must
 *   escape a contained/painted route layer;
 * - use `surfaceOpacity={0}` for follower/stage motion without a visible paper plane;
 * - tune `intensity` per page when the default wave needs to be calmer or stronger;
 * - enable `syncStage` only when a persistent GalleryScene should share the wave.
 */
const ScrollPerspectiveWave = forwardRef(({
    as: Root = 'div',
    children,
    className = '',
    surfaceColor = '#e8e0d1',
    surfaceOpacity = 1,
    intensity = 1.4,
    syncStage = false,
    ...rootProps
}, forwardedRef) => {
    const rootRef = useRef(null);
    const setRootRef = useCallback((node) => {
        rootRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
    }, [forwardedRef]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return undefined;

        const host = root.closest('[data-wave-host]') || document.body;
        const phaseHost = root.closest('[data-route-phase]');
        const desktopQuery = window.matchMedia('(min-width: 1025px)');
        const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (!desktopQuery.matches || !finePointerQuery.matches || reducedMotionQuery.matches) return undefined;

        let disposed = false;
        let cleanup = () => {};

        const init = async () => {
            const { Camera, Color, Mesh, Plane, Program, Renderer, Texture, Transform } = await import('ogl');
            if (disposed || !rootRef.current) return;

            const surfaceElements = Array.from(root.querySelectorAll('[data-wave-surface]'));
            const followers = Array.from(root.querySelectorAll('[data-wave-follow]'));
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
            const transparentTexture = mediaElements.length
                ? new Texture(gl, {
                    image: new Uint8Array([0, 0, 0, 0]),
                    width: 1,
                    height: 1,
                    generateMipmaps: false,
                    flipY: false,
                })
                : null;
            const mediaResources = mediaElements.map((element) => {
                const mediaProgram = new Program(gl, {
                    vertex: surfaceVertex,
                    fragment: mediaFragment,
                    transparent: true,
                    cullFace: false,
                    depthTest: false,
                    depthWrite: false,
                    uniforms: {
                        tMap: { value: transparentTexture },
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
                const mesh = new Mesh(gl, {
                    geometry,
                    program: mediaProgram,
                    frustumCulled: false,
                });
                mesh.visible = false;
                mesh.setParent(scene);
                const mediaHost = element.closest('[data-wave-follow]') || element;

                return {
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
                };
            });

            const setMediaHostTransparent = (resource, transparent) => {
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

            const listenToMedia = (resource, target, type, callback) => {
                target.addEventListener(type, callback);
                resource.listeners.push(() => target.removeEventListener(type, callback));
            };

            const setMediaTexture = (resource, source, width, height, dynamic = false) => {
                if (disposed || !width || !height) return;
                if (resource.texture?.image === source) return;

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
                resource.ready = true;
                resource.element.setAttribute('data-scroll-wave-media-ready', '');
                if (root.classList.contains('is-scroll-wave-active')) {
                    setMediaHostTransparent(resource, true);
                }
            };

            const loadMediaImage = (resource, source) => {
                if (!source) return;

                const image = new Image();
                resource.loader = image;
                image.decoding = 'async';
                image.crossOrigin = 'anonymous';
                image.onload = () => {
                    if (!resource.dynamic) {
                        setMediaTexture(resource, image, image.naturalWidth, image.naturalHeight);
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
                    let sourceUrl = null;
                    try {
                        sourceUrl = new URL(source, window.location.href);
                    } catch {
                        // The proxy loader below can still resolve browser-supported URLs.
                    }

                    if (sourceUrl?.origin === window.location.origin || element.crossOrigin) {
                        setMediaTexture(resource, element, element.naturalWidth, element.naturalHeight);
                    } else {
                        loadMediaImage(resource, source);
                    }
                };

                listenToMedia(resource, element, 'load', activateImage);
                activateImage();
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
            let lenis = null;
            const waveBus = { active: false, velocity: 0 };
            if (syncStage) window.__scrollPerspectiveWave = waveBus;

            const isEligible = () => desktopQuery.matches
                && finePointerQuery.matches
                && !reducedMotionQuery.matches;
            const isRouteVisible = () => {
                const routePhase = phaseHost?.getAttribute('data-route-phase');
                if (routePhase === 'preparing' || routePhase === 'hidden') return false;
                return !root.closest('[hidden], [aria-hidden="true"]');
            };
            const canRender = () => !disposed && !document.hidden && isEligible() && isRouteVisible();

            const restoreFollowerStyles = () => {
                followers.forEach((element) => {
                    element.style.removeProperty('--scroll-wave-x');
                    element.style.removeProperty('--scroll-wave-y');
                    element.style.removeProperty('--scroll-wave-scale');
                });
            };

            const setSurfaceVisible = (visible) => {
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
                    mediaResources.forEach((resource) => {
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
            };

            const onLenisScroll = (event) => {
                const source = Number.isFinite(event?.velocity) ? event.velocity : lenis?.velocity;
                if (!Number.isFinite(source)) return;
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

            const syncMediaSurfaces = () => {
                mediaResources.forEach((resource) => {
                    const {
                        element,
                        host: mediaHost,
                        mesh,
                        program: mediaProgram,
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
                    mediaProgram.uniforms.uPlaneAspect.value = rect.width / rect.height;
                    mediaProgram.uniforms.uFitMode.value = objectFit === 'contain'
                        ? 1
                        : objectFit === 'fill'
                            ? 2
                            : 0;
                    mediaProgram.uniforms.uRadius.value = radius;
                    mediaProgram.uniforms.uPlaneSize.value = [rect.width, rect.height];

                    if (resource.dynamic && resource.texture) {
                        resource.texture.needsUpdate = true;
                    }
                });
            };

            const syncFollowers = (time) => {
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

            const render = (time) => {
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
                mediaResources.forEach(({ program: mediaProgram }) => {
                    mediaProgram.uniforms.uTime.value = time * 0.001;
                    mediaProgram.uniforms.uScrollVelocity.value = scrollVelocity;
                });
                syncSurfaces();
                syncFollowers(time);
                syncMediaSurfaces();
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

            const onContextLost = (event) => {
                event.preventDefault();
                hasRendered = false;
                setSurfaceVisible(false);
            };
            const phaseObserver = phaseHost ? new MutationObserver(syncRouteState) : null;
            const resizeObserver = new ResizeObserver(resize);

            phaseObserver?.observe(phaseHost, {
                attributes: true,
                attributeFilter: ['class', 'data-route-phase', 'aria-hidden'],
            });
            resizeObserver.observe(document.documentElement);
            window.addEventListener('scroll', onNativeScroll, { passive: true });
            window.addEventListener('resize', resize);
            document.addEventListener('visibilitychange', syncLoop);
            gl.canvas.addEventListener('webglcontextlost', onContextLost);
            desktopQuery.addEventListener?.('change', syncLoop);
            finePointerQuery.addEventListener?.('change', syncLoop);
            reducedMotionQuery.addEventListener?.('change', syncLoop);

            resize();
            connectLenis();
            syncLoop();

            cleanup = () => {
                if (rafId) window.cancelAnimationFrame(rafId);
                lenis?.off?.('scroll', onLenisScroll);
                phaseObserver?.disconnect();
                resizeObserver.disconnect();
                window.removeEventListener('scroll', onNativeScroll);
                window.removeEventListener('resize', resize);
                document.removeEventListener('visibilitychange', syncLoop);
                gl.canvas.removeEventListener('webglcontextlost', onContextLost);
                desktopQuery.removeEventListener?.('change', syncLoop);
                finePointerQuery.removeEventListener?.('change', syncLoop);
                reducedMotionQuery.removeEventListener?.('change', syncLoop);
                setSurfaceVisible(false);
                root.classList.remove('is-scroll-wave-active');
                if (window.__scrollPerspectiveWave === waveBus) delete window.__scrollPerspectiveWave;
                mediaResources.forEach((resource) => {
                    resource.listeners.forEach((removeListener) => removeListener());
                    if (resource.loader) {
                        resource.loader.onload = null;
                        resource.loader.onerror = null;
                    }
                    resource.element.removeAttribute('data-scroll-wave-media-ready');
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
    }, [intensity, surfaceColor, surfaceOpacity, syncStage]);

    return createElement(Root, {
        ...rootProps,
        ref: setRootRef,
        className: `scroll-perspective-wave ${className}`.trim(),
        'data-scroll-perspective-wave': '',
    }, children);
});

ScrollPerspectiveWave.displayName = 'ScrollPerspectiveWave';

export default ScrollPerspectiveWave;
