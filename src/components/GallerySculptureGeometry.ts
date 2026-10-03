type Vector3 = readonly [number, number, number];

export interface SculptureMeshData {
    name: string;
    positions: Float32Array;
    normals: Float32Array;
    indices: Uint16Array;
    phase: number;
}

export const SCULPTURE_PLACEMENT = { scale: 0.82, z: 1.45 } as const;

interface FoldedRibbon {
    name: string;
    outerPath: readonly Vector3[];
    innerPath: readonly Vector3[];
    cup: number;
    curl: number;
    phase: number;
}

// Authored asymmetric sweeps, not a repeated radial petal or torus primitive.
// The lower sweep winds across the foreground; each overlapping fold climbs
// toward the single leaning upper face. The gaps are empty 3D space.
const RIBBONS: readonly FoldedRibbon[] = [
    {
        name: 'Lower winding fold',
        outerPath: [[-0.12, 0.12, 0.16], [-0.75, -0.23, 0.35], [-0.86, -0.65, 0.49], [-0.43, -0.96, 0.52], [0.27, -0.98, 0.3], [0.81, -0.65, 0.13]],
        innerPath: [[0.04, -0.04, 0.14], [-0.16, -0.12, 0.34], [-0.24, -0.22, 0.45], [0.08, -0.34, 0.44], [0.43, -0.42, 0.24], [0.77, -0.56, 0.09]],
        cup: 0.075, curl: -0.035, phase: 0,
    },
    {
        name: 'Left returning fold',
        outerPath: [[-0.1, 0.01, -0.16], [-0.78, -0.01, -0.02], [-1, 0.28, -0.09], [-0.86, 0.62, -0.23], [-0.48, 0.64, -0.39], [-0.16, 0.15, -0.3]],
        innerPath: [[0.04, 0.08, -0.11], [-0.27, 0.16, 0.12], [-0.48, 0.28, 0.15], [-0.52, 0.39, 0.08], [-0.23, 0.3, 0.02], [-0.08, 0.12, -0.17]],
        cup: 0.115, curl: 0.045, phase: 1.2,
    },
    {
        name: 'Right opening fold',
        outerPath: [[0.07, -0.02, -0.2], [0.46, -0.06, -0.22], [0.99, 0.16, -0.1], [1.01, 0.5, 0.02], [0.7, 0.69, 0.1], [0.2, 0.14, 0.12]],
        innerPath: [[0.01, 0.06, -0.13], [0.22, 0.18, -0.02], [0.5, 0.28, 0.18], [0.88, 0.29, 0.3], [0.77, 0.4, 0.35], [0.32, 0.04, 0.28]],
        cup: 0.085, curl: -0.025, phase: 2.4,
    },
    {
        name: 'Rising upper fold',
        outerPath: [[-0.11, 0.03, -0.35], [-0.21, 0.44, -0.49], [-0.13, 0.87, -0.5], [0.26, 1.16, -0.45], [0.88, 1.3, -0.36]],
        innerPath: [[0.06, 0.09, -0.29], [0.18, 0.33, -0.25], [0.46, 0.65, -0.18], [0.77, 0.95, -0.25], [0.98, 1.24, -0.32]],
        cup: 0.11, curl: 0.035, phase: 3.6,
    },
    {
        name: 'Inner bridging fold',
        outerPath: [[-0.12, -0.24, 0.18], [0.23, -0.25, 0.39], [0.45, 0.04, 0.47], [0.1, 0.26, 0.38], [-0.19, 0.19, 0.1]],
        innerPath: [[0.03, -0.13, 0.2], [0.17, -0.04, 0.24], [0.21, 0.07, 0.3], [0.03, 0.11, 0.18], [-0.08, 0.06, 0.18]],
        cup: 0.02, curl: -0.01, phase: 4.8,
    },
];

// Smooth along each sweep, flat across it: three crisp facets per face read as
// folded sheet metal without breaking reflections into a checkerboard.
const LENGTH_SEGMENTS = 64;
const FACE_SEGMENTS = 3;
const BEVEL_SEGMENTS = 2;
const HALF_THICKNESS = 0.034;
const BEVEL_WIDTH = 0.03;
// Pushes the authored folds further apart in depth so the overlap reads in 3D.
const DEPTH_STRETCH = 1.3;
const SAMPLE_STEP = 0.0001;

const add = (a: Vector3, b: Vector3): Vector3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const subtract = (a: Vector3, b: Vector3): Vector3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const multiply = (v: Vector3, scale: number): Vector3 => [v[0] * scale, v[1] * scale, v[2] * scale];
const dot = (a: Vector3, b: Vector3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vector3, b: Vector3): Vector3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const normalize = (v: Vector3): Vector3 => multiply(v, 1 / Math.max(Math.hypot(...v), 1e-12));

