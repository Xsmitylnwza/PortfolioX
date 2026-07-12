import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const projectMedia = [
    { id: 'keshi-pomodoro', title: 'Keshi Pomodoro', image: '/assets/previews/keshi-pomodoro-demo.jpg' },
    { id: 'zucchini-review', title: 'Zucchini Review', image: '/assets/previews/zucchini-homepage.jpg' },
    { id: 'decrypt-password', title: 'Decrypt', image: '/assets/previews/decrypt-gameplay.jpg' },
    { id: 'keshi-pomodoro', title: 'Focus Mode', image: '/assets/keshi-pomodoro/focus_mode.png' },
    { id: 'zucchini-review', title: 'Community', image: '/assets/previews/zucchini-review.jpg' },
    { id: 'decrypt-password', title: 'Game Manual', image: '/assets/previews/decrypt-manual.jpg' },
    { id: 'zucchini-review', title: 'Registration', image: '/assets/previews/zucchini-register.jpg' },
    { id: 'decrypt-password', title: 'Select Mode', image: '/assets/previews/decrypt-select-mode.jpg' },
];

const planeVertex = /* glsl */ `
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uBendH;
uniform float uBendV;
uniform float uTime;
uniform float uPhase;
varying vec2 vUv;
varying float vDepth;
void main() {
    vUv = uv;
    vec3 pos = position;
    float archX = position.x * position.x;
    float archY = position.y * position.y;
    pos.z -= archX * uBendH + archY * uBendV;
    pos.z += sin((uv.y + uPhase) * 5.2 + uTime * 0.72) * 0.018;
    vec4 view = modelViewMatrix * vec4(pos, 1.0);
    vDepth = -view.z;
    gl_Position = projectionMatrix * view;
}`;

const planeFragment = /* glsl */ `
precision highp float;
uniform sampler2D tMap;
uniform float uLoaded;
uniform float uImageAspect;
uniform float uPlaneAspect;
uniform float uHover;
uniform float uRowOpacity;
uniform float uSceneOpacity;
uniform float uCardReveal;
varying vec2 vUv;
varying float vDepth;
void main() {
    vec2 uv = vUv;
    if (!gl_FrontFacing) uv.x = 1.0 - uv.x;
    if (uImageAspect > uPlaneAspect) uv.x = (uv.x - .5) * uPlaneAspect / uImageAspect + .5;
    else uv.y = (uv.y - .5) * uImageAspect / uPlaneAspect + .5;
    vec3 image = texture2D(tMap, uv).rgb;
    vec3 placeholder = mix(vec3(.055,.018,.022), vec3(.34,.055,.06), vUv.y);
    vec3 color = mix(placeholder, image, uLoaded);
    float lum = dot(color, vec3(.299,.587,.114));
    color = mix(vec3(lum), color, .88 + uHover * .12);
    gl_FragColor = vec4(color, uRowOpacity * uSceneOpacity * uCardReveal);
}`;

const sculptureVertex = /* glsl */ `
attribute vec3 position;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
varying vec3 vPosition;
varying vec3 vNormal;
void main(){
 vec3 pos=position;
 float angle=atan(pos.y,pos.x);
 float c=cos(angle);
 float s=sin(angle);
 float squircle=pow(pow(abs(c),4.0)+pow(abs(s),4.0),-.25);
 float radius=length(pos.xy)*mix(1.0,squircle,.34);
 pos.xy=normalize(pos.xy)*radius;
 vec4 view=modelViewMatrix*vec4(pos,1.);
 vPosition=view.xyz;
 vNormal=normalize(normalMatrix*normal);
 gl_Position=projectionMatrix*view;
}`;

