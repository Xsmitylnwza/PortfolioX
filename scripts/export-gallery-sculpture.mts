import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createSculptureMeshData, SCULPTURE_PLACEMENT } from '../src/components/GallerySculptureGeometry.ts';
import type { SculptureMeshData } from '../src/components/GallerySculptureGeometry.ts';

// node --import tsx scripts/export-gallery-sculpture.mts [--check] [--diagnostic-data]
// --check verifies the existing artifact without writing it. Diagnostic arrays
// and metrics stay in tmp; the public GLB contains only the authored sculpture.
const assetUrl = new URL('../public/assets/gallery/keep-going-bloom.glb', import.meta.url);
const studyUrl = new URL('../tmp/gallery-model-study/', import.meta.url);
const checkOnly = process.argv.includes('--check');
const diagnosticData = process.argv.includes('--diagnostic-data');
const meshes = createSculptureMeshData();

function bounds(positions: Float32Array) {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < positions.length; i += 1) {
        min[i % 3] = Math.min(min[i % 3], positions[i]);
        max[i % 3] = Math.max(max[i % 3], positions[i]);
    }
    return { min, max };
}

function inspectMesh(mesh: SculptureMeshData) {
    const { positions, normals, indices } = mesh;
    const vertices = positions.length / 3;
    assert.equal(positions.length % 3, 0);
    assert.equal(normals.length, positions.length);
    assert.equal(indices.length % 3, 0);
    assert(positions.every(Number.isFinite) && normals.every(Number.isFinite), `${mesh.name}: non-finite attributes`);
    const normalLengths: number[] = [];
    const vertexIds: number[] = [];
    const welded = new Map<string, number>();
    for (let i = 0; i < vertices; i += 1) {
        const length = Math.hypot(normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2]);
        assert(Math.abs(length - 1) < 0.0001, `${mesh.name}: non-unit normal at ${i}`);
        normalLengths.push(length);
        // End caps split the shading normal; positions must still close exactly.
        const key = `${positions[i * 3]},${positions[i * 3 + 1]},${positions[i * 3 + 2]}`;
        if (!welded.has(key)) welded.set(key, welded.size);
        vertexIds.push(welded.get(key)!);
    }
    const edges = new Map<string, { count: number; winding: number }>();
    const adjacency = Array.from({ length: welded.size }, () => new Set<number>());
    let signedVolume = 0;
    let minTriangleArea = Infinity;
    let minNormalAlignment = Infinity;
    for (let i = 0; i < indices.length; i += 3) {
        const triangle = [indices[i], indices[i + 1], indices[i + 2]];
        assert(triangle.every((index) => index < vertices), `${mesh.name}: out-of-range triangle`);
        const [a, b, c] = triangle.map((index) => Array.from(positions.subarray(index * 3, index * 3 + 3)));
        const ab = b.map((value, axis) => value - a[axis]);
        const ac = c.map((value, axis) => value - a[axis]);
        const face = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
        const area = Math.hypot(...face) / 2;
        assert(area > 1e-12, `${mesh.name}: degenerate triangle ${i / 3}`);
        minTriangleArea = Math.min(minTriangleArea, area);
        const smooth = [0, 1, 2].map((axis) => triangle.reduce((sum, index) => sum + normals[index * 3 + axis], 0) / 3);
        const alignment = face.reduce((sum, value, axis) => sum + value * smooth[axis], 0) / (area * 2);
        assert(alignment > 0, `${mesh.name}: normal opposes triangle ${i / 3}`);
        minNormalAlignment = Math.min(minNormalAlignment, alignment);
        signedVolume += (a[0] * (b[1] * c[2] - b[2] * c[1]) + a[1] * (b[2] * c[0] - b[0] * c[2]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6;
        for (let edge = 0; edge < 3; edge += 1) {
            const start = vertexIds[triangle[edge]];
            const end = vertexIds[triangle[(edge + 1) % 3]];
            assert.notEqual(start, end, `${mesh.name}: collapsed welded edge`);
            const key = `${Math.min(start, end)},${Math.max(start, end)}`;
            const value = edges.get(key) ?? { count: 0, winding: 0 };
            value.count += 1;
            value.winding += start < end ? 1 : -1;
            edges.set(key, value);
            adjacency[start].add(end);
            adjacency[end].add(start);
        }
    }
    for (const [edge, value] of edges) {
        assert.equal(value.count, 2, `${mesh.name}: boundary or non-manifold edge ${edge}`);
        assert.equal(value.winding, 0, `${mesh.name}: inconsistent edge winding ${edge}`);
    }
    const visited = new Set<number>();
    const queue = [0];
    while (queue.length) {
        const vertex = queue.pop()!;
        if (visited.has(vertex)) continue;
        visited.add(vertex);
        queue.push(...adjacency[vertex]);
    }
    assert.equal(visited.size, welded.size, `${mesh.name}: disconnected shell`);
    assert.equal(welded.size - edges.size + indices.length / 3, 2, `${mesh.name}: non-spherical shell topology`);
    assert(signedVolume > 0, `${mesh.name}: inward shell winding`);
    return {
        name: mesh.name, vertices, weldedVertices: welded.size, triangles: indices.length / 3,
        bytes: positions.byteLength + normals.byteLength + indices.byteLength,
        bounds: bounds(positions), normalLength: [Math.min(...normalLengths), Math.max(...normalLengths)],
        signedVolume, minTriangleArea, minNormalAlignment,
        boundaryOrNonManifoldEdges: 0, inconsistentWindingEdges: 0, connectedShells: 1, eulerCharacteristic: 2,
    };
}

const inspection = meshes.map(inspectMesh);
const triangles = inspection.reduce((sum, mesh) => sum + mesh.triangles, 0);
assert(triangles < 30000, 'Sculpture exceeded the reflection-continuity triangle budget.');
const allPositions = new Float32Array(meshes.reduce((sum, mesh) => sum + mesh.positions.length, 0));
let positionOffset = 0;
for (const mesh of meshes) { allPositions.set(mesh.positions, positionOffset); positionOffset += mesh.positions.length; }
const localBounds = bounds(allPositions);
assert(Math.abs(localBounds.max[0] - localBounds.min[0] - 2.1) < 0.000001);

interface BufferView { buffer: number; byteOffset: number; byteLength: number; target: number }
interface Accessor { bufferView: number; componentType: number; count: number; type: string; min?: number[]; max?: number[] }
interface GlbDocument {
    asset: { version: string; generator: string };
    scene: number;
    scenes: { nodes: number[] }[];
    nodes: { name: string; children?: number[]; mesh?: number; translation?: number[]; scale?: number[] }[];
    meshes: { name: string; primitives: { attributes: { POSITION: number; NORMAL: number }; indices: number; material: number; mode: number }[] }[];
    materials: { name: string; pbrMetallicRoughness: { baseColorFactor: number[]; metallicFactor: number; roughnessFactor: number }; doubleSided: boolean }[];
    buffers: { byteLength: number }[];
    bufferViews: BufferView[];
    accessors: Accessor[];
}

const bufferViews: BufferView[] = [];
const accessors: Accessor[] = [];
const chunks: Buffer[] = [];
let byteOffset = 0;
function attribute(data: Float32Array | Uint16Array, type: string, target: number, valueBounds?: ReturnType<typeof bounds>) {
    const padding = (4 - byteOffset % 4) % 4;
    if (padding) { chunks.push(Buffer.alloc(padding)); byteOffset += padding; }
    const bufferView = bufferViews.length;
    const bytes = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    bufferViews.push({ buffer: 0, byteOffset, byteLength: bytes.length, target });
    chunks.push(bytes);
    byteOffset += bytes.length;
    accessors.push({
        bufferView, componentType: data instanceof Uint16Array ? 5123 : 5126,
        count: data.length / (type === 'VEC3' ? 3 : 1), type,
        ...(valueBounds ? { min: valueBounds.min, max: valueBounds.max } : {}),
    });
    return accessors.length - 1;
}

const glbMeshes = meshes.map((mesh) => ({
    name: mesh.name,
    primitives: [{
        attributes: { POSITION: attribute(mesh.positions, 'VEC3', 34962, bounds(mesh.positions)), NORMAL: attribute(mesh.normals, 'VEC3', 34962) },
        indices: attribute(mesh.indices, 'SCALAR', 34963), material: 0, mode: 4,
    }],
}));
const document: GlbDocument = {
    asset: { version: '2.0', generator: 'PortfolioX procedural Keep Going geometry' },
    scene: 0, scenes: [{ nodes: [0] }],
    nodes: [
        { name: 'Keep Going layered chrome bloom', children: meshes.map((_, index) => index + 1), translation: [0, 0, SCULPTURE_PLACEMENT.z], scale: Array(3).fill(SCULPTURE_PLACEMENT.scale) },
        ...meshes.map((mesh, index) => ({ name: mesh.name, mesh: index })),
    ],
    meshes: glbMeshes,
    materials: [{ name: 'Mirror silver', pbrMetallicRoughness: { baseColorFactor: [0.91, 0.91, 0.91, 1], metallicFactor: 1, roughnessFactor: 0.14 }, doubleSided: false }],
    buffers: [{ byteLength: byteOffset }], bufferViews, accessors,
};
const json = Buffer.from(JSON.stringify(document), 'utf8');
const jsonPadded = Buffer.alloc(Math.ceil(json.length / 4) * 4, 0x20);
json.copy(jsonPadded);
const bin = Buffer.concat(chunks);
const binPadded = Buffer.alloc(Math.ceil(bin.length / 4) * 4);
bin.copy(binPadded);
const glb = Buffer.alloc(12 + 8 + jsonPadded.length + 8 + binPadded.length);
glb.writeUInt32LE(0x46546c67, 0);
glb.writeUInt32LE(2, 4);
glb.writeUInt32LE(glb.length, 8);
glb.writeUInt32LE(jsonPadded.length, 12);
glb.writeUInt32LE(0x4e4f534a, 16);
jsonPadded.copy(glb, 20);
const binHeader = 20 + jsonPadded.length;
glb.writeUInt32LE(binPadded.length, binHeader);
glb.writeUInt32LE(0x004e4942, binHeader + 4);
binPadded.copy(glb, binHeader + 8);

function validateArtifact(bytes: Buffer) {
    assert.equal(bytes.readUInt32LE(0), 0x46546c67);
    assert.equal(bytes.readUInt32LE(4), 2);
    assert.equal(bytes.readUInt32LE(8), bytes.length);
    const jsonLength = bytes.readUInt32LE(12);
    assert.equal(jsonLength % 4, 0);
    assert.equal(bytes.readUInt32LE(16), 0x4e4f534a);
    const parsed = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString('utf8')) as GlbDocument;
    assert.deepEqual(parsed, document);
    const header = 20 + jsonLength;
    assert.equal(bytes.readUInt32LE(header + 4), 0x004e4942);
    assert.equal(header + 8 + bytes.readUInt32LE(header), bytes.length);
    const binary = bytes.subarray(header + 8);
    assert.equal(parsed.buffers[0].byteLength, bin.length);
    assert(parsed.buffers[0].byteLength <= binary.length && binary.length - bin.length < 4);
    for (const view of parsed.bufferViews) {
        assert.equal(view.byteOffset % 4, 0);
        assert(view.byteOffset + view.byteLength <= parsed.buffers[0].byteLength);
    }
    for (let index = 0; index < meshes.length; index += 1) {
        const primitive = parsed.meshes[index].primitives[0];
        const expected = [meshes[index].positions, meshes[index].normals, meshes[index].indices];
        const attributes = [primitive.attributes.POSITION, primitive.attributes.NORMAL, primitive.indices];
        for (let attributeIndex = 0; attributeIndex < attributes.length; attributeIndex += 1) {
            const accessor = parsed.accessors[attributes[attributeIndex]];
            const data = expected[attributeIndex];
            assert.equal(accessor.count, data.length / (accessor.type === 'VEC3' ? 3 : 1));
            assert.equal(accessor.componentType, data instanceof Uint16Array ? 5123 : 5126);
            const view = parsed.bufferViews[accessor.bufferView];
            assert(binary.subarray(view.byteOffset, view.byteOffset + view.byteLength).equals(Buffer.from(data.buffer, data.byteOffset, data.byteLength)), 'GLB differs from runtime attribute bytes.');
        }
    }
    assert(bytes.equals(glb), 'GLB differs from deterministic runtime export.');
}

