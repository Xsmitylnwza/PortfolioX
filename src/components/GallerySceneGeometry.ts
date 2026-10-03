import { gridVertex, gridFragment, sculptureVertex, sculptureFragment } from './GallerySceneShaders';
import { createSculptureMeshData, SCULPTURE_PLACEMENT } from './GallerySculptureGeometry';
import type { Geometry, Mesh, Program, Renderer, Transform } from 'ogl';
type OGLRenderingContext = Renderer['gl'];

interface GeometryConstructors {
    Geometry: typeof Geometry;
    Mesh: typeof Mesh;
    Program: typeof Program;
    Transform: typeof Transform;
}
export function createGalleryGeometry(gl: OGLRenderingContext, scene: Transform, { Geometry, Mesh, Program, Transform }: GeometryConstructors) {
    // Triangle ribbons keep the grid thinner than the 1px minimum supported by WebGL lines.
    // Slightly wider radius + denser rings for a rounder cylindrical cage.
    const gridVertices: number[] = [];
    const gridRadius = 13.6;
    const gridHalfHeight = 10;
    const gridLineWidth = 0.012;
    const verticalLines = 88;
    const horizontalRings = 20;
    const ringSegments = 240;
    const addQuad = (a: number[], b: number[], c: number[], d: number[]) => {
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
    sculpture.position.z = SCULPTURE_PLACEMENT.z;
    sculpture.scale.set(SCULPTURE_PLACEMENT.scale);
    sculpture.setParent(scene);
    const meshData = createSculptureMeshData();
    const sculptureGeometries = meshData.map(({ positions, normals, indices }) => new Geometry(gl, {
        position: { size: 3, data: positions },
        normal: { size: 3, data: normals },
        index: { data: indices },
    }));
    const sculptureMeshes = meshData.map((data, index) => {
        // Unique program per layer so uLayer can differ while sharing shader source.
        const program = new Program(gl, {
            vertex: sculptureVertex,
            fragment: sculptureFragment,
            // Closed shells include their real underside. Culling inward faces
            // prevents hidden inner triangles from blending during the reveal.
            cullFace: gl.BACK,
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
            geometry: sculptureGeometries[index],
            program,
        });
        mesh.setParent(sculpture);
        return Object.assign(mesh, { userData: {
            phase: data.phase,
            base: { x: 0, y: 0, z: 0 },
            basePosition: { x: 0, y: 0, z: 0 },
            program,
        } });
    });
    return { gridGeometry, gridProgram, cylinderGrid, sculpture, sculptureGeometries, sculptureMeshes };
}