const sculptureFragment = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vPosition;
uniform float uTime;
uniform float uOpacity;
void main(){
 vec3 n=normalize(vNormal);
 vec3 viewDir=normalize(-vPosition);
 vec3 lightDir=normalize(vec3(-.45,.72,.9));
 float diffuse=.24+.76*max(dot(n,lightDir),0.);
 float fresnel=pow(1.-max(dot(n,viewDir),0.),2.6);
 float specular=pow(max(dot(reflect(-lightDir,n),viewDir),0.),34.);
 float movingBand=.5+.5*sin((n.x*3.8+n.y*7.2+n.z*2.4)+uTime*.72);
 vec3 graphite=vec3(.07,.075,.075);
 vec3 silver=vec3(.72,.74,.73);
 vec3 pearl=vec3(.96,.93,.86);
 vec3 color=mix(graphite,silver,diffuse);
 color=mix(color,pearl,movingBand*.2+specular*.72);
 color+=fresnel*vec3(.25,.21,.18);
 color+=pow(max(-n.y,0.),2.)*vec3(.18,.018,.014);
 gl_FragColor=vec4(color,uOpacity);
}`;

const gridVertex = /* glsl */ `
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec3 vGridPosition;
varying float vViewDepth;
void main(){
 vec4 view=modelViewMatrix*vec4(position,1.);
 vGridPosition=position;
 vViewDepth=-view.z;
 gl_Position=projectionMatrix*view;
}`;

const gridFragment = /* glsl */ `
precision highp float;
uniform float uOpacity;
varying vec3 vGridPosition;
varying float vViewDepth;
void main(){
 float side=smoothstep(.08,.96,abs(vGridPosition.x)/13.);
 float distanceShade=smoothstep(4.,24.,vViewDepth);
 float heightShade=smoothstep(.35,1.,abs(vGridPosition.y)/10.);
 float centerLight=exp(-pow((vGridPosition.x/13.+.12)*2.8,2.));
 float shade=.74+side*.24+distanceShade*.08+heightShade*.05-centerLight*.1;
 gl_FragColor=vec4(0.,0.,0.,uOpacity*clamp(shade,.62,1.));
}`;

const GalleryScene = ({ mode = 'gallery', showContent = true, contentExitMs = 500, active = true }) => {
    const hostRef = useRef(null);
    const navigate = useNavigate();
    const modeRef = useRef(mode);
    const showContentRef = useRef(showContent);
    const contentExitMsRef = useRef(contentExitMs);
    const activeRef = useRef(active);
    const syncLoopRef = useRef(null);
    const labelRef = useRef(null);

    const setLabelText = (text) => {
        const el = labelRef.current;
        if (!el) return;
        if (el.textContent !== text) el.textContent = text;
    };

    const setLabelVisible = (visible) => {
        const el = labelRef.current;
        if (!el) return;
        el.classList.toggle('is-visible', Boolean(visible));
    };

    useEffect(() => {
        modeRef.current = mode;
    }, [mode]);

    useEffect(() => {
        showContentRef.current = showContent;
        contentExitMsRef.current = contentExitMs;
    }, [showContent, contentExitMs]);

    useEffect(() => {
        activeRef.current = active;
        syncLoopRef.current?.();
    }, [active]);

    useEffect(() => {
        const host = hostRef.current;
        if (!host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
        let disposed = false;
        let cleanup = () => {};

        const init = async () => {
            const { Camera, Geometry, Mesh, Plane, Program, Raycast, Renderer, Texture, Torus, Transform } = await import('ogl');
            if (disposed || !hostRef.current) return;

            const renderer = new Renderer({
                alpha: true,
                antialias: true,
                dpr: Math.min(window.devicePixelRatio || 1, 1.25),
                powerPreference: 'high-performance',
            });
            const gl = renderer.gl;
            gl.clearColor(0, 0, 0, 0);
            gl.canvas.className = 'gallery-webgl';
            host.appendChild(gl.canvas);

            const camera = new Camera(gl, { fov: 40, near: 0.1, far: 60 });
            camera.position.set(0, 0, 9.6);
            camera.lookAt([0, 0, 0]);
            const scene = new Transform();
            const gallery = new Transform();
            gallery.setParent(scene);
            const planeWidth = 2.35 * 0.78;
            const planeHeight = 1.52 * 0.78;
            const geometry = new Plane(gl, { width: planeWidth, height: planeHeight, widthSegments: 18, heightSegments: 10 });
            const placeholder = new Texture(gl, { image: new Uint8Array([34, 7, 10, 255]), width: 1, height: 1, generateMipmaps: false, flipY: false });
            const textureCache = new Map();
            const uploadQueue = [];
            const imageBitmaps = [];
            const rows = [];
            const meshes = [];
            const frameUniforms = {
                bendH: 0,
                bendV: 0,
                sceneOpacity: 0,
                contentOpacity: showContentRef.current ? 1 : 0,
                time: 0,
            };
            let contentExitStart = showContentRef.current ? null : 0;
            let contentEnterStart = null;
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

            const getTexture = (source) => {
                if (textureCache.has(source)) return textureCache.get(source);
                const texture = new Texture(gl, { generateMipmaps: false, flipY: true });
                const record = { texture, loaded: false, queued: false, pendingImage: null, aspect: 1 };
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
                    let decodedImage = image;
                    const maxTextureWidth = 1024;
                    if (image.naturalWidth > maxTextureWidth && 'createImageBitmap' in window) {
                        const scale = maxTextureWidth / image.naturalWidth;
                        try {
                            decodedImage = await createImageBitmap(image, {
                                resizeWidth: maxTextureWidth,
                                resizeHeight: Math.max(1, Math.round(image.naturalHeight * scale)),
                                resizeQuality: 'high',
                            });
                            imageBitmaps.push(decodedImage);
                        } catch {
                            decodedImage = image;
                        }
                    }
                    if (disposed) {
                        decodedImage.close?.();
                        return;
                    }
                    record.pendingImage = decodedImage;
                    record.aspect = decodedImage.width / Math.max(decodedImage.height, 1);
                    if (!record.queued) {
                        record.queued = true;
                        uploadQueue.push(record);
                    }
                };
                image.src = source;
                return record;
            };

            for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
                const row = new Transform();
                row.userData = { opacity: 1 };
                row.position.y = (rowIndex - 1) * rowSpacing;
                row.setParent(gallery);
                rows.push(row);
                for (let index = 0; index < perRow; index += 1) {
                    const project = projectMedia[(index + rowIndex * 3) % projectMedia.length];
                    const resource = getTexture(project.image);
                    const mesh = new Mesh(gl, { geometry, program: planeProgram });
                    const theta = ((index + rowIndex * 0.5) / perRow) * Math.PI * 2;
                    mesh.position.set(Math.cos(theta) * radius, 0, Math.sin(theta) * radius);
                    mesh.rotation.y = -(theta - Math.PI / 2);
                    mesh.userData = {
                        project,
                        resource,
                        hover: 0,
                        reveal: 0,
                        exit: 1,
                        revealDelay: Math.floor((rowIndex * perRow + index) / 2) * 0.1,
                        exitDelay: Math.floor((rowIndex * perRow + index) / 2) * 0.018,
                        row,
                        phase: Math.random() * Math.PI * 2,
                    };
                    mesh.onBeforeRender(() => {
                        const uniforms = planeProgram.uniforms;
                        uniforms.tMap.value = resource.loaded ? resource.texture : placeholder;
                        uniforms.uLoaded.value = resource.loaded ? 1 : 0;
                        uniforms.uImageAspect.value = resource.aspect;
                        uniforms.uBendH.value = frameUniforms.bendH;
                        uniforms.uBendV.value = frameUniforms.bendV;
                        uniforms.uHover.value = mesh.userData.hover;
                        uniforms.uRowOpacity.value = row.userData.opacity;
                        uniforms.uSceneOpacity.value = frameUniforms.sceneOpacity * frameUniforms.contentOpacity;
                        uniforms.uCardReveal.value = mesh.userData.reveal * mesh.userData.exit;
                        uniforms.uTime.value = frameUniforms.time;
                        uniforms.uPhase.value = mesh.userData.phase;
                    });
                    mesh.setParent(row);
                    meshes.push(mesh);
                }
            }

            // Triangle ribbons keep the grid thinner than the 1px minimum supported by WebGL lines.
            const gridVertices = [];
            const gridRadius = 13;
            const gridHalfHeight = 10;
            const gridLineWidth = 0.012;
            const verticalLines = 80;
            const horizontalRings = 18;
            const ringSegments = 200;
            const addQuad = (a, b, c, d) => {
                gridVertices.push(...a, ...b, ...c, ...a, ...c, ...d);
            };
            for (let index = 0; index < verticalLines; index += 1) {
                const angle = (index / verticalLines) * Math.PI * 2;
                const halfAngle = gridLineWidth / (2 * gridRadius);
                const left = angle - halfAngle;
                const right = angle + halfAngle;
                const bottomLeft = [Math.cos(left) * gridRadius, -gridHalfHeight, Math.sin(left) * gridRadius];
                const topLeft = [Math.cos(left) * gridRadius, gridHalfHeight, Math.sin(left) * gridRadius];
                const topRight = [Math.cos(right) * gridRadius, gridHalfHeight, Math.sin(right) * gridRadius];
                const bottomRight = [Math.cos(right) * gridRadius, -gridHalfHeight, Math.sin(right) * gridRadius];
                addQuad(bottomLeft, topLeft, topRight, bottomRight);
            }
            for (let ring = 0; ring <= horizontalRings; ring += 1) {
                const y = -gridHalfHeight + (ring / horizontalRings) * gridHalfHeight * 2;
                const halfHeight = gridLineWidth / 2;
                for (let segment = 0; segment < ringSegments; segment += 1) {
                    const a = (segment / ringSegments) * Math.PI * 2;
                    const b = ((segment + 1) / ringSegments) * Math.PI * 2;
                    const startBottom = [Math.cos(a) * gridRadius, y - halfHeight, Math.sin(a) * gridRadius];
                    const endBottom = [Math.cos(b) * gridRadius, y - halfHeight, Math.sin(b) * gridRadius];
                    const endTop = [Math.cos(b) * gridRadius, y + halfHeight, Math.sin(b) * gridRadius];
                    const startTop = [Math.cos(a) * gridRadius, y + halfHeight, Math.sin(a) * gridRadius];
                    addQuad(startBottom, endBottom, endTop, startTop);
                }
            }
            const gridGeometry = new Geometry(gl, { position: { size: 3, data: new Float32Array(gridVertices) } });
            const gridProgram = new Program(gl, {
                vertex: gridVertex,
                fragment: gridFragment,
                transparent: true,
                cullFace: null,
                depthTest: true,
                depthWrite: false,
                uniforms: { uOpacity: { value: 0 } },
            });
            const cylinderGrid = new Mesh(gl, { geometry: gridGeometry, program: gridProgram, mode: gl.TRIANGLES });
            cylinderGrid.renderOrder = -10;
            cylinderGrid.setParent(scene);

            const sculpture = new Transform();
            sculpture.position.z = 1.35;
            sculpture.setParent(scene);
            const torusGeometry = new Torus(gl, { radius: 1.02, tube: 0.105, radialSegments: 10, tubularSegments: 48 });
            const sculptureProgram = new Program(gl, {
                vertex: sculptureVertex,
                fragment: sculptureFragment,
                cullFace: null,
                transparent: true,
                uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 } },
            });
            const torusMeshes = [0, 1, 2].map((index) => {
                const mesh = new Mesh(gl, { geometry: torusGeometry, program: sculptureProgram });
                mesh.scale.set(1 + index * 0.22);
                mesh.rotation.x = index * 0.82;
                mesh.rotation.y = index * 0.54;
                mesh.setParent(sculpture);
                return mesh;
            });

            const raycast = new Raycast();
            const pointer = { x: 0, y: 0, clientX: 0, clientY: 0, active: false };
            const labelEl = labelRef.current;
            const labelPos = { x: 0, y: 0, targetX: 0, targetY: 0, seeded: false };
            const LABEL_OFFSET_X = 18;
            const LABEL_OFFSET_Y = 22;
            // Device-aware viscous scroll: mouse wheel, trackpad pixel deltas, and touch drag.
            const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
            const drag = {
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
            let hovered = null;
            let raf = 0;
            // Loop gate: document visibility + explicit active prop (not host.isConnected).
            let previousTime = performance.now();
            // Every entry path waits for the shared Loader's portfolio:reveal-start.
            // Only snap if the loader already finished before this host mounted.
            let revealStart = null;
            let revealComplete = false;
            let snapRevealAtMount = false;
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
                setLabelText('Scroll to explore');
            };
            // Content interactivity is driven by showContent, not only route mode.
            const isInteractive = () => showContentRef.current && modeRef.current === 'gallery';
            const canRunLoop = () => !disposed && !document.hidden && Boolean(activeRef.current);
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
            const beginContentExit = (durationMs) => {
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
            const onRoomContentExit = (event) => {
                beginContentExit(Number(event?.detail?.durationMs) || contentExitMsRef.current || 500);
            };
            const onRoomContentEnter = () => {
                if (!showContentRef.current) return;
                contentEnterStart = performance.now();
                contentExitStart = null;
            };

            const resize = () => {
                const width = Math.max(host.clientWidth || window.innerWidth, 1);
                const height = Math.max(host.clientHeight || window.innerHeight, 1);
                // Prefer visualViewport on mobile browser chrome changes.
                const vv = window.visualViewport;
                const renderWidth = vv ? Math.max(width, Math.round(vv.width)) : width;
                const renderHeight = vv ? Math.max(height, Math.round(vv.height)) : height;
                renderer.setSize(renderWidth, renderHeight);
                camera.perspective({ aspect: renderWidth / Math.max(renderHeight, 1) });

                // Scale gallery density a bit on short/narrow viewports.
                const compact = renderWidth < 760 || renderHeight < 700;
                rows.forEach((row, rowIndex) => {
                    if (!row.userData.baseY) row.userData.baseY = (rowIndex - 1) * rowSpacing;
                    // Keep existing y scroll offset while changing spacing feel via opacity falloff only.
                    row.userData.compact = compact;
                });
            };

            const normalizeWheelDelta = (event) => {
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

            const applyScrollImpulse = (pixelDelta, source = 'wheel') => {
                if (!Number.isFinite(pixelDelta) || pixelDelta === 0) return;
                const yGain = source === 'touch' ? TOUCH_SCROLL_GAIN : SCROLL_Y_GAIN;
                const spinGain = source === 'touch' ? TOUCH_SPIN_GAIN : SPIN_GAIN;
                motion.targetY -= pixelDelta * yGain;
                motion.targetSpin = Math.max(
                    -SPIN_TARGET_MAX,
                    Math.min(SPIN_TARGET_MAX, motion.targetSpin + pixelDelta * spinGain),
                );
            };

            const updatePointerFromEvent = (event, { forHover = true } = {}) => {
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
                    labelEl.style.transform = `translate3d(${labelPos.x}px, ${labelPos.y}px, 0)`;
                }

                // Subtle camera parallax only for fine pointers; avoid jumpiness on touch.
                if (finePointer && !drag.active) {
                    camera.position.x += ((event.clientX / window.innerWidth - 0.5) * 0.24 - camera.position.x) * 0.08;
                    camera.position.y += ((0.5 - event.clientY / window.innerHeight) * 0.18 - camera.position.y) * 0.08;
                    camera.lookAt([0, 0, 0]);
                }
            };

            const onWheel = (event) => {
                if (!isInteractive()) return;
                // Always consume wheel while gallery is interactive so trackpad/mouse
                // never scroll the locked home document underneath.
                event.preventDefault();
                event.stopPropagation();
                applyScrollImpulse(normalizeWheelDelta(event), 'wheel');
            };

            const endDrag = (event) => {
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

            const onPointerDown = (event) => {
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

            const onPointerMove = (event) => {
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

            const onPointerUp = (event) => {
                endDrag(event);
            };

            const onPointerCancel = (event) => {
                endDrag(event);
                clearHover();
            };

            const onPointerLeave = (event) => {
                // Don't clear mid-drag when pointer briefly leaves canvas bounds.
                if (drag.active) return;
                if (event.pointerType === 'touch') return;
                clearHover();
            };

            const onClick = (event) => {
                if (!isInteractive()) return;
                if (drag.suppressClick) {
                    drag.suppressClick = false;
                    event.preventDefault?.();
                    return;
                }
                if (hovered?.userData?.project) navigate(`/project/${hovered.userData.project.id}`);
            };

            // Keyboard fallback (a11y / no-trackpad): arrows + page keys.
            const onKeyDown = (event) => {
                if (!isInteractive()) return;
                const tag = (event.target?.tagName || '').toLowerCase();
                if (tag === 'input' || tag === 'textarea' || event.target?.isContentEditable) return;
                const map = {
                    ArrowDown: 90,
                    ArrowUp: -90,
                    PageDown: 180,
                    PageUp: -180,
                    ' ': 120,
                };
                if (!(event.key in map)) return;
                event.preventDefault();
                applyScrollImpulse(map[event.key] * (event.shiftKey ? 1.45 : 1), 'wheel');
            };

            const render = (time) => {
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
                const smoothstep = (value) => {
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
                sculpture.rotation.y = -motion.spin * 2;
                sculpture.rotation.x = Math.sin(time * 0.00024) * 0.16;
                cylinderGrid.rotation.y = motion.spin * 0.09 + Math.sin(time * 0.00008) * 0.012;
                const revealElapsed = revealStart === null ? 0 : Math.max(0, (time - revealStart) / 1000);
                const smooth = (value) => {
                    const clamped = Math.max(0, Math.min(1, value));
                    return clamped * clamped * (3 - 2 * clamped);
                };
                // Snap only when the host mounted after boot loader finished.
                const gridReveal = snapRevealAtMount ? 1 : smooth(revealElapsed / 1.15);
                const sceneReveal = snapRevealAtMount ? 1 : smooth((revealElapsed - 1.45) / 1.05);
                // Grid is permanent stage architecture. Never fade with room content swaps.
                if (gridReveal >= 0.999) revealComplete = true;
                gridProgram.uniforms.uOpacity.value = (revealComplete ? 1 : gridReveal) * 0.814;
                // sceneOpacity only gates card textures; keep it at 1 after first full reveal.
                frameUniforms.sceneOpacity = revealComplete ? 1 : sceneReveal;
                sculptureProgram.uniforms.uTime.value = time * 0.001;
                // Sculpture softens with content fade so Experience stays readable.
                const sculpturePresence = 0.14 + frameUniforms.contentOpacity * 0.86;
                sculptureProgram.uniforms.uOpacity.value = sceneReveal * sculpturePresence;
                torusMeshes.forEach((mesh, index) => { mesh.rotation.z += dt * (0.16 + index * 0.06); });
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
                    mesh.scale.set(scale);
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
                    const next = raycast.intersectBounds(meshes)[0] || null;
                    if (next !== hovered) {
                        hovered = next;
                        gl.canvas.classList.toggle('is-hovering', Boolean(hovered));
                        setLabelVisible(Boolean(hovered));
                        setLabelText(hovered?.userData?.project?.title || 'Scroll to explore');
                    }
                }

                if (labelEl && labelPos.seeded) {
                    // Soft lag so the glass pill feels tracked, not glued.
                    const follow = 1 - Math.exp(-14 * dt);
                    labelPos.x += (labelPos.targetX - labelPos.x) * follow;
                    labelPos.y += (labelPos.targetY - labelPos.y) * follow;
                    labelEl.style.transform = `translate3d(${labelPos.x}px, ${labelPos.y}px, 0)`;
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
            document.addEventListener('visibilitychange', onVisibility);
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
                imageBitmaps.forEach((bitmap) => bitmap.close?.());
                gl.deleteTexture(placeholder.texture);
                geometry.remove(); gridGeometry.remove(); gridProgram.remove(); torusGeometry.remove(); sculptureProgram.remove();
                gl.canvas.remove(); gl.getExtension('WEBGL_lose_context')?.loseContext();
            };
        };

        init().catch((error) => console.warn('Gallery WebGL unavailable.', error));
        return () => { disposed = true; cleanup(); };
    }, [navigate]);

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
            >
                Scroll to explore
            </span>
        </div>
    );
};

export default GalleryScene;

