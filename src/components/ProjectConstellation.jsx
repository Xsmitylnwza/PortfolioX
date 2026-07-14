import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './ProjectConstellation.css';

const MAX_PROJECTS = 6;
const TWO_PI = Math.PI * 2;

const vertex = /* glsl */ `
    attribute vec3 position;
    attribute vec2 uv;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragment = /* glsl */ `
    precision highp float;

    uniform sampler2D tMap;
    uniform float uActive;
    uniform float uLoaded;
    uniform float uImageAspect;
    uniform float uPlaneAspect;

    varying vec2 vUv;

    void main() {
        vec2 uv = vUv;

        if (uImageAspect > uPlaneAspect) {
            uv.x = (uv.x - 0.5) * uPlaneAspect / uImageAspect + 0.5;
        } else {
            uv.y = (uv.y - 0.5) * uImageAspect / uPlaneAspect + 0.5;
        }

        vec3 image = texture2D(tMap, uv).rgb;
        vec3 paper = vec3(0.91, 0.88, 0.82);
        vec3 placeholder = mix(vec3(0.055, 0.047, 0.043), vec3(0.36, 0.035, 0.045), vUv.y);
        vec3 source = mix(placeholder, image, uLoaded);
        float luminance = dot(source, vec3(0.299, 0.587, 0.114));
        vec3 muted = mix(vec3(luminance), source, 0.28);
        vec3 color = mix(muted * 0.48, source, uActive);

        float edge = smoothstep(0.018, 0.035, vUv.x)
            * smoothstep(0.018, 0.035, vUv.y)
            * smoothstep(0.018, 0.035, 1.0 - vUv.x)
            * smoothstep(0.018, 0.035, 1.0 - vUv.y);
        vec3 border = mix(vec3(0.89, 0.15, 0.18), paper, uActive);
        color = mix(border, color, edge);

        gl_FragColor = vec4(color, mix(0.72, 1.0, uActive));
    }
