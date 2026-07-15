import { memo, useEffect, useRef } from 'react';
// Gallery posters: one signature cover per project only (not detail screens).
// The cylinder grid repeats this list so every card stays on-brand when density > count.
const projectMedia = [
    { id: 'projectmux', title: 'ProjectMux', image: '/assets/previews/projectmux-demo.jpg' },
    { id: 'keshi-pomodoro', title: 'Keshi Pomodoro', image: '/assets/previews/keshi-pomodoro-demo.jpg' },
    { id: 'zucchini-review', title: 'Zucchini Review', image: '/assets/previews/zucchini-homepage.jpg' },
    { id: 'decrypt-password', title: 'Decrypt The Secret Password', image: '/assets/previews/decrypt-gameplay.jpg' },
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
uniform float uTime;
uniform float uLayer;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vFacet;
void main(){
  vec3 pos = position;
  float angle = atan(pos.y, pos.x);
  float ring = length(pos.xy) + 1e-5;

  // Hard faceting: quantize ring angle so the torus reads as broken metal plates.
  float facets = mix(7.0, 13.0, fract(uLayer * 0.37));
  float stepped = floor(angle / 6.2831853 * facets + 0.5) / facets * 6.2831853;
  float mixFacet = 0.62 + uLayer * 0.05;
  float facetedAngle = mix(angle, stepped, mixFacet);
  float c = cos(facetedAngle);
  float s = sin(facetedAngle);

  // Squircle + jagged crush so rings feel angular / half-collapsed.
  float squircle = pow(pow(abs(c), 6.0) + pow(abs(s), 6.0), -0.1667);
  float crush = 0.82 + 0.18 * sin(facetedAngle * facets * 0.5 + uLayer * 1.7);
  float dent = 0.07 * sin(facetedAngle * 5.0 + uLayer * 2.1 + uTime * 0.15)
             + 0.04 * sin(pos.z * 18.0 + uLayer);
  float radius = ring * mix(1.0, squircle, 0.55) * crush * (1.0 + dent);
  pos.xy = vec2(c, s) * radius;

  // Axial plate offsets: overlapping broken layers.
  pos.z += 0.035 * sin(facetedAngle * 3.0 + uLayer) + uLayer * 0.012;
  pos *= 1.0 + 0.02 * sin(facetedAngle * 2.0 - uTime * 0.1 + uLayer);

  // Faceted normals: less smooth shading, more hard metal panels.
  vec3 n = normalize(normal);
  n.xy = mix(n.xy, vec2(c, s), 0.55);
  n = normalize(n + 0.18 * vec3(sin(facetedAngle * facets), cos(facetedAngle * facets), 0.2));

  vec4 view = modelViewMatrix * vec4(pos, 1.0);
  vPosition = view.xyz;
  vNormal = normalize(normalMatrix * n);
  vFacet = facetedAngle * facets;
  gl_Position = projectionMatrix * view;
}`;

const sculptureFragment = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vFacet;
uniform float uTime;
uniform float uOpacity;
uniform float uLayer;
void main(){
  vec3 n = normalize(vNormal);
  vec3 viewDir = normalize(-vPosition);

  // Multi-light chrome / brushed silver steel.
  vec3 key = normalize(vec3(-0.55, 0.85, 0.95));
  vec3 fill = normalize(vec3(0.75, 0.15, 0.55));
  vec3 rimL = normalize(vec3(-0.2, -0.35, 1.0));

  float ndotv = max(dot(n, viewDir), 0.0);
  float fresnel = pow(1.0 - ndotv, 3.2);

  float diffKey = max(dot(n, key), 0.0);
  float diffFill = max(dot(n, fill), 0.0) * 0.35;
  float diff = 0.12 + 0.72 * diffKey + diffFill;

  vec3 halfKey = normalize(key + viewDir);
  float specKey = pow(max(dot(n, halfKey), 0.0), 96.0);
  float specSoft = pow(max(dot(n, halfKey), 0.0), 18.0);
  float rim = pow(max(dot(n, rimL), 0.0), 2.0) * fresnel;

  // Micro plate seams + brushed grain on silver metal.
  float seam = smoothstep(0.42, 0.5, abs(fract(vFacet) - 0.5));
  float brush = 0.5 + 0.5 * sin((vPosition.x * 38.0 + vPosition.y * 11.0) + uTime * 0.4);
  float flake = 0.5 + 0.5 * sin(vFacet * 2.7 + uLayer * 4.0);

  // Bright pure silver / polished chrome, little to no graphite.
  vec3 steelDark = vec3(0.34, 0.36, 0.39);
  vec3 steelMid = vec3(0.78, 0.80, 0.84);
  vec3 chrome = vec3(0.96, 0.97, 0.99);
  vec3 highlight = vec3(1.0, 1.0, 1.0);

  vec3 color = mix(steelDark, steelMid, diff);
  color = mix(color, chrome, fresnel * 0.88 + specSoft * 0.48);
  color += highlight * (specKey * 1.15 + rim * 0.55);
  color *= 0.94 + brush * 0.08;
  color *= 0.92 + seam * 0.14;
  color += chrome * flake * 0.06;

  // Force cool bright silver (desaturate warmth).
  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(luma), color, 0.22);
  color = mix(color, chrome, 0.28);
  color = min(color * 1.12, vec3(1.0));

  gl_FragColor = vec4(color, uOpacity);
}`;

const gridVertex = /* glsl */ `
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uScrollWave;
varying vec3 vGridPosition;
varying float vViewDepth;
void main(){
 vec3 pos=position;
 float wave=sin(pos.y*0.42+uTime*0.8)*uScrollWave;
 pos.z+=wave*0.16;
 pos.x*=1.0+wave*0.003;
 vec4 view=modelViewMatrix*vec4(pos,1.);
 vGridPosition=pos;
 vViewDepth=-view.z;
 gl_Position=projectionMatrix*view;
}`;

const gridFragment = /* glsl */ `
precision highp float;
uniform float uOpacity;
varying vec3 vGridPosition;
varying float vViewDepth;
void main(){
  // Radial falloff follows the cylindrical cage so sides feel rounder than flat x-plane shading.
  float radius = length(vGridPosition.xz);
  float side = smoothstep(9.2, 15.0, radius);
  float distanceShade = smoothstep(4.0, 26.0, vViewDepth);
  float heightShade = smoothstep(0.3, 1.0, abs(vGridPosition.y) / 10.0);
  float centerLight = exp(-pow((vGridPosition.x / 14.2 + 0.1) * 2.35, 2.0));
  float shade = 0.78 + side * 0.18 + distanceShade * 0.08 + heightShade * 0.05 - centerLight * 0.08;
  gl_FragColor = vec4(0.0, 0.0, 0.0, uOpacity * clamp(shade, 0.62, 1.0));
}
`;

const GalleryScene = ({ mode = 'gallery', showContent = true, contentExitMs = 500, active = true }) => {
    const hostRef = useRef(null);
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
            // Slightly wider radius + denser rings for a rounder cylindrical cage.
            const gridVertices = [];
            const gridRadius = 13.6;
            const gridHalfHeight = 10;
            const gridLineWidth = 0.012;
            const verticalLines = 88;
            const horizontalRings = 20;
            const ringSegments = 240;
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
                uniforms: {
                    uOpacity: { value: 0 },
                    uTime: { value: 0 },
                    uScrollWave: { value: 0 },
                },
            });
            const cylinderGrid = new Mesh(gl, { geometry: gridGeometry, program: gridProgram, mode: gl.TRIANGLES });
            cylinderGrid.renderOrder = -10;
            cylinderGrid.setParent(scene);

            const sculpture = new Transform();
            sculpture.position.z = 1.45;
            sculpture.scale.set(0.82);
            sculpture.setParent(scene);
            // Doctor Strange-style mandala: nested silver rings (medium size).
            const torusGeometries = [
                new Torus(gl, { radius: 0.52, tube: 0.042, radialSegments: 7, tubularSegments: 48 }),
                new Torus(gl, { radius: 0.62, tube: 0.050, radialSegments: 8, tubularSegments: 52 }),
                new Torus(gl, { radius: 0.72, tube: 0.038, radialSegments: 6, tubularSegments: 46 }),
                new Torus(gl, { radius: 0.82, tube: 0.046, radialSegments: 9, tubularSegments: 54 }),
                new Torus(gl, { radius: 0.92, tube: 0.034, radialSegments: 7, tubularSegments: 44 }),
                new Torus(gl, { radius: 1.02, tube: 0.044, radialSegments: 8, tubularSegments: 50 }),
            ];
            // Each ring owns an independent orbit axis (Strange portal energy).
            const torusLayerConfig = [
                { scale: 0.78, rx: 0.22, ry: 0.10, rz: 0.05, ax: 1, ay: 0.15, az: 0.08, speed: 0.55, z: -0.04, phase: 0.0 },
                { scale: 0.90, rx: 1.05, ry: -0.35, rz: 0.40, ax: 0.2, ay: 1, az: -0.25, speed: -0.72, z: -0.01, phase: 1.1 },
                { scale: 1.00, rx: -0.70, ry: 0.95, rz: -0.20, ax: -0.35, ay: 0.4, az: 1, speed: 0.48, z: 0.03, phase: 2.3 },
                { scale: 1.12, rx: 0.40, ry: 1.25, rz: 0.85, ax: 0.75, ay: -0.55, az: 0.35, speed: -0.63, z: 0.00, phase: 0.7 },
                { scale: 1.24, rx: -1.10, ry: -0.45, rz: 0.55, ax: -0.15, ay: 0.9, az: 0.55, speed: 0.81, z: -0.03, phase: 1.9 },
                { scale: 1.36, rx: 0.65, ry: 0.25, rz: -0.95, ax: 0.55, ay: 0.25, az: -0.85, speed: -0.44, z: 0.05, phase: 2.8 },
            ];
            const torusMeshes = torusLayerConfig.map((config, index) => {
                // Unique program per layer so uLayer can differ while sharing shader source.
                const program = new Program(gl, {
                    vertex: sculptureVertex,
                    fragment: sculptureFragment,
                    cullFace: null,
                    transparent: true,
                    depthTest: true,
                    depthWrite: true,
                    uniforms: {
                        uTime: { value: 0 },
                        uOpacity: { value: 0 },
                        uLayer: { value: index },
                    },
                });
                const mesh = new Mesh(gl, {
                    geometry: torusGeometries[index],
                    program,
                });
                mesh.scale.set(config.scale);
                mesh.rotation.x = config.rx;
                mesh.rotation.y = config.ry;
                mesh.rotation.z = config.rz;
                mesh.position.z = config.z;
                mesh.userData = {
                    speed: config.speed,
                    axis: { x: config.ax, y: config.ay, z: config.az },
                    phase: config.phase,
                    base: { x: config.rx, y: config.ry, z: config.rz },
                    program,
                };
                mesh.setParent(sculpture);
                return mesh;
            });

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
                    labelEl.style.transform = `translate3d(${labelPos.x}px, ${labelPos.y}px, 0) translateY(-50%)`;
                }

                // Subtle camera parallax only for fine pointers; avoid jumpiness on touch.
                if (finePointer && !drag.active) {
                    camera.position.x += ((event.clientX / window.innerWidth - 0.5) * 0.24 - camera.position.x) * 0.08;
                    camera.position.y += ((0.5 - event.clientY / window.innerHeight) * 0.18 - camera.position.y) * 0.08;
                    camera.lookAt([0, 0, 0]);
                }
            };

            const pickMeshAtEvent = (event) => {
                updatePointerFromEvent(event, { forHover: false });
                raycast.castMouse(camera, [pointer.x, pointer.y]);
                return raycast.intersectBounds(meshes)[0] || null;
            };

            const selectProject = (mesh) => {
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
                selectProject(hovered || pickMeshAtEvent(event));
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
                // Whole mandala drifts with scroll, while each ring free-orbits on its own axis.
                sculpture.rotation.y = -motion.spin * 0.85 + Math.sin(time * 0.00019) * 0.18;
                sculpture.rotation.x = Math.sin(time * 0.00013) * 0.28 + Math.cos(time * 0.00009) * 0.08;
                sculpture.rotation.z = Math.sin(time * 0.00011 + 1.2) * 0.16;
                cylinderGrid.rotation.y = motion.spin * 0.11 + Math.sin(time * 0.00008) * 0.016;
                const revealElapsed = revealStart === null ? 0 : Math.max(0, (time - revealStart) / 1000);
                const smooth = (value) => {
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
    }, []);

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

