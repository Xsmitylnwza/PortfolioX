import { memo, useEffect, useRef, useState } from 'react';
import type { GallerySceneProps, GalleryMesh, GalleryRow, PosterTexture } from './GallerySceneTypes';
import { featuredProjects } from '../data/projects';
import { planeVertex, planeFragment } from './GallerySceneShaders';
import { createGalleryGeometry } from './GallerySceneGeometry';
import { rasterizePosterTexture } from './GalleryScenePosterTexture';

const GalleryScene = ({ mode = 'gallery', showContent = true, contentExitMs = 500, active = true }: GallerySceneProps) => {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const modeRef = useRef(mode);
    const showContentRef = useRef(showContent);
    const contentExitMsRef = useRef(contentExitMs);
    const activeRef = useRef(active);
    const syncLoopRef = useRef<(() => void) | null>(null);
    const labelRef = useRef<HTMLSpanElement | null>(null);
    const [rendererGeneration, setRendererGeneration] = useState(0);

    const setLabelText = (text: string) => {
        const el = labelRef.current;
        if (!el) return;
        if (el.textContent !== text) el.textContent = text;
    };

    const setLabelVisible = (visible: boolean) => {
        const el = labelRef.current;
        if (!el) return;
        el.classList.toggle('is-visible', Boolean(visible));
    };

    useEffect(() => {
        modeRef.current = mode;
        // Leaving gallery mode must drop the hover title immediately (stage stays mounted).
        if (mode !== 'gallery') {
            setLabelVisible(false);
            setLabelText('');
        }
    }, [mode]);

    useEffect(() => {
        showContentRef.current = showContent;
        contentExitMsRef.current = contentExitMs;
        // Soft room exit / project handoff: hide description pill before route paint.
        if (!showContent) {
            setLabelVisible(false);
            setLabelText('');
        }
    }, [showContent, contentExitMs]);

    useEffect(() => {
        activeRef.current = active;
        // Resume continuous painting immediately so the cylinder grid never flashes empty.
        syncLoopRef.current?.();
    }, [active]);

    useEffect(() => {
        const host = hostRef.current;
        if (!host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
        let disposed = false;
        let cleanup = () => {};
        const init = async () => {
            const { Camera, Geometry, Mesh, Plane, Program, Raycast, Renderer, Texture, Torus, Transform, Vec3 } = await import('ogl');
            if (disposed || !hostRef.current) return;
            const renderer = new Renderer({
                alpha: true,
                antialias: true,
                // Keep last frame during layout/resize so route swaps never flash empty canvas.
                preserveDrawingBuffer: true,
                dpr: Math.min(window.devicePixelRatio || 1, 1.25),
                powerPreference: 'high-performance',
            });
            const gl = renderer.gl;
            gl.clearColor(0, 0, 0, 0);
            gl.canvas.className = 'gallery-webgl';
            host.appendChild(gl.canvas);

            const camera = new Camera(gl, { fov: 40, near: 0.1, far: 70 });
            camera.position.set(0, 0, 9.6);
            camera.lookAt([0, 0, 0]);
            const scene = new Transform();
            const gallery = new Transform();
            gallery.setParent(scene);
            const planeWidth = 2.35 * 0.78;
            const planeHeight = 1.52 * 0.78;
            const geometry = new Plane(gl, { width: planeWidth, height: planeHeight, widthSegments: 18, heightSegments: 10 });
            const placeholder = new Texture(gl, { image: new Uint8Array([34, 7, 10, 255]), width: 1, height: 1, generateMipmaps: false, flipY: false });
            const textureCache = new Map<string, PosterTexture>();
            const uploadQueue: PosterTexture[] = [];
            const rows: GalleryRow[] = [];
            const meshes: GalleryMesh[] = [];
            const frameUniforms = {
                bendH: 0,
                bendV: 0,
                sceneOpacity: 0,
                contentOpacity: showContentRef.current ? 1 : 0,
                time: 0,
            };
            let contentExitStart = showContentRef.current ? null : 0;
            let contentEnterStart: number | null = null;
            let previousShowContent = showContentRef.current;
            const planeProgram = new Program(gl, {
                vertex: planeVertex,
                fragment: planeFragment,
                transparent: true,
                cullFace: false,
                depthTest: true,
                depthWrite: false,
                uniforms: {
                    tMap: { value: placeholder }, uLoaded: { value: 0 },
                    uImageAspect: { value: 1 }, uPlaneAspect: { value: planeWidth / planeHeight },
                    uBendH: { value: 0 }, uBendV: { value: 0 }, uHover: { value: 0 },
                    uRowOpacity: { value: 1 },
                    uSceneOpacity: { value: 0 },
                    uCardReveal: { value: 0 },
                    uTime: { value: 0 }, uPhase: { value: 0 },
                },
            });
            const rowCount = 3;
            const perRow = 8;
            const radius = 4.65;
            const rowSpacing = 2.7;

            const getTexture = (source: string) => {
                const cached = textureCache.get(source);
                if (cached) return cached;
                const texture = new Texture(gl, { generateMipmaps: false, flipY: true });
                const record: PosterTexture = { texture, loaded: false, queued: false, pendingImage: null, aspect: 1 };
                textureCache.set(source, record);
                const image = new Image();
                image.decoding = 'async';
                image.onload = async () => {
                    if (disposed) return;
                    try {
                        await image.decode?.();
                    } catch {
                        // Continue with browser-decoded image when decode() is unavailable.
                    }
                    if (disposed) return;
                    const raster = rasterizePosterTexture(image, 1024);
                    if (!raster) return;
                    record.pendingImage = raster.canvas;
                    record.aspect = raster.aspect;
                    if (!record.queued) {
                        record.queued = true;
                        uploadQueue.push(record);
                    }
                };
                image.onerror = () => {
                    // Keep placeholder plane if a poster asset fails to load.
                    record.loaded = false;
                };
                image.src = source;
                return record;
            };

            for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
                const row: GalleryRow = Object.assign(new Transform(), { userData: { opacity: 1 } });
                row.position.y = (rowIndex - 1) * rowSpacing;
                row.setParent(gallery);
                rows.push(row);
                for (let index = 0; index < perRow; index += 1) {
                    const project = featuredProjects[(index + rowIndex * 3) % featuredProjects.length];
                    const resource = getTexture(project.coverImage);
                    const mesh = new Mesh(gl, { geometry, program: planeProgram });
                    const theta = ((index + rowIndex * 0.5) / perRow) * Math.PI * 2;
                    mesh.position.set(Math.cos(theta) * radius, 0, Math.sin(theta) * radius);
                    mesh.rotation.y = -(theta - Math.PI / 2);
                    const galleryMesh: GalleryMesh = Object.assign(mesh, { userData: {
                        project,
                        resource,
                        hover: 0,
                        reveal: 0,
                        exit: 1,
                        revealDelay: Math.floor((rowIndex * perRow + index) / 2) * 0.1,
                        exitDelay: Math.floor((rowIndex * perRow + index) / 2) * 0.018,
                        row,
                        phase: Math.random() * Math.PI * 2,
                    } });
                    mesh.onBeforeRender(() => {
                        const uniforms = planeProgram.uniforms;
                        uniforms.tMap.value = resource.loaded ? resource.texture : placeholder;
                        uniforms.uLoaded.value = resource.loaded ? 1 : 0;
                        uniforms.uImageAspect.value = resource.aspect;
                        uniforms.uBendH.value = frameUniforms.bendH;
                        uniforms.uBendV.value = frameUniforms.bendV;
                        uniforms.uHover.value = galleryMesh.userData.hover;
                        uniforms.uRowOpacity.value = row.userData.opacity;
                        uniforms.uSceneOpacity.value = frameUniforms.sceneOpacity * frameUniforms.contentOpacity;
                        uniforms.uCardReveal.value = galleryMesh.userData.reveal * galleryMesh.userData.exit;
                        uniforms.uTime.value = frameUniforms.time;
                        uniforms.uPhase.value = galleryMesh.userData.phase;
                    });
                    mesh.setParent(row);
                    meshes.push(galleryMesh);
                }
            }

            const { gridGeometry, gridProgram, cylinderGrid, sculpture, torusGeometries, torusMeshes } =
                createGalleryGeometry(gl, scene, { Geometry, Mesh, Program, Torus, Transform });
            const raycast = new Raycast();

            const pointer = { x: 0, y: 0, clientX: 0, clientY: 0, active: false };
            const labelEl = labelRef.current;
            const labelPos = { x: 0, y: 0, targetX: 0, targetY: 0, seeded: false };
            const LABEL_OFFSET_X = 20;
            const LABEL_OFFSET_Y = 0;
            // Device-aware viscous scroll: mouse wheel, trackpad pixel deltas, and touch drag.
            const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
            const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const DIMMED_SCULPTURE_OPACITY = coarsePointer ? 0.12 : 0.28;
            const SCROLL_Y_GAIN = finePointer ? 0.0026 : 0.0034;
            const SPIN_GAIN = finePointer ? 0.00055 : 0.0007;
            const SPIN_TARGET_MAX = 0.38;
            const SPIN_VELOCITY_MAX = 0.32;
            const Y_FOLLOW = 3.2;
            const SPIN_FOLLOW = 3.8;
            const SPIN_DECAY = 0.9;
            const TOUCH_SCROLL_GAIN = 0.0088;
            const TOUCH_SPIN_GAIN = 0.0018;
            const WHEEL_PIXEL_SCALE = 1;
            const WHEEL_LINE_SCALE = 16;
            const WHEEL_PAGE_SCALE = Math.max(window.innerHeight * 0.55, 320);
            const motion = {
                spin: 0,
                targetSpin: 0,
                spinVelocity: 0,
                targetY: 0,
                currentY: 0,
                previousY: 0,
                bendH: 0,
                bendV: 0,
            };
            const drag: { active: boolean; pointerId: number | null; startX: number; startY: number; lastX: number; lastY: number; lastT: number; moved: boolean; suppressClick: boolean; axis: 'x' | 'y' | null } = {
                active: false,
                pointerId: null,
                startX: 0,
                startY: 0,
                lastX: 0,
                lastY: 0,
                lastT: 0,
                moved: false,
                suppressClick: false,
                axis: null, // 'x' | 'y' once gesture locks
            };
            let hovered: GalleryMesh | null = null;
            let raf = 0;
            let contextLost = false;
            // Loop gate: document visibility + explicit active prop (not host.isConnected).
            let previousTime = performance.now();
            // Every entry path waits for the shared Loader's portfolio:reveal-start.
            // Only snap if the loader already finished before this host mounted.
            let revealStart: number | null = null;
            let revealComplete = false;
            let snapRevealAtMount = false;
            // Non-gallery rooms quiet the 3D sculpture only; black grid stays full.
            let sculptureDim = document.documentElement.classList.contains('stage-dimmed')
                ? DIMMED_SCULPTURE_OPACITY
                : 1;
            if (document.documentElement.classList.contains('portfolio-ready')) {
                revealStart = performance.now();
                snapRevealAtMount = true;
                revealComplete = true;
            }
            const clearHover = () => {
                hovered = null;
                pointer.active = false;
                gl.canvas.classList.remove('is-hovering');
                setLabelVisible(false);
                setLabelText('');
                // Park the pill so a leftover transform cannot flash on the next room.
                labelPos.seeded = false;
                if (labelEl) {
                    labelEl.style.transform = 'translate3d(-9999px, -9999px, 0)';
                }
            };
            // Content interactivity is driven by showContent, not only route mode.
            const isInteractive = () => showContentRef.current && modeRef.current === 'gallery';
            // Keep RAF alive whenever the stage host is active. Pausing blanks WebGL on many GPUs
            // and looks like the grid unmounted during room transitions.
            const canRunLoop = () => !disposed && !contextLost && !document.hidden && Boolean(activeRef.current);
            const syncLoop = () => {
                if (canRunLoop()) {
                    if (!raf) {
                        previousTime = performance.now();
                        raf = requestAnimationFrame(render);
                    }
                    return;
                }
                if (raf) {
                    cancelAnimationFrame(raf);
                    raf = 0;
                }
            };
            const onRevealStart = () => { revealStart = performance.now(); };
            const beginContentExit = (durationMs: number) => {
                contentExitMsRef.current = durationMs || contentExitMsRef.current || 500;
                contentExitStart = performance.now();
                contentEnterStart = null;
                previousShowContent = false;
                showContentRef.current = false;
                clearHover();
            };
            const onGalleryExit = () => {
                // Legacy event: fade gallery content only. Grid stays.
                beginContentExit(contentExitMsRef.current || 500);
            };
            const onRoomContentExit = (event: Event) => {
                beginContentExit(Number((event as CustomEvent<{ durationMs?: number }>).detail?.durationMs) || contentExitMsRef.current || 500);
            };
            const onRoomContentEnter = () => {
                if (!showContentRef.current) return;
                contentEnterStart = performance.now();
                contentExitStart = null;
            };

            let lastRenderWidth = 0;
            let lastRenderHeight = 0;
            const resize = () => {
                const width = Math.max(host.clientWidth || window.innerWidth, 1);
                const height = Math.max(host.clientHeight || window.innerHeight, 1);
                // Prefer visualViewport on mobile browser chrome changes.
                const vv = window.visualViewport;
                const renderWidth = vv ? Math.max(width, Math.round(vv.width)) : width;
                const renderHeight = vv ? Math.max(height, Math.round(vv.height)) : height;
                // Skip no-op resizes. setSize clears the drawing buffer and looked like a grid unmount.
                if (renderWidth === lastRenderWidth && renderHeight === lastRenderHeight) return;
                lastRenderWidth = renderWidth;
                lastRenderHeight = renderHeight;
                renderer.setSize(renderWidth, renderHeight);
                camera.perspective({ aspect: renderWidth / Math.max(renderHeight, 1) });

                // Scale gallery density a bit on short/narrow viewports.
                const compact = renderWidth < 760 || renderHeight < 700;
                rows.forEach((row, rowIndex) => {
                    if (!row.userData.baseY) row.userData.baseY = (rowIndex - 1) * rowSpacing;
                    // Keep existing y scroll offset while changing spacing feel via opacity falloff only.
                    row.userData.compact = compact;
                });
                // Paint immediately after buffer resize so route layout thrash never shows empty stage.
                if (!disposed && canRunLoop()) {
                    renderer.render({ scene, camera });
                }
            };

            const normalizeWheelDelta = (event: WheelEvent) => {
                let dy = event.deltaY;
                let dx = event.deltaX;
                // Some trackpads expose dominant horizontal deltas when shift-scrolled / sideways.
                if (event.shiftKey && Math.abs(dx) > Math.abs(dy)) {
                    dy = dx;
                    dx = 0;
                }
                // Prefer the stronger axis so diagonal trackpad gestures still drive the gallery.
                if (Math.abs(dx) > Math.abs(dy) * 1.35) {
                    dy = dx;
                }

                const mode = event.deltaMode;
                let scale = WHEEL_PIXEL_SCALE;
                if (mode === 1) scale = WHEEL_LINE_SCALE;
                else if (mode === 2) scale = WHEEL_PAGE_SCALE;

                // Firefox line mode + high-res trackpads already arrive as pixels (mode 0).
                const pixelDelta = dy * scale;
                // Soft-limit bursty spikes (mouse notches + inertia flicks).
                return Math.tanh(pixelDelta / 180) * 180;
            };

            const applyScrollImpulse = (pixelDelta: number, source: 'wheel' | 'touch' = 'wheel') => {
                if (!Number.isFinite(pixelDelta) || pixelDelta === 0) return;
                const yGain = source === 'touch' ? TOUCH_SCROLL_GAIN : SCROLL_Y_GAIN;
                const spinGain = source === 'touch' ? TOUCH_SPIN_GAIN : SPIN_GAIN;
                motion.targetY -= pixelDelta * yGain;
                motion.targetSpin = Math.max(
                    -SPIN_TARGET_MAX,
                    Math.min(SPIN_TARGET_MAX, motion.targetSpin + pixelDelta * spinGain),
                );
            };

            const updatePointerFromEvent = (event: MouseEvent | PointerEvent, { forHover = true }: { forHover?: boolean } = {}) => {
                const rect = gl.canvas.getBoundingClientRect();
                const width = Math.max(rect.width, 1);
                const height = Math.max(rect.height, 1);
                pointer.x = ((event.clientX - rect.left) / width) * 2 - 1;
                pointer.y = -(((event.clientY - rect.top) / height) * 2 - 1);
                pointer.clientX = event.clientX - rect.left;
                pointer.clientY = event.clientY - rect.top;
                if (forHover) pointer.active = true;

                labelPos.targetX = Math.min(Math.max(pointer.clientX + LABEL_OFFSET_X, 12), width - 12);
                labelPos.targetY = Math.min(Math.max(pointer.clientY + LABEL_OFFSET_Y, 12), height - 12);
                if (!labelPos.seeded && labelEl) {
                    labelPos.x = labelPos.targetX;
                    labelPos.y = labelPos.targetY;
                    labelPos.seeded = true;
                    labelEl.style.transform = `translate3d(${labelPos.x}px, ${labelPos.y}px, 0) translateY(-50%)`;
                }

                // Subtle camera parallax only for fine pointers; avoid jumpiness on touch.
                if (finePointer && !drag.active) {
                    camera.position.x += ((event.clientX / window.innerWidth - 0.5) * 0.24 - camera.position.x) * 0.08;
                    camera.position.y += ((0.5 - event.clientY / window.innerHeight) * 0.18 - camera.position.y) * 0.08;
                    camera.lookAt([0, 0, 0]);
                }
            };

            const pickMeshAtEvent = (event: MouseEvent | PointerEvent): GalleryMesh | null => {
                updatePointerFromEvent(event, { forHover: false });
                raycast.castMouse(camera, [pointer.x, pointer.y]);
                return (raycast.intersectBounds(meshes)[0] as GalleryMesh | undefined) || null;
            };

            const selectProject = (mesh: GalleryMesh | null) => {
                const project = mesh?.userData?.project;
                if (!project) return false;

                // Drop the hover description before the room swap starts.
                clearHover();
                document.dispatchEvent(new CustomEvent('portfolio:poster-select', {
                    detail: {
                        projectId: project.id,
                        title: project.title,
                        startedAt: performance.now(),
                    },
                }));
                return true;
            };

            const onWheel = (event: WheelEvent) => {
                if (!isInteractive()) return;
                // Always consume wheel while gallery is interactive so trackpad/mouse
                // never scroll the locked home document underneath.
                event.preventDefault();
                event.stopPropagation();
                applyScrollImpulse(normalizeWheelDelta(event), 'wheel');
            };

            const endDrag = (event?: PointerEvent) => {
                if (!drag.active) return;
                if (event && drag.pointerId !== null && event.pointerId !== drag.pointerId) return;
                if (event && drag.pointerId !== null) {
                    try { gl.canvas.releasePointerCapture(drag.pointerId); } catch { /* already released */ }
                }
                // Convert last flick into residual spin/scroll.
                if (drag.lastT) {
                    const now = performance.now();
                    const dtMs = Math.max(16, now - drag.lastT);
                    // residual already applied continuously; keep a soft decay only
                    if (dtMs < 48) {
                        motion.targetSpin *= 1.08;
                    }
                }
                drag.active = false;
                drag.pointerId = null;
                drag.axis = null;
                gl.canvas.classList.remove('is-dragging');
            };

            const onPointerDown = (event: PointerEvent) => {
                if (!isInteractive()) return;
                if (event.pointerType === 'mouse' && event.button !== 0) return;
                drag.active = true;
                drag.pointerId = event.pointerId;
                drag.startX = event.clientX;
                drag.startY = event.clientY;
                drag.lastX = event.clientX;
                drag.lastY = event.clientY;
                drag.lastT = performance.now();
                drag.moved = false;
                drag.suppressClick = false;
                drag.axis = null;
                gl.canvas.classList.add('is-dragging');
                try { gl.canvas.setPointerCapture(event.pointerId); } catch { /* unsupported */ }
                updatePointerFromEvent(event, { forHover: event.pointerType !== 'touch' });
            };

            const onPointerMove = (event: PointerEvent) => {
                if (!isInteractive()) return;

                if (drag.active && event.pointerId === drag.pointerId) {
                    const now = performance.now();
                    const dx = event.clientX - drag.lastX;
                    const dy = event.clientY - drag.lastY;
                    const totalX = event.clientX - drag.startX;
                    const totalY = event.clientY - drag.startY;
                    const distance = Math.hypot(totalX, totalY);

                    if (!drag.axis && distance > 8) {
                        drag.axis = Math.abs(totalX) > Math.abs(totalY) * 1.15 ? 'x' : 'y';
                    }

                    if (distance > 7) {
                        drag.moved = true;
                        drag.suppressClick = true;
                    }

                    // Touch / pen / click-drag all drive the orbit. Prefer locked axis.
                    if (drag.axis === 'x') {
                        applyScrollImpulse(-dx * 1.15, 'touch');
                    } else if (drag.axis === 'y') {
                        applyScrollImpulse(dy, 'touch');
                    } else {
                        // Before lock, mix lightly so first frames still feel alive.
                        applyScrollImpulse(dy * 0.65 - dx * 0.45, 'touch');
                    }

                    drag.lastX = event.clientX;
                    drag.lastY = event.clientY;
                    drag.lastT = now;
                    updatePointerFromEvent(event, { forHover: event.pointerType !== 'touch' });
                    return;
                }

                // Hover tracking for mouse/pen only.
                if (event.pointerType === 'touch') return;
                updatePointerFromEvent(event, { forHover: true });
            };

            const onPointerUp = (event: PointerEvent) => {
                const isTouchTap = event.pointerType === 'touch'
                    && drag.active
                    && event.pointerId === drag.pointerId
                    && !drag.moved;

                if (isTouchTap) {
                    const selected = selectProject(pickMeshAtEvent(event));
                    // Ignore the synthetic click that follows a handled touch tap.
                    if (selected) drag.suppressClick = true;
                }
                endDrag(event);
            };

            const onPointerCancel = (event: PointerEvent) => {
                endDrag(event);
                clearHover();
            };

            const onPointerLeave = (event: PointerEvent) => {
                // Don't clear mid-drag when pointer briefly leaves canvas bounds.
                if (drag.active) return;
                if (event.pointerType === 'touch') return;
                clearHover();
            };

            const onClick = (event: MouseEvent) => {
                if (!isInteractive()) return;
                if (drag.suppressClick) {
                    drag.suppressClick = false;
                    event.preventDefault?.();
                    return;
                }
                selectProject(hovered || pickMeshAtEvent(event));
            };

            // Keyboard fallback (a11y / no-trackpad): arrows + page keys.
            const onKeyDown = (event: KeyboardEvent) => {
                if (!isInteractive()) return;
                const target = event.target instanceof HTMLElement ? event.target : null;
                const tag = (target?.tagName || '').toLowerCase();
                if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;
                const map = {
                    ArrowDown: 90,
                    ArrowUp: -90,
                    PageDown: 180,
                    PageUp: -180,
                    ' ': 120,
                };
                if (!(event.key in map)) return;
                event.preventDefault();
                applyScrollImpulse(map[event.key as keyof typeof map] * (event.shiftKey ? 1.45 : 1), 'wheel');
            };

            const render = (time: number) => {
                if (!canRunLoop()) {
                    raf = 0;
                    return;
                }
                const dt = Math.min((time - previousTime) / 1000, 0.05);
                previousTime = time;
                // Track showContent edge so unmount always runs a 0.5s fade, not a hard cut.
                const wantsContent = showContentRef.current;
                if (wantsContent !== previousShowContent) {
                    if (wantsContent) {
                        contentEnterStart = performance.now();
                        contentExitStart = null;
                    } else {
                        contentExitStart = performance.now();
                        contentEnterStart = null;
                        clearHover();
                    }
                    previousShowContent = wantsContent;
                }

                const contentExitDuration = Math.max(0.18, (contentExitMsRef.current || 500) / 1000);
                const contentEnterDuration = 0.55;
                const smoothstep = (value: number) => {
                    const clamped = Math.max(0, Math.min(1, value));
                    return clamped * clamped * (3 - 2 * clamped);
                };

                if (contentExitStart !== null) {
                    const exitElapsed = Math.max(0, (time - contentExitStart) / 1000);
                    frameUniforms.contentOpacity = 1 - smoothstep(exitElapsed / contentExitDuration);
                    if (exitElapsed >= contentExitDuration) {
                        frameUniforms.contentOpacity = 0;
                        // Keep contentExitStart so opacity stays at 0 until re-enter.
                    }
                } else if (contentEnterStart !== null) {
                    const enterElapsed = Math.max(0, (time - contentEnterStart) / 1000);
                    frameUniforms.contentOpacity = smoothstep(enterElapsed / contentEnterDuration);
                    if (enterElapsed >= contentEnterDuration) {
                        frameUniforms.contentOpacity = 1;
                        contentEnterStart = null;
                    }
                } else {
                    frameUniforms.contentOpacity = wantsContent ? 1 : 0;
                }

                const interactive = isInteractive() && frameUniforms.contentOpacity > 0.08;
                if (!interactive) {
                    motion.targetY *= 0.9;
                    motion.targetSpin *= 0.85;
                    motion.spinVelocity *= 0.92;
                    if (drag.active) endDrag();
                    if (hovered) clearHover();
                }

                // Stage rooms keep a calm idle spin. Gallery rooms keep full scroll/orbit response.
                const idleSpin = interactive ? (reduceMotion ? 0.02 : 0.04) : 0.012;
                motion.currentY += (motion.targetY - motion.currentY) * (1 - Math.exp(-Y_FOLLOW * dt));
                const scrollDelta = motion.currentY - motion.previousY;
                motion.previousY = motion.currentY;
                motion.spinVelocity += (motion.targetSpin - motion.spinVelocity) * (1 - Math.exp(-SPIN_FOLLOW * dt));
                motion.spinVelocity = Math.max(-SPIN_VELOCITY_MAX, Math.min(SPIN_VELOCITY_MAX, motion.spinVelocity));
                motion.targetSpin *= Math.pow(SPIN_DECAY, dt * 60);
                motion.spin += (idleSpin + motion.spinVelocity) * dt;
                motion.bendH += (Math.max(-0.28, Math.min(0.28, motion.spinVelocity * 0.12)) - motion.bendH) * 0.05;
                motion.bendV += (Math.max(-0.22, Math.min(0.22, scrollDelta * 0.32)) - motion.bendV) * 0.07;
                const range = rowCount * rowSpacing;
                rows.forEach((row) => {
                    row.position.y -= scrollDelta;
                    if (row.position.y > range / 2) row.position.y -= range;
                    if (row.position.y < -range / 2) row.position.y += range;
                    const edgeDistance = range / 2 - Math.abs(row.position.y);
                    row.userData.opacity = Math.max(0, Math.min(1, edgeDistance / 1.05));
                    row.rotation.y = motion.spin;
                });
                // Whole mandala drifts with scroll, while each ring free-orbits on its own axis.
                sculpture.rotation.y = -motion.spin * 0.85 + Math.sin(time * 0.00019) * 0.18;
                sculpture.rotation.x = Math.sin(time * 0.00013) * 0.28 + Math.cos(time * 0.00009) * 0.08;
                sculpture.rotation.z = Math.sin(time * 0.00011 + 1.2) * 0.16;
                cylinderGrid.rotation.y = motion.spin * 0.11 + Math.sin(time * 0.00008) * 0.016;
                const revealElapsed = revealStart === null ? 0 : Math.max(0, (time - revealStart) / 1000);
                const smooth = (value: number) => {
                    const clamped = Math.max(0, Math.min(1, value));
                    return clamped * clamped * (3 - 2 * clamped);
                };
                // Snap only when the host mounted after boot loader finished.
                const gridReveal = snapRevealAtMount ? 1 : smooth(revealElapsed / 1.15);
                const sceneReveal = snapRevealAtMount ? 1 : smooth((revealElapsed - 1.45) / 1.05);
                // Grid is permanent stage architecture. Never fade with room content swaps,
                // and never couple it to stage-dimmed (black grid stays full strength).
                if (gridReveal >= 0.999) revealComplete = true;
                gridProgram.uniforms.uOpacity.value = (revealComplete ? 1 : gridReveal) * 0.86;
                const scrollWave = window.__scrollPerspectiveWave;
                gridProgram.uniforms.uTime.value = time * 0.001;
                gridProgram.uniforms.uScrollWave.value = scrollWave?.active
                    ? scrollWave.velocity
                    : 0;
                // sceneOpacity only gates card textures; keep it at 1 after first full reveal.
                frameUniforms.sceneOpacity = revealComplete ? 1 : sceneReveal;
                // Dim only the 3D sculpture/tori on non-gallery rooms. Soft-lerp for room swaps.
                const sculptureDimTarget = document.documentElement.classList.contains('stage-dimmed')
                    ? DIMMED_SCULPTURE_OPACITY
                    : 1;
                const dimBlend = Math.min(1, Math.max(0.016, dt) * 3.2);
                sculptureDim += (sculptureDimTarget - sculptureDim) * dimBlend;
                const sculptureOpacity = sceneReveal * 0.96 * sculptureDim;
                const tSec = time * 0.001;
                torusMeshes.forEach((mesh, index) => {
                    const program = mesh.userData.program;
                    if (program) {
                        program.uniforms.uTime.value = tSec;
                        program.uniforms.uOpacity.value = sculptureOpacity * (0.88 + (index % 3) * 0.04);
                        program.uniforms.uLayer.value = index;
                    }
                    const speed = mesh.userData.speed ?? (0.5 + index * 0.05);
                    const axis = mesh.userData.axis || { x: 0, y: 1, z: 0 };
                    const phase = mesh.userData.phase || 0;
                    // Doctor Strange pattern: independent axis spin + slow precession + counter-orbit.
                    const spin = tSec * speed + phase;
                    const precess = tSec * (0.17 + index * 0.03) + phase * 0.5;
                    const counter = tSec * (-0.21 - index * 0.02);
                    mesh.rotation.x = (mesh.userData.base?.x || 0)
                        + axis.x * spin
                        + Math.sin(precess) * 0.55
                        + Math.sin(counter + index) * 0.18;
                    mesh.rotation.y = (mesh.userData.base?.y || 0)
                        + axis.y * spin
                        + Math.cos(precess * 0.85) * 0.45
                        + Math.sin(counter * 1.1) * 0.22;
                    mesh.rotation.z = (mesh.userData.base?.z || 0)
                        + axis.z * spin
                        + Math.sin(precess * 1.25 + 0.6) * 0.35
                        + Math.cos(counter * 0.75) * 0.16;
                    const baseZ = [-0.04, -0.01, 0.03, 0, -0.03, 0.05][index] || 0;
                    mesh.position.x = Math.sin(precess * 0.7 + index) * 0.035;
                    mesh.position.y = Math.cos(precess * 0.9 + index * 0.8) * 0.03;
                    mesh.position.z = baseZ + Math.sin(counter + phase) * 0.02;
                });
                frameUniforms.time = time * 0.001;
                frameUniforms.bendH = motion.bendH;
                frameUniforms.bendV = motion.bendV;

                const nextTexture = uploadQueue.shift();
                if (nextTexture?.pendingImage) {
                    nextTexture.texture.image = nextTexture.pendingImage;
                    nextTexture.pendingImage = null;
                    nextTexture.loaded = true;
                }

                meshes.forEach((mesh) => {
                    const { userData } = mesh;
                    userData.hover += ((mesh === hovered ? 1 : 0) - userData.hover) * (1 - Math.exp(-8 * dt));
                    userData.reveal = smooth((revealElapsed - 1.45 - userData.revealDelay) / 0.55);
                    if (snapRevealAtMount) userData.reveal = 1;
                    // Staggered content unmount: cards peel away over the shared exit window.
                    if (contentExitStart !== null) {
                        const exitElapsed = Math.max(0, (time - contentExitStart) / 1000);
                        userData.exit = 1 - smoothstep((exitElapsed - userData.exitDelay) / Math.max(0.12, contentExitDuration - userData.exitDelay));
                    } else if (contentEnterStart !== null) {
                        const enterElapsed = Math.max(0, (time - contentEnterStart) / 1000);
                        userData.exit = smoothstep((enterElapsed - userData.revealDelay * 0.25) / 0.35);
                    } else {
                        userData.exit = wantsContent ? 1 : 0;
                    }
                    const scale = (0.9 + userData.reveal * 0.1)
                        * (0.86 + userData.exit * 0.14)
                        * (1 + userData.hover * 0.08)
                        * (0.92 + frameUniforms.contentOpacity * 0.08);
                    // Fit each card to its source poster instead of cropping it or
                    // leaving a letterbox band inside a one-size-fits-all frame.
                    const aspectScale = (planeWidth / planeHeight) / Math.max(userData.resource.aspect, 0.01);
                    mesh.scale.set(scale, scale * aspectScale, scale);
                    mesh.visible = frameUniforms.contentOpacity > 0.01 && userData.exit > 0.01;
                });

                // Keep stage continuous: grid never hides when content fades.
                renderer.render({ scene, camera });
                if (!revealComplete && sceneReveal >= 0.999) {
                    revealComplete = true;
                    document.dispatchEvent(new CustomEvent('portfolio:gallery-reveal-complete'));
                }
                if (interactive && pointer.active) {
                    raycast.castMouse(camera, [pointer.x, pointer.y]);
                    const next = (raycast.intersectBounds(meshes)[0] as GalleryMesh | undefined) || null;
                    if (next !== hovered) {
                        hovered = next;
                        gl.canvas.classList.toggle('is-hovering', Boolean(hovered));
                        setLabelVisible(Boolean(hovered));
                        setLabelText(hovered?.userData?.project?.title || '');
                    }
                }

                if (labelEl && labelPos.seeded) {
                    // Soft lag so the glass pill feels tracked, not glued.
                    const follow = 1 - Math.exp(-14 * dt);
                    labelPos.x += (labelPos.targetX - labelPos.x) * follow;
                    labelPos.y += (labelPos.targetY - labelPos.y) * follow;
                    labelEl.style.transform = `translate3d(${labelPos.x}px, ${labelPos.y}px, 0) translateY(-50%)`;
                }
                if (canRunLoop()) {
                    raf = requestAnimationFrame(render);
                } else {
                    raf = 0;
                }
            };

            // Always-mounted fixed hosts stay isConnected; pause via active + tab visibility.
            // Do not use IntersectionObserver host.isConnected as "visible" - that never pauses.
            const onVisibility = () => {
                syncLoop();
            };
            const onContextLost = (event: Event) => {
                event.preventDefault();
                contextLost = true;
                syncLoop();
                clearHover();
            };
            const onContextRestored = () => {
                // WebGL objects from the lost context cannot be reused. Recreate the
                // complete session once, keeping the React stage host mounted.
                setRendererGeneration((generation) => generation + 1);
            };
            document.addEventListener('visibilitychange', onVisibility);
            gl.canvas.addEventListener('webglcontextlost', onContextLost);
            gl.canvas.addEventListener('webglcontextrestored', onContextRestored);
            const resizeObserver = new ResizeObserver(resize);
            resizeObserver.observe(host);
            syncLoopRef.current = syncLoop;
            // Capture on host: reliable for trackpad even when child hit-testing is flaky.
            // stopPropagation in handler prevents double-application if canvas also receives it.
            host.addEventListener('wheel', onWheel, { passive: false, capture: true });
            gl.canvas.addEventListener('wheel', onWheel, { passive: false });
            gl.canvas.addEventListener('pointerdown', onPointerDown, { passive: true });
            gl.canvas.addEventListener('pointermove', onPointerMove, { passive: true });
            gl.canvas.addEventListener('pointerup', onPointerUp, { passive: true });
            gl.canvas.addEventListener('pointercancel', onPointerCancel, { passive: true });
            gl.canvas.addEventListener('pointerleave', onPointerLeave);
            gl.canvas.addEventListener('click', onClick);
            window.addEventListener('keydown', onKeyDown);
            document.addEventListener('portfolio:reveal-start', onRevealStart);
            document.addEventListener('portfolio:gallery-exit', onGalleryExit);
            document.addEventListener('portfolio:room-content-exit', onRoomContentExit);
            document.addEventListener('portfolio:room-content-enter', onRoomContentEnter);
            const onViewportResize = () => resize();
            window.visualViewport?.addEventListener('resize', onViewportResize);
            window.visualViewport?.addEventListener('scroll', onViewportResize);
            resize();
            syncLoop();

            cleanup = () => {
                syncLoopRef.current = null;
                resizeObserver.disconnect();
                document.removeEventListener('visibilitychange', onVisibility);
                gl.canvas.removeEventListener('webglcontextlost', onContextLost);
                gl.canvas.removeEventListener('webglcontextrestored', onContextRestored);
                host.removeEventListener('wheel', onWheel, true);
                gl.canvas.removeEventListener('wheel', onWheel);
                gl.canvas.removeEventListener('pointerdown', onPointerDown);
                gl.canvas.removeEventListener('pointermove', onPointerMove);
                gl.canvas.removeEventListener('pointerup', onPointerUp);
                gl.canvas.removeEventListener('pointercancel', onPointerCancel);
                gl.canvas.removeEventListener('pointerleave', onPointerLeave);
                gl.canvas.removeEventListener('click', onClick);
                window.removeEventListener('keydown', onKeyDown);
                window.visualViewport?.removeEventListener('resize', onViewportResize);
                window.visualViewport?.removeEventListener('scroll', onViewportResize);
                document.removeEventListener('portfolio:reveal-start', onRevealStart);
                document.removeEventListener('portfolio:gallery-exit', onGalleryExit);
                document.removeEventListener('portfolio:room-content-exit', onRoomContentExit);
                document.removeEventListener('portfolio:room-content-enter', onRoomContentEnter);
                if (raf) cancelAnimationFrame(raf);
                planeProgram.remove();
                textureCache.forEach(({ texture }) => gl.deleteTexture(texture.texture));
                gl.deleteTexture(placeholder.texture);
                geometry.remove();
                gridGeometry.remove();
                gridProgram.remove();
                torusGeometries.forEach((geo) => geo.remove());
                torusMeshes.forEach((mesh) => mesh.userData.program?.remove());
                gl.canvas.remove(); gl.getExtension('WEBGL_lose_context')?.loseContext();
            };
        };

        init().catch((error) => console.warn('Gallery WebGL unavailable.', error));
        return () => { disposed = true; cleanup(); };
    }, [rendererGeneration]);

    return (
        <div
            ref={hostRef}
            className={`gallery-scene${mode === 'stage' ? ' is-stage-only' : ''}`}
            aria-hidden="true"
            data-lenis-prevent-wheel={mode === 'gallery' ? true : undefined}
        >
            <span
                ref={labelRef}
                className="gallery-scene__active"
            ></span>
        </div>
    );
};

export default memo(GalleryScene);
