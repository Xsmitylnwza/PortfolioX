import 'react';
import type Lenis from 'lenis';

declare global {
  interface Window {
    __lenis?: Lenis;
    __scrollPerspectiveWave?: { active: boolean; velocity: number };
  }
}

declare module 'react' {
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