function pathPoint(source: readonly Vector3[], t: number): Vector3 {
    const path = source.map(([x, y, z]): Vector3 => [x, y, z * DEPTH_STRETCH]);
    const progress = Math.max(0, Math.min(1, t)) * (path.length - 1);
    const segment = Math.min(Math.floor(progress), path.length - 2);
    const u = progress - segment;
    const a = path[segment];
    const b = path[segment + 1];
    const before = path[segment - 1] ?? subtract(multiply(a, 2), b);
    const after = path[segment + 2] ?? subtract(multiply(b, 2), a);
    // Interpolating cubic Hermite with a restrained tangent keeps the folds
    // broad and avoids overshooting sharp hooks at the path's turning points.
    const startTangent = multiply(subtract(b, before), 0.42);
    const endTangent = multiply(subtract(after, a), 0.42);
    const u2 = u * u;
    const u3 = u2 * u;
    return add(add(multiply(a, 2 * u3 - 3 * u2 + 1), multiply(b, -2 * u3 + 3 * u2)),
        add(multiply(startTangent, u3 - 2 * u2 + u), multiply(endTangent, u3 - u2)));
}

function ribbonFrame(ribbon: FoldedRibbon, t: number) {
    const outer = pathPoint(ribbon.outerPath, t);
    const inner = pathPoint(ribbon.innerPath, t);
    const center = multiply(add(outer, inner), 0.5);
    const width = subtract(inner, outer);
    const widthAxis = normalize(width);
    const normalAxis = normalize(subtract([0, 0, 1], multiply(widthAxis, widthAxis[2])));
    const halfWidth = Math.hypot(...width) / 2;
    return { center, widthAxis, normalAxis, halfWidth };
}

function sheetPoint(ribbon: FoldedRibbon, t: number, across: number): Vector3 {
    const frame = ribbonFrame(ribbon, t);
    const s = across / frame.halfWidth;
    const fold = (ribbon.cup * s * s + ribbon.curl * s * s * s) * (0.45 + 0.55 * Math.sin(Math.PI * t));
    return add(frame.center, add(multiply(frame.widthAxis, across), multiply(frame.normalAxis, fold)));
}

function sheetNormal(ribbon: FoldedRibbon, t: number, across: number): Vector3 {
    const along = subtract(sheetPoint(ribbon, Math.min(1, t + SAMPLE_STEP), across), sheetPoint(ribbon, Math.max(0, t - SAMPLE_STEP), across));
    const lateral = subtract(sheetPoint(ribbon, t, across + SAMPLE_STEP), sheetPoint(ribbon, t, across - SAMPLE_STEP));
    return normalize(cross(along, lateral));
}

// A chamfered rectangular section: four samples per broad face and one hard
// apex on each side, giving a faceted blade edge rather than a rounded one.
function ribbonSection(halfWidth: number): readonly [number, number][] {
    const section: [number, number][] = [];
    const faceWidth = halfWidth - BEVEL_WIDTH;
    for (let i = 0; i <= FACE_SEGMENTS; i += 1) section.push([-faceWidth + 2 * faceWidth * i / FACE_SEGMENTS, HALF_THICKNESS]);
    for (let i = 1; i < BEVEL_SEGMENTS; i += 1) {
        const angle = Math.PI / 2 - Math.PI * i / BEVEL_SEGMENTS;
        section.push([faceWidth + BEVEL_WIDTH * Math.cos(angle), HALF_THICKNESS * Math.sin(angle)]);
    }
    for (let i = 0; i <= FACE_SEGMENTS; i += 1) section.push([faceWidth - 2 * faceWidth * i / FACE_SEGMENTS, -HALF_THICKNESS]);
    for (let i = 1; i < BEVEL_SEGMENTS; i += 1) {
        const angle = -Math.PI / 2 - Math.PI * i / BEVEL_SEGMENTS;
        section.push([-faceWidth + BEVEL_WIDTH * Math.cos(angle), HALF_THICKNESS * Math.sin(angle)]);
    }
    return section;
}

function capTriangles(points: readonly (readonly [number, number])[], offset: number, reverse: boolean): number[] {
    const remaining = points.map((_, index) => index);
    const triangles: number[] = [];
    const turn = (a: number, b: number, c: number) => (points[b][0] - points[a][0]) * (points[c][1] - points[a][1]) - (points[b][1] - points[a][1]) * (points[c][0] - points[a][0]);
    const area = points.reduce((sum, point, index) => {
        const next = points[(index + 1) % points.length];
        return sum + point[0] * next[1] - next[0] * point[1];
    }, 0);
    const direction = Math.sign(area);
    while (remaining.length > 3) {
        const ear = remaining.findIndex((b, index) => {
            const a = remaining[(index + remaining.length - 1) % remaining.length];
            const c = remaining[(index + 1) % remaining.length];
            if (turn(a, b, c) * direction <= 1e-12) return false;
            return !remaining.some((point) => point !== a && point !== b && point !== c
                && turn(a, b, point) * direction >= -1e-12
                && turn(b, c, point) * direction >= -1e-12
                && turn(c, a, point) * direction >= -1e-12);
        });
        if (ear < 0) throw new Error('Sculpture end cap cannot be triangulated.');
        triangles.push(remaining[(ear + remaining.length - 1) % remaining.length], remaining[ear], remaining[(ear + 1) % remaining.length]);
        remaining.splice(ear, 1);
    }
    triangles.push(...remaining);
    if (reverse) for (let i = 0; i < triangles.length; i += 3) [triangles[i + 1], triangles[i + 2]] = [triangles[i + 2], triangles[i + 1]];
    return triangles.map((index) => index + offset);
}

