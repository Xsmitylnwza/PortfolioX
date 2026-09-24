import { gridVertex, gridFragment, sculptureVertex, sculptureFragment } from './GallerySceneShaders.js';

export function createGalleryGeometry(gl, scene, { Geometry, Mesh, Program, Torus, Transform }) {
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
    return { gridGeometry, gridProgram, cylinderGrid, sculpture, torusGeometries, torusMeshes };
}
