import type { Mesh, Program, Transform } from 'ogl';

interface SculptureMesh extends Mesh {
    userData: {
        program: Program;
        phase: number;
        base: { x: number; y: number; z: number };
        basePosition?: { x: number; y: number; z: number };
    };
}

// The simulation never catches up hidden-tab time or a stalled frame.
export function getGalleryFrameDelta(previousMs: number | null, currentMs: number): number {
    if (previousMs === null || !Number.isFinite(previousMs) || !Number.isFinite(currentMs)) return 0;
    return Math.max(0, Math.min((currentMs - previousMs) / 1000, 0.05));
}

// Idle loop: a slow continuous whirl about the bloom's axis while a rigid wave
// rolls through the folds one after another. Every term is either monotonic
// rotation or periodic, so the motion never resets or jumps.
const WHIRL_SPEED = 0.14;
const FOLD_WAVE = 0.07;

export function animateGallerySculpture(
    sculpture: Transform,
    meshes: SculptureMesh[],
    elapsedSeconds: number,
    scrollSpin: number,
    opacity: number,
    reduceMotion = false,
): void {
    const t = reduceMotion ? elapsedSeconds * 0.25 : elapsedSeconds;
    // Whirl turns the spiral toward its own centre; the gentle y sway keeps the
    // depth between folds visible from the front.
    sculpture.rotation.z = 0.04 - t * WHIRL_SPEED;
    sculpture.rotation.y = -0.26 + Math.sin(t * 0.21) * 0.22 - scrollSpin * 0.18;
    sculpture.rotation.x = 0.22 + Math.sin(t * 0.13) * 0.06;

    meshes.forEach((mesh, index) => {
        const { program, base } = mesh.userData;
        // One wave passes through the five folds in turn, a fifth of a cycle apart.
        const wave = reduceMotion ? 0 : Math.sin(t * 0.7 - (index * Math.PI * 2) / meshes.length);
        mesh.rotation.x = base.x + wave * FOLD_WAVE * 0.4;
        mesh.rotation.y = base.y;
        mesh.rotation.z = base.z + wave * FOLD_WAVE;
        program.uniforms.uTime.value = t;
        program.uniforms.uOpacity.value = opacity;
        program.uniforms.uLayer.value = index;
    });
}