`;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const modulo = (value, divisor) => ((value % divisor) + divisor) % divisor;

const normalizeAngle = (angle) => {
    let normalized = angle % TWO_PI;
    if (normalized > Math.PI) normalized -= TWO_PI;
    if (normalized < -Math.PI) normalized += TWO_PI;
    return normalized;
};

const getImageSource = (project) => {
    if (typeof project.image === 'string') return project.image;

    const firstGalleryItem = project.gallery?.[0];
    if (typeof firstGalleryItem === 'string') return firstGalleryItem;
    return firstGalleryItem?.image || '';
};

const needsStaticVersion = () => {
    if (typeof window === 'undefined') return true;

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
        || window.matchMedia('(pointer: coarse)').matches
        || Boolean(navigator.connection?.saveData);
};

export default function ProjectConstellation({ projects = [] }) {
    const rootRef = useRef(null);
    const canvasHostRef = useRef(null);
    const runtimeRef = useRef(null);
    const activeTargetRef = useRef(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [shouldInitialize, setShouldInitialize] = useState(false);
    const [renderMode, setRenderMode] = useState(() => (
        needsStaticVersion() ? 'static' : 'idle'
    ));
    const isStatic = renderMode === 'static';

    const visibleProjects = useMemo(
        () => (Array.isArray(projects) ? projects.slice(0, MAX_PROJECTS) : []),
        [projects]
    );

    useEffect(() => {
        activeTargetRef.current = 0;
        setActiveIndex(0);
        runtimeRef.current?.select(0);
    }, [visibleProjects]);

    useEffect(() => {
        if (isStatic || !rootRef.current || !visibleProjects.length) return undefined;

        const root = rootRef.current;

        if (!('IntersectionObserver' in window)) {
            const frame = window.requestAnimationFrame(() => setShouldInitialize(true));
            return () => window.cancelAnimationFrame(frame);
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            setShouldInitialize(true);
            observer.disconnect();
        }, { rootMargin: '35% 0px', threshold: 0.01 });

        observer.observe(root);
        return () => observer.disconnect();
    }, [isStatic, visibleProjects.length]);

    useEffect(() => {
        if (!shouldInitialize || isStatic || !canvasHostRef.current || !visibleProjects.length) {
            return undefined;
        }

        let disposed = false;
        let cleanup = () => {};

        const initialize = async () => {
            try {
                const {
                    Camera,
                    Mesh,
                    Plane,
                    Program,
                    Renderer,
                    Texture,
                    Transform,
                } = await import('ogl');

                if (disposed || !canvasHostRef.current) return;

                const host = canvasHostRef.current;
                const renderer = new Renderer({
                    alpha: true,
                    antialias: true,
                    depth: true,
                    dpr: Math.min(window.devicePixelRatio || 1, 1.5),
                    powerPreference: 'high-performance',
                });
                const gl = renderer.gl;
                const canvas = gl.canvas;
                canvas.className = 'project-constellation__webgl';
                canvas.setAttribute('aria-hidden', 'true');
                canvas.setAttribute('tabindex', '-1');
                host.appendChild(canvas);
                gl.clearColor(0.019, 0.019, 0.019, 1);

                const camera = new Camera(gl, { fov: 34, near: 0.1, far: 100 });
                camera.position.set(0, 0.1, 9.1);
                camera.lookAt([0, 0, 0]);

                const scene = new Transform();
                const ring = new Transform();
                ring.setParent(scene);

                const geometry = new Plane(gl, {
                    width: 2.7,
                    height: 1.75,
                    widthSegments: 1,
                    heightSegments: 1,
                });
                const step = TWO_PI / visibleProjects.length;
                const radius = visibleProjects.length < 4 ? 3.1 : 3.75;
                const planeAspect = 2.7 / 1.75;
                const resources = [];
                const placeholderTexture = new Texture(gl, {
                    image: new Uint8Array([19, 13, 13, 255]),
                    width: 1,
                    height: 1,
                    generateMipmaps: false,
                    flipY: false,
                });

                visibleProjects.forEach((project, index) => {
                    const program = new Program(gl, {
                        vertex,
                        fragment,
                        transparent: true,
                        cullFace: false,
                        depthTest: true,
                        depthWrite: true,
                        uniforms: {
                            tMap: { value: placeholderTexture },
                            uActive: { value: index === 0 ? 1 : 0 },
                            uLoaded: { value: 0 },
                            uImageAspect: { value: planeAspect },
                            uPlaneAspect: { value: planeAspect },
                        },
                    });
                    const mesh = new Mesh(gl, { geometry, program });
                    const angle = index * step;
                    mesh.position.set(
                        Math.sin(angle) * radius,
                        (index - (visibleProjects.length - 1) / 2) * 0.16,
                        Math.cos(angle) * radius
                    );
                    mesh.rotation.y = angle;
                    mesh.setParent(ring);

                    const source = getImageSource(project);
                    const image = new Image();
                    resources.push({
                        image,
                        loadStarted: false,
                        mesh,
                        program,
                        source,
                        texture: null,
                    });
                });

                const motion = {
                    rotation: 0,
                    targetRotation: 0,
                    pointerX: 0,
                    pointerY: 0,
                    targetPointerX: 0,
                    targetPointerY: 0,
                };
                const drag = {
                    active: false,
                    bounds: null,
                    pointerId: null,
                    lastX: 0,
                    moved: false,
                };
                let rafId = 0;
                let sectionVisible = false;
                let wheelTimer = 0;
                let textureStageTimer = 0;
                let nextTextureIndex = 0;
                let textureStagingStarted = false;
                let canvasBounds = host.getBoundingClientRect();

                const loadResource = (index) => {
                    const resource = resources[index];
                    if (!resource || resource.loadStarted || !resource.source) return;

                    resource.loadStarted = true;
                    resource.image.decoding = 'async';
                    resource.image.crossOrigin = 'anonymous';
                    resource.image.onload = () => {
                        if (disposed) return;

                        resource.texture = new Texture(gl, {
                            image: resource.image,
                            generateMipmaps: false,
                            flipY: true,
                        });
                        resource.program.uniforms.tMap.value = resource.texture;
                        resource.program.uniforms.uImageAspect.value = resource.image.naturalWidth / resource.image.naturalHeight;
                        resource.program.uniforms.uLoaded.value = 1;
                        startRendering();
                    };
                    resource.image.onerror = () => {
                        resource.image.onload = null;
                        resource.image.onerror = null;
                    };
                    resource.image.src = resource.source;
                };

                const stageNextTexture = () => {
                    while (nextTextureIndex < resources.length && resources[nextTextureIndex].loadStarted) {
                        nextTextureIndex += 1;
                    }
                    if (disposed || nextTextureIndex >= resources.length) return;

                    loadResource(nextTextureIndex);
                    nextTextureIndex += 1;
                    textureStageTimer = window.setTimeout(stageNextTexture, 180);
                };

                const beginTextureStaging = () => {
                    if (textureStagingStarted) return;
                    textureStagingStarted = true;
                    stageNextTexture();
                };

                const selectIndex = (index) => {
                    const safeIndex = modulo(index, visibleProjects.length);
                    activeTargetRef.current = safeIndex;
                    setActiveIndex(safeIndex);

                    const desired = -safeIndex * step;
                    motion.targetRotation += normalizeAngle(desired - motion.targetRotation);
                    loadResource(safeIndex);
                    startRendering();
                };

                const selectNearest = () => {
                    const turn = Math.round(-motion.targetRotation / step);
                    motion.targetRotation = -turn * step;
                    const index = modulo(turn, visibleProjects.length);
                    activeTargetRef.current = index;
                    setActiveIndex(index);
                    loadResource(index);
                    startRendering();
                };

                runtimeRef.current = { select: selectIndex };

                const resize = () => {
                    const bounds = host.getBoundingClientRect();
                    canvasBounds = canvas.getBoundingClientRect();
                    const width = Math.max(1, bounds.width);
                    const height = Math.max(1, bounds.height);
                    renderer.setSize(width, height);
                    camera.perspective({ aspect: width / height });

                    const isNarrow = width < 900;
                    camera.position.z = isNarrow ? 10.8 : 9.1;
                    camera.lookAt([0, 0, 0]);
                    startRendering();
                };

                const renderFrame = () => {
                    rafId = 0;
                    if (!sectionVisible || document.hidden || disposed) {
                        return;
                    }

                    let needsNextFrame = false;
                    const settleMotion = (key, target, factor, epsilon) => {
                        const delta = target - motion[key];
                        if (Math.abs(delta) <= epsilon) {
                            motion[key] = target;
                            return;
                        }

                        motion[key] += delta * factor;
                        needsNextFrame = true;
                    };

                    settleMotion('rotation', motion.targetRotation, 0.075, 0.0005);
                    settleMotion('pointerX', motion.targetPointerX, 0.06, 0.001);
                    settleMotion('pointerY', motion.targetPointerY, 0.06, 0.001);
                    ring.rotation.y = motion.rotation;
                    ring.rotation.x = motion.pointerY * 0.035;
                    camera.position.x = motion.pointerX * 0.28;
                    camera.position.y = 0.1 - motion.pointerY * 0.16;
                    camera.lookAt([0, 0, 0]);

                    resources.forEach(({ mesh, program }, index) => {
                        const target = index === activeTargetRef.current ? 1 : 0;
                        const activeDelta = target - program.uniforms.uActive.value;
                        if (Math.abs(activeDelta) <= 0.002) {
                            program.uniforms.uActive.value = target;
                        } else {
                            program.uniforms.uActive.value += activeDelta * 0.09;
                            needsNextFrame = true;
                        }
                        const emphasis = 1 + program.uniforms.uActive.value * 0.14;
                        mesh.scale.set(emphasis, emphasis, emphasis);
                    });

                    renderer.render({ scene, camera, sort: true });
                    if (needsNextFrame) rafId = window.requestAnimationFrame(renderFrame);
                };

                const startRendering = () => {
                    if (!rafId && sectionVisible && !document.hidden) {
                        rafId = window.requestAnimationFrame(renderFrame);
                    }
                };

                const stopRendering = () => {
                    if (!rafId) return;
                    window.cancelAnimationFrame(rafId);
                    rafId = 0;
                };

                const onVisibilityChange = () => {
                    if (document.hidden) stopRendering();
                    else startRendering();
                };

                const onWheel = (event) => {
                    motion.targetRotation += clamp(event.deltaY, -120, 120) * 0.0015;
                    window.clearTimeout(wheelTimer);
                    wheelTimer = window.setTimeout(selectNearest, 130);
                    startRendering();
                };

                const onPointerDown = (event) => {
                    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
                    drag.active = true;
                    drag.pointerId = event.pointerId;
                    drag.lastX = event.clientX;
                    drag.moved = false;
                    drag.bounds = canvas.getBoundingClientRect();
                    canvas.setPointerCapture(event.pointerId);
                    canvas.classList.add('is-dragging');
                };

                const onPointerMove = (event) => {
                    const rect = drag.active ? drag.bounds : canvasBounds;
                    motion.targetPointerX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
                    motion.targetPointerY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
                    startRendering();

                    if (!drag.active || event.pointerId !== drag.pointerId) return;
                    const deltaX = event.clientX - drag.lastX;
                    drag.lastX = event.clientX;
                    drag.moved ||= Math.abs(deltaX) > 1;
                    motion.targetRotation += deltaX * 0.008;
                    startRendering();
                };

                const onPointerUp = (event) => {
                    if (!drag.active || event.pointerId !== drag.pointerId) return;
                    drag.active = false;
                    drag.pointerId = null;
                    drag.bounds = null;
                    canvas.classList.remove('is-dragging');
                    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
                    selectNearest();
                };

                const onPointerLeave = () => {
                    if (drag.active) return;
                    motion.targetPointerX = 0;
                    motion.targetPointerY = 0;
                    startRendering();
                };

                const onPointerEnter = () => {
                    if (!drag.active) canvasBounds = canvas.getBoundingClientRect();
                };

                resize();
                const resizeObserver = new ResizeObserver(resize);
                resizeObserver.observe(host);

                const visibilityObserver = new IntersectionObserver(([entry]) => {
                    sectionVisible = entry.isIntersecting;
                    if (sectionVisible) {
                        beginTextureStaging();
                        startRendering();
                    }
                    else stopRendering();
                }, { threshold: 0.01 });
                visibilityObserver.observe(rootRef.current);

                document.addEventListener('visibilitychange', onVisibilityChange);
                canvas.addEventListener('wheel', onWheel, { passive: true });
                canvas.addEventListener('pointerdown', onPointerDown);
                canvas.addEventListener('pointerenter', onPointerEnter);
                canvas.addEventListener('pointermove', onPointerMove);
                canvas.addEventListener('pointerup', onPointerUp);
                canvas.addEventListener('pointercancel', onPointerUp);
                canvas.addEventListener('pointerleave', onPointerLeave);
                setRenderMode('webgl');

                cleanup = () => {
                    runtimeRef.current = null;
                    window.clearTimeout(wheelTimer);
                    window.clearTimeout(textureStageTimer);
                    stopRendering();
                    resizeObserver.disconnect();
                    visibilityObserver.disconnect();
                    document.removeEventListener('visibilitychange', onVisibilityChange);
                    canvas.removeEventListener('wheel', onWheel);
                    canvas.removeEventListener('pointerdown', onPointerDown);
                    canvas.removeEventListener('pointerenter', onPointerEnter);
                    canvas.removeEventListener('pointermove', onPointerMove);
                    canvas.removeEventListener('pointerup', onPointerUp);
                    canvas.removeEventListener('pointercancel', onPointerUp);
                    canvas.removeEventListener('pointerleave', onPointerLeave);

                    resources.forEach(({ image, mesh, program, texture }) => {
                        image.onload = null;
                        image.onerror = null;
                        mesh.setParent(null);
                        program.remove();
                        if (texture) gl.deleteTexture(texture.texture);
                    });
                    gl.deleteTexture(placeholderTexture.texture);
                    geometry.remove();
                    canvas.remove();
                    gl.getExtension('WEBGL_lose_context')?.loseContext();
                };
            } catch (error) {
                console.warn('Project constellation WebGL unavailable; using static archive.', error);
                if (!disposed) setRenderMode('static');
            }
        };

        initialize();

        return () => {
            disposed = true;
            cleanup();
        };
    }, [isStatic, shouldInitialize, visibleProjects]);

    const selectProject = (index) => {
        activeTargetRef.current = index;
        if (runtimeRef.current) runtimeRef.current.select(index);
        else setActiveIndex(index);
    };

    const currentProject = visibleProjects[activeIndex] || visibleProjects[0];

    return (
        <section
            ref={rootRef}
            className={`project-constellation ${isStatic ? 'project-constellation--static' : ''}`}
            data-render-mode={renderMode}
            aria-labelledby="project-constellation-title"
        >
            <div className="project-constellation__grid" aria-hidden="true" />

            <header className="project-constellation__header">
                <p className="project-constellation__kicker">01 / Selected systems</p>
                <h2 id="project-constellation-title">Work in orbit.</h2>
                <p>Drag, scroll, or use project index. Each build is one decision trail - not one screenshot.</p>
            </header>

            {!isStatic && (
                <div ref={canvasHostRef} className="project-constellation__canvas" aria-hidden="true">
                    <span className="project-constellation__loading">Assembling project field...</span>
                </div>
            )}

            {currentProject && !isStatic && (
                <div className="project-constellation__active" aria-live="polite" aria-atomic="true">
                    <span>{String(activeIndex + 1).padStart(2, '0')} / {String(visibleProjects.length).padStart(2, '0')}</span>
                    <strong>{currentProject.title}</strong>
                    <span>{currentProject.year} / {currentProject.role || 'Software Engineer'}</span>
                </div>
            )}

            <nav className="project-constellation__index" aria-label="Selected project index">
                <ol>
                    {visibleProjects.map((project, index) => (
                        <li key={project.id} className={activeIndex === index ? 'is-active' : ''}>
                            <Link
                                to={`/project/${project.id}`}
                                aria-current={activeIndex === index ? 'true' : undefined}
                                onMouseEnter={() => selectProject(index)}
                                onFocus={() => selectProject(index)}
                                onClick={() => window.scrollTo(0, 0)}
                            >
                                {isStatic && getImageSource(project) && (
                                    <span className="project-constellation__thumb">
                                        <img
                                            src={getImageSource(project)}
                                            alt=""
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </span>
                                )}
                                <span className="project-constellation__number">{String(index + 1).padStart(2, '0')}</span>
                                <span className="project-constellation__name">{project.title}</span>
                                <span className="project-constellation__year">{project.year}</span>
                                <span className="project-constellation__arrow" aria-hidden="true">↗</span>
                            </Link>
                        </li>
                    ))}
                </ol>
            </nav>

            {!visibleProjects.length && (
                <p className="project-constellation__empty">Project archive updating.</p>
            )}

            {!isStatic && (
                <p className="project-constellation__hint" aria-hidden="true">
                    <span>Drag horizontally</span>
                </p>
            )}
        </section>
    );
}
