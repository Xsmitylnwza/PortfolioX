import type { Mesh, Texture, Transform } from 'ogl';
import type { ProjectRecord } from '../data/projectTypes';

export interface GallerySceneProps {
    mode?: 'gallery' | 'stage';
    showContent?: boolean;
    contentExitMs?: number;
    active?: boolean;
}
export interface PosterTexture { texture: Texture; loaded: boolean; queued: boolean; pendingImage: HTMLCanvasElement | null; aspect: number }
export interface GalleryRow extends Transform { userData: { opacity: number; baseY?: number; compact?: boolean } }
export interface GalleryMesh extends Mesh {
    userData: {
        project: ProjectRecord;
        resource: PosterTexture;
        hover: number;
        reveal: number;
        exit: number;
        revealDelay: number;
        exitDelay: number;
        row: GalleryRow;
        phase: number;
    };
}