function buildRibbon(ribbon: FoldedRibbon): SculptureMeshData {
    const rings: Vector3[][] = [];
    const caps: [number, number][][] = [];
    for (let i = 0; i <= LENGTH_SEGMENTS; i += 1) {
        const t = i / LENGTH_SEGMENTS;
        const frame = ribbonFrame(ribbon, t);
        const ring = ribbonSection(frame.halfWidth).map(([across, thickness]) =>
            add(sheetPoint(ribbon, t, across), multiply(sheetNormal(ribbon, t, across), thickness)));
        rings.push(ring);
        if (i === 0 || i === LENGTH_SEGMENTS) caps.push(ring.map((position) => {
            const relative = subtract(position, frame.center);
            return [dot(relative, frame.widthAxis), dot(relative, frame.normalAxis)];
        }));
    }
    const ringSize = rings[0].length;
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    const pushVertex = (position: Vector3, normal: Vector3) => {
        positions.push(...position);
        normals.push(...normal);
        return positions.length / 3 - 1;
    };
    // Each facet strip owns its vertices: its normal is flat across the section
    // (hard creases between facets) but follows the sweep along its length.
    const facetNormal = (i: number, j: number) => {
        const next = (j + 1) % ringSize;
        const ahead = Math.min(LENGTH_SEGMENTS, i + 1);
        const behind = Math.max(0, i - 1);
        const along = subtract(add(rings[ahead][j], rings[ahead][next]), add(rings[behind][j], rings[behind][next]));
        return normalize(cross(along, subtract(rings[i][next], rings[i][j])));
    };
    for (let i = 0; i < LENGTH_SEGMENTS; i += 1) {
        for (let j = 0; j < ringSize; j += 1) {
            const next = (j + 1) % ringSize;
            const start = facetNormal(i, j);
            const end = facetNormal(i + 1, j);
            const quad: [Vector3, Vector3][] = [[rings[i][j], start], [rings[i + 1][j], end], [rings[i + 1][next], end], [rings[i][next], start]];
            for (const triangle of [[0, 1, 2], [0, 2, 3]]) {
                const [a, b, c] = triangle.map((corner) => quad[corner][0]);
                const face = normalize(cross(subtract(b, a), subtract(c, a)));
                // Where a tight fold turns the sweep sharply, fall back to the face normal.
                for (const corner of triangle) {
                    const [position, normal] = quad[corner];
                    indices.push(pushVertex(position, dot(normal, face) > 0.3 ? normal : face));
                }
            }
        }
    }
    for (let cap = 0; cap < 2; cap += 1) {
        const frame = ribbonFrame(ribbon, cap);
        const area = caps[cap].reduce((sum, point, index) => {
            const next = caps[cap][(index + 1) % ringSize];
            return sum + point[0] * next[1] - next[0] * point[1];
        }, 0);
        const normal = multiply(cross(frame.widthAxis, frame.normalAxis), Math.sign(area) * (cap === 0 ? 1 : -1));
        const offset = positions.length / 3;
        for (const position of rings[cap * LENGTH_SEGMENTS]) pushVertex(position, normal);
        indices.push(...capTriangles(caps[cap], offset, cap === 1));
    }
    return { name: ribbon.name, positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint16Array(indices), phase: ribbon.phase };
}

/** Deterministic CPU-only source shared by the OGL runtime and model export. */
export function createSculptureMeshData(): SculptureMeshData[] {
    const meshes = RIBBONS.map((ribbon) => {
        try { return buildRibbon(ribbon); }
        catch (error) { throw new Error(`Invalid sculpture fold: ${ribbon.name}`, { cause: error }); }
    });
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (const mesh of meshes) for (let i = 0; i < mesh.positions.length; i += 1) {
        min[i % 3] = Math.min(min[i % 3], mesh.positions[i]);
        max[i % 3] = Math.max(max[i % 3], mesh.positions[i]);
    }
    const scale = 2.1 / (max[0] - min[0]);
    const center = min.map((value, axis) => (value + max[axis]) / 2);
    for (const mesh of meshes) for (let i = 0; i < mesh.positions.length; i += 1) mesh.positions[i] = (mesh.positions[i] - center[i % 3]) * scale;
    return meshes;
}