if (!checkOnly) {
    await mkdir(new URL('./', assetUrl), { recursive: true });
    await writeFile(assetUrl, glb);
}
validateArtifact(await readFile(assetUrl));
const summary = {
    meshCount: meshes.length, vertices: inspection.reduce((sum, mesh) => sum + mesh.vertices, 0), triangles,
    meshBytes: inspection.reduce((sum, mesh) => sum + mesh.bytes, 0), glbBytes: glb.length,
    localBounds, sceneScale: SCULPTURE_PLACEMENT.scale, sceneZ: SCULPTURE_PLACEMENT.z,
    glbValidation: 'GLB 2 structure, aligned buffers, PBR material, accessor bounds and counts, and exact runtime attribute byte equality passed; external Khronos validator not run.',
    meshes: inspection,
};
if (diagnosticData) {
    await mkdir(studyUrl, { recursive: true });
    await writeFile(new URL('geometry-metrics.json', studyUrl), `${JSON.stringify(summary, null, 2)}\n`);
    await writeFile(new URL('mesh-data.json', studyUrl), JSON.stringify(meshes.map((mesh) => ({ ...mesh, positions: Array.from(mesh.positions), normals: Array.from(mesh.normals), indices: Array.from(mesh.indices) }))));
}
console.log(JSON.stringify(summary, null, 2));
