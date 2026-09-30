import type { HTMLAttributes } from 'react';
import type { Mesh, Program, Texture } from 'ogl';
import type { AnimatedRasterResource } from './ScrollPerspectiveWaveAnimatedRaster';

export interface ScrollWaveProps extends HTMLAttributes<HTMLElement> {
    as?: keyof HTMLElementTagNameMap;
    surfaceColor?: string;
    surfaceOpacity?: number;
    intensity?: number;
    syncStage?: boolean;
}
export interface WaveResource extends AnimatedRasterResource {
    kind: 'media' | 'capture';
    element: HTMLElement;
    host: HTMLElement;
    hostBackground: string;
    hostBackgroundPriority: string;
    mesh: Mesh;
    program: Program;
    texture: Texture | null;
    loader: HTMLImageElement | null;
    listeners: Array<() => void>;
    captureTimer?: number;
    capturing?: boolean;
    lastCaptureKey?: string;
}

export interface MediaResource extends WaveResource {
    kind: 'media';
    element: HTMLImageElement | HTMLVideoElement;
}

export interface CaptureResource extends WaveResource {
    kind: 'capture';
    captureTimer: number;
    capturing: boolean;
    lastCaptureKey: string;
}
